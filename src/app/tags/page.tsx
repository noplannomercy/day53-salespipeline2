'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TagForm from '@/components/tags/TagForm';
import TagList from '@/components/tags/TagList';
import type { Tag } from '@/types/index';
import { initSeedData } from '@/lib/seed';
import * as tagService from '@/services/tag.service';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [entityCounts, setEntityCounts] = useState<Record<string, number>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);

  const loadData = useCallback(() => {
    initSeedData();
    setTags(tagService.getTags());
    setEntityCounts(tagService.getTagEntityCounts());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreate() {
    setEditId(null);
    setModalOpen(true);
  }

  function handleEdit(tag: Tag) {
    setEditId(tag.id);
    setModalOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      tagService.deleteTag(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">태그 관리</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          새 태그
        </Button>
      </div>

      <TagList
        tags={tags}
        entityCounts={entityCounts}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '태그 수정' : '새 태그'}
      >
        <TagForm
          editId={editId}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="태그 삭제"
        message={`"${deleteTarget?.name ?? ''}" 태그를 삭제하시겠습니까? 연결된 모든 엔티티에서 이 태그가 제거됩니다.`}
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
