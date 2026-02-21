'use client';

import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import type { Lead, ColumnDef } from '@/types/index';
import { formatDate } from '@/lib/utils';
import * as leadService from '@/services/lead.service';

interface LeadTableProps {
  data: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  web: '웹',
  referral: '추천',
  ad: '광고',
  event: '이벤트',
  other: '기타',
};

const columns: ColumnDef<Lead>[] = [
  {
    key: 'name',
    header: '이름',
    sortable: true,
    cell: (row) => (
      <span className="font-medium">
        {leadService.getLeadContactName(row.contactId)}
      </span>
    ),
  },
  {
    key: 'source',
    header: '소스',
    sortable: true,
    cell: (row) => SOURCE_LABELS[row.source] ?? row.source,
  },
  {
    key: 'status',
    header: '상태',
    sortable: true,
    cell: (row) => <StatusBadge status={row.status} type="lead" />,
  },
  {
    key: 'score',
    header: '점수',
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              row.score >= 70
                ? 'bg-green-500'
                : row.score >= 40
                  ? 'bg-yellow-500'
                  : 'bg-red-400'
            }`}
            style={{ width: `${row.score}%` }}
          />
        </div>
        <span className="text-xs tabular-nums">{row.score}</span>
      </div>
    ),
  },
  {
    key: 'assignedTo',
    header: '담당자',
    sortable: true,
    cell: (row) => leadService.getLeadMemberName(row.assignedTo),
  },
  {
    key: 'createdAt',
    header: '생성일',
    sortable: true,
    cell: (row) => formatDate(row.createdAt),
  },
];

export default function LeadTable({ data, onEdit, onDelete }: LeadTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="등록된 리드가 없습니다."
    />
  );
}
