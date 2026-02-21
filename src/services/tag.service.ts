'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { Tag, EntityTag, EntityType } from '@/types/index';

const TAG_KEY = STORAGE_KEYS.TAGS;
const ET_KEY = STORAGE_KEYS.ENTITY_TAGS;

/**
 * Retrieve all tags.
 */
export function getTags(): Tag[] {
  return storage.getAll<Tag>(TAG_KEY);
}

/**
 * Retrieve a single tag by ID.
 */
export function getTagById(id: string): Tag | null {
  return storage.getById<Tag>(TAG_KEY, id);
}

/**
 * Create a new tag. The id and createdAt fields are auto-generated.
 */
export function createTag(data: Omit<Tag, 'id' | 'createdAt'>): Tag {
  return storage.create<Tag>(TAG_KEY, data);
}

/**
 * Partially update an existing tag.
 * Returns the updated tag, or null if not found.
 */
export function updateTag(
  id: string,
  data: Partial<Omit<Tag, 'id' | 'createdAt'>>,
): Tag | null {
  return storage.update<Tag>(TAG_KEY, id, data);
}

/**
 * Delete a tag by ID.
 * Also removes all EntityTag records that reference this tag (cascade).
 */
export function deleteTag(id: string): void {
  // Cascade: remove all entity-tag associations for this tag
  const entityTags = storage.getAll<EntityTag>(ET_KEY);
  const remaining = entityTags.filter((et) => et.tagId !== id);
  if (remaining.length !== entityTags.length) {
    storage.save(ET_KEY, remaining);
  }

  storage.remove(TAG_KEY, id);
}

/**
 * Retrieve all tags associated with a given entity.
 * Joins EntityTag records with Tag records in memory.
 */
export function getEntityTags(entityType: EntityType, entityId: string): Tag[] {
  const entityTags = storage.getAll<EntityTag>(ET_KEY);
  const matchingTagIds = entityTags
    .filter((et) => et.entityType === entityType && et.entityId === entityId)
    .map((et) => et.tagId);

  if (matchingTagIds.length === 0) return [];

  const allTags = storage.getAll<Tag>(TAG_KEY);
  const tagIdSet = new Set(matchingTagIds);
  return allTags.filter((t) => tagIdSet.has(t.id));
}

/**
 * Add a tag to an entity. Returns the newly created EntityTag.
 * If the association already exists, returns the existing one without creating a duplicate.
 */
export function addTagToEntity(
  entityType: EntityType,
  entityId: string,
  tagId: string,
): EntityTag {
  const entityTags = storage.getAll<EntityTag>(ET_KEY);

  // Prevent duplicate associations
  const existing = entityTags.find(
    (et) =>
      et.entityType === entityType &&
      et.entityId === entityId &&
      et.tagId === tagId,
  );
  if (existing) return existing;

  return storage.create<EntityTag>(ET_KEY, { entityType, entityId, tagId });
}

/**
 * Remove a tag from an entity by filtering out the matching EntityTag record.
 */
export function removeTagFromEntity(
  entityType: EntityType,
  entityId: string,
  tagId: string,
): void {
  const entityTags = storage.getAll<EntityTag>(ET_KEY);
  const remaining = entityTags.filter(
    (et) =>
      !(
        et.entityType === entityType &&
        et.entityId === entityId &&
        et.tagId === tagId
      ),
  );
  if (remaining.length !== entityTags.length) {
    storage.save(ET_KEY, remaining);
  }
}

/**
 * Count the number of entities associated with each tag.
 * Returns a map of tagId -> count.
 */
export function getTagEntityCounts(): Record<string, number> {
  const entityTags = storage.getAll<EntityTag>(ET_KEY);
  const counts: Record<string, number> = {};
  for (const et of entityTags) {
    counts[et.tagId] = (counts[et.tagId] ?? 0) + 1;
  }
  return counts;
}
