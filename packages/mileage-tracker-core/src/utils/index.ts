export {
  getWeekRange,
  getMonthRange,
  getYearRange,
  isCurrentWeek,
  isInMonth,
  isInYear,
  formatTripDate,
  formatExportDate,
  getDayOfWeek,
  getCurrentYear,
  nowISO,
  MONTH_NAMES,
  MONTH_NAMES_SHORT,
} from './date-helpers';

export { generateId } from './id';

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
} from './irs-calculations';

export { exportTripsToCSV } from './csv-export';

export {
  calculateDistance,
  getOSRMDistance,
  getHaversineDistance,
} from './distance';
export type { DistanceResult } from './distance';

export { geocodeAddress } from './geocoding';
export type { GeocodeResult } from './geocoding';
