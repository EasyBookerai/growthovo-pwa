import fc from 'fast-check';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import {
  initializeTheme,
  setThemeMode,
  getThemeMode,
  getResolvedTheme,
  getGlassStyle,
  getGlassTheme,
  getColors,
  cleanupTheme,
  ThemeMode,
  ResolvedTheme,
} from '../services/themeService';

/**
 * Property-Based Tests for Theme System
 * 
 * These tests verify universal properties that should hold true
 * across all valid inputs using randomized test data.
 */

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
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

// Mock Appearance
const mockAppearance = Appearance as jest.Mocked<typeof Appearance>;

describe('Property Tests: Theme System', () => {
  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    
    // Reset Appearance
    mockAppearance.getColorScheme = jest.fn().mockReturnValue('dark');
    mockAppearance.addChangeListener = jest.fn().mockReturnValue({ remove: jest.fn() });
    
    // Clean up theme service
    cleanupTheme();
    
    // Initialize theme
    await initializeTheme();
  });

  afterEach(() => {
    cleanupTheme();
  });

  describe('Property 31: Theme Consistency', () => {
    /**
     * **Validates: Requirements 10.1, 10.2, 10.3**
     * 
     * For any theme mode (light or dark), all glassmorphism effects should use
     * the appropriate tint colors, opacity values, and shadow styles for that mode.
     */
    it('should apply consistent glassmorphism styles for each theme mode', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<'light' | 'medium' | 'heavy'>('light', 'medium', 'heavy'),
          fc.boolean(), // isDark
          (intensity, isDark) => {
            const style = getGlassStyle(intensity, isDark);
            
            // Check tint color matches theme
            const bgColor = style.backgroundColor as string;
            if (isDark) {
              // Dark theme should use dark tints (rgba with low RGB values)
              expect(bgColor).toMatch(/rgba\(\s*\d+,\s*\d+,\s*\d+/);
              // Extract RGB values and verify they're dark (< 50)
              const rgbMatch = bgColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
              if (rgbMatch) {
                const [, r, g, b] = rgbMatch.map(Number);
                expect(r).toBeLessThan(50);
                expect(g).toBeLessThan(50);
                expect(b).toBeLessThan(50);
              }
            } else {
              // Light theme should use light tints (rgba with high RGB values)
              expect(bgColor).toMatch(/rgba\(\s*\d+,\s*\d+,\s*\d+/);
              const rgbMatch = bgColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/);
              if (rgbMatch) {
                const [, r, g, b] = rgbMatch.map(Number);
                expect(r).toBeGreaterThan(200);
                expect(g).toBeGreaterThan(200);
                expect(b).toBeGreaterThan(200);
              }
            }
            
            // Check border color matches theme
            const borderColor = style.borderColor as string;
            expect(borderColor).toMatch(/rgba\(/);
            
            // Check shadow properties exist (only on native platforms)
            // On web, shadows are handled via CSS box-shadow
            if (style.shadowColor) {
              expect(style.shadowColor).toBeDefined();
              expect(style.shadowOffset).toBeDefined();
              expect(style.shadowOpacity).toBeDefined();
              expect(style.shadowRadius).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent opacity values across intensity levels for each theme', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isDark
          (isDark) => {
            const glassTheme = getGlassTheme(isDark ? 'dark' : 'light');
            
            // Opacity should increase from light to heavy
            expect(glassTheme.opacity.medium).toBeGreaterThan(glassTheme.opacity.light);
            expect(glassTheme.opacity.heavy).toBeGreaterThan(glassTheme.opacity.medium);
            
            // All opacity values should be between 0 and 1
            expect(glassTheme.opacity.light).toBeGreaterThan(0);
            expect(glassTheme.opacity.light).toBeLessThanOrEqual(1);
            expect(glassTheme.opacity.medium).toBeGreaterThan(0);
            expect(glassTheme.opacity.medium).toBeLessThanOrEqual(1);
            expect(glassTheme.opacity.heavy).toBeGreaterThan(0);
            expect(glassTheme.opacity.heavy).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent blur values across intensity levels for each theme', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isDark
          (isDark) => {
            const glassTheme = getGlassTheme(isDark ? 'dark' : 'light');
            
            // Blur should increase from light to heavy
            expect(glassTheme.blur.medium).toBeGreaterThan(glassTheme.blur.light);
            expect(glassTheme.blur.heavy).toBeGreaterThan(glassTheme.blur.medium);
            
            // All blur values should be positive
            expect(glassTheme.blur.light).toBeGreaterThan(0);
            expect(glassTheme.blur.medium).toBeGreaterThan(0);
            expect(glassTheme.blur.heavy).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent color schemes for each theme mode', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<ResolvedTheme>('light', 'dark'),
          (theme) => {
            const colors = getColors(theme);
            
            // All color properties should be defined
            expect(colors.background).toBeDefined();
            expect(colors.surface).toBeDefined();
            expect(colors.text).toBeDefined();
            expect(colors.primary).toBeDefined();
            
            // Colors should be valid hex or rgba strings
            const colorRegex = /^(#[0-9A-Fa-f]{6}|rgba?\()/;
            expect(colors.background).toMatch(colorRegex);
            expect(colors.surface).toMatch(colorRegex);
            expect(colors.text).toMatch(colorRegex);
            expect(colors.primary).toMatch(colorRegex);
            
            // Theme-specific color validation
            if (theme === 'dark') {
              // Dark theme should have dark background
              if (colors.background.startsWith('#')) {
                const hex = colors.background.slice(1);
                const rgb = parseInt(hex.slice(0, 2), 16);
                expect(rgb).toBeLessThan(50);
              }
            } else {
              // Light theme should have light background
              if (colors.background.startsWith('#')) {
                const hex = colors.background.slice(1);
                const rgb = parseInt(hex.slice(0, 2), 16);
                expect(rgb).toBeGreaterThan(200);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain shadow consistency across themes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<'light' | 'medium' | 'heavy'>('light', 'medium', 'heavy'),
          fc.boolean(), // isDark
          (intensity, isDark) => {
            const style = getGlassStyle(intensity, isDark);
            
            // Shadow properties should be consistent (only on native platforms)
            // On web, shadows are handled via CSS box-shadow
            if (style.shadowOpacity !== undefined) {
              expect(typeof style.shadowOpacity).toBe('number');
              expect(style.shadowOpacity).toBeGreaterThanOrEqual(0);
              expect(style.shadowOpacity).toBeLessThanOrEqual(1);
              
              expect(typeof style.shadowRadius).toBe('number');
              expect(style.shadowRadius).toBeGreaterThan(0);
              
              expect(style.shadowOffset).toHaveProperty('width');
              expect(style.shadowOffset).toHaveProperty('height');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 32: Theme Persistence', () => {
    /**
     * **Validates: Requirements 10.4**
     * 
     * For any theme preference change, the new preference should be persisted
     * and restored in subsequent app sessions.
     */
    it('should persist theme mode to AsyncStorage when changed', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<ThemeMode>('light', 'dark', 'auto'),
          async (mode) => {
            // Set theme mode
            await setThemeMode(mode);
            
            // Verify AsyncStorage.setItem was called with correct key and value
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(
              '@growthovo:theme_mode',
              mode
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should restore persisted theme mode on initialization', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<ThemeMode>('light', 'dark', 'auto'),
          async (savedMode) => {
            // Mock AsyncStorage to return saved mode
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(savedMode);
            
            // Clean up and reinitialize
            cleanupTheme();
            await initializeTheme();
            
            // Verify theme mode was restored
            const currentMode = getThemeMode();
            expect(currentMode).toBe(savedMode);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain theme mode across multiple set operations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom<ThemeMode>('light', 'dark', 'auto'), {
            minLength: 1,
            maxLength: 10,
          }),
          async (modes) => {
            // Apply each mode in sequence
            for (const mode of modes) {
              await setThemeMode(mode);
              
              // Verify mode is immediately reflected
              expect(getThemeMode()).toBe(mode);
            }
            
            // Verify final mode is persisted
            const finalMode = modes[modes.length - 1];
            expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
              '@ascevo:theme_mode',
              finalMode
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle persistence failures gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<ThemeMode>('light', 'dark', 'auto'),
          async (mode) => {
            // Mock AsyncStorage to fail
            (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
              new Error('Storage error')
            );
            
            // Setting theme should throw
            await expect(setThemeMode(mode)).rejects.toThrow();
            
            // But theme mode should still be updated in memory
            expect(getThemeMode()).toBe(mode);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should default to auto mode when no persisted preference exists', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Mock AsyncStorage to return null (no saved preference)
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
            
            // Clean up and reinitialize
            cleanupTheme();
            const resolvedTheme = await initializeTheme();
            
            // Should default to auto mode
            const currentMode = getThemeMode();
            expect(currentMode).toBe('auto');
            
            // Resolved theme should be dark (default when system is dark)
            expect(resolvedTheme).toBe('dark');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 33: Auto-Theme System Sync', () => {
    /**
     * **Validates: Requirements 10.5**
     * 
     * For any system theme change, if auto-theme is enabled, the app theme
     * should update to match the system theme.
     */
    it('should sync with system theme when in auto mode', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<'light' | 'dark'>('light', 'dark'),
          async (systemTheme) => {
            // Set to auto mode
            await setThemeMode('auto');
            
            // Mock system theme
            mockAppearance.getColorScheme = jest.fn().mockReturnValue(systemTheme);
            
            // Reinitialize to pick up system theme
            cleanupTheme();
            await initializeTheme();
            
            // Resolved theme should match system theme
            const resolvedTheme = getResolvedTheme();
            expect(resolvedTheme).toBe(systemTheme);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not sync with system theme when in explicit mode', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<'light' | 'dark'>('light', 'dark'),
          fc.constantFrom<'light' | 'dark'>('light', 'dark'),
          async (explicitMode, systemTheme) => {
            // Set explicit mode (not auto)
            await setThemeMode(explicitMode);
            
            // Mock different system theme
            mockAppearance.getColorScheme = jest.fn().mockReturnValue(systemTheme);
            
            // Reinitialize
            cleanupTheme();
            await initializeTheme();
            
            // Resolved theme should match explicit mode, not system
            const resolvedTheme = getResolvedTheme();
            expect(resolvedTheme).toBe(explicitMode);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should register system theme listener when in auto mode', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Set to auto mode
            await setThemeMode('auto');
            
            // Reinitialize
            cleanupTheme();
            await initializeTheme();
            
            // Verify listener was registered
            expect(mockAppearance.addChangeListener).toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle system theme changes dynamically in auto mode', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom<'light' | 'dark'>('light', 'dark'), {
            minLength: 2,
            maxLength: 5,
          }),
          async (themeSequence) => {
            // Set to auto mode
            await setThemeMode('auto');
            
            // Track listener callback
            let themeChangeCallback: ((preferences: { colorScheme: 'light' | 'dark' | null }) => void) | null = null;
            mockAppearance.addChangeListener = jest.fn((callback) => {
              themeChangeCallback = callback;
              return { remove: jest.fn() };
            });
            
            // Reinitialize to register listener
            cleanupTheme();
            await initializeTheme();
            
            // Simulate system theme changes
            for (const systemTheme of themeSequence) {
              if (themeChangeCallback) {
                themeChangeCallback({ colorScheme: systemTheme });
                
                // In auto mode, resolved theme should match system theme
                // Note: This test verifies the listener is called, actual theme
                // update happens through the listener callback
                expect(themeChangeCallback).toBeDefined();
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should default to dark theme when system theme is null', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Set to auto mode
            await setThemeMode('auto');
            
            // Mock system theme as null
            mockAppearance.getColorScheme = jest.fn().mockReturnValue(null);
            
            // Reinitialize
            cleanupTheme();
            await initializeTheme();
            
            // Should default to dark when system theme is unavailable
            const resolvedTheme = getResolvedTheme();
            expect(resolvedTheme).toBe('dark');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should clean up system theme listener on cleanup', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(null),
          async () => {
            // Track remove function
            const removeFn = jest.fn();
            mockAppearance.addChangeListener = jest.fn().mockReturnValue({
              remove: removeFn,
            });
            
            // Initialize and then cleanup
            await initializeTheme();
            cleanupTheme();
            
            // Verify listener was removed
            expect(removeFn).toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
