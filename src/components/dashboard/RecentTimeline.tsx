'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RecentDealChange } from '@/services/dashboard.service';
import { formatDateTime, formatCurrency } from '@/lib/utils';

interface RecentTimelineProps {
  data: RecentDealChange[];
}

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  open: { label: '진행 중', variant: 'default' },
  won: { label: '성사', variant: 'secondary' },
  lost: { label: '실패', variant: 'destructive' },
};

export default function RecentTimeline({ data }: RecentTimelineProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">최근 딜 변경</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            최근 변경 내역이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">최근 딜 변경</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

          <div className="flex flex-col gap-4">
            {data.map((item) => {
              const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.open;
              return (
                <div key={item.dealId + item.updatedAt} className="relative pl-8">
                  {/* Dot */}
                  <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {item.dealTitle}
                      </span>
                      <Badge variant={badge.variant} className="text-xs shrink-0">
                        {badge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.stageName}</span>
                      <span>{formatCurrency(item.value, 'KRW')}</span>
                      <span className="ml-auto">{formatDateTime(item.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
