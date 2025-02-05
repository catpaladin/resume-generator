import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { defaultThemeConfig } from '@/config/theme-config';
import type { Theme } from '@/config/theme-config';

interface UseThemeReturn {
  theme: Theme | 'system';
  setTheme: (theme: Theme | 'system') => void;
  systemTheme: Theme;
  isDark: boolean;
  isLoading: boolean;
}

export function useTheme(): UseThemeReturn {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const isDark =
    theme === 'system'
      ? systemTheme === 'dark'
      : theme === 'dark';

  return {
    theme: (theme || defaultThemeConfig.defaultTheme) as Theme | 'system',
    setTheme,
    systemTheme: (systemTheme || 'light') as Theme,
    isDark,
    isLoading
  };
}

export function useThemeValue<T>(lightValue: T, darkValue: T): T {
  const { isDark } = useTheme();
  return isDark ? darkValue : lightValue;
}

export function useIsDark(): boolean {
  const { isDark } = useTheme();
  return isDark;
}

export function useIsLight(): boolean {
  const { isDark } = useTheme();
  return !isDark;
}
