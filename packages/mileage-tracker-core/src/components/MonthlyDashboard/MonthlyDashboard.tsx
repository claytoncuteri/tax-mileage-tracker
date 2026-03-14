/**
 * MonthlyDashboard shows a 12-month overview with bar charts,
 * monthly totals, and business percentage for each month.
 */

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAllMonthlyStats, useAnnualStats, useMileageStore } from '../../store';
import { MONTH_NAMES_SHORT } from '../../utils';
import {
  calculateMileageDeduction,
  calculateSection179Deduction,
  calculateTaxSavings,
  calculateFuelCost,
  formatCurrency,
} from '../../utils/irs-calculations';
import { getPercentageColor } from '../../theme/presets';

export function MonthlyDashboard() {
  const monthlyStats = useAllMonthlyStats();
  const annualStats = useAnnualStats();
  const vehicle = useMileageStore((s) => s.vehicle);
  const tax = useMileageStore((s) => s.tax);
  const currentYear = useMileageStore((s) => s.currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Build chart data
  const chartData = monthlyStats.map((stats, i) => ({
    name: MONTH_NAMES_SHORT[i],
    business: Math.round(stats.businessMiles),
    personal: Math.round(stats.personalMiles),
    month: i,
  }));

  // Annual calculations
  const mileageDeduction = calculateMileageDeduction(annualStats.businessMiles, currentYear);
  const section179 = calculateSection179Deduction(vehicle.cost, annualStats.businessPercentage);
  const taxSavings = calculateTaxSavings(Math.max(mileageDeduction, section179), tax.taxRate);
  const fuelCost = calculateFuelCost(annualStats.totalMiles, vehicle);
  const pctColor = getPercentageColor(annualStats.businessPercentage);

  const selectedStats = selectedMonth !== null ? monthlyStats[selectedMonth] : null;

  return (
    <div>
      {/* YTD summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <SummaryCard
          label="YTD Business %"
          value={`${Math.round(annualStats.businessPercentage)}%`}
          color={pctColor}
        />
        <SummaryCard
          label="Total Miles"
          value={Math.round(annualStats.totalMiles).toLocaleString()}
          color="var(--mt-text-primary)"
        />
        <SummaryCard
          label="Est. Deduction"
          value={formatCurrency(Math.max(mileageDeduction, section179))}
          color="var(--mt-color-success)"
        />
        <SummaryCard
          label="Est. Tax Savings"
          value={formatCurrency(taxSavings)}
          color="var(--mt-color-info)"
        />
        {fuelCost > 0 && (
          <SummaryCard
            label="YTD Fuel Cost"
            value={formatCurrency(fuelCost)}
            color="var(--mt-color-warning)"
          />
        )}
        <SummaryCard
          label="Total Trips"
          value={String(annualStats.tripCount)}
          color="var(--mt-text-primary)"
        />
      </div>

      {/* Monthly bar chart */}
      <div
        style={{
          background: 'var(--mt-bg-card)',
          borderRadius: 'var(--mt-radius-lg)',
          padding: '16px',
          border: '0.5px solid var(--mt-border)',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 'var(--mt-font-size-sm)',
            color: 'var(--mt-text-muted)',
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Monthly Miles — {currentYear}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--mt-text-faint)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                background: '#1a1a2e',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                fontSize: 12,
                color: '#fff',
              }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Bar
              dataKey="business"
              stackId="miles"
              radius={[0, 0, 0, 0]}
              onClick={(_, i) => setSelectedMonth(i)}
              cursor="pointer"
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={selectedMonth === i ? '#7EEBC0' : '#5DCAA5'}
                  opacity={selectedMonth !== null && selectedMonth !== i ? 0.4 : 1}
                />
              ))}
            </Bar>
            <Bar
              dataKey="personal"
              stackId="miles"
              radius={[4, 4, 0, 0]}
              onClick={(_, i) => setSelectedMonth(i)}
              cursor="pointer"
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={selectedMonth === i ? '#b0b0b0' : '#909090'}
                  opacity={selectedMonth !== null && selectedMonth !== i ? 0.4 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected month detail */}
      {selectedStats && selectedMonth !== null && (
        <div
          style={{
            background: 'var(--mt-bg-card)',
            borderRadius: 'var(--mt-radius-lg)',
            padding: '16px 20px',
            border: '0.5px solid var(--mt-border)',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 'var(--mt-font-size-base)', color: 'var(--mt-text-secondary)', fontWeight: 600 }}>
              {MONTH_NAMES_SHORT[selectedMonth]} {currentYear}
            </span>
            <button
              onClick={() => setSelectedMonth(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--mt-text-faint)',
                cursor: 'pointer',
                fontSize: 'var(--mt-font-size-sm)',
                fontFamily: 'var(--mt-font-family)',
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
            <MiniStat label="Business" value={`${Math.round(selectedStats.businessMiles)} mi`} color="var(--mt-color-business)" />
            <MiniStat label="Personal" value={`${Math.round(selectedStats.personalMiles)} mi`} color="var(--mt-text-muted)" />
            <MiniStat label="Biz %" value={`${Math.round(selectedStats.businessPercentage)}%`} color={getPercentageColor(selectedStats.businessPercentage)} />
          </div>
        </div>
      )}

      {/* 12-month grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
        }}
      >
        {monthlyStats.map((stats, i) => (
          <button
            key={i}
            onClick={() => setSelectedMonth(i)}
            style={{
              background: selectedMonth === i ? 'var(--mt-bg-active)' : 'var(--mt-bg-card)',
              borderRadius: 'var(--mt-radius-md)',
              padding: '10px 8px',
              border: selectedMonth === i ? '1px solid var(--mt-border-active)' : '0.5px solid var(--mt-border)',
              cursor: 'pointer',
              textAlign: 'center',
              fontFamily: 'var(--mt-font-family)',
            }}
          >
            <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', fontWeight: 600 }}>
              {MONTH_NAMES_SHORT[i]}
            </div>
            <div
              style={{
                fontSize: 'var(--mt-font-size-lg)',
                fontWeight: 700,
                color: stats.tripCount > 0
                  ? getPercentageColor(stats.businessPercentage)
                  : 'var(--mt-text-faint)',
                marginTop: 2,
              }}
            >
              {stats.tripCount > 0 ? `${Math.round(stats.businessPercentage)}%` : '—'}
            </div>
            <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', marginTop: 2 }}>
              {stats.totalMiles > 0 ? `${Math.round(stats.totalMiles)} mi` : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: 'var(--mt-bg-card)',
        borderRadius: 'var(--mt-radius-lg)',
        padding: '14px 16px',
        border: '0.5px solid var(--mt-border)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 'var(--mt-font-size-xl)', fontWeight: 700, color, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-faint)', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 'var(--mt-font-size-lg)', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
