/**
 * ExportPanel provides CSV export with preview.
 * Generates IRS-ready mileage logs for tax professionals.
 */

import { Download } from 'lucide-react';
import { useExport } from '../../hooks';
import { useAnnualStats, useMileageStore, useSortedTrips } from '../../store';
import {
  calculateMileageDeduction,
  calculateSection179Deduction,
  formatCurrency,
} from '../../utils/irs-calculations';
import { getPercentageColor } from '../../theme/presets';

export function ExportPanel() {
  const { downloadCSV, tripCount } = useExport();
  const trips = useSortedTrips();
  const stats = useAnnualStats();
  const tax = useMileageStore((s) => s.tax);
  const vehicle = useMileageStore((s) => s.vehicle);
  const currentYear = useMileageStore((s) => s.currentYear);

  const mileageDeduction = calculateMileageDeduction(stats.businessMiles, currentYear);
  const section179 = calculateSection179Deduction(vehicle.cost, stats.businessPercentage);

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Export button card */}
      <div
        style={{
          background: 'var(--mt-bg-card)',
          borderRadius: 'var(--mt-radius-lg)',
          padding: 20,
          border: '0.5px solid var(--mt-border)',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 'var(--mt-font-size-base)',
            color: 'var(--mt-text-secondary)',
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          Export for Tax Records
        </div>
        <p
          style={{
            fontSize: 'var(--mt-font-size-sm)',
            color: 'var(--mt-text-muted)',
            lineHeight: 1.5,
            margin: '0 0 16px',
          }}
        >
          Downloads a CSV with every trip, dates, destinations, miles,
          business/personal classification, and notes. Includes a summary
          with total business use percentage and deduction estimates.
        </p>
        <button
          onClick={downloadCSV}
          disabled={tripCount === 0}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 'var(--mt-radius-md)',
            border: 'none',
            background: tripCount > 0 ? 'var(--mt-color-success)' : 'rgba(255,255,255,0.1)',
            color: tripCount > 0 ? '#000' : 'var(--mt-text-faint)',
            fontSize: 'var(--mt-font-size-base)',
            fontWeight: 700,
            fontFamily: 'var(--mt-font-family)',
            cursor: tripCount > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Download size={18} />
          Download CSV ({tripCount} trips)
        </button>
      </div>

      {/* Export preview */}
      {tripCount > 0 && (
        <div
          style={{
            background: 'var(--mt-bg-card)',
            borderRadius: 'var(--mt-radius-lg)',
            padding: 20,
            border: '0.5px solid var(--mt-border)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--mt-font-size-base)',
              color: 'var(--mt-text-secondary)',
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Export Preview
          </div>
          <div
            style={{
              fontSize: 'var(--mt-font-size-xs)',
              color: 'var(--mt-text-muted)',
              fontFamily: 'var(--mt-font-family-mono)',
              lineHeight: 1.8,
              maxHeight: 260,
              overflow: 'auto',
            }}
          >
            <div style={{ color: 'var(--mt-text-secondary)', fontWeight: 600 }}>
              {tax.userName} — {currentYear} Mileage Log
            </div>
            <div>{tax.businessNames.join(' / ')}</div>
            <div>{vehicle.name}</div>
            <div
              style={{
                margin: '8px 0',
                borderTop: '0.5px solid var(--mt-border)',
              }}
            />
            <div>Total trips: {stats.tripCount}</div>
            <div style={{ color: 'var(--mt-color-business)' }}>
              Business miles: {Math.round(stats.businessMiles).toLocaleString()}
            </div>
            <div>Personal miles: {Math.round(stats.personalMiles).toLocaleString()}</div>
            <div
              style={{
                color: getPercentageColor(stats.businessPercentage),
                fontWeight: 600,
              }}
            >
              Business use: {Math.round(stats.businessPercentage)}%
            </div>
            <div
              style={{
                margin: '8px 0',
                borderTop: '0.5px solid var(--mt-border)',
              }}
            />
            <div style={{ color: 'var(--mt-color-success)' }}>
              Est. deduction: {formatCurrency(Math.max(mileageDeduction, section179))}
            </div>
            <div
              style={{
                margin: '8px 0',
                borderTop: '0.5px solid var(--mt-border)',
              }}
            />
            {/* Recent trips preview */}
            {trips.slice(0, 5).map((t) => (
              <div key={t.id} style={{ marginBottom: 4 }}>
                {new Date(t.date).toLocaleDateString()} | {t.destination} |{' '}
                {t.roundTripMiles}mi | {t.type} | {t.purpose}
              </div>
            ))}
            {trips.length > 5 && (
              <div style={{ color: 'var(--mt-text-faint)' }}>
                ...and {trips.length - 5} more trips
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
