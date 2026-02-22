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
import type { WeightedStageData } from '@/services/report.service';
import * as reportService from '@/services/report.service';
import { formatCurrency } from '@/lib/utils';

export default function ForecastReport() {
  const [data, setData] = useState<WeightedStageData[]>([]);

  useEffect(() => {
    setData(reportService.getWeightedPipelineValue());
  }, []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        예측 데이터가 없습니다.
      </p>
    );
  }

  const totalRaw = data.reduce((sum, d) => sum + d.rawValue, 0);
  const totalWeighted = data.reduce((sum, d) => sum + d.weightedValue, 0);
  const totalDeals = data.reduce((sum, d) => sum + d.dealCount, 0);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">가중 파이프라인 가치</h3>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">총 파이프라인 가치</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalRaw, 'KRW')}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">가중 예측 합계</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{formatCurrency(totalWeighted, 'KRW')}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">진행 중인 딜</p>
          <p className="text-2xl font-bold mt-1">{totalDeals}건</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stageName" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(Number(value ?? 0), 'KRW'),
                String(name ?? ''),
              ]}
              labelFormatter={(label) => {
                const labelStr = String(label ?? '');
                const item = data.find((d) => d.stageName === labelStr);
                return item ? `${labelStr} (확률: ${item.probability}%, 딜: ${item.dealCount}건)` : labelStr;
              }}
            />
            <Legend />
            <Bar dataKey="rawValue" name="원래 금액" fill="#94A3B8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="weightedValue" name="가중 금액" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">스테이지</th>
              <th className="text-right p-3 font-medium">확률</th>
              <th className="text-right p-3 font-medium">딜 수</th>
              <th className="text-right p-3 font-medium">원래 금액</th>
              <th className="text-right p-3 font-medium">가중 금액</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.stageId} className="border-t">
                <td className="p-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: row.stageColor }}
                    />
                    {row.stageName}
                  </span>
                </td>
                <td className="p-3 text-right">{row.probability}%</td>
                <td className="p-3 text-right">{row.dealCount}</td>
                <td className="p-3 text-right">{formatCurrency(row.rawValue, 'KRW')}</td>
                <td className="p-3 text-right font-medium text-green-600">
                  {formatCurrency(row.weightedValue, 'KRW')}
                </td>
              </tr>
            ))}
            <tr className="border-t bg-muted/50 font-semibold">
              <td className="p-3">합계</td>
              <td className="p-3 text-right">-</td>
              <td className="p-3 text-right">{totalDeals}</td>
              <td className="p-3 text-right">{formatCurrency(totalRaw, 'KRW')}</td>
              <td className="p-3 text-right text-green-600">
                {formatCurrency(totalWeighted, 'KRW')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
