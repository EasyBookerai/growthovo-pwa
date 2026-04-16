// 🧪 Asset Lazy Loading Integration Tests
// Integration tests for lazy loading in CelebrationModal and AchievementBadge

import {
  loadCelebrationAssets,
  loadAchievementAssets,
  isAssetLoaded,
  clearAssetCache,
  preloadCriticalAssets,
  getAssetLoadingStats,
} from '../services/assetLoadingService';

// Mock dependencies
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  },
}));

jest.mock('../services/gamificationService', () => ({
  getAllAchievements: jest.fn(() => [
    {
      id: 'streak_7',
      title: '7 Day Streak',
      description: 'Complete 7 days in a row',
      icon: '🔥',
      category: 'streak',
      criteria: { type: 'streak', threshold: 7 },
    },
  ]),
  getAchievementsByCategory: jest.fn(() => []),
  getUserAchievements: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Image: {
      ...RN.Image,
      prefetch: jest.fn(() => Promise.resolve(true)),
      getSize: jest.fn((uri, success) => success(100, 100)),
      resolveAssetSource: jest.fn((source) => ({ uri: 'mock://asset' })),
    },
  };
});

jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');

describe('Asset Lazy Loading Integration', () => {
  beforeEach(async () => {
    await clearAssetCache();
    jest.clearAllMocks();
  });

  describe('CelebrationModal lazy loading', () => {
    const mockCelebrationData: CelebrationData = {
      type: 'lesson_complete',
      title: 'Lesson Complete!',
      subtitle: 'Great work!',
      xpEarned: 50,
      intensity: 'medium',
    };

    it('should lazy load celebration assets when modal becomes visible', async () => {
      const { rerender } = render(
        <CelebrationModal
          visible={false}
          data={mockCelebrationData}
          onComplete={jest.fn()}
        />
      );

      // Assets should not be loaded yet
      expect(isAssetLoaded('celebration_confetti')).toBe(false);

      // Make modal visible
      rerender(
        <CelebrationModal
          visible={true}
          data={mockCelebrationData}
          onComplete={jest.fn()}
        />
      );

      // Wait for assets to load
      await waitFor(
        () => {
          expect(isAssetLoaded('celebration_confetti')).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('should not reload assets if already loaded', async () => {
      // Preload assets
      await loadCelebrationAssets();
      expect(isAssetLoaded('celebration_confetti')).toBe(true);

      const loadSpy = jest.spyOn(
        require('../services/assetLoadingService'),
        'loadCelebrationAssets'
      );

      render(
        <CelebrationModal
          visible={true}
          data={mockCelebrationData}
          onComplete={jest.fn()}
        />
      );

      await waitFor(() => {
        // Should be called but return immediately since assets are loaded
        expect(loadSpy).toHaveBeenCalled();
      });
    });

    it('should display celebration even if assets fail to load', async () => {
      const mockLoadFail = jest
        .spyOn(require('../services/assetLoadingService'), 'loadCelebrationAssets')
        .mockRejectedValue(new Error('Load failed'));

      const { getByText } = render(
        <CelebrationModal
          visible={true}
          data={mockCelebrationData}
          onComplete={jest.fn()}
        />
      );

      // Modal should still render
      await waitFor(() => {
        expect(getByText('Lesson Complete!')).toBeTruthy();
      });

      mockLoadFail.mockRestore();
    });
  });

  describe('AchievementBadge lazy loading', () => {
    const mockAchievement: AchievementDefinition = {
      id: 'streak_7',
      title: '7 Day Streak',
      description: 'Complete 7 days in a row',
      icon: '🔥',
      category: 'streak',
      criteria: { type: 'streak', threshold: 7 },
    };

    it('should lazy load achievement asset when badge is rendered', async () => {
      render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="medium"
        />
      );

      // Wait for asset to load
      await waitFor(
        () => {
          expect(isAssetLoaded('achievement_streak_7')).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('should not reload asset if already loaded', async () => {
      // Preload asset
      await loadAchievementAssets(['streak_7']);
      expect(isAssetLoaded('achievement_streak_7')).toBe(true);

      const { rerender } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="medium"
        />
      );

      // Render again
      rerender(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={false}
          size="large"
        />
      );

      // Asset should still be loaded
      expect(isAssetLoaded('achievement_streak_7')).toBe(true);
    });

    it('should display badge even if asset fails to load', async () => {
      const mockLoadFail = jest
        .spyOn(require('../services/assetLoadingService'), 'loadAchievementAssets')
        .mockRejectedValue(new Error('Load failed'));

      const { getByText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="large"
        />
      );

      // Badge should still render
      await waitFor(() => {
        expect(getByText('7 Day Streak')).toBeTruthy();
      });

      mockLoadFail.mockRestore();
    });
  });

  describe('AchievementsScreen batch loading', () => {
    it('should batch load all achievement assets when screen mounts', async () => {
      render(<AchievementsScreen userId="test-user-id" />);

      // Wait for batch loading to complete
      await waitFor(
        () => {
          // At least some achievement assets should be loaded
          const loaded = isAssetLoaded('achievement_streak_7');
          expect(loaded).toBe(true);
        },
        { timeout: 3000 }
      );
    });

    it('should handle batch loading errors gracefully', async () => {
      const mockLoadFail = jest
        .spyOn(require('../services/assetLoadingService'), 'loadAchievementAssets')
        .mockRejectedValue(new Error('Batch load failed'));

      const { getByText } = render(<AchievementsScreen userId="test-user-id" />);

      // Screen should still render
      await waitFor(() => {
        expect(getByText('Achievements')).toBeTruthy();
      });

      mockLoadFail.mockRestore();
    });
  });

  describe('Performance optimization', () => {
    it('should not block rendering while loading assets', async () => {
      const mockCelebrationData: CelebrationData = {
        type: 'lesson_complete',
        title: 'Lesson Complete!',
        xpEarned: 50,
        intensity: 'medium',
      };

      const startTime = Date.now();
      const { getByText } = render(
        <CelebrationModal
          visible={true}
          data={mockCelebrationData}
          onComplete={jest.fn()}
        />
      );
      const renderTime = Date.now() - startTime;

      // Rendering should be fast (< 100ms)
      expect(renderTime).toBeLessThan(100);

      // Modal should be visible immediately
      expect(getByText('Lesson Complete!')).toBeTruthy();
    });

    it('should load assets in background without blocking UI', async () => {
      const mockAchievement: AchievementDefinition = {
        id: 'streak_7',
        title: '7 Day Streak',
        description: 'Complete 7 days in a row',
        icon: '🔥',
        category: 'streak',
        criteria: { type: 'streak', threshold: 7 },
      };

      const startTime = Date.now();
      const { getByText } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="medium"
        />
      );
      const renderTime = Date.now() - startTime;

      // Rendering should be fast
      expect(renderTime).toBeLessThan(100);

      // Badge should be visible immediately
      expect(getByText('7 Day Streak')).toBeTruthy();

      // Assets load in background
      await waitFor(
        () => {
          expect(isAssetLoaded('achievement_streak_7')).toBe(true);
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Caching strategy', () => {
    it('should cache loaded assets across component instances', async () => {
      const mockAchievement: AchievementDefinition = {
        id: 'streak_7',
        title: '7 Day Streak',
        description: 'Complete 7 days in a row',
        icon: '🔥',
        category: 'streak',
        criteria: { type: 'streak', threshold: 7 },
      };

      // Render first badge
      const { unmount } = render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={true}
          size="medium"
        />
      );

      await waitFor(() => {
        expect(isAssetLoaded('achievement_streak_7')).toBe(true);
      });

      // Unmount first badge
      unmount();

      // Asset should still be cached
      expect(isAssetLoaded('achievement_streak_7')).toBe(true);

      // Render second badge - should use cached asset
      render(
        <AchievementBadge
          achievement={mockAchievement}
          unlocked={false}
          size="large"
        />
      );

      // Asset should still be loaded (from cache)
      expect(isAssetLoaded('achievement_streak_7')).toBe(true);
    });
  });
});
