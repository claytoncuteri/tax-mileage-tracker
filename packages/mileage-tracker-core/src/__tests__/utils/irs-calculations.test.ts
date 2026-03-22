import { describe, it, expect } from 'vitest';
import {
  getIrsRate,
  calculatePeriodStats,
  calculateMileageDeduction,
  calculateSection179Deduction,
  calculateTaxSavings,
  calculateFuelCost,
  milesNeededForTarget,
  formatCurrency,
} from '../../utils/irs-calculations';
import type { Trip, VehicleInfo } from '../../types';

const makeTip = (type: Trip['type'], miles: number): Trip => ({
  id: `test-${Math.random()}`,
  date: new Date().toISOString(),
  destination: 'Test',
  roundTripMiles: miles,
  type,
  purpose: 'Test purpose',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('getIrsRate', () => {
  it('returns known rates for 2024-2026', () => {
    expect(getIrsRate(2024)).toBe(0.67);
    expect(getIrsRate(2025)).toBe(0.70);
    expect(getIrsRate(2026)).toBe(0.70);
  });

  it('falls back to 2026 rate for unknown years', () => {
    expect(getIrsRate(2030)).toBe(0.70);
  });
});

describe('calculatePeriodStats', () => {
  it('returns zeros for empty trip list', () => {
    const stats = calculatePeriodStats([]);
    expect(stats.totalMiles).toBe(0);
    expect(stats.businessMiles).toBe(0);
    expect(stats.personalMiles).toBe(0);
    expect(stats.businessPercentage).toBe(0);
    expect(stats.tripCount).toBe(0);
  });

  it('calculates correct stats for mixed trips', () => {
    const trips = [
      makeTip('Business', 10),
      makeTip('Business', 20),
      makeTip('Personal', 10),
    ];
    const stats = calculatePeriodStats(trips);
    expect(stats.totalMiles).toBe(40);
    expect(stats.businessMiles).toBe(30);
    expect(stats.personalMiles).toBe(10);
    expect(stats.businessPercentage).toBe(75);
    expect(stats.tripCount).toBe(3);
    expect(stats.businessTripCount).toBe(2);
    expect(stats.personalTripCount).toBe(1);
  });

  it('handles 100% business use', () => {
    const trips = [makeTip('Business', 50)];
    const stats = calculatePeriodStats(trips);
    expect(stats.businessPercentage).toBe(100);
  });

  it('handles 100% personal use', () => {
    const trips = [makeTip('Personal', 50)];
    const stats = calculatePeriodStats(trips);
    expect(stats.businessPercentage).toBe(0);
  });
});

describe('calculateMileageDeduction', () => {
  it('multiplies business miles by IRS rate', () => {
    expect(calculateMileageDeduction(1000, 2026)).toBe(700);
  });

  it('returns 0 for zero miles', () => {
    expect(calculateMileageDeduction(0, 2026)).toBe(0);
  });
});

describe('calculateSection179Deduction', () => {
  it('calculates deduction based on vehicle cost and business percentage', () => {
    expect(calculateSection179Deduction(110000, 70)).toBe(77000);
  });

  it('returns 0 for zero cost vehicle', () => {
    expect(calculateSection179Deduction(0, 70)).toBe(0);
  });
});

describe('calculateTaxSavings', () => {
  it('multiplies deduction by tax rate', () => {
    expect(calculateTaxSavings(10000, 0.28)).toBeCloseTo(2800, 2);
  });
});

describe('calculateFuelCost', () => {
  it('calculates EV fuel cost correctly', () => {
    const vehicle: VehicleInfo = {
      name: 'Tesla',
      cost: 110000,
      kwhPerMile: 0.41,
      costPerKwh: 0.30,
    };
    const cost = calculateFuelCost(100, vehicle);
    expect(cost).toBeCloseTo(12.3, 1);
  });

  it('calculates gas fuel cost correctly', () => {
    const vehicle: VehicleInfo = {
      name: 'Camry',
      cost: 30000,
      mpg: 30,
      gasPricePerGallon: 3.50,
    };
    const cost = calculateFuelCost(150, vehicle);
    expect(cost).toBeCloseTo(17.5, 1);
  });

  it('returns 0 when no fuel specs provided', () => {
    const vehicle: VehicleInfo = { name: 'Unknown', cost: 0 };
    expect(calculateFuelCost(100, vehicle)).toBe(0);
  });
});

describe('milesNeededForTarget', () => {
  it('returns 0 when already above target', () => {
    expect(milesNeededForTarget(80, 20, 70)).toBe(0);
  });

  it('calculates correct miles needed', () => {
    const needed = milesNeededForTarget(30, 70, 70);
    // Need B such that (30+B)/(100+B) = 0.7
    // 30+B = 70+0.7B => 0.3B = 40 => B ≈ 134
    expect(needed).toBeGreaterThan(100);
    expect(needed).toBeLessThan(200);
  });

  it('returns 0 for zero total miles', () => {
    expect(milesNeededForTarget(0, 0, 70)).toBe(0);
  });
});

describe('formatCurrency', () => {
  it('formats dollars without cents', () => {
    expect(formatCurrency(1234)).toBe('$1,234');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });
});
