import { supabase } from './supabaseClient';
import type { Subscription, SubscriptionStatus } from '../types';

// Stripe price IDs — set these in your .env or replace with your actual Stripe price IDs
const STRIPE_PRICES = {
  monthly: process.env.EXPO_PUBLIC_STRIPE_PRICE_MONTHLY ?? 'price_monthly',
  annual: process.env.EXPO_PUBLIC_STRIPE_PRICE_ANNUAL ?? 'price_annual',
};

// ─── Create Checkout Session ──────────────────────────────────────────────────
// Calls a Supabase Edge Function that creates a Stripe Checkout session.
// Returns the checkout URL to open in a WebView.

export async function createCheckoutSession(
  userId: string,
  plan: 'monthly' | 'annual'
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: {
      userId,
      priceId: STRIPE_PRICES[plan],
      trialPeriodDays: 3,
    },
  });

  if (error || !data?.url) {
    throw new Error('Failed to create checkout session. Please try again.');
  }

  return data.url as string;
}

// ─── Get Portal Link ──────────────────────────────────────────────────────────
// Returns a Stripe Customer Portal URL for managing subscription.

export async function getPortalLink(userId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-portal', {
    body: { userId },
  });

  if (error || !data?.url) {
    throw new Error('Failed to open subscription portal. Please try again.');
  }

  return data.url as string;
}

// ─── Get Subscription Status ──────────────────────────────────────────────────

export async function getSubscriptionStatus(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw new Error('Failed to fetch subscription status.');
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    stripeCustomerId: data.stripe_customer_id,
    status: data.status as SubscriptionStatus,
    plan: data.plan,
    trialEnd: data.trial_end,
    currentPeriodEnd: data.current_period_end,
    updatedAt: data.updated_at,
  };
}

// ─── Is Premium ───────────────────────────────────────────────────────────────

export function isPremium(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing';
}
