'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type {
  DealFilters as DealFiltersType,
  DealStatus,
  DealPriority,
  Pipeline,
  Stage,
  Member,
} from '@/types/index';

interface DealFiltersProps {
  filters: DealFiltersType;
  onFiltersChange: (filters: DealFiltersType) => void;
  pipelines: Pipeline[];
  stages: Stage[];
  members: Member[];
}

const STATUS_OPTIONS: { value: DealStatus; label: string }[] = [
  { value: 'open', label: '진행 중' },
  { value: 'won', label: '성사' },
  { value: 'lost', label: '실패' },
];

const PRIORITY_OPTIONS: { value: DealPriority; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'urgent', label: '긴급' },
];

export default function DealFilters({
  filters,
  onFiltersChange,
  pipelines,
  stages,
  members,
}: DealFiltersProps) {
  /** Filter stages by the currently selected pipeline */
  const filteredStages = filters.pipelineId
    ? stages
        .filter((s) => s.pipelineId === filters.pipelineId)
        .sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="딜 제목 검색"
          className="pl-9"
          value={filters.search ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              search: e.target.value || undefined,
            })
          }
        />
      </div>

      {/* Pipeline */}
      <Select
        value={filters.pipelineId ?? '__all__'}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            pipelineId: v === '__all__' ? undefined : v,
            stageId: undefined, // reset stage when pipeline changes
          })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="파이프라인 전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">파이프라인 전체</SelectItem>
          {pipelines.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Stage (only when a pipeline is selected) */}
      {filters.pipelineId && (
        <Select
          value={filters.stageId ?? '__all__'}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              stageId: v === '__all__' ? undefined : v,
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="스테이지 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">스테이지 전체</SelectItem>
            {filteredStages.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Status */}
      <Select
        value={filters.status ?? '__all__'}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            status: v === '__all__' ? undefined : (v as DealStatus),
          })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="상태 전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">상태 전체</SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Assigned To */}
      <Select
        value={filters.assignedTo ?? '__all__'}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            assignedTo: v === '__all__' ? undefined : v,
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="담당자 전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">담당자 전체</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select
        value={filters.priority ?? '__all__'}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            priority: v === '__all__' ? undefined : (v as DealPriority),
          })
        }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="우선도 전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">우선도 전체</SelectItem>
          {PRIORITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
