'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Pencil,
  Globe,
  Phone,
  MapPin,
  Building2,
  Users,
  Briefcase,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import CompanyForm from '@/components/companies/CompanyForm';
import * as companyService from '@/services/company.service';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { CompanyWithRelations, CompanySize } from '@/types/index';

const SIZE_LABELS: Record<string, string> = {
  small: '소기업',
  medium: '중기업',
  large: '대기업',
  enterprise: '엔터프라이즈',
};

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<CompanyWithRelations | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const loadCompany = useCallback(() => {
    const data = companyService.getCompanyById(companyId);
    setCompany(data);
  }, [companyId]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  function handleUpdate(data: {
    name: string;
    industry: string;
    size: CompanySize | null;
    website: string;
    phone: string;
    address: string;
    revenue: number | null;
  }) {
    companyService.updateCompany(companyId, data);
    setEditOpen(false);
    loadCompany();
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-6">
        <p>회사를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/companies')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          목록
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            {company.size && (
              <Badge variant="outline">{SIZE_LABELS[company.size] ?? company.size}</Badge>
            )}
          </div>
          {company.industry && (
            <p className="text-sm text-muted-foreground mt-0.5">{company.industry}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="mr-1 h-3.5 w-3.5" />
          편집
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {company.website && (
          <Card>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">웹사이트</p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {company.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </CardContent>
          </Card>
        )}
        {company.phone && (
          <Card>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">전화번호</p>
                <p className="text-sm truncate">{company.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {company.address && (
          <Card>
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">주소</p>
                <p className="text-sm truncate">{company.address}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">등록일</p>
              <p className="text-sm">{formatDate(company.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contacts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              소속 연락처 ({company.contacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                소속 연락처가 없습니다.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {company.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.position}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              연결된 딜 ({company.deals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {company.deals.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                연결된 딜이 없습니다.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {company.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/deals/${deal.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(deal.expectedCloseDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(deal.value, deal.currency)}
                      </p>
                      <Badge
                        variant={
                          deal.status === 'won'
                            ? 'default'
                            : deal.status === 'lost'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {deal.status === 'won'
                          ? '성사'
                          : deal.status === 'lost'
                            ? '실패'
                            : '진행중'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="회사 수정">
        <CompanyForm
          company={company}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </div>
  );
}
