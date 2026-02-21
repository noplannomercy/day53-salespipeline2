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
import { Plus, Search } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import MemberForm from '@/components/members/MemberForm';
import MemberTable from '@/components/members/MemberTable';
import type { Member, MemberRole, MemberFilters } from '@/types/index';
import { initSeedData } from '@/lib/seed';
import * as memberService from '@/services/member.service';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filters, setFilters] = useState<MemberFilters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const loadData = useCallback(() => {
    initSeedData();
    setMembers(memberService.getMembers(filters));
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreate() {
    setEditId(null);
    setModalOpen(true);
  }

  function handleEdit(member: Member) {
    setEditId(member.id);
    setModalOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      memberService.deleteMember(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">멤버 관리</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          멤버 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름/이메일 검색"
            className="pl-9"
            value={filters.search ?? ''}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value || undefined }))
            }
          />
        </div>
        <Select
          value={filters.role ?? '__all__'}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              role: v === '__all__' ? undefined : (v as MemberRole),
            }))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="역할 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">역할 전체</SelectItem>
            <SelectItem value="admin">관리자</SelectItem>
            <SelectItem value="manager">매니저</SelectItem>
            <SelectItem value="sales">영업</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <MemberTable
        data={members}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '멤버 수정' : '멤버 추가'}
      >
        <MemberForm
          editId={editId}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="멤버 삭제"
        message={`"${deleteTarget?.name}" 멤버를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
