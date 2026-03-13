/**
 * CSV export utility for mileage records.
 *
 * Generates IRS-ready CSV files with trip data and summary header.
 * Uses papaparse for reliable CSV serialization.
 */

import Papa from 'papaparse';
import type { Trip, TaxSettings, VehicleInfo, OdometerReading } from '../types';
import { formatExportDate, getDayOfWeek } from './date-helpers';
import {
  calculatePeriodStats,
  calculateMileageDeduction,
  calculateSection179Deduction,
  calculateTaxSavings,
  getIrsRate,
  formatCurrency,
} from './irs-calculations';

interface CSVRow {
  Date: string;
  Day: string;
  Destination: string;
  Category: string;
  'Round Trip Miles': number;
  'Business/Personal': string;
  'Purpose/Notes': string;
}

/**
 * Export trips to a CSV string with summary header.
 * Format is designed for direct use by tax professionals.
 */
export function exportTripsToCSV(
  trips: Trip[],
  tax: TaxSettings,
  vehicle: VehicleInfo,
  odometerReadings: OdometerReading[],
): string {
  // Sort trips by date ascending for the export
  const sorted = [...trips].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Build data rows
  const rows: CSVRow[] = sorted.map((trip) => ({
    Date: formatExportDate(trip.date),
    Day: getDayOfWeek(trip.date),
    Destination: trip.destination,
    Category: trip.category ?? '',
    'Round Trip Miles': trip.roundTripMiles,
    'Business/Personal': trip.type,
    'Purpose/Notes': trip.purpose,
  }));

  // Generate trip data CSV
  const tripCSV = Papa.unparse(rows);

  // Calculate summary stats
  const stats = calculatePeriodStats(trips);
  const irsRate = getIrsRate(tax.taxYear);
  const mileageDeduction = calculateMileageDeduction(stats.businessMiles, tax.taxYear);
  const section179 = calculateSection179Deduction(vehicle.cost, stats.businessPercentage);
  const taxSavings = calculateTaxSavings(Math.max(mileageDeduction, section179), tax.taxRate);

  // Build summary section
  const odometerStart = odometerReadings.find((r) => r.note.toLowerCase().includes('start'));
  const odometerEnd = odometerReadings.find((r) => r.note.toLowerCase().includes('end'));

  const summary = [
    '',
    '',
    'MILEAGE LOG SUMMARY',
    `Prepared for,${tax.userName}`,
    `Businesses,${tax.businessNames.join(' / ')}`,
    `Vehicle,${vehicle.name}`,
    `Vehicle Cost,${formatCurrency(vehicle.cost)}`,
    `Tax Year,${tax.taxYear}`,
    '',
    `Odometer Start of Year,${odometerStart ? odometerStart.reading.toLocaleString() : 'Not recorded'}`,
    `Odometer End of Year,${odometerEnd ? odometerEnd.reading.toLocaleString() : 'Not recorded'}`,
    '',
    `Total Trips,${stats.tripCount}`,
    `Business Trips,${stats.businessTripCount}`,
    `Personal Trips,${stats.personalTripCount}`,
    '',
    `Total Miles,${Math.round(stats.totalMiles)}`,
    `Business Miles,${Math.round(stats.businessMiles)}`,
    `Personal Miles,${Math.round(stats.personalMiles)}`,
    `Business Use Percentage,${Math.round(stats.businessPercentage)}%`,
    '',
    `IRS Standard Mileage Rate,${formatCurrency(irsRate)}/mile`,
    `Standard Mileage Deduction,${formatCurrency(mileageDeduction)}`,
    `Section 179 Deduction (${Math.round(stats.businessPercentage)}% of ${formatCurrency(vehicle.cost)}),${formatCurrency(section179)}`,
    `Estimated Tax Savings (${Math.round(tax.taxRate * 100)}% rate),${formatCurrency(taxSavings)}`,
    '',
    'DISCLAIMER: This document is for record-keeping purposes only.',
    'Consult a qualified tax professional for tax advice.',
  ];

  return tripCSV + '\n' + summary.join('\n');
}
