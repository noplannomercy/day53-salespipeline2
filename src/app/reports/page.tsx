'use client';

import { useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Activity, Target, Users } from 'lucide-react';
import { initSeedData } from '@/lib/seed';
import PipelineReport from '@/components/reports/PipelineReport';
import SalesReport from '@/components/reports/SalesReport';
import ActivityReport from '@/components/reports/ActivityReport';
import ForecastReport from '@/components/reports/ForecastReport';
import LeadSourceReport from '@/components/reports/LeadSourceReport';

export default function ReportsPage() {
  useEffect(() => {
    initSeedData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">보고서</h1>

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">
            <BarChart3 className="h-4 w-4 mr-1" />
            파이프라인
          </TabsTrigger>
          <TabsTrigger value="sales">
            <TrendingUp className="h-4 w-4 mr-1" />
            영업
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-1" />
            활동
          </TabsTrigger>
          <TabsTrigger value="forecast">
            <Target className="h-4 w-4 mr-1" />
            예측
          </TabsTrigger>
          <TabsTrigger value="leadsource">
            <Users className="h-4 w-4 mr-1" />
            리드소스
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <PipelineReport />
        </TabsContent>
        <TabsContent value="sales">
          <SalesReport />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityReport />
        </TabsContent>
        <TabsContent value="forecast">
          <ForecastReport />
        </TabsContent>
        <TabsContent value="leadsource">
          <LeadSourceReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
