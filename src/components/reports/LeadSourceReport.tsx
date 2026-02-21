'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { LeadSourceStat } from '@/services/report.service';
import * as reportService from '@/services/report.service';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

export default function LeadSourceReport() {
  const [data, setData] = useState<LeadSourceStat[]>([]);

  useEffect(() => {
    setData(reportService.getLeadSourceStats());
  }, []);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        리드 소스 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">리드 소스별 분석</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie chart: lead count by source */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">소스별 리드 수</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion rates table */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">소스별 전환율</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">소스</th>
                  <th className="text-right p-3 font-medium">리드 수</th>
                  <th className="text-right p-3 font-medium">전환 수</th>
                  <th className="text-right p-3 font-medium">전환율</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => {
                  const rate = row.count > 0
                    ? Math.round((row.convertedCount / row.count) * 100)
                    : 0;
                  return (
                    <tr key={row.source} className="border-t">
                      <td className="p-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {row.source}
                        </span>
                      </td>
                      <td className="p-3 text-right">{row.count}</td>
                      <td className="p-3 text-right">{row.convertedCount}</td>
                      <td className="p-3 text-right font-medium">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
