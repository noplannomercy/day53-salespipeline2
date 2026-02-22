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
import type { MemberPerformanceStat } from '@/services/report.service';
import * as reportService from '@/services/report.service';

export default function MemberPerformanceReport() {
  const [data, setData] = useState<MemberPerformanceStat[]>([]);

  useEffect(() => {
    setData(reportService.getMemberPerformance());
  }, []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        멤버 성과 데이터가 없습니다.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    winRate: d.totalCount > 0 ? Math.round((d.wonCount / d.totalCount) * 100) : 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">멤버별 딜 성사율</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="memberName" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
            <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" />
            <Tooltip
              formatter={(value, name) => {
                const v = Number(value ?? 0);
                const n = String(name ?? '');
                if (n === '성사율') return [`${v}%`, n];
                return [v, n];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="winRate" name="성사율" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="activityCount" name="활동 수" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-3 font-medium">멤버</th>
              <th className="text-right p-3 font-medium">성사</th>
              <th className="text-right p-3 font-medium">전체 딜</th>
              <th className="text-right p-3 font-medium">성사율</th>
              <th className="text-right p-3 font-medium">활동 수</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.memberId} className="border-t">
                <td className="p-3">{row.memberName}</td>
                <td className="p-3 text-right">{row.wonCount}</td>
                <td className="p-3 text-right">{row.totalCount}</td>
                <td className="p-3 text-right">{row.winRate}%</td>
                <td className="p-3 text-right">{row.activityCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
