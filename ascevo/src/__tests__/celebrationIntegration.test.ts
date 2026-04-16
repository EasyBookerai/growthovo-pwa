// 🧪 Integration Tests for Celebration Triggers
// Tests that celebrations are triggered correctly from services
// Validates: Requirements 6.1, 6.2

import { completeLesson } from '../services/lessonService';
import { incrementStreak } from '../services/streakService';
import { awardXP } from '../services/progressService';
import { unlockAchievement } from '../services/gamificationService';
import { storeCelebrationEvent } from '../services/celebrationService';
import type { CelebrationData } from '../services/animationService';

// Mock dependencies
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

jest.mock('../services/celebrationService', () => ({
  storeCelebrationEvent: jest.fn(),
}));

const { supabase } = require('../services/supabaseClient');

describe('Celebration Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Lesson Completion Celebrations', () => {
    it('should trigger celebration when lesson is completed', async () => {
      const userId = 'user-1';
      const lessonId = 'lesson-1';
      const celebrationCallback = jest.fn();

      // Mock lesson completion
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            upsert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'xp_transactions') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'lessons') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      await completeLesson(userId, lessonId, celebrationCallback);

      // Verify celebration was triggered
      expect(celebrationCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'lesson_complete',
          title: 'Lesson Complete!',
          xpEarned: expect.any(Number),
        })
      );

      // Verify celebration was stored
      expect(storeCelebrationEvent).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'lesson_complete',
        })
      );
    });

    it('should not trigger celebration for already completed lesson', async () => {
      const userId = 'user-1';
      const lessonId = 'lesson-1';
      const celebrationCallback = jest.fn();

      // Mock already completed lesson
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: 'progress-1', xp_earned: 50 },
              error: null,
            }),
          };
        }
      });

      await completeLesson(userId, lessonId, celebrationCallback);

      // Verify celebration was NOT triggered
      expect(celebrationCallback).not.toHaveBeenCalled();
      expect(storeCelebrationEvent).not.toHaveBeenCalled();
    });
  });

  describe('Streak Milestone Celebrations', () => {
    it('should trigger celebration for 7-day streak milestone', async () => {
      const userId = 'user-1';
      const celebrationCallback = jest.fn();

      // Mock streak increment to 7
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: 7, error: null });

      await incrementStreak(userId, celebrationCallback);

      // Verify celebration was triggered
      expect(celebrationCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'streak_milestone',
          title: '7 Day Streak!',
          streakMilestone: 7,
          xpEarned: expect.any(Number),
        })
      );

      // Verify celebration was stored
      expect(storeCelebrationEvent).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'streak_milestone',
          streakMilestone: 7,
        })
      );
    });

    it('should trigger celebration for 30-day streak milestone', async () => {
      const userId = 'user-1';
      const celebrationCallback = jest.fn();

      // Mock streak increment to 30
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: 30, error: null });

      await incrementStreak(userId, celebrationCallback);

      // Verify celebration was triggered
      expect(celebrationCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'streak_milestone',
          title: '30 Day Streak!',
          streakMilestone: 30,
          intensity: 'medium',
        })
      );
    });

    it('should trigger celebration for 100-day streak milestone', async () => {
      const userId = 'user-1';
      const celebrationCallback = jest.fn();

      // Mock streak increment to 100
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: 100, error: null });

      await incrementStreak(userId, celebrationCallback);

      // Verify celebration was triggered
      expect(celebrationCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'streak_milestone',
          title: '100 Day Streak!',
          streakMilestone: 100,
          intensity: 'high',
        })
      );
    });

    it('should not trigger celebration for non-milestone streaks', async () => {
      const userId = 'user-1';
      const celebrationCallback = jest.fn();

      // Mock streak increment to 15 (not a milestone)
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: 15, error: null });

      await incrementStreak(userId, celebrationCallback);

      // Verify celebration was NOT triggered
      expect(celebrationCallback).not.toHaveBeenCalled();
      expect(storeCelebrationEvent).not.toHaveBeenCalled();
    });
  });

  describe('Achievement Unlock Celebrations', () => {
    it('should trigger celebration when achievement is unlocked', async () => {
      const userId = 'user-1';
      const achievementId = 'streak_7_days';
      const celebrationCallback = jest.fn();

      // Mock achievement unlock
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'achievements') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            insert: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'achievement-1',
                user_id: userId,
                achievement_id: achievementId,
                unlocked_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          };
        }
      });

      await unlockAchievement(userId, achievementId, celebrationCallback);

      // Verify celebration was triggered
      expect(celebrationCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          subtitle: 'Week Warrior',
          achievements: expect.arrayContaining([
            expect.objectContaining({
              id: achievementId,
              title: 'Week Warrior',
              icon: '🔥',
            }),
          ]),
        })
      );

      // Verify celebration was stored
      expect(storeCelebrationEvent).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'achievement',
        })
      );
    });

    it('should not trigger celebration for already unlocked achievement', async () => {
      const userId = 'user-1';
      const achievementId = 'streak_7_days';
      const celebrationCallback = jest.fn();

      // Mock already unlocked achievement
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'achievements') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: 'achievement-1',
                user_id: userId,
                achievement_id: achievementId,
                unlocked_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          };
        }
      });

      await unlockAchievement(userId, achievementId, celebrationCallback);

      // Verify celebration was NOT triggered
      expect(celebrationCallback).not.toHaveBeenCalled();
      expect(storeCelebrationEvent).not.toHaveBeenCalled();
    });
  });

  describe('Level-Up Celebrations', () => {
    it('should handle XP award without level-up gracefully', async () => {
      const userId = 'user-1';
      const celebrationCallback = jest.fn();

      // Mock non-lesson XP award (no level-up check)
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'xp_transactions') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'lessons') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      });

      await awardXP(userId, 10, 'checkin', undefined, celebrationCallback);

      // Verify celebration was NOT triggered (no level-up for checkin)
      expect(celebrationCallback).not.toHaveBeenCalled();
    });
  });

  describe('Celebration Data Completeness', () => {
    it('should include all required fields in lesson celebration', async () => {
      const userId = 'user-1';
      const lessonId = 'lesson-1';
      let capturedCelebration: CelebrationData | null = null;

      // Mock lesson completion
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'user_progress') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            upsert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'xp_transactions') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
      });

      await completeLesson(userId, lessonId, (data) => {
        capturedCelebration = data;
      });

      // Verify all required fields are present
      expect(capturedCelebration).toMatchObject({
        type: expect.any(String),
        title: expect.any(String),
        subtitle: expect.any(String),
        xpEarned: expect.any(Number),
        intensity: expect.any(String),
      });
    });

    it('should include all required fields in streak celebration', async () => {
      const userId = 'user-1';
      let capturedCelebration: CelebrationData | null = null;

      // Mock streak milestone
      (supabase.rpc as jest.Mock).mockResolvedValue({ data: 7, error: null });

      await incrementStreak(userId, (data) => {
        capturedCelebration = data;
      });

      // Verify all required fields are present
      expect(capturedCelebration).toMatchObject({
        type: expect.any(String),
        title: expect.any(String),
        subtitle: expect.any(String),
        xpEarned: expect.any(Number),
        streakMilestone: expect.any(Number),
        intensity: expect.any(String),
      });
    });

    it('should include all required fields in achievement celebration', async () => {
      const userId = 'user-1';
      const achievementId = 'streak_7_days';
      let capturedCelebration: CelebrationData | null = null;

      // Mock achievement unlock
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'achievements') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            insert: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'achievement-1',
                user_id: userId,
                achievement_id: achievementId,
                unlocked_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          };
        }
      });

      await unlockAchievement(userId, achievementId, (data) => {
        capturedCelebration = data;
      });

      // Verify all required fields are present
      expect(capturedCelebration).toMatchObject({
        type: expect.any(String),
        title: expect.any(String),
        subtitle: expect.any(String),
        achievements: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            icon: expect.any(String),
          }),
        ]),
        intensity: expect.any(String),
      });
    });
  });
});
