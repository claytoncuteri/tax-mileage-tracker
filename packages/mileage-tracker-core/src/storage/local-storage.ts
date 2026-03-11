/**
 * localStorage storage adapter.
 *
 * Stores all data in browser localStorage as JSON, keyed by year.
 * Works offline with zero setup. Good as a fallback or for simple
 * single-device use cases.
 */

import type { StorageAdapter } from '../types/storage';
import type { Trip, OdometerReading, Destination, MileageTrackerConfig } from '../types/trip';

const PREFIX = 'mt_';

function getKey(type: string, year?: number): string {
  return year != null ? `${PREFIX}${type}_${year}` : `${PREFIX}${type}`;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Create a localStorage-based storage adapter.
 *
 * All data is stored as JSON strings in localStorage with the `mt_` prefix.
 * Trip data is keyed by year (e.g., `mt_trips_2026`).
 */
export function createLocalStorageAdapter(): StorageAdapter {
  return {
    async getTrips(year: number): Promise<Trip[]> {
      return readJSON<Trip[]>(getKey('trips', year), []);
    },

    async addTrip(trip: Trip): Promise<void> {
      const year = new Date(trip.date).getFullYear();
      const trips = readJSON<Trip[]>(getKey('trips', year), []);
      trips.unshift(trip);
      writeJSON(getKey('trips', year), trips);
    },

    async updateTrip(id: string, updates: Partial<Trip>): Promise<void> {
      // Check all years since we might not know which year the trip is in
      for (let y = 2020; y <= new Date().getFullYear() + 1; y++) {
        const key = getKey('trips', y);
        const trips = readJSON<Trip[]>(key, []);
        const idx = trips.findIndex((t) => t.id === id);
        if (idx >= 0) {
          trips[idx] = { ...trips[idx], ...updates };
          writeJSON(key, trips);
          return;
        }
      }
    },

    async deleteTrip(id: string): Promise<void> {
      for (let y = 2020; y <= new Date().getFullYear() + 1; y++) {
        const key = getKey('trips', y);
        const trips = readJSON<Trip[]>(key, []);
        const filtered = trips.filter((t) => t.id !== id);
        if (filtered.length !== trips.length) {
          writeJSON(key, filtered);
          return;
        }
      }
    },

    async getOdometerReadings(year: number): Promise<OdometerReading[]> {
      return readJSON<OdometerReading[]>(getKey('odometer', year), []);
    },

    async addOdometerReading(reading: OdometerReading): Promise<void> {
      const year = new Date(reading.date).getFullYear();
      const readings = readJSON<OdometerReading[]>(getKey('odometer', year), []);
      readings.push(reading);
      writeJSON(getKey('odometer', year), readings);
    },

    async updateOdometerReading(id: string, updates: Partial<OdometerReading>): Promise<void> {
      for (let y = 2020; y <= new Date().getFullYear() + 1; y++) {
        const key = getKey('odometer', y);
        const readings = readJSON<OdometerReading[]>(key, []);
        const idx = readings.findIndex((r) => r.id === id);
        if (idx >= 0) {
          readings[idx] = { ...readings[idx], ...updates };
          writeJSON(key, readings);
          return;
        }
      }
    },

    async deleteOdometerReading(id: string): Promise<void> {
      for (let y = 2020; y <= new Date().getFullYear() + 1; y++) {
        const key = getKey('odometer', y);
        const readings = readJSON<OdometerReading[]>(key, []);
        const filtered = readings.filter((r) => r.id !== id);
        if (filtered.length !== readings.length) {
          writeJSON(key, filtered);
          return;
        }
      }
    },

    async getDestinations(): Promise<Destination[]> {
      return readJSON<Destination[]>(getKey('destinations'), []);
    },

    async saveDestinations(destinations: Destination[]): Promise<void> {
      writeJSON(getKey('destinations'), destinations);
    },

    async getConfig(): Promise<Partial<MileageTrackerConfig> | null> {
      return readJSON<Partial<MileageTrackerConfig> | null>(getKey('config'), null);
    },

    async saveConfig(config: Partial<MileageTrackerConfig>): Promise<void> {
      writeJSON(getKey('config'), config);
    },
  };
}
