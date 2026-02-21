'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Trophy,
  XCircle,
  Plus,
  Send,
  Trash2,
  Paperclip,
  TagIcon,
  Clock,
} from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import StageProgress from '@/components/deals/StageProgress';
import DealDetail from '@/components/deals/DealDetail';
import ActivityList from '@/components/activities/ActivityList';
import ActivityForm from '@/components/activities/ActivityForm';
import EmailList from '@/components/emails/EmailList';
import EmailForm from '@/components/emails/EmailForm';
import type {
  DealWithRelations,
  Stage,
  Activity,
  Note,
  Email,
  Attachment,
  Tag,
  Member,
} from '@/types/index';
import { STORAGE_KEYS } from '@/types/index';
import { formatDate, formatDateTime } from '@/lib/utils';
import * as storage from '@/lib/storage';
import * as dealService from '@/services/deal.service';
import * as stageService from '@/services/stage.service';
import * as activityService from '@/services/activity.service';
import * as noteService from '@/services/note.service';
import * as emailService from '@/services/email.service';
import * as attachmentService from '@/services/attachment.service';
import * as tagService from '@/services/tag.service';

/**
 * Deal detail page with StageProgress bar and 7-tab layout.
 * Tabs: Info | Activity | Notes | Email | Attachments | Tags | Timeline
 */
