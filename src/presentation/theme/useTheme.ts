import { useColorScheme } from 'react-native';

import { useAppSelector } from '../state/hooks/useAppSelector';
import { selectThemeMode } from '../state/selectors/themeSelectors';
import { darkColors, fonts, lightColors, radius, shadow, spacing, type ThemeColors } from './tokens';

export interface AppTheme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  shadow: (level?: 'sm' | 'md' | 'lg') => ReturnType<typeof shadow>;
}

// The Redux theme mode wins; 'system' follows the device setting.
export function useTheme(): AppTheme {
  const mode = useAppSelector(selectThemeMode);
  const system = useColorScheme();
  const scheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
  const colors = scheme === 'dark' ? darkColors : lightColors;
  // Shadows are only visible on light surfaces; dark mode relies on borders instead.
  const elevate = (level: 'sm' | 'md' | 'lg' = 'md') => (scheme === 'dark' ? shadow('#000000', 'sm') : shadow(colors.primary, level));
  return { scheme, colors, spacing, radius, fonts, shadow: elevate };
}
