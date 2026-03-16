/**
 * Mileage Tracker Core
 *
 * IRS-compliant mileage tracking React component library.
 * Track business vs personal vehicle mileage for tax deductions.
 */

// Types
export type {
  Trip,
  TripType,
  TripExpenses,
  Destination,
  VehicleInfo,
  TaxSettings,
  OdometerReading,
  PeriodStats,
  MileageTrackerConfig,
  StorageAdapter,
  ThemeMode,
  ThemeConfig,
} from './types';

// Components
export { MileageTracker } from './components/MileageTracker';
export { QuickLogger, DestinationGrid, TripInputPanel } from './components/QuickLogger';
export { TripLog, TripLogEntry } from './components/TripLog';
export { WeeklyScorecard } from './components/WeeklyScorecard';
export { MonthlyDashboard } from './components/MonthlyDashboard';
export { AnnualSummary } from './components/AnnualSummary';
export { ExportPanel } from './components/ExportPanel';
export { OdometerLog } from './components/OdometerLog';
export { Settings } from './components/Settings';
export { ThemeProvider } from './components/ThemeProvider';

// Store
export { useMileageStore } from './store';
export {
  useWeeklyStats,
  useMonthlyStats,
  useAllMonthlyStats,
  useAnnualStats,
  useBusinessPercentage,
  useSortedTrips,
  useTopDestinations,
} from './store';

// Hooks
export { useTrips, useWeeklyStatsHook, useExport } from './hooks';

// Storage adapters
export { createLocalStorageAdapter } from './storage';

// Utils
export {
  getIrsRate,
  calculatePeriodStats,
  calculateMileageDeduction,
  calculateSection179Deduction,
  calculateTaxSavings,
  calculateFuelCost,
  milesNeededForTarget,
  formatCurrency,
  formatCurrencyPrecise,
  generateTaxSummary,
  exportTripsToCSV,
  formatTripDate,
  formatExportDate,
  getCurrentYear,
  generateId,
} from './utils';

// Theme
export { getPercentageColor, getPercentageLabel, resolveThemeMode } from './theme';

// Default destinations
export { DEFAULT_DESTINATIONS } from './constants';
