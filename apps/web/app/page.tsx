'use client';

import { MileageTracker, DEFAULT_DESTINATIONS } from 'mileage-tracker-core';
import type { VehicleInfo, TaxSettings } from 'mileage-tracker-core';

// Try to import local config (gitignored). Falls back to defaults below.
let localConfig: { vehicle?: VehicleInfo; tax?: TaxSettings } = {};
try {
  localConfig = require('./local.config');
} catch {
  // No local config — use demo defaults
}

const defaultVehicle: VehicleInfo = {
  name: 'Tesla Model 3',
  cost: 45000,
  kwhPerMile: 0.25,
  costPerKwh: 0.12,
};

const defaultTax: TaxSettings = {
  taxRate: 0.24,
  targetBusinessPercent: 0.70,
  taxYear: new Date().getFullYear(),
  businessNames: ['Acme Consulting LLC'],
  userName: 'Demo User',
};

const vehicle = localConfig.vehicle ?? defaultVehicle;
const tax = localConfig.tax ?? defaultTax;

export default function Home() {
  return (
    <main>
      <MileageTracker
        destinations={DEFAULT_DESTINATIONS}
        vehicle={vehicle}
        tax={tax}
        theme="light"
        onTripLogged={(dest, miles) => {
          console.log(`Logged: ${dest} - ${miles} mi`);
        }}
      />
    </main>
  );
}
