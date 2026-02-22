'use client';

// All localStorage access must go through this module.
// Direct localStorage calls elsewhere in the codebase are forbidden.
// Call chain: Component → Service (*.service.ts) → storage.ts → localStorage

// ─────────────────────────────────────────────
// Storage key constants
// ─────────────────────────────────────────────

export const STORAGE_KEYS = {
  pipelines:   'sp_pipelines',
  stages:      'sp_stages',
  companies:   'sp_companies',
  contacts:    'sp_contacts',
  leads:       'sp_leads',
  deals:       'sp_deals',
  activities:  'sp_activities',
  notes:       'sp_notes',
  tags:        'sp_tags',
  entityTags:  'sp_entity_tags',
  emails:      'sp_emails',
  attachments: 'sp_attachments',
  members:     'sp_members',
  reports:     'sp_reports',
  settings:    'sp_settings',
  dealHistory: 'sp_deal_history',
  notifications: 'sp_notifications',
  templates: 'sp_templates',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ─────────────────────────────────────────────
// CRUD helpers
// ─────────────────────────────────────────────

/**
 * Retrieve all items stored under the given key.
 * Returns an empty array if nothing is stored yet.
 */
export function getAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    console.error(`[storage] Failed to parse "${key}". Returning [].`);
    return [];
  }
}

/**
 * Retrieve a single item by its `id` field.
 * Returns null when the key has no data or no item matches.
 */
export function getById<T extends { id: string }>(
  key: string,
  id: string,
): T | null {
  const items = getAll<T>(key);
  return items.find((item) => item.id === id) ?? null;
}

/**
 * Overwrite the entire array stored under the given key.
 * Useful for bulk-replace operations such as reordering stages.
 */
export function save<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error(`[storage] Failed to save "${key}":`, err);
  }
}

/**
 * Append a new item to the array stored under the given key.
 *
 * Automatically injects:
 *   - `id`        — crypto.randomUUID()
 *   - `createdAt` — current ISO timestamp
 *   - `updatedAt` — same as createdAt (when the entity has the field)
 *
 * The caller passes all domain fields except id/createdAt/updatedAt.
 * Returns the fully-formed persisted item.
 */
export function create<
  T extends { id?: string; createdAt?: string; updatedAt?: string },
>(
  key: string,
  item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
): T {
  const now = new Date().toISOString();
  // Build the full record. updatedAt is included only if at least one of the
  // existing seed items on this key carries the field — we infer by checking
  // the first stored item. For safety, we always include it; entities that
  // don't use it simply ignore the extra field (TypeScript will strip it via
  // their typed service layer).
  const full = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  } as unknown as T;

  const items = getAll<T>(key);
  items.push(full);
  save(key, items);
  return full;
}

/**
 * Partially update an existing item identified by `id`.
 * Merges `partial` into the existing record and stamps `updatedAt` when the
 * entity carries that field.
 *
 * Returns the updated item, or null when the item is not found.
 */
export function update<T extends { id: string; updatedAt?: string }>(
  key: string,
  id: string,
  partial: Partial<T>,
): T | null {
  const items = getAll<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    console.warn(`[storage] update: item "${id}" not found in "${key}"`);
    return null;
  }

  const existing = items[index];
  const hasUpdatedAt = 'updatedAt' in existing;
  const updated: T = {
    ...existing,
    ...partial,
    id, // Prevent callers from accidentally changing the primary key
    ...(hasUpdatedAt ? { updatedAt: new Date().toISOString() } : {}),
  };

  items[index] = updated;
  save(key, items);
  return updated;
}

/**
 * Remove the item with the given `id` from storage.
 * No-ops silently when the item doesn't exist.
 */
export function remove(key: string, id: string): void {
  const items = getAll<{ id: string }>(key);
  save(key, items.filter((item) => item.id !== id));
}

/**
 * Populate the given key with `data` only when the key is currently empty.
 * Used on first app load to inject demo data without overwriting user data.
 */
export function seedIfEmpty<T>(key: string, data: T[]): void {
  if (getAll<T>(key).length === 0) {
    save(key, data);
  }
}

/**
 * Read a single JSON object stored under the given key.
 * Unlike getAll(), this is for keys that store a plain object (not an array),
 * such as sp_settings (AppSettings).
 *
 * Returns null when the key is absent or the stored value cannot be parsed.
 */
export function getObject<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    console.error(`[storage] Failed to parse object at "${key}". Returning null.`);
    return null;
  }
}

/**
 * Persist a single JSON object under the given key, replacing any previously
 * stored value. Use this for non-array storage such as sp_settings.
 */
export function saveObject<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[storage] Failed to saveObject at "${key}":`, err);
  }
}
