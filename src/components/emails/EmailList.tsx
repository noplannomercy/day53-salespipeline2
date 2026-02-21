'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/common/DataTable';
import type { Email, ColumnDef } from '@/types/index';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import * as emailService from '@/services/email.service';

interface EmailListProps {
  emails: Email[];
  onEdit: (email: Email) => void;
  onDelete: (email: Email) => void;
  onSend: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  sent: {
    label: '발송됨',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  draft: {
    label: '임시저장',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
  scheduled: {
    label: '예약됨',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
};

export default function EmailList({ emails, onEdit, onDelete, onSend }: EmailListProps) {
  const columns: ColumnDef<Email>[] = [
    {
      key: 'to',
      header: '수신자',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.to}</span>
          <span className="text-xs text-muted-foreground">
            {emailService.getEmailContactName(row.contactId)}
          </span>
        </div>
      ),
    },
    {
      key: 'subject',
      header: '제목',
      sortable: true,
      cell: (row) => (
        <span className="font-medium line-clamp-1">{row.subject}</span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      sortable: true,
      cell: (row) => {
        const config = STATUS_CONFIG[row.status];
        if (!config) return null;
        return (
          <Badge
            variant="secondary"
            className={cn('text-xs font-medium border-0', config.className)}
          >
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'sentAt',
      header: '발송 시각',
      sortable: true,
      cell: (row) => row.sentAt ? formatDateTime(row.sentAt) : '-',
    },
    {
      key: 'send',
      header: '',
      cell: (row) =>
        row.status !== 'sent' ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onSend(row.id);
            }}
          >
            <Send className="mr-1 h-3.5 w-3.5" />
            발송
          </Button>
        ) : null,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={emails}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="등록된 이메일이 없습니다."
    />
  );
}
