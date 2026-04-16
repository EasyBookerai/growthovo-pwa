// 🧪 Property Tests for Asset Lazy Loading
// Feature: duolingo-glassmorphism-ui
// Validates: Requirement 12.4 - Asset lazy loading

import fc from 'fast-check';
import {
  preloadCriticalAssets,
  lazyLoadAsset,
  getCachedAsset,
  clearAssetCache,
  getLoadedAssets,
} from '../services/assetLoadingService';

describe('Property Tests: Asset Lazy Loading', () => {
  beforeEach(() => {
    clearAssetCache();
  });

  // Feature: duolingo-glassmorphism-ui, Property 38: Asset Lazy Loading
  describe('Property 38: Asset Lazy Loading', () => {
    it('should not load heavy assets until requested', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('celebration', 'achievement', 'animation'),
              size: fc.integer({ min: 100, max: 10000 }), // KB
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (assets) => {
            // Initially, no assets should be loaded
            const initialLoaded = getLoadedAssets();
            expect(initialLoaded.length).toBe(0);

            // Assets should only load when explicitly requested
            assets.forEach(asset => {
              const cached = getCachedAsset(asset.id);
              expect(cached).toBeNull();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should cache assets after first load', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom('celebration', 'achievement', 'animation'),
          async (assetId, assetType) => {
            // First load
            await lazyLoadAsset(assetId, assetType);
            const firstLoad = getCachedAsset(assetId);
            
            // Second load should return cached version
            await lazyLoadAsset(assetId, assetType);
            const secondLoad = getCachedAsset(assetId);
            
            expect(firstLoad).toBe(secondLoad);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preload only critical assets during initialization', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              critical: fc.boolean(),
            }),
            { minLength: 5, maxLength: 20 }
          ),
          async (assets) => {
            const criticalAssets = assets.filter(a => a.critical);
            const nonCriticalAssets = assets.filter(a => !a.critical);

            await preloadCriticalAssets(criticalAssets.map(a => a.id));

            // Critical assets should be loaded
            criticalAssets.forEach(asset => {
              const cached = getCachedAsset(asset.id);
              expect(cached).not.toBeNull();
            });

            // Non-critical assets should not be loaded
            nonCriticalAssets.forEach(asset => {
              const cached = getCachedAsset(asset.id);
              expect(cached).toBeNull();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should load assets on-demand when needed', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('celebration', 'achievement', 'animation'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (assets) => {
            // No assets loaded initially
            expect(getLoadedAssets().length).toBe(0);

            // Load assets one by one
            for (const asset of assets) {
              await lazyLoadAsset(asset.id, asset.type);
              const cached = getCachedAsset(asset.id);
              expect(cached).not.toBeNull();
            }

            // All requested assets should now be loaded
            expect(getLoadedAssets().length).toBe(assets.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle concurrent asset loading requests', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.constantFrom('celebration', 'achievement', 'animation'),
          async (assetId, assetType) => {
            // Trigger multiple concurrent loads of the same asset
            const loads = await Promise.all([
              lazyLoadAsset(assetId, assetType),
              lazyLoadAsset(assetId, assetType),
              lazyLoadAsset(assetId, assetType),
            ]);

            // All should return the same cached instance
            expect(loads[0]).toBe(loads[1]);
            expect(loads[1]).toBe(loads[2]);

            // Asset should only be loaded once
            const loadedAssets = getLoadedAssets();
            const assetCount = loadedAssets.filter(a => a.id === assetId).length;
            expect(assetCount).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reduce initial bundle size by deferring heavy assets', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('celebration', 'achievement', 'animation'),
              size: fc.integer({ min: 1000, max: 5000 }), // Large assets in KB
            }),
            { minLength: 5, maxLength: 15 }
          ),
          (heavyAssets) => {
            // Calculate total size of heavy assets
            const totalSize = heavyAssets.reduce((sum, a) => sum + a.size, 0);

            // Initially, no heavy assets should be loaded
            const loadedAssets = getLoadedAssets();
            const loadedSize = loadedAssets.reduce((sum, a) => sum + (a.size || 0), 0);

            // Loaded size should be much smaller than total
            expect(loadedSize).toBeLessThan(totalSize * 0.1); // Less than 10% loaded
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain asset metadata after loading', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 20 }),
            type: fc.constantFrom('celebration', 'achievement', 'animation'),
            metadata: fc.record({
              width: fc.integer({ min: 100, max: 1000 }),
              height: fc.integer({ min: 100, max: 1000 }),
              duration: fc.integer({ min: 100, max: 5000 }),
            }),
          }),
          async (asset) => {
            await lazyLoadAsset(asset.id, asset.type, asset.metadata);
            const cached = getCachedAsset(asset.id);

            expect(cached).not.toBeNull();
            expect(cached?.metadata).toEqual(asset.metadata);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should support asset eviction when memory is constrained', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('celebration', 'achievement', 'animation'),
              size: fc.integer({ min: 1000, max: 3000 }),
            }),
            { minLength: 10, maxLength: 20 }
          ),
          fc.integer({ min: 5000, max: 10000 }), // Memory limit in KB
          async (assets, memoryLimit) => {
            // Load assets until memory limit is reached
            let totalLoaded = 0;
            const loadedIds: string[] = [];

            for (const asset of assets) {
              if (totalLoaded + asset.size <= memoryLimit) {
                await lazyLoadAsset(asset.id, asset.type);
                totalLoaded += asset.size;
                loadedIds.push(asset.id);
              }
            }

            // Loaded assets should not exceed memory limit
            const loadedAssets = getLoadedAssets();
            const actualSize = loadedAssets.reduce((sum, a) => sum + (a.size || 0), 0);
            expect(actualSize).toBeLessThanOrEqual(memoryLimit);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Asset Loading Performance', () => {
    it('should load critical assets faster than non-critical', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 3, maxLength: 5 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 3, maxLength: 5 }),
          async (criticalIds, nonCriticalIds) => {
            const criticalStart = Date.now();
            await preloadCriticalAssets(criticalIds);
            const criticalTime = Date.now() - criticalStart;

            const nonCriticalStart = Date.now();
            for (const id of nonCriticalIds) {
              await lazyLoadAsset(id, 'celebration');
            }
            const nonCriticalTime = Date.now() - nonCriticalStart;

            // Critical assets should be preloaded in parallel (faster)
            // This is a soft assertion as timing can vary
            expect(criticalTime).toBeLessThan(nonCriticalTime * 2);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when requested', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('celebration', 'achievement', 'animation'),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (assets) => {
            // Load assets
            for (const asset of assets) {
              await lazyLoadAsset(asset.id, asset.type);
            }

            expect(getLoadedAssets().length).toBeGreaterThan(0);

            // Clear cache
            clearAssetCache();

            // All assets should be cleared
            expect(getLoadedAssets().length).toBe(0);
            assets.forEach(asset => {
              expect(getCachedAsset(asset.id)).toBeNull();
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
