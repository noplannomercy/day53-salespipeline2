'use client';

import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import PriorityBadge from '@/components/common/PriorityBadge';
import type { Deal, ColumnDef } from '@/types/index';
import { formatDate, formatCurrency } from '@/lib/utils';
import * as dealService from '@/services/deal.service';

interface DealTableProps {
  data: Deal[];
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onClone?: (deal: Deal) => void;
}

const columns: ColumnDef<Deal>[] = [
  {
    key: 'title',
    header: '제목',
    sortable: true,
    cell: (row) => <span className="font-medium">{row.title}</span>,
  },
  {
    key: 'pipelineId',
    header: '파이프라인',
    sortable: true,
    cell: (row) => dealService.getDealPipelineName(row.pipelineId),
  },
  {
    key: 'stageId',
    header: '스테이지',
    sortable: true,
    cell: (row) => dealService.getDealStageName(row.stageId),
  },
  {
    key: 'status',
    header: '상태',
    sortable: true,
    cell: (row) => <StatusBadge status={row.status} type="deal" />,
  },
  {
    key: 'assignedTo',
    header: '담당자',
    sortable: true,
    cell: (row) => dealService.getDealMemberName(row.assignedTo),
  },
  {
    key: 'value',
    header: '금액',
    sortable: true,
    className: 'text-right',
    cell: (row) => (
      <span className="tabular-nums">
        {formatCurrency(row.value, row.currency)}
      </span>
    ),
  },
  {
    key: 'expectedCloseDate',
    header: '마감일',
    sortable: true,
    cell: (row) => formatDate(row.expectedCloseDate),
  },
  {
    key: 'priority',
    header: '우선도',
    sortable: true,
    cell: (row) => <PriorityBadge priority={row.priority} />,
  },
];

export default function DealTable({ data, onEdit, onDelete, onClone }: DealTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
      onClone={onClone}
      emptyMessage="등록된 딜이 없습니다."
    />
  );
}
