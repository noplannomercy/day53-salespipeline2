'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';

const SETTINGS_KEY = STORAGE_KEYS.SETTINGS;

/**
 * Export all CRM data as a JSON string.
 * Iterates over every STORAGE_KEYS entry and serialises its value.
 * sp_settings is stored as an object; all others are arrays.
 */
export function exportData(): string {
  const snapshot: Record<string, unknown> = {};

  for (const [, storageKey] of Object.entries(STORAGE_KEYS)) {
    if (storageKey === SETTINGS_KEY) {
      snapshot[storageKey] = storage.getObject<unknown>(storageKey);
    } else {
      snapshot[storageKey] = storage.getAll<unknown>(storageKey);
    }
  }

  return JSON.stringify(snapshot, null, 2);
}

/**
 * Import CRM data from a JSON string.
 * Parses the JSON, then writes each recognised key back to storage.
 * sp_settings uses saveObject; all others use save (array).
 * Throws an Error when the JSON is invalid or not an object.
 */
export function importData(json: string): void {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('JSON 파싱에 실패했습니다. 올바른 JSON 파일인지 확인하세요.');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('올바른 백업 데이터 형식이 아닙니다.');
  }

  const data = parsed as Record<string, unknown>;
  const validKeys = new Set(Object.values(STORAGE_KEYS));

  for (const [key, value] of Object.entries(data)) {
    if (!validKeys.has(key as typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS])) {
      continue; // skip unrecognised keys
    }

    if (key === SETTINGS_KEY) {
      storage.saveObject(key, value);
    } else {
      if (Array.isArray(value)) {
        storage.save(key, value);
      }
    }
  }
}
