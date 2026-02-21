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
import type { PipelineStat } from '@/services/report.service';
import * as reportService from '@/services/report.service';
import { formatCurrency } from '@/lib/utils';

export default function PipelineReport() {
  const [data, setData] = useState<PipelineStat[]>([]);

  useEffect(() => {
    setData(reportService.getPipelineStats());
  }, []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        파이프라인 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">스테이지별 딜 현황</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stageName" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const n = String(name ?? '');
                if (n === '금액') return [formatCurrency(v, 'KRW'), n];
                return [v, n];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="count" name="딜 수" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="totalValue" name="금액" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">스테이지</th>
              <th className="text-right p-3 font-medium">딜 수</th>
              <th className="text-right p-3 font-medium">총 금액</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.stageId} className="border-t">
                <td className="p-3">{row.stageName}</td>
                <td className="p-3 text-right">{row.count}</td>
                <td className="p-3 text-right">{formatCurrency(row.totalValue, 'KRW')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
