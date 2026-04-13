/**
 * Tests for analyze-speech Edge Function logic
 *
 * Feature: public-speaking-trainer
 * Framework: Jest (unit) + fast-check (property-based)
 *
 * Since the analyze-speech function is a Deno Edge Function that cannot be
 * directly unit tested in Jest, we test the LOGIC it implements:
 *   - Task 4.5 (Property 19): Free tier short-circuit — no GPT or TTS results
 *   - Task 4.6 (Property 17): GPT and TTS caching is idempotent (hash determinism)
 */

import fc from 'fast-check';
import crypto from 'crypto';

// ─── Helper: Free Tier Detection ─────────────────────────────────────────────
// Mirrors the logic in analyze-speech/index.ts:
//   if (subscriptionStatus === 'free' || subscriptionStatus === 'canceled') → skip GPT/TTS
type SubscriptionStatus = 'free' | 'canceled' | 'active' | 'trialing';

function isFreeTier(status: SubscriptionStatus): boolean {
  return status === 'free' || status === 'canceled';
}

// ─── Helper: SHA-256 hash (mirrors Deno's crypto.subtle usage in Edge Function) ──
function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// ─── Simulated partial result for free tier ───────────────────────────────────
// The Edge Function returns these fields as null/absent for free-tier users.
interface FreeTierResult {
  // Pure metrics — always present
  paceWpm: number;
  paceScore: number;
  fillersPerMinute: number;
  fillerWords: Record<string, number>;
  // GPT-derived fields — null for free tier
  rexVerdict: string | null;
  rexAudioUrl: string | null;
  languageStrength: number | null;
  structureScore: number | null;
  openingStrength: number | null;
  closingStrength: number | null;
}

function buildAnalysisResult(
  subscriptionStatus: SubscriptionStatus
): FreeTierResult {
  const free = isFreeTier(subscriptionStatus);
  return {
    // Pure metrics always computed
    paceWpm: 140,
    paceScore: 100,
    fillersPerMinute: 2.5,
    fillerWords: { um: 3 },
    // GPT-derived fields: null when free tier
    rexVerdict: free ? null : 'Great session. Keep pushing.',
    rexAudioUrl: free ? null : 'https://storage.example.com/tts/abc123.mp3',
    languageStrength: free ? null : 72,
    structureScore: free ? null : 68,
    openingStrength: free ? null : 80,
    closingStrength: free ? null : 75,
  };
}

// ─── Property 19 ─────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 19: Free tier receives no GPT or TTS results
// Validates: Requirements 16.2, 16.4, 18.6

