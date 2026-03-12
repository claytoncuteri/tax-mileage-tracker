/**
 * DestinationGrid renders a 2-column grid of destination buttons.
 * Tapping a button selects it for trip logging. Each button shows
 * the destination name, default miles, and business/personal badge.
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
};

interface DestinationGridProps {
  destinations: Destination[];
  activeId: string | null;
  onSelect: (destination: Destination) => void;
}

export function DestinationGrid({ destinations, activeId, onSelect }: DestinationGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}
    >
      {destinations.map((dest) => {
        const IconComponent = ICON_MAP[dest.icon] ?? MapPin;
        const isActive = activeId === dest.id;

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
                  fontWeight: 'var(--mt-font-weight-semibold)' as unknown as number,
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
              <span
                style={{
                  fontSize: 'var(--mt-font-size-base)',
                  color: 'var(--mt-text-primary)',
                  fontWeight: 'var(--mt-font-weight-bold)' as unknown as number,
                }}
              >
                {dest.defaultMiles > 0 ? `${dest.defaultMiles} mi` : '? mi'}
              </span>
              <span
                style={{
                  fontSize: 'var(--mt-font-size-xs)',
                  fontWeight: 'var(--mt-font-weight-bold)' as unknown as number,
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
          </button>
        );
      })}
    </div>
  );
}
