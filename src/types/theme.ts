export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColor {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeConfig {
  lightMode: ThemeColor;
  darkMode: ThemeColor;
}

export interface PrintConfig {
  pageSize: {
    width: string;
    height: string;
    margins: string;
  };
  fontSize: {
    base: string;
    heading: string;
    subheading: string;
    body: string;
  };
  spacing: {
    section: string;
    item: string;
    bullet: string;
  };
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
  disableTransitionOnChange?: boolean;
}

export type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  systemTheme: 'light' | 'dark';
  themes: ThemeMode[];
};

export interface UseThemeResult {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  systemTheme: 'light' | 'dark';
  isDark: boolean;
  isLoading: boolean;
}

export type ThemeColorKey = keyof ThemeColor;
