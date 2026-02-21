'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { Note, NoteFilters } from '@/types/index';

const KEY = STORAGE_KEYS.NOTES;

/**
 * Retrieve all notes, optionally filtered by dealId, contactId, companyId, or createdBy.
 */
export function getNotes(filters?: NoteFilters): Note[] {
  let items = storage.getAll<Note>(KEY);

  if (filters?.dealId) {
    items = items.filter((n) => n.dealId === filters.dealId);
  }
  if (filters?.contactId) {
    items = items.filter((n) => n.contactId === filters.contactId);
  }
  if (filters?.companyId) {
    items = items.filter((n) => n.companyId === filters.companyId);
  }
  if (filters?.createdBy) {
    items = items.filter((n) => n.createdBy === filters.createdBy);
  }

  return items;
}

/**
 * Retrieve a single note by ID.
 */
export function getNoteById(id: string): Note | null {
  return storage.getById<Note>(KEY, id);
}

/**
 * Create a new note. The id, createdAt, updatedAt fields are auto-generated.
 */
export function createNote(
  data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>,
): Note {
  return storage.create<Note>(KEY, data);
}

/**
 * Partially update an existing note.
 * Returns the updated note, or null if not found.
 */
export function updateNote(
  id: string,
  data: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>,
): Note | null {
  return storage.update<Note>(KEY, id, data);
}

/**
 * Delete a note by ID.
 */
export function deleteNote(id: string): void {
  storage.remove(KEY, id);
}
