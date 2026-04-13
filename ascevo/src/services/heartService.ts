import { supabase } from './supabaseClient';

const MAX_HEARTS = 5;

// ─── Get Hearts ───────────────────────────────────────────────────────────────

export async function getHearts(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('hearts')
    .select('count')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Failed to fetch hearts.');
  return data.count;
}

// ─── Deduct Heart ─────────────────────────────────────────────────────────────
// Atomic decrement via RPC — floors at 0. Skips for premium users.

export async function deductHeart(userId: string): Promise<number> {
  // Check subscription status first
  const { data: user } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('id', userId)
    .single();

  if (user?.subscription_status === 'active' || user?.subscription_status === 'trialing') {
    // Premium: unlimited hearts — no deduction
    return MAX_HEARTS;
  }

  const { data, error } = await supabase.rpc('deduct_heart', { p_user_id: userId });
  if (error) throw new Error('Failed to deduct heart.');
  return data as number;
}

// ─── Refill Hearts ────────────────────────────────────────────────────────────
// Idempotent: only refills if last_refill_date < today.

export async function refillHearts(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('hearts')
    .select('last_refill_date')
    .eq('user_id', userId)
    .single();

  if (error) throw new Error('Failed to fetch hearts for refill.');

  if (data.last_refill_date < today) {
    const { error: updateError } = await supabase
      .from('hearts')
      .update({ count: MAX_HEARTS, last_refill_date: today })
      .eq('user_id', userId);

    if (updateError) throw new Error('Failed to refill hearts.');
  }
}

// ─── Pure logic helpers (used in tests without DB) ───────────────────────────

export function applyDeduction(currentCount: number): number {
  return Math.max(0, currentCount - 1);
}

export function applyRefill(currentCount: number, lastRefillDate: string, today: string): number {
  if (lastRefillDate < today) return MAX_HEARTS;
  return currentCount;
}
