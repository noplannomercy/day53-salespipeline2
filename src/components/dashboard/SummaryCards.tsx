'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Briefcase, DollarSign } from 'lucide-react';
import type { DashboardData } from '@/services/dashboard.service';
import { formatCurrency } from '@/lib/utils';

interface SummaryCardsProps {
  data: DashboardData;
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            진행 중 딜
          </CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalOpenDeals}</div>
          <p className="text-xs text-muted-foreground mt-1">
            총 {formatCurrency(data.totalOpenValue, 'KRW')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            이번 달 성사
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {data.monthlySummary.wonCount}건
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(data.monthlySummary.wonValue, 'KRW')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            이번 달 실패
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {data.monthlySummary.lostCount}건
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            파이프라인
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.pipelineSummaries.length}</div>
          <div className="flex flex-col gap-1 mt-2">
            {data.pipelineSummaries.map((p) => (
              <div key={p.pipelineId} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">{p.pipelineName}</span>
                <span className="font-medium">{p.dealCount}건</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
