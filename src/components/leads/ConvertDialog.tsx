'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
import type { Pipeline, Stage } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import * as storage from '@/lib/storage';
import * as leadService from '@/services/lead.service';

interface ConvertDialogProps {
  isOpen: boolean;
  leadId: string | null;
  onClose: () => void;
  onConverted: () => void;
}

export default function ConvertDialog({
  isOpen,
  leadId,
  onClose,
  onConverted,
}: ConvertDialogProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState('');
  const [dealTitle, setDealTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      const allPipelines = storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
      setPipelines(allPipelines);

      // Auto-select the default pipeline if available
      const defaultPipeline = allPipelines.find((p) => p.isDefault);
      if (defaultPipeline) {
        setSelectedPipelineId(defaultPipeline.id);
      } else if (allPipelines.length > 0) {
        setSelectedPipelineId(allPipelines[0].id);
      }
    }
  }, [isOpen]);

  // Load stages when pipeline changes
  useEffect(() => {
    if (selectedPipelineId) {
      const pipelineStages = leadService.getStagesByPipeline(selectedPipelineId);
      setStages(pipelineStages);
      if (pipelineStages.length > 0) {
        setSelectedStageId(pipelineStages[0].id);
      } else {
        setSelectedStageId('');
      }
    } else {
      setStages([]);
      setSelectedStageId('');
    }
  }, [selectedPipelineId]);

  function handleConvert() {
    if (!leadId || !selectedPipelineId || !selectedStageId) return;

    const deal = leadService.convertLeadToDeal(
      leadId,
      selectedPipelineId,
      selectedStageId,
      dealTitle,
    );

    if (deal) {
      setDealTitle('');
      onConverted();
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>딜로 전환</DialogTitle>
          <DialogDescription>
            이 리드를 딜로 전환합니다. 파이프라인과 시작 스테이지를 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="deal-title">딜 제목</Label>
            <Input
              id="deal-title"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              placeholder="미입력 시 자동 생성"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>파이프라인</Label>
            <Select
              value={selectedPipelineId}
              onValueChange={setSelectedPipelineId}
            >
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
            <Label>시작 스테이지</Label>
            <Select
              value={selectedStageId}
              onValueChange={setSelectedStageId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="스테이지 선택" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleConvert}
            disabled={!selectedPipelineId || !selectedStageId}
          >
            전환
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
