import { STORAGE_KEYS } from '@/types/index';
import type { Stage, Deal } from '@/types/index';
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
 * If the stage has deals, reassign them to the next stage in the same pipeline.
 * If there is no next stage, throw an error.
 */
export function deleteStage(id: string): void {
  const allDeals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const orphanDeals = allDeals.filter((d) => d.stageId === id);

  if (orphanDeals.length > 0) {
    const stage = storage.getById<Stage>(STORAGE_KEYS.STAGES, id);
    if (!stage) {
      throw new Error('스테이지를 찾을 수 없습니다.');
    }

    const allStages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);
    const nextStage = allStages
      .filter((s) => s.pipelineId === stage.pipelineId && s.order > stage.order)
      .sort((a, b) => a.order - b.order)[0];

    if (!nextStage) {
      throw new Error('이 스테이지에 딜이 있어 삭제할 수 없습니다. 먼저 딜을 다른 스테이지로 이동하세요.');
    }

    const orphanIds = new Set(orphanDeals.map((d) => d.id));
    const now = new Date().toISOString();
    const updatedDeals = allDeals.map((d) =>
      orphanIds.has(d.id) ? { ...d, stageId: nextStage.id, updatedAt: now } : d,
    );
    storage.save(STORAGE_KEYS.DEALS, updatedDeals);
  }

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
