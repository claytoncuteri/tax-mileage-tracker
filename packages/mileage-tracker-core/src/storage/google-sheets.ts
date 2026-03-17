/**
 * Google Sheets storage adapter.
 *
 * Stores mileage data in a Google Sheet with tab-per-year structure.
 * The user pastes their Sheet URL, and the adapter creates tabs like
 * "Mileage 2026", "Odometer 2026" within that sheet.
 *
 * Requires Google OAuth token passed via config. The library does NOT
 * handle OAuth flows — the host application manages authentication.
 *
 * Sheet format:
 * - Mileage tab: Date | Destination | Category | RT Miles | Biz/Personal | Purpose/Notes | ID
 * - Odometer tab: Date | Reading | Note | ID
 * - Config tab: Key | Value (settings persistence)
 */

import type { StorageAdapter } from '../types/storage';
import type { Trip, OdometerReading, Destination, MileageTrackerConfig } from '../types/trip';
import { nowISO } from '../utils/date-helpers';
import { generateId } from '../utils/id';

interface GoogleSheetsConfig {
  /** Google Sheets spreadsheet ID (from the URL) */
  spreadsheetId: string;
  /** OAuth access token for Google Sheets API */
  accessToken: string;
  /** Base URL for the Sheets API (default: Google's API) */
  apiBaseUrl?: string;
}

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Create a Google Sheets storage adapter.
 *
 * The spreadsheet ID can be extracted from a Google Sheets URL:
 * https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
 */
