/**
 * PlaceSelector renders the "From → To" route bar at the top of QuickLogger.
 * Users tap either end to switch the grid to selecting that field.
 */

import { ArrowRight, Home, MapPin, Loader2 } from 'lucide-react';
import type { Destination, DistanceSource } from '../../types';

interface PlaceSelectorProps {
  fromPlace: Destination | null;
  toPlace: Destination | null;
  selectingField: 'from' | 'to';
  onSelectField: (field: 'from' | 'to') => void;
  calculatedMiles: number | null;
  isCalculating: boolean;
  distanceSource?: DistanceSource;
}

export function PlaceSelector({
  fromPlace,
  toPlace,
  selectingField,
  onSelectField,
  calculatedMiles,
  isCalculating,
  distanceSource,
}: PlaceSelectorProps) {
  return (
    <div
      style={{
        background: 'var(--mt-bg-card)',
        border: '0.5px solid var(--mt-border)',
        borderRadius: 'var(--mt-radius-lg)',
        padding: '12px 14px',
        marginBottom: 12,
      }}
    >
      {/* From → To row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* From button */}
        <button
          onClick={() => onSelectField('from')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 'var(--mt-radius-md)',
            border: selectingField === 'from'
              ? '1.5px solid var(--mt-color-info)'
              : '1px solid var(--mt-border)',
            background: selectingField === 'from'
              ? 'var(--mt-bg-active)'
              : 'var(--mt-bg-input)',
            cursor: 'pointer',
            fontFamily: 'var(--mt-font-family)',
          }}
        >
          <Home size={14} color="var(--mt-text-muted)" />
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div
              style={{
                fontSize: 'var(--mt-font-size-xs)',
                color: 'var(--mt-text-muted)',
                fontWeight: 500,
              }}
            >
              From
            </div>
            <div
              style={{
                fontSize: 'var(--mt-font-size-sm)',
                color: 'var(--mt-text-primary)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {fromPlace?.name ?? 'Select...'}
            </div>
          </div>
        </button>

        {/* Arrow */}
        <ArrowRight size={16} color="var(--mt-text-faint)" />

        {/* To button */}
        <button
          onClick={() => onSelectField('to')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 10px',
            borderRadius: 'var(--mt-radius-md)',
            border: selectingField === 'to'
              ? '1.5px solid var(--mt-color-success)'
              : '1px solid var(--mt-border)',
            background: selectingField === 'to'
              ? 'var(--mt-bg-active)'
              : 'var(--mt-bg-input)',
            cursor: 'pointer',
            fontFamily: 'var(--mt-font-family)',
          }}
        >
          <MapPin size={14} color="var(--mt-text-muted)" />
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div
              style={{
                fontSize: 'var(--mt-font-size-xs)',
                color: 'var(--mt-text-muted)',
                fontWeight: 500,
              }}
            >
              To
            </div>
            <div
              style={{
                fontSize: 'var(--mt-font-size-sm)',
                color: 'var(--mt-text-primary)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {toPlace?.name ?? 'Select...'}
            </div>
          </div>
        </button>
      </div>

      {/* Distance display */}
      {(isCalculating || calculatedMiles !== null) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 8,
            paddingTop: 8,
            borderTop: '0.5px solid var(--mt-border)',
          }}
        >
          {isCalculating ? (
            <>
              <Loader2 size={14} color="var(--mt-text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 'var(--mt-font-size-sm)', color: 'var(--mt-text-muted)' }}>
                Calculating distance...
              </span>
            </>
          ) : (
            <>
              <span
                style={{
                  fontSize: 'var(--mt-font-size-lg)',
                  fontWeight: 700,
                  color: 'var(--mt-text-primary)',
                }}
              >
                {calculatedMiles} mi
              </span>
              <span style={{ fontSize: 'var(--mt-font-size-xs)', color: 'var(--mt-text-muted)' }}>
                one way
              </span>
              {distanceSource && distanceSource !== 'osrm' && (
                <span
                  style={{
                    fontSize: 'var(--mt-font-size-xs)',
                    color: 'var(--mt-color-warning)',
                    fontStyle: 'italic',
                  }}
                >
                  {distanceSource === 'haversine' ? '(estimated)' : '(manual)'}
                </span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
