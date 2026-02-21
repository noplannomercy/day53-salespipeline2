'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DealForm from '@/components/deals/DealForm';
import DealTable from '@/components/deals/DealTable';
import DealFilters from '@/components/deals/DealFilters';
import CloseDialog from '@/components/deals/CloseDialog';
import type {
  Deal,
  DealFilters as DealFiltersType,
  Pipeline,
  Stage,
  Member,
} from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import { initSeedData } from '@/lib/seed';
import * as storage from '@/lib/storage';
import * as dealService from '@/services/deal.service';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filters, setFilters] = useState<DealFiltersType>({});
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [closeTarget, setCloseTarget] = useState<Deal | null>(null);

  const loadData = useCallback(() => {
    initSeedData();
    setDeals(dealService.getDeals(filters));
  }, [filters]);

  useEffect(() => {
    initSeedData();
    setPipelines(storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES));
    setStages(storage.getAll<Stage>(STORAGE_KEYS.STAGES));
    setMembers(storage.getAll<Member>(STORAGE_KEYS.MEMBERS));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreate() {
    setEditId(null);
    setModalOpen(true);
  }

  function handleEdit(deal: Deal) {
    setEditId(deal.id);
    setModalOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      dealService.deleteDeal(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  }

  function handleCloseConfirm(outcome: 'won' | 'lost', lostReason?: string) {
    if (closeTarget) {
      dealService.closeDeal(closeTarget.id, outcome, lostReason);
      setCloseTarget(null);
      loadData();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">딜 관리</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          딜 추가
        </Button>
      </div>

      {/* Filters */}
      <DealFilters
        filters={filters}
        onFiltersChange={setFilters}
        pipelines={pipelines}
        stages={stages}
        members={members}
      />

      {/* Quick close buttons for open deals */}
      {deals.some((d) => d.status === 'open') && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span>진행 중인 딜 종료:</span>
          <div className="flex gap-1 flex-wrap">
            {deals
              .filter((d) => d.status === 'open')
              .slice(0, 5)
              .map((deal) => (
                <Button
                  key={deal.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setCloseTarget(deal)}
                >
                  {deal.title}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Table */}
      <DealTable
        data={deals}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '딜 수정' : '딜 추가'}
        maxWidth="max-w-xl"
      >
        <DealForm
          editId={editId}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="딜 삭제"
        message={`"${deleteTarget?.title ?? ''}" 딜을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Close Deal Dialog */}
      <CloseDialog
        isOpen={!!closeTarget}
        dealTitle={closeTarget?.title ?? ''}
        onClose={() => setCloseTarget(null)}
        onConfirm={handleCloseConfirm}
      />
    </div>
  );
}
