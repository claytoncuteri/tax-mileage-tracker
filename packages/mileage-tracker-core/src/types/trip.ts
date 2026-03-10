/**
 * Core data types for mileage tracking.
 *
 * All types follow IRS Publication 463 requirements for
 * contemporaneous mileage records. Required fields ensure
 * audit-ready documentation of business vehicle use.
 */

/** Business or personal trip classification */
export type TripType = 'Business' | 'Personal';

/**
 * A single trip record.
 *
 * Per IRS Publication 463, taxpayers must maintain records showing:
 * - Date of each trip
 * - Destination (name or description)
 * - Business purpose
 * - Miles driven
 *
 * The `type` field tracks business vs personal for percentage calculations.
 */
export interface Trip {
  id: string;
  date: string; // ISO 8601 timestamp
  destination: string;
  roundTripMiles: number;
  type: TripType;
  /** Specific business purpose - required by IRS for business trips */
  purpose: string;
  /** Optional category for grouping (Networking, Banking, etc.) */
  category?: string;
  /** Which business entity this trip is for */
  businessEntity?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Optional expense data attached to a trip.
 * Not IRS-required for mileage deduction but strengthens audit defense.
 */
export interface TripExpenses {
  valet?: number;
  parking?: number;
  tolls?: number;
  purchases?: number;
  other?: number;
  otherDescription?: string;
}

/**
 * A pre-configured destination for quick trip logging.
 * Users tap these buttons to log trips with pre-filled data.
 */
export interface Destination {
  id: string;
  name: string;
  subtitle?: string;
  /** Default round-trip miles. 0 means user must enter manually. */
  defaultMiles: number;
  type: TripType;
  /** Icon name from lucide-react */
  icon: string;
  /** Accent color for the destination card */
  color: string;
  /** Pre-filled purpose/notes for this destination */
  defaultNote: string;
  /** Category for grouping destinations */
  category?: string;
  /** Sort order in the grid */
  sortOrder?: number;
}

/** Vehicle information for deduction calculations */
export interface VehicleInfo {
  name: string;
  cost: number;
  /** kWh consumed per mile for EVs */
  kwhPerMile?: number;
  /** Cost per kWh for EV charging */
  costPerKwh?: number;
  /** Miles per gallon for gas vehicles */
  mpg?: number;
  /** Cost per gallon for gas vehicles */
  gasPricePerGallon?: number;
}

/** Tax-related settings for deduction calculations */
export interface TaxSettings {
  /** Combined federal + state tax rate (e.g., 0.28 for 28%) */
  taxRate: number;
  /** Target business use percentage (e.g., 0.70 for 70%) */
  targetBusinessPercent: number;
  /** Active tax year */
  taxYear: number;
  /** Business names for the taxpayer */
  businessNames: string[];
  /** Taxpayer name */
  userName: string;
}

/**
 * Odometer reading for start/end of year records.
 * IRS requires annual odometer readings to verify total miles.
 */
export interface OdometerReading {
  id: string;
  date: string; // ISO 8601
  reading: number;
  note: string;
}

/** Computed stats for a time period */
export interface PeriodStats {
  totalMiles: number;
  businessMiles: number;
  personalMiles: number;
  businessPercentage: number;
  tripCount: number;
  businessTripCount: number;
  personalTripCount: number;
}

/**
 * Full configuration for the MileageTracker component.
 * Passed as props; all values are also editable in Settings at runtime.
 */
export interface MileageTrackerConfig {
  userName: string;
  businessNames: string[];
  vehicle: VehicleInfo;
  tax: TaxSettings;
  destinations: Destination[];
  /** Show optional fields (expenses, business entity, etc.) */
  enableOptionalFields?: boolean;
}
