import { describe, it, expect } from 'vitest';
import { exportTripsToCSV } from '../../utils/csv-export';
import type { Trip, TaxSettings, VehicleInfo } from '../../types';

const makeTrip = (overrides: Partial<Trip> = {}): Trip => ({
  id: 'test-1',
  date: '2026-03-10T14:30:00Z',
  destination: 'Downtown Charleston',
  roundTripMiles: 10,
  type: 'Business',
  purpose: 'Networking at luxury stores',
  category: 'Networking',
  createdAt: '2026-03-10T14:30:00Z',
  updatedAt: '2026-03-10T14:30:00Z',
  ...overrides,
});

const testTax: TaxSettings = {
  taxRate: 0.28,
  targetBusinessPercent: 0.70,
  taxYear: 2026,
  businessNames: ['Test LLC'],
  userName: 'Test User',
};

const testVehicle: VehicleInfo = {
  name: 'Test Car',
  cost: 60000,
};

describe('exportTripsToCSV', () => {
  it('includes header row with required columns', () => {
    const csv = exportTripsToCSV([makeTrip()], testTax, testVehicle, []);
    expect(csv).toContain('Date');
    expect(csv).toContain('Destination');
    expect(csv).toContain('Round Trip Miles');
    expect(csv).toContain('Business/Personal');
    expect(csv).toContain('Purpose/Notes');
  });

  it('includes trip data', () => {
    const csv = exportTripsToCSV([makeTrip()], testTax, testVehicle, []);
    expect(csv).toContain('Downtown Charleston');
    expect(csv).toContain('Networking at luxury stores');
    expect(csv).toContain('Business');
  });

  it('includes summary section', () => {
    const csv = exportTripsToCSV([makeTrip()], testTax, testVehicle, []);
    expect(csv).toContain('MILEAGE LOG SUMMARY');
    expect(csv).toContain('Test User');
    expect(csv).toContain('Test LLC');
    expect(csv).toContain('Test Car');
    expect(csv).toContain('2026');
  });

  it('calculates correct business percentage in summary', () => {
    const trips = [
      makeTrip({ id: '1', roundTripMiles: 30, type: 'Business' }),
      makeTrip({ id: '2', roundTripMiles: 10, type: 'Personal' }),
    ];
    const csv = exportTripsToCSV(trips, testTax, testVehicle, []);
    expect(csv).toContain('Business Use Percentage,75%');
  });

  it('handles empty trip list', () => {
    const csv = exportTripsToCSV([], testTax, testVehicle, []);
    expect(csv).toContain('Total Trips,0');
    expect(csv).toContain('Business Use Percentage,0%');
  });

  it('includes disclaimer', () => {
    const csv = exportTripsToCSV([], testTax, testVehicle, []);
    expect(csv).toContain('DISCLAIMER');
    expect(csv).toContain('tax professional');
  });
});
