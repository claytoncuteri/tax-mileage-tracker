/**
 * WeeklyScorecard shows the current week's mileage stats:
 * business percentage, progress bar, and business/personal/total breakdown.
 *
 * Color coding:
 * - Green (>= 85%): Excellent
 * - Blue (>= 70%): On Track
 * - Amber (>= 50%): Needs Attention
 * - Red (< 50%): Below Target
 */

import { useWeeklyStats } from '../../store';
import { getPercentageColor } from '../../theme/presets';

interface WeeklyScorecardProps {
  /** Target business use percentage for context (e.g., 70) */
  targetPercent?: number;
}

export function WeeklyScorecard({ targetPercent = 70 }: WeeklyScorecardProps) {
  const stats = useWeeklyStats();
  const pctColor = getPercentageColor(stats.businessPercentage);

  return (
    <div
      style={{
        background: 'var(--mt-bg-card)',
        borderRadius: 'var(--mt-radius-lg)',
        padding: '16px 20px',
        border: '0.5px solid var(--mt-border)',
        boxShadow: 'var(--mt-shadow-card)',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 'var(--mt-font-size-sm)',
            color: 'var(--mt-text-muted)',
            fontWeight: 600,
          }}
        >
          This Week
        </span>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: pctColor,
          }}
        >
          {Math.round(stats.businessPercentage)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.1)',
          marginBottom: 10,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Target marker */}
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(100, targetPercent)}%`,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'rgba(255, 255, 255, 0.3)',
            zIndex: 1,
          }}
        />
        {/* Progress fill */}
        <div
          style={{
            height: '100%',
            borderRadius: 3,
            background: pctColor,
            width: `${Math.min(100, stats.businessPercentage)}%`,
            transition: `all var(--mt-transition-normal)`,
          }}
        />
      </div>

      {/* Stats breakdown */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--mt-font-size-sm)',
        }}
      >
        <span style={{ color: 'var(--mt-color-business)', fontWeight: 600 }}>
          Biz: {Math.round(stats.businessMiles)} mi
        </span>
        <span style={{ color: 'var(--mt-text-faint)', fontWeight: 600 }}>
          Pers: {Math.round(stats.personalMiles)} mi
        </span>
        <span style={{ color: 'var(--mt-text-secondary)', fontWeight: 600 }}>
          Total: {Math.round(stats.totalMiles)} mi
        </span>
      </div>
    </div>
  );
}
