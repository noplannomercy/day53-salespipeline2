'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import CompanyForm from '@/components/companies/CompanyForm';
import CompanyTable from '@/components/companies/CompanyTable';
import * as companyService from '@/services/company.service';
import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type { Company, CompanySize, CompanyFilters, Contact, Deal } from '@/types/index';

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: 'small', label: '소기업' },
  { value: 'medium', label: '중기업' },
  { value: 'large', label: '대기업' },
  { value: 'enterprise', label: '엔터프라이즈' },
];

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<string>('');
  const [filterSize, setFilterSize] = useState<string>('');

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  const loadData = useCallback(() => {
    const filters: CompanyFilters = {};
    if (search) filters.search = search;
    if (filterIndustry && filterIndustry !== 'all') filters.industry = filterIndustry;
    if (filterSize && filterSize !== 'all') filters.size = filterSize as CompanySize;

    setCompanies(companyService.getCompanies(filters));
    setContacts(storage.getAll<Contact>(STORAGE_KEYS.CONTACTS));
    setDeals(storage.getAll<Deal>(STORAGE_KEYS.DEALS));
    setIndustries(companyService.getDistinctIndustries());
  }, [search, filterIndustry, filterSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreate() {
    setEditingCompany(null);
    setFormOpen(true);
  }

  function handleEdit(company: Company) {
    setEditingCompany(company);
    setFormOpen(true);
  }

  function handleSubmit(data: {
    name: string;
    industry: string;
    size: CompanySize | null;
    website: string;
    phone: string;
    address: string;
    revenue: number | null;
  }) {
    if (editingCompany) {
      companyService.updateCompany(editingCompany.id, data);
    } else {
      companyService.createCompany(data);
    }
    setFormOpen(false);
    setEditingCompany(null);
    loadData();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    companyService.deleteCompany(deleteTarget.id);
    setDeleteTarget(null);
    loadData();
  }

  function handleRowClick(company: Company) {
    router.push(`/companies/${company.id}`);
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">회사 관리</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          회사 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="회사명, 업종, 웹사이트 검색..."
            className="pl-9"
          />
        </div>
        <Select value={filterIndustry} onValueChange={setFilterIndustry}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="업종 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">업종 전체</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSize} onValueChange={setFilterSize}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="규모 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">규모 전체</SelectItem>
            {SIZE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || filterIndustry || filterSize) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setFilterIndustry('');
              setFilterSize('');
            }}
          >
            필터 초기화
          </Button>
        )}
      </div>

      {/* Table */}
      <CompanyTable
        companies={companies}
        contacts={contacts}
        deals={deals}
        onEdit={handleEdit}
        onDelete={(c) => setDeleteTarget(c)}
        onRowClick={handleRowClick}
      />

      {/* Form modal */}
      <Modal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCompany(null);
        }}
        title={editingCompany ? '회사 수정' : '회사 추가'}
      >
        <CompanyForm
          company={editingCompany}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditingCompany(null);
          }}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="회사 삭제"
        message={`"${deleteTarget?.name}" 회사를 삭제하시겠습니까? 소속 연락처의 회사 연결이 해제됩니다.`}
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
