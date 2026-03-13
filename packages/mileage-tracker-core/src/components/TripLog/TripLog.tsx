/**
 * TripLog displays a scrollable list of logged trips, sorted by
 * date (newest first). Each entry supports inline note editing
 * and deletion.
 */

import { useMileageStore, useSortedTrips } from '../../store';
import { TripLogEntry } from './TripLogEntry';

interface TripLogProps {
  /** Maximum number of trips to display (undefined = all) */
  limit?: number;
}

export function TripLog({ limit }: TripLogProps) {
  const trips = useSortedTrips();
  const updateTrip = useMileageStore((s) => s.updateTrip);
  const deleteTrip = useMileageStore((s) => s.deleteTrip);

  const displayTrips = limit ? trips.slice(0, limit) : trips;

  if (trips.length === 0) {
    return (
      <p
        style={{
          color: 'var(--mt-text-faint)',
          fontSize: 'var(--mt-font-size-base)',
          textAlign: 'center',
          padding: 20,
        }}
      >
        No trips logged yet. Tap a destination above!
      </p>
    );
  }

  return (
    <div>
      {displayTrips.map((trip) => (
        <TripLogEntry
          key={trip.id}
          trip={trip}
          onUpdate={updateTrip}
          onDelete={deleteTrip}
        />
      ))}
      {limit && trips.length > limit && (
        <p
          style={{
            color: 'var(--mt-text-faint)',
            fontSize: 'var(--mt-font-size-sm)',
            textAlign: 'center',
            padding: '12px 0',
          }}
        >
          {trips.length - limit} more trips...
        </p>
      )}
    </div>
  );
}
