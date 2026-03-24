/**
 * TripInputPanel is the form shown after selecting From and To places.
 * Shows auto-calculated distance, round-trip toggle, and purpose field.
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowRightLeft, Loader2 } from 'lucide-react';
import type { Destination, DistanceSource } from '../../types';

interface TripInputPanelProps {
  destination: Destination;
  fromPlace?: Destination | null;
  calculatedMiles?: number | null;
  distanceSource?: DistanceSource;
  isCalculating?: boolean;
  onConfirm: (miles: number, note: string, isRoundTrip: boolean) => void;
  onCancel: () => void;
}

export function TripInputPanel({
  destination,
  fromPlace,
  calculatedMiles,
  distanceSource = 'manual',
  isCalculating = false,
  onConfirm,
  onCancel,
}: TripInputPanelProps) {
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [manualMiles, setManualMiles] = useState('');
  const [note, setNote] = useState(destination.defaultNote);
  const milesRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Determine effective one-way miles
  const oneWayMiles = calculatedMiles ?? (manualMiles ? parseFloat(manualMiles) : 0);
  const displayMiles = isRoundTrip ? oneWayMiles * 2 : oneWayMiles;
  const needsManualInput = calculatedMiles === null && !isCalculating;

  useEffect(() => {
    if (needsManualInput && milesRef.current) {
      milesRef.current.focus();
    } else if (noteRef.current) {
      noteRef.current.focus();
    }
  }, [needsManualInput]);

  const handleConfirm = () => {
    if (displayMiles <= 0) return;
    onConfirm(displayMiles, note, isRoundTrip);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const isPersonalTrip = destination.type === 'Personal';
  const canConfirm = displayMiles > 0 && !isCalculating;

  return (
    <div
      style={{
        background: 'var(--mt-bg-card)',
        borderRadius: 'var(--mt-radius-lg)',
        padding: 14,
        marginBottom: 12,
        border: '0.5px solid var(--mt-border)',
      }}
    >
      {/* Route summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          paddingBottom: 10,
          borderBottom: '0.5px solid var(--mt-border)',
        }}
      >
        <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-secondary)', fontWeight: 600 }}>
          {fromPlace?.name ?? 'Start'}
        </span>
        <ArrowRight size={14} color="var(--mt-text-faint)" />
        <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-primary)', fontWeight: 700 }}>
          {destination.name}
        </span>
      </div>

      {/* Distance + Round-trip toggle row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        {/* Distance display */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          {isCalculating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Loader2 size={16} color="var(--mt-text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)' }}>
                Calculating...
              </span>
            </div>
          ) : needsManualInput ? (
            <input
              ref={milesRef}
              type="number"
              inputMode="decimal"
              placeholder="Miles (one way)"
              value={manualMiles}
              onChange={(e) => setManualMiles(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: 130,
                padding: '6px 10px',
                borderRadius: 'var(--mt-radius-md)',
                border: '1px solid var(--mt-border)',
                background: 'var(--mt-bg-input)',
                color: 'var(--mt-text-primary)',
                fontSize: 'var(--mt-font-size-base)',
                fontFamily: 'var(--mt-font-family)',
                outline: 'none',
              }}
            />
          ) : (
            <>
              <span
                style={{
                  fontSize: 'var(--mt-font-size-xl)',
                  fontWeight: 700,
                  color: 'var(--mt-text-primary)',
                }}
              >
                {displayMiles}
              </span>
              <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)' }}>
                mi
              </span>
              {distanceSource === 'haversine' && (
                <span style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-color-warning)', fontStyle: 'italic' }}>
                  est.
                </span>
              )}
            </>
          )}
        </div>

        {/* Round-trip toggle */}
        <button
          onClick={() => setIsRoundTrip(!isRoundTrip)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            borderRadius: 'var(--mt-radius-full)',
            border: `1px solid ${isRoundTrip ? 'var(--mt-color-success)' : 'var(--mt-border)'}`,
            background: isRoundTrip ? 'rgba(93, 202, 165, 0.1)' : 'transparent',
            color: isRoundTrip ? 'var(--mt-color-success)' : 'var(--mt-text-muted)',
            fontSize: 'var(--mt-font-size-xs)',
            fontWeight: 600,
            fontFamily: 'var(--mt-font-family)',
            cursor: 'pointer',
          }}
        >
          {isRoundTrip ? (
            <>
              <ArrowRightLeft size={12} />
              Round trip
            </>
          ) : (
            <>
              <ArrowRight size={12} />
              One way
            </>
          )}
        </button>
      </div>

      {/* Purpose/notes textarea - hidden for personal trips */}
      {!isPersonalTrip && (
        <textarea
          ref={noteRef}
          placeholder="Purpose / notes (for IRS records)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 'var(--mt-radius-md)',
            border: '1px solid var(--mt-border)',
            background: 'var(--mt-bg-input)',
            color: 'var(--mt-text-primary)',
            fontSize: 'var(--mt-font-size-sm)',
            fontFamily: 'var(--mt-font-family)',
            marginBottom: 10,
            resize: 'vertical',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 'var(--mt-radius-md)',
            border: 'none',
            background: canConfirm ? 'var(--mt-color-success)' : 'var(--mt-bg-active)',
            color: canConfirm ? '#000' : 'var(--mt-text-faint)',
            fontSize: 'var(--mt-font-size-base)',
            fontWeight: 700,
            fontFamily: 'var(--mt-font-family)',
            cursor: canConfirm ? 'pointer' : 'not-allowed',
          }}
        >
          Log Trip
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--mt-radius-md)',
            border: '0.5px solid var(--mt-border)',
            background: 'transparent',
            color: 'var(--mt-text-faint)',
            fontSize: 'var(--mt-font-size-base)',
            fontFamily: 'var(--mt-font-family)',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
