'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import ContactForm from '@/components/contacts/ContactForm';
import ContactTable from '@/components/contacts/ContactTable';
import type { Contact, ContactFilters, Tag } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import { initSeedData } from '@/lib/seed';
import * as storage from '@/lib/storage';
import * as contactService from '@/services/contact.service';

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  const loadData = useCallback(() => {
    initSeedData();
    setContacts(contactService.getContacts(filters));
  }, [filters]);

  useEffect(() => {
    initSeedData();
    setTags(storage.getAll<Tag>(STORAGE_KEYS.TAGS));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreate() {
    setEditId(null);
    setModalOpen(true);
  }

  function handleEdit(contact: Contact) {
    setEditId(contact.id);
    setModalOpen(true);
  }

  function handleRowClick(contact: Contact) {
    router.push(`/contacts/${contact.id}`);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      contactService.deleteContact(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">연락처</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          연락처 추가
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
          value={filters.tagId ?? '__all__'}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              tagId: v === '__all__' ? undefined : v,
            }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="태그 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">태그 전체</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <ContactTable
        data={contacts}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onRowClick={handleRowClick}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? '연락처 수정' : '연락처 추가'}
      >
        <ContactForm
          editId={editId}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="연락처 삭제"
        message={`"${deleteTarget?.name}" 연락처를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
