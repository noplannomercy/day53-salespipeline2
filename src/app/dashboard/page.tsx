'use client';

import { useState, useEffect } from 'react';
import { initSeedData } from '@/lib/seed';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ForecastChart from '@/components/dashboard/ForecastChart';
import ActivitySummary from '@/components/dashboard/ActivitySummary';
import RecentTimeline from '@/components/dashboard/RecentTimeline';
import * as dashboardService from '@/services/dashboard.service';
import type {
  DashboardData,
  ForecastItem,
  RecentDealChange,
} from '@/services/dashboard.service';

export default function DashboardPage() {
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [recentChanges, setRecentChanges] = useState<RecentDealChange[]>([]);

  useEffect(() => {
    initSeedData();
    setDashData(dashboardService.getDashboardData());
    setForecast(dashboardService.getForecastData());
    setRecentChanges(dashboardService.getRecentDealChanges());
  }, []);

  if (!dashData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      {/* Summary cards row */}
      <SummaryCards data={dashData} />

      {/* Charts and activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ForecastChart data={forecast} />
        </div>
        <div>
          <ActivitySummary data={dashData.activitySummary} />
        </div>
      </div>

      {/* Timeline */}
      <RecentTimeline data={recentChanges} />
    </div>
  );
}
