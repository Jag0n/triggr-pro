import { Platform } from 'react-native';

import '@/global.css';

/**
 * Triggr design tokens — contemporary sports-app look.
 * Dark-first, high-contrast, one bold accent.
 */

export const Palettes = {
  light: {
    background: '#F4F5F7',
    surface: '#FFFFFF',
    surfaceAlt: '#EBEDF1',
    border: '#E1E4E9',
    text: '#0E1116',
    textSecondary: '#59636F',
    textFaint: '#9AA3AF',
    accent: '#E8401F',
    onAccent: '#FFFFFF',
    accentSoft: 'rgba(232, 64, 31, 0.10)',
    success: '#1E9E60',
    successSoft: 'rgba(30, 158, 96, 0.12)',
    gold: '#C98F0A',
    goldSoft: 'rgba(201, 143, 10, 0.14)',
    danger: '#D93A30',
    dangerSoft: 'rgba(217, 58, 48, 0.10)',
    tabBar: '#FFFFFF',
    overlay: 'rgba(14, 17, 22, 0.45)',
  },
  dark: {
    background: '#0A0C0F',
    surface: '#14181D',
    surfaceAlt: '#1D2229',
    border: '#272E37',
    text: '#F4F6F8',
    textSecondary: '#9AA5B1',
    textFaint: '#5D6773',
    accent: '#FF4B2E',
    onAccent: '#FFFFFF',
    accentSoft: 'rgba(255, 75, 46, 0.16)',
    success: '#34C77B',
    successSoft: 'rgba(52, 199, 123, 0.14)',
    gold: '#F2B33D',
    goldSoft: 'rgba(242, 179, 61, 0.14)',
    danger: '#F0453A',
    dangerSoft: 'rgba(240, 69, 58, 0.14)',
    tabBar: '#14181D',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type ThemeColors = (typeof Palettes)['light'] | (typeof Palettes)['dark'];
export type ColorScheme = keyof typeof Palettes;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  web: {
    sans: 'var(--font-display)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
  default: {
    sans: 'normal',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 999,
} as const;

/** Tab bar floats above content; scrollable screens pad past it. */
export const TabBarClearance = 96;
export const MaxContentWidth = 560;
