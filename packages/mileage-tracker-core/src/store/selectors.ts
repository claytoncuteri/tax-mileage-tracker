/**
 * Derived selectors for the mileage store.
 *
 * These hooks compute stats from the trip data without
 * duplicating calculation logic across components.
 */

import { useMemo } from 'react';
import { useMileageStore } from './mileage-store';
import { calculatePeriodStats } from '../utils/irs-calculations';
import { getWeekRange, getMonthRange, isInYear } from '../utils/date-helpers';
import { parseISO, isWithinInterval } from 'date-fns';
import type { PeriodStats, Trip } from '../types';

/** Filter trips to a date range */
function filterTrips(trips: Trip[], start: Date, end: Date): Trip[] {
  return trips.filter((t) => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start, end });
  });
}

/** Get stats for the current week */
export function useWeeklyStats(): PeriodStats {
  const trips = useMileageStore((state) => state.trips);

  return useMemo(() => {
    const { start, end } = getWeekRange();
    const weekTrips = filterTrips(trips, start, end);
    return calculatePeriodStats(weekTrips);
  }, [trips]);
}

/** Get trips for the current week */
export function useWeeklyTrips(): Trip[] {
  const trips = useMileageStore((state) => state.trips);

  return useMemo(() => {
    const { start, end } = getWeekRange();
    return filterTrips(trips, start, end);
  }, [trips]);
}

/** Get stats for a specific month (0-indexed) */
export function useMonthlyStats(month: number): PeriodStats {
  const trips = useMileageStore((state) => state.trips);
  const currentYear = useMileageStore((state) => state.currentYear);

  return useMemo(() => {
    const date = new Date(currentYear, month, 1);
    const { start, end } = getMonthRange(date);
    const monthTrips = filterTrips(trips, start, end);
    return calculatePeriodStats(monthTrips);
  }, [trips, month, currentYear]);
}

/** Get stats for all months of the current year */
export function useAllMonthlyStats(): PeriodStats[] {
  const trips = useMileageStore((state) => state.trips);
  const currentYear = useMileageStore((state) => state.currentYear);

  return useMemo(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const date = new Date(currentYear, month, 1);
      const { start, end } = getMonthRange(date);
      const monthTrips = filterTrips(trips, start, end);
      return calculatePeriodStats(monthTrips);
    });
  }, [trips, currentYear]);
}

/** Get stats for the entire current year */
export function useAnnualStats(): PeriodStats {
  const trips = useMileageStore((state) => state.trips);
  const currentYear = useMileageStore((state) => state.currentYear);

  return useMemo(() => {
    const yearTrips = trips.filter((t) => isInYear(t.date, currentYear));
    return calculatePeriodStats(yearTrips);
  }, [trips, currentYear]);
}

/** Get the overall business use percentage for the current year */
export function useBusinessPercentage(): number {
  const stats = useAnnualStats();
  return stats.businessPercentage;
}

/** Get trips sorted by date (newest first) */
export function useSortedTrips(): Trip[] {
  const trips = useMileageStore((state) => state.trips);

  return useMemo(() => {
    return [...trips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trips]);
}

/** Get top destinations by trip count */
export function useTopDestinations(limit: number = 5): { destination: string; count: number; miles: number }[] {
  const trips = useMileageStore((state) => state.trips);

  return useMemo(() => {
    const destMap = new Map<string, { count: number; miles: number }>();
    for (const trip of trips) {
      const existing = destMap.get(trip.destination) ?? { count: 0, miles: 0 };
      destMap.set(trip.destination, {
        count: existing.count + 1,
        miles: existing.miles + trip.roundTripMiles,
      });
    }

    return Array.from(destMap.entries())
      .map(([destination, stats]) => ({ destination, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [trips, limit]);
}
