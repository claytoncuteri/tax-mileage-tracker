/**
 * AnnualSummary provides a year-level view of mileage stats,
 * deduction calculations, and a month-over-month trend line.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useAllMonthlyStats, useAnnualStats, useTopDestinations, useMileageStore } from '../../store';
import { MONTH_NAMES_SHORT } from '../../utils';
import {
  calculateMileageDeduction,
  calculateSection179Deduction,
  calculateTaxSavings,
  formatCurrency,
  getIrsRate,
} from '../../utils/irs-calculations';
import { getPercentageColor } from '../../theme/presets';

export function AnnualSummary() {
  const annualStats = useAnnualStats();
  const monthlyStats = useAllMonthlyStats();
  const topDestinations = useTopDestinations(5);
  const vehicle = useMileageStore((s) => s.vehicle);
  const tax = useMileageStore((s) => s.tax);
  const currentYear = useMileageStore((s) => s.currentYear);
  const odometerReadings = useMileageStore((s) => s.odometerReadings);

  const irsRate = getIrsRate(currentYear);
  const mileageDeduction = calculateMileageDeduction(annualStats.businessMiles, currentYear);
  const section179 = calculateSection179Deduction(vehicle.cost, annualStats.businessPercentage);
  const betterDeduction = Math.max(mileageDeduction, section179);
  const taxSavings = calculateTaxSavings(betterDeduction, tax.taxRate);
  const pctColor = getPercentageColor(annualStats.businessPercentage);

  // Month-over-month trend data
  const trendData = monthlyStats.map((stats, i) => ({
    name: MONTH_NAMES_SHORT[i],
    percentage: stats.tripCount > 0 ? Math.round(stats.businessPercentage) : null,
    miles: Math.round(stats.totalMiles),
  }));

  // Odometer readings
  const startReading = odometerReadings.find((r) => r.note.toLowerCase().includes('start'));
  const endReading = odometerReadings.find((r) => r.note.toLowerCase().includes('end'));
  const odometerTotal = startReading && endReading ? endReading.reading - startReading.reading : null;

  return (
    <div>
      {/* Year header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 'var(--mt-font-size-3xl)', fontWeight: 700, color: pctColor }}>
          {Math.round(annualStats.businessPercentage)}%
        </div>
        <div style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)' }}>
          Business Use — {currentYear}
        </div>
      </div>

      {/* Key metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <MetricCard label="Business Miles" value={Math.round(annualStats.businessMiles).toLocaleString()} color="var(--mt-color-business)" />
        <MetricCard label="Personal Miles" value={Math.round(annualStats.personalMiles).toLocaleString()} color="var(--mt-text-muted)" />
        <MetricCard label="Total Miles" value={Math.round(annualStats.totalMiles).toLocaleString()} color="var(--mt-text-primary)" />
      </div>

      {/* Deduction comparison */}
      <div
        style={{
          background: 'var(--mt-bg-card)',
          borderRadius: 'var(--mt-radius-lg)',
          padding: '16px 20px',
          border: '0.5px solid var(--mt-border)',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)', fontWeight: 600, marginBottom: 12 }}>
          Deduction Methods
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <DeductionRow
            label={`Standard Mileage (${formatCurrency(irsRate)}/mi)`}
            value={formatCurrency(mileageDeduction)}
            isHigher={mileageDeduction >= section179}
          />
          <DeductionRow
            label={`Section 179 (${Math.round(annualStats.businessPercentage)}% of ${formatCurrency(vehicle.cost)})`}
            value={formatCurrency(section179)}
            isHigher={section179 > mileageDeduction}
          />
          <div style={{ borderTop: '0.5px solid var(--mt-border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-secondary)', fontWeight: 600 }}>
              Est. Tax Savings ({Math.round(tax.taxRate * 100)}%)
            </span>
            <span style={{ fontSize: 'var(--mt-font-size-lg)', color: 'var(--mt-color-success)', fontWeight: 700 }}>
              {formatCurrency(taxSavings)}
            </span>
          </div>
        </div>
      </div>

      {/* Trend chart */}
      <div
        style={{
          background: 'var(--mt-bg-card)',
          borderRadius: 'var(--mt-radius-lg)',
          padding: '16px',
          border: '0.5px solid var(--mt-border)',
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)', fontWeight: 600, marginBottom: 12 }}>
          Business % Trend
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={trendData}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--mt-text-faint)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{
                background: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                fontSize: 12,
                color: '#fff',
              }}
            />
            <ReferenceLine
              y={tax.targetBusinessPercent * 100}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="4 4"
              label={{ value: 'Target', fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="#5DCAA5"
              strokeWidth={2}
              dot={{ fill: '#5DCAA5', r: 3 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top destinations */}
      {topDestinations.length > 0 && (
        <div
          style={{
            background: 'var(--mt-bg-card)',
            borderRadius: 'var(--mt-radius-lg)',
            padding: '16px 20px',
            border: '0.5px solid var(--mt-border)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)', fontWeight: 600, marginBottom: 12 }}>
            Top Destinations
          </div>
          {topDestinations.map((dest, i) => (
            <div
              key={dest.destination}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: i < topDestinations.length - 1 ? '0.5px solid var(--mt-border)' : 'none',
              }}
            >
              <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-secondary)' }}>
                {dest.destination}
              </span>
              <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)' }}>
                {dest.count} trips · {Math.round(dest.miles)} mi
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Odometer */}
      {odometerTotal !== null && (
        <div
          style={{
            background: 'var(--mt-bg-card)',
            borderRadius: 'var(--mt-radius-lg)',
            padding: '16px 20px',
            border: '0.5px solid var(--mt-border)',
          }}
        >
          <div style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)', fontWeight: 600, marginBottom: 8 }}>
            Odometer Verification
          </div>
          <div style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-secondary)' }}>
            Logged: {Math.round(annualStats.totalMiles).toLocaleString()} mi
            {' · '}
            Odometer: {odometerTotal.toLocaleString()} mi
            {Math.abs(annualStats.totalMiles - odometerTotal) > 100 && (
              <span style={{ color: 'var(--mt-color-warning)', marginLeft: 8 }}>
                ⚠ {Math.abs(Math.round(annualStats.totalMiles - odometerTotal)).toLocaleString()} mi discrepancy
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: 'var(--mt-bg-card)',
        borderRadius: 'var(--mt-radius-md)',
        padding: '12px 8px',
        border: '0.5px solid var(--mt-border)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 'var(--mt-font-size-lg)', fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function DeductionRow({ label, value, isHigher }: { label: string; value: string; isHigher: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)' }}>{label}</span>
      <span
        style={{
          fontSize: 'var(--mt-font-size-base)',
          fontWeight: isHigher ? 700 : 400,
          color: isHigher ? 'var(--mt-color-success)' : 'var(--mt-text-muted)',
        }}
      >
        {value}
        {isHigher && ' ✓'}
      </span>
    </div>
  );
}
