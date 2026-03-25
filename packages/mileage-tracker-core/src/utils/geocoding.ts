/**
 * Geocoding utility using OpenStreetMap Nominatim.
 * Free, no API key required. Respects usage policy (1 req/sec).
 */

import type { Coordinates } from '../types';

export interface GeocodeResult {
  /** Resolved GPS coordinates */
  coordinates: Coordinates;
  /** Formatted address returned by Nominatim */
  displayName: string;
}

const NOMINATIM_TIMEOUT_MS = 5000;

/**
 * Geocode an address string to GPS coordinates using OSM Nominatim.
 *
 * @param address - Street address, city, or place name
 * @returns Geocode result or null if not found / network error
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodeResult | null> {
  if (!address.trim()) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'tax-mileage-tracker/0.1.0',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      },
      displayName: result.display_name ?? address,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
