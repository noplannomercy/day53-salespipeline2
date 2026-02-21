'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Pencil } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ContactForm from '@/components/contacts/ContactForm';
import type { ContactWithRelations } from '@/types/index';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import * as contactService from '@/services/contact.service';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [contact, setContact] = useState<ContactWithRelations | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const loadData = useCallback(() => {
    const data = contactService.getContactById(contactId);
    setContact(data);
  }, [contactId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <p className="text-muted-foreground">연락처를 찾을 수 없습니다.</p>
        <Button variant="outline" onClick={() => router.push('/contacts')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/contacts')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          목록
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{contact.name}</h1>
          <p className="text-sm text-muted-foreground">{contact.position}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-1 h-4 w-4" />
          편집
        </Button>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">정보</TabsTrigger>
          <TabsTrigger value="deals">딜 ({contact.deals.length})</TabsTrigger>
          <TabsTrigger value="activities">활동 ({contact.activities.length})</TabsTrigger>
          <TabsTrigger value="notes">노트 ({contact.notes.length})</TabsTrigger>
          <TabsTrigger value="emails">이메일 ({contact.emails.length})</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">연락처 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">이메일</dt>
                  <dd className="font-medium">{contact.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">전화번호</dt>
                  <dd className="font-medium">{contact.phone || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">소속 회사</dt>
                  <dd className="font-medium">{contact.company?.name ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">직책</dt>
                  <dd className="font-medium">{contact.position || '-'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">생성일</dt>
                  <dd className="font-medium">{formatDate(contact.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">수정일</dt>
                  <dd className="font-medium">{formatDate(contact.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">연결된 딜</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">연결된 딜이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {contact.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/deals/${deal.id}`)}
                    >
                      <div>
                        <p className="font-medium">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(deal.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(deal.value, deal.currency)}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            deal.status === 'won'
                              ? 'bg-green-100 text-green-700'
                              : deal.status === 'lost'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {deal.status === 'won'
                            ? '성사'
                            : deal.status === 'lost'
                              ? '실패'
                              : '진행 중'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">활동 이력</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 활동이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {contact.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                        {activity.dueDate && (
                          <span>{formatDate(activity.dueDate)}</span>
                        )}
                        {activity.isCompleted && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            완료
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">노트</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 노트가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {contact.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-md border p-3 text-sm"
                    >
                      <p className="whitespace-pre-wrap">{note.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateTime(note.createdAt)}
                      </p>
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
            <CardHeader>
              <CardTitle className="text-base">이메일</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.emails.length === 0 ? (
                <p className="text-sm text-muted-foreground">등록된 이메일이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {contact.emails.map((email) => (
                    <div
                      key={email.id}
                      className="rounded-md border p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{email.subject}</p>
                        <Badge variant="outline" className="text-xs">
                          {email.status === 'sent'
                            ? '발송'
                            : email.status === 'draft'
                              ? '임시저장'
                              : '예약'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        To: {email.to}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(email.sentAt ?? email.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="연락처 수정"
      >
        <ContactForm
          editId={contactId}
          onClose={() => setEditOpen(false)}
          onSaved={loadData}
        />
      </Modal>
    </div>
  );
}
