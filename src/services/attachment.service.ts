'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { Attachment, EntityType } from '@/types/index';

const KEY = STORAGE_KEYS.ATTACHMENTS;

/**
 * Retrieve all attachments, optionally filtered by entityType and entityId.
 */
export function getAttachments(
  filters?: { entityType?: EntityType; entityId?: string },
): Attachment[] {
  let items = storage.getAll<Attachment>(KEY);

  if (filters?.entityType) {
    items = items.filter((a) => a.entityType === filters.entityType);
  }
  if (filters?.entityId) {
    items = items.filter((a) => a.entityId === filters.entityId);
  }

  return items;
}

/**
 * Create a new attachment metadata record. The id and createdAt are auto-generated.
 */
export function createAttachment(
  data: Omit<Attachment, 'id' | 'createdAt'>,
): Attachment {
  return storage.create<Attachment>(KEY, data);
}

/**
 * Delete an attachment metadata record by ID.
 */
export function deleteAttachment(id: string): void {
  storage.remove(KEY, id);
}
