'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmailForm from '@/components/emails/EmailForm';
import EmailList from '@/components/emails/EmailList';
import type { Email, EmailStatus } from '@/types/index';
import { initSeedData } from '@/lib/seed';
import * as emailService from '@/services/email.service';

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | EmailStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Email | null>(null);

  const loadData = useCallback(() => {
    initSeedData();
    const filters = activeTab === 'all' ? {} : { status: activeTab };
    setEmails(emailService.getEmails(filters));
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreate() {
    setEditId(null);
    setModalOpen(true);
  }

  function handleEdit(email: Email) {
    setEditId(email.id);
    setModalOpen(true);
  }

  function handleSend(id: string) {
    emailService.sendEmail(id);
    loadData();
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      emailService.deleteEmail(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">이메일</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          이메일 작성
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'all' | EmailStatus)}
      >
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="sent">발송됨</TabsTrigger>
          <TabsTrigger value="draft">임시저장</TabsTrigger>
          <TabsTrigger value="scheduled">예약됨</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <EmailList
            emails={emails}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            onSend={handleSend}
          />
        </TabsContent>
      </Tabs>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '이메일 수정' : '이메일 작성'}
        maxWidth="max-w-2xl"
      >
        <EmailForm
          editId={editId}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="이메일 삭제"
        message="이 이메일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
