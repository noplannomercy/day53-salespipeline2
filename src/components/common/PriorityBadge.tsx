import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DealPriority } from '@/types/index';

interface PriorityBadgeProps {
  priority: DealPriority;
}

const PRIORITY_CONFIG: Record<
  DealPriority,
  { label: string; className: string }
> = {
  low: {
    label: '낮음',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  medium: {
    label: '보통',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  high: {
    label: '높음',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  urgent: {
    label: '긴급',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  },
};

/**
 * Displays a color-coded badge for deal priority levels:
 * - low     → gray
 * - medium  → blue
 * - high    → orange
 * - urgent  → red
 */
export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium border-0', config.className)}
    >
      {config.label}
    </Badge>
  );
}
