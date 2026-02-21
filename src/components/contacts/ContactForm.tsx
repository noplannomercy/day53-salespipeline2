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
import type { Contact, Company, Tag, EntityTag } from '@/types/index';
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

  const [companies, setCompanies] = useState<Company[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    setCompanies(storage.getAll<Company>(STORAGE_KEYS.COMPANIES));
    setTags(storage.getAll<Tag>(STORAGE_KEYS.TAGS));

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

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
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
          placeholder="010-0000-0000"
        />
      </div>

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

      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>태그</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  selectedTagIds.includes(tag.id)
                    ? 'border-transparent text-white'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
                style={
                  selectedTagIds.includes(tag.id)
                    ? { backgroundColor: tag.color }
                    : undefined
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

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
