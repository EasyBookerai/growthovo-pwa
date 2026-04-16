// 📦 Asset Loading Service
// Manages lazy loading and caching of heavy visual assets
// Optimizes initial bundle size and loading performance

import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Asset types that can be lazy loaded
 */
export type AssetType = 'celebration' | 'achievement' | 'critical';

/**
 * Asset definition
 */
export interface Asset {
  id: string;
  type: AssetType;
  uri?: string;
  source?: any; // For require() assets
  priority: 'high' | 'medium' | 'low';
}

/**
 * Asset loading state
 */
interface AssetLoadingState {
  loaded: Set<string>;
  loading: Set<string>;
  failed: Set<string>;
  cache: Map<string, any>;
}

// Global state for asset loading
const state: AssetLoadingState = {
  loaded: new Set(),
  loading: new Set(),
  failed: new Set(),
  cache: new Map(),
};

// Storage key for cached asset metadata
const CACHE_KEY = '@asset_cache_metadata';

/**
 * Asset definitions
 * In a real app, these would be actual image/animation files
 * For now, we're using emoji as placeholders
 */
export const ASSET_DEFINITIONS: Record<string, Asset> = {
  // Celebration animations
  'celebration_confetti': {
    id: 'celebration_confetti',
    type: 'celebration',
    priority: 'medium',
  },
  'celebration_fireworks': {
    id: 'celebration_fireworks',
    type: 'celebration',
    priority: 'medium',
  },
  'celebration_sparkles': {
    id: 'celebration_sparkles',
    type: 'celebration',
    priority: 'low',
  },
  
  // Achievement badge images
  'achievement_streak_7': {
    id: 'achievement_streak_7',
    type: 'achievement',
    priority: 'low',
  },
  'achievement_streak_30': {
    id: 'achievement_streak_30',
    type: 'achievement',
    priority: 'low',
  },
  'achievement_streak_100': {
    id: 'achievement_streak_100',
    type: 'achievement',
    priority: 'low',
  },
  'achievement_lessons_10': {
    id: 'achievement_lessons_10',
    type: 'achievement',
    priority: 'low',
  },
  'achievement_lessons_50': {
    id: 'achievement_lessons_50',
    type: 'achievement',
    priority: 'low',
  },
  
  // Critical assets (loaded during splash)
  'logo': {
    id: 'logo',
    type: 'critical',
    priority: 'high',
  },
  'background_gradient': {
    id: 'background_gradient',
    type: 'critical',
    priority: 'high',
  },
};

/**
 * Initialize asset loading service
 * Loads cached metadata from storage
 */
export async function initAssetLoading(): Promise<void> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const metadata = JSON.parse(cached);
      metadata.loaded?.forEach((id: string) => state.loaded.add(id));
    }
  } catch (error) {
    console.warn('[AssetLoading] Failed to load cache metadata:', error);
  }
}

/**
 * Preload critical assets during splash screen
 * Should be called during app initialization
 * 
 * **Validates: Requirements 12.4**
 */
export async function preloadCriticalAssets(): Promise<void> {
  const criticalAssets = Object.values(ASSET_DEFINITIONS).filter(
    (asset) => asset.type === 'critical'
  );

  const promises = criticalAssets.map((asset) => loadAsset(asset.id));
  
  try {
    await Promise.all(promises);
    console.log('[AssetLoading] Critical assets preloaded');
  } catch (error) {
    console.warn('[AssetLoading] Some critical assets failed to load:', error);
  }
}

/**
 * Lazy load celebration animations
 * Only loads when celebration is about to be displayed
 * 
 * **Validates: Requirements 12.4**
 */
export async function loadCelebrationAssets(): Promise<void> {
  const celebrationAssets = Object.values(ASSET_DEFINITIONS).filter(
    (asset) => asset.type === 'celebration'
  );

  // Load high priority first, then medium, then low
  const highPriority = celebrationAssets.filter((a) => a.priority === 'high');
  const mediumPriority = celebrationAssets.filter((a) => a.priority === 'medium');
  const lowPriority = celebrationAssets.filter((a) => a.priority === 'low');

  try {
    // Load high priority assets first
    await Promise.all(highPriority.map((asset) => loadAsset(asset.id)));
    
    // Load medium priority in background
    Promise.all(mediumPriority.map((asset) => loadAsset(asset.id))).catch(() => {});
    
    // Load low priority last
    setTimeout(() => {
      Promise.all(lowPriority.map((asset) => loadAsset(asset.id))).catch(() => {});
    }, 1000);
  } catch (error) {
    console.warn('[AssetLoading] Failed to load celebration assets:', error);
  }
}

