/**
 * A single trip entry in the trip log.
 * Shows destination, miles, date, type, and editable note.
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import type { Trip } from '../../types';
import { formatTripDate } from '../../utils';

interface TripLogEntryProps {
  trip: Trip;
  onUpdate: (id: string, updates: Partial<Trip>) => void;
  onDelete: (id: string) => void;
}

export function TripLogEntry({ trip, onUpdate, onDelete }: TripLogEntryProps) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(trip.purpose);

  const handleSaveNote = () => {
    onUpdate(trip.id, { purpose: noteText });
    setIsEditingNote(false);
  };

  const accentColor =
    trip.type === 'Business' ? 'var(--mt-color-business)' : 'var(--mt-color-personal)';

  return (
    <div
      style={{
        padding: '10px 0',
        borderBottom: '0.5px solid var(--mt-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Color bar */}
        <div
          style={{
            width: 4,
            borderRadius: 2,
            background: accentColor,
            minHeight: 44,
            marginTop: 2,
            flexShrink: 0,
          }}
        />

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div
              style={{
                fontSize: 'var(--mt-font-size-base)',
                color: 'var(--mt-text-secondary)',
                fontWeight: 600,
              }}
            >
              {trip.destination}
            </div>
            <div
              style={{
                fontSize: 'var(--mt-font-size-base)',
                color: 'var(--mt-text-primary)',
                fontWeight: 700,
              }}
            >
              {trip.roundTripMiles} mi
            </div>
          </div>

          <div
            style={{
              fontSize: 'var(--mt-font-size-xs)',
              color: 'var(--mt-text-faint)',
              marginTop: 2,
            }}
          >
            {formatTripDate(trip.date)}
            <span
              style={{
                color: accentColor,
                fontWeight: 600,
              }}
            >
              {' '}
              · {trip.type}
            </span>
          </div>

          {/* Editable note */}
          {isEditingNote ? (
            <div style={{ marginTop: 6 }}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--mt-radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'var(--mt-bg-input)',
                  color: 'var(--mt-text-primary)',
                  fontSize: 'var(--mt-font-size-xs)',
                  fontFamily: 'var(--mt-font-family)',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  outline: 'none',
                }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <button
                  onClick={handleSaveNote}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--mt-radius-sm)',
                    border: 'none',
                    background: 'var(--mt-color-success)',
                    color: '#000',
                    fontSize: 'var(--mt-font-size-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--mt-font-family)',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setNoteText(trip.purpose);
                    setIsEditingNote(false);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--mt-radius-sm)',
                    border: '0.5px solid var(--mt-border)',
                    background: 'transparent',
                    color: 'var(--mt-text-faint)',
                    fontSize: 'var(--mt-font-size-xs)',
                    cursor: 'pointer',
                    fontFamily: 'var(--mt-font-family)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingNote(true)}
              style={{
                fontSize: 'var(--mt-font-size-xs)',
                color: trip.purpose ? 'var(--mt-text-muted)' : 'var(--mt-text-faint)',
                marginTop: 4,
                fontStyle: trip.purpose ? 'normal' : 'italic',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              {trip.purpose || 'Tap to add note...'}
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(trip.id)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mt-text-faint)',
            cursor: 'pointer',
            padding: '2px 4px',
            marginTop: 2,
            opacity: 0.5,
          }}
          aria-label={`Delete trip to ${trip.destination}`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
