'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { AppSettings } from '@/types/index';

const DEFAULT_SETTINGS: AppSettings = {
  defaultPipelineId: '',
  defaultCurrency: 'KRW',
  darkMode: false,
};

/**
 * Retrieve application settings.
 * Falls back to DEFAULT_SETTINGS when nothing is stored.
 */
export function getSettings(): AppSettings {
  return storage.getObject<AppSettings>(STORAGE_KEYS.SETTINGS) ?? DEFAULT_SETTINGS;
}

/**
 * Persist application settings.
 */
export function saveSettings(settings: AppSettings): void {
  storage.saveObject(STORAGE_KEYS.SETTINGS, settings);
}

/**
 * Clear all app-managed localStorage keys.
 * The caller (component) is responsible for triggering window.location.reload().
 */
export function resetAllData(): void {
  storage.clearAll();
}
