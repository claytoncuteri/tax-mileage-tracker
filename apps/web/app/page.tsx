'use client';

import { MileageTracker, DEFAULT_DESTINATIONS } from 'mileage-tracker-core';
import type { VehicleInfo, TaxSettings } from 'mileage-tracker-core';

const vehicle: VehicleInfo = {
  name: 'Tesla Cyberbeast',
  cost: 110000,
  kwhPerMile: 0.41,
  costPerKwh: 0.30,
};

const tax: TaxSettings = {
  taxRate: 0.28,
  targetBusinessPercent: 0.70,
  taxYear: new Date().getFullYear(),
  businessNames: ['Traveling To Consciousness LLC', 'Academy of Indigo Education'],
  userName: 'Clayton Cuteri',
};

export default function Home() {
  return (
    <main>
      <MileageTracker
        destinations={DEFAULT_DESTINATIONS}
        vehicle={vehicle}
        tax={tax}
        theme="dark"
        onTripLogged={(dest, miles) => {
          console.log(`Logged: ${dest} - ${miles} mi`);
        }}
      />
    </main>
  );
}
