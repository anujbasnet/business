import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppColors, light, dark, themes } from '@/constants/colors';
import { Platform } from 'react-native';

export type ThemeName = 'light' | 'dark';

interface ThemeState {
  theme: ThemeName;
  colors: AppColors;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'app-theme';

export const [ThemeProvider, useTheme] = createContextHook<ThemeState>(() => {
  const [theme, setThemeState] = useState<ThemeName>('light');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'light' || stored === 'dark') {
          setThemeState(stored);
        }
      } catch (e) {
        console.log('[theme] failed to read storage', e);
      }
    })();
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch((e) => console.log('[theme] failed to write', e));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const colors: AppColors = theme === 'dark' ? dark : light;

  return useMemo(() => ({ theme, colors, setTheme, toggleTheme }), [theme, colors, setTheme, toggleTheme]);
});
