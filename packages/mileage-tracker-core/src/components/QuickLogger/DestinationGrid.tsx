/**
 * DestinationGrid renders a 2-column grid of place buttons.
 * Used as a picker for the "From" or "To" field in QuickLogger.
 */

import {
  Building2,
  Briefcase,
  Landmark,
  Handshake,
  ShoppingBag,
  GraduationCap,
  BookOpen,
  Camera,
  Car,
  Dumbbell,
  ShoppingCart,
  MapPin,
  Home,
  type LucideIcon,
} from 'lucide-react';
import type { Destination } from '../../types';

/** Map icon string names to lucide-react components */
const ICON_MAP: Record<string, LucideIcon> = {
  building: Building2,
  briefcase: Briefcase,
  bank: Landmark,
  handshake: Handshake,
  bag: ShoppingBag,
  graduation: GraduationCap,
  book: BookOpen,
  camera: Camera,
  car: Car,
  dumbbell: Dumbbell,
  cart: ShoppingCart,
  pin: MapPin,
  home: Home,
};

interface DestinationGridProps {
  destinations: Destination[];
  activeId: string | null;
  onSelect: (destination: Destination) => void;
  /** Show a "Home" entry at the top of the grid */
  showHomeOption?: boolean;
  /** The Home place to show (synthesized from store) */
  homePlace?: Destination | null;
}

function truncateAddress(address: string, maxLen = 30): string {
  if (!address || address.length <= maxLen) return address;
  return address.slice(0, maxLen - 1) + '…';
}

export function DestinationGrid({
  destinations,
  activeId,
  onSelect,
  showHomeOption,
  homePlace,
}: DestinationGridProps) {
  const allPlaces = showHomeOption && homePlace
    ? [homePlace, ...destinations]
    : destinations;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}
    >
      {allPlaces.map((dest) => {
        const IconComponent = ICON_MAP[dest.icon] ?? MapPin;
        const isActive = activeId === dest.id;
        const hasCoords = !!dest.coordinates;

        return (
          <button
            key={dest.id}
            onClick={() => onSelect(dest)}
            style={{
              width: '100%',
              background: isActive ? 'var(--mt-bg-card-hover)' : 'var(--mt-bg-card)',
              border: isActive
                ? `1.5px solid ${dest.color}`
                : '0.5px solid var(--mt-border)',
              borderRadius: 'var(--mt-radius-lg)',
              padding: '12px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: `all var(--mt-transition-fast)`,
              fontFamily: 'var(--mt-font-family)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
              }}
            >
              <IconComponent size={20} color={dest.color} strokeWidth={2} />
              <div
                style={{
                  fontSize: 'var(--mt-font-size-sm)',
                  color: 'var(--mt-text-secondary)',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {dest.name}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* Address or miles */}
              <span
                style={{
                  fontSize: 'var(--mt-font-size-xs)',
                  color: 'var(--mt-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '65%',
                }}
              >
                {dest.address ? truncateAddress(dest.address, 22) : (
                  dest.defaultMiles && dest.defaultMiles > 0
                    ? `${dest.defaultMiles} mi`
                    : 'No address'
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* GPS indicator */}
                {hasCoords && (
                  <span
                    style={{
                      fontSize: 9,
                      color: 'var(--mt-color-success)',
                    }}
                    title="GPS coordinates available"
                  >
                    ●
                  </span>
                )}
                <span
                  style={{
                    fontSize: 'var(--mt-font-size-xs)',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--mt-radius-sm)',
                    background:
                      dest.type === 'Business'
                        ? 'rgba(93, 202, 165, 0.15)'
                        : 'rgba(144, 144, 144, 0.15)',
                    color:
                      dest.type === 'Business'
                        ? 'var(--mt-color-business)'
                        : 'var(--mt-color-personal)',
                  }}
                >
                  {dest.type}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
