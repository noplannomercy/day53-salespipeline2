'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Lead, LeadSource, LeadStatus, Contact, Member } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import * as storage from '@/lib/storage';
import * as leadService from '@/services/lead.service';

interface LeadFormProps {
  editId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

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

export default function LeadForm({ editId, onClose, onSaved }: LeadFormProps) {
  const [contactId, setContactId] = useState('');
  const [source, setSource] = useState<LeadSource>('web');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [score, setScore] = useState(50);
  const [assignedTo, setAssignedTo] = useState('');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    setContacts(storage.getAll<Contact>(STORAGE_KEYS.CONTACTS));
    setMembers(storage.getAll<Member>(STORAGE_KEYS.MEMBERS));

    if (editId) {
      const lead = leadService.getLeadById(editId);
      if (lead) {
        setContactId(lead.contactId);
        setSource(lead.source);
        setStatus(lead.status);
        setScore(lead.score);
        setAssignedTo(lead.assignedTo);
      }
    }
  }, [editId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!contactId || !assignedTo) return;

    const data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
      contactId,
      source,
      status,
      score,
      assignedTo,
    };

    if (editId) {
      leadService.updateLead(editId, data);
    } else {
      leadService.createLead(data);
    }

    onSaved();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="lead-contact">연락처 *</Label>
        <Select value={contactId} onValueChange={setContactId}>
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
        <Label htmlFor="lead-source">소스</Label>
        <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="소스 선택" />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lead-status">상태</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
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

      <div className="flex flex-col gap-2">
        <Label>점수: {score}</Label>
        <Slider
          value={[score]}
          onValueChange={(vals) => setScore(vals[0])}
          min={0}
          max={100}
          step={1}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lead-assigned">담당자 *</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="담당자 선택" />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
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
