'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TagAutocomplete from '@/components/common/TagAutocomplete';
import type { Contact, Company, EntityTag } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import * as storage from '@/lib/storage';
import * as contactService from '@/services/contact.service';

interface ContactFormProps {
  editId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ContactForm({ editId, onClose, onSaved }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState<string>('');
  const [position, setPosition] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState('');

  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    setCompanies(storage.getAll<Company>(STORAGE_KEYS.COMPANIES));

    if (editId) {
      const contact = contactService.getContactById(editId);
      if (contact) {
        setName(contact.name);
        setEmail(contact.email);
        setPhone(contact.phone);
        setCompanyId(contact.companyId ?? '');
        setPosition(contact.position);
        setAvatar(contact.avatar);

        // Load existing tags
        const contactTags = contactService.getContactTags(editId);
        setSelectedTagIds(contactTags.map((t) => t.id));
      }
    }
  }, [editId]);

  function checkDuplicates(checkEmail: string, checkPhone: string) {
    const dupes = contactService.findDuplicates(
      checkEmail,
      checkPhone,
      editId ?? undefined,
    );
    if (dupes.length > 0) {
      const names = dupes.map((c) => c.name).join(', ');
      setDuplicateWarning(
        `동일한 이메일/전화번호의 연락처가 있습니다: ${names}`,
      );
    } else {
      setDuplicateWarning('');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim()) return;

    const data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyId: companyId || null,
      position: position.trim(),
      avatar: avatar.trim(),
    };

    let contactId: string;

    if (editId) {
      contactService.updateContact(editId, data);
      contactId = editId;
    } else {
      const created = contactService.createContact(data);
      contactId = created.id;
    }

    // Sync entity tags for this contact
    const allEntityTags = storage.getAll<EntityTag>(STORAGE_KEYS.ENTITY_TAGS);
    const otherTags = allEntityTags.filter(
      (et) => !(et.entityType === 'contact' && et.entityId === contactId),
    );
    const newTags = selectedTagIds.map((tagId) => ({
      id: crypto.randomUUID(),
      entityType: 'contact' as const,
      entityId: contactId,
      tagId,
    }));
    storage.save(STORAGE_KEYS.ENTITY_TAGS, [...otherTags, ...newTags]);

    onSaved();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-name">이름 *</Label>
        <Input
          id="contact-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="연락처 이름"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-email">이메일 *</Label>
        <Input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => checkDuplicates(email, phone)}
          placeholder="email@example.com"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-phone">전화번호</Label>
        <Input
          id="contact-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => checkDuplicates(email, phone)}
          placeholder="010-0000-0000"
        />
      </div>

      {duplicateWarning && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {duplicateWarning}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-company">소속 회사</Label>
        <Select
          value={companyId || '__none__'}
          onValueChange={(v) => setCompanyId(v === '__none__' ? '' : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="회사 선택 (선택)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">없음</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-position">직책</Label>
        <Input
          id="contact-position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          placeholder="직책/직함"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>태그</Label>
        <TagAutocomplete
          selectedTagIds={selectedTagIds}
          onChange={setSelectedTagIds}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button type="submit">
          {editId ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}
