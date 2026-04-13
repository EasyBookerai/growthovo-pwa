/**
 * Integration & Property-Based Tests — Rex Edge Function Logic
 *
 * Tests the pure decision logic extracted from the rex-response Edge Function:
 * - Property 5: Free user never triggers OpenAI (rate gate)
 * - Property 6 & 7: Premium user daily cap enforcement
 * - Property 8: Cost log math accuracy
 *
 * These tests validate the logic in isolation without a live Supabase or OpenAI.
 */

import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Logic under test (extracted from edge function for testability)
// ---------------------------------------------------------------------------

type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled'

const DAILY_AI_LIMIT = 3
const COST_GPT4O_MINI = 0.0002
const COST_GPT4O = 0.002

/**
 * Returns true if an OpenAI call should be made.
 * Mirrors the gate logic in rex-response/index.ts.
 */
function shouldCallOpenAI(
  subscriptionStatus: SubscriptionStatus,
  usageCount: number
): boolean {
  if (subscriptionStatus === 'free' || subscriptionStatus === 'canceled') return false
  if (usageCount >= DAILY_AI_LIMIT) return false
  return true
}

/**
 * Computes total estimated cost for a sequence of model calls.
 * Mirrors the cost logging logic in rex-response/index.ts.
 */
function computeTotalCost(miniCalls: number, gpt4oCalls: number): number {
  return miniCalls * COST_GPT4O_MINI + gpt4oCalls * COST_GPT4O
}

// ---------------------------------------------------------------------------
// Property 5: Free user never triggers OpenAI
// Validates: Requirements 7.1
// ---------------------------------------------------------------------------
describe('Property 5: Free user never triggers OpenAI', () => {
  it('free users always get fallback regardless of usage count', () => {
    fc.assert(
      fc.property(fc.nat({ max: 10 }), (usageCount) => {
        return shouldCallOpenAI('free', usageCount) === false
      }),
      { numRuns: 25 }
    )
  })

  it('canceled users always get fallback', () => {
    fc.assert(
      fc.property(fc.nat({ max: 10 }), (usageCount) => {
        return shouldCallOpenAI('canceled', usageCount) === false
      }),
      { numRuns: 25 }
    )
  })

  it('free user with 0 usage still gets fallback', () => {
    expect(shouldCallOpenAI('free', 0)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Property 6 & 7: Premium user daily cap enforcement
// Validates: Requirements 7.3, 7.4
// ---------------------------------------------------------------------------
describe('Property 6 & 7: Premium user daily cap enforcement', () => {
  it('premium users with count < 3 get real AI response', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('active' as const, 'trialing' as const),
        fc.nat({ max: 2 }),
        (status, count) => {
          return shouldCallOpenAI(status, count) === true
        }
      ),
      { numRuns: 25 }
    )
  })

  it('premium users with count >= 3 get fallback', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('active' as const, 'trialing' as const),
        fc.integer({ min: 3, max: 20 }),
        (status, count) => {
          return shouldCallOpenAI(status, count) === false
        }
      ),
      { numRuns: 25 }
    )
  })

  it('boundary: count=2 → AI call allowed', () => {
    expect(shouldCallOpenAI('active', 2)).toBe(true)
  })

  it('boundary: count=3 → fallback', () => {
    expect(shouldCallOpenAI('active', 3)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Property 8: Cost log math accuracy
// Validates: Requirements 9.1, 9.2
//
// For any N gpt-4o-mini calls and M gpt-4o calls, total cost =
// N × 0.0002 + M × 0.002
// ---------------------------------------------------------------------------
describe('Property 8: Cost log math accuracy', () => {
  it('total cost equals N×0.0002 + M×0.002 for any N, M', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 1000 }),
        fc.nat({ max: 100 }),
        (miniCalls, gpt4oCalls) => {
          const expected = miniCalls * COST_GPT4O_MINI + gpt4oCalls * COST_GPT4O
          const actual = computeTotalCost(miniCalls, gpt4oCalls)
          // Use approximate equality to handle floating point
          return Math.abs(actual - expected) < 1e-9
        }
      ),
      { numRuns: 25 }
    )
  })

  it('0 calls = €0 cost', () => {
    expect(computeTotalCost(0, 0)).toBe(0)
  })

  it('1 gpt-4o-mini call = €0.0002', () => {
    expect(computeTotalCost(1, 0)).toBeCloseTo(0.0002, 6)
  })

  it('1 gpt-4o call = €0.002', () => {
    expect(computeTotalCost(0, 1)).toBeCloseTo(0.002, 6)
  })

  it('mixed: 5 mini + 2 gpt4o = €0.005', () => {
    expect(computeTotalCost(5, 2)).toBeCloseTo(5 * 0.0002 + 2 * 0.002, 6)
  })
})
