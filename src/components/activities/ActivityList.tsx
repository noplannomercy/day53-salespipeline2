'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Phone,
  Mail,
  Users,
  CheckSquare,
  StickyNote,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Activity, ActivityType } from '@/types/index';
import { formatDate } from '@/lib/utils';
import * as activityService from '@/services/activity.service';

interface ActivityListProps {
  activities: Activity[];
  onToggle: (id: string) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

const TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
  note: <StickyNote className="h-4 w-4" />,
};

const TYPE_LABELS: Record<ActivityType, string> = {
  call: '전화',
  email: '이메일',
  meeting: '미팅',
  task: '작업',
  note: '노트',
};

/**
 * Determine the tab category for an activity based on its due date
 * and completion status.
 */
function getActivityTab(activity: Activity): string {
  if (activity.isCompleted) return 'completed';
  if (!activity.dueDate) return 'upcoming';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(activity.dueDate);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  if (dueDay.getTime() === today.getTime()) return 'today';

  // Calculate end of the current week (Sunday)
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

  if (dueDay > today && dueDay <= endOfWeek) return 'week';

  return 'upcoming';
}

function ActivityItem({
  activity,
  onToggle,
  onEdit,
  onDelete,
}: {
  activity: Activity;
  onToggle: (id: string) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue =
    !activity.isCompleted &&
    activity.dueDate &&
    new Date(activity.dueDate) < new Date();

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
      <input
        type="checkbox"
        checked={activity.isCompleted}
        onChange={() => onToggle(activity.id)}
        className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
      />

      <span className="text-muted-foreground">{TYPE_ICONS[activity.type]}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium text-sm truncate ${
              activity.isCompleted ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {activity.title}
          </span>
          <Badge variant="outline" className="text-xs shrink-0">
            {TYPE_LABELS[activity.type]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {activity.dueDate && (
            <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
              {formatDate(activity.dueDate)}
            </span>
          )}
          <span>{activityService.getActivityMemberName(activity.assignedTo)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onEdit(activity)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
          onClick={() => onDelete(activity.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function ActivityList({
  activities,
  onToggle,
  onEdit,
  onDelete,
}: ActivityListProps) {
  const grouped = {
    today: activities.filter((a) => getActivityTab(a) === 'today'),
    week: activities.filter((a) => getActivityTab(a) === 'week'),
    upcoming: activities.filter((a) => getActivityTab(a) === 'upcoming'),
    completed: activities.filter((a) => getActivityTab(a) === 'completed'),
  };

  // Sort non-completed by dueDate asc, completed by dueDate desc
  const sortByDueDate = (a: Activity, b: Activity) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  };

  grouped.today.sort(sortByDueDate);
  grouped.week.sort(sortByDueDate);
  grouped.upcoming.sort(sortByDueDate);
  grouped.completed.sort((a, b) => sortByDueDate(b, a));

  function renderList(items: Activity[]) {
    if (items.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-8 text-center">
          활동이 없습니다.
        </p>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {items.map((a) => (
          <ActivityItem
            key={a.id}
            activity={a}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="today">
      <TabsList>
        <TabsTrigger value="today">
          오늘 ({grouped.today.length})
        </TabsTrigger>
        <TabsTrigger value="week">
          이번 주 ({grouped.week.length})
        </TabsTrigger>
        <TabsTrigger value="upcoming">
          예정 ({grouped.upcoming.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          완료 ({grouped.completed.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="today">{renderList(grouped.today)}</TabsContent>
      <TabsContent value="week">{renderList(grouped.week)}</TabsContent>
      <TabsContent value="upcoming">{renderList(grouped.upcoming)}</TabsContent>
      <TabsContent value="completed">{renderList(grouped.completed)}</TabsContent>
    </Tabs>
  );
}
