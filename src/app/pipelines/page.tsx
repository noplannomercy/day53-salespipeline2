'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import PipelineForm from '@/components/pipelines/PipelineForm';
import StageForm from '@/components/pipelines/StageForm';
import StageList from '@/components/pipelines/StageList';
import * as pipelineService from '@/services/pipeline.service';
import * as stageService from '@/services/stage.service';
import type { Pipeline, Stage } from '@/types/index';

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);

  // Pipeline modal state
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);

  // Stage modal state
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  // Delete confirmation state
  const [deletePipelineTarget, setDeletePipelineTarget] = useState<Pipeline | null>(null);
  const [deleteStageTarget, setDeleteStageTarget] = useState<Stage | null>(null);

  const loadPipelines = useCallback(() => {
    const data = pipelineService.getPipelines();
    setPipelines(data);
    // Auto-select the first pipeline if none is selected
    if (!selectedPipelineId && data.length > 0) {
      setSelectedPipelineId(data[0].id);
    }
  }, [selectedPipelineId]);

  const loadStages = useCallback(() => {
    if (selectedPipelineId) {
      setStages(stageService.getStages(selectedPipelineId));
    } else {
      setStages([]);
    }
  }, [selectedPipelineId]);

  useEffect(() => {
    loadPipelines();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadStages();
  }, [loadStages]);

  // --- Pipeline CRUD handlers ---

  function handleCreatePipeline() {
    setEditingPipeline(null);
    setPipelineModalOpen(true);
  }

  function handleEditPipeline(pipeline: Pipeline) {
    setEditingPipeline(pipeline);
    setPipelineModalOpen(true);
  }

  function handlePipelineSubmit(data: { name: string; description: string; isDefault: boolean }) {
    if (editingPipeline) {
      pipelineService.updatePipeline(editingPipeline.id, data);
    } else {
      const created = pipelineService.createPipeline(data);
      setSelectedPipelineId(created.id);
    }
    setPipelineModalOpen(false);
    setEditingPipeline(null);
    setPipelines(pipelineService.getPipelines());
  }

  function handleDeletePipeline() {
    if (!deletePipelineTarget) return;
    pipelineService.deletePipeline(deletePipelineTarget.id);
    setDeletePipelineTarget(null);
    if (selectedPipelineId === deletePipelineTarget.id) {
      setSelectedPipelineId(null);
    }
    const updated = pipelineService.getPipelines();
    setPipelines(updated);
    if (updated.length > 0 && !updated.find((p) => p.id === selectedPipelineId)) {
      setSelectedPipelineId(updated[0].id);
    }
  }

  // --- Stage CRUD handlers ---

  function handleCreateStage() {
    setEditingStage(null);
    setStageModalOpen(true);
  }

  function handleEditStage(stage: Stage) {
    setEditingStage(stage);
    setStageModalOpen(true);
  }

  function handleStageSubmit(data: { name: string; color: string; probability: number }) {
    if (!selectedPipelineId) return;
    if (editingStage) {
      stageService.updateStage(editingStage.id, data);
    } else {
      stageService.createStage({
        pipelineId: selectedPipelineId,
        name: data.name,
        color: data.color,
        probability: data.probability,
        order: stages.length + 1,
      });
    }
    setStageModalOpen(false);
    setEditingStage(null);
    loadStages();
  }

  function handleDeleteStage() {
    if (!deleteStageTarget) return;
    stageService.deleteStage(deleteStageTarget.id);
    setDeleteStageTarget(null);
    loadStages();
  }

  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId) ?? null;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">파이프라인 관리</h1>
        <Button onClick={handleCreatePipeline}>
          <Plus className="mr-2 h-4 w-4" />
          파이프라인 추가
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline list */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {pipelines.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p className="text-sm">파이프라인이 없습니다.</p>
                <p className="text-sm">새 파이프라인을 추가해주세요.</p>
              </CardContent>
            </Card>
          ) : (
            pipelines.map((pipeline) => (
              <Card
                key={pipeline.id}
                className={`cursor-pointer transition-colors hover:border-primary ${
                  selectedPipelineId === pipeline.id
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => setSelectedPipelineId(pipeline.id)}
              >
                <CardContent className="flex items-center gap-3 py-3 px-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {pipeline.name}
                      </span>
                      {pipeline.isDefault && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          <Star className="mr-1 h-3 w-3" />
                          기본
                        </Badge>
                      )}
                    </div>
                    {pipeline.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {pipeline.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPipeline(pipeline);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletePipelineTarget(pipeline);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Stage management */}
        <div className="lg:col-span-2">
          {selectedPipeline ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">
                  {selectedPipeline.name} - 스테이지
                </CardTitle>
                <Button size="sm" onClick={handleCreateStage}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  스테이지 추가
                </Button>
              </CardHeader>
              <CardContent>
                <StageList
                  stages={stages}
                  onEdit={handleEditStage}
                  onDelete={(stage) => setDeleteStageTarget(stage)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p className="text-sm">
                  왼쪽에서 파이프라인을 선택하면 스테이지를 관리할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Pipeline form modal */}
      <Modal
        isOpen={pipelineModalOpen}
        onClose={() => {
          setPipelineModalOpen(false);
          setEditingPipeline(null);
        }}
        title={editingPipeline ? '파이프라인 수정' : '파이프라인 생성'}
      >
        <PipelineForm
          pipeline={editingPipeline}
          onSubmit={handlePipelineSubmit}
          onCancel={() => {
            setPipelineModalOpen(false);
            setEditingPipeline(null);
          }}
        />
      </Modal>

      {/* Stage form modal */}
      <Modal
        isOpen={stageModalOpen}
        onClose={() => {
          setStageModalOpen(false);
          setEditingStage(null);
        }}
        title={editingStage ? '스테이지 수정' : '스테이지 추가'}
      >
        <StageForm
          stage={editingStage}
          onSubmit={handleStageSubmit}
          onCancel={() => {
            setStageModalOpen(false);
            setEditingStage(null);
          }}
        />
      </Modal>

      {/* Pipeline delete confirmation */}
      <ConfirmDialog
        isOpen={!!deletePipelineTarget}
        title="파이프라인 삭제"
        message={`"${deletePipelineTarget?.name}" 파이프라인과 포함된 모든 스테이지가 삭제됩니다. 계속하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={handleDeletePipeline}
        onCancel={() => setDeletePipelineTarget(null)}
      />

      {/* Stage delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteStageTarget}
        title="스테이지 삭제"
        message={`"${deleteStageTarget?.name}" 스테이지를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={handleDeleteStage}
        onCancel={() => setDeleteStageTarget(null)}
      />
    </div>
  );
}
