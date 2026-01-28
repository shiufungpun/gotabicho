import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from './colors';
export type ColorScheme = 'light' | 'dark';
/**
 * Hook to get the current theme colors based on system color scheme
 */
export function useTheme(): { colors: ThemeColors; colorScheme: ColorScheme } {
  const systemColorScheme = useColorScheme();
  const colorScheme: ColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  return {
    colors: Colors[colorScheme],
    colorScheme,
  };
}
/**
 * Hook to get the current color scheme
 */
export function useColorSchemeValue(): ColorScheme {
  const systemColorScheme = useColorScheme();
  return systemColorScheme === 'dark' ? 'dark' : 'light';
}
