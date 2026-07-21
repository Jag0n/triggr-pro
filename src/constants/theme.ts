import { Platform } from 'react-native';

import '@/global.css';

/**
 * Triggr design tokens — contemporary sports-app look.
 * Dark-first, high-contrast, one bold accent per theme.
 *
 * Themes are selectable in Profile → Appearance. Each theme ships a matched
 * light + dark palette; dark surfaces are subtly tinted toward the accent hue
 * so the whole screen feels intentional, not just recolored.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textFaint: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  gold: string;
  goldSoft: string;
  danger: string;
  dangerSoft: string;
  tabBar: string;
  overlay: string;
}

export type ColorScheme = 'light' | 'dark';

const STATUS_LIGHT = {
  success: '#1E9E60',
  successSoft: 'rgba(30, 158, 96, 0.12)',
  gold: '#C98F0A',
  goldSoft: 'rgba(201, 143, 10, 0.14)',
  danger: '#D93A30',
  dangerSoft: 'rgba(217, 58, 48, 0.10)',
  overlay: 'rgba(14, 17, 22, 0.45)',
} as const;

const STATUS_DARK = {
  success: '#34C77B',
  successSoft: 'rgba(52, 199, 123, 0.14)',
  gold: '#F2B33D',
  goldSoft: 'rgba(242, 179, 61, 0.14)',
  danger: '#F0453A',
  dangerSoft: 'rgba(240, 69, 58, 0.14)',
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

interface PaletteSpec {
  accent: string;
  onAccent?: string;
  accentSoft: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textFaint: string;
}

function lightPalette(spec: PaletteSpec): ThemeColors {
  return { onAccent: '#FFFFFF', ...STATUS_LIGHT, ...spec, tabBar: spec.surface };
}

function darkPalette(spec: PaletteSpec): ThemeColors {
  return { onAccent: '#FFFFFF', ...STATUS_DARK, ...spec, tabBar: spec.surface };
}

export type ThemeId = 'ember' | 'ocean' | 'ranger' | 'podium' | 'violet';

export interface ThemeDef {
  id: ThemeId;
  name: string;
  tagline: string;
  light: ThemeColors;
  dark: ThemeColors;
}

export const Themes: Record<ThemeId, ThemeDef> = {
  /** Signature Triggr red — bold, competitive. */
  ember: {
    id: 'ember',
    name: 'Ember',
    tagline: 'Signature red',
    light: lightPalette({
      accent: '#E8401F',
      accentSoft: 'rgba(232, 64, 31, 0.10)',
      background: '#F5F4F3',
      surface: '#FFFFFF',
      surfaceAlt: '#EEECEA',
      border: '#E4E1DE',
      text: '#16110F',
      textSecondary: '#6F625D',
      textFaint: '#A89E99',
    }),
    dark: darkPalette({
      accent: '#FF4B2E',
      accentSoft: 'rgba(255, 75, 46, 0.16)',
      background: '#0C0A09',
      surface: '#171412',
      surfaceAlt: '#211D1A',
      border: '#2E2926',
      text: '#F6F4F2',
      textSecondary: '#A89F9A',
      textFaint: '#6B625D',
    }),
  },

  /** Deep-water blue — calm focus, steady hands. */
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    tagline: 'Deep-water blue',
    light: lightPalette({
      accent: '#0A66E8',
      accentSoft: 'rgba(10, 102, 232, 0.10)',
      background: '#F2F4F8',
      surface: '#FFFFFF',
      surfaceAlt: '#E9EDF3',
      border: '#DEE4EC',
      text: '#0D1219',
      textSecondary: '#5B6673',
      textFaint: '#98A3B1',
    }),
    dark: darkPalette({
      accent: '#4D95FF',
      accentSoft: 'rgba(77, 149, 255, 0.16)',
      background: '#080B11',
      surface: '#111722',
      surfaceAlt: '#1A2230',
      border: '#253041',
      text: '#F2F5F9',
      textSecondary: '#93A0B2',
      textFaint: '#57657A',
    }),
  },

  /** Field green — outdoors, endurance, discipline. */
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    tagline: 'Field green',
    light: lightPalette({
      accent: '#0E8A50',
      accentSoft: 'rgba(14, 138, 80, 0.10)',
      background: '#F2F5F3',
      surface: '#FFFFFF',
      surfaceAlt: '#E9EEEA',
      border: '#DEE6E0',
      text: '#0E1410',
      textSecondary: '#5C6A60',
      textFaint: '#98A79C',
    }),
    dark: darkPalette({
      accent: '#2FCF85',
      accentSoft: 'rgba(47, 207, 133, 0.15)',
      background: '#080D0A',
      surface: '#111915',
      surfaceAlt: '#1A241E',
      border: '#25332B',
      text: '#F1F6F3',
      textSecondary: '#93A69A',
      textFaint: '#586C60',
      onAccent: '#04140C',
    }),
  },

  /** Champion gold — podium finishes, medal energy. */
  podium: {
    id: 'podium',
    name: 'Podium',
    tagline: 'Champion gold',
    light: lightPalette({
      accent: '#A97908',
      onAccent: '#241A05',
      accentSoft: 'rgba(169, 121, 8, 0.12)',
      background: '#F6F4F0',
      surface: '#FFFFFF',
      surfaceAlt: '#EFEBE3',
      border: '#E6E0D4',
      text: '#151209',
      textSecondary: '#6E6656',
      textFaint: '#A8A08F',
    }),
    dark: darkPalette({
      accent: '#F2B33D',
      accentSoft: 'rgba(242, 179, 61, 0.15)',
      background: '#0C0A06',
      surface: '#171410',
      surfaceAlt: '#221E16',
      border: '#302A1E',
      text: '#F6F4F0',
      textSecondary: '#A9A091',
      textFaint: '#6C6455',
      onAccent: '#1A1206',
    }),
  },

  /** Night violet — late sessions under the lights. */
  violet: {
    id: 'violet',
    name: 'Violet',
    tagline: 'Night session',
    light: lightPalette({
      accent: '#6D3BEF',
      accentSoft: 'rgba(109, 59, 239, 0.10)',
      background: '#F4F3F8',
      surface: '#FFFFFF',
      surfaceAlt: '#ECEAF3',
      border: '#E2DFEC',
      text: '#121019',
      textSecondary: '#645E73',
      textFaint: '#A29CB2',
    }),
    dark: darkPalette({
      accent: '#9D7BFF',
      accentSoft: 'rgba(157, 123, 255, 0.16)',
      background: '#0A0910',
      surface: '#15121E',
      surfaceAlt: '#1F1B2B',
      border: '#2C273C',
      text: '#F4F2F9',
      textSecondary: '#9C95B0',
      textFaint: '#615A76',
    }),
  },
};

export const THEME_IDS = Object.keys(Themes) as ThemeId[];
export const DEFAULT_THEME_ID: ThemeId = 'ember';

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
