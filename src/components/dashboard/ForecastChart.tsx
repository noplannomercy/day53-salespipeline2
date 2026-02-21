'use client';

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
import { formatCurrency } from '@/lib/utils';

interface ForecastChartProps {
  data: ForecastItem[];
}

export default function ForecastChart({ data }: ForecastChartProps) {
  if (data.length === 0) {
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

  const totalForecast = data.reduce((sum, d) => sum + d.forecastValue, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">매출 예측</CardTitle>
          <span className="text-sm text-green-600 font-semibold">
            {formatCurrency(totalForecast, 'KRW')}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stageName" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value ?? 0), 'KRW'),
                  String(name ?? ''),
                ]}
              />
              <Legend />
              <Bar dataKey="totalValue" name="딜 금액" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="forecastValue" name="예측 금액" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
