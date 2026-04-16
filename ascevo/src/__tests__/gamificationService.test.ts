import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  checkAchievements,
  unlockAchievement,
  getUserAchievements,
  ACHIEVEMENT_DEFINITIONS,
  getDailyGoals,
  updateGoalProgress,
  completeDailyGoal,
  DAILY_GOAL_TEMPLATES,
  getGoalTemplate,
  getGoalTemplatesByDifficulty,
} from '../services/gamificationService';
import { supabase } from '../services/supabaseClient';

// Mock supabaseClient
jest.mock('../services/supabaseClient');

// Mock user ID for testing
const TEST_USER_ID = 'test-user-achievement-123';

// @ts-ignore - Suppress TypeScript errors for mock implementations
const mockSupabase = supabase as any;

describe('gamificationService - Achievement System', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('unlockAchievement', () => {
    it('should unlock a new achievement', async () => {
      const mockAchievement = {
        id: 'achievement-1',
        user_id: TEST_USER_ID,
        achievement_id: 'streak_7_days',
        unlocked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      // Mock no existing achievement
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null } as any),
        insert: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockAchievement, error: null } as any),
      });

      const achievement = await unlockAchievement(TEST_USER_ID, 'streak_7_days');
      
      expect(achievement).toBeDefined();
      expect(achievement.userId).toBe(TEST_USER_ID);
      expect(achievement.achievementId).toBe('streak_7_days');
      expect(achievement.unlockedAt).toBeDefined();
      expect(achievement.createdAt).toBeDefined();
    });

    it('should handle duplicate unlock attempts gracefully', async () => {
      const existingAchievement = {
        id: 'achievement-1',
        user_id: TEST_USER_ID,
        achievement_id: 'streak_7_days',
        unlocked_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
      };

      // Mock existing achievement
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: existingAchievement, error: null } as any),
      });

      const achievement = await unlockAchievement(TEST_USER_ID, 'streak_7_days');
      
      expect(achievement.id).toBe('achievement-1');
      expect(achievement.unlockedAt).toBe('2024-01-01T00:00:00Z');
    });

    it('should throw error when database operation fails', async () => {
      // Mock database error
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        }),
      });

      await expect(unlockAchievement(TEST_USER_ID, 'streak_7_days'))
        .rejects.toThrow('Failed to check existing achievement');
    });
  });

  describe('getUserAchievements', () => {
    it('should return empty array for user with no achievements', async () => {
      // Mock empty result
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null } as any),
      });

      const achievements = await getUserAchievements(TEST_USER_ID);
      expect(achievements).toEqual([]);
    });

    it('should return all unlocked achievements for a user', async () => {
      const mockAchievements = [
        {
          id: 'ach-1',
          user_id: TEST_USER_ID,
          achievement_id: 'streak_7_days',
          unlocked_at: '2024-01-03T00:00:00Z',
          created_at: '2024-01-03T00:00:00Z',
        },
        {
          id: 'ach-2',
          user_id: TEST_USER_ID,
          achievement_id: 'lessons_10',
          unlocked_at: '2024-01-02T00:00:00Z',
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: 'ach-3',
          user_id: TEST_USER_ID,
          achievement_id: 'first_lesson',
          unlocked_at: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      // Mock achievements result
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockAchievements, error: null } as any),
      });

      const achievements = await getUserAchievements(TEST_USER_ID);
      
      expect(achievements).toHaveLength(3);
      expect(achievements.map(a => a.achievementId)).toContain('streak_7_days');
      expect(achievements.map(a => a.achievementId)).toContain('lessons_10');
      expect(achievements.map(a => a.achievementId)).toContain('first_lesson');
    });

    it('should throw error when database operation fails', async () => {
      // Mock database error
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database error' } 
        }),
      });

      await expect(getUserAchievements(TEST_USER_ID))
        .rejects.toThrow('Failed to fetch user achievements');
    });
  });

  describe('checkAchievements', () => {
    it('should unlock streak milestone achievement when streak is reached', async () => {
      // Mock no existing achievements
      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: getUserAchievements
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: [], error: null } as any),
          };
        } else {
          // Subsequent calls: unlockAchievement
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null } as any),
            insert: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'ach-1',
                user_id: TEST_USER_ID,
                achievement_id: 'streak_7_days',
                unlocked_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          };
        }
      });

      const newAchievements = await checkAchievements(TEST_USER_ID, {
        type: 'streak_updated',
        streak: 7,
      });
      
      expect(newAchievements).toHaveLength(1);
      expect(newAchievements[0].achievementId).toBe('streak_7_days');
    });

    it('should not unlock already unlocked achievements', async () => {
      // Mock existing achievement
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [{
            id: 'ach-1',
            user_id: TEST_USER_ID,
            achievement_id: 'streak_7_days',
            unlocked_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
          }],
          error: null,
        }),
      });

      const newAchievements = await checkAchievements(TEST_USER_ID, {
        type: 'streak_updated',
        streak: 7,
      });
      
      expect(newAchievements).toHaveLength(0);
    });

    it('should return empty array when no achievements match criteria', async () => {
      // Mock no existing achievements
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null } as any),
      });

      const newAchievements = await checkAchievements(TEST_USER_ID, {
        type: 'streak_updated',
        streak: 5, // Not a milestone
      });
      
      expect(newAchievements).toHaveLength(0);
    });
  });

  describe('Achievement Definitions', () => {
    it('should have all required streak milestones', () => {
      expect(ACHIEVEMENT_DEFINITIONS.streak_7_days).toBeDefined();
      expect(ACHIEVEMENT_DEFINITIONS.streak_30_days).toBeDefined();
      expect(ACHIEVEMENT_DEFINITIONS.streak_100_days).toBeDefined();
      expect(ACHIEVEMENT_DEFINITIONS.streak_365_days).toBeDefined();
    });

    it('should have all required lesson milestones', () => {
      expect(ACHIEVEMENT_DEFINITIONS.lessons_10).toBeDefined();
      expect(ACHIEVEMENT_DEFINITIONS.lessons_50).toBeDefined();
      expect(ACHIEVEMENT_DEFINITIONS.lessons_100).toBeDefined();
    });

    it('should have valid categories for all achievements', () => {
      const validCategories = ['streak', 'lessons', 'social', 'special'];
      
      Object.values(ACHIEVEMENT_DEFINITIONS).forEach(achievement => {
        expect(validCategories).toContain(achievement.category);
      });
    });

    it('should have valid criteria types for all achievements', () => {
      const validTypes = ['streak', 'xp_total', 'lessons_count', 'level', 'custom'];
      
      Object.values(ACHIEVEMENT_DEFINITIONS).forEach(achievement => {
        expect(validTypes).toContain(achievement.criteria.type);
      });
    });
  });
});

