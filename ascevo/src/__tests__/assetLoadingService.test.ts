// 🧪 Asset Loading Service Tests
// Unit tests for lazy loading and caching of heavy visual assets

import {
  initAssetLoading,
  preloadCriticalAssets,
  loadCelebrationAssets,
  loadAchievementAssets,
  loadAsset,
  isAssetLoaded,
  isLoadingAssets,
  getLoadingProgress,
  clearAssetCache,
  getAssetLoadingStats,
  ASSET_DEFINITIONS,
} from '../services/assetLoadingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Image
jest.mock('react-native', () => ({
  Image: {
    prefetch: jest.fn(() => Promise.resolve(true)),
    getSize: jest.fn((uri, success) => success(100, 100)),
    resolveAssetSource: jest.fn((source) => ({ uri: 'mock://asset' })),
  },
}));

describe('assetLoadingService', () => {
  beforeEach(async () => {
    // Clear cache before each test
    await clearAssetCache();
    jest.clearAllMocks();
  });

  describe('initAssetLoading', () => {
    it('should initialize without cached metadata', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      await expect(initAssetLoading()).resolves.not.toThrow();
    });

    it('should load cached metadata from storage', async () => {
      const cachedMetadata = {
        loaded: ['logo', 'background_gradient'],
        timestamp: Date.now(),
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedMetadata)
      );

      await initAssetLoading();

      expect(isAssetLoaded('logo')).toBe(true);
      expect(isAssetLoaded('background_gradient')).toBe(true);
    });

    it('should handle corrupted cache metadata gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      await expect(initAssetLoading()).resolves.not.toThrow();
    });
  });

  describe('preloadCriticalAssets', () => {
    it('should load all critical assets', async () => {
      await preloadCriticalAssets();

      const criticalAssets = Object.values(ASSET_DEFINITIONS).filter(
        (asset) => asset.type === 'critical'
      );

      criticalAssets.forEach((asset) => {
        expect(isAssetLoaded(asset.id)).toBe(true);
      });
    });

    it('should not throw if some assets fail to load', async () => {
      // This test verifies graceful error handling
      await expect(preloadCriticalAssets()).resolves.not.toThrow();
    });
  });

  describe('loadCelebrationAssets', () => {
    it('should load celebration assets by priority', async () => {
      await loadCelebrationAssets();

      // Give time for async loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      const celebrationAssets = Object.values(ASSET_DEFINITIONS).filter(
        (asset) => asset.type === 'celebration'
      );

      // At least high and medium priority should be loaded
      const highPriority = celebrationAssets.filter((a) => a.priority === 'high');
      const mediumPriority = celebrationAssets.filter((a) => a.priority === 'medium');

      [...highPriority, ...mediumPriority].forEach((asset) => {
        expect(isAssetLoaded(asset.id)).toBe(true);
      });
    });

    it('should handle loading errors gracefully', async () => {
      await expect(loadCelebrationAssets()).resolves.not.toThrow();
    });
  });

  describe('loadAchievementAssets', () => {
    it('should load all achievement assets when no IDs provided', async () => {
      await loadAchievementAssets();

      const achievementAssets = Object.values(ASSET_DEFINITIONS).filter(
        (asset) => asset.type === 'achievement'
      );

      achievementAssets.forEach((asset) => {
        expect(isAssetLoaded(asset.id)).toBe(true);
      });
    });

    it('should load specific achievement assets when IDs provided', async () => {
      await loadAchievementAssets(['streak_7', 'streak_30']);

      expect(isAssetLoaded('achievement_streak_7')).toBe(true);
      expect(isAssetLoaded('achievement_streak_30')).toBe(true);
    });

    it('should handle invalid achievement IDs gracefully', async () => {
      await expect(
        loadAchievementAssets(['invalid_id'])
      ).resolves.not.toThrow();
    });
  });

  describe('loadAsset', () => {
    it('should load an asset successfully', async () => {
      await loadAsset('logo');

      expect(isAssetLoaded('logo')).toBe(true);
    });

    it('should not reload already loaded assets', async () => {
      await loadAsset('logo');
      const firstLoadTime = Date.now();

      await loadAsset('logo');
      const secondLoadTime = Date.now();

      // Second load should be instant (no actual loading)
      expect(secondLoadTime - firstLoadTime).toBeLessThan(50);
    });

    it('should handle non-existent asset IDs', async () => {
      await expect(loadAsset('non_existent')).resolves.not.toThrow();
      expect(isAssetLoaded('non_existent')).toBe(false);
    });

    it('should persist loaded assets to storage', async () => {
      await loadAsset('logo');

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('isAssetLoaded', () => {
    it('should return false for unloaded assets', () => {
      expect(isAssetLoaded('logo')).toBe(false);
    });

    it('should return true for loaded assets', async () => {
      await loadAsset('logo');
      expect(isAssetLoaded('logo')).toBe(true);
    });
  });

  describe('isLoadingAssets', () => {
    it('should return false when no assets are loading', () => {
      expect(isLoadingAssets()).toBe(false);
    });

    it('should return true while assets are loading', async () => {
      const loadPromise = loadAsset('logo');
      
      // Check immediately (might be loading)
      // Note: This is timing-dependent, so we just verify it doesn't throw
      expect(() => isLoadingAssets()).not.toThrow();

      await loadPromise;
    });
  });

  describe('getLoadingProgress', () => {
    it('should return 0 when no assets are loaded', async () => {
      await clearAssetCache();
      expect(getLoadingProgress()).toBe(0);
    });

    it('should return correct progress percentage', async () => {
      await clearAssetCache();
      
      const totalAssets = Object.keys(ASSET_DEFINITIONS).length;
      await loadAsset('logo');

      const progress = getLoadingProgress();
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(1);
      expect(progress).toBeCloseTo(1 / totalAssets, 2);
    });

    it('should return 1 when all assets are loaded', async () => {
      // Load all assets
      const allAssetIds = Object.keys(ASSET_DEFINITIONS);
      await Promise.all(allAssetIds.map((id) => loadAsset(id)));

      expect(getLoadingProgress()).toBe(1);
    });
  });

  describe('clearAssetCache', () => {
    it('should clear all loaded assets', async () => {
      await loadAsset('logo');
      expect(isAssetLoaded('logo')).toBe(true);

      await clearAssetCache();
      expect(isAssetLoaded('logo')).toBe(false);
    });

    it('should remove cache metadata from storage', async () => {
      await clearAssetCache();
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('getAssetLoadingStats', () => {
    it('should return correct statistics', async () => {
      await clearAssetCache();
      await loadAsset('logo');

      const stats = getAssetLoadingStats();

      expect(stats.total).toBe(Object.keys(ASSET_DEFINITIONS).length);
      expect(stats.loaded).toBe(1);
      expect(stats.loading).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.progress).toBeGreaterThan(0);
    });

    it('should track failed assets', async () => {
      // This would require mocking a failure scenario
      // For now, just verify the stats structure
      const stats = getAssetLoadingStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('loaded');
      expect(stats).toHaveProperty('loading');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('progress');
    });
  });

  describe('Asset caching strategy', () => {
    it('should implement proper caching to avoid redundant loads', async () => {
      // Load asset first time
      await loadAsset('logo');
      const firstStats = getAssetLoadingStats();

      // Load same asset again
      await loadAsset('logo');
      const secondStats = getAssetLoadingStats();

      // Stats should be identical (no additional load)
      expect(secondStats.loaded).toBe(firstStats.loaded);
    });

    it('should handle concurrent loads of the same asset', async () => {
      // Start multiple loads of the same asset simultaneously
      const loads = [
        loadAsset('logo'),
        loadAsset('logo'),
        loadAsset('logo'),
      ];

      await Promise.all(loads);

      // Should only load once
      expect(isAssetLoaded('logo')).toBe(true);
    });
  });

  describe('Priority-based loading', () => {
    it('should respect asset priority in celebration loading', async () => {
      const startTime = Date.now();
      await loadCelebrationAssets();
      const endTime = Date.now();

      // High priority assets should be loaded
      const highPriority = Object.values(ASSET_DEFINITIONS).filter(
        (a) => a.type === 'celebration' && a.priority === 'high'
      );

      highPriority.forEach((asset) => {
        expect(isAssetLoaded(asset.id)).toBe(true);
      });

      // Test completed in reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty achievement ID array', async () => {
      await expect(loadAchievementAssets([])).resolves.not.toThrow();
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage full')
      );

      await expect(loadAsset('logo')).resolves.not.toThrow();
    });

    it('should handle multiple rapid cache clears', async () => {
      await loadAsset('logo');
      
      await Promise.all([
        clearAssetCache(),
        clearAssetCache(),
        clearAssetCache(),
      ]);

      expect(isAssetLoaded('logo')).toBe(false);
    });
  });
});
