// 🧪 Property-Based Tests for Daily Goal System
// Tests universal properties across all inputs using fast-check
// Validates Requirements 4.1, 4.2, 4.3, 4.4, 4.5

import fc from 'fast-check';
import {
  DAILY_GOAL_TEMPLATES,
  getDailyGoals,
  updateGoalProgress,
  completeDailyGoal,
  getGoalTemplate,
  getGoalTemplatesByDifficulty,
} from '../services/gamificationService';
import { supabase } from '../services/supabaseClient';
import type { DailyGoal } from '../types';

// Mock supabase
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('Property Tests: Daily Goal System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 12: Daily Goal Persistence
   * For any daily goal that is created, it should be stored with target value and
   * progress tracking should update the current value correctly.
   * **Validates: Requirements 4.1, 4.2**
   */
  describe('Property 12: Daily Goal Persistence', () => {
    it('should create daily goals with correct target values', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.constantFrom('easy', 'medium', 'hard'), // difficulty
          async (userId, difficulty) => {
            const today = new Date().toISOString().split('T')[0];
            
            // Get templates for this difficulty
            const templates = getGoalTemplatesByDifficulty(difficulty as 'easy' | 'medium' | 'hard');
            expect(templates.length).toBeGreaterThan(0);

            // Mock database to return no existing goals, then return created goals
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // First call: check for existing goals (none found)
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                // Second call: insert new goals
                const mockGoals = [
                  {
                    id: 'goal-1',
                    user_id: userId,
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
                    user_id: userId,
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
                    user_id: userId,
                    goal_type: 'complete_lessons',
                    target_value: 5,
                    current_value: 0,
                    xp_reward: 50,
                    difficulty: 'hard',
                    date: today,
                    completed_at: null,
                    created_at: new Date().toISOString(),
                  },
                ];

                return {
                  insert: jest.fn().mockReturnThis(),
                  select: jest.fn().mockResolvedValue({ data: mockGoals, error: null }),
                };
              }
            });

            // Get daily goals
            const goals = await getDailyGoals(userId);

            // Should create 3 goals (one easy, one medium, one hard)
            expect(goals).toHaveLength(3);

            // All goals should have valid target values
            goals.forEach((goal) => {
              expect(goal.targetValue).toBeGreaterThan(0);
              expect(goal.currentValue).toBe(0);
              expect(goal.xpReward).toBeGreaterThan(0);
              expect(goal.userId).toBe(userId);
              expect(goal.date).toBe(today);
              expect(['easy', 'medium', 'hard']).toContain(goal.difficulty);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should update goal progress correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // goal ID
          fc.integer({ min: 1, max: 10 }), // target value
          fc.integer({ min: 0, max: 5 }), // current value
          fc.integer({ min: 1, max: 3 }), // increment amount
          async (userId, goalId, targetValue, currentValue, incrementBy) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database responses
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // First call: fetch current goal state
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: goalId,
                      user_id: userId,
                      goal_type: 'complete_lessons',
                      target_value: targetValue,
                      current_value: currentValue,
                      xp_reward: 25,
                      difficulty: 'medium',
                      date: today,
                      completed_at: null,
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              } else {
                // Second call: update goal progress
                const newValue = Math.min(currentValue + incrementBy, targetValue);
                const isComplete = newValue >= targetValue;
                
                return {
                  update: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: goalId,
                      user_id: userId,
                      goal_type: 'complete_lessons',
                      target_value: targetValue,
                      current_value: newValue,
                      xp_reward: 25,
                      difficulty: 'medium',
                      date: today,
                      completed_at: isComplete ? new Date().toISOString() : null,
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              }
            });

            // Update goal progress
            const updatedGoal = await updateGoalProgress(userId, goalId, incrementBy);

            // Current value should be updated correctly
            const expectedValue = Math.min(currentValue + incrementBy, targetValue);
            expect(updatedGoal.currentValue).toBe(expectedValue);
            
            // Should not exceed target value
            expect(updatedGoal.currentValue).toBeLessThanOrEqual(targetValue);
            
            // If reached target, should be marked complete
            if (expectedValue >= targetValue) {
              expect(updatedGoal.completedAt).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not update already completed goals', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // goal ID
          fc.integer({ min: 1, max: 10 }), // target value
          async (userId, goalId, targetValue) => {
            const today = new Date().toISOString().split('T')[0];
            const completedAt = new Date().toISOString();

            // Mock database to return completed goal
            (supabase.from as jest.Mock).mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: {
                  id: goalId,
                  user_id: userId,
                  goal_type: 'complete_lessons',
                  target_value: targetValue,
                  current_value: targetValue,
                  xp_reward: 25,
                  difficulty: 'medium',
                  date: today,
                  completed_at: completedAt,
                  created_at: new Date().toISOString(),
                },
                error: null,
              }),
            });

            // Try to update completed goal
            const updatedGoal = await updateGoalProgress(userId, goalId, 1);

            // Should return goal unchanged
            expect(updatedGoal.currentValue).toBe(targetValue);
            expect(updatedGoal.completedAt).toBe(completedAt);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should persist goals with correct date', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          async (userId) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database responses
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                return {
                  insert: jest.fn().mockReturnThis(),
                  select: jest.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'goal-1',
                        user_id: userId,
                        goal_type: 'complete_lessons',
                        target_value: 1,
                        current_value: 0,
                        xp_reward: 10,
                        difficulty: 'easy',
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

            // Get daily goals
            const goals = await getDailyGoals(userId);

            // All goals should have today's date
            goals.forEach((goal) => {
              expect(goal.date).toBe(today);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 13: Goal Completion Rewards
   * For any daily goal that reaches 100% completion, it should be marked as complete
   * and award the specified XP bonus.
   * **Validates: Requirements 4.3**
   */
  describe('Property 13: Goal Completion Rewards', () => {
    it('should mark goal as complete when target is reached', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // goal ID
          fc.integer({ min: 1, max: 100 }), // target value
          fc.integer({ min: 10, max: 100 }), // XP reward
          async (userId, goalId, targetValue, xpReward) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database responses
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // Fetch goal at target - 1
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: goalId,
                      user_id: userId,
                      goal_type: 'complete_lessons',
                      target_value: targetValue,
                      current_value: targetValue - 1,
                      xp_reward: xpReward,
                      difficulty: 'medium',
                      date: today,
                      completed_at: null,
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              } else {
                // Update to complete
                return {
                  update: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  select: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: goalId,
                      user_id: userId,
                      goal_type: 'complete_lessons',
                      target_value: targetValue,
                      current_value: targetValue,
                      xp_reward: xpReward,
                      difficulty: 'medium',
                      date: today,
                      completed_at: new Date().toISOString(),
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              }
            });

            // Update to reach target
            const updatedGoal = await updateGoalProgress(userId, goalId, 1);

            // Should be marked as complete
            expect(updatedGoal.completedAt).toBeDefined();
            expect(updatedGoal.currentValue).toBe(targetValue);
            
            // XP reward should match
            expect(updatedGoal.xpReward).toBe(xpReward);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should award correct XP amount when completing goal', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // goal ID
          fc.integer({ min: 10, max: 100 }), // XP reward
          async (userId, goalId, xpReward) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database responses
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // Fetch incomplete goal
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  single: jest.fn().mockResolvedValue({
                    data: {
                      id: goalId,
                      user_id: userId,
                      goal_type: 'complete_lessons',
                      target_value: 5,
                      current_value: 3,
                      xp_reward: xpReward,
                      difficulty: 'medium',
                      date: today,
                      completed_at: null,
                      created_at: new Date().toISOString(),
                    },
                    error: null,
                  }),
                };
              } else {
                // Complete goal - need to chain two eq() calls
                const mockEq = jest.fn().mockResolvedValue({ error: null });
                return {
                  update: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnValue({ eq: mockEq }),
                };
              }
            });

            // Complete the goal
            const earnedXp = await completeDailyGoal(userId, goalId);

            // Should return the correct XP reward
            expect(earnedXp).toBe(xpReward);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not award XP for already completed goals', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.uuid(), // goal ID
          fc.integer({ min: 10, max: 100 }), // XP reward
          async (userId, goalId, xpReward) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database to return already completed goal
            (supabase.from as jest.Mock).mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: {
                  id: goalId,
                  user_id: userId,
                  goal_type: 'complete_lessons',
                  target_value: 5,
                  current_value: 5,
                  xp_reward: xpReward,
                  difficulty: 'medium',
                  date: today,
                  completed_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                },
                error: null,
              }),
            });

            // Try to complete already completed goal
            const earnedXp = await completeDailyGoal(userId, goalId);

            // Should return 0 XP (no double rewards)
            expect(earnedXp).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have XP rewards that scale with difficulty', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('easy', 'medium', 'hard'),
          (difficulty) => {
            const templates = getGoalTemplatesByDifficulty(difficulty as 'easy' | 'medium' | 'hard');
            
            // All templates should have positive XP rewards
            templates.forEach((template) => {
              expect(template.xpReward).toBeGreaterThan(0);
              
              // Easy goals should have lower rewards
              if (difficulty === 'easy') {
                expect(template.xpReward).toBeLessThanOrEqual(20);
              }
              
              // Hard goals should have higher rewards
              if (difficulty === 'hard') {
                expect(template.xpReward).toBeGreaterThanOrEqual(40);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 14: Daily Goal Reset
   * For any new day, daily goals from the previous day should not be active,
   * and new goals should be generated for the current day.
   * **Validates: Requirements 4.4**
   */
  describe('Property 14: Daily Goal Reset', () => {
    it('should not return goals from previous days', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.integer({ min: 1, max: 30 }), // days ago
          async (userId, daysAgo) => {
            const today = new Date().toISOString().split('T')[0];
            const previousDate = new Date();
            previousDate.setDate(previousDate.getDate() - daysAgo);
            const previousDateStr = previousDate.toISOString().split('T')[0];

            // Mock database to return empty array (no goals for today)
            // Then mock the insert for new goals
            let callCount = 0;
            const mockEq = jest.fn().mockReturnThis();
            
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // First call: query for today's goals (returns empty)
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: mockEq,
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                // Second call: insert new goals
                return {
                  insert: jest.fn().mockReturnThis(),
                  select: jest.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'new-goal',
                        user_id: userId,
                        goal_type: 'complete_lessons',
                        target_value: 1,
                        current_value: 0,
                        xp_reward: 10,
                        difficulty: 'easy',
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

            // Call getDailyGoals - it will query for today's date
            await getDailyGoals(userId);
            
            // The query should filter by today's date (not previous date)
            expect(mockEq).toHaveBeenCalledWith('date', today);
            expect(mockEq).toHaveBeenCalledWith('user_id', userId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate new goals when none exist for today', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          async (userId) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database responses
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                // No existing goals for today
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                // Insert new goals
                return {
                  insert: jest.fn().mockReturnThis(),
                  select: jest.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'new-goal-1',
                        user_id: userId,
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
                        id: 'new-goal-2',
                        user_id: userId,
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
                        id: 'new-goal-3',
                        user_id: userId,
                        goal_type: 'complete_lessons',
                        target_value: 5,
                        current_value: 0,
                        xp_reward: 50,
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

            // Get daily goals
            const goals = await getDailyGoals(userId);

            // Should generate new goals
            expect(goals.length).toBeGreaterThan(0);
            
            // All goals should be for today
            goals.forEach((goal) => {
              expect(goal.date).toBe(today);
              expect(goal.currentValue).toBe(0);
              expect(goal.completedAt).toBeUndefined();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return existing goals if they exist for today', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          fc.integer({ min: 1, max: 5 }), // progress on goal (at least 1 to ensure data exists)
          async (userId, progress) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database to return existing goals for today (with data, so no insert needed)
            // Note: getDailyGoals uses .select().eq().eq() without .order()
            const mockEq2 = jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'existing-goal',
                  user_id: userId,
                  goal_type: 'complete_lessons',
                  target_value: 5,
                  current_value: progress,
                  xp_reward: 25,
                  difficulty: 'medium',
                  date: today,
                  completed_at: null,
                  created_at: new Date().toISOString(),
                },
              ],
              error: null,
            });
            
            const mockEq1 = jest.fn().mockReturnValue({ eq: mockEq2 });
            
            (supabase.from as jest.Mock).mockImplementation(() => ({
              select: jest.fn().mockReturnThis(),
              eq: mockEq1,
            }));

            // Get daily goals
            const goals = await getDailyGoals(userId);

            // Should return existing goals with progress preserved
            expect(goals.length).toBeGreaterThan(0);
            expect(goals[0].currentValue).toBe(progress);
            expect(goals[0].date).toBe(today);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate one goal per difficulty level', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          async (userId) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database responses
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                return {
                  insert: jest.fn().mockReturnThis(),
                  select: jest.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'goal-1',
                        user_id: userId,
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
                        user_id: userId,
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
                        user_id: userId,
                        goal_type: 'complete_lessons',
                        target_value: 5,
                        current_value: 0,
                        xp_reward: 50,
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

            // Get daily goals
            const goals = await getDailyGoals(userId);

            // Should have 3 goals (one per difficulty)
            expect(goals).toHaveLength(3);
            
            // Should have one of each difficulty
            const difficulties = goals.map(g => g.difficulty).sort();
            expect(difficulties).toEqual(['easy', 'hard', 'medium']);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 15: Goal Difficulty Levels
   * For any daily goal, it should have a difficulty level of easy, medium, or hard.
   * **Validates: Requirements 4.5**
   */
  describe('Property 15: Goal Difficulty Levels', () => {
    it('should have valid difficulty level for all goal templates', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: DAILY_GOAL_TEMPLATES.length - 1 }),
          (templateIndex) => {
            const template = DAILY_GOAL_TEMPLATES[templateIndex];
            const validDifficulties = ['easy', 'medium', 'hard'];

            // Template should have a valid difficulty
            expect(validDifficulties).toContain(template.difficulty);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have all three difficulty levels represented in templates', () => {
      const difficulties = new Set(DAILY_GOAL_TEMPLATES.map(t => t.difficulty));

      // Should have all three difficulty levels
      expect(difficulties).toContain('easy');
      expect(difficulties).toContain('medium');
      expect(difficulties).toContain('hard');
      expect(difficulties.size).toBe(3);
    });

    it('should filter templates by difficulty correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('easy', 'medium', 'hard'),
          (difficulty) => {
            const templates = getGoalTemplatesByDifficulty(difficulty as 'easy' | 'medium' | 'hard');

            // All returned templates should have the requested difficulty
            templates.forEach((template) => {
              expect(template.difficulty).toBe(difficulty);
            });

            // Should return at least one template for each difficulty
            expect(templates.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should retrieve goal template by type and difficulty', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('complete_lessons', 'earn_xp', 'maintain_streak', 'perfect_lessons', 'practice_time'),
          fc.constantFrom('easy', 'medium', 'hard'),
          (goalType, difficulty) => {
            const template = getGoalTemplate(goalType, difficulty as 'easy' | 'medium' | 'hard');

            // If template exists, it should match the criteria
            if (template) {
              expect(template.goalType).toBe(goalType);
              expect(template.difficulty).toBe(difficulty);
              expect(template.targetValue).toBeGreaterThan(0);
              expect(template.xpReward).toBeGreaterThan(0);
              expect(template.title).toBeTruthy();
              expect(template.description).toBeTruthy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have difficulty-appropriate target values', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('easy', 'medium', 'hard'),
          (difficulty) => {
            const templates = getGoalTemplatesByDifficulty(difficulty as 'easy' | 'medium' | 'hard');

            templates.forEach((template) => {
              // Easy goals should have lower targets
              if (difficulty === 'easy') {
                expect(template.targetValue).toBeLessThanOrEqual(20);
              }
              
              // Hard goals should have higher targets
              if (difficulty === 'hard') {
                expect(template.targetValue).toBeGreaterThanOrEqual(3);
              }
              
              // All targets should be positive
              expect(template.targetValue).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should assign difficulty to created goals', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user ID
          async (userId) => {
            const today = new Date().toISOString().split('T')[0];

            // Mock database responses
            let callCount = 0;
            (supabase.from as jest.Mock).mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                return {
                  select: jest.fn().mockReturnThis(),
                  eq: jest.fn().mockReturnThis(),
                  order: jest.fn().mockResolvedValue({ data: [], error: null }),
                };
              } else {
                return {
                  insert: jest.fn().mockReturnThis(),
                  select: jest.fn().mockResolvedValue({
                    data: [
                      {
                        id: 'goal-1',
                        user_id: userId,
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
                        user_id: userId,
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
                        user_id: userId,
                        goal_type: 'complete_lessons',
                        target_value: 5,
                        current_value: 0,
                        xp_reward: 50,
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

            // Get daily goals
            const goals = await getDailyGoals(userId);

            // All goals should have valid difficulty levels
            const validDifficulties = ['easy', 'medium', 'hard'];
            goals.forEach((goal) => {
              expect(validDifficulties).toContain(goal.difficulty);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have consistent difficulty across all goal fields', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: DAILY_GOAL_TEMPLATES.length - 1 }),
          (templateIndex) => {
            const template = DAILY_GOAL_TEMPLATES[templateIndex];

            // Difficulty should be reflected in both target and reward
            if (template.difficulty === 'easy') {
              expect(template.targetValue).toBeLessThanOrEqual(20);
              expect(template.xpReward).toBeLessThanOrEqual(20);
            } else if (template.difficulty === 'hard') {
              expect(template.targetValue).toBeGreaterThanOrEqual(3);
              expect(template.xpReward).toBeGreaterThanOrEqual(40);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have non-empty required fields for all templates', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: DAILY_GOAL_TEMPLATES.length - 1 }),
          (templateIndex) => {
            const template = DAILY_GOAL_TEMPLATES[templateIndex];

            // All required fields should be non-empty
            expect(template.goalType).toBeTruthy();
            expect(template.title).toBeTruthy();
            expect(template.description).toBeTruthy();
            expect(template.targetValue).toBeGreaterThan(0);
            expect(template.xpReward).toBeGreaterThan(0);
            expect(['easy', 'medium', 'hard']).toContain(template.difficulty);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should have multiple goal types for variety', () => {
      const goalTypes = new Set(DAILY_GOAL_TEMPLATES.map(t => t.goalType));

      // Should have multiple goal types for variety
      expect(goalTypes.size).toBeGreaterThan(1);
      
      // Common goal types should be present
      expect(goalTypes).toContain('complete_lessons');
      expect(goalTypes).toContain('earn_xp');
    });

    it('should have at least 2 templates per difficulty level', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('easy', 'medium', 'hard'),
          (difficulty) => {
            const templates = getGoalTemplatesByDifficulty(difficulty as 'easy' | 'medium' | 'hard');

            // Should have at least 2 templates per difficulty for variety
            expect(templates.length).toBeGreaterThanOrEqual(2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
