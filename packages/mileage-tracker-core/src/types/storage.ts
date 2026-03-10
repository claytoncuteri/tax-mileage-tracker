/**
 * Storage adapter interface for pluggable data persistence.
 *
 * The library is backend-agnostic. Consumers provide a storage adapter
 * that implements this interface. Built-in adapters include:
 * - localStorage (offline-first, no setup)
 * - Google Sheets (tax spreadsheet integration)
 * - Supabase (hosted Postgres)
 *
 * Custom adapters can be written for Firebase, Airtable, etc.
 */

import type { Trip, OdometerReading, Destination, MileageTrackerConfig } from './trip';

export interface StorageAdapter {
  /** Retrieve all trips for a given tax year */
  getTrips(year: number): Promise<Trip[]>;

  /** Save a new trip */
  addTrip(trip: Trip): Promise<void>;

  /** Update an existing trip by ID */
  updateTrip(id: string, updates: Partial<Trip>): Promise<void>;

  /** Delete a trip by ID */
  deleteTrip(id: string): Promise<void>;

  /** Get odometer readings for a given year */
  getOdometerReadings(year: number): Promise<OdometerReading[]>;

  /** Save a new odometer reading */
  addOdometerReading(reading: OdometerReading): Promise<void>;

  /** Update an existing odometer reading */
  updateOdometerReading(id: string, updates: Partial<OdometerReading>): Promise<void>;

  /** Delete an odometer reading */
  deleteOdometerReading(id: string): Promise<void>;

  /** Get saved destinations (user customizations) */
  getDestinations(): Promise<Destination[]>;

  /** Save destinations list */
  saveDestinations(destinations: Destination[]): Promise<void>;

  /** Get saved configuration */
  getConfig(): Promise<Partial<MileageTrackerConfig> | null>;

  /** Save configuration */
  saveConfig(config: Partial<MileageTrackerConfig>): Promise<void>;
}
