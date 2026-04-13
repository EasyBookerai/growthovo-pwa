import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await cancelSubscription(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await updateSubscriptionStatus(invoice.subscription as string, 'past_due');
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return new Response(`Processing error: ${err.message}`, { status: 500 });
  }
});

async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;
  const status = sub.status; // 'trialing' | 'active' | 'canceled' | 'past_due' etc.
  const plan = getPlanFromSubscription(sub);
  const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null;
  const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

  // Find user by stripe_customer_id
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!user) {
    console.warn(`No user found for Stripe customer: ${customerId}`);
    return;
  }

  // Upsert subscriptions table
  await supabase.from('subscriptions').upsert(
    {
      user_id: user.id,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      status,
      plan,
      trial_end: trialEnd,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  // Update users table
  const appStatus = mapStripeStatusToApp(status);
  await supabase.from('users').update({
    subscription_status: appStatus,
    subscription_plan: plan,
    trial_end_date: trialEnd,
    stripe_customer_id: customerId,
  }).eq('id', user.id);
}

async function cancelSubscription(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!user) return;

  await supabase.from('subscriptions').upsert(
    {
      user_id: user.id,
      stripe_subscription_id: sub.id,
      stripe_customer_id: customerId,
      status: 'canceled',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  await supabase.from('users').update({
    subscription_status: 'free',
    subscription_plan: null,
    trial_end_date: null,
  }).eq('id', user.id);
}

async function updateSubscriptionStatus(subscriptionId: string, status: string) {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle();

  if (!sub) return;

  await supabase.from('subscriptions').update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', subscriptionId);

  if (status === 'past_due') {
    await supabase.from('users').update({ subscription_status: 'free' }).eq('id', sub.user_id);
  }
}

function getPlanFromSubscription(sub: Stripe.Subscription): 'monthly' | 'annual' | null {
  const item = sub.items.data[0];
  if (!item) return null;
  const interval = item.price.recurring?.interval;
  if (interval === 'month') return 'monthly';
  if (interval === 'year') return 'annual';
  return null;
}

function mapStripeStatusToApp(stripeStatus: string): string {
  switch (stripeStatus) {
    case 'active': return 'active';
    case 'trialing': return 'trialing';
    case 'canceled': return 'free';
    case 'past_due': return 'free';
    default: return 'free';
  }
}
