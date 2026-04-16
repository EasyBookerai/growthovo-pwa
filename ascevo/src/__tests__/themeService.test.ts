import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import {
  initializeTheme,
  getThemeMode,
  getResolvedTheme,
  setThemeMode,
  toggleTheme,
  getColors,
  getGlassTheme,
  getGlassStyle,
  supportsBackdropFilter,
  getFallbackStyle,
  subscribeToTheme,
  cleanupTheme,
} from '../services/themeService';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  getColorScheme: jest.fn(() => 'dark'),
  addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
}));
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      })),
    })),
  },
}));

describe('themeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cleanupTheme();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanupTheme();
  });

  describe('initializeTheme', () => {
    it('should initialize with dark theme by default', async () => {
      const theme = await initializeTheme();
      expect(theme).toBe('dark');
    });

    it('should load saved theme preference from AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('light');
      const theme = await initializeTheme();
      expect(theme).toBe('light');
    });

    it('should resolve auto mode based on system theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('auto');
      const Appearance = require('react-native/Libraries/Utilities/Appearance');
      Appearance.getColorScheme.mockReturnValue('light');
      const theme = await initializeTheme();
      expect(theme).toBe('light');
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const theme = await initializeTheme();
      expect(theme).toBe('dark'); // fallback
    });
  });

  describe('getThemeMode and getResolvedTheme', () => {
    it('should return current theme mode', async () => {
      await initializeTheme();
      const mode = getThemeMode();
      expect(mode).toBe('auto');
    });

    it('should return resolved theme', async () => {
      await initializeTheme();
      const resolved = getResolvedTheme();
      expect(resolved).toBe('dark');
    });
  });

  describe('setThemeMode', () => {
    it('should set theme mode and persist to AsyncStorage', async () => {
      await initializeTheme();
      const result = await setThemeMode('light');
      
      expect(result).toBe('light');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@growthovo:theme_mode', 'light');
    });

    it('should update resolved theme when mode changes', async () => {
      await initializeTheme();
      await setThemeMode('light');
      
      const resolved = getResolvedTheme();
      expect(resolved).toBe('light');
    });

    it('should notify listeners when theme changes', async () => {
      await initializeTheme();
      const listener = jest.fn();
      subscribeToTheme(listener);
      
      await setThemeMode('light');
      
      expect(listener).toHaveBeenCalledWith('light');
    });

    it('should not notify listeners if theme does not change', async () => {
      await initializeTheme();
      await setThemeMode('dark'); // already dark
      
      const listener = jest.fn();
      subscribeToTheme(listener);
      
      await setThemeMode('dark');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from dark to light', async () => {
      await initializeTheme();
      await setThemeMode('dark');
      
      const result = await toggleTheme();
      expect(result).toBe('light');
    });

    it('should toggle from light to dark', async () => {
      await initializeTheme();
      await setThemeMode('light');
      
      const result = await toggleTheme();
      expect(result).toBe('dark');
    });

    it('should switch from auto to explicit mode', async () => {
      await initializeTheme();
      await setThemeMode('auto');
      const Appearance = require('react-native/Libraries/Utilities/Appearance');
      Appearance.getColorScheme.mockReturnValue('dark');
      
      const result = await toggleTheme();
      expect(result).toBe('light');
      expect(getThemeMode()).toBe('light');
    });
  });

  describe('getColors', () => {
    it('should return dark colors for dark theme', () => {
      const colors = getColors('dark');
      expect(colors.background).toBe('#0A0A0A');
      expect(colors.text).toBe('#FFFFFF');
    });

    it('should return light colors for light theme', () => {
      const colors = getColors('light');
      expect(colors.background).toBe('#FFFFFF');
      expect(colors.text).toBe('#0A0A0A');
    });

    it('should use current theme if no argument provided', async () => {
      await initializeTheme();
      await setThemeMode('light');
      
      const colors = getColors();
      expect(colors.background).toBe('#FFFFFF');
    });
  });

  describe('getGlassTheme', () => {
    it('should return dark glass theme for dark mode', () => {
      const glass = getGlassTheme('dark');
      expect(glass.tint.dark).toContain('rgba(10, 10, 10');
      expect(glass.blur.medium).toBe(20);
    });

    it('should return light glass theme for light mode', () => {
      const glass = getGlassTheme('light');
      expect(glass.tint.light).toContain('rgba(255, 255, 255');
      expect(glass.blur.medium).toBe(20);
    });
  });

  describe('getGlassStyle', () => {
    it('should return style with blur values for each intensity', () => {
      const lightStyle = getGlassStyle('light', true);
      const mediumStyle = getGlassStyle('medium', true);
      const heavyStyle = getGlassStyle('heavy', true);
      
      expect(lightStyle.backgroundColor).toBeDefined();
      expect(mediumStyle.backgroundColor).toBeDefined();
      expect(heavyStyle.backgroundColor).toBeDefined();
    });

    it('should include border and shadow properties', () => {
      const style = getGlassStyle('medium', true);
      
      expect(style.borderWidth).toBe(1);
      expect(style.borderColor).toBeDefined();
      expect(style.shadowColor).toBeDefined();
      expect(style.shadowRadius).toBeDefined();
    });

    it('should use different tints for light and dark themes', () => {
      const darkStyle = getGlassStyle('medium', true);
      const lightStyle = getGlassStyle('medium', false);
      
      expect(darkStyle.backgroundColor).not.toBe(lightStyle.backgroundColor);
    });
  });

  describe('getFallbackStyle', () => {
    it('should return fallback style without blur', () => {
      const style = getFallbackStyle('medium', true);
      
      expect(style.backgroundColor).toBeDefined();
      expect(style.borderWidth).toBe(1);
      expect(style.shadowColor).toBeDefined();
    });

    it('should have different opacity for each intensity', () => {
      const lightStyle = getFallbackStyle('light', true);
      const mediumStyle = getFallbackStyle('medium', true);
      const heavyStyle = getFallbackStyle('heavy', true);
      
      expect(lightStyle.backgroundColor).toContain('rgba');
      expect(mediumStyle.backgroundColor).toContain('rgba');
      expect(heavyStyle.backgroundColor).toContain('rgba');
    });
  });

  describe('subscribeToTheme', () => {
    it('should call listener when theme changes', async () => {
      await initializeTheme();
      const listener = jest.fn();
      
      subscribeToTheme(listener);
      await setThemeMode('light');
      
      expect(listener).toHaveBeenCalledWith('light');
    });

    it('should return unsubscribe function', async () => {
      await initializeTheme();
      const listener = jest.fn();
      
      const unsubscribe = subscribeToTheme(listener);
      unsubscribe();
      
      await setThemeMode('light');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', async () => {
      await initializeTheme();
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      subscribeToTheme(listener1);
      subscribeToTheme(listener2);
      
      await setThemeMode('light');
      
      expect(listener1).toHaveBeenCalledWith('light');
      expect(listener2).toHaveBeenCalledWith('light');
    });
  });

  describe('edge cases', () => {
    it('should handle invalid saved theme mode', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid');
      const theme = await initializeTheme();
      expect(theme).toBe('dark'); // should use default
    });

    it('should handle null system theme', async () => {
      const Appearance = require('react-native/Libraries/Utilities/Appearance');
      Appearance.getColorScheme.mockReturnValue(null);
      const theme = await initializeTheme();
      expect(theme).toBe('dark'); // should default to dark
    });

    it('should handle AsyncStorage setItem errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Write error'));
      
      await expect(setThemeMode('light')).rejects.toThrow('Write error');
    });
  });
});
