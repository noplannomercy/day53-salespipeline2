'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type {
  Activity,
  ActivityFilters,
  Member,
  Deal,
  Contact,
} from '@/types/index';

const KEY = STORAGE_KEYS.ACTIVITIES;

/**
 * Retrieve all activities, optionally filtered by deal, contact, type,
 * assignedTo, completion status, and due date range.
 */
export function getActivities(filters?: ActivityFilters): Activity[] {
  let items = storage.getAll<Activity>(KEY);

  if (filters?.dealId) {
    items = items.filter((a) => a.dealId === filters.dealId);
  }
  if (filters?.contactId) {
    items = items.filter((a) => a.contactId === filters.contactId);
  }
  if (filters?.type) {
    items = items.filter((a) => a.type === filters.type);
  }
  if (filters?.assignedTo) {
    items = items.filter((a) => a.assignedTo === filters.assignedTo);
  }
  if (filters?.isCompleted !== undefined) {
    items = items.filter((a) => a.isCompleted === filters.isCompleted);
  }
  if (filters?.dueDateFrom) {
    items = items.filter(
      (a) => a.dueDate !== null && a.dueDate >= filters.dueDateFrom!,
    );
  }
  if (filters?.dueDateTo) {
    items = items.filter(
      (a) => a.dueDate !== null && a.dueDate <= filters.dueDateTo!,
    );
  }

  return items;
}

/**
 * Retrieve a single activity by ID. Returns null when not found.
 */
export function getActivityById(id: string): Activity | null {
  return storage.getById<Activity>(KEY, id);
}

/**
 * Create a new activity. The id and createdAt fields are auto-generated.
 */
export function createActivity(
  data: Omit<Activity, 'id' | 'createdAt'>,
): Activity {
  return storage.create<Activity>(KEY, data);
}

/**
 * Partially update an existing activity.
 * Returns the updated activity, or null if not found.
 */
export function updateActivity(
  id: string,
  data: Partial<Omit<Activity, 'id' | 'createdAt'>>,
): Activity | null {
  return storage.update<Activity>(KEY, id, data);
}

/**
 * Delete an activity by ID.
 */
export function deleteActivity(id: string): void {
  storage.remove(KEY, id);
}

/**
 * Toggle the isCompleted status of an activity.
 * Returns the updated activity, or throws if not found.
 */
export function toggleActivityComplete(id: string): Activity {
  const activity = storage.getById<Activity>(KEY, id);
  if (!activity) {
    throw new Error(`Activity "${id}" not found`);
  }

  const updated = storage.update<Activity>(KEY, id, {
    isCompleted: !activity.isCompleted,
  } as Partial<Activity>);

  if (!updated) {
    throw new Error(`Failed to toggle activity "${id}"`);
  }

  return updated;
}

/**
 * Get the assigned member name for an activity (used in display).
 */
export function getActivityMemberName(assignedTo: string): string {
  if (!assignedTo) return '-';
  const member = storage.getById<Member>(STORAGE_KEYS.MEMBERS, assignedTo);
  return member?.name ?? '-';
}

/**
 * Get the deal title for an activity (used in display).
 */
export function getActivityDealTitle(dealId: string | null): string {
  if (!dealId) return '-';
  const deal = storage.getById<Deal>(STORAGE_KEYS.DEALS, dealId);
  return deal?.title ?? '-';
}

/**
 * Get the contact name for an activity (used in display).
 */
export function getActivityContactName(contactId: string | null): string {
  if (!contactId) return '-';
  const contact = storage.getById<Contact>(STORAGE_KEYS.CONTACTS, contactId);
  return contact?.name ?? '-';
}
