'use client';

import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Notification } from '@/types/index';
import {
  markAsRead,
  markAllAsRead,
} from '@/services/notification.service';
import { formatDateTime } from '@/lib/utils';

interface NotificationPanelProps {
  notifications: Notification[];
  onCountChange: () => void;
}

export default function NotificationPanel({
  notifications,
  onCountChange,
}: NotificationPanelProps) {

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    onCountChange();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    onCountChange();
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-md border bg-background shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold">알림</h3>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleMarkAllAsRead}
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" />
            모두 읽음
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="max-h-80">
        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            새 알림이 없습니다
          </p>
        ) : (
          <ul className="divide-y">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex cursor-pointer flex-col gap-0.5 px-4 py-3 hover:bg-muted/50 ${
                  n.isRead ? 'opacity-60' : ''
                }`}
                onClick={() => {
                  if (!n.isRead) handleMarkAsRead(n.id);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-tight">
                    {!n.isRead && (
                      <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    {n.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{n.body}</span>
                <span className="text-[11px] text-muted-foreground/70">
                  {formatDateTime(n.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
