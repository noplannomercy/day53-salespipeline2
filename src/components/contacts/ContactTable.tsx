'use client';

import DataTable from '@/components/common/DataTable';
import type { Contact, ColumnDef } from '@/types/index';
import * as contactService from '@/services/contact.service';

interface ContactTableProps {
  data: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onRowClick?: (contact: Contact) => void;
}

const columns: ColumnDef<Contact>[] = [
  {
    key: 'name',
    header: '이름',
    sortable: true,
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'email',
    header: '이메일',
    sortable: true,
    cell: (row) => row.email,
  },
  {
    key: 'phone',
    header: '전화번호',
    cell: (row) => row.phone || '-',
  },
  {
    key: 'companyId',
    header: '회사',
    sortable: true,
    cell: (row) => contactService.getContactCompanyName(row.companyId),
  },
  {
    key: 'position',
    header: '직책',
    cell: (row) => row.position || '-',
  },
  {
    key: 'dealCount',
    header: '딜 수',
    cell: (row) => {
      const count = contactService.getContactDealCount(row.id);
      return <span>{count}건</span>;
    },
  },
];

export default function ContactTable({ data, onEdit, onDelete, onRowClick }: ContactTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
      onRowClick={onRowClick}
      emptyMessage="등록된 연락처가 없습니다."
    />
  );
}
