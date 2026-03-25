import { describe, it, expect, vi, afterEach } from 'vitest';
import { geocodeAddress } from '../../utils/geocoding';

describe('geocodeAddress', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns null for empty address', async () => {
    expect(await geocodeAddress('')).toBeNull();
    expect(await geocodeAddress('   ')).toBeNull();
  });

  it('returns coordinates for a valid address', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        {
          lat: '32.7765',
          lon: '-79.9311',
          display_name: '123 Main St, Charleston, SC',
        },
      ]),
    });

    const result = await geocodeAddress('123 Main St, Charleston, SC');
    expect(result).not.toBeNull();
    expect(result!.coordinates.lat).toBeCloseTo(32.7765, 3);
    expect(result!.coordinates.lng).toBeCloseTo(-79.9311, 3);
    expect(result!.displayName).toContain('Charleston');
  });

  it('returns null when no results found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    expect(await geocodeAddress('xyznonexistentplace123')).toBeNull();
  });

  it('returns null on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    expect(await geocodeAddress('123 Main St')).toBeNull();
  });

  it('returns null on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    });

    expect(await geocodeAddress('123 Main St')).toBeNull();
  });
});
