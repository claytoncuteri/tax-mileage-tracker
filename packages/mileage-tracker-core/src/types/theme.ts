/**
 * Theme configuration for the mileage tracker components.
 *
 * The library uses CSS custom properties (--mt-* prefix) for all visual
 * values. Host websites can override any variable to match their design.
 */

/** Theme mode presets */
export type ThemeMode = 'dark' | 'light' | 'auto' | 'inherit';

/** Full theme configuration with CSS custom property values */
export interface ThemeConfig {
  mode: ThemeMode;
  colors?: {
    bgPrimary?: string;
    bgCard?: string;
    bgHover?: string;
    border?: string;
    textPrimary?: string;
    textSecondary?: string;
    textMuted?: string;
    textFaint?: string;
    success?: string;
    info?: string;
    warning?: string;
    danger?: string;
    accent?: string;
  };
  fonts?: {
    family?: string;
    familyMono?: string;
  };
  radius?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

/** Semantic color thresholds for business percentage display */
export interface PercentageThresholds {
  /** Green: on track (default: 85%) */
  excellent: number;
  /** Blue: good (default: 70%) */
  good: number;
  /** Amber: needs attention (default: 50%) */
  warning: number;
  /** Below warning threshold: red */
}
