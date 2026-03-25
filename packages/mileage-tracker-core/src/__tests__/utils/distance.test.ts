import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getHaversineDistance, calculateDistance } from '../../utils/distance';

describe('getHaversineDistance', () => {
  it('returns 0 for the same point', () => {
    const point = { lat: 32.7765, lng: -79.9311 };
    expect(getHaversineDistance(point, point)).toBe(0);
  });

  it('calculates a reasonable estimate for known city pair', () => {
    // New York to Los Angeles — straight-line ~2,451 mi, × 1.3 ≈ 3,186 mi
    const nyc = { lat: 40.7128, lng: -74.006 };
    const la = { lat: 34.0522, lng: -118.2437 };
    const distance = getHaversineDistance(nyc, la);
    expect(distance).toBeGreaterThan(3000);
    expect(distance).toBeLessThan(3500);
  });

  it('calculates a short distance correctly', () => {
    // Two points ~10 miles apart (Charleston, SC area)
    const home = { lat: 32.7765, lng: -79.9311 };
    const downtown = { lat: 32.7876, lng: -79.8023 };
    const distance = getHaversineDistance(home, downtown);
    expect(distance).toBeGreaterThan(5);
    expect(distance).toBeLessThan(20);
  });

  it('is symmetric (A→B same as B→A)', () => {
    const a = { lat: 40.7128, lng: -74.006 };
    const b = { lat: 34.0522, lng: -118.2437 };
    expect(getHaversineDistance(a, b)).toBeCloseTo(getHaversineDistance(b, a), 5);
  });
});

describe('calculateDistance', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('falls back to haversine when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const from = { lat: 40.7128, lng: -74.006 };
    const to = { lat: 40.758, lng: -73.9855 };
    const result = await calculateDistance(from, to);

    expect(result.source).toBe('haversine');
    expect(result.miles).toBeGreaterThan(0);
  });

  it('returns osrm source on successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        routes: [{ distance: 8046.72 }], // ~5 miles in meters
      }),
    });

    const from = { lat: 40.7128, lng: -74.006 };
    const to = { lat: 40.758, lng: -73.9855 };
    const result = await calculateDistance(from, to);

    expect(result.source).toBe('osrm');
    expect(result.miles).toBeCloseTo(5, 0);
  });

  it('falls back to haversine on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const from = { lat: 40.7128, lng: -74.006 };
    const to = { lat: 40.758, lng: -73.9855 };
    const result = await calculateDistance(from, to);

    expect(result.source).toBe('haversine');
  });

  it('rounds to one decimal place', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        routes: [{ distance: 12345.678 }],
      }),
    });

    const from = { lat: 40.7128, lng: -74.006 };
    const to = { lat: 40.758, lng: -73.9855 };
    const result = await calculateDistance(from, to);

    const decimalPlaces = (result.miles.toString().split('.')[1] ?? '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});
