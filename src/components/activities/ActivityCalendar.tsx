'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Activity, ActivityType } from '@/types/index';
import * as activityService from '@/services/activity.service';

interface ActivityCalendarProps {
  activities: Activity[];
}

const TYPE_COLORS: Record<ActivityType, string> = {
  call: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  email: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  meeting: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  task: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  note: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

const TYPE_LABELS: Record<ActivityType, string> = {
  call: '전화',
  email: '이메일',
  meeting: '미팅',
  task: '작업',
  note: '노트',
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * Build a matrix of weeks for the given month.
 * Each week is an array of 7 Date objects (some may be from prev/next months).
 */
function getCalendarDays(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const startDate = new Date(year, month, 1 - startOffset);

  const weeks: Date[][] = [];
  const cursor = new Date(startDate);

  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);

    // Stop early if we've passed the last day of the month
    if (cursor.getMonth() !== month && cursor.getDate() > 7) break;
  }

  return weeks;
}

/**
 * Format a Date to YYYY-MM-DD string for grouping purposes.
 */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function ActivityCalendar({ activities }: ActivityCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group activities by date key (YYYY-MM-DD portion of dueDate)
  const activityMap = new Map<string, Activity[]>();
  for (const a of activities) {
    if (!a.dueDate) continue;
    const key = a.dueDate.split('T')[0];
    const existing = activityMap.get(key) ?? [];
    existing.push(a);
    activityMap.set(key, existing);
  }

  const weeks = getCalendarDays(year, month);
  const todayKey = toDateKey(today);

  function goToPrevMonth() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  }

  const selectedActivities = selectedDate ? (activityMap.get(selectedDate) ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goToPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {year}년 {month + 1}월
        </h3>
        <Button variant="ghost" size="sm" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 bg-muted">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-t">
            {week.map((date, di) => {
              const dateKey = toDateKey(date);
              const isCurrentMonth = date.getMonth() === month;
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              const dayActivities = activityMap.get(dateKey) ?? [];

              return (
                <button
                  key={di}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  className={`
                    relative min-h-[80px] p-1 text-left border-r last:border-r-0
                    transition-colors hover:bg-muted/50 cursor-pointer
                    ${!isCurrentMonth ? 'bg-muted/20' : ''}
                    ${isSelected ? 'ring-2 ring-primary ring-inset' : ''}
                  `}
                >
                  <span
                    className={`
                      inline-flex h-6 w-6 items-center justify-center rounded-full text-xs
                      ${isToday ? 'bg-primary text-primary-foreground font-bold' : ''}
                      ${!isCurrentMonth ? 'text-muted-foreground/50' : 'text-foreground'}
                    `}
                  >
                    {date.getDate()}
                  </span>

                  {/* Activity dots / badges */}
                  {dayActivities.length > 0 && (
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {dayActivities.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className={`
                            text-[10px] leading-tight px-1 rounded truncate
                            ${a.isCompleted ? 'line-through opacity-50' : ''}
                            ${TYPE_COLORS[a.type]}
                          `}
                        >
                          {a.title}
                        </div>
                      ))}
                      {dayActivities.length > 3 && (
                        <span className="text-[10px] text-muted-foreground px-1">
                          +{dayActivities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Selected date detail */}
      {selectedDate && (
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-3">
            {selectedDate} 활동 ({selectedActivities.length})
          </h4>
          {selectedActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">이 날짜에 활동이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedActivities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 text-sm p-2 rounded border"
                >
                  <Badge variant="outline" className={`text-xs ${TYPE_COLORS[a.type]}`}>
                    {TYPE_LABELS[a.type]}
                  </Badge>
                  <span className={a.isCompleted ? 'line-through text-muted-foreground' : ''}>
                    {a.title}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {activityService.getActivityMemberName(a.assignedTo)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
