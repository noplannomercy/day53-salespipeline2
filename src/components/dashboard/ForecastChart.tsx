'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ForecastItem } from '@/services/dashboard.service';
import type { WeightedStageData } from '@/services/report.service';
import { getWeightedPipelineValue } from '@/services/report.service';
import { formatCurrency } from '@/lib/utils';

interface ForecastChartProps {
  data: ForecastItem[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
  const [weighted, setWeighted] = useState<WeightedStageData[]>([]);

  useEffect(() => {
    setWeighted(getWeightedPipelineValue());
  }, []);

  // Merge forecast data with weighted data for dual bar display
  const chartData = weighted.length > 0
    ? weighted.map((w) => ({
        stageName: w.stageName,
        rawValue: w.rawValue,
        weightedValue: w.weightedValue,
        probability: w.probability,
        dealCount: w.dealCount,
      }))
    : data.map((d) => ({
        stageName: d.stageName,
        rawValue: d.totalValue,
        weightedValue: d.forecastValue,
        probability: d.probability,
        dealCount: 0,
      }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">매출 예측</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            예측 데이터가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalRaw = chartData.reduce((sum, d) => sum + d.rawValue, 0);
  const totalWeighted = chartData.reduce((sum, d) => sum + d.weightedValue, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">가중 파이프라인 가치</CardTitle>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              원래: {formatCurrency(totalRaw, 'KRW')}
            </span>
            <span className="text-green-600 font-semibold">
              가중: {formatCurrency(totalWeighted, 'KRW')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stageName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0), 'KRW'),
                  String(name ?? ''),
                ]}
                labelFormatter={(label) => {
                  const labelStr = String(label ?? '');
                  const item = chartData.find((d) => d.stageName === labelStr);
                  return item ? `${labelStr} (확률: ${item.probability}%)` : labelStr;
                }}
              />
              <Legend />
              <Bar dataKey="rawValue" name="원래 금액" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="weightedValue" name="가중 금액" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
