import { describe, it, expect } from 'vitest';
import {
  getWeekRange,
  getMonthRange,
  getYearRange,
  isInYear,
  formatTripDate,
  formatExportDate,
  getDayOfWeek,
  getCurrentYear,
  nowISO,
} from '../../utils/date-helpers';

describe('getWeekRange', () => {
  it('returns a start and end date', () => {
    const { start, end } = getWeekRange();
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });

  it('week starts on Monday', () => {
    const { start } = getWeekRange(new Date(2026, 2, 11)); // Wed Mar 11
    expect(start.getDay()).toBe(1); // Monday
  });
});

describe('getMonthRange', () => {
  it('returns first and last day of month', () => {
    const { start, end } = getMonthRange(new Date(2026, 1, 15)); // Feb 15
    expect(start.getDate()).toBe(1);
    expect(end.getDate()).toBe(28); // Feb 2026
  });
});

describe('getYearRange', () => {
  it('returns Jan 1 to Dec 31', () => {
    const { start, end } = getYearRange(2026);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });
});

describe('isInYear', () => {
  it('returns true for dates in the given year', () => {
    expect(isInYear('2026-06-15T12:00:00Z', 2026)).toBe(true);
  });

  it('returns false for dates outside the year', () => {
    expect(isInYear('2025-06-15T12:00:00Z', 2026)).toBe(false);
  });
});

describe('formatTripDate', () => {
  it('formats date for display', () => {
    const formatted = formatTripDate('2026-03-10T14:30:00Z');
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('10');
  });
});

describe('formatExportDate', () => {
  it('formats date for CSV export', () => {
    const formatted = formatExportDate('2026-03-10T14:30:00Z');
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('getDayOfWeek', () => {
  it('returns full day name', () => {
    const day = getDayOfWeek('2026-03-09T12:00:00Z'); // Monday
    expect(day).toBe('Monday');
  });
});

describe('getCurrentYear', () => {
  it('returns current year as number', () => {
    expect(getCurrentYear()).toBe(new Date().getFullYear());
  });
});

describe('nowISO', () => {
  it('returns valid ISO string', () => {
    const iso = nowISO();
    expect(new Date(iso).toISOString()).toBe(iso);
  });
});
