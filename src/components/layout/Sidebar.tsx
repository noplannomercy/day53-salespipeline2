'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitBranch,
  Trello,
  Briefcase,
  Users,
  Building2,
  UserPlus,
  CheckSquare,
  Mail,
  BarChart3,
  Tag,
  UserCog,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: '대시보드', href: '/dashboard' },
  { icon: GitBranch, label: '파이프라인', href: '/pipelines' },
  { icon: Trello, label: '칸반', href: '/kanban' },
  { icon: Briefcase, label: '딜 관리', href: '/deals' },
  { icon: Users, label: '연락처', href: '/contacts' },
  { icon: Building2, label: '회사', href: '/companies' },
  { icon: UserPlus, label: '리드', href: '/leads' },
  { icon: CheckSquare, label: '활동', href: '/activities' },
  { icon: Mail, label: '이메일', href: '/emails' },
  { icon: BarChart3, label: '보고서', href: '/reports' },
  { icon: Tag, label: '태그', href: '/tags' },
  { icon: UserCog, label: '멤버', href: '/members' },
  { icon: Settings, label: '설정', href: '/settings' },
];

// Separator positions — after these indices we insert a divider
const separatorAfter = new Set([3, 6, 9, 11]);

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar overflow-y-auto">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
          SP
        </div>
        <span className="text-lg font-semibold tracking-tight">SalesPipe</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
              {separatorAfter.has(index) && (
                <div className="my-1.5 mx-3 border-t border-border" />
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
