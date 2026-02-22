'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { Notification, Activity, Deal } from '@/types/index';

const KEY = STORAGE_KEYS.NOTIFICATIONS;

/**
 * Generate notifications from upcoming/overdue activities.
 * For each incomplete activity with a dueDate within today~tomorrow,
 * creates a Notification if one with the same entityId doesn't already exist.
 */
export function generateNotifications(): Notification[] {
  const activities = storage.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
  const existing = storage.getAll<Notification>(KEY);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowEnd = new Date(todayStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 2); // end of tomorrow

  const existingEntityIds = new Set(existing.map((n) => n.entityId));

  const dueActivities = activities.filter((a) => {
    if (a.isCompleted) return false;
    if (!a.dueDate) return false;
    if (existingEntityIds.has(a.id)) return false;
    const due = new Date(a.dueDate);
    return due >= todayStart && due < tomorrowEnd;
  });

  for (const activity of dueActivities) {
    const due = new Date(activity.dueDate!);
    const isOverdue = due < now;
    const label = isOverdue ? '마감 지남' : '마감 임박';

    storage.create<Notification>(KEY, {
      type: 'activity_due',
      title: `${label}: ${activity.title}`,
      body: `마감일: ${activity.dueDate!.slice(0, 10)}`,
      entityType: 'activity',
      entityId: activity.id,
      isRead: false,
    });
  }

  return storage.getAll<Notification>(KEY);
}

/**
 * Generate notifications for deals with approaching deadlines.
 * Creates "마감 임박" notifications for deals whose expectedCloseDate
 * is D-3 or D-1 from today. Skips deals that already have a notification
 * (matching entityType 'deal' + entityId).
 */
export function generateDealDeadlineNotifications(): Notification[] {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const existing = storage.getAll<Notification>(KEY);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Build set of deal IDs that already have a deadline notification
  const existingDealIds = new Set(
    existing
      .filter((n) => n.entityType === 'deal')
      .map((n) => n.entityId),
  );

  // D-1 and D-3 target dates
  const d1 = new Date(todayStart);
  d1.setDate(d1.getDate() + 1);
  const d3 = new Date(todayStart);
  d3.setDate(d3.getDate() + 3);

  const d1Str = d1.toISOString().slice(0, 10);
  const d3Str = d3.toISOString().slice(0, 10);

  const targetDeals = deals.filter((deal) => {
    if (deal.status !== 'open') return false;
    if (!deal.expectedCloseDate) return false;
    if (existingDealIds.has(deal.id)) return false;
    const closeDate = deal.expectedCloseDate.slice(0, 10);
    return closeDate === d1Str || closeDate === d3Str;
  });

  for (const deal of targetDeals) {
    const closeDate = deal.expectedCloseDate!.slice(0, 10);
    const daysLeft = closeDate === d1Str ? 1 : 3;

    storage.create<Notification>(KEY, {
      type: 'deal_status_changed',
      title: `마감 임박 (D-${daysLeft}): ${deal.title}`,
      body: `예상 마감일: ${closeDate}`,
      entityType: 'deal',
      entityId: deal.id,
      isRead: false,
    });
  }

  return storage.getAll<Notification>(KEY);
}

/**
 * Retrieve all notifications sorted by createdAt descending.
 */
export function getNotifications(): Notification[] {
  const items = storage.getAll<Notification>(KEY);
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Mark a single notification as read.
 */
export function markAsRead(id: string): void {
  storage.update<Notification>(KEY, id, { isRead: true } as Partial<Notification>);
}

/**
 * Mark all notifications as read.
 */
export function markAllAsRead(): void {
  const items = storage.getAll<Notification>(KEY);
  const updated = items.map((n) => ({ ...n, isRead: true }));
  storage.save(KEY, updated);
}

/**
 * Count unread notifications.
 */
export function getUnreadCount(): number {
  const items = storage.getAll<Notification>(KEY);
  return items.filter((n) => !n.isRead).length;
}

/**
 * Delete all notifications linked to a specific entity (cascade cleanup).
 */
export function deleteNotificationsByEntity(
  entityType: string,
  entityId: string,
): void {
  const items = storage.getAll<Notification>(KEY);
  const filtered = items.filter(
    (n) => !(n.entityType === entityType && n.entityId === entityId),
  );
  storage.save(KEY, filtered);
}
