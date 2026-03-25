/**
 * Distance calculation between two coordinate pairs.
 *
 * Primary: OSRM (free, no API key) for actual driving distance.
 * Fallback: Haversine formula × 1.3 driving factor for offline use.
 */

import type { Coordinates, DistanceSource } from '../types';

export interface DistanceResult {
  /** Distance in miles */
  miles: number;
  /** How the distance was determined */
  source: DistanceSource;
}

const METERS_PER_MILE = 1609.344;
const EARTH_RADIUS_MILES = 3958.8;
const DRIVING_FACTOR = 1.3;
const OSRM_TIMEOUT_MS = 5000;

/**
 * Calculate driving distance between two coordinate pairs.
 * Tries OSRM first, falls back to Haversine × 1.3.
 */
export async function calculateDistance(
  from: Coordinates,
  to: Coordinates,
): Promise<DistanceResult> {
  try {
    const miles = await getOSRMDistance(from, to);
    return { miles: Math.round(miles * 10) / 10, source: 'osrm' };
  } catch {
    const miles = getHaversineDistance(from, to);
    return { miles: Math.round(miles * 10) / 10, source: 'haversine' };
  }
}

/**
 * Get driving distance via OSRM (Open Source Routing Machine).
 * Free public API, no key required.
 *
 * @throws on network failure, timeout, or invalid response
 * @returns distance in miles
 */
export async function getOSRMDistance(
  from: Coordinates,
  to: Coordinates,
): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS);

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`OSRM returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.routes?.[0]?.distance) {
      throw new Error('No route found');
    }

    return data.routes[0].distance / METERS_PER_MILE;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Calculate straight-line distance using the Haversine formula,
 * then multiply by a driving factor (1.3) to approximate road distance.
 *
 * Works entirely offline — no API calls.
 *
 * @returns estimated driving distance in miles
 */
export function getHaversineDistance(
  from: Coordinates,
  to: Coordinates,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = EARTH_RADIUS_MILES * c;

  return straightLine * DRIVING_FACTOR;
}