export function createGoogleSheetsAdapter(config: GoogleSheetsConfig): StorageAdapter {
  const { spreadsheetId, accessToken, apiBaseUrl = SHEETS_API } = config;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const baseUrl = `${apiBaseUrl}/${spreadsheetId}`;

  /** Get or create a sheet tab */
  async function ensureTab(tabName: string, headerRow: string[]): Promise<void> {
    // Check if tab exists
    const res = await fetch(baseUrl, { headers });
    const data = await res.json();
    const sheets = data.sheets ?? [];
    const exists = sheets.some(
      (s: { properties: { title: string } }) => s.properties.title === tabName,
    );

    if (!exists) {
      // Create the tab
      await fetch(`${baseUrl}:batchUpdate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requests: [{ addSheet: { properties: { title: tabName } } }],
        }),
      });

      // Add header row
      await fetch(`${baseUrl}/values/${encodeURIComponent(tabName)}!A1:append?valueInputOption=RAW`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ values: [headerRow] }),
      });
    }
  }

  /** Read all rows from a tab */
  async function readTab(tabName: string): Promise<string[][]> {
    const res = await fetch(
      `${baseUrl}/values/${encodeURIComponent(tabName)}`,
      { headers },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.values ?? []).slice(1); // Skip header row
  }

  /** Append a row to a tab */
  async function appendRow(tabName: string, row: string[]): Promise<void> {
    await fetch(
      `${baseUrl}/values/${encodeURIComponent(tabName)}:append?valueInputOption=RAW`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ values: [row] }),
      },
    );
  }

  /** Find and update a row by ID (last column) */
  async function updateRow(tabName: string, id: string, row: string[]): Promise<void> {
    const res = await fetch(`${baseUrl}/values/${encodeURIComponent(tabName)}`, { headers });
    const data = await res.json();
    const rows: string[][] = data.values ?? [];

    const rowIndex = rows.findIndex((r) => r[r.length - 1] === id);
    if (rowIndex < 0) return;

    const range = `${tabName}!A${rowIndex + 1}`;
    await fetch(`${baseUrl}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ values: [row] }),
    });
  }

  /** Delete a row by ID */
  async function deleteRow(tabName: string, id: string): Promise<void> {
    const res = await fetch(baseUrl, { headers });
    const meta = await res.json();
    const sheet = meta.sheets?.find(
      (s: { properties: { title: string } }) => s.properties.title === tabName,
    );
    if (!sheet) return;

    const sheetId = sheet.properties.sheetId;
    const valuesRes = await fetch(`${baseUrl}/values/${encodeURIComponent(tabName)}`, { headers });
    const data = await valuesRes.json();
    const rows: string[][] = data.values ?? [];

    const rowIndex = rows.findIndex((r) => r[r.length - 1] === id);
    if (rowIndex < 0) return;

    await fetch(`${baseUrl}:batchUpdate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        requests: [
          {
            deleteDimension: {
              range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
            },
          },
        ],
      }),
    });
  }

  const mileageHeaders = ['Date', 'Destination', 'Category', 'RT Miles', 'Biz/Personal', 'Purpose/Notes', 'ID'];
  const odometerHeaders = ['Date', 'Reading', 'Note', 'ID'];

  function tripToRow(trip: Trip): string[] {
    return [
      trip.date,
      trip.destination,
      trip.category ?? '',
      String(trip.roundTripMiles),
      trip.type,
      trip.purpose,
      trip.id,
    ];
  }

  function rowToTrip(row: string[]): Trip {
    return {
      id: row[6] || generateId(),
      date: row[0],
      destination: row[1],
      category: row[2] || undefined,
      roundTripMiles: parseFloat(row[3]) || 0,
      type: (row[4] as Trip['type']) || 'Business',
      purpose: row[5] || '',
      createdAt: row[0],
      updatedAt: nowISO(),
    };
  }

  return {
    async getTrips(year: number): Promise<Trip[]> {
      const tabName = `Mileage ${year}`;
      await ensureTab(tabName, mileageHeaders);
      const rows = await readTab(tabName);
      return rows.map(rowToTrip);
    },

    async addTrip(trip: Trip): Promise<void> {
      const year = new Date(trip.date).getFullYear();
      const tabName = `Mileage ${year}`;
      await ensureTab(tabName, mileageHeaders);
      await appendRow(tabName, tripToRow(trip));
    },

    async updateTrip(id: string, updates: Partial<Trip>): Promise<void> {
      // Find which year tab has this trip
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 1; y <= currentYear + 1; y++) {
        const tabName = `Mileage ${y}`;
        const rows = await readTab(tabName);
        const row = rows.find((r) => r[6] === id);
        if (row) {
          const trip = { ...rowToTrip(row), ...updates };
          await updateRow(tabName, id, tripToRow(trip));
          return;
        }
      }
    },

    async deleteTrip(id: string): Promise<void> {
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 1; y <= currentYear + 1; y++) {
        const tabName = `Mileage ${y}`;
        try {
          await deleteRow(tabName, id);
          return;
        } catch {
          continue;
        }
      }
    },

    async getOdometerReadings(year: number): Promise<OdometerReading[]> {
      const tabName = `Odometer ${year}`;
      await ensureTab(tabName, odometerHeaders);
      const rows = await readTab(tabName);
      return rows.map((row) => ({
        id: row[3] || generateId(),
        date: row[0],
        reading: parseFloat(row[1]) || 0,
        note: row[2] || '',
      }));
    },

    async addOdometerReading(reading: OdometerReading): Promise<void> {
      const year = new Date(reading.date).getFullYear();
      const tabName = `Odometer ${year}`;
      await ensureTab(tabName, odometerHeaders);
      await appendRow(tabName, [reading.date, String(reading.reading), reading.note, reading.id]);
    },

    async updateOdometerReading(id: string, updates: Partial<OdometerReading>): Promise<void> {
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 1; y <= currentYear + 1; y++) {
        const tabName = `Odometer ${y}`;
        const rows = await readTab(tabName);
        const row = rows.find((r) => r[3] === id);
        if (row) {
          const reading: OdometerReading = {
            id,
            date: updates.date ?? row[0],
            reading: updates.reading ?? parseFloat(row[1]) ?? 0,
            note: updates.note ?? row[2] ?? '',
          };
          await updateRow(tabName, id, [reading.date, String(reading.reading), reading.note, reading.id]);
          return;
        }
      }
    },

    async deleteOdometerReading(id: string): Promise<void> {
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 1; y <= currentYear + 1; y++) {
        try {
          await deleteRow(`Odometer ${y}`, id);
          return;
        } catch {
          continue;
        }
      }
    },

    async getDestinations(): Promise<Destination[]> {
      // Destinations stored in a Config tab as JSON
      const rows = await readTab('Config');
      const destRow = rows.find((r) => r[0] === 'destinations');
      if (destRow?.[1]) {
        try {
          return JSON.parse(destRow[1]);
        } catch {
          return [];
        }
      }
      return [];
    },

    async saveDestinations(destinations: Destination[]): Promise<void> {
      await ensureTab('Config', ['Key', 'Value']);
      const rows = await readTab('Config');
      const existingIdx = rows.findIndex((r) => r[0] === 'destinations');
      if (existingIdx >= 0) {
        // Update existing row (offset by 2: header + 0-index)
        const range = `Config!A${existingIdx + 2}`;
        await fetch(`${baseUrl}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ values: [['destinations', JSON.stringify(destinations)]] }),
        });
      } else {
        await appendRow('Config', ['destinations', JSON.stringify(destinations)]);
      }
    },

    async getConfig(): Promise<Partial<MileageTrackerConfig> | null> {
      try {
        const rows = await readTab('Config');
        const configRow = rows.find((r) => r[0] === 'config');
        if (configRow?.[1]) return JSON.parse(configRow[1]);
      } catch {
        // Config tab might not exist yet
      }
      return null;
    },

    async saveConfig(config: Partial<MileageTrackerConfig>): Promise<void> {
      await ensureTab('Config', ['Key', 'Value']);
      const rows = await readTab('Config');
      const existingIdx = rows.findIndex((r) => r[0] === 'config');
      if (existingIdx >= 0) {
        const range = `Config!A${existingIdx + 2}`;
        await fetch(`${baseUrl}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ values: [['config', JSON.stringify(config)]] }),
        });
      } else {
        await appendRow('Config', ['config', JSON.stringify(config)]);
      }
    },
  };
}

/** Extract spreadsheet ID from a Google Sheets URL */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
}
