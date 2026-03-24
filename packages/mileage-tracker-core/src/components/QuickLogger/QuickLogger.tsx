/**
 * QuickLogger is the primary trip logging interface.
 *
 * Flow: Select From place → Select To place → distance auto-calculates →
 * review in TripInputPanel → confirm. Integrates with the zustand store.
 */

import { useState, useCallback, useEffect } from 'react';
import { PlaceSelector } from './PlaceSelector';
import { DestinationGrid } from './DestinationGrid';
import { TripInputPanel } from './TripInputPanel';
import { useMileageStore } from '../../store';
import { calculateDistance } from '../../utils/distance';
import type { Destination, DistanceSource } from '../../types';

interface QuickLoggerProps {
  /** Override destinations (defaults to store destinations) */
  destinations?: Destination[];
  /** Called after a trip is successfully logged */
  onTripLogged?: (destination: string, miles: number) => void;
}

export function QuickLogger({ destinations: propDestinations, onTripLogged }: QuickLoggerProps) {
  const storeDestinations = useMileageStore((s) => s.destinations);
  const addTripV2 = useMileageStore((s) => s.addTripV2);
  const homeAddress = useMileageStore((s) => s.homeAddress);
  const homeCoordinates = useMileageStore((s) => s.homeCoordinates);

  const destinations = propDestinations ?? storeDestinations;

  // From → To state
  const [selectingField, setSelectingField] = useState<'from' | 'to'>('to');
  const [fromPlace, setFromPlace] = useState<Destination | null>(null);
  const [toPlace, setToPlace] = useState<Destination | null>(null);
  const [calculatedMiles, setCalculatedMiles] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [distanceSource, setDistanceSource] = useState<DistanceSource>('manual');
  const [showInput, setShowInput] = useState(false);

  // Synthesize a "Home" place from store home address
  const homePlace: Destination | null = homeAddress
    ? {
        id: '__home__',
        name: 'Home',
        address: homeAddress,
        coordinates: homeCoordinates ?? undefined,
        type: 'Personal',
        icon: 'home',
        color: '#85B7EB',
        defaultNote: '',
      }
    : null;

  // Default "from" to Home on mount
  useEffect(() => {
    if (homePlace && !fromPlace) {
      setFromPlace(homePlace);
    }
  }, [homeAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-calculate distance when both places have coordinates
  useEffect(() => {
    if (!fromPlace?.coordinates || !toPlace?.coordinates) {
      setCalculatedMiles(null);
      return;
    }

    let cancelled = false;
    setIsCalculating(true);

    calculateDistance(fromPlace.coordinates, toPlace.coordinates).then((result) => {
      if (cancelled) return;
      setCalculatedMiles(result.miles);
      setDistanceSource(result.source);
      setIsCalculating(false);
      setShowInput(true);
    });

    return () => { cancelled = true; };
  }, [fromPlace?.coordinates?.lat, fromPlace?.coordinates?.lng, toPlace?.coordinates?.lat, toPlace?.coordinates?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectPlace = useCallback(
    (dest: Destination) => {
      if (selectingField === 'from') {
        setFromPlace(dest);
        setSelectingField('to');
        setShowInput(false);
        setCalculatedMiles(null);
      } else {
        setToPlace(dest);
        // If both places now have coordinates, distance will auto-calc via effect
        // If not, show input immediately for manual entry
        if (fromPlace?.coordinates && dest.coordinates) {
          // Effect will handle it
        } else if (dest.defaultMiles && dest.defaultMiles > 0) {
          setCalculatedMiles(dest.defaultMiles);
          setDistanceSource('manual');
          setShowInput(true);
        } else {
          setCalculatedMiles(null);
          setDistanceSource('manual');
          setShowInput(true);
        }
      }
    },
    [selectingField, fromPlace],
  );

  const handleConfirm = useCallback(
    async (miles: number, note: string, isRoundTrip: boolean) => {
      if (!toPlace) return;

      const oneWayMiles = isRoundTrip ? miles / 2 : miles;

      await addTripV2({
        fromPlace: fromPlace ?? undefined,
        toPlace,
        miles,
        oneWayMiles,
        isRoundTrip,
        type: toPlace.type,
        purpose: note,
        category: toPlace.category,
        distanceSource,
      });

      onTripLogged?.(toPlace.name, miles);

      // Reset for next trip
      setToPlace(null);
      setShowInput(false);
      setCalculatedMiles(null);
      setSelectingField('to');
    },
    [fromPlace, toPlace, addTripV2, onTripLogged, distanceSource],
  );

  const handleCancel = useCallback(() => {
    setToPlace(null);
    setShowInput(false);
    setCalculatedMiles(null);
    setSelectingField('to');
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
        <p>No saved places configured.</p>
        <p style={{ fontSize: 'var(--mt-font-size-sm)', marginTop: 8 }}>
          Add places in Settings to start logging trips.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* From → To selector */}
      <PlaceSelector
        fromPlace={fromPlace}
        toPlace={toPlace}
        selectingField={selectingField}
        onSelectField={setSelectingField}
        calculatedMiles={calculatedMiles}
        isCalculating={isCalculating}
        distanceSource={distanceSource}
      />

      {/* Trip input panel (shown after selecting To place) */}
      {showInput && toPlace && (
        <TripInputPanel
          destination={toPlace}
          fromPlace={fromPlace}
          calculatedMiles={calculatedMiles}
          distanceSource={distanceSource}
          isCalculating={isCalculating}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Place grid (pick from or to) */}
      {!showInput && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <p
              style={{
                fontSize: 'var(--mt-font-size-sm)',
                color: 'var(--mt-text-muted)',
                margin: 0,
              }}
            >
              {selectingField === 'from'
                ? 'Select starting point'
                : 'Select destination'}
            </p>
          </div>
          <DestinationGrid
            destinations={destinations}
            activeId={null}
            onSelect={handleSelectPlace}
            showHomeOption={selectingField === 'from' && !!homePlace}
            homePlace={homePlace}
          />
        </>
      )}
    </div>
  );
}
