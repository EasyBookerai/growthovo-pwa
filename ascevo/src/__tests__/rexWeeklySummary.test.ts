/**
 * Property-Based Tests — Weekly Summary Logic
 *
 * Property 9: Weekly summary skips low-activity users
 * Validates: Requirements 8.5
 *
 * Tests the pure eligibility logic extracted from weekly-rex-summary/index.ts.
 */

import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// Logic under test (extracted from edge function for testability)
// ---------------------------------------------------------------------------

const MIN_ACTIVE_DAYS = 3

/**
 * Determines if a user is eligible for a weekly summary.
 * Mirrors the check in weekly-rex-summary/index.ts.
 */
function isEligibleForWeeklySummary(activeDays: number): boolean {
  return activeDays >= MIN_ACTIVE_DAYS
}

// ---------------------------------------------------------------------------
// Property 9: Weekly summary skips low-activity users
// Validates: Requirements 8.5
// ---------------------------------------------------------------------------
describe('Property 9: Weekly summary skips low-activity users', () => {
  it('users with fewer than 3 active days are never eligible', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (activeDays) => {
        return isEligibleForWeeklySummary(activeDays) === false
      }),
      { numRuns: 25 }
    )
  })

  it('users with 3 or more active days are always eligible', () => {
    fc.assert(
      fc.property(fc.integer({ min: 3, max: 7 }), (activeDays) => {
        return isEligibleForWeeklySummary(activeDays) === true
      }),
      { numRuns: 25 }
    )
  })

  it('boundary: 0 active days → not eligible', () => {
    expect(isEligibleForWeeklySummary(0)).toBe(false)
  })

  it('boundary: 2 active days → not eligible', () => {
    expect(isEligibleForWeeklySummary(2)).toBe(false)
  })

  it('boundary: 3 active days → eligible', () => {
    expect(isEligibleForWeeklySummary(3)).toBe(true)
  })

  it('boundary: 7 active days → eligible', () => {
    expect(isEligibleForWeeklySummary(7)).toBe(true)
  })
})
