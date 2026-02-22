'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { EmailTemplate } from '@/types/index';

const KEY = STORAGE_KEYS.TEMPLATES;

/**
 * Retrieve all email templates sorted by createdAt descending.
 */
export function getTemplates(): EmailTemplate[] {
  const items = storage.getAll<EmailTemplate>(KEY);
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Create a new email template.
 */
export function createTemplate(
  data: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>,
): EmailTemplate {
  return storage.create<EmailTemplate>(KEY, data);
}

/**
 * Partially update an existing email template.
 * Returns the updated template, or null if not found.
 */
export function updateTemplate(
  id: string,
  data: Partial<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>,
): EmailTemplate | null {
  return storage.update<EmailTemplate>(KEY, id, data);
}

/**
 * Delete an email template by ID.
 */
export function deleteTemplate(id: string): void {
  storage.remove(KEY, id);
}
