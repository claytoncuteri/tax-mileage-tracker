/**
 * QuickLogger is the primary trip logging interface.
 *
 * It combines the DestinationGrid and TripInputPanel to let users
 * log trips in under 10 seconds: tap destination > review pre-filled
 * data > confirm. Integrates with the zustand store for persistence.
 */

import { useState, useCallback } from 'react';
import { DestinationGrid } from './DestinationGrid';
import { TripInputPanel } from './TripInputPanel';
import { useMileageStore } from '../../store';
import type { Destination } from '../../types';

interface QuickLoggerProps {
  /** Override destinations (defaults to store destinations) */
  destinations?: Destination[];
  /** Called after a trip is successfully logged */
  onTripLogged?: (destination: string, miles: number) => void;
}

export function QuickLogger({ destinations: propDestinations, onTripLogged }: QuickLoggerProps) {
  const storeDestinations = useMileageStore((s) => s.destinations);
  const addTrip = useMileageStore((s) => s.addTrip);

  const destinations = propDestinations ?? storeDestinations;
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeDestination = destinations.find((d) => d.id === activeId) ?? null;

  const handleSelect = useCallback(
    (dest: Destination) => {
      setActiveId((prev) => (prev === dest.id ? null : dest.id));
    },
    [],
  );

  const handleConfirm = useCallback(
    async (miles: number, note: string) => {
      if (!activeDestination) return;

      await addTrip(
        activeDestination.name,
        miles,
        activeDestination.type,
        note,
        activeDestination.category,
      );

      onTripLogged?.(activeDestination.name, miles);
      setActiveId(null);
    },
    [activeDestination, addTrip, onTripLogged],
  );

  const handleCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  if (destinations.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--mt-text-muted)',
          fontSize: 'var(--mt-font-size-base)',
        }}
      >
        <p>No destinations configured.</p>
        <p style={{ fontSize: 'var(--mt-font-size-sm)', marginTop: 8 }}>
          Add destinations in Settings to start logging trips.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <p
          style={{
            fontSize: 'var(--mt-font-size-sm)',
            color: 'var(--mt-text-muted)',
            margin: 0,
          }}
        >
          Tap destination, review details, log trip
        </p>
      </div>

      {/* Grid with inline input panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {destinations.map((dest) => (
          <div key={dest.id} style={{ gridColumn: activeId === dest.id ? '1 / -1' : undefined }}>
            <DestinationGrid
              destinations={[dest]}
              activeId={activeId}
              onSelect={handleSelect}
            />
            {activeId === dest.id && activeDestination && (
              <TripInputPanel
                destination={activeDestination}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
