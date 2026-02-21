'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PriorityBadge from '@/components/common/PriorityBadge';
import StatusBadge from '@/components/common/StatusBadge';
import MemberAvatar from '@/components/common/MemberAvatar';
import type {
  DealWithRelations,
  Pipeline,
  Stage,
  Contact,
  Company,
  Member,
  DealPriority,
  DealCurrency,
} from '@/types/index';
import { formatDate, formatCurrency } from '@/lib/utils';
import * as dealService from '@/services/deal.service';
import * as pipelineService from '@/services/pipeline.service';
import * as stageService from '@/services/stage.service';
import * as contactService from '@/services/contact.service';
import * as companyService from '@/services/company.service';
import * as memberService from '@/services/member.service';

interface DealDetailProps {
  deal: DealWithRelations;
  onUpdated: () => void;
}

const PRIORITY_OPTIONS: { value: DealPriority; label: string }[] = [
  { value: 'low', label: '낮음' },
  { value: 'medium', label: '보통' },
  { value: 'high', label: '높음' },
  { value: 'urgent', label: '긴급' },
];

const CURRENCY_OPTIONS: { value: DealCurrency; label: string }[] = [
  { value: 'KRW', label: 'KRW (₩)' },
  { value: 'USD', label: 'USD ($)' },
];

/**
 * Inline editable deal information card for the "정보" tab.
 * Displays deal fields and allows editing with Save/Cancel controls.
 */
export default function DealDetail({ deal, onUpdated }: DealDetailProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [title, setTitle] = useState(deal.title);
  const [value, setValue] = useState(deal.value);
  const [currency, setCurrency] = useState<DealCurrency>(deal.currency);
  const [priority, setPriority] = useState<DealPriority>(deal.priority);
  const [pipelineId, setPipelineId] = useState(deal.pipelineId);
  const [stageId, setStageId] = useState(deal.stageId);
  const [contactId, setContactId] = useState(deal.contactId);
  const [companyId, setCompanyId] = useState(deal.companyId ?? '');
  const [assignedTo, setAssignedTo] = useState(deal.assignedTo);
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : '',
  );

  // Reference data for selectors
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    setPipelines(pipelineService.getPipelines());
    setContacts(contactService.getContacts());
    setCompanies(companyService.getCompanies());
    setMembers(memberService.getMembers());
  }, []);

  // Load stages when pipeline changes
  useEffect(() => {
    if (pipelineId) {
      setStages(stageService.getStages(pipelineId));
    }
  }, [pipelineId]);

  // Reset form when deal changes
  useEffect(() => {
    setTitle(deal.title);
    setValue(deal.value);
    setCurrency(deal.currency);
    setPriority(deal.priority);
    setPipelineId(deal.pipelineId);
    setStageId(deal.stageId);
    setContactId(deal.contactId);
    setCompanyId(deal.companyId ?? '');
    setAssignedTo(deal.assignedTo);
    setExpectedCloseDate(
      deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : '',
    );
  }, [deal]);

  function handleSave() {
    dealService.updateDeal(deal.id, {
      title,
      value,
      currency,
      priority,
      pipelineId,
      stageId,
      contactId,
      companyId: companyId || null,
      assignedTo,
      expectedCloseDate: expectedCloseDate
        ? new Date(expectedCloseDate).toISOString()
        : null,
    });
    setIsEditing(false);
    onUpdated();
  }

  function handleCancel() {
    // Reset to current deal values
    setTitle(deal.title);
    setValue(deal.value);
    setCurrency(deal.currency);
    setPriority(deal.priority);
    setPipelineId(deal.pipelineId);
    setStageId(deal.stageId);
    setContactId(deal.contactId);
    setCompanyId(deal.companyId ?? '');
    setAssignedTo(deal.assignedTo);
    setExpectedCloseDate(
      deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : '',
    );
    setIsEditing(false);
  }

  if (!isEditing) {
    // Read-only view
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">딜 정보</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            편집
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground">제목</dt>
              <dd className="font-medium">{deal.title}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">금액</dt>
              <dd className="font-medium">
                {formatCurrency(deal.value, deal.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">상태</dt>
              <dd>
                <StatusBadge status={deal.status} type="deal" />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">우선도</dt>
              <dd>
                <PriorityBadge priority={deal.priority} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">연락처</dt>
              <dd
                className="font-medium text-primary cursor-pointer hover:underline"
                onClick={() =>
                  deal.contact && router.push(`/contacts/${deal.contact.id}`)
                }
              >
                {deal.contact?.name ?? '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">회사</dt>
              <dd
                className={
                  deal.company
                    ? 'font-medium text-primary cursor-pointer hover:underline'
                    : 'font-medium'
                }
                onClick={() =>
                  deal.company && router.push(`/companies/${deal.company.id}`)
                }
              >
                {deal.company?.name ?? '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">담당자</dt>
              <dd className="flex items-center gap-2">
                {deal.assignedMember ? (
                  <>
                    <MemberAvatar member={deal.assignedMember} size="sm" />
                    <span className="font-medium">{deal.assignedMember.name}</span>
                  </>
                ) : (
                  <span className="font-medium">-</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">마감일</dt>
              <dd className="font-medium">
                {formatDate(deal.expectedCloseDate) || '-'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">파이프라인</dt>
              <dd className="font-medium">{deal.pipeline?.name ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">스테이지</dt>
              <dd className="font-medium">{deal.stage?.name ?? '-'}</dd>
            </div>
            {deal.status === 'lost' && deal.lostReason && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">실패 사유</dt>
                <dd className="font-medium text-destructive">{deal.lostReason}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">생성일</dt>
              <dd className="font-medium">{formatDate(deal.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">수정일</dt>
              <dd className="font-medium">{formatDate(deal.updatedAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    );
  }

  // Edit mode
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">딜 정보 편집</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            취소
          </Button>
          <Button size="sm" onClick={handleSave}>
            저장
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Title */}
          <div className="sm:col-span-2">
            <Label htmlFor="deal-title">제목</Label>
            <Input
              id="deal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Value */}
          <div>
            <Label htmlFor="deal-value">금액</Label>
            <Input
              id="deal-value"
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </div>

          {/* Currency */}
          <div>
            <Label>통화</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as DealCurrency)}>
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

          {/* Priority */}
          <div>
            <Label>우선도</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as DealPriority)}>
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

          {/* Expected Close Date */}
          <div>
            <Label htmlFor="deal-close-date">예상 마감일</Label>
            <Input
              id="deal-close-date"
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
            />
          </div>

          {/* Pipeline */}
          <div>
            <Label>파이프라인</Label>
            <Select
              value={pipelineId}
              onValueChange={(v) => {
                setPipelineId(v);
                setStageId('');
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
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

          {/* Stage */}
          <div>
            <Label>스테이지</Label>
            <Select value={stageId} onValueChange={setStageId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="스테이지 선택" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.probability}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact */}
          <div>
            <Label>연락처</Label>
            <Select value={contactId} onValueChange={setContactId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company */}
          <div>
            <Label>회사</Label>
            <Select value={companyId || '_none'} onValueChange={(v) => setCompanyId(v === '_none' ? '' : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="회사 선택 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">없음</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To */}
          <div>
            <Label>담당자</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="w-full">
                <SelectValue />
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
        </div>
      </CardContent>
    </Card>
  );
}
