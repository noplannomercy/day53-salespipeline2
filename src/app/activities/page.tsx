'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, List, CalendarDays } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ActivityForm from '@/components/activities/ActivityForm';
import ActivityList from '@/components/activities/ActivityList';
import ActivityCalendar from '@/components/activities/ActivityCalendar';
import type { Activity, ActivityFilters, Member } from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import { initSeedData } from '@/lib/seed';
import * as storage from '@/lib/storage';
import * as activityService from '@/services/activity.service';

type ViewMode = 'list' | 'calendar';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [members, setMembers] = useState<Member[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Activity | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    initSeedData();
    setActivities(activityService.getActivities(filters));
  }, [filters]);

  useEffect(() => {
    initSeedData();
    setMembers(storage.getAll<Member>(STORAGE_KEYS.MEMBERS));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function handleEdit(activity: Activity) {
    setEditTarget(activity);
    setModalOpen(true);
  }

  function handleSave(data: Omit<Activity, 'id' | 'createdAt'>) {
    if (editTarget) {
      activityService.updateActivity(editTarget.id, data);
    } else {
      activityService.createActivity(data);
    }
    setModalOpen(false);
    setEditTarget(null);
    loadData();
  }

  function handleToggle(id: string) {
    activityService.toggleActivityComplete(id);
    loadData();
  }

  function handleDeleteConfirm() {
    if (deleteTargetId) {
      activityService.deleteActivity(deleteTargetId);
      setDeleteTargetId(null);
      loadData();
    }
  }

  const completedFilter = filters.isCompleted;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">활동 관리</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-1" />
              리스트
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              캘린더
            </Button>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            새 활동
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={filters.assignedTo ?? '__all__'}
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              assignedTo: v === '__all__' ? undefined : v,
            }))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="담당자 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">담당자 전체</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={
            completedFilter === undefined
              ? '__all__'
              : completedFilter
                ? 'completed'
                : 'pending'
          }
          onValueChange={(v) =>
            setFilters((prev) => ({
              ...prev,
              isCompleted:
                v === '__all__' ? undefined : v === 'completed',
            }))
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="상태 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">상태 전체</SelectItem>
            <SelectItem value="pending">미완료</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View */}
      {viewMode === 'list' ? (
        <ActivityList
          activities={activities}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={setDeleteTargetId}
        />
      ) : (
        <ActivityCalendar activities={activities} />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        title={editTarget ? '활동 수정' : '새 활동'}
      >
        <ActivityForm
          activity={editTarget ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditTarget(null);
          }}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="활동 삭제"
        message="이 활동을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
