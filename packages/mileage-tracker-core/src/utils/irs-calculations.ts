/**
 * IRS mileage rate and deduction calculations.
 *
 * Standard mileage rates per IRS announcements.
 * Section 179 deduction calculations for business vehicle use.
 */

import type { Trip, PeriodStats, VehicleInfo, TaxSettings } from '../types';

/**
 * IRS standard mileage rates (cents per mile) by year.
 * Updated annually by the IRS. Source: IRS.gov revenue procedures.
 */
const IRS_MILEAGE_RATES: Record<number, number> = {
  2024: 0.67,
  2025: 0.70,
  2026: 0.70, // Placeholder until IRS announces 2026 rate
};

/** Get the IRS standard mileage rate for a given year */
export function getIrsRate(year: number): number {
  return IRS_MILEAGE_RATES[year] ?? IRS_MILEAGE_RATES[2026];
}

/** Calculate period stats from a list of trips */
export function calculatePeriodStats(trips: Trip[]): PeriodStats {
  const businessTrips = trips.filter((t) => t.type === 'Business');
  const personalTrips = trips.filter((t) => t.type === 'Personal');

  const businessMiles = businessTrips.reduce((sum, t) => sum + t.roundTripMiles, 0);
  const personalMiles = personalTrips.reduce((sum, t) => sum + t.roundTripMiles, 0);
  const totalMiles = businessMiles + personalMiles;

  return {
    totalMiles,
    businessMiles,
    personalMiles,
    businessPercentage: totalMiles > 0 ? (businessMiles / totalMiles) * 100 : 0,
    tripCount: trips.length,
    businessTripCount: businessTrips.length,
    personalTripCount: personalTrips.length,
  };
}

/**
 * Calculate the standard mileage deduction.
 * Deduction = business miles * IRS rate per mile
 */
export function calculateMileageDeduction(businessMiles: number, year: number): number {
  const rate = getIrsRate(year);
  return businessMiles * rate;
}

/**
 * Calculate Section 179 deduction based on business use percentage.
 * Deduction = vehicle cost * business use percentage
 * (Subject to IRS limits, simplified here)
 */
export function calculateSection179Deduction(
  vehicleCost: number,
  businessPercentage: number,
): number {
  return vehicleCost * (businessPercentage / 100);
}

/** Calculate estimated tax savings from deduction */
export function calculateTaxSavings(deduction: number, taxRate: number): number {
  return deduction * taxRate;
}

/**
 * Calculate fuel cost for a trip.
 * Supports both EV (kWh) and gas (MPG) vehicles.
 */
export function calculateFuelCost(miles: number, vehicle: VehicleInfo): number {
  // EV calculation: miles * kWh/mile * $/kWh
  if (vehicle.kwhPerMile && vehicle.costPerKwh) {
    return miles * vehicle.kwhPerMile * vehicle.costPerKwh;
  }

  // Gas calculation: (miles / MPG) * $/gallon
  if (vehicle.mpg && vehicle.gasPricePerGallon) {
    return (miles / vehicle.mpg) * vehicle.gasPricePerGallon;
  }

  return 0;
}

/**
 * Determine how many more business miles are needed to hit target percentage.
 * Returns 0 if already at or above target.
 */
export function milesNeededForTarget(
  currentBusinessMiles: number,
  currentPersonalMiles: number,
  targetPercent: number,
): number {
  const totalMiles = currentBusinessMiles + currentPersonalMiles;
  if (totalMiles === 0) return 0;

  const currentPercent = (currentBusinessMiles / totalMiles) * 100;
  if (currentPercent >= targetPercent) return 0;

  // Formula: need B miles where B / (B + existing_total) = target
  // B = (target * existing_total) / (1 - target)
  const targetFraction = targetPercent / 100;
  const needed = (targetFraction * totalMiles - currentBusinessMiles) / (1 - targetFraction);

  return Math.max(0, Math.ceil(needed));
}

/** Format a dollar amount for display */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a dollar amount with cents */
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get a summary object suitable for CSV export header.
 */
export function generateTaxSummary(
  trips: Trip[],
  tax: TaxSettings,
  vehicle: VehicleInfo,
) {
  const stats = calculatePeriodStats(trips);
  const mileageDeduction = calculateMileageDeduction(stats.businessMiles, tax.taxYear);
  const section179 = calculateSection179Deduction(vehicle.cost, stats.businessPercentage);
  const taxSavings = calculateTaxSavings(Math.max(mileageDeduction, section179), tax.taxRate);

  return {
    taxpayer: tax.userName,
    businesses: tax.businessNames.join(' / '),
    vehicle: vehicle.name,
    vehicleCost: vehicle.cost,
    taxYear: tax.taxYear,
    ...stats,
    mileageDeduction,
    section179Deduction: section179,
    estimatedTaxSavings: taxSavings,
    irsRate: getIrsRate(tax.taxYear),
  };
}
