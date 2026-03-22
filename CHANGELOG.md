# Changelog

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
