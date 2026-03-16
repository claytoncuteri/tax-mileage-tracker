/**
 * MileageTracker is the top-level component that composes all
 * sub-components with tab navigation. This is the main embeddable
 * component for React apps.
 *
 * Usage:
 * ```tsx
 * import { MileageTracker } from 'mileage-tracker-core';
 *
 * <MileageTracker
 *   destinations={myDestinations}
 *   vehicle={{ name: 'Tesla', cost: 60000 }}
 *   tax={{ taxRate: 0.24, targetBusinessPercent: 0.7, taxYear: 2026, businessNames: ['My LLC'], userName: 'John' }}
 *   theme="dark"
 * />
 * ```
 */

import { useState, useEffect } from 'react';
import { Zap, CalendarDays, BarChart3, Download, Settings as SettingsIcon, Gauge } from 'lucide-react';
import { ThemeProvider } from './ThemeProvider';
import { QuickLogger } from './QuickLogger';
import { TripLog } from './TripLog';
import { WeeklyScorecard } from './WeeklyScorecard';
import { MonthlyDashboard } from './MonthlyDashboard';
import { AnnualSummary } from './AnnualSummary';
import { ExportPanel } from './ExportPanel';
import { OdometerLog } from './OdometerLog';
import { Settings } from './Settings';
import { useMileageStore } from '../store';
import { createLocalStorageAdapter } from '../storage';
import type { Destination, VehicleInfo, TaxSettings, ThemeMode, StorageAdapter } from '../types';

type TabId = 'log' | 'week' | 'month' | 'year' | 'export' | 'odometer' | 'settings';

interface MileageTrackerProps {
  /** Pre-configured destinations for quick logging */
  destinations?: Destination[];
  /** Vehicle information for deduction calculations */
  vehicle?: VehicleInfo;
  /** Tax settings (rate, target %, year) */
  tax?: TaxSettings;
  /** Theme mode */
  theme?: ThemeMode;
  /** Custom storage adapter (defaults to localStorage) */
  storageAdapter?: StorageAdapter;
  /** User's home address for distance calculations */
  homeAddress?: string;
  /** Additional CSS class for the wrapper */
  className?: string;
  /** Callback when a trip is logged */
  onTripLogged?: (destination: string, miles: number) => void;
}

const TABS: { id: TabId; label: string; icon: typeof Zap }[] = [
  { id: 'log', label: 'Log', icon: Zap },
  { id: 'week', label: 'Week', icon: CalendarDays },
  { id: 'month', label: 'Month', icon: BarChart3 },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function MileageTracker({
  destinations,
  vehicle,
  tax,
  theme = 'dark',
  storageAdapter,
  className,
  onTripLogged,
}: MileageTrackerProps) {
  const [activeTab, setActiveTab] = useState<TabId>('log');
  const setAdapter = useMileageStore((s) => s.setAdapter);
  const loadFromAdapter = useMileageStore((s) => s.loadFromAdapter);
  const setDestinations = useMileageStore((s) => s.setDestinations);
  const setVehicle = useMileageStore((s) => s.setVehicle);
  const setTax = useMileageStore((s) => s.setTax);
  const setTheme = useMileageStore((s) => s.setTheme);
  const storeTheme = useMileageStore((s) => s.theme);

  // Initialize store from props on mount
  useEffect(() => {
    const adapter = storageAdapter ?? createLocalStorageAdapter();
    setAdapter(adapter);

    if (destinations) setDestinations(destinations);
    if (vehicle) setVehicle(vehicle);
    if (tax) setTax(tax);
    if (theme) setTheme(theme);

    // Load persisted data
    loadFromAdapter();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeProvider mode={storeTheme} className={className}>
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '0 4px',
          minHeight: '100vh',
          background: 'var(--mt-bg-primary)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '16px 0 12px' }}>
          <h1
            style={{
              fontSize: 'var(--mt-font-size-xl)',
              color: 'var(--mt-text-primary)',
              fontWeight: 700,
              margin: 0,
            }}
          >
            Mileage Tracker
          </h1>
        </div>

        {/* Content */}
        <div style={{ paddingBottom: 80 }}>
          {activeTab === 'log' && (
            <>
              <WeeklyScorecard
                targetPercent={
                  (tax?.targetBusinessPercent ?? 0.7) * 100
                }
              />
              <div style={{ marginTop: 16 }}>
                <QuickLogger
                  destinations={destinations}
                  onTripLogged={onTripLogged}
                />
              </div>
              <div style={{ marginTop: 16 }}>
                <TripLog limit={10} />
              </div>
            </>
          )}
          {activeTab === 'week' && (
            <>
              <WeeklyScorecard
                targetPercent={(tax?.targetBusinessPercent ?? 0.7) * 100}
              />
              <div style={{ marginTop: 16 }}>
                <TripLog />
              </div>
            </>
          )}
          {activeTab === 'month' && <MonthlyDashboard />}
          {activeTab === 'year' && <AnnualSummary />}
          {activeTab === 'export' && <ExportPanel />}
          {activeTab === 'odometer' && <OdometerLog />}
          {activeTab === 'settings' && <Settings />}
        </div>

        {/* Bottom tab bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--mt-bg-primary)',
            borderTop: '0.5px solid var(--mt-border)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 0',
            paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
            zIndex: 100,
          }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: '4px 12px',
                  background: 'none',
                  border: 'none',
                  color: isActive ? 'var(--mt-color-success)' : 'var(--mt-text-faint)',
                  cursor: 'pointer',
                  fontFamily: 'var(--mt-font-family)',
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400 }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </ThemeProvider>
  );
}
