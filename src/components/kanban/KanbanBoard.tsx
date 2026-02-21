'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import type { Deal, Stage, Member } from '@/types/index';

interface KanbanBoardProps {
  stages: Stage[];
  deals: Deal[];
  membersMap: Map<string, Member>;
  companyNames: Map<string, string>;
  onDealDrop: (dealId: string, stageId: string) => void;
  onAddDeal: (stageId: string) => void;
}

/**
 * Kanban board container with horizontal scroll.
 * Renders one KanbanColumn per pipeline stage, passing deals
 * filtered to each stage.
 */
export default function KanbanBoard({
  stages,
  deals,
  membersMap,
  companyNames,
  onDealDrop,
  onAddDeal,
}: KanbanBoardProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stageId === stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={stageDeals}
              membersMap={membersMap}
              companyNames={companyNames}
              onDealDrop={onDealDrop}
              onAddDeal={onAddDeal}
            />
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
