import { STORAGE_KEYS } from '@/types/index';
import type { Pipeline } from '@/types/index';
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
 * Also removes deals that belong to this pipeline.
 */
export function deletePipeline(id: string): void {
  // Remove associated stages
  const stages = storage.getAll<{ id: string; pipelineId: string }>(
    STORAGE_KEYS.STAGES,
  );
  const remaining = stages.filter((s) => s.pipelineId !== id);
  storage.save(STORAGE_KEYS.STAGES, remaining);

  storage.remove(STORAGE_KEYS.PIPELINES, id);
}

/**
 * Internal: clear isDefault on all existing pipelines.
 */
function clearDefaultFlag(): void {
  const all = storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
  const updated = all.map((p) => ({ ...p, isDefault: false }));
  storage.save(STORAGE_KEYS.PIPELINES, updated);
}
