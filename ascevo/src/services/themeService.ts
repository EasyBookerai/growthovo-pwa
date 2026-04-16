/**
 * Theme Service — manages light/dark/auto modes and glassmorphism.
 * Local: AsyncStorage under '@growthovo:theme_mode'
 * Remote: Supabase user_preferences table
 */

import { Platform, ViewStyle, Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

export interface GlassmorphismTheme {
  blur: {
    light: number;
    medium: number;
    heavy: number;
  };
  tint: {
    light: string;
    dark: string;
  };
  opacity: {
    light: number;
    medium: number;
    heavy: number;
  };
  shadow: {
    color: string;
    offset: { width: number; height: number };
    opacity: number;
    radius: number;
  };
}

export interface ColorScheme {
  // Base
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;

  // Brand
  primary: string;

  // Semantic
  success: string;
  error: string;
  warning: string;
  info: string;

  // Gamification
  xpGold: string;
  heartRed: string;
  streakOrange: string;
  leagueGold: string;
  leagueSilver: string;
  leagueBronze: string;
  promotionGreen: string;
  relegationRed: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY = '@growthovo:theme_mode';
const THEME_SUPABASE_KEY = 'theme_preference';

// Dark theme colors (existing)
const DARK_COLORS: ColorScheme = {
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#666666',
  primary: '#7C3AED',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#EA580C',
  info: '#2563EB',
  xpGold: '#F59E0B',
  heartRed: '#EF4444',
  streakOrange: '#F97316',
  leagueGold: '#EAB308',
  leagueSilver: '#94A3B8',
  leagueBronze: '#B45309',
  promotionGreen: '#22C55E',
  relegationRed: '#EF4444',
};

// Light theme colors
const LIGHT_COLORS: ColorScheme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceElevated: '#FFFFFF',
  border: '#E5E5E5',
  text: '#0A0A0A',
  textSecondary: '#525252',
  textMuted: '#A3A3A3',
  primary: '#7C3AED',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#EA580C',
  info: '#2563EB',
  xpGold: '#F59E0B',
  heartRed: '#EF4444',
  streakOrange: '#F97316',
  leagueGold: '#EAB308',
  leagueSilver: '#64748B',
  leagueBronze: '#92400E',
  promotionGreen: '#22C55E',
  relegationRed: '#EF4444',
};

// Glassmorphism configuration for dark mode
const DARK_GLASS: GlassmorphismTheme = {
  blur: {
    light: 10,
    medium: 20,
    heavy: 30,
  },
  tint: {
    light: 'rgba(20, 20, 20, 0.5)',
    dark: 'rgba(10, 10, 10, 0.7)',
  },
  opacity: {
    light: 0.5,
    medium: 0.7,
    heavy: 0.85,
  },
  shadow: {
    color: '#000000',
    offset: { width: 0, height: 4 },
    opacity: 0.5,
    radius: 12,
  },
};

// Glassmorphism configuration for light mode
const LIGHT_GLASS: GlassmorphismTheme = {
  blur: {
    light: 10,
    medium: 20,
    heavy: 30,
  },
  tint: {
    light: 'rgba(255, 255, 255, 0.6)',
    dark: 'rgba(245, 245, 245, 0.8)',
  },
  opacity: {
    light: 0.6,
    medium: 0.8,
    heavy: 0.9,
  },
  shadow: {
    color: '#000000',
    offset: { width: 0, height: 4 },
    opacity: 0.15,
    radius: 12,
  },
};

// ─── State Management ─────────────────────────────────────────────────────────

let currentThemeMode: ThemeMode = 'auto';
let currentResolvedTheme: ResolvedTheme = 'dark';
let listeners: Array<(theme: ResolvedTheme) => void> = [];
let systemThemeListener: any = null;

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Resolves the actual theme based on mode and system preference
 */
function resolveTheme(mode: ThemeMode, systemTheme: ColorSchemeName): ResolvedTheme {
  if (mode === 'auto') {
    return systemTheme === 'light' ? 'light' : 'dark';
  }
  return mode;
}

/**
 * Gets the current system theme
 */
function getSystemTheme(): ColorSchemeName {
  return Appearance.getColorScheme();
}

/**
 * Notifies all listeners of theme change
 */
function notifyListeners(theme: ResolvedTheme): void {
  listeners.forEach((listener) => listener(theme));
}

// ─── Core Functions ───────────────────────────────────────────────────────────

/**
 * Initialize theme service
 * Loads saved preference and sets up system theme listener
 */
export async function initializeTheme(): Promise<ResolvedTheme> {
  try {
    // Load saved theme preference
    const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (saved && (saved === 'light' || saved === 'dark' || saved === 'auto')) {
      currentThemeMode = saved as ThemeMode;
    }

    // Resolve initial theme
    const systemTheme = getSystemTheme();
    currentResolvedTheme = resolveTheme(currentThemeMode, systemTheme);

    // Set up system theme listener for auto mode
    if (systemThemeListener) {
      systemThemeListener.remove();
    }
    systemThemeListener = Appearance.addChangeListener(({ colorScheme }) => {
      if (currentThemeMode === 'auto') {
        const newTheme = resolveTheme('auto', colorScheme);
        if (newTheme !== currentResolvedTheme) {
          currentResolvedTheme = newTheme;
          notifyListeners(newTheme);
        }
      }
    });

    return currentResolvedTheme;
  } catch (error) {
    console.error('Failed to initialize theme:', error);
    return 'dark'; // fallback
  }
}

/**
 * Get current theme mode (light, dark, or auto)
 */
export function getThemeMode(): ThemeMode {
  return currentThemeMode;
}

/**
 * Get current resolved theme (light or dark)
 */
export function getResolvedTheme(): ResolvedTheme {
  return currentResolvedTheme;
}

/**
 * Set theme mode and persist preference
 */
export async function setThemeMode(
  mode: ThemeMode,
  userId?: string
): Promise<ResolvedTheme> {
  try {
    currentThemeMode = mode;

    // Resolve new theme
    const systemTheme = getSystemTheme();
    const newTheme = resolveTheme(mode, systemTheme);

    // Persist to AsyncStorage
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);

    // Persist to Supabase if user is logged in
    if (userId) {
      await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: userId,
            preference_key: THEME_SUPABASE_KEY,
            preference_value: mode,
          },
          { onConflict: 'user_id,preference_key' }
        );
    }

    // Update resolved theme and notify if changed
    if (newTheme !== currentResolvedTheme) {
      currentResolvedTheme = newTheme;
      notifyListeners(newTheme);
    }

    return newTheme;
  } catch (error) {
    console.error('Failed to set theme mode:', error);
    throw error;
  }
}

