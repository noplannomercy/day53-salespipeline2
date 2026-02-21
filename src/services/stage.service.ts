import { STORAGE_KEYS } from '@/types/index';
import type { Stage } from '@/types/index';
import * as storage from '@/lib/storage';

/**
 * Retrieve all stages for a given pipeline, sorted by order ascending.
 */
export function getStages(pipelineId: string): Stage[] {
  const all = storage.getAll<Stage>(STORAGE_KEYS.STAGES);
  return all
    .filter((s) => s.pipelineId === pipelineId)
    .sort((a, b) => a.order - b.order);
}

/**
 * Retrieve a single stage by ID.
 */
export function getStageById(id: string): Stage | null {
  return storage.getById<Stage>(STORAGE_KEYS.STAGES, id);
}

/**
 * Create a new stage. If order is not specified, it is placed at the end.
 */
export function createStage(
  data: Omit<Stage, 'id' | 'createdAt'>,
): Stage {
  const existing = getStages(data.pipelineId);
  const order = data.order ?? (existing.length > 0 ? existing[existing.length - 1].order + 1 : 1);
  return storage.create<Stage>(STORAGE_KEYS.STAGES, { ...data, order });
}

/**
 * Partially update an existing stage.
 */
export function updateStage(
  id: string,
  data: Partial<Omit<Stage, 'id' | 'createdAt'>>,
): Stage | null {
  return storage.update<Stage>(STORAGE_KEYS.STAGES, id, data);
}

/**
 * Delete a stage by ID.
 */
export function deleteStage(id: string): void {
  storage.remove(STORAGE_KEYS.STAGES, id);
}

/**
 * Reorder stages within a pipeline.
 * Accepts an array of stage IDs in the desired order and updates
 * each stage's order field accordingly (1-based).
 */
export function reorderStages(pipelineId: string, stageIds: string[]): void {
  const all = storage.getAll<Stage>(STORAGE_KEYS.STAGES);
  const updated = all.map((stage) => {
    if (stage.pipelineId !== pipelineId) return stage;
    const newOrder = stageIds.indexOf(stage.id);
    if (newOrder === -1) return stage;
    return { ...stage, order: newOrder + 1 };
  });
  storage.save(STORAGE_KEYS.STAGES, updated);
}
