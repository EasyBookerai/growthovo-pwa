import { useThemeStore } from '../store';
import type { ThemeMode, ResolvedTheme, ColorScheme, GlassmorphismTheme } from '../services/themeService';

/**
 * Custom hook for accessing theme state and actions
 * 
 * @example
 * ```tsx
 * const { isDark, colors, glass, toggle } = useTheme();
 * 
 * return (
 *   <View style={{ backgroundColor: colors.background }}>
 *     <Text style={{ color: colors.text }}>Hello</Text>
 *     <Button onPress={() => toggle(userId)} title="Toggle Theme" />
 *   </View>
 * );
 * ```
 */
export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const resolved = useThemeStore((state) => state.resolved);
  const colors = useThemeStore((state) => state.colors);
  const glass = useThemeStore((state) => state.glass);
  const isInitialized = useThemeStore((state) => state.isInitialized);
  const initialize = useThemeStore((state) => state.initialize);
  const setMode = useThemeStore((state) => state.setMode);
  const toggle = useThemeStore((state) => state.toggle);

  return {
    mode,
    resolved,
    isDark: resolved === 'dark',
    isLight: resolved === 'light',
    colors,
    glass,
    isInitialized,
    initialize,
    setMode,
    toggle,
  };
}
