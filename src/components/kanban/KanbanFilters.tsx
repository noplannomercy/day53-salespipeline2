'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Member, DealPriority } from '@/types/index';

interface KanbanFiltersProps {
  members: Member[];
  selectedMemberId: string;
  onMemberChange: (memberId: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
}

const PRIORITY_OPTIONS: { value: DealPriority; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'urgent', label: '긴급' },
];

/**
 * Filter bar for the kanban board: filter by assigned member and priority.
 */
export default function KanbanFilters({
  members,
  selectedMemberId,
  onMemberChange,
  selectedPriority,
  onPriorityChange,
}: KanbanFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Member filter */}
      <Select value={selectedMemberId} onValueChange={onMemberChange}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="담당자 전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">담당자 전체</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority filter */}
      <Select value={selectedPriority} onValueChange={onPriorityChange}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="우선도 전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">우선도 전체</SelectItem>
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
