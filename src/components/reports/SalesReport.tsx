'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SalesStat } from '@/services/report.service';
import * as reportService from '@/services/report.service';
import { formatCurrency } from '@/lib/utils';

export default function SalesReport() {
  const [data, setData] = useState<SalesStat[]>([]);

  useEffect(() => {
    setData(reportService.getSalesStats());
  }, []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        영업 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">월별 영업 성과 (최근 12개월)</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" stroke="#10B981" />
            <YAxis yAxisId="right" orientation="right" stroke="#EF4444" />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const n = String(name ?? '');
                if (n === '성사 금액') return [formatCurrency(v, 'KRW'), n];
                return [v, n];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="wonValue"
              name="성사 금액"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="lostCount"
              name="실패 건수"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
