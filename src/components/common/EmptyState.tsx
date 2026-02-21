import { type LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  /** Optional lucide-react icon to display above the message. Defaults to Inbox. */
  icon?: LucideIcon;
  message: string;
  /** Label for the call-to-action button. Omit to hide the button. */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Displayed when a list or table has zero rows.
 *
 * Two flavours:
 *   1. Empty data: icon + message + optional CTA ("첫 딜을 추가해보세요")
 *   2. No search results: "검색 결과 없음" + "필터 초기화" button
 */
export default function EmptyState({
  icon: Icon = Inbox,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <Icon className="h-12 w-12 opacity-30" strokeWidth={1.5} />
      <p className="text-sm">{message}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
