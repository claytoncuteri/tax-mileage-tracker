# Tax Mileage Tracker

[![CI](https://github.com/claytoncuteri/tax-mileage-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/claytoncuteri/tax-mileage-tracker/actions/workflows/ci.yml)

A reusable, IRS-compliant mileage tracking React component library for tracking business vs personal vehicle mileage for tax deductions. Supports Section 179 depreciation, standard mileage rate deduction, and fleet management.

Published as an npm package **and** includes a standalone app that can be deployed behind auth on any website.

## Why

The IRS requires contemporaneous mileage records for vehicle deductions (Publication 463). Most people either forget to log trips or use clunky spreadsheets. This library makes it easy: tap a destination, review pre-filled details, log the trip in under 10 seconds.

## Quick Start

### Install

```bash
npm install mileage-tracker-core
```

### Embed in your React app

```tsx
import { MileageTracker } from 'mileage-tracker-core';
import 'mileage-tracker-core/styles';

<MileageTracker
  destinations={[
    { id: 'office', name: 'Office', defaultMiles: 12, type: 'Business', icon: 'building', color: '#5DCAA5', defaultNote: 'Daily commute to office' },
    { id: 'client', name: 'Client Visit', defaultMiles: 0, type: 'Business', icon: 'briefcase', color: '#85B7EB', defaultNote: 'Client meeting' },
  ]}
  vehicle={{ name: 'My Car', cost: 45000 }}
  tax={{ taxRate: 0.24, targetBusinessPercent: 0.7, taxYear: 2026, businessNames: ['My LLC'], userName: 'Your Name' }}
  theme="dark"
/>
```

### Use individual components

```tsx
import { QuickLogger, WeeklyScorecard, ExportPanel, useMileageStore } from 'mileage-tracker-core';

function MyCustomLayout() {
  return (
    <>
      <WeeklyScorecard targetPercent={70} />
      <QuickLogger destinations={myDestinations} />
      <ExportPanel />
    </>
  );
}
```

## Standalone App Setup

```bash
git clone https://github.com/claytoncuteri/tax-mileage-tracker.git
cd tax-mileage-tracker
npm install
npm run dev
```

The demo app runs at `http://localhost:3000` with localStorage for data persistence.

### Personal Configuration

The demo app ships with generic placeholder data. To use your own vehicle, tax, and business info, create a local config file (which is `.gitignored` so your personal data stays private):

```bash
cp apps/web/app/local.config.example.ts apps/web/app/local.config.ts
```

Edit `local.config.ts` with your details:

```typescript
import type { VehicleInfo, TaxSettings } from 'mileage-tracker-core';

export const vehicle: VehicleInfo = {
  name: 'My Car',
  cost: 45000,
  kwhPerMile: 0.25,   // EV
  costPerKwh: 0.12,
};

export const tax: TaxSettings = {
  taxRate: 0.24,
  targetBusinessPercent: 0.70,
  taxYear: 2026,
  businessNames: ['My Business LLC'],
  userName: 'Your Name',
};
```

The app automatically picks up `local.config.ts` on reload. If the file doesn't exist, it falls back to demo defaults.

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | For Google Sheets | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For Google Sheets | Google OAuth client secret |
| `SUPABASE_URL` | For Supabase | Supabase project URL |
| `SUPABASE_ANON_KEY` | For Supabase | Supabase anonymous key |

## Configuration

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `destinations` | `Destination[]` | `DEFAULT_DESTINATIONS` | Pre-configured trip buttons |
| `vehicle` | `VehicleInfo` | — | Vehicle name, cost, fuel specs |
| `tax` | `TaxSettings` | — | Tax rate, target %, year, businesses |
| `theme` | `'dark' \| 'light' \| 'auto' \| 'inherit'` | `'dark'` | Color theme |
| `storageAdapter` | `StorageAdapter` | `localStorage` | Data persistence backend |
| `homeAddress` | `string` | — | Home address for distance calculations |
| `onTripLogged` | `(dest, miles) => void` | — | Callback after trip is logged |

### Destinations

Each destination has:

```typescript
interface Destination {
  id: string;
  name: string;           // Display name
  subtitle?: string;      // Secondary text
  defaultMiles: number;   // 0 = user enters manually
  type: 'Business' | 'Personal';
  icon: string;           // lucide-react icon name
  color: string;          // Accent color (hex)
  defaultNote: string;    // Pre-filled IRS purpose
  category?: string;      // Grouping label
  address?: string;       // Street address for distance lookup
}
```

### Vehicle Info

Supports both EV and gas vehicles:

```typescript
// EV
{ name: 'Tesla Model 3', cost: 45000, kwhPerMile: 0.25, costPerKwh: 0.12 }

// Gas
{ name: 'Toyota Camry', cost: 30000, mpg: 32, gasPricePerGallon: 3.50 }
```

## Storage Adapters

### localStorage (default)

Zero setup. Data stored in browser localStorage keyed by year (`mt_trips_2026`). Good for single-device use or as a fallback.

### Google Sheets

Connect to an existing Google Sheet. Creates year-specific tabs (`Mileage 2026`, `Odometer 2026`). Your data lives in your own spreadsheet.

```typescript
import { createGoogleSheetsAdapter, extractSpreadsheetId } from 'mileage-tracker-core';

const adapter = createGoogleSheetsAdapter({
  spreadsheetId: extractSpreadsheetId('https://docs.google.com/spreadsheets/d/abc123/edit')!,
  accessToken: 'your-oauth-token',
});

<MileageTracker storageAdapter={adapter} />
```

### Supabase

Experimental adapter for Supabase Postgres.

```typescript
import { createSupabaseAdapter } from 'mileage-tracker-core';

const adapter = createSupabaseAdapter({
  url: 'https://your-project.supabase.co',
  apiKey: 'your-anon-key',
  userId: 'user-id',
});
```

### Custom Adapter

Implement the `StorageAdapter` interface for any backend:

```typescript
interface StorageAdapter {
  getTrips(year: number): Promise<Trip[]>;
  addTrip(trip: Trip): Promise<void>;
  updateTrip(id: string, updates: Partial<Trip>): Promise<void>;
  deleteTrip(id: string): Promise<void>;
  getOdometerReadings(year: number): Promise<OdometerReading[]>;
  addOdometerReading(reading: OdometerReading): Promise<void>;
  // ... see types/storage.ts for full interface
}
```

## Theming

All styling uses CSS custom properties with the `--mt-` prefix. Override any variable on the `[data-mileage-tracker]` selector:

```css
[data-mileage-tracker] {
  --mt-font-family: 'Playfair Display', serif;
  --mt-bg-primary: #2C1810;
  --mt-color-success: #7CB342;
  --mt-radius-lg: 4px;
}
```

Set `theme="inherit"` to disable all default styles and let host CSS control everything.

## IRS Compliance

### Required fields (per Publication 463)

Every business trip records:
- **Date** — when the trip occurred
- **Destination** — where you drove
- **Miles** — round-trip distance
- **Type** — business or personal
- **Purpose** — specific business reason

### Annual odometer readings

The IRS also requires start and end-of-year odometer readings. Use the OdometerLog component to record these.

### Export format

The CSV export includes all required fields plus a summary section with taxpayer info, business use percentage, and deduction estimates. Hand this to your accountant at tax time.

> **⚠️ Important Disclaimer**
>
> This software is provided for **record-keeping purposes only** and does **not** constitute tax, legal, or financial advice. The IRS mileage rates, deduction calculations, and compliance guidance referenced in this tool are approximations and may not reflect the most current regulations.
>
> - **Always consult a qualified tax professional or CPA** before claiming any vehicle deductions on your tax return.
> - **Verify all mileage entries and calculations** before submitting to the IRS or including in any tax filing.
> - **This tool is not a substitute for professional tax preparation.** Tax law is complex and varies by situation.
> - The authors and contributors of this software assume **no liability** for errors, omissions, or any tax penalties resulting from the use of this tool.
> - **Double-check your numbers.** Maintain separate records and reconcile them with this tool's output before filing.
>
> By using this software, you acknowledge that you are solely responsible for the accuracy of your tax records and filings.

## Development

```bash
# Install dependencies
npm install

# Run demo app
npm run dev

# Build core library
npm run build:core

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
cd packages/mileage-tracker-core && npx tsc --noEmit
```

### Project Structure

```
tax-mileage-tracker/
├── packages/
│   └── mileage-tracker-core/   # npm publishable library
│       └── src/
│           ├── components/     # React components
│           ├── store/          # Zustand state management
│           ├── storage/        # Storage adapters
│           ├── hooks/          # React hooks
│           ├── utils/          # Calculations, dates, CSV
│           ├── theme/          # CSS variables & presets
│           ├── types/          # TypeScript interfaces
│           └── __tests__/      # Vitest tests
├── apps/
│   └── web/                    # Next.js demo app
└── .github/workflows/          # CI pipeline
```

## License

MIT
