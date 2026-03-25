/**
 * Local user configuration template.
 *
 * Copy this file to `local.config.ts` (which is .gitignored) and fill in
 * your own vehicle, tax, and business details. The app will automatically
 * pick up your config on next reload.
 */

import type { VehicleInfo, TaxSettings } from 'mileage-tracker-core';

export const vehicle: VehicleInfo = {
  name: 'My Vehicle',
  cost: 45000,
  // For EVs:
  kwhPerMile: 0.25,
  costPerKwh: 0.12,
  // For gas vehicles (uncomment and remove EV fields):
  // mpg: 30,
  // gasPricePerGallon: 3.50,
};

export const tax: TaxSettings = {
  taxRate: 0.24,
  targetBusinessPercent: 0.70,
  taxYear: new Date().getFullYear(),
  businessNames: ['My Business LLC'],
  userName: 'Your Name',
};
