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
import type { PipelineFunnelDatum } from '@/services/report.service';
import * as reportService from '@/services/report.service';
import { formatCurrency } from '@/lib/utils';

export default function FunnelReport() {
  const [data, setData] = useState<PipelineFunnelDatum[]>([]);

  useEffect(() => {
    setData(reportService.getPipelineFunnelData());
  }, []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        파이프라인 퍼널 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">스테이지별 전환 퍼널</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stageName" type="category" tick={{ fontSize: 12 }} width={70} />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const n = String(name ?? '');
                if (n === '총 금액') return [formatCurrency(v, 'KRW'), n];
                return [v, n];
              }}
            />
            <Legend />
            <Bar dataKey="dealCount" name="딜 수" fill="#6366F1" radius={[0, 4, 4, 0]} />
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
                <td className="p-3 text-right">{row.dealCount}</td>
                <td className="p-3 text-right">{formatCurrency(row.totalValue, 'KRW')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
