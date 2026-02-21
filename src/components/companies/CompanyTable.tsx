'use client';

import DataTable from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import type { Company, ColumnDef, Contact, Deal } from '@/types/index';

const SIZE_LABELS: Record<string, string> = {
  small: '소기업',
  medium: '중기업',
  large: '대기업',
  enterprise: '엔터프라이즈',
};

interface CompanyRow extends Company {
  contactCount: number;
  dealCount: number;
}

interface CompanyTableProps {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onRowClick: (company: Company) => void;
}

export default function CompanyTable({
  companies,
  contacts,
  deals,
  onEdit,
  onDelete,
  onRowClick,
}: CompanyTableProps) {
  // Enrich companies with contact/deal counts
  const rows: CompanyRow[] = companies.map((c) => ({
    ...c,
    contactCount: contacts.filter((ct) => ct.companyId === c.id).length,
    dealCount: deals.filter((d) => d.companyId === c.id).length,
  }));

  const columns: ColumnDef<CompanyRow>[] = [
    {
      key: 'name',
      header: '회사명',
      sortable: true,
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'industry',
      header: '업종',
      sortable: true,
      cell: (row) => row.industry || '-',
    },
    {
      key: 'size',
      header: '규모',
      sortable: true,
      cell: (row) =>
        row.size ? (
          <Badge variant="outline">{SIZE_LABELS[row.size] ?? row.size}</Badge>
        ) : (
          '-'
        ),
    },
    {
      key: 'website',
      header: '웹사이트',
      cell: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {row.website.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          '-'
        ),
    },
    {
      key: 'contactCount',
      header: '연락처',
      className: 'text-center',
      cell: (row) => row.contactCount,
    },
    {
      key: 'dealCount',
      header: '딜',
      className: 'text-center',
      cell: (row) => row.dealCount,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      onEdit={(row) => onEdit(row)}
      onDelete={(row) => onDelete(row)}
      onRowClick={(row) => onRowClick(row)}
      emptyMessage="등록된 회사가 없습니다."
    />
  );
}
