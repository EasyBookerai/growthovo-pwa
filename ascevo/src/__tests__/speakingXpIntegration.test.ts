/**
 * Tests for XP, streak, and milestone integration in speaking service
 * Validates Requirements 14.1–14.10, 15.4–15.5, 17.1–17.5
 */

import { submitSession, submitWeeklyChallengeSession, StartSessionParams } from '../services/speakingService';
import { awardXP } from '../services/progressService';
import { incrementStreak } from '../services/streakService';
import type { SpeechAnalysisResult } from '../types';

// Mock the dependencies
jest.mock('../services/progressService');
jest.mock('../services/streakService');
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
    functions: {
      invoke: jest.fn(() =>
        Promise.resolve({
          data: {
            sessionId: 'test-session-id',
            confidenceScore: 75,
            sessionNumber: 1,
            languageStrength: 70,
            fillersPerMinute: 2.5,
            fillerWords: { um: 3, like: 2 },
            fillerPositions: [],
            paceWpm: 145,
            paceScore: 100,
            structureScore: 80,
            openingStrength: 75,
            closingStrength: 70,
            anxiousPauses: 2,
            purposefulPauses: 3,
            weakLanguageExamples: ['maybe', 'I think'],
            strongLanguageExamples: ['I will', 'definitely'],
            biggestWin: 'Strong opening',
            biggestFix: 'Reduce filler words',
            openingAnalysis: 'Good hook',
            closingAnalysis: 'Clear conclusion',
            comparedToLastSession: 'Improved',
            rexVerdict: 'Solid session',
            rexAudioUrl: 'https://example.com/audio.mp3',
            tomorrowFocus: 'Focus on pace',
            transcript: 'Test transcript',
          },
          error: null,
        })
      ),
    },
  },
}));

const mockAwardXP = awardXP as jest.MockedFunction<typeof awardXP>;
const mockIncrementStreak = incrementStreak as jest.MockedFunction<typeof incrementStreak>;

describe('Speaking XP and Streak Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockParams: StartSessionParams = {
    userId: 'test-user-id',
    level: 1,
    topic: 'Test topic',
    audioUri: 'file://test.m4a',
    durationSeconds: 30,
    language: 'en',
  };

  describe('submitSession', () => {
    it('should award 30 XP for completing a session', async () => {
      const result = await submitSession(mockParams);

      expect(mockAwardXP).toHaveBeenCalledWith(
        'test-user-id',
        30,
        'speaking_session',
        'test-session-id'
      );
      expect(result.sessionId).toBe('test-session-id');
    });

    it('should update streak after completing a session', async () => {
      await submitSession(mockParams);

      expect(mockIncrementStreak).toHaveBeenCalledWith('test-user-id');
    });

    it('should call both XP and streak services in order', async () => {
      await submitSession(mockParams);

      expect(mockAwardXP).toHaveBeenCalled();
      expect(mockIncrementStreak).toHaveBeenCalled();
      
      // Verify order: XP should be awarded before streak is incremented
      const awardXPOrder = mockAwardXP.mock.invocationCallOrder[0];
      const incrementStreakOrder = mockIncrementStreak.mock.invocationCallOrder[0];
      expect(awardXPOrder).toBeLessThan(incrementStreakOrder);
    });
  });

  describe('submitWeeklyChallengeSession', () => {
    it('should award 100 bonus XP for completing weekly challenge', async () => {
      const challengeId = 'challenge-123';
      const result = await submitWeeklyChallengeSession(mockParams, challengeId);

      // Should award 30 XP for the session
      expect(mockAwardXP).toHaveBeenCalledWith(
        'test-user-id',
        30,
        'speaking_session',
        'test-session-id'
      );

      // Should award 100 bonus XP for the challenge
      expect(mockAwardXP).toHaveBeenCalledWith(
        'test-user-id',
        100,
        'speaking_challenge',
        challengeId
      );

      expect(result.sessionId).toBe('test-session-id');
    });

    it('should update streak for weekly challenge', async () => {
      await submitWeeklyChallengeSession(mockParams, 'challenge-123');

      expect(mockIncrementStreak).toHaveBeenCalledWith('test-user-id');
    });

    it('should award total 130 XP for weekly challenge (30 + 100)', async () => {
      await submitWeeklyChallengeSession(mockParams, 'challenge-123');

      // Verify both XP awards were made
      expect(mockAwardXP).toHaveBeenCalledTimes(2);
      
      const totalXP = mockAwardXP.mock.calls.reduce((sum, call) => sum + call[1], 0);
      expect(totalXP).toBe(130);
    });
  });

  describe('Error handling', () => {
    it('should not award XP if session submission fails', async () => {
      const { supabase } = require('../services/supabaseClient');
      supabase.functions.invoke.mockResolvedValueOnce({
        data: null,
        error: { message: 'API error' },
      });

      await expect(submitSession(mockParams)).rejects.toThrow('analyze-speech failed');
      expect(mockAwardXP).not.toHaveBeenCalled();
      expect(mockIncrementStreak).not.toHaveBeenCalled();
    });

    it('should handle XP award failure gracefully', async () => {
      mockAwardXP.mockRejectedValueOnce(new Error('XP service error'));

      await expect(submitSession(mockParams)).rejects.toThrow('XP service error');
      // Streak should not be called if XP fails
      expect(mockIncrementStreak).not.toHaveBeenCalled();
    });
  });
});
