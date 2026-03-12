/**
 * TripInputPanel is the slide-down form shown when a destination
 * is selected. It pre-fills miles and purpose, then lets the user
 * confirm or cancel the trip logging.
 */

import { useState, useEffect, useRef } from 'react';
import type { Destination } from '../../types';

interface TripInputPanelProps {
  destination: Destination;
  onConfirm: (miles: number, note: string) => void;
  onCancel: () => void;
}

export function TripInputPanel({ destination, onConfirm, onCancel }: TripInputPanelProps) {
  const [miles, setMiles] = useState(
    destination.defaultMiles > 0 ? String(destination.defaultMiles) : '',
  );
  const [note, setNote] = useState(destination.defaultNote);
  const milesRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus miles input if it's editable, otherwise focus note
    if (destination.defaultMiles === 0 && milesRef.current) {
      milesRef.current.focus();
    } else if (noteRef.current) {
      noteRef.current.focus();
    }
  }, [destination]);

  const handleConfirm = () => {
    const parsedMiles = parseFloat(miles);
    if (!parsedMiles || parsedMiles <= 0) return;
    onConfirm(parsedMiles, note);
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

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--mt-radius-md)',
        padding: 10,
        marginTop: 6,
        border: '0.5px solid var(--mt-border)',
      }}
    >
      {/* Miles input - shown if destination has no default miles */}
      {destination.defaultMiles === 0 && (
        <input
          ref={milesRef}
          type="number"
          inputMode="decimal"
          placeholder="Round trip miles"
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 'var(--mt-radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'var(--mt-bg-input)',
            color: 'var(--mt-text-primary)',
            fontSize: 'var(--mt-font-size-base)',
            fontFamily: 'var(--mt-font-family)',
            marginBottom: 6,
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      )}

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
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'var(--mt-bg-input)',
            color: 'var(--mt-text-primary)',
            fontSize: 'var(--mt-font-size-sm)',
            fontFamily: 'var(--mt-font-family)',
            marginBottom: 6,
            resize: 'vertical',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      )}

      {/* Pre-filled miles display for destinations with fixed distance */}
      {destination.defaultMiles > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6,
            padding: '4px 0',
          }}
        >
          <span
            style={{
              fontSize: 'var(--mt-font-size-sm)',
              color: 'var(--mt-text-muted)',
            }}
          >
            Distance:
          </span>
          <span
            style={{
              fontSize: 'var(--mt-font-size-base)',
              color: 'var(--mt-text-primary)',
              fontWeight: 600,
            }}
          >
            {destination.defaultMiles} mi round trip
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={handleConfirm}
          disabled={!miles || parseFloat(miles) <= 0}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 'var(--mt-radius-md)',
            border: 'none',
            background:
              miles && parseFloat(miles) > 0
                ? 'var(--mt-color-success)'
                : 'rgba(255, 255, 255, 0.1)',
            color: miles && parseFloat(miles) > 0 ? '#000' : 'var(--mt-text-faint)',
            fontSize: 'var(--mt-font-size-base)',
            fontWeight: 700,
            fontFamily: 'var(--mt-font-family)',
            cursor: miles && parseFloat(miles) > 0 ? 'pointer' : 'not-allowed',
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
