'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import KanbanFilters from '@/components/kanban/KanbanFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/common/Modal';
import EmptyState from '@/components/common/EmptyState';
import type {
  Pipeline,
  Stage,
  Deal,
  Member,
  Company,
  DealPriority,
  DealFilters,
} from '@/types/index';
import * as pipelineService from '@/services/pipeline.service';
import * as stageService from '@/services/stage.service';
import * as dealService from '@/services/deal.service';
import * as memberService from '@/services/member.service';
import * as companyService from '@/services/company.service';
import * as contactService from '@/services/contact.service';
import { LayoutGrid } from 'lucide-react';

/**
 * Kanban board page. Lets the user select a pipeline, filter by
 * member/priority, and drag-and-drop deals between stages.
 */
export default function KanbanPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [stages, setStages] = useState<Stage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  // Filters
  const [filterMember, setFilterMember] = useState('_all');
  const [filterPriority, setFilterPriority] = useState('_all');

  // Modal for adding a new deal
  const [addDealStageId, setAddDealStageId] = useState<string | null>(null);

  // Load reference data once
  useEffect(() => {
    const pls = pipelineService.getPipelines();
    setPipelines(pls);
    setMembers(memberService.getMembers());
    setCompanies(companyService.getCompanies());

    // Default to the first pipeline (usually the default one)
    const defaultPipeline = pls.find((p) => p.isDefault) ?? pls[0];
    if (defaultPipeline) {
      setSelectedPipelineId(defaultPipeline.id);
    }
  }, []);

  // Load stages + deals when pipeline changes
  const loadBoard = useCallback(() => {
    if (!selectedPipelineId) return;
    setStages(stageService.getStages(selectedPipelineId));

    const filters: DealFilters = { pipelineId: selectedPipelineId };
    if (filterMember !== '_all') {
      filters.assignedTo = filterMember;
    }
    if (filterPriority !== '_all') {
      filters.priority = filterPriority as DealPriority;
    }
    setDeals(dealService.getDeals(filters));
  }, [selectedPipelineId, filterMember, filterPriority]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Build lookup maps for efficient rendering
  const membersMap = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const companyNames = useMemo(() => {
    const map = new Map<string, string>();
    companies.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [companies]);

  function handleDealDrop(dealId: string, stageId: string) {
    dealService.moveDealToStage(dealId, stageId);
    loadBoard();
  }

  function handleAddDeal(stageId: string) {
    setAddDealStageId(stageId);
  }

  function handleDealCreated() {
    setAddDealStageId(null);
    loadBoard();
  }

  if (pipelines.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">칸반 보드</h1>
        <EmptyState
          icon={LayoutGrid}
          message="파이프라인이 없습니다. 먼저 파이프라인을 생성하세요."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row: pipeline select + filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-bold">칸반 보드</h1>
        <Select value={selectedPipelineId} onValueChange={setSelectedPipelineId}>
          <SelectTrigger className="w-[200px]">
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

        <KanbanFilters
          members={members}
          selectedMemberId={filterMember}
          onMemberChange={setFilterMember}
          selectedPriority={filterPriority}
          onPriorityChange={setFilterPriority}
        />
      </div>

      {/* Board */}
      <KanbanBoard
        stages={stages}
        deals={deals}
        membersMap={membersMap}
        companyNames={companyNames}
        onDealDrop={handleDealDrop}
        onAddDeal={handleAddDeal}
      />

      {/* Add Deal Modal — uses DealForm (T3-3, built by developer-a) */}
      {addDealStageId && (
        <Modal
          isOpen={!!addDealStageId}
          onClose={() => setAddDealStageId(null)}
          title="새 딜 추가"
          maxWidth="max-w-xl"
        >
          <KanbanAddDealForm
            pipelineId={selectedPipelineId}
            stageId={addDealStageId}
            onClose={() => setAddDealStageId(null)}
            onSaved={handleDealCreated}
          />
        </Modal>
      )}
    </div>
  );
}

/**
 * Inline deal creation form for the kanban "+ 딜 추가" button.
 * Lightweight: captures just the essential fields needed to create a deal.
 * For full editing, the user can navigate to the deal detail page.
 */
function KanbanAddDealForm({
  pipelineId,
  stageId,
  onClose,
  onSaved,
}: {
  pipelineId: string;
  stageId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [value, setValue] = useState(0);
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [contacts, setContacts] = useState<{ id: string; name: string }[]>([]);
  const [companiesList, setCompaniesList] = useState<{ id: string; name: string }[]>([]);
  const [membersList, setMembersList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const c = companyService.getCompanies();
    setCompaniesList(c.map((co) => ({ id: co.id, name: co.name })));
    const ct = contactService.getContacts();
    setContacts(ct.map((co) => ({ id: co.id, name: co.name })));
    const m = memberService.getMembers();
    setMembersList(m.map((me) => ({ id: me.id, name: me.name })));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !contactId) return;

    dealService.createDeal({
      pipelineId,
      stageId,
      contactId,
      companyId: companyId || null,
      title: title.trim(),
      value,
      currency: 'KRW',
      expectedCloseDate: null,
      priority: 'medium',
      status: 'open',
      lostReason: '',
      assignedTo,
    });

    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="kanban-deal-title">딜 제목 *</Label>
        <Input
          id="kanban-deal-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="딜 제목을 입력하세요"
          required
        />
      </div>

      <div>
        <Label htmlFor="kanban-deal-value">금액 (KRW)</Label>
        <Input
          id="kanban-deal-value"
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>

      <div>
        <Label>연락처 *</Label>
        <Select value={contactId} onValueChange={setContactId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="연락처 선택" />
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

      <div>
        <Label>회사 (선택사항)</Label>
        <Select value={companyId || '_none'} onValueChange={(v) => setCompanyId(v === '_none' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="회사 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">없음</SelectItem>
            {companiesList.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>담당자</Label>
        <Select value={assignedTo || '_none'} onValueChange={(v) => setAssignedTo(v === '_none' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="담당자 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">미지정</SelectItem>
            {membersList.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          취소
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim() || !contactId}>
          생성
        </Button>
      </div>
    </form>
  );
}
