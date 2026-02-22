'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationPanel from '@/components/common/NotificationPanel';
import { getUnreadCount } from '@/services/notification.service';

// Map of path segments to Korean page titles
const PAGE_TITLES: Record<string, string> = {
  dashboard: '대시보드',
  pipelines: '파이프라인 관리',
  kanban: '칸반 보드',
  deals: '딜 관리',
  contacts: '연락처',
  companies: '회사',
  leads: '리드',
  activities: '활동 관리',
  emails: '이메일',
  reports: '보고서',
  tags: '태그 관리',
  members: '멤버 관리',
  settings: '설정',
};

function getPageTitle(pathname: string): string {
  // Extract the first path segment after the leading slash
  const segment = pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
  return PAGE_TITLES[segment] ?? segment;
}

export default function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const [panelOpen, setPanelOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(() => {
    setUnread(getUnreadCount());
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!panelOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [panelOpen]);

  const handleBellClick = () => {
    refreshCount();
    setPanelOpen((prev) => !prev);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0">
      <h1 className="text-lg font-semibold">{pageTitle}</h1>

      <div className="flex items-center gap-2">
        {/* Notification bell + panel */}
        <div className="relative" ref={containerRef}>
          <Button
            variant="ghost"
            size="icon"
            aria-label="알림"
            onClick={handleBellClick}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Button>

          {panelOpen && (
            <NotificationPanel
              onCountChange={refreshCount}
            />
          )}
        </div>

        {/* Member avatar placeholder */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold cursor-pointer"
          aria-label="사용자 메뉴"
        >
          ME
        </div>
      </div>
    </header>
  );
}
