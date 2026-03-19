import { describe, it, expect, beforeEach } from 'vitest';
import { useMileageStore } from '../../store/mileage-store';

describe('useMileageStore', () => {
  beforeEach(() => {
    // Reset store state
    useMileageStore.setState({
      trips: [],
      destinations: [],
      odometerReadings: [],
      adapter: null,
      isLoading: false,
      isSyncing: false,
    });
  });

  it('starts with empty trips', () => {
    const { trips } = useMileageStore.getState();
    expect(trips).toEqual([]);
  });

  it('adds a trip', async () => {
    const { addTrip } = useMileageStore.getState();
    await addTrip('Downtown', 10, 'Business', 'Networking', 'Networking');

    const { trips } = useMileageStore.getState();
    expect(trips).toHaveLength(1);
    expect(trips[0].destination).toBe('Downtown');
    expect(trips[0].roundTripMiles).toBe(10);
    expect(trips[0].type).toBe('Business');
    expect(trips[0].purpose).toBe('Networking');
  });

  it('deletes a trip', async () => {
    const { addTrip } = useMileageStore.getState();
    await addTrip('Downtown', 10, 'Business', 'Test');

    const tripId = useMileageStore.getState().trips[0].id;
    const { deleteTrip } = useMileageStore.getState();
    await deleteTrip(tripId);

    expect(useMileageStore.getState().trips).toHaveLength(0);
  });

  it('updates a trip', async () => {
    const { addTrip } = useMileageStore.getState();
    await addTrip('Downtown', 10, 'Business', 'Original');

    const tripId = useMileageStore.getState().trips[0].id;
    const { updateTrip } = useMileageStore.getState();
    await updateTrip(tripId, { purpose: 'Updated' });

    expect(useMileageStore.getState().trips[0].purpose).toBe('Updated');
  });

  it('sets vehicle info', () => {
    const { setVehicle } = useMileageStore.getState();
    setVehicle({ name: 'Tesla', cost: 110000 });

    const { vehicle } = useMileageStore.getState();
    expect(vehicle.name).toBe('Tesla');
    expect(vehicle.cost).toBe(110000);
  });

  it('sets tax settings', () => {
    const { setTax } = useMileageStore.getState();
    setTax({
      taxRate: 0.28,
      targetBusinessPercent: 0.70,
      taxYear: 2026,
      businessNames: ['My LLC'],
      userName: 'Test',
    });

    const { tax } = useMileageStore.getState();
    expect(tax.taxRate).toBe(0.28);
    expect(tax.taxYear).toBe(2026);
  });

  it('adds and deletes odometer readings', async () => {
    const { addOdometerReading } = useMileageStore.getState();
    await addOdometerReading(50000, 'Start of year');

    expect(useMileageStore.getState().odometerReadings).toHaveLength(1);

    const readingId = useMileageStore.getState().odometerReadings[0].id;
    const { deleteOdometerReading } = useMileageStore.getState();
    await deleteOdometerReading(readingId);

    expect(useMileageStore.getState().odometerReadings).toHaveLength(0);
  });

  it('manages destinations', async () => {
    const { addDestination, removeDestination } = useMileageStore.getState();

    await addDestination({
      name: 'Test Dest',
      defaultMiles: 10,
      type: 'Business',
      icon: 'building',
      color: '#5DCAA5',
      defaultNote: 'Test',
    });

    expect(useMileageStore.getState().destinations).toHaveLength(1);

    const destId = useMileageStore.getState().destinations[0].id;
    await removeDestination(destId);

    expect(useMileageStore.getState().destinations).toHaveLength(0);
  });
});
