'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { DealHistory, DealHistoryField, Member } from '@/types/index';

const KEY = STORAGE_KEYS.DEAL_HISTORY;

/**
 * Record a field change on a deal.
 * changedBy is resolved as the first available member (no login system).
 */
export function addHistory(
  dealId: string,
  field: DealHistoryField,
  oldValue: string,
  newValue: string,
  changedBy: string,
): DealHistory {
  return storage.create<DealHistory>(KEY, {
    dealId,
    field,
    oldValue,
    newValue,
    changedBy,
  } as Omit<DealHistory, 'id' | 'createdAt'>);
}

/**
 * Retrieve all history entries for a specific deal, sorted by createdAt descending.
 */
export function getDealHistory(dealId: string): DealHistory[] {
  const all = storage.getAll<DealHistory>(KEY);
  return all
    .filter((h) => h.dealId === dealId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Delete all history entries for a deal (cascade cleanup on deal deletion).
 */
export function deleteDealHistory(dealId: string): void {
  const all = storage.getAll<DealHistory>(KEY);
  const remaining = all.filter((h) => h.dealId !== dealId);
  if (remaining.length !== all.length) {
    storage.save(KEY, remaining);
  }
}

/**
 * Get the first member ID as a fallback changedBy value (no login system).
 */
export function getDefaultChangedBy(): string {
  const members = storage.getAll<Member>(STORAGE_KEYS.MEMBERS);
  return members[0]?.id ?? '';
}