/**
 * Lazy load achievement badge images
 * Only loads when achievements screen is opened or badge is displayed
 * 
 * **Validates: Requirements 12.4**
 */
export async function loadAchievementAssets(achievementIds?: string[]): Promise<void> {
  let assetsToLoad: Asset[];

  if (achievementIds && achievementIds.length > 0) {
    // Load specific achievement assets
    assetsToLoad = achievementIds
      .map((id) => ASSET_DEFINITIONS[`achievement_${id}`])
      .filter(Boolean);
  } else {
    // Load all achievement assets
    assetsToLoad = Object.values(ASSET_DEFINITIONS).filter(
      (asset) => asset.type === 'achievement'
    );
  }

  try {
    await Promise.all(assetsToLoad.map((asset) => loadAsset(asset.id)));
  } catch (error) {
    console.warn('[AssetLoading] Failed to load achievement assets:', error);
  }
}

/**
 * Load a single asset
 * Implements caching strategy to avoid redundant loads
 * 
 * **Validates: Requirements 12.4**
 */
export async function loadAsset(assetId: string): Promise<void> {
  // Check if already loaded
  if (state.loaded.has(assetId)) {
    return;
  }

  // Check if currently loading
  if (state.loading.has(assetId)) {
    // Wait for existing load to complete
    return waitForAssetLoad(assetId);
  }

  // Check if previously failed
  if (state.failed.has(assetId)) {
    console.warn(`[AssetLoading] Asset ${assetId} previously failed to load`);
    return;
  }

  const asset = ASSET_DEFINITIONS[assetId];
  if (!asset) {
    console.warn(`[AssetLoading] Asset ${assetId} not found in definitions`);
    return;
  }

  // Mark as loading
  state.loading.add(assetId);

  try {
    // Simulate asset loading
    // In a real implementation, this would use Image.prefetch() or Asset.loadAsync()
    if (asset.uri) {
      await Image.prefetch(asset.uri);
    } else if (asset.source) {
      // For local assets using require()
      await new Promise((resolve) => {
        Image.getSize(
          Image.resolveAssetSource(asset.source).uri,
          () => resolve(true),
          () => resolve(false)
        );
      });
    } else {
      // For emoji/placeholder assets, just simulate a small delay
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    // Mark as loaded
    state.loaded.add(assetId);
    state.loading.delete(assetId);
    state.cache.set(assetId, asset);

    // Persist to storage
    await persistCacheMetadata();
  } catch (error) {
    console.warn(`[AssetLoading] Failed to load asset ${assetId}:`, error);
    state.failed.add(assetId);
    state.loading.delete(assetId);
  }
}

/**
 * Wait for an asset that's currently loading
 */
async function waitForAssetLoad(assetId: string): Promise<void> {
  const maxWait = 5000; // 5 seconds
  const checkInterval = 100; // 100ms
  let elapsed = 0;

  while (state.loading.has(assetId) && elapsed < maxWait) {
    await new Promise((resolve) => setTimeout(resolve, checkInterval));
    elapsed += checkInterval;
  }

  if (state.loading.has(assetId)) {
    console.warn(`[AssetLoading] Timeout waiting for asset ${assetId}`);
  }
}

/**
 * Check if an asset is loaded
 */
export function isAssetLoaded(assetId: string): boolean {
  return state.loaded.has(assetId);
}

/**
 * Check if any assets are currently loading
 */
export function isLoadingAssets(): boolean {
  return state.loading.size > 0;
}

/**
 * Get loading progress (0-1)
 */
export function getLoadingProgress(): number {
  const total = Object.keys(ASSET_DEFINITIONS).length;
  const loaded = state.loaded.size;
  return total > 0 ? loaded / total : 0;
}

/**
 * Clear asset cache
 * Useful for testing or when memory is low
 */
export async function clearAssetCache(): Promise<void> {
  state.loaded.clear();
  state.loading.clear();
  state.failed.clear();
  state.cache.clear();
  
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('[AssetLoading] Failed to clear cache metadata:', error);
  }
}

/**
 * Persist cache metadata to storage
 */
async function persistCacheMetadata(): Promise<void> {
  try {
    const metadata = {
      loaded: Array.from(state.loaded),
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.warn('[AssetLoading] Failed to persist cache metadata:', error);
  }
}

/**
 * Get asset loading statistics
 * Useful for debugging and monitoring
 */
export function getAssetLoadingStats(): {
  total: number;
  loaded: number;
  loading: number;
  failed: number;
  progress: number;
} {
  const total = Object.keys(ASSET_DEFINITIONS).length;
  return {
    total,
    loaded: state.loaded.size,
    loading: state.loading.size,
    failed: state.failed.size,
    progress: getLoadingProgress(),
  };
}
