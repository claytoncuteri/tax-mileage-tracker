/**
 * Date utility functions for mileage tracking.
 * Uses date-fns for reliable date math and formatting.
 */

import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  format,
  parseISO,
} from 'date-fns';

/** Get the start and end of the current week (Monday start) */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

/** Get the start and end of a given month */
export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/** Get the start and end of a given year */
export function getYearRange(year: number): { start: Date; end: Date } {
  const date = new Date(year, 0, 1);
  return {
    start: startOfYear(date),
    end: endOfYear(date),
  };
}

/** Check if a date string falls within the current week */
export function isCurrentWeek(dateStr: string): boolean {
  const date = parseISO(dateStr);
  const { start, end } = getWeekRange();
  return isWithinInterval(date, { start, end });
}

/** Check if a date string falls within a specific month */
export function isInMonth(dateStr: string, month: number, year: number): boolean {
  const date = parseISO(dateStr);
  const target = new Date(year, month, 1);
  const { start, end } = getMonthRange(target);
  return isWithinInterval(date, { start, end });
}

/** Check if a date string falls within a specific year */
export function isInYear(dateStr: string, year: number): boolean {
  const date = parseISO(dateStr);
  const { start, end } = getYearRange(year);
  return isWithinInterval(date, { start, end });
}

/** Format a trip date for display: "Mon, Mar 10, 2:30 PM" */
export function formatTripDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEE, MMM d, h:mm a');
}

/** Format a date for CSV export: "03/10/2026" */
export function formatExportDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'MM/dd/yyyy');
}

/** Get the day of week for a date string: "Monday" */
export function getDayOfWeek(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEEE');
}

/** Get the current year */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/** Get ISO timestamp for right now */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Month names for display */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Short month names */
export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
