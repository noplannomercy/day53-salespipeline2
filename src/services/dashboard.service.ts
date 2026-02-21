'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type {
  Deal,
  Stage,
  Activity,
  Pipeline,
} from '@/types/index';

// ─────────────────────────────────────────────
// Dashboard data types
// ─────────────────────────────────────────────

export interface PipelineSummary {
  pipelineId: string;
  pipelineName: string;
  dealCount: number;
  totalValue: number;
}

export interface MonthlySummary {
  wonCount: number;
  wonValue: number;
  lostCount: number;
}

export interface ActivityWeekSummary {
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface DashboardData {
  pipelineSummaries: PipelineSummary[];
  monthlySummary: MonthlySummary;
  activitySummary: ActivityWeekSummary;
  totalOpenDeals: number;
  totalOpenValue: number;
}

export interface ForecastItem {
  stageId: string;
  stageName: string;
  probability: number;
  totalValue: number;
  forecastValue: number;
}

export interface RecentDealChange {
  dealId: string;
  dealTitle: string;
  status: string;
  value: number;
  updatedAt: string;
  stageName: string;
}

// ─────────────────────────────────────────────
// Aggregation functions
// ─────────────────────────────────────────────

/**
 * Compute comprehensive dashboard data:
 * - Pipeline-level deal count and total value (open deals only)
 * - Current month won/lost summary
 * - This week's activity completion summary
 */
export function getDashboardData(): DashboardData {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const pipelines = storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
  const activities = storage.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);

  const pipelineMap = new Map(pipelines.map((p) => [p.id, p]));

  // Pipeline summaries — open deals grouped by pipeline
  const pipelineStats = new Map<string, { count: number; value: number }>();
  let totalOpenDeals = 0;
  let totalOpenValue = 0;

  for (const deal of deals) {
    if (deal.status !== 'open') continue;
    totalOpenDeals += 1;
    totalOpenValue += deal.value;

    const existing = pipelineStats.get(deal.pipelineId) ?? { count: 0, value: 0 };
    existing.count += 1;
    existing.value += deal.value;
    pipelineStats.set(deal.pipelineId, existing);
  }

  const pipelineSummaries: PipelineSummary[] = pipelines.map((p) => {
    const stat = pipelineStats.get(p.id) ?? { count: 0, value: 0 };
    return {
      pipelineId: p.id,
      pipelineName: p.name,
      dealCount: stat.count,
      totalValue: stat.value,
    };
  });

  // Monthly summary — current month won/lost
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let wonCount = 0;
  let wonValue = 0;
  let lostCount = 0;

  for (const deal of deals) {
    if (deal.status !== 'won' && deal.status !== 'lost') continue;
    const updated = new Date(deal.updatedAt);
    if (updated.getFullYear() !== currentYear || updated.getMonth() !== currentMonth) continue;

    if (deal.status === 'won') {
      wonCount += 1;
      wonValue += deal.value;
    } else {
      lostCount += 1;
    }
  }

  // Activity summary — this week
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - dayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  let completedCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  for (const activity of activities) {
    if (!activity.dueDate) continue;
    const due = new Date(activity.dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    if (dueDay >= weekStart && dueDay < weekEnd) {
      if (activity.isCompleted) {
        completedCount += 1;
      } else {
        pendingCount += 1;
      }
    }

    if (!activity.isCompleted && dueDay < today) {
      overdueCount += 1;
    }
  }

  return {
    pipelineSummaries,
    monthlySummary: { wonCount, wonValue, lostCount },
    activitySummary: { completedCount, pendingCount, overdueCount },
    totalOpenDeals,
    totalOpenValue,
  };
}

/**
 * Compute forecast data: stage-level probability * totalValue for open deals.
 */
export function getForecastData(): ForecastItem[] {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const stages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);

  const valueMap = new Map<string, number>();
  for (const deal of deals) {
    if (deal.status !== 'open') continue;
    valueMap.set(deal.stageId, (valueMap.get(deal.stageId) ?? 0) + deal.value);
  }

  return stages
    .sort((a, b) => a.order - b.order)
    .filter((stage) => (valueMap.get(stage.id) ?? 0) > 0)
    .map((stage) => {
      const totalValue = valueMap.get(stage.id) ?? 0;
      return {
        stageId: stage.id,
        stageName: stage.name,
        probability: stage.probability,
        totalValue,
        forecastValue: Math.round((totalValue * stage.probability) / 100),
      };
    });
}

/**
 * Get the 20 most recently updated deals for a timeline view.
 */
export function getRecentDealChanges(): RecentDealChange[] {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const stages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);
  const stageMap = new Map(stages.map((s) => [s.id, s]));

  return deals
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 20)
    .map((deal) => ({
      dealId: deal.id,
      dealTitle: deal.title,
      status: deal.status,
      value: deal.value,
      updatedAt: deal.updatedAt,
      stageName: stageMap.get(deal.stageId)?.name ?? '-',
    }));
}
