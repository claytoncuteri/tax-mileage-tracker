# Changelog

## 0.2.0 (2026-03-25)

### Features

- Address-based "Saved Places" with GPS coordinates via OpenStreetMap geocoding
- From → To trip logging with auto-calculated driving distance
- OSRM routing integration (free, no API key) for accurate road distances
- Haversine formula fallback for offline distance estimation
- Round-trip vs one-way toggle on every trip
- Home Address field in Account settings as default trip origin
- Geocode button on each saved place to resolve GPS coordinates
- Distance source tracking (GPS routed / estimated / manual) per trip

### Improvements

- Light theme improvements with better contrast and card shadows
- CSV export now includes From, To, One Way Miles, Round Trip, and Distance Source columns
- Trip log entries show "From → To" route and round-trip/one-way badge
- Settings "Destinations" section renamed to "Saved Places" with address-first editing
- Removed personal information from demo defaults (uses gitignored local.config.ts)
- Added comprehensive legal disclaimer to README

### New Files

- `utils/distance.ts` — OSRM + Haversine distance calculation
- `utils/geocoding.ts` — OpenStreetMap Nominatim geocoding
- `components/QuickLogger/PlaceSelector.tsx` — From/To route selector bar
- `local.config.example.ts` — Template for personal configuration

### Types

- Added: `Coordinates`, `Place`, `DistanceSource`, `AddTripParams`
- Trip: added `fromPlaceId`, `fromPlaceName`, `toPlaceId`, `toPlaceName`, `isRoundTrip`, `oneWayMiles`, `distanceSource`
- Destination: `address` now required, added `coordinates`, `defaultMiles` now optional

## 0.1.0 (2026-03-22)

### Features

- QuickLogger: tap-to-log trip interface with destination grid and pre-filled forms
- WeeklyScorecard: current week business percentage with color-coded progress bar
- MonthlyDashboard: 12-month overview with recharts bar chart and summary cards
- AnnualSummary: year-level stats with deduction comparison and trend line
- ExportPanel: CSV export with IRS-compliant summary for tax professionals
- OdometerLog: start/end of year odometer tracking with discrepancy warnings
- Settings: configurable destinations, vehicle info, tax settings, and theme
- MileageTracker: composed full-page component with tab navigation

### Storage Adapters

- localStorage: zero-setup offline storage
- Google Sheets: tab-per-year integration with existing spreadsheets
- Supabase: experimental Postgres adapter

### Infrastructure

- CSS custom properties theming (--mt-* prefix) with dark/light/auto/inherit modes
- TypeScript strict mode throughout
- Zustand state management with optimistic updates
- Vitest unit tests for utils, store, and CSV export
- GitHub Actions CI pipeline (lint, test, build)
