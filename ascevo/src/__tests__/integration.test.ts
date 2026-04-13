/**
 * Integration Tests — Growthovo App
 * 
 * These tests verify the complete daily loop and core integrations.
 * Run with: npm test
 */

import { supabase } from '../services/supabaseClient';
import { signUp, signIn, signOut } from '../services/authService';
import { completeLesson, getNextLesson, isLessonUnlocked } from '../services/lessonService';
import { incrementStreak, handleMissedDay, addStreakFreeze, checkMilestone } from '../services/streakService';
import { deductHeart, refillHearts, getHearts } from '../services/heartService';
import { awardXP, getTotalXP, getPillarLevel } from '../services/progressService';
import { submitCheckIn } from '../services/challengeService';

// Test user credentials
const TEST_EMAIL = `test-${Date.now()}@growthovo.app`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_USERNAME = `testuser${Date.now()}`;

describe('Integration Tests — Complete Daily Loop', () => {
  let userId: string;
  let pillarId: string;
  let lessonId: string;

  beforeAll(async () => {
    // Get the first pillar (should be seeded)
    const { data: pillars } = await supabase
      .from('pillars')
      .select('id')
      .order('display_order')
      .limit(1);
    
    if (!pillars || pillars.length === 0) {
      throw new Error('No pillars found. Please run seed.sql first.');
    }
    pillarId = pillars[0].id;
  });

  afterAll(async () => {
    // Cleanup: delete test user data
    if (userId) {
      await supabase.from('users').delete().eq('id', userId);
      await supabase.from('streaks').delete().eq('user_id', userId);
      await supabase.from('hearts').delete().eq('user_id', userId);
      await supabase.from('user_progress').delete().eq('user_id', userId);
      await supabase.from('xp_transactions').delete().eq('user_id', userId);
    }
  });

  describe('1. Authentication Flow', () => {
    it('should sign up a new user', async () => {
      const result = await signUp(TEST_EMAIL, TEST_PASSWORD, TEST_USERNAME);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(TEST_EMAIL);
      userId = result.user!.id;

      // Verify user row was created
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      expect(user).toBeDefined();
      expect(user.username).toBe(TEST_USERNAME);
      expect(user.onboarding_complete).toBe(false);
    });

    it('should initialize streak and hearts for new user', async () => {
      // Verify streak row
      const { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      expect(streak).toBeDefined();
      expect(streak.current_streak).toBe(0);
      expect(streak.freeze_count).toBe(0);

      // Verify hearts row
      const { data: hearts } = await supabase
        .from('hearts')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      expect(hearts).toBeDefined();
      expect(hearts.count).toBe(5);
    });

    it('should sign in existing user', async () => {
      await signOut();
      const result = await signIn(TEST_EMAIL, TEST_PASSWORD);
      expect(result.session).toBeDefined();
      expect(result.user?.id).toBe(userId);
    });
  });

  describe('2. Lesson Flow', () => {
    it('should get next lesson for user', async () => {
      const lesson = await getNextLesson(userId, pillarId);
      expect(lesson).toBeDefined();
      expect(lesson?.unitId).toBeDefined();
      lessonId = lesson!.id;
    });

    it('should verify first lesson is unlocked', async () => {
      const unlocked = await isLessonUnlocked(userId, lessonId);
      expect(unlocked).toBe(true);
    });

    it('should complete a lesson and award XP', async () => {
      const xpBefore = await getTotalXP(userId);
      const xpEarned = await completeLesson(userId, lessonId);
      
      expect(xpEarned).toBeGreaterThan(0);
      
      const xpAfter = await getTotalXP(userId);
      expect(xpAfter).toBe(xpBefore + xpEarned);

      // Verify user_progress row
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();
      
      expect(progress).toBeDefined();
      expect(progress.completed_at).toBeDefined();
      expect(progress.xp_earned).toBe(xpEarned);
    });

    it('should not double-award XP for same lesson', async () => {
      const xpBefore = await getTotalXP(userId);
      await completeLesson(userId, lessonId);
      const xpAfter = await getTotalXP(userId);
      
      expect(xpAfter).toBe(xpBefore); // No additional XP
    });
  });

  describe('3. Streak System', () => {
    it('should increment streak on first activity', async () => {
      const newStreak = await incrementStreak(userId);
      expect(newStreak).toBe(1);
    });

    it('should be idempotent within same day', async () => {
      const streak1 = await incrementStreak(userId);
      const streak2 = await incrementStreak(userId);
      expect(streak1).toBe(streak2);
    });

    it('should detect streak milestones', () => {
      const milestone7 = checkMilestone(7);
      expect(milestone7.isMilestone).toBe(true);
      expect(milestone7.days).toBe(7);
      expect(milestone7.xpBonus).toBeGreaterThan(0);

      const milestone30 = checkMilestone(30);
      expect(milestone30.isMilestone).toBe(true);

      const milestone100 = checkMilestone(100);
      expect(milestone100.isMilestone).toBe(true);

      const noMilestone = checkMilestone(15);
      expect(noMilestone.isMilestone).toBe(false);
    });

    it('should add streak freeze and cap at 5', async () => {
      let freezeCount = await addStreakFreeze(userId);
      expect(freezeCount).toBe(1);

      // Add 5 more (should cap at 5)
      for (let i = 0; i < 5; i++) {
        freezeCount = await addStreakFreeze(userId);
      }
      expect(freezeCount).toBe(5);
    });

    it('should consume freeze on missed day', async () => {
      // Set streak to 10 and freeze_count to 2
      await supabase
        .from('streaks')
        .update({ current_streak: 10, freeze_count: 2 })
        .eq('user_id', userId);

      const result = await handleMissedDay(userId);
      expect(result.streakPreserved).toBe(true);
      expect(result.newStreak).toBe(10);

      // Verify freeze was consumed
      const { data: streak } = await supabase
        .from('streaks')
        .select('freeze_count')
        .eq('user_id', userId)
        .single();
      expect(streak.freeze_count).toBe(1);
    });

    it('should reset streak when no freezes available', async () => {
      // Set freeze_count to 0
      await supabase
        .from('streaks')
        .update({ freeze_count: 0, current_streak: 10 })
        .eq('user_id', userId);

      const result = await handleMissedDay(userId);
      expect(result.streakPreserved).toBe(false);
      expect(result.newStreak).toBe(0);
    });
  });

  describe('4. Heart System', () => {
    it('should deduct heart and floor at 0', async () => {
      // Reset hearts to 5
      await supabase
        .from('hearts')
        .update({ count: 5 })
        .eq('user_id', userId);

      const count1 = await deductHeart(userId);
      expect(count1).toBe(4);

      // Deduct all hearts
      for (let i = 0; i < 5; i++) {
        await deductHeart(userId);
      }

      const finalCount = await getHearts(userId);
      expect(finalCount).toBe(0);
    });

    it('should refill hearts to 5', async () => {
      await refillHearts(userId);
      const count = await getHearts(userId);
      expect(count).toBe(5);
    });

    it('should be idempotent on same day', async () => {
      await refillHearts(userId);
      await refillHearts(userId);
      const count = await getHearts(userId);
      expect(count).toBe(5); // Not 10
    });
  });

  describe('5. XP and Progress System', () => {
    it('should award XP and record transaction', async () => {
      const xpBefore = await getTotalXP(userId);
      await awardXP(userId, 50, 'lesson', lessonId);
      const xpAfter = await getTotalXP(userId);
      
      expect(xpAfter).toBe(xpBefore + 50);

      // Verify transaction was recorded
      const { data: transactions } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('source', 'lesson')
        .eq('reference_id', lessonId);
      
      expect(transactions).toBeDefined();
      expect(transactions!.length).toBeGreaterThan(0);
    });

    it('should calculate pillar level correctly', async () => {
      const level = await getPillarLevel(userId, pillarId);
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(10);
    });

    it('should sum all XP transactions correctly', async () => {
      const { data: transactions } = await supabase
        .from('xp_transactions')
        .select('amount')
        .eq('user_id', userId);
      
      const manualSum = (transactions ?? []).reduce((sum, tx) => sum + tx.amount, 0);
      const totalXP = await getTotalXP(userId);
      
      expect(totalXP).toBe(manualSum);
    });
  });

  describe('6. Challenge Check-In', () => {
    let challengeId: string;

    beforeAll(async () => {
      // Get challenge for the completed lesson
      const { data: challenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('lesson_id', lessonId)
        .single();
      
      if (challenge) {
        challengeId = challenge.id;
      }
    });

    it('should submit check-in and award XP', async () => {
      if (!challengeId) {
        console.warn('No challenge found for lesson, skipping check-in test');
        return;
      }

      const xpBefore = await getTotalXP(userId);
      await submitCheckIn(userId, challengeId, true);
      const xpAfter = await getTotalXP(userId);
      
      expect(xpAfter).toBeGreaterThan(xpBefore);

      // Verify completion was recorded
      const { data: completion } = await supabase
        .from('challenge_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();
      
      expect(completion).toBeDefined();
      expect(completion.completed).toBe(true);
    });

    it('should reject duplicate check-in on same day', async () => {
      if (!challengeId) return;

      await expect(submitCheckIn(userId, challengeId, true)).rejects.toThrow();
    });
  });
});

describe('Pure Logic Tests', () => {
  describe('Streak Logic', () => {
    it('should handle missed day with freeze', () => {
      const { applyMissedDay } = require('../services/streakService');
      const result = applyMissedDay(10, 2);
      expect(result.newStreak).toBe(10);
      expect(result.newFreezeCount).toBe(1);
      expect(result.preserved).toBe(true);
    });

    it('should reset streak without freeze', () => {
      const { applyMissedDay } = require('../services/streakService');
      const result = applyMissedDay(10, 0);
      expect(result.newStreak).toBe(0);
      expect(result.newFreezeCount).toBe(0);
      expect(result.preserved).toBe(false);
    });

    it('should cap freeze count at 5', () => {
      const { applyAddFreeze } = require('../services/streakService');
      expect(applyAddFreeze(4)).toBe(5);
      expect(applyAddFreeze(5)).toBe(5);
      expect(applyAddFreeze(6)).toBe(5);
    });
  });

  describe('Progress Logic', () => {
    it('should calculate level from XP', () => {
      const { calculateLevel } = require('../services/progressService');
      expect(calculateLevel(0)).toBe(1);
      expect(calculateLevel(100)).toBeGreaterThanOrEqual(1);
      expect(calculateLevel(10000)).toBeLessThanOrEqual(10);
    });

    it('should sum transactions correctly', () => {
      const { sumTransactions } = require('../services/progressService');
      expect(sumTransactions([10, 20, 30])).toBe(60);
      expect(sumTransactions([])).toBe(0);
      expect(sumTransactions([100])).toBe(100);
    });
  });
});
