'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { Notification, Activity } from '@/types/index';

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
