'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { Member, MemberFilters, Deal, Activity, Lead } from '@/types/index';

const KEY = STORAGE_KEYS.MEMBERS;

/**
 * Retrieve all members, optionally filtered by role and search term.
 */
export function getMembers(filters?: MemberFilters): Member[] {
  let items = storage.getAll<Member>(KEY);

  if (filters?.role) {
    items = items.filter((m) => m.role === filters.role);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }

  return items;
}

/**
 * Retrieve a single member by ID. Returns null when not found.
 */
export function getMemberById(id: string): Member | null {
  return storage.getById<Member>(KEY, id);
}

/**
 * Create a new member. The id and createdAt fields are auto-generated.
 */
export function createMember(
  data: Omit<Member, 'id' | 'createdAt'>,
): Member {
  return storage.create<Member>(KEY, data);
}

/**
 * Partially update an existing member.
 * Returns the updated member, or null if not found.
 */
export function updateMember(
  id: string,
  data: Partial<Omit<Member, 'id' | 'createdAt'>>,
): Member | null {
  return storage.update<Member>(KEY, id, data);
}

/**
 * Delete a member by ID.
 * Nullifies assignedTo on all deals, leads, and activities that reference this member
 * so that no orphaned FK references remain.
 */
export function deleteMember(id: string): void {
  // Nullify assignedTo on deals assigned to this member
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  let dealsChanged = false;
  const updatedDeals = deals.map((d) => {
    if (d.assignedTo === id) {
      dealsChanged = true;
      return { ...d, assignedTo: '' };
    }
    return d;
  });
  if (dealsChanged) {
    storage.save(STORAGE_KEYS.DEALS, updatedDeals);
  }

  // Nullify assignedTo on activities assigned to this member
  const activities = storage.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
  let activitiesChanged = false;
  const updatedActivities = activities.map((a) => {
    if (a.assignedTo === id) {
      activitiesChanged = true;
      return { ...a, assignedTo: '' };
    }
    return a;
  });
  if (activitiesChanged) {
    storage.save(STORAGE_KEYS.ACTIVITIES, updatedActivities);
  }

  // Nullify assignedTo on leads assigned to this member
  const leads = storage.getAll<Lead>(STORAGE_KEYS.LEADS);
  let leadsChanged = false;
  const updatedLeads = leads.map((l) => {
    if (l.assignedTo === id) {
      leadsChanged = true;
      return { ...l, assignedTo: '' };
    }
    return l;
  });
  if (leadsChanged) {
    storage.save(STORAGE_KEYS.LEADS, updatedLeads);
  }

  storage.remove(KEY, id);
}

/**
 * Count the number of deals assigned to a given member.
 */
export function getMemberDealCount(memberId: string): number {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  return deals.filter((d) => d.assignedTo === memberId).length;
}

/**
 * Count the number of activities assigned to a given member.
 */
export function getMemberActivityCount(memberId: string): number {
  const activities = storage.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
  return activities.filter((a) => a.assignedTo === memberId).length;
}
