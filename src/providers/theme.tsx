import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import {
  DEFAULT_THEME_ID,
  Themes,
  type ColorScheme,
  type ThemeColors,
  type ThemeDef,
  type ThemeId,
} from '@/constants/theme';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  colors: ThemeColors;
  scheme: ColorScheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Flip between light and dark (sets an explicit mode). */
  toggle: () => void;
  /** Active color theme (accent family). */
  theme: ThemeDef;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const MODE_KEY = 'triggr.themeMode';
const THEME_KEY = 'triggr.themeId';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    AsyncStorage.getItem(MODE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') setModeState(saved);
    });
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved && saved in Themes) setThemeIdState(saved as ThemeId);
    });
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void AsyncStorage.setItem(MODE_KEY, next);
  }, []);

  const setThemeId = useCallback((next: ThemeId) => {
    setThemeIdState(next);
    void AsyncStorage.setItem(THEME_KEY, next);
  }, []);

  const scheme: ColorScheme =
    mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;

  const toggle = useCallback(() => {
    setMode(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setMode]);

  const theme = Themes[themeId];

  const value = useMemo(
    () => ({
      colors: theme[scheme],
      scheme,
      mode,
      setMode,
      toggle,
      theme,
      themeId,
      setThemeId,
    }),
    [theme, scheme, mode, setMode, toggle, themeId, setThemeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
