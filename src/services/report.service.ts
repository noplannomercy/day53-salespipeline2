'use client';

import * as storage from '@/lib/storage';
import { STORAGE_KEYS } from '@/types/index';
import type {
  Report,
  Deal,
  Stage,
  Activity,
  Member,
  Lead,
  Pipeline,
} from '@/types/index';

const KEY = STORAGE_KEYS.REPORTS;

// ─────────────────────────────────────────────
// CRUD for saved report configurations
// ─────────────────────────────────────────────

/**
 * Retrieve all saved reports.
 */
export function getReports(): Report[] {
  return storage.getAll<Report>(KEY);
}

/**
 * Create a new saved report configuration.
 */
export function createReport(
  data: Omit<Report, 'id' | 'createdAt'>,
): Report {
  return storage.create<Report>(KEY, data);
}

/**
 * Update an existing report configuration.
 */
export function updateReport(
  id: string,
  data: Partial<Omit<Report, 'id' | 'createdAt'>>,
): Report | null {
  return storage.update<Report>(KEY, id, data);
}

/**
 * Delete a saved report by ID.
 */
export function deleteReport(id: string): void {
  storage.remove(KEY, id);
}

// ─────────────────────────────────────────────
// Real-time aggregation functions
// ─────────────────────────────────────────────

export interface PipelineStat {
  stageId: string;
  stageName: string;
  count: number;
  totalValue: number;
}

/**
 * Aggregate deal count and total value per stage for open deals.
 * Groups by stage, sorted by stage order.
 */
export function getPipelineStats(): PipelineStat[] {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const stages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);

  const stageMap = new Map(stages.map((s) => [s.id, s]));

  // Count by stageId for open deals only
  const statMap = new Map<string, { count: number; totalValue: number }>();

  for (const deal of deals) {
    if (deal.status !== 'open') continue;
    const existing = statMap.get(deal.stageId) ?? { count: 0, totalValue: 0 };
    existing.count += 1;
    existing.totalValue += deal.value;
    statMap.set(deal.stageId, existing);
  }

  // Build result sorted by stage order
  return stages
    .sort((a, b) => a.order - b.order)
    .map((stage) => {
      const stat = statMap.get(stage.id) ?? { count: 0, totalValue: 0 };
      return {
        stageId: stage.id,
        stageName: stage.name,
        count: stat.count,
        totalValue: stat.totalValue,
      };
    })
    .filter((s) => s.count > 0 || s.totalValue > 0);
}

export interface SalesStat {
  month: string;
  wonValue: number;
  lostCount: number;
}

/**
 * Aggregate monthly sales statistics for the last 12 months.
 * wonValue: sum of deal values where status === 'won' and updatedAt falls in the month.
 * lostCount: count of deals where status === 'lost' and updatedAt falls in the month.
 */
export function getSalesStats(): SalesStat[] {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const now = new Date();
  const months: SalesStat[] = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    months.push({ month: key, wonValue: 0, lostCount: 0 });
  }

  const monthMap = new Map(months.map((m) => [m.month, m]));

  for (const deal of deals) {
    if (deal.status !== 'won' && deal.status !== 'lost') continue;
    const updated = new Date(deal.updatedAt);
    const key = `${updated.getFullYear()}-${String(updated.getMonth() + 1).padStart(2, '0')}`;
    const stat = monthMap.get(key);
    if (!stat) continue;

    if (deal.status === 'won') {
      stat.wonValue += deal.value;
    } else {
      stat.lostCount += 1;
    }
  }

  return months;
}

export interface ActivityStat {
  memberId: string;
  memberName: string;
  count: number;
}

/**
 * Aggregate activity count per team member.
 */
export function getActivityStats(): ActivityStat[] {
  const activities = storage.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
  const members = storage.getAll<Member>(STORAGE_KEYS.MEMBERS);
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const countMap = new Map<string, number>();
  for (const a of activities) {
    countMap.set(a.assignedTo, (countMap.get(a.assignedTo) ?? 0) + 1);
  }

  return members.map((m) => ({
    memberId: m.id,
    memberName: m.name,
    count: countMap.get(m.id) ?? 0,
  }));
}

export interface ForecastDatum {
  stageId: string;
  stageName: string;
  probability: number;
  totalValue: number;
  forecastValue: number;
}

/**
 * Calculate forecast data: for each stage, multiply the total open deal value
 * by the stage probability to produce a weighted forecast value.
 */
export function getForecastData(): ForecastDatum[] {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const stages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);

  const stageMap = new Map(stages.map((s) => [s.id, s]));

  // Sum open deal values by stage
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

// ─────────────────────────────────────────────
// Weighted pipeline value
// ─────────────────────────────────────────────

export interface WeightedStageData {
  stageId: string;
  stageName: string;
  stageColor: string;
  probability: number;
  rawValue: number;
  weightedValue: number;
  dealCount: number;
}

/**
 * Calculate weighted pipeline value per stage.
 * For each stage, rawValue is the sum of open deal values,
 * and weightedValue = rawValue * (probability / 100).
 * If pipelineId is not provided, uses the default pipeline.
 */
