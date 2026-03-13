/**
 * React hook for weekly mileage statistics.
 * Provides computed stats with formatted values ready for display.
 */

import { useMemo } from 'react';
import { useWeeklyStats, useWeeklyTrips } from '../store';
import { useMileageStore } from '../store';
import { milesNeededForTarget } from '../utils';
import type { PeriodStats, Trip } from '../types';

export interface UseWeeklyStatsReturn extends PeriodStats {
  trips: Trip[];
  targetPercent: number;
  isAboveTarget: boolean;
  milesNeeded: number;
}

export function useWeeklyStatsHook(): UseWeeklyStatsReturn {
  const stats = useWeeklyStats();
  const trips = useWeeklyTrips();
  const targetPercent = useMileageStore(
    (s) => s.tax.targetBusinessPercent * 100,
  );

  const milesNeeded = useMemo(
    () => milesNeededForTarget(stats.businessMiles, stats.personalMiles, targetPercent),
    [stats.businessMiles, stats.personalMiles, targetPercent],
  );

  return {
    ...stats,
    trips,
    targetPercent,
    isAboveTarget: stats.businessPercentage >= targetPercent,
    milesNeeded,
  };
}
