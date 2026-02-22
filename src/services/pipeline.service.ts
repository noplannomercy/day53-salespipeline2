import { STORAGE_KEYS } from '@/types/index';
import type { Pipeline, Stage, Deal } from '@/types/index';
import * as storage from '@/lib/storage';

/**
 * Retrieve all pipelines, ordered by createdAt ascending.
 */
export function getPipelines(): Pipeline[] {
  return storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
}

/**
 * Retrieve a single pipeline by ID.
 */
export function getPipelineById(id: string): Pipeline | null {
  return storage.getById<Pipeline>(STORAGE_KEYS.PIPELINES, id);
}

/**
 * Create a new pipeline.
 * If isDefault is true, all other pipelines are set to isDefault = false.
 */
export function createPipeline(
  data: Omit<Pipeline, 'id' | 'createdAt' | 'updatedAt'>,
): Pipeline {
  if (data.isDefault) {
    clearDefaultFlag();
  }
  return storage.create<Pipeline>(STORAGE_KEYS.PIPELINES, data);
}

/**
 * Partially update an existing pipeline.
 * If isDefault is being set to true, clear the flag on all other pipelines first.
 */
export function updatePipeline(
  id: string,
  data: Partial<Omit<Pipeline, 'id' | 'createdAt'>>,
): Pipeline | null {
  if (data.isDefault === true) {
    clearDefaultFlag();
  }
  return storage.update<Pipeline>(STORAGE_KEYS.PIPELINES, id, data);
}

/**
 * Delete a pipeline and all associated stages.
 * Orphan deals are reassigned to the default pipeline's lowest-order stage
 * when possible; otherwise they are deleted.
 */
export function deletePipeline(id: string): void {
  // 1. Collect stage IDs that belong to the pipeline being deleted
  const allStages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);
  const deletedStageIds = new Set(
    allStages.filter((s) => s.pipelineId === id).map((s) => s.id),
  );

  // 2. Find orphan deals whose stageId falls within the deleted stages
  const allDeals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const orphanDeals = allDeals.filter((d) => deletedStageIds.has(d.stageId));

  if (orphanDeals.length > 0) {
    // 3. Find the default pipeline (excluding the one being deleted)
    const allPipelines = storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
    const defaultPipeline = allPipelines.find(
      (p) => p.isDefault && p.id !== id,
    );

    // 4. Determine the target stage (lowest order in the default pipeline)
    const defaultStages = defaultPipeline
      ? allStages
          .filter((s) => s.pipelineId === defaultPipeline.id)
          .sort((a, b) => a.order - b.order)
      : [];

    const orphanIds = new Set(orphanDeals.map((d) => d.id));

    if (defaultPipeline && defaultStages.length > 0) {
      // Reassign orphan deals to the default pipeline's first stage
      const targetStage = defaultStages[0];
      const updatedDeals = allDeals.map((d) =>
        orphanIds.has(d.id)
          ? { ...d, pipelineId: defaultPipeline.id, stageId: targetStage.id }
          : d,
      );
      storage.save(STORAGE_KEYS.DEALS, updatedDeals);
    } else {
      // No valid default pipeline / no stages — delete orphan deals
      const remainingDeals = allDeals.filter((d) => !orphanIds.has(d.id));
      storage.save(STORAGE_KEYS.DEALS, remainingDeals);
    }
  }

  // 5. Remove stages belonging to this pipeline
  const remainingStages = allStages.filter((s) => s.pipelineId !== id);
  storage.save(STORAGE_KEYS.STAGES, remainingStages);

  // 6. Remove the pipeline itself
  storage.remove(STORAGE_KEYS.PIPELINES, id);

  // 7. Ensure a default pipeline still exists
  const remaining = storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
  if (remaining.length > 0 && !remaining.some((p) => p.isDefault)) {
    const promoted = [
      { ...remaining[0], isDefault: true },
      ...remaining.slice(1),
    ];
    storage.save(STORAGE_KEYS.PIPELINES, promoted);
  }
}

/**
 * Internal: clear isDefault on all existing pipelines.
 */
function clearDefaultFlag(): void {
  const all = storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
  const updated = all.map((p) => ({ ...p, isDefault: false }));
  storage.save(STORAGE_KEYS.PIPELINES, updated);
}
