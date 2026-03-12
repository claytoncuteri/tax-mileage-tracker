/**
 * ThemeProvider wraps the mileage tracker components and applies
 * the CSS custom properties theme. Supports dark, light, auto,
 * and inherit modes.
 */

import { useEffect, useState, type ReactNode } from 'react';
import type { ThemeMode } from '../types/theme';
import { resolveThemeMode } from '../theme/presets';
import '../theme/variables.css';

interface ThemeProviderProps {
  mode?: ThemeMode;
  children: ReactNode;
  className?: string;
}

export function ThemeProvider({ mode = 'dark', children, className }: ThemeProviderProps) {
  const [resolvedMode, setResolvedMode] = useState<'dark' | 'light' | 'inherit'>(() =>
    resolveThemeMode(mode),
  );

  useEffect(() => {
    if (mode !== 'auto') {
      setResolvedMode(resolveThemeMode(mode));
      return;
    }

    // Listen for system theme changes when in auto mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setResolvedMode(e.matches ? 'dark' : 'light');
    };

    setResolvedMode(mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mode]);

  // In inherit mode, don't set a theme attribute - let host CSS control everything
  const themeAttr = resolvedMode === 'inherit' ? undefined : resolvedMode;

  return (
    <div
      data-mileage-tracker={themeAttr ?? ''}
      className={className}
      style={{
        fontFamily: 'var(--mt-font-family)',
        color: 'var(--mt-text-primary)',
      }}
    >
      {children}
    </div>
  );
}
