'use client';

import { useRouter } from 'next/navigation';
import { GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import PriorityBadge from '@/components/common/PriorityBadge';
import StatusBadge from '@/components/common/StatusBadge';
import MemberAvatar from '@/components/common/MemberAvatar';
import type { Deal, Member, Company } from '@/types/index';
import { formatCurrency } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
  companyName: string;
  assignedMember: Member | null;
}

/**
 * Draggable deal card displayed in kanban columns.
 * Shows title, value, company name, assigned member avatar,
 * priority badge, and status badge. Uses HTML5 Drag and Drop API.
 */
export default function DealCard({
  deal,
  companyName,
  assignedMember,
}: DealCardProps) {
  const router = useRouter();

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('dealId', deal.id);
    e.dataTransfer.effectAllowed = 'move';
    // Visual feedback: reduce opacity on the source card
    const target = e.currentTarget;
    requestAnimationFrame(() => {
      target.classList.add('opacity-50');
    });
  }

  function handleDragEnd(e: React.DragEvent<HTMLDivElement>) {
    e.currentTarget.classList.remove('opacity-50');
  }

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="cursor-grab active:cursor-grabbing p-3 hover:shadow-md transition-shadow"
    >
      {/* Drag handle + title row */}
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground/50 shrink-0" />
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate cursor-pointer hover:text-primary"
            onClick={() => router.push(`/deals/${deal.id}`)}
          >
            {deal.title}
          </p>
          {companyName && companyName !== '-' && (
            <p className="text-xs text-muted-foreground truncate">
              {companyName}
            </p>
          )}
        </div>
      </div>

      {/* Value + badges row */}
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-sm font-semibold">
          {formatCurrency(deal.value, deal.currency)}
        </span>
        <div className="flex items-center gap-1">
          <PriorityBadge priority={deal.priority} />
          {deal.status !== 'open' && (
            <StatusBadge status={deal.status} type="deal" />
          )}
        </div>
      </div>

      {/* Assigned member */}
      {assignedMember && (
        <div className="flex items-center gap-1.5 mt-2">
          <MemberAvatar member={assignedMember} size="sm" />
          <span className="text-xs text-muted-foreground truncate">
            {assignedMember.name}
          </span>
        </div>
      )}
    </Card>
  );
}
