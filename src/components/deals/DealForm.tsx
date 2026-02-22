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
import type {
  Deal,
  DealCurrency,
  DealPriority,
  Contact,
  Company,
  Pipeline,
  Stage,
  Member,
  EntityTag,
} from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import * as storage from '@/lib/storage';
import * as dealService from '@/services/deal.service';
import { getEntityTags } from '@/services/tag.service';

interface DealFormProps {
  editId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

const CURRENCY_OPTIONS: { value: DealCurrency; label: string }[] = [
  { value: 'KRW', label: 'KRW (₩)' },
  { value: 'USD', label: 'USD ($)' },
];

const PRIORITY_OPTIONS: { value: DealPriority; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'urgent', label: '긴급' },
];

export default function DealForm({ editId, onClose, onSaved }: DealFormProps) {
  const [title, setTitle] = useState('');
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState<string>('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');
  const [value, setValue] = useState('');
  const [currency, setCurrency] = useState<DealCurrency>('KRW');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const [priority, setPriority] = useState<DealPriority>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    setContacts(storage.getAll<Contact>(STORAGE_KEYS.CONTACTS));
    setCompanies(storage.getAll<Company>(STORAGE_KEYS.COMPANIES));
    setPipelines(storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES));
    setStages(storage.getAll<Stage>(STORAGE_KEYS.STAGES));
    setMembers(storage.getAll<Member>(STORAGE_KEYS.MEMBERS));

    if (editId) {
      const deal = dealService.getDealById(editId);
      if (deal) {
        setTitle(deal.title);
        setContactId(deal.contactId);
        setCompanyId(deal.companyId ?? '');
        setPipelineId(deal.pipelineId);
        setStageId(deal.stageId);
        setValue(String(deal.value));
        setCurrency(deal.currency);
        setExpectedCloseDate(
          deal.expectedCloseDate
            ? deal.expectedCloseDate.substring(0, 10)
            : '',
        );
        setPriority(deal.priority);
        setAssignedTo(deal.assignedTo);

        // Load existing tags
        const dealTags = getEntityTags('deal', editId);
        setSelectedTagIds(dealTags.map((t) => t.id));
      }
    }
  }, [editId]);

  /** Stages filtered by the currently selected pipeline */
  const filteredStages = pipelineId
    ? stages
        .filter((s) => s.pipelineId === pipelineId)
        .sort((a, b) => a.order - b.order)
    : [];

  /** When pipeline changes, reset stageId to the first available stage */
  function handlePipelineChange(newPipelineId: string) {
    setPipelineId(newPipelineId);
    const pipelineStages = stages
      .filter((s) => s.pipelineId === newPipelineId)
      .sort((a, b) => a.order - b.order);
    setStageId(pipelineStages.length > 0 ? pipelineStages[0].id : '');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !contactId || !pipelineId || !stageId || !assignedTo) {
      return;
    }

    const parsedValue = parseFloat(value) || 0;
    const closeDate = expectedCloseDate
      ? new Date(expectedCloseDate).toISOString()
      : null;

    const data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      contactId,
      companyId: companyId || null,
      pipelineId,
      stageId,
      value: parsedValue,
      currency,
      expectedCloseDate: closeDate,
      priority,
      status: 'open',
      lostReason: '',
      assignedTo,
    };

    let dealId: string;
    if (editId) {
      dealService.updateDeal(editId, data);
      dealId = editId;
    } else {
      const created = dealService.createDeal(data);
      dealId = created.id;
    }

    // Sync entity tags for this deal
    const allEntityTags = storage.getAll<EntityTag>(STORAGE_KEYS.ENTITY_TAGS);
    const otherTags = allEntityTags.filter(
      (et) => !(et.entityType === 'deal' && et.entityId === dealId),
    );
    const newTags = selectedTagIds.map((tagId) => ({
      id: crypto.randomUUID(),
      entityType: 'deal' as const,
      entityId: dealId,
      tagId,
    }));
    storage.save(STORAGE_KEYS.ENTITY_TAGS, [...otherTags, ...newTags]);

    onSaved();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="deal-title">제목 *</Label>
        <Input
          id="deal-title"
          placeholder="딜 제목 입력"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-2">
        <Label>연락처 *</Label>
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

      {/* Company */}
      <div className="flex flex-col gap-2">
        <Label>회사</Label>
        <Select
          value={companyId || '__none__'}
          onValueChange={(v) => setCompanyId(v === '__none__' ? '' : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="회사 선택 (선택사항)" />
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

      {/* Pipeline & Stage */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>파이프라인 *</Label>
          <Select value={pipelineId} onValueChange={handlePipelineChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="파이프라인 선택" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>스테이지 *</Label>
          <Select value={stageId} onValueChange={setStageId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="스테이지 선택" />
            </SelectTrigger>
            <SelectContent>
              {filteredStages.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Value & Currency */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="deal-value">금액</Label>
          <Input
            id="deal-value"
            type="number"
            min="0"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>통화</Label>
          <Select
            value={currency}
            onValueChange={(v) => setCurrency(v as DealCurrency)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Close Date */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="deal-close-date">예상 마감일</Label>
        <Input
          id="deal-close-date"
          type="date"
          value={expectedCloseDate}
          onChange={(e) => setExpectedCloseDate(e.target.value)}
        />
      </div>

      {/* Priority */}
      <div className="flex flex-col gap-2">
        <Label>우선도</Label>
        <Select
          value={priority}
          onValueChange={(v) => setPriority(v as DealPriority)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assigned To */}
      <div className="flex flex-col gap-2">
        <Label>담당자 *</Label>
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

      {/* Tags */}
      <div className="flex flex-col gap-2">
        <Label>태그</Label>
        <TagAutocomplete
          selectedTagIds={selectedTagIds}
          onChange={setSelectedTagIds}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          취소
        </Button>
        <Button type="submit">{editId ? '수정' : '생성'}</Button>
      </div>
    </form>
  );
}
