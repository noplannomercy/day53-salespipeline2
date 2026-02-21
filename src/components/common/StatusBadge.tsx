import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DealStatus, LeadStatus } from '@/types/index';

type StatusValue = DealStatus | LeadStatus;

interface StatusBadgeProps {
  status: StatusValue;
  /** 'deal' maps open/won/lost; 'lead' maps new/contacted/qualified/unqualified. */
  type: 'deal' | 'lead';
}

type BadgeConfig = { label: string; className: string };

const DEAL_STATUS_CONFIG: Record<DealStatus, BadgeConfig> = {
  open: {
    label: '진행 중',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  won: {
    label: '성사',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  lost: {
    label: '실패',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
};

const LEAD_STATUS_CONFIG: Record<LeadStatus, BadgeConfig> = {
  new: {
    label: '신규',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  contacted: {
    label: '접촉',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  qualified: {
    label: '검증됨',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  unqualified: {
    label: '미검증',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};

/**
 * Color-coded status badge for Deal and Lead entities.
 *
 * Deal:  open (blue) / won (green) / lost (red)
 * Lead:  new (purple) / contacted (yellow) / qualified (green) / unqualified (gray)
 */
export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const config =
    type === 'deal'
      ? DEAL_STATUS_CONFIG[status as DealStatus]
      : LEAD_STATUS_CONFIG[status as LeadStatus];

  if (!config) return null;

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium border-0', config.className)}
    >
      {config.label}
    </Badge>
  );
}
