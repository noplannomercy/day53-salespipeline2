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
import type { Email, EmailStatus, Contact, Deal } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import * as storage from '@/lib/storage';
import * as emailService from '@/services/email.service';

interface EmailFormProps {
  editId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_OPTIONS: { value: EmailStatus; label: string }[] = [
  { value: 'draft', label: '임시저장' },
  { value: 'sent', label: '발송됨' },
  { value: 'scheduled', label: '예약됨' },
];

export default function EmailForm({ editId, onClose, onSaved }: EmailFormProps) {
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<EmailStatus>('draft');
  const [contactId, setContactId] = useState('');
  const [dealId, setDealId] = useState('');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const loadedContacts = storage.getAll<Contact>(STORAGE_KEYS.CONTACTS);
    const loadedDeals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
    setContacts(loadedContacts);
    setDeals(loadedDeals);

    if (editId) {
      const email = emailService.getEmailById(editId);
      if (email) {
        setTo(email.to);
        setFrom(email.from);
        setSubject(email.subject);
        setBody(email.body);
        setStatus(email.status);
        setContactId(email.contactId);
        setDealId(email.dealId ?? '');
      }
    }
  }, [editId]);

  // Auto-fill the "to" field when a contact is selected
  function handleContactChange(value: string) {
    setContactId(value);
    const selected = contacts.find((c) => c.id === value);
    if (selected && !to) {
      setTo(selected.email);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!to || !from || !subject || !contactId) return;

    const data = {
      to,
      from,
      subject,
      body,
      status,
      contactId,
      dealId: dealId || null,
      sentAt: status === 'sent' ? new Date().toISOString() : null,
    };

    if (editId) {
      emailService.updateEmail(editId, data);
    } else {
      emailService.createEmail(data);
    }

    onSaved();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email-contact">연락처 연결 *</Label>
        <Select value={contactId} onValueChange={handleContactChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="연락처 선택" />
          </SelectTrigger>
          <SelectContent>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-deal">딜 연결</Label>
        <Select value={dealId || '__none__'} onValueChange={(v) => setDealId(v === '__none__' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="딜 선택 (선택사항)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">연결 없음</SelectItem>
            {deals.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-from">발신자 *</Label>
        <Input
          id="email-from"
          type="email"
          placeholder="sender@example.com"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-to">수신자 *</Label>
        <Input
          id="email-to"
          type="email"
          placeholder="recipient@example.com"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-subject">제목 *</Label>
        <Input
          id="email-subject"
          placeholder="이메일 제목"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-body">본문</Label>
        <textarea
          id="email-body"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="이메일 내용을 입력하세요"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email-status">상태</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as EmailStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
