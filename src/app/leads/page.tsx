'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Search, ArrowRightLeft } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import LeadForm from '@/components/leads/LeadForm';
import LeadTable from '@/components/leads/LeadTable';
import ConvertDialog from '@/components/leads/ConvertDialog';
import type { Lead, LeadFilters, LeadSource, LeadStatus, Member } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import { initSeedData } from '@/lib/seed';
import * as storage from '@/lib/storage';
import * as leadService from '@/services/lead.service';

const SOURCE_OPTIONS: { value: LeadSource; label: string }[] = [
  { value: 'web', label: '웹' },
  { value: 'referral', label: '추천' },
  { value: 'ad', label: '광고' },
  { value: 'event', label: '이벤트' },
  { value: 'other', label: '기타' },
];

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: '신규' },
  { value: 'contacted', label: '접촉' },
  { value: 'qualified', label: '검증됨' },
  { value: 'unqualified', label: '미검증' },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [members, setMembers] = useState<Member[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [convertLeadId, setConvertLeadId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    initSeedData();
    setLeads(leadService.getLeads(filters));
  }, [filters]);

  useEffect(() => {
    initSeedData();
    setMembers(storage.getAll<Member>(STORAGE_KEYS.MEMBERS));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreate() {
    setEditId(null);
    setModalOpen(true);
  }

  function handleEdit(lead: Lead) {
    setEditId(lead.id);
    setModalOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      leadService.deleteLead(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">리드 관리</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          리드 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="연락처 이름 검색"
            className="pl-9"
            value={filters.search ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value || undefined }))
            }
          />
        </div>
        <Select
          value={filters.source ?? '__all__'}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              source: v === '__all__' ? undefined : (v as LeadSource),
            }))
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="소스 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">소스 전체</SelectItem>
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status ?? '__all__'}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              status: v === '__all__' ? undefined : (v as LeadStatus),
            }))
          }
        >
          <SelectTrigger className="w-[130px]">
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
        <Select
          value={filters.assignedTo ?? '__all__'}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              assignedTo: v === '__all__' ? undefined : v,
            }))
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
      </div>

      {/* Quick convert buttons for qualified leads */}
      {leads.some((l) => l.status === 'qualified') && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowRightLeft className="h-4 w-4" />
          <span>검증된 리드를 클릭하여 딜로 전환:</span>
          <div className="flex gap-1 flex-wrap">
            {leads
              .filter((l) => l.status === 'qualified')
              .map((lead) => (
                <Button
                  key={lead.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setConvertLeadId(lead.id)}
                >
                  {leadService.getLeadContactName(lead.contactId)} - 전환
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Table */}
      <LeadTable
        data={leads}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '리드 수정' : '리드 추가'}
      >
        <LeadForm
          editId={editId}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="리드 삭제"
        message={`이 리드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Convert to Deal Dialog */}
      <ConvertDialog
        isOpen={!!convertLeadId}
        leadId={convertLeadId}
        onClose={() => setConvertLeadId(null)}
        onConverted={loadData}
      />
    </div>
  );
}
