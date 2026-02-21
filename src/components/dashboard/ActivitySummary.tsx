'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { ActivityWeekSummary } from '@/services/dashboard.service';

interface ActivitySummaryProps {
  data: ActivityWeekSummary;
}

export default function ActivitySummary({ data }: ActivitySummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">이번 주 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">완료</p>
              <p className="text-xl font-bold">{data.completedCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">예정</p>
              <p className="text-xl font-bold">{data.pendingCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">기한 초과</p>
              <p className="text-xl font-bold text-red-600">{data.overdueCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
