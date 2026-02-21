'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import type { Stage } from '@/types/index';

interface StageListProps {
  stages: Stage[];
  onEdit: (stage: Stage) => void;
  onDelete: (stage: Stage) => void;
}

export default function StageList({
  stages,
  onEdit,
  onDelete,
}: StageListProps) {
  if (stages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        스테이지가 없습니다. 새 스테이지를 추가해주세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="flex items-center gap-3 rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

          <Badge
            variant="outline"
            className="shrink-0"
            style={{ backgroundColor: stage.color, color: '#fff', borderColor: stage.color }}
          >
            {stage.order}
          </Badge>

          <span className="font-medium text-sm flex-1 truncate">
            {stage.name}
          </span>

          <span className="text-xs text-muted-foreground shrink-0">
            {stage.probability}%
          </span>

          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: stage.color }}
            title={stage.color}
          />

          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onEdit(stage)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(stage)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
