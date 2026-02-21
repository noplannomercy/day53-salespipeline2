'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import DealCard from '@/components/kanban/DealCard';
import type { Deal, Stage, Member } from '@/types/index';

interface KanbanColumnProps {
  stage: Stage;
  deals: Deal[];
  /** Map of memberId -> Member for assigned member resolution */
  membersMap: Map<string, Member>;
  /** Map of companyId -> company name */
  companyNames: Map<string, string>;
  /** Called when a deal is dropped into this column */
  onDealDrop: (dealId: string, stageId: string) => void;
  /** Called when the "+ deal" button is clicked */
  onAddDeal: (stageId: string) => void;
}

/**
 * A single kanban column representing a pipeline stage.
 * Shows header with stage name, deal count, total value.
 * Handles drag-over and drop events via HTML5 DnD API.
 */
export default function KanbanColumn({
  stage,
  deals,
  membersMap,
  companyNames,
  onDealDrop,
  onAddDeal,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const mainCurrency = deals.length > 0 ? deals[0].currency : 'KRW';

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    // Only set false when leaving the column itself, not child elements
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const dealId = e.dataTransfer.getData('dealId');
    if (dealId) {
      onDealDrop(dealId, stage.id);
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col bg-muted/30 rounded-lg min-w-[280px] max-w-[320px] w-[300px] shrink-0 transition-all',
        isDragOver && 'ring-2 ring-blue-400 bg-blue-50/30 dark:bg-blue-950/20',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="text-sm font-semibold truncate">{stage.name}</h3>
          <span className="text-xs text-muted-foreground ml-auto shrink-0">
            {deals.length}건
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatCurrency(totalValue, mainCurrency)}
        </p>
      </div>

      {/* Cards area */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[100px]">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            companyName={companyNames.get(deal.companyId ?? '') ?? '-'}
            assignedMember={membersMap.get(deal.assignedTo) ?? null}
          />
        ))}
      </div>

      {/* Add deal button */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => onAddDeal(stage.id)}
        >
          <Plus className="mr-1 h-4 w-4" />
          딜 추가
        </Button>
      </div>
    </div>
  );
}
