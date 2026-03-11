/**
 * Zustand store for mileage tracking state.
 *
 * Manages trips, destinations, settings, and storage adapter coordination.
 * The store acts as the single source of truth for the UI, with async
 * syncing to the configured storage adapter.
 */

import { create } from 'zustand';
import type {
  Trip,
  Destination,
  OdometerReading,
  VehicleInfo,
  TaxSettings,
  StorageAdapter,
  ThemeMode,
} from '../types';
import { generateId, nowISO, getCurrentYear } from '../utils';

export interface MileageStoreState {
  // Data
  trips: Trip[];
  destinations: Destination[];
  odometerReadings: OdometerReading[];

  // Settings
  vehicle: VehicleInfo;
  tax: TaxSettings;
  theme: ThemeMode;
  currentYear: number;

  // Storage
  adapter: StorageAdapter | null;
  isLoading: boolean;
  isSyncing: boolean;

  // Actions - Trips
  addTrip: (
    destination: string,
    roundTripMiles: number,
    type: Trip['type'],
    purpose: string,
    category?: string,
    businessEntity?: string,
  ) => Promise<void>;
  updateTrip: (id: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  // Actions - Odometer
  addOdometerReading: (reading: number, note: string, date?: string) => Promise<void>;
  updateOdometerReading: (id: string, updates: Partial<OdometerReading>) => Promise<void>;
  deleteOdometerReading: (id: string) => Promise<void>;

  // Actions - Destinations
  setDestinations: (destinations: Destination[]) => Promise<void>;
  addDestination: (destination: Omit<Destination, 'id'>) => Promise<void>;
  updateDestination: (id: string, updates: Partial<Destination>) => Promise<void>;
  removeDestination: (id: string) => Promise<void>;

  // Actions - Settings
  setVehicle: (vehicle: VehicleInfo) => void;
  setTax: (tax: TaxSettings) => void;
  setTheme: (theme: ThemeMode) => void;
  setYear: (year: number) => Promise<void>;

  // Actions - Storage
  setAdapter: (adapter: StorageAdapter) => void;
  loadFromAdapter: () => Promise<void>;
}

/** Default vehicle info */
const DEFAULT_VEHICLE: VehicleInfo = {
  name: '',
  cost: 0,
};

/** Default tax settings */
const DEFAULT_TAX: TaxSettings = {
  taxRate: 0.22,
  targetBusinessPercent: 0.5,
  taxYear: getCurrentYear(),
  businessNames: [],
  userName: '',
};

export const useMileageStore = create<MileageStoreState>((set, get) => ({
  // Initial state
  trips: [],
  destinations: [],
  odometerReadings: [],
  vehicle: DEFAULT_VEHICLE,
  tax: DEFAULT_TAX,
  theme: 'dark',
  currentYear: getCurrentYear(),
  adapter: null,
  isLoading: false,
  isSyncing: false,

  // Trip actions
  addTrip: async (destination, roundTripMiles, type, purpose, category, businessEntity) => {
    const now = nowISO();
    const trip: Trip = {
      id: generateId(),
      date: now,
      destination,
      roundTripMiles,
      type,
      purpose,
      category,
      businessEntity,
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic update
    set((state) => ({ trips: [trip, ...state.trips] }));

    // Sync to adapter
    const { adapter } = get();
    if (adapter) {
      try {
        set({ isSyncing: true });
        await adapter.addTrip(trip);
      } catch (error) {
        console.error('Failed to sync trip to storage:', error);
      } finally {
        set({ isSyncing: false });
      }
    }
  },

  updateTrip: async (id, updates) => {
    const now = nowISO();
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: now } : t,
      ),
    }));

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.updateTrip(id, { ...updates, updatedAt: now });
      } catch (error) {
        console.error('Failed to update trip in storage:', error);
      }
    }
  },

  deleteTrip: async (id) => {
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== id),
    }));

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.deleteTrip(id);
      } catch (error) {
        console.error('Failed to delete trip from storage:', error);
      }
    }
  },

  // Odometer actions
  addOdometerReading: async (reading, note, date) => {
    const now = nowISO();
    const entry: OdometerReading = {
      id: generateId(),
      date: date ?? now,
      reading,
      note,
    };

    set((state) => ({
      odometerReadings: [...state.odometerReadings, entry],
    }));

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.addOdometerReading(entry);
      } catch (error) {
        console.error('Failed to sync odometer reading:', error);
      }
    }
  },

  updateOdometerReading: async (id, updates) => {
    set((state) => ({
      odometerReadings: state.odometerReadings.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      ),
    }));

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.updateOdometerReading(id, updates);
      } catch (error) {
        console.error('Failed to update odometer reading:', error);
      }
    }
  },

  deleteOdometerReading: async (id) => {
    set((state) => ({
      odometerReadings: state.odometerReadings.filter((r) => r.id !== id),
    }));

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.deleteOdometerReading(id);
      } catch (error) {
        console.error('Failed to delete odometer reading:', error);
      }
    }
  },

  // Destination actions
  setDestinations: async (destinations) => {
    set({ destinations });

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.saveDestinations(destinations);
      } catch (error) {
        console.error('Failed to sync destinations:', error);
      }
    }
  },

  addDestination: async (dest) => {
    const destination: Destination = { ...dest, id: generateId() };
    const newDestinations = [...get().destinations, destination];
    set({ destinations: newDestinations });

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.saveDestinations(newDestinations);
      } catch (error) {
        console.error('Failed to sync destinations:', error);
      }
    }
  },

  updateDestination: async (id, updates) => {
    const newDestinations = get().destinations.map((d) =>
      d.id === id ? { ...d, ...updates } : d,
    );
    set({ destinations: newDestinations });

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.saveDestinations(newDestinations);
      } catch (error) {
        console.error('Failed to sync destinations:', error);
      }
    }
  },

  removeDestination: async (id) => {
    const newDestinations = get().destinations.filter((d) => d.id !== id);
    set({ destinations: newDestinations });

    const { adapter } = get();
    if (adapter) {
      try {
        await adapter.saveDestinations(newDestinations);
      } catch (error) {
        console.error('Failed to sync destinations:', error);
      }
    }
  },

  // Settings actions
  setVehicle: (vehicle) => set({ vehicle }),
  setTax: (tax) => set({ tax }),
  setTheme: (theme) => set({ theme }),

  setYear: async (year) => {
    set({ currentYear: year, isLoading: true });

    const { adapter } = get();
    if (adapter) {
      try {
        const trips = await adapter.getTrips(year);
        const odometerReadings = await adapter.getOdometerReadings(year);
        set({ trips, odometerReadings, isLoading: false });
      } catch (error) {
        console.error('Failed to load data for year:', error);
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  // Storage actions
  setAdapter: (adapter) => set({ adapter }),

  loadFromAdapter: async () => {
    const { adapter, currentYear } = get();
    if (!adapter) return;

    set({ isLoading: true });
    try {
      const [trips, odometerReadings, destinations, config] = await Promise.all([
        adapter.getTrips(currentYear),
        adapter.getOdometerReadings(currentYear),
        adapter.getDestinations(),
        adapter.getConfig(),
      ]);

      set({
        trips,
        odometerReadings,
        ...(destinations.length > 0 ? { destinations } : {}),
        ...(config?.vehicle ? { vehicle: config.vehicle } : {}),
        ...(config?.tax ? { tax: config.tax } : {}),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load from storage adapter:', error);
      set({ isLoading: false });
    }
  },
}));
