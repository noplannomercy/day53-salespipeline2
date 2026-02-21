'use client';

import { cn } from '@/lib/utils';
import type { Stage } from '@/types/index';

interface StageProgressProps {
  /** All stages for the pipeline, sorted by order ascending */
  stages: Stage[];
  /** The currently active stage ID */
  currentStageId: string;
  /** Called when a stage step is clicked */
  onStageClick: (stageId: string) => void;
  /** Disable interaction (e.g. when deal is won/lost) */
  disabled?: boolean;
}

/**
 * Horizontal progress bar showing all stages for a pipeline.
 * The current stage is highlighted; clicking a stage invokes moveDealToStage.
 */
export default function StageProgress({
  stages,
  currentStageId,
  onStageClick,
  disabled = false,
}: StageProgressProps) {
  const currentIndex = stages.findIndex((s) => s.id === currentStageId);

  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto py-2">
      {stages.map((stage, index) => {
        const isActive = stage.id === currentStageId;
        const isPast = index < currentIndex;

        return (
          <div
            key={stage.id}
            className="flex items-center flex-1 min-w-0"
          >
            {/* Stage step */}
            <button
              type="button"
              onClick={() => !disabled && onStageClick(stage.id)}
              disabled={disabled}
              className={cn(
                'flex flex-col items-center gap-1 w-full group',
                disabled ? 'cursor-default' : 'cursor-pointer',
              )}
              title={`${stage.name} (${stage.probability}%)`}
            >
              {/* Dot + connector line */}
              <div className="flex items-center w-full">
                {/* Left connector */}
                {index > 0 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isPast || isActive
                        ? 'bg-primary'
                        : 'bg-muted-foreground/20',
                    )}
                  />
                )}
                {/* Dot */}
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 shrink-0 transition-all',
                    isActive
                      ? 'border-primary bg-primary scale-125'
                      : isPast
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30 bg-background',
                    !disabled && 'group-hover:border-primary/70',
                  )}
                  style={
                    isActive || isPast
                      ? { borderColor: stage.color, backgroundColor: stage.color }
                      : undefined
                  }
                />
                {/* Right connector */}
                {index < stages.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isPast
                        ? 'bg-primary'
                        : 'bg-muted-foreground/20',
                    )}
                  />
                )}
              </div>
              {/* Label */}
              <span
                className={cn(
                  'text-[11px] leading-tight text-center truncate max-w-full px-0.5',
                  isActive
                    ? 'font-semibold text-foreground'
                    : isPast
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60',
                )}
              >
                {stage.name}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
