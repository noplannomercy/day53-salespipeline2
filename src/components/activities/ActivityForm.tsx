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
import type { Activity, ActivityType, Contact, Deal, Member } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import * as storage from '@/lib/storage';
import * as activityService from '@/services/activity.service';

interface ActivityFormProps {
  activity?: Activity;
  onSave: (data: Omit<Activity, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'call', label: '전화' },
  { value: 'email', label: '이메일' },
  { value: 'meeting', label: '미팅' },
  { value: 'task', label: '작업' },
  { value: 'note', label: '노트' },
];

export default function ActivityForm({ activity, onSave, onClose }: ActivityFormProps) {
  const [type, setType] = useState<ActivityType>(activity?.type ?? 'task');
  const [title, setTitle] = useState(activity?.title ?? '');
  const [description, setDescription] = useState(activity?.description ?? '');
  const [dueDate, setDueDate] = useState(
    activity?.dueDate ? activity.dueDate.split('T')[0] : '',
  );
  const [assignedTo, setAssignedTo] = useState(activity?.assignedTo ?? '');
  const [dealId, setDealId] = useState(activity?.dealId ?? '');
  const [contactId, setContactId] = useState(activity?.contactId ?? '');

  const [members, setMembers] = useState<Member[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    setMembers(storage.getAll<Member>(STORAGE_KEYS.MEMBERS));
    setDeals(storage.getAll<Deal>(STORAGE_KEYS.DEALS));
    setContacts(storage.getAll<Contact>(STORAGE_KEYS.CONTACTS));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !assignedTo) return;

    const data: Omit<Activity, 'id' | 'createdAt'> = {
      type,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      isCompleted: activity?.isCompleted ?? false,
      assignedTo,
      dealId: dealId || null,
      contactId: contactId || null,
    };

    onSave(data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-type">유형 *</Label>
        <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="유형 선택" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-title">제목 *</Label>
        <Input
          id="activity-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="활동 제목"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-desc">설명</Label>
        <textarea
          id="activity-desc"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="활동 설명"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-due">마감일</Label>
        <Input
          id="activity-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-assigned">담당자 *</Label>
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-deal">딜 연결</Label>
        <Select value={dealId || '__none__'} onValueChange={(v) => setDealId(v === '__none__' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="딜 선택 (선택사항)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">없음</SelectItem>
            {deals.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-contact">연락처 연결</Label>
        <Select value={contactId || '__none__'} onValueChange={(v) => setContactId(v === '__none__' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="연락처 선택 (선택사항)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">없음</SelectItem>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.email})
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
          {activity ? '수정' : '생성'}
        </Button>
      </div>
    </form>
  );
}