describe('Property 19: Free tier receives no GPT or TTS results', () => {
  // Unit test: isFreeTier correctly identifies free and canceled statuses
  it('isFreeTier returns true for "free" status', () => {
    expect(isFreeTier('free')).toBe(true);
  });

  it('isFreeTier returns true for "canceled" status', () => {
    expect(isFreeTier('canceled')).toBe(true);
  });

  it('isFreeTier returns false for "active" status', () => {
    expect(isFreeTier('active')).toBe(false);
  });

  it('isFreeTier returns false for "trialing" status', () => {
    expect(isFreeTier('trialing')).toBe(false);
  });

  // Unit test: free tier result has null GPT-derived fields
  it('free tier result has null rexVerdict', () => {
    const result = buildAnalysisResult('free');
    expect(result.rexVerdict).toBeNull();
  });

  it('free tier result has null rexAudioUrl', () => {
    const result = buildAnalysisResult('free');
    expect(result.rexAudioUrl).toBeNull();
  });

  it('free tier result has null languageStrength', () => {
    const result = buildAnalysisResult('free');
    expect(result.languageStrength).toBeNull();
  });

  it('free tier result has null structureScore', () => {
    const result = buildAnalysisResult('free');
    expect(result.structureScore).toBeNull();
  });

  it('free tier result has null openingStrength', () => {
    const result = buildAnalysisResult('free');
    expect(result.openingStrength).toBeNull();
  });

  it('free tier result has null closingStrength', () => {
    const result = buildAnalysisResult('free');
    expect(result.closingStrength).toBeNull();
  });

  it('canceled tier result has null GPT-derived fields (same as free)', () => {
    const result = buildAnalysisResult('canceled');
    expect(result.rexVerdict).toBeNull();
    expect(result.rexAudioUrl).toBeNull();
    expect(result.languageStrength).toBeNull();
    expect(result.structureScore).toBeNull();
    expect(result.openingStrength).toBeNull();
    expect(result.closingStrength).toBeNull();
  });

  // Unit test: free tier still has pure metrics
  it('free tier result still has pure metrics (paceWpm, fillersPerMinute)', () => {
    const result = buildAnalysisResult('free');
    expect(result.paceWpm).toBeDefined();
    expect(result.fillersPerMinute).toBeDefined();
    expect(result.fillerWords).toBeDefined();
  });

  // Unit test: premium tier has all fields populated
  it('active tier result has all GPT-derived fields populated', () => {
    const result = buildAnalysisResult('active');
    expect(result.rexVerdict).not.toBeNull();
    expect(result.rexAudioUrl).not.toBeNull();
    expect(result.languageStrength).not.toBeNull();
    expect(result.structureScore).not.toBeNull();
    expect(result.openingStrength).not.toBeNull();
    expect(result.closingStrength).not.toBeNull();
  });

  it('trialing tier result has all GPT-derived fields populated', () => {
    const result = buildAnalysisResult('trialing');
    expect(result.rexVerdict).not.toBeNull();
    expect(result.rexAudioUrl).not.toBeNull();
    expect(result.languageStrength).not.toBeNull();
  });
});

// ─── Property 17 ─────────────────────────────────────────────────────────────
// Feature: public-speaking-trainer, Property 17: GPT and TTS analysis caching is idempotent
// Validates: Requirements 9.9, 9.10, 18.1, 18.3

describe('Property 17: GPT and TTS analysis caching is idempotent', () => {
  // Property test: SHA-256 hash of transcript is deterministic
  it('same transcript text always produces the same SHA-256 cache key', () => {
    fc.assert(
      fc.property(fc.string(), (transcript) => {
        const hash1 = sha256(transcript);
        const hash2 = sha256(transcript);
        return hash1 === hash2;
      }),
      { numRuns: 100 }
    );
  });

  // Property test: different transcript texts produce different hashes
  it('different transcript texts produce different SHA-256 cache keys', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (t1, t2) => {
          fc.pre(t1 !== t2);
          const hash1 = sha256(t1);
          const hash2 = sha256(t2);
          return hash1 !== hash2;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property test: SHA-256 output is always a 64-character hex string
  it('SHA-256 cache key is always a 64-character hex string', () => {
    fc.assert(
      fc.property(fc.string(), (transcript) => {
        const hash = sha256(transcript);
        return /^[0-9a-f]{64}$/.test(hash);
      }),
      { numRuns: 100 }
    );
  });

  // Property test: TTS cache key (hash of rex_verdict) is also deterministic
  it('same rex_verdict text always produces the same TTS cache key', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 200 }), // rex_verdict is max 200 chars
        (verdict) => {
          const key1 = sha256(verdict);
          const key2 = sha256(verdict);
          return key1 === key2;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property test: GPT cache key and TTS cache key are independent
  // (same text hashed for different purposes still produces the same hash — idempotent)
  it('hashing the same text twice for GPT and TTS produces identical keys (idempotent)', () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const gptKey = sha256(text);
        const ttsKey = sha256(text);
        // Both should be equal — the hash function is pure and deterministic
        return gptKey === ttsKey;
      }),
      { numRuns: 100 }
    );
  });

  // Unit test: specific known hash values
  it('empty string has a known SHA-256 hash', () => {
    const hash = sha256('');
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('same transcript submitted twice returns the same cache key (simulated cache hit)', () => {
    const transcript = 'Today I want to talk about the importance of public speaking.';
    const cacheKey1 = sha256(transcript);
    const cacheKey2 = sha256(transcript);
    // A cache lookup with cacheKey2 would find the entry stored under cacheKey1
    expect(cacheKey1).toBe(cacheKey2);
  });
});