export function getWeightedPipelineValue(pipelineId?: string): WeightedStageData[] {
  const pipelines = storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
  const resolvedPipelineId =
    pipelineId ?? pipelines.find((p) => p.isDefault)?.id ?? pipelines[0]?.id;
  if (!resolvedPipelineId) return [];

  const stages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);
  const pipelineStages = stages
    .filter((s) => s.pipelineId === resolvedPipelineId)
    .sort((a, b) => a.order - b.order);

  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);

  const stageStats = new Map<string, { rawValue: number; dealCount: number }>();
  for (const deal of deals) {
    if (deal.status !== 'open') continue;
    if (deal.pipelineId !== resolvedPipelineId) continue;
    const existing = stageStats.get(deal.stageId) ?? { rawValue: 0, dealCount: 0 };
    existing.rawValue += deal.value;
    existing.dealCount += 1;
    stageStats.set(deal.stageId, existing);
  }

  return pipelineStages.map((stage) => {
    const stat = stageStats.get(stage.id) ?? { rawValue: 0, dealCount: 0 };
    return {
      stageId: stage.id,
      stageName: stage.name,
      stageColor: stage.color,
      probability: stage.probability,
      rawValue: stat.rawValue,
      weightedValue: Math.round((stat.rawValue * stage.probability) / 100),
      dealCount: stat.dealCount,
    };
  });
}

// ─────────────────────────────────────────────
// Member performance
// ─────────────────────────────────────────────

export interface MemberPerformanceStat {
  memberId: string;
  memberName: string;
  wonCount: number;
  totalCount: number;
  activityCount: number;
}

/**
 * Aggregate member deal performance: won/total deals and activity count per member.
 */
export function getMemberPerformance(): MemberPerformanceStat[] {
  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);
  const activities = storage.getAll<Activity>(STORAGE_KEYS.ACTIVITIES);
  const members = storage.getAll<Member>(STORAGE_KEYS.MEMBERS);

  const dealCountMap = new Map<string, { wonCount: number; totalCount: number }>();
  for (const deal of deals) {
    const existing = dealCountMap.get(deal.assignedTo) ?? { wonCount: 0, totalCount: 0 };
    existing.totalCount += 1;
    if (deal.status === 'won') {
      existing.wonCount += 1;
    }
    dealCountMap.set(deal.assignedTo, existing);
  }

  const activityCountMap = new Map<string, number>();
  for (const a of activities) {
    activityCountMap.set(a.assignedTo, (activityCountMap.get(a.assignedTo) ?? 0) + 1);
  }

  return members.map((m) => {
    const dealStat = dealCountMap.get(m.id) ?? { wonCount: 0, totalCount: 0 };
    return {
      memberId: m.id,
      memberName: m.name,
      wonCount: dealStat.wonCount,
      totalCount: dealStat.totalCount,
      activityCount: activityCountMap.get(m.id) ?? 0,
    };
  });
}

// ─────────────────────────────────────────────
// Pipeline funnel
// ─────────────────────────────────────────────

export interface PipelineFunnelDatum {
  stageId: string;
  stageName: string;
  dealCount: number;
  totalValue: number;
}

/**
 * Get pipeline funnel data: deal count and total value per stage for the current
 * (default) pipeline, sorted by stage order.
 */
export function getPipelineFunnelData(): PipelineFunnelDatum[] {
  const pipelines = storage.getAll<Pipeline>(STORAGE_KEYS.PIPELINES);
  const defaultPipeline = pipelines.find((p) => p.isDefault) ?? pipelines[0];
  if (!defaultPipeline) return [];

  const stages = storage.getAll<Stage>(STORAGE_KEYS.STAGES);
  const pipelineStages = stages
    .filter((s) => s.pipelineId === defaultPipeline.id)
    .sort((a, b) => a.order - b.order);

  const deals = storage.getAll<Deal>(STORAGE_KEYS.DEALS);

  const stageStats = new Map<string, { dealCount: number; totalValue: number }>();
  for (const deal of deals) {
    if (deal.pipelineId !== defaultPipeline.id) continue;
    const existing = stageStats.get(deal.stageId) ?? { dealCount: 0, totalValue: 0 };
    existing.dealCount += 1;
    existing.totalValue += deal.value;
    stageStats.set(deal.stageId, existing);
  }

  return pipelineStages.map((stage) => {
    const stat = stageStats.get(stage.id) ?? { dealCount: 0, totalValue: 0 };
    return {
      stageId: stage.id,
      stageName: stage.name,
      dealCount: stat.dealCount,
      totalValue: stat.totalValue,
    };
  });
}

export interface LeadSourceStat {
  source: string;
  count: number;
  convertedCount: number;
}

/**
 * Aggregate lead counts and conversion rates by source.
 * A lead is considered "converted" if its status is 'qualified'.
 */
export function getLeadSourceStats(): LeadSourceStat[] {
  const leads = storage.getAll<Lead>(STORAGE_KEYS.LEADS);

  const statMap = new Map<string, { count: number; convertedCount: number }>();

  for (const lead of leads) {
    const existing = statMap.get(lead.source) ?? { count: 0, convertedCount: 0 };
    existing.count += 1;
    if (lead.status === 'qualified') {
      existing.convertedCount += 1;
    }
    statMap.set(lead.source, existing);
  }

  const sourceLabels: Record<string, string> = {
    web: '웹',
    referral: '추천',
    ad: '광고',
    event: '이벤트',
    other: '기타',
  };

  return Array.from(statMap.entries()).map(([source, stat]) => ({
    source: sourceLabels[source] ?? source,
    count: stat.count,
    convertedCount: stat.convertedCount,
  }));
}
