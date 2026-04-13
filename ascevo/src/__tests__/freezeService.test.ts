/**
 * Tests for freezeService pure logic
 *
 * Covers:
 *  - Unit tests: purchaseStreakFreeze validation logic
 *  - Property 7: Freeze purchase XP deduction round-trip
 *  - Property 8: Freeze cap enforcement
 *
 * Feature: growthovo-features-v3
 * Validates: Requirements 5.11, 5.12, 5.16
 *
 * Note: freezeService imports are resolved via moduleNameMapper:
 *   ./progressService  → src/__mocks__/progressService.ts
 *   ./supabaseClient   → src/__mocks__/supabaseClient.ts
 *   expo-notifications → src/__mocks__/empty.ts
 * We import from those same resolved paths so we share the same mock instances.
 */

import * as fc from 'fast-check';
import { purchaseStreakFreeze } from '../services/freezeService';
import { FREEZE_COST_XP, MAX_FREEZES } from '../types';

// Import the shared mock instances (same modules freezeService.ts resolves to)
import { awardXP } from '../services/progressService';
import { supabase } from '../services/supabaseClient';

// Cast to jest mocks
const mockAwardXP = awardXP as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

// ─── Helper: set up a successful DB mock ─────────────────────────────────────

function setupSuccessfulDbMock(freezeCount: number) {
  mockFrom.mockReturnValue({
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    }),
  });
}

function setupFailingDbMock() {
  mockFrom.mockReturnValue({
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: new Error('DB error') }),
    }),
  });
}

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('purchaseStreakFreeze — unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAwardXP.mockResolvedValue(undefined);
    setupSuccessfulDbMock(1);
  });

  it('throws when XP is insufficient', async () => {
    await expect(purchaseStreakFreeze('user1', 400, 1))
      .rejects.toThrow('Insufficient XP to purchase streak freeze');
    expect(mockAwardXP).not.toHaveBeenCalled();
  });

  it('throws when already at max freezes', async () => {
    await expect(purchaseStreakFreeze('user1', 1000, MAX_FREEZES))
      .rejects.toThrow('Maximum freezes already held');
    expect(mockAwardXP).not.toHaveBeenCalled();
  });

  it('deducts XP and increments freeze on success', async () => {
    await purchaseStreakFreeze('user1', 1000, 1);
    expect(mockAwardXP).toHaveBeenCalledWith('user1', -FREEZE_COST_XP, 'streak_milestone', 'freeze_purchase');
  });

  it('rolls back XP if DB update fails', async () => {
    setupFailingDbMock();
    await expect(purchaseStreakFreeze('user1', 1000, 1))
      .rejects.toThrow('Failed to update freeze count');
    expect(mockAwardXP).toHaveBeenCalledWith('user1', FREEZE_COST_XP, 'streak_milestone', 'freeze_purchase_rollback');
  });
});

// ─── Property 7 ───────────────────────────────────────────────────────────────
// "Freeze purchase XP deduction round-trip"
// **Validates: Requirements 5.11**

describe('Property 7: Freeze purchase XP deduction round-trip', () => {
  it('for any valid XP and freeze state, purchase deducts exactly FREEZE_COST_XP', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: FREEZE_COST_XP, max: 10000 }),
        fc.integer({ min: 0, max: MAX_FREEZES - 1 }),
        async (currentXp, currentFreezes) => {
          jest.clearAllMocks();
          mockAwardXP.mockResolvedValue(undefined);
          mockFrom.mockReturnValue({
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          });

          await purchaseStreakFreeze('test-user', currentXp, currentFreezes);

          const calls = mockAwardXP.mock.calls;
          if (calls.length === 0) return false;
          const [uid, amount, source, ref] = calls[0];
          return (
            uid === 'test-user' &&
            amount === -FREEZE_COST_XP &&
            source === 'streak_milestone' &&
            ref === 'freeze_purchase'
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('purchase always fails with insufficient XP — no XP deducted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: FREEZE_COST_XP - 1 }),
        fc.integer({ min: 0, max: MAX_FREEZES - 1 }),
        async (insufficientXp, currentFreezes) => {
          jest.clearAllMocks();
          mockAwardXP.mockResolvedValue(undefined);

          let threw = false;
          try {
            await purchaseStreakFreeze('test-user', insufficientXp, currentFreezes);
          } catch (e: any) {
            threw = e.message === 'Insufficient XP to purchase streak freeze';
          }

          return threw && mockAwardXP.mock.calls.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 8 ───────────────────────────────────────────────────────────────
// "Freeze cap enforcement"
// **Validates: Requirements 5.12, 5.16**

describe('Property 8: Freeze cap enforcement', () => {
  it('purchase always fails at MAX_FREEZES — no XP deducted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: FREEZE_COST_XP, max: 50000 }),
        async (sufficientXp) => {
          jest.clearAllMocks();
          mockAwardXP.mockResolvedValue(undefined);

          let threw = false;
          try {
            await purchaseStreakFreeze('test-user', sufficientXp, MAX_FREEZES);
          } catch (e: any) {
            threw = e.message === 'Maximum freezes already held';
          }

          return threw && mockAwardXP.mock.calls.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('purchase succeeds for any XP >= FREEZE_COST_XP when freezes < MAX_FREEZES', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: FREEZE_COST_XP, max: 50000 }),
        fc.integer({ min: 0, max: MAX_FREEZES - 1 }),
        async (sufficientXp, belowMaxFreezes) => {
          jest.clearAllMocks();
          mockAwardXP.mockResolvedValue(undefined);
          mockFrom.mockReturnValue({
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          });

          let didThrow = false;
          try {
            await purchaseStreakFreeze('test-user', sufficientXp, belowMaxFreezes);
          } catch {
            didThrow = true;
          }

          return !didThrow && mockAwardXP.mock.calls.length >= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('boundary: MAX_FREEZES - 1 succeeds, MAX_FREEZES fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: FREEZE_COST_XP, max: 50000 }),
        async (sufficientXp) => {
          // Test MAX_FREEZES - 1 (should succeed)
          jest.clearAllMocks();
          mockAwardXP.mockResolvedValue(undefined);
          mockFrom.mockReturnValue({
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          });

          let belowMaxSucceeded = false;
          try {
            await purchaseStreakFreeze('test-user', sufficientXp, MAX_FREEZES - 1);
            belowMaxSucceeded = true;
          } catch {
            belowMaxSucceeded = false;
          }

          // Test MAX_FREEZES (should fail)
          mockAwardXP.mockClear();
          let atMaxFailed = false;
          try {
            await purchaseStreakFreeze('test-user', sufficientXp, MAX_FREEZES);
          } catch (e: any) {
            atMaxFailed = e.message === 'Maximum freezes already held';
          }

          return belowMaxSucceeded && atMaxFailed;
        }
      ),
      { numRuns: 100 }
    );
  });
});
