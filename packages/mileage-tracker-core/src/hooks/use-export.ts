/**
 * React hook for CSV export functionality.
 */

import { useCallback } from 'react';
import { useMileageStore, useSortedTrips } from '../store';
import { exportTripsToCSV } from '../utils/csv-export';

export function useExport() {
  const trips = useSortedTrips();
  const tax = useMileageStore((s) => s.tax);
  const vehicle = useMileageStore((s) => s.vehicle);
  const odometerReadings = useMileageStore((s) => s.odometerReadings);

  const downloadCSV = useCallback(() => {
    const csv = exportTripsToCSV(trips, tax, vehicle, odometerReadings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mileage_Log_${tax.taxYear}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [trips, tax, vehicle, odometerReadings]);

  return { downloadCSV, tripCount: trips.length };
}