/**
 * Toggle between light and dark themes
 * If currently in auto mode, switches to explicit light/dark
 */
export async function toggleTheme(userId?: string): Promise<ResolvedTheme> {
  const currentResolved = currentResolvedTheme;
  const newMode: ThemeMode = currentResolved === 'dark' ? 'light' : 'dark';
  return setThemeMode(newMode, userId);
}

/**
 * Load theme preference from Supabase for logged-in user
 */
export async function loadThemeFromSupabase(userId: string): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preference_value')
      .eq('user_id', userId)
      .eq('preference_key', THEME_SUPABASE_KEY)
      .single();

    if (!error && data?.preference_value) {
      const mode = data.preference_value as ThemeMode;
      if (mode === 'light' || mode === 'dark' || mode === 'auto') {
        await setThemeMode(mode, userId);
      }
    }
  } catch (error) {
    console.error('Failed to load theme from Supabase:', error);
  }
}

/**
 * Subscribe to theme changes
 * Returns unsubscribe function
 */
export function subscribeToTheme(
  listener: (theme: ResolvedTheme) => void
): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/**
 * Clean up theme service (remove listeners)
 */
export function cleanupTheme(): void {
  if (systemThemeListener) {
    systemThemeListener.remove();
    systemThemeListener = null;
  }
  listeners = [];
}

// ─── Color Scheme Functions ──────────────────────────────────────────────────

/**
 * Get color scheme for current theme
 */
export function getColors(theme?: ResolvedTheme): ColorScheme {
  const resolvedTheme = theme ?? currentResolvedTheme;
  return resolvedTheme === 'light' ? LIGHT_COLORS : DARK_COLORS;
}

/**
 * Get glassmorphism theme for current theme
 */
export function getGlassTheme(theme?: ResolvedTheme): GlassmorphismTheme {
  const resolvedTheme = theme ?? currentResolvedTheme;
  return resolvedTheme === 'light' ? LIGHT_GLASS : DARK_GLASS;
}

// ─── Glassmorphism Style Functions ───────────────────────────────────────────

/**
 * Get glassmorphism style for a given intensity and theme
 */
export function getGlassStyle(
  intensity: 'light' | 'medium' | 'heavy',
  isDark?: boolean
): ViewStyle {
  const theme = isDark ?? (currentResolvedTheme === 'dark');
  const glass = theme ? DARK_GLASS : LIGHT_GLASS;

  const blurAmount = glass.blur[intensity];
  const tintColor = intensity === 'light' ? glass.tint.light : glass.tint.dark;
  const opacity = glass.opacity[intensity];

  const baseStyle: ViewStyle = {
    backgroundColor: tintColor,
    borderWidth: 1,
    borderColor: theme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    ...glass.shadow,
  };

  // Platform-specific blur implementation
  if (Platform.OS === 'web') {
    return {
      ...baseStyle,
      // @ts-ignore - backdrop-filter is not in RN types but works on web
      backdropFilter: `blur(${blurAmount}px)`,
      WebkitBackdropFilter: `blur(${blurAmount}px)`,
    };
  }

  // For native platforms, blur is handled by BlurView component wrapper
  // Return base style with opacity
  return {
    ...baseStyle,
    opacity,
  };
}

/**
 * Check if backdrop-filter is supported (web only)
 */
export function supportsBackdropFilter(): boolean {
  if (Platform.OS !== 'web') return false;
  
  if (typeof window === 'undefined' || typeof CSS === 'undefined') {
    return false;
  }

  try {
    return CSS.supports('backdrop-filter', 'blur(1px)') ||
           CSS.supports('-webkit-backdrop-filter', 'blur(1px)');
  } catch {
    return false;
  }
}

/**
 * Get fallback style for platforms without blur support
 */
export function getFallbackStyle(
  intensity: 'light' | 'medium' | 'heavy',
  isDark?: boolean
): ViewStyle {
  const theme = isDark ?? (currentResolvedTheme === 'dark');
  const glass = theme ? DARK_GLASS : LIGHT_GLASS;
  const opacity = glass.opacity[intensity];

  return {
    backgroundColor: theme
      ? `rgba(20, 20, 20, ${opacity})`
      : `rgba(245, 245, 245, ${opacity})`,
    borderWidth: 1,
    borderColor: theme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    ...glass.shadow,
  };
}
