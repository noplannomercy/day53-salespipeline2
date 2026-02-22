'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { ColumnDef, SortDirection } from '@/types/index';
import EmptyState from './EmptyState';

interface DataTableProps<TRow extends { id: string }> {
  columns: ColumnDef<TRow>[];
  data: TRow[];
  onEdit?: (row: TRow) => void;
  onDelete?: (row: TRow) => void;
  /** Called when a row is clicked (not on action buttons). */
  onRowClick?: (row: TRow) => void;
  /** Number of rows per page. Defaults to 10. */
  pageSize?: number;
  /** Message shown when data is empty. */
  emptyMessage?: string;
  /** Called when a row's "복제" button is clicked. */
  onClone?: (row: TRow) => void;
}

interface SortState {
  key: string;
  direction: SortDirection;
}

export default function DataTable<TRow extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  onRowClick,
  pageSize = 10,
  emptyMessage = '데이터가 없습니다.',
  onClone,
}: DataTableProps<TRow>) {
  const [sort, setSort] = useState<SortState | null>(null);
  const [page, setPage] = useState(1);

  // Apply client-side sorting
  const sorted = sort
    ? [...data].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sort.key];
        const bVal = (b as Record<string, unknown>)[sort.key];
        const aStr = String(aVal ?? '');
        const bStr = String(bVal ?? '');
        const cmp = aStr.localeCompare(bStr, 'ko');
        return sort.direction === 'asc' ? cmp : -cmp;
      })
    : data;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
    setPage(1);
  }

  function SortIcon({ columnKey }: { columnKey: string }) {
    if (sort?.key !== columnKey) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />;
    return sort.direction === 'asc'
      ? <ChevronUp className="ml-1 h-3.5 w-3.5" />
      : <ChevronDown className="ml-1 h-3.5 w-3.5" />;
  }

  const hasActions = Boolean(onEdit || onDelete || onClone);

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.className}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="flex items-center font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.header}
                      <SortIcon columnKey={col.key} />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-right">액션</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row) => (
              <TableRow
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell className="text-right space-x-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(row);
                        }}
                      >
                        편집
                      </Button>
                    )}
                    {onClone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClone(row);
                        }}
                      >
                        복제
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(row);
                        }}
                      >
                        삭제
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>총 {data.length}건</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </Button>
            <span>
              {safePage} / {totalPages} 페이지
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