describe('gamificationService - Daily Goal System', () => {
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DAILY_GOAL_TEMPLATES', () => {
    it('should have goals for all difficulty levels', () => {
      const easyGoals = DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === 'easy');
      const mediumGoals = DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === 'medium');
      const hardGoals = DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === 'hard');

      expect(easyGoals.length).toBeGreaterThan(0);
      expect(mediumGoals.length).toBeGreaterThan(0);
      expect(hardGoals.length).toBeGreaterThan(0);
    });

    it('should have valid difficulty levels for all templates', () => {
      const validDifficulties = ['easy', 'medium', 'hard'];
      
      DAILY_GOAL_TEMPLATES.forEach(template => {
        expect(validDifficulties).toContain(template.difficulty);
      });
    });

    it('should have positive target values and XP rewards', () => {
      DAILY_GOAL_TEMPLATES.forEach(template => {
        expect(template.targetValue).toBeGreaterThan(0);
        expect(template.xpReward).toBeGreaterThan(0);
      });
    });

    it('should have higher XP rewards for harder difficulties', () => {
      const easyGoals = DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === 'easy');
      const hardGoals = DAILY_GOAL_TEMPLATES.filter(t => t.difficulty === 'hard');

      const avgEasyXP = easyGoals.reduce((sum, g) => sum + g.xpReward, 0) / easyGoals.length;
      const avgHardXP = hardGoals.reduce((sum, g) => sum + g.xpReward, 0) / hardGoals.length;

      expect(avgHardXP).toBeGreaterThan(avgEasyXP);
    });
  });

  describe('getDailyGoals', () => {
    it('should return existing goals for today', async () => {
      const mockGoals = [
        {
          id: 'goal-1',
          user_id: TEST_USER_ID,
          goal_type: 'complete_lessons',
          target_value: 1,
          current_value: 0,
          xp_reward: 10,
          difficulty: 'easy',
          date: today,
          completed_at: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'goal-2',
          user_id: TEST_USER_ID,
          goal_type: 'earn_xp',
          target_value: 50,
          current_value: 20,
          xp_reward: 20,
          difficulty: 'medium',
          date: today,
          completed_at: null,
          created_at: new Date().toISOString(),
        },
      ];

      // Mock the final eq call to return the goals
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      (mockChain.eq as jest.Mock)
        .mockReturnValueOnce(mockChain) // First eq (user_id)
        .mockResolvedValueOnce({ data: mockGoals, error: null } as any); // Second eq (date)

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      const goals = await getDailyGoals(TEST_USER_ID);

      expect(goals).toHaveLength(2);
      expect(goals[0].goalType).toBe('complete_lessons');
      expect(goals[1].goalType).toBe('earn_xp');
    });

    it('should generate new goals when none exist for today', async () => {
      // Mock empty result for fetch, then successful insert
      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: fetch existing goals
          const mockChain = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
          };
          mockChain.eq = jest.fn()
            .mockReturnValueOnce(mockChain)
            .mockResolvedValueOnce({ data: [], error: null });
          return mockChain;
        } else {
          // Second call: insert new goals
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'goal-1',
                  user_id: TEST_USER_ID,
                  goal_type: 'complete_lessons',
                  target_value: 1,
                  current_value: 0,
                  xp_reward: 10,
                  difficulty: 'easy',
                  date: today,
                  completed_at: null,
                  created_at: new Date().toISOString(),
                },
                {
                  id: 'goal-2',
                  user_id: TEST_USER_ID,
                  goal_type: 'earn_xp',
                  target_value: 50,
                  current_value: 0,
                  xp_reward: 20,
                  difficulty: 'medium',
                  date: today,
                  completed_at: null,
                  created_at: new Date().toISOString(),
                },
                {
                  id: 'goal-3',
                  user_id: TEST_USER_ID,
                  goal_type: 'earn_xp',
                  target_value: 100,
                  current_value: 0,
                  xp_reward: 40,
                  difficulty: 'hard',
                  date: today,
                  completed_at: null,
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            }),
          };
        }
      });

      const goals = await getDailyGoals(TEST_USER_ID);

      expect(goals).toHaveLength(3);
      // Should have one of each difficulty
      const difficulties = goals.map(g => g.difficulty);
      expect(difficulties).toContain('easy');
      expect(difficulties).toContain('medium');
      expect(difficulties).toContain('hard');
    });

    it('should throw error when database fetch fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      mockChain.eq = jest.fn()
        .mockReturnValueOnce(mockChain)
        .mockResolvedValueOnce({ data: null, error: { message: 'Database error' } });

      (mockSupabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(getDailyGoals(TEST_USER_ID))
        .rejects.toThrow('Failed to fetch daily goals');
    });
  });

  describe('updateGoalProgress', () => {
    it('should increment goal progress', async () => {
      const mockGoal = {
        id: 'goal-1',
        user_id: TEST_USER_ID,
        goal_type: 'complete_lessons',
        target_value: 3,
        current_value: 1,
        xp_reward: 25,
        difficulty: 'medium',
        date: today,
        completed_at: null,
        created_at: new Date().toISOString(),
      };

      const updatedGoal = {
        ...mockGoal,
        current_value: 2,
      };

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: fetch goal
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockGoal, error: null } as any),
          };
        } else {
          // Second call: update goal
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: updatedGoal, error: null } as any),
          };
        }
      });

      const result = await updateGoalProgress(TEST_USER_ID, 'goal-1', 1);

      expect(result.currentValue).toBe(2);
      expect(result.completedAt).toBeUndefined();
    });

    it('should mark goal as complete when target is reached', async () => {
      const mockGoal = {
        id: 'goal-1',
        user_id: TEST_USER_ID,
        goal_type: 'complete_lessons',
        target_value: 3,
        current_value: 2,
        xp_reward: 25,
        difficulty: 'medium',
        date: today,
        completed_at: null,
        created_at: new Date().toISOString(),
      };

      const completedGoal = {
        ...mockGoal,
        current_value: 3,
        completed_at: new Date().toISOString(),
      };

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: fetch goal
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockGoal, error: null } as any),
          };
        } else {
          // Second call: update goal
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: completedGoal, error: null } as any),
          };
        }
      });

      const result = await updateGoalProgress(TEST_USER_ID, 'goal-1', 1);

      expect(result.currentValue).toBe(3);
      expect(result.completedAt).toBeDefined();
    });

    it('should not update already completed goals', async () => {
      const completedGoal = {
        id: 'goal-1',
        user_id: TEST_USER_ID,
        goal_type: 'complete_lessons',
        target_value: 3,
        current_value: 3,
        xp_reward: 25,
        difficulty: 'medium',
        date: today,
        completed_at: '2024-01-01T12:00:00Z',
        created_at: new Date().toISOString(),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: completedGoal, error: null } as any),
      });

      const result = await updateGoalProgress(TEST_USER_ID, 'goal-1', 1);

      expect(result.currentValue).toBe(3);
      expect(result.completedAt).toBe('2024-01-01T12:00:00Z');
    });

    it('should not exceed target value', async () => {
      const mockGoal = {
        id: 'goal-1',
        user_id: TEST_USER_ID,
        goal_type: 'complete_lessons',
        target_value: 3,
        current_value: 2,
        xp_reward: 25,
        difficulty: 'medium',
        date: today,
        completed_at: null,
        created_at: new Date().toISOString(),
      };

      const completedGoal = {
        ...mockGoal,
        current_value: 3, // Should cap at 3, not go to 5
        completed_at: new Date().toISOString(),
      };

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockGoal, error: null } as any),
          };
        } else {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: completedGoal, error: null } as any),
          };
        }
      });

      const result = await updateGoalProgress(TEST_USER_ID, 'goal-1', 3);

      expect(result.currentValue).toBe(3);
    });
  });

  describe('completeDailyGoal', () => {
    it('should mark goal as complete and return XP reward', async () => {
      const mockGoal = {
        id: 'goal-1',
        user_id: TEST_USER_ID,
        goal_type: 'complete_lessons',
        target_value: 3,
        current_value: 2,
        xp_reward: 25,
        difficulty: 'medium',
        date: today,
        completed_at: null,
        created_at: new Date().toISOString(),
      };

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: fetch goal
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockGoal, error: null } as any),
          };
        } else {
          // Second call: update goal
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
          };
        }
      });

      const xpReward = await completeDailyGoal(TEST_USER_ID, 'goal-1');

      expect(xpReward).toBe(25);
    });

    it('should return 0 XP for already completed goals', async () => {
      const completedGoal = {
        id: 'goal-1',
        user_id: TEST_USER_ID,
        goal_type: 'complete_lessons',
        target_value: 3,
        current_value: 3,
        xp_reward: 25,
        difficulty: 'medium',
        date: today,
        completed_at: '2024-01-01T12:00:00Z',
        created_at: new Date().toISOString(),
      };

      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: completedGoal, error: null } as any),
      });

      const xpReward = await completeDailyGoal(TEST_USER_ID, 'goal-1');

      expect(xpReward).toBe(0);
    });

    it('should throw error when goal not found', async () => {
      (mockSupabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
      });

      await expect(completeDailyGoal(TEST_USER_ID, 'invalid-goal'))
        .rejects.toThrow('Failed to fetch goal');
    });
  });

  describe('getGoalTemplate', () => {
    it('should return template for valid goal type and difficulty', () => {
      const template = getGoalTemplate('complete_lessons', 'easy');
      
      expect(template).toBeDefined();
      expect(template?.goalType).toBe('complete_lessons');
      expect(template?.difficulty).toBe('easy');
    });

    it('should return undefined for invalid goal type', () => {
      const template = getGoalTemplate('invalid_type', 'easy');
      
      expect(template).toBeUndefined();
    });

    it('should return undefined for invalid difficulty', () => {
      const template = getGoalTemplate('complete_lessons', 'invalid' as any);
      
      expect(template).toBeUndefined();
    });
  });

  describe('getGoalTemplatesByDifficulty', () => {
    it('should return all easy templates', () => {
      const templates = getGoalTemplatesByDifficulty('easy');
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.difficulty).toBe('easy');
      });
    });

    it('should return all medium templates', () => {
      const templates = getGoalTemplatesByDifficulty('medium');
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.difficulty).toBe('medium');
      });
    });

    it('should return all hard templates', () => {
      const templates = getGoalTemplatesByDifficulty('hard');
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach(t => {
        expect(t.difficulty).toBe('hard');
      });
    });
  });
});


