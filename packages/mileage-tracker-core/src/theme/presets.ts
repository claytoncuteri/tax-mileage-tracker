/**
 * Theme preset configurations.
 */

import type { ThemeMode } from '../types/theme';

/** Resolve 'auto' theme mode based on system preference */
export function resolveThemeMode(mode: ThemeMode): 'dark' | 'light' | 'inherit' {
  if (mode === 'auto') {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode === 'inherit' ? 'inherit' : mode;
}

/** Get the percentage color based on thresholds */
export function getPercentageColor(
  percentage: number,
): 'var(--mt-color-success)' | 'var(--mt-color-info)' | 'var(--mt-color-warning)' | 'var(--mt-color-danger)' {
  if (percentage >= 85) return 'var(--mt-color-success)';
  if (percentage >= 70) return 'var(--mt-color-info)';
  if (percentage >= 50) return 'var(--mt-color-warning)';
  return 'var(--mt-color-danger)';
}

/** Get a human-readable label for the percentage status */
export function getPercentageLabel(percentage: number): string {
  if (percentage >= 85) return 'Excellent';
  if (percentage >= 70) return 'On Track';
  if (percentage >= 50) return 'Needs Attention';
  return 'Below Target';
}
