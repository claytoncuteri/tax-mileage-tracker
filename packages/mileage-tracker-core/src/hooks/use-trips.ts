/**
 * React hook for trip CRUD operations.
 * Thin wrapper around the zustand store providing a clean API.
 */

import { useCallback } from 'react';
import { useMileageStore, useSortedTrips } from '../store';
import type { Trip, TripType } from '../types';

export interface UseTripsReturn {
  trips: Trip[];
  isLoading: boolean;
  isSyncing: boolean;
  addTrip: (
    destination: string,
    miles: number,
    type: TripType,
    purpose: string,
    category?: string,
  ) => Promise<void>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
}

export function useTrips(): UseTripsReturn {
  const trips = useSortedTrips();
  const isLoading = useMileageStore((s) => s.isLoading);
  const isSyncing = useMileageStore((s) => s.isSyncing);
  const storeAddTrip = useMileageStore((s) => s.addTrip);
  const storeUpdateTrip = useMileageStore((s) => s.updateTrip);
  const storeDeleteTrip = useMileageStore((s) => s.deleteTrip);

  const addTrip = useCallback(
    async (
      destination: string,
      miles: number,
      type: TripType,
      purpose: string,
      category?: string,
    ) => {
      await storeAddTrip(destination, miles, type, purpose, category);
    },
    [storeAddTrip],
  );

  const updateTrip = useCallback(
    async (id: string, updates: Partial<Trip>) => {
      await storeUpdateTrip(id, updates);
    },
    [storeUpdateTrip],
  );

  const deleteTrip = useCallback(
    async (id: string) => {
      await storeDeleteTrip(id);
    },
    [storeDeleteTrip],
  );

  return { trips, isLoading, isSyncing, addTrip, updateTrip, deleteTrip };
}
