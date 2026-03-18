/**
 * Supabase storage adapter (experimental).
 *
 * Stores mileage data in Supabase Postgres tables.
 * Requires the following tables:
 *
 * - trips: id, date, destination, round_trip_miles, type, purpose, category, business_entity, created_at, updated_at, user_id, year
 * - odometer_readings: id, date, reading, note, user_id, year
 * - destinations: id, name, subtitle, default_miles, type, icon, color, default_note, category, sort_order, address, user_id
 * - config: user_id (PK), data (JSONB)
 *
 * This adapter is experimental and provided as a starting point.
 * Users will likely need to adjust it for their specific Supabase setup.
 */

import type { StorageAdapter } from '../types/storage';
import type { Trip, OdometerReading, Destination, MileageTrackerConfig } from '../types/trip';

interface SupabaseConfig {
  /** Supabase project URL */
  url: string;
  /** Supabase anon key or service key */
  apiKey: string;
  /** User ID for row-level security */
  userId: string;
}

/**
 * Create a Supabase storage adapter.
 *
 * @experimental This adapter is a starting point and may need
 * customization for production use.
 */
export function createSupabaseAdapter(config: SupabaseConfig): StorageAdapter {
  const { url, apiKey, userId } = config;

  const headers = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };

  async function query<T>(table: string, params: string = ''): Promise<T[]> {
    const res = await fetch(`${url}/rest/v1/${table}?${params}`, { headers });
    if (!res.ok) throw new Error(`Supabase query failed: ${res.statusText}`);
    return res.json();
  }

  async function insert(table: string, data: Record<string, unknown>): Promise<void> {
    await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...data, user_id: userId }),
    });
  }

  async function update(table: string, id: string, data: Record<string, unknown>): Promise<void> {
    await fetch(`${url}/rest/v1/${table}?id=eq.${id}&user_id=eq.${userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
  }

  async function remove(table: string, id: string): Promise<void> {
    await fetch(`${url}/rest/v1/${table}?id=eq.${id}&user_id=eq.${userId}`, {
      method: 'DELETE',
      headers,
    });
  }

  return {
    async getTrips(year: number): Promise<Trip[]> {
      return query<Trip>('trips', `user_id=eq.${userId}&year=eq.${year}&order=date.desc`);
    },

    async addTrip(trip: Trip): Promise<void> {
      const year = new Date(trip.date).getFullYear();
      await insert('trips', {
        ...trip,
        round_trip_miles: trip.roundTripMiles,
        year,
      });
    },

    async updateTrip(id: string, updates: Partial<Trip>): Promise<void> {
      await update('trips', id, updates);
    },

    async deleteTrip(id: string): Promise<void> {
      await remove('trips', id);
    },

    async getOdometerReadings(year: number): Promise<OdometerReading[]> {
      return query<OdometerReading>('odometer_readings', `user_id=eq.${userId}&year=eq.${year}&order=date.asc`);
    },

    async addOdometerReading(reading: OdometerReading): Promise<void> {
      const year = new Date(reading.date).getFullYear();
      await insert('odometer_readings', { ...reading, year });
    },

    async updateOdometerReading(id: string, updates: Partial<OdometerReading>): Promise<void> {
      await update('odometer_readings', id, updates);
    },

    async deleteOdometerReading(id: string): Promise<void> {
      await remove('odometer_readings', id);
    },

    async getDestinations(): Promise<Destination[]> {
      return query<Destination>('destinations', `user_id=eq.${userId}&order=sort_order.asc`);
    },

    async saveDestinations(destinations: Destination[]): Promise<void> {
      // Delete existing and re-insert (simple approach)
      await fetch(`${url}/rest/v1/destinations?user_id=eq.${userId}`, {
        method: 'DELETE',
        headers,
      });
      for (const dest of destinations) {
        await insert('destinations', dest);
      }
    },

    async getConfig(): Promise<Partial<MileageTrackerConfig> | null> {
      const rows = await query<{ data: Partial<MileageTrackerConfig> }>(
        'config',
        `user_id=eq.${userId}`,
      );
      return rows[0]?.data ?? null;
    },

    async saveConfig(config: Partial<MileageTrackerConfig>): Promise<void> {
      // Upsert config
      await fetch(`${url}/rest/v1/config`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ user_id: userId, data: config }),
      });
    },
  };
}
