'use client';

import DataTable from '@/components/common/DataTable';
import MemberAvatar from '@/components/common/MemberAvatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Member, ColumnDef } from '@/types/index';
import * as memberService from '@/services/member.service';

interface MemberTableProps {
  data: Member[];
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
}

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin: {
    label: '관리자',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  manager: {
    label: '매니저',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  sales: {
    label: '영업',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
};

const columns: ColumnDef<Member>[] = [
  {
    key: 'name',
    header: '이름',
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <MemberAvatar member={row} size="sm" />
        <span className="font-medium">{row.name}</span>
      </div>
    ),
  },
  {
    key: 'email',
    header: '이메일',
    sortable: true,
    cell: (row) => row.email,
  },
  {
    key: 'role',
    header: '역할',
    sortable: true,
    cell: (row) => {
      const config = ROLE_CONFIG[row.role];
      return config ? (
        <Badge
          variant="secondary"
          className={cn('text-xs font-medium border-0', config.className)}
        >
          {config.label}
        </Badge>
      ) : (
        row.role
      );
    },
  },
  {
    key: 'dealCount',
    header: '담당 딜',
    cell: (row) => {
      const count = memberService.getMemberDealCount(row.id);
      return <span>{count}건</span>;
    },
  },
  {
    key: 'activityCount',
    header: '담당 활동',
    cell: (row) => {
      const count = memberService.getMemberActivityCount(row.id);
      return <span>{count}건</span>;
    },
  },
];

export default function MemberTable({ data, onEdit, onDelete }: MemberTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="등록된 멤버가 없습니다."
    />
  );
}
