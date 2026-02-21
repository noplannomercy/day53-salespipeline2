'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { Email, EmailFilters, Contact } from '@/types/index';

const KEY = STORAGE_KEYS.EMAILS;

/**
 * Retrieve all emails, optionally filtered by dealId, contactId, or status.
 */
export function getEmails(filters?: EmailFilters): Email[] {
  let items = storage.getAll<Email>(KEY);

  if (filters?.dealId) {
    items = items.filter((e) => e.dealId === filters.dealId);
  }
  if (filters?.contactId) {
    items = items.filter((e) => e.contactId === filters.contactId);
  }
  if (filters?.status) {
    items = items.filter((e) => e.status === filters.status);
  }

  return items;
}

/**
 * Retrieve a single email by ID.
 */
export function getEmailById(id: string): Email | null {
  return storage.getById<Email>(KEY, id);
}

/**
 * Create a new email. The id and createdAt fields are auto-generated.
 */
export function createEmail(
  data: Omit<Email, 'id' | 'createdAt'>,
): Email {
  return storage.create<Email>(KEY, data);
}

/**
 * Partially update an existing email.
 * Returns the updated email, or null if not found.
 */
export function updateEmail(
  id: string,
  data: Partial<Omit<Email, 'id' | 'createdAt'>>,
): Email | null {
  return storage.update<Email>(KEY, id, data);
}

/**
 * Send a draft or scheduled email by setting status to 'sent' and stamping sentAt.
 * Returns the updated email, or throws if the email is not found.
 */
export function sendEmail(id: string): Email {
  const email = storage.getById<Email>(KEY, id);
  if (!email) {
    throw new Error(`Email "${id}" not found`);
  }

  const updated = storage.update<Email>(KEY, id, {
    status: 'sent',
    sentAt: new Date().toISOString(),
  } as Partial<Email>);

  if (!updated) {
    throw new Error(`Failed to send email "${id}"`);
  }

  return updated;
}

/**
 * Delete an email by ID.
 */
export function deleteEmail(id: string): void {
  storage.remove(KEY, id);
}

/**
 * Get the contact name for an email (used in table display).
 */
export function getEmailContactName(contactId: string): string {
  const contact = storage.getById<Contact>(STORAGE_KEYS.CONTACTS, contactId);
  return contact?.name ?? '-';
}