export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deal, setDeal] = useState<DealWithRelations | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [wonConfirmOpen, setWonConfirmOpen] = useState(false);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');

  // Activity tab state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | undefined>(undefined);

  // Note tab state
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  // Email tab state
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [editEmailId, setEditEmailId] = useState<string | null>(null);

  // Attachment tab state
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Tag tab state
  const [dealTags, setDealTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState('');

  const loadData = useCallback(() => {
    const data = dealService.getDealById(dealId);
    setDeal(data);
    if (data) {
      setStages(stageService.getStages(data.pipelineId));
    }

    // Load tab data
    setActivities(activityService.getActivities({ dealId }));
    setNotes(noteService.getNotes({ dealId }));
    setEmails(emailService.getEmails({ dealId }));
    setAttachments(attachmentService.getAttachments({ entityType: 'deal', entityId: dealId }));
    setDealTags(tagService.getEntityTags('deal', dealId));
    setAllTags(tagService.getTags());
  }, [dealId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Stage & Status Handlers ─────────────────

  function handleStageClick(stageId: string) {
    if (!deal || deal.status !== 'open') return;
    dealService.moveDealToStage(deal.id, stageId);
    loadData();
  }

  function handleWon() {
    if (!deal) return;
    dealService.closeDeal(deal.id, 'won');
    setWonConfirmOpen(false);
    loadData();
  }

  function handleLost() {
    if (!deal || !lostReason.trim()) return;
    dealService.closeDeal(deal.id, 'lost', lostReason.trim());
    setLostDialogOpen(false);
    setLostReason('');
    loadData();
  }

  function handleReopenDeal() {
    if (!deal) return;
    dealService.updateDeal(deal.id, { status: 'open', lostReason: '' });
    loadData();
  }

  // ─── Activity Handlers ───────────────────────

  function handleActivitySave(data: Omit<Activity, 'id' | 'createdAt'>) {
    // Ensure dealId is attached
    const withDeal = { ...data, dealId };
    if (editActivity) {
      activityService.updateActivity(editActivity.id, withDeal);
    } else {
      activityService.createActivity(withDeal);
    }
    setActivityModalOpen(false);
    setEditActivity(undefined);
    loadData();
  }

  function handleActivityToggle(id: string) {
    activityService.toggleActivityComplete(id);
    loadData();
  }

  function handleActivityDelete(id: string) {
    activityService.deleteActivity(id);
    loadData();
  }

  // ─── Note Handlers ───────────────────────────

  function handleNoteCreate() {
    if (!newNoteContent.trim()) return;
    const members = storage.getAll<Member>(STORAGE_KEYS.MEMBERS);
    const firstMember = members[0];
    noteService.createNote({
      dealId,
      contactId: null,
      companyId: null,
      content: newNoteContent.trim(),
      createdBy: firstMember?.id ?? '',
    });
    setNewNoteContent('');
    loadData();
  }

  function handleNoteUpdate(id: string) {
    if (!editNoteContent.trim()) return;
    noteService.updateNote(id, { content: editNoteContent.trim() });
    setEditNoteId(null);
    setEditNoteContent('');
    loadData();
  }

  function handleNoteDelete(id: string) {
    noteService.deleteNote(id);
    loadData();
  }

  // ─── Email Handlers ──────────────────────────

  function handleEmailSend(id: string) {
    emailService.sendEmail(id);
    loadData();
  }

  function handleEmailDelete(email: Email) {
    emailService.deleteEmail(email.id);
    loadData();
  }

  // ─── Attachment Handlers ─────────────────────

  function handleAttachmentDelete(id: string) {
    attachmentService.deleteAttachment(id);
    loadData();
  }

  // ─── Tag Handlers ────────────────────────────

  function handleAddTag() {
    if (!selectedTagId) return;
    tagService.addTagToEntity('deal', dealId, selectedTagId);
    setSelectedTagId('');
    loadData();
  }

  function handleRemoveTag(tagId: string) {
    tagService.removeTagFromEntity('deal', dealId, tagId);
    loadData();
  }

  // ─── Timeline ────────────────────────────────

  type TimelineItem = {
    id: string;
    type: 'activity' | 'note' | 'email';
    title: string;
    description: string;
    createdAt: string;
  };

  function getTimelineItems(): TimelineItem[] {
    const items: TimelineItem[] = [];

    for (const a of activities) {
      items.push({
        id: a.id,
        type: 'activity',
        title: a.title,
        description: `[${a.type}] ${a.description || ''}`,
        createdAt: a.createdAt,
      });
    }

    for (const n of notes) {
      items.push({
        id: n.id,
        type: 'note',
        title: '노트',
        description: n.content.length > 100 ? n.content.slice(0, 100) + '...' : n.content,
        createdAt: n.createdAt,
      });
    }

    for (const e of emails) {
      items.push({
        id: e.id,
        type: 'email',
        title: e.subject,
        description: `To: ${e.to} (${e.status})`,
        createdAt: e.sentAt ?? e.createdAt,
      });
    }

    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return items;
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-muted-foreground">딜을 찾을 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push('/deals')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const availableTags = allTags.filter(
    (t) => !dealTags.some((dt) => dt.id === t.id),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => router.push('/deals')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          목록
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold truncate">{deal.title}</h1>
            <StatusBadge status={deal.status} type="deal" />
          </div>
          <p className="text-sm text-muted-foreground">
            {deal.pipeline?.name} &middot; {deal.stage?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {deal.status === 'open' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                onClick={() => setWonConfirmOpen(true)}
              >
                <Trophy className="mr-1 h-4 w-4" />
                Won
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => setLostDialogOpen(true)}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Lost
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={handleReopenDeal}>
              다시 열기
            </Button>
          )}
        </div>
      </div>

      {/* Stage Progress Bar */}
      {stages.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-2">
            <StageProgress
              stages={stages}
              currentStageId={deal.stageId}
              onStageClick={handleStageClick}
              disabled={deal.status !== 'open'}
            />
          </CardContent>
        </Card>
      )}

      {/* 7-Tab Layout */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">정보</TabsTrigger>
          <TabsTrigger value="activities">활동</TabsTrigger>
          <TabsTrigger value="notes">노트</TabsTrigger>
          <TabsTrigger value="emails">이메일</TabsTrigger>
          <TabsTrigger value="attachments">첨부파일</TabsTrigger>
          <TabsTrigger value="tags">태그</TabsTrigger>
          <TabsTrigger value="timeline">타임라인</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info">
          <DealDetail deal={deal} onUpdated={loadData} />
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">활동</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setEditActivity(undefined);
                  setActivityModalOpen(true);
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                활동 추가
              </Button>
            </CardHeader>
            <CardContent>
              <ActivityList
                activities={activities}
                onToggle={handleActivityToggle}
                onEdit={(a) => {
                  setEditActivity(a);
                  setActivityModalOpen(true);
                }}
                onDelete={handleActivityDelete}
              />
            </CardContent>
          </Card>

          <Modal
            isOpen={activityModalOpen}
            onClose={() => {
              setActivityModalOpen(false);
              setEditActivity(undefined);
            }}
            title={editActivity ? '활동 수정' : '활동 추가'}
          >
            <ActivityForm
              activity={editActivity}
              onSave={handleActivitySave}
              onClose={() => {
                setActivityModalOpen(false);
                setEditActivity(undefined);
              }}
            />
          </Modal>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">노트</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* New note input */}
              <div className="flex gap-2">
                <textarea
                  className="flex-1 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="새 노트를 입력하세요..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!newNoteContent.trim()}
                  onClick={handleNoteCreate}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  노트 추가
                </Button>
              </div>

              {/* Note list */}
              {notes.length === 0 ? (
                <EmptyState message="등록된 노트가 없습니다." />
              ) : (
                <div className="flex flex-col gap-3">
                  {notes
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .map((note) => (
                      <div key={note.id} className="rounded-lg border p-3">
                        {editNoteId === note.id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={editNoteContent}
                              onChange={(e) => setEditNoteContent(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditNoteId(null)}
                              >
                                취소
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleNoteUpdate(note.id)}
                              >
                                저장
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(note.createdAt)}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setEditNoteId(note.id);
                                    setEditNoteContent(note.content);
                                  }}
                                >
                                  편집
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleNoteDelete(note.id)}
                                >
                                  삭제
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">이메일</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setEditEmailId(null);
                  setEmailModalOpen(true);
                }}
              >
                <Plus className="mr-1 h-4 w-4" />
                이메일 작성
              </Button>
            </CardHeader>
            <CardContent>
              <EmailList
                emails={emails}
                onEdit={(e) => {
                  setEditEmailId(e.id);
                  setEmailModalOpen(true);
                }}
                onDelete={handleEmailDelete}
                onSend={handleEmailSend}
              />
            </CardContent>
          </Card>

          <Modal
            isOpen={emailModalOpen}
            onClose={() => {
              setEmailModalOpen(false);
              setEditEmailId(null);
            }}
            title={editEmailId ? '이메일 수정' : '이메일 작성'}
            maxWidth="max-w-2xl"
          >
            <EmailForm
              editId={editEmailId}
              onClose={() => {
                setEmailModalOpen(false);
                setEditEmailId(null);
              }}
              onSaved={loadData}
            />
          </Modal>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">첨부파일</CardTitle>
            </CardHeader>
            <CardContent>
              {attachments.length === 0 ? (
                <EmptyState message="첨부파일이 없습니다." />
              ) : (
                <div className="flex flex-col gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {att.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {att.fileType} &middot;{' '}
                          {att.fileSize >= 1048576
                            ? `${(att.fileSize / 1048576).toFixed(1)} MB`
                            : `${(att.fileSize / 1024).toFixed(1)} KB`}
                          &middot; {formatDate(att.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0"
                        onClick={() => handleAttachmentDelete(att.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">태그</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* Add tag */}
              <div className="flex items-center gap-2">
                <Select value={selectedTagId || '__none__'} onValueChange={(v) => setSelectedTagId(v === '__none__' ? '' : v)}>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="태그 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">태그 선택</SelectItem>
                    {availableTags.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!selectedTagId}
                  onClick={handleAddTag}
                >
                  <TagIcon className="mr-1 h-4 w-4" />
                  추가
                </Button>
              </div>

              {/* Current tags */}
              {dealTags.length === 0 ? (
                <EmptyState message="연결된 태그가 없습니다." />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dealTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-sm py-1 px-3 gap-2"
                      style={{ borderLeft: `3px solid ${tag.color}` }}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full inline-block"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                      <button
                        className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => handleRemoveTag(tag.id)}
                      >
                        &times;
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">타임라인</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const items = getTimelineItems();
                if (items.length === 0) {
                  return <EmptyState message="타임라인에 표시할 항목이 없습니다." />;
                }

                const TYPE_LABELS: Record<string, string> = {
                  activity: '활동',
                  note: '노트',
                  email: '이메일',
                };

                const TYPE_COLORS: Record<string, string> = {
                  activity: 'bg-blue-500',
                  note: 'bg-yellow-500',
                  email: 'bg-green-500',
                };

                return (
                  <div className="relative pl-6">
                    <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border" />
                    <div className="flex flex-col gap-4">
                      {items.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="relative flex gap-3">
                          <div
                            className={`absolute -left-3.5 top-1.5 h-2.5 w-2.5 rounded-full ${TYPE_COLORS[item.type]}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs shrink-0">
                                {TYPE_LABELS[item.type]}
                              </Badge>
                              <span className="font-medium text-sm truncate">
                                {item.title}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateTime(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Won Confirm Dialog */}
      <ConfirmDialog
        isOpen={wonConfirmOpen}
        message={`"${deal.title}" 딜을 성사(Won)로 전환하시겠습니까?`}
        onConfirm={handleWon}
        onCancel={() => setWonConfirmOpen(false)}
      />

      {/* Lost Dialog — includes reason input */}
      {lostDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setLostDialogOpen(false)}
          />
          <div className="relative z-10 bg-background border rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2">딜 실패 처리</h3>
            <p className="text-sm text-muted-foreground mb-4">
              &quot;{deal.title}&quot; 딜을 실패(Lost)로 전환합니다. 실패 사유를 입력하세요.
            </p>
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="실패 사유를 입력하세요..."
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLostDialogOpen(false);
                  setLostReason('');
                }}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!lostReason.trim()}
                onClick={handleLost}
              >
                실패 처리
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
