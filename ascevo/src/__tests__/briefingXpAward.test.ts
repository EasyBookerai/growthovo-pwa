/**
 * Property-Based Tests — Briefing XP Award
 *
 * **Property 1: Morning briefing XP award is exactly 10**
 * For any userId, calling dismissBriefing results in awardXP being called
 * with exactly (userId, 10, 'morning_briefing').
 *
 * **Validates: Requirements 1.4**
 */

import * as fc from 'fast-check';
import { awardXP } from '../services/progressService';
import { supabase } from '../services/supabaseClient';

// Import the function under test AFTER mocks are set up
import { dismissBriefing } from '../services/briefingService';

// Cast mocks for type-safe assertions
const mockAwardXP = awardXP as jest.MockedFunction<typeof awardXP>;
const mockSupabaseFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Arbitrary for a non-empty userId string (UUID-like or any non-empty string). */
const arbUserId = fc.uuid();

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();

  // Default supabase.from mock: upsert succeeds, users select returns a profile
  mockSupabaseFrom.mockImplementation((table: string) => {
    const chain: Record<string, jest.Mock> = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { username: 'TestUser', current_streak: 5 },
        error: null,
      }),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockResolvedValue({ error: null }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      order: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    return chain as ReturnType<typeof supabase.from>;
  });
});

// ---------------------------------------------------------------------------
// Property 1: Morning briefing XP award is exactly 10
// Validates: Requirements 1.4
// ---------------------------------------------------------------------------

describe('Property 1: Morning briefing XP award is exactly 10', () => {
  it('awardXP is called with (userId, 10, "morning_briefing") for any userId', async () => {
    await fc.assert(
      fc.asyncProperty(arbUserId, async (userId) => {
        jest.clearAllMocks();

        // Re-apply supabase mock after clearAllMocks
        mockSupabaseFrom.mockImplementation((_table: string) => {
          const chain: Record<string, jest.Mock> = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { username: 'TestUser', current_streak: 5 },
              error: null,
            }),
            update: jest.fn().mockReturnThis(),
            upsert: jest.fn().mockResolvedValue({ error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
            order: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
          };
          return chain as ReturnType<typeof supabase.from>;
        });

        await dismissBriefing(userId);

        // Assert awardXP was called exactly once with the correct arguments
        expect(mockAwardXP).toHaveBeenCalledTimes(1);
        expect(mockAwardXP).toHaveBeenCalledWith(userId, 10, 'morning_briefing');
      }),
      { numRuns: 50 }
    );
  });

  it('awardXP is always called with exactly 10 XP — never more, never less', async () => {
    await fc.assert(
      fc.asyncProperty(arbUserId, async (userId) => {
        jest.clearAllMocks();

        mockSupabaseFrom.mockImplementation((_table: string) => {
          const chain: Record<string, jest.Mock> = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { username: 'TestUser', current_streak: 1 },
              error: null,
            }),
            update: jest.fn().mockReturnThis(),
            upsert: jest.fn().mockResolvedValue({ error: null }),
            insert: jest.fn().mockResolvedValue({ error: null }),
            order: jest.fn().mockReturnThis(),
            in: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
          };
          return chain as ReturnType<typeof supabase.from>;
        });

        await dismissBriefing(userId);

        const calls = mockAwardXP.mock.calls;
        // Must be called exactly once
        expect(calls).toHaveLength(1);
        // The XP amount (second argument) must be exactly 10
        const xpAmount = calls[0][1];
        expect(xpAmount).toBe(10);
        // The source (third argument) must be 'morning_briefing'
        const source = calls[0][2];
        expect(source).toBe('morning_briefing');
      }),
      { numRuns: 50 }
    );
  });
});

// ---------------------------------------------------------------------------
// Unit tests — dismissBriefing XP award
// ---------------------------------------------------------------------------

describe('dismissBriefing — XP award unit tests', () => {
  it('calls awardXP with the correct userId', async () => {
    const userId = 'user-abc-123';
    await dismissBriefing(userId);
    expect(mockAwardXP).toHaveBeenCalledWith(userId, 10, 'morning_briefing');
  });

  it('calls awardXP exactly once per dismissal', async () => {
    await dismissBriefing('user-xyz-456');
    expect(mockAwardXP).toHaveBeenCalledTimes(1);
  });

  it('awards exactly 10 XP — not 9, not 11', async () => {
    await dismissBriefing('user-test-789');
    const [, xpAmount] = mockAwardXP.mock.calls[0];
    expect(xpAmount).toBe(10);
    expect(xpAmount).not.toBe(9);
    expect(xpAmount).not.toBe(11);
  });

  it('uses source "morning_briefing" for the XP transaction', async () => {
    await dismissBriefing('user-source-check');
    const [, , source] = mockAwardXP.mock.calls[0];
    expect(source).toBe('morning_briefing');
  });

  it('still awards XP even when the users profile fetch returns null', async () => {
    mockSupabaseFrom.mockImplementation((_table: string) => {
      const chain: Record<string, jest.Mock> = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
        update: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockResolvedValue({ error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
        order: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      };
      return chain as ReturnType<typeof supabase.from>;
    });

    await dismissBriefing('user-no-profile');
    expect(mockAwardXP).toHaveBeenCalledWith('user-no-profile', 10, 'morning_briefing');
  });
});
