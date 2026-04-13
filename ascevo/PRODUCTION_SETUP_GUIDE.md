# 🚀 Growthovo PWA - Production Setup Guide

This guide walks you through everything needed to make your PWA production-ready, including costs, setup steps, and deployment.

## 📋 Table of Contents

1. [Cost Breakdown](#cost-breakdown)
2. [Required Services Setup](#required-services-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Checklist](#post-deployment-checklist)

---

## 💰 Cost Breakdown

### Monthly Recurring Costs

| Service | Tier | Monthly Cost | Notes |
|---------|------|--------------|-------|
| **Supabase** | Pro | $25 | Required for database, auth, storage |
| **OpenAI API** | Pay-as-you-go | $50-500 | Depends on usage (~$0.002/1K tokens) |
| **Stripe** | Standard | 2.9% + $0.30/transaction | No monthly fee, only transaction fees |
| **Vercel/Netlify** | Pro | $20 | For hosting (Free tier available for testing) |
| **Sentry** | Team | $26 | Error monitoring (Free tier: 5K events/month) |
| **Domain** | Annual | ~$12/year | From Namecheap, Google Domains, etc. |
| **Email Service** | Varies | $0-10 | Resend: Free for 3K emails/month |

**Estimated Total: $121-571/month** (depending on usage and tier choices)

### One-Time Costs

- Domain registration: $12-20/year
- SSL Certificate: $0 (included with hosting)
- Initial setup time: ~40-60 hours

### Cost Optimization Tips

1. **Start with free tiers** where available (Vercel, Sentry, Resend)
2. **Use GPT-4o-mini** instead of GPT-4 (10x cheaper, similar quality)
3. **Implement caching** for AI responses to reduce API calls
4. **Monitor usage** with Supabase and OpenAI dashboards
5. **Set spending limits** on OpenAI to prevent surprises

---

## 🔧 Required Services Setup

### 1. Supabase (Database, Auth, Storage)

**Setup Steps:**

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Choose region closest to your users
4. Wait for project to provision (~2 minutes)
5. Go to **Settings > API** and copy:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

**Database Setup:**

```bash
# Navigate to your project
cd ascevo

# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push

# Seed initial data (optional)
supabase db seed
```

**Storage Buckets:**

Create these buckets in Supabase Dashboard > Storage:
- `avatars` (public)
- `time-capsules` (private)
- `speaking-recordings` (private)

**Row Level Security (RLS):**

```bash
# Apply RLS policies
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/rls.sql
```

**Cost:** $25/month (Pro plan recommended for production)

---

### 2. OpenAI API (AI Features)

**Setup Steps:**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account or sign in
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Copy key → `OPENAI_API_KEY`
6. Set up billing at [platform.openai.com/account/billing](https://platform.openai.com/account/billing)

**Recommended Settings:**

- **Model:** `gpt-4o-mini` (cost-effective, fast)
- **Usage Limits:** Set monthly limit to $100-500
- **Monitoring:** Enable usage notifications

**Usage Estimates:**

- Morning briefing: ~500 tokens = $0.001
- Rex AI response: ~1000 tokens = $0.002
- Speech analysis: ~800 tokens = $0.0016
- SOS response: ~600 tokens = $0.0012

**For 1000 daily active users:**
- ~3000 AI interactions/day
- ~$6/day = ~$180/month

**Cost:** $50-500/month depending on usage

---

### 3. Stripe (Payments)

**Setup Steps:**

1. Go to [stripe.com](https://stripe.com) and create account
2. Complete business verification (required for live mode)
3. Go to **Developers > API Keys**
4. Copy keys:
   - Publishable key → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

**Create Products:**

1. Go to **Products** in Stripe Dashboard
2. Create two products:
   - **Growthovo Monthly** - $9.99/month
   - **Growthovo Annual** - $99.99/year
3. Copy Price IDs:
   - Monthly → `EXPO_PUBLIC_STRIPE_PRICE_MONTHLY`
   - Annual → `EXPO_PUBLIC_STRIPE_PRICE_ANNUAL`

**Webhook Setup:**

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://your-project.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

**Test Mode:**

Use test keys (pk_test_..., sk_test_...) for development. Test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

**Cost:** 2.9% + $0.30 per transaction (no monthly fee)

---

### 4. Web Push Notifications (VAPID Keys)

**Generate Keys:**

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys

# Output:
# Public Key: BG...
# Private Key: ...
```

**Configuration:**

- Public key → `EXPO_PUBLIC_WEB_PUSH_PUBLIC_KEY`
- Private key → `WEB_PUSH_PRIVATE_KEY` (keep secret!)
- Contact email → `WEB_PUSH_CONTACT_EMAIL`

**Cost:** Free

---

### 5. Hosting (Vercel/Netlify/Cloudflare Pages)

#### Option A: Vercel (Recommended)

**Setup Steps:**

1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub repository
3. Configure build settings:
   - Framework: Expo
   - Build command: `expo export:web`
   - Output directory: `web-build`
4. Add environment variables from `.env.production`
5. Deploy!

**Custom Domain:**

1. Go to **Settings > Domains**
2. Add your domain (e.g., app.growthovo.com)
3. Update DNS records as instructed

**Cost:** Free tier available, Pro at $20/month

#### Option B: Netlify

**Setup Steps:**

1. Go to [netlify.com](https://netlify.com) and sign up
2. Connect repository
3. Build settings:
   - Build command: `expo export:web`
   - Publish directory: `web-build`
4. Add environment variables
5. Deploy!

**Cost:** Free tier available, Pro at $19/month

#### Option C: Cloudflare Pages

**Setup Steps:**

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect repository
3. Build settings:
   - Build command: `expo export:web`
   - Build output: `web-build`
4. Deploy!

**Cost:** Free (generous limits)

---

### 6. Error Monitoring (Sentry)

**Setup Steps:**

1. Go to [sentry.io](https://sentry.io) and create account
2. Create new project (React Native)
3. Copy DSN → `EXPO_PUBLIC_SENTRY_DSN`
4. Install Sentry SDK:

```bash
npm install @sentry/react-native
```

5. Initialize in `App.tsx`:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENV,
  tracesSampleRate: 1.0,
});
```

**Cost:** Free tier (5K events/month), Team at $26/month

---

### 7. Analytics (Optional)

#### Option A: Plausible (Privacy-friendly)

1. Go to [plausible.io](https://plausible.io)
2. Add your domain
3. Copy tracking script
4. Add to `index.html`

**Cost:** $9/month (10K pageviews)

#### Option B: Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property
3. Copy Measurement ID → `EXPO_PUBLIC_GA_MEASUREMENT_ID`
4. Install gtag:

```bash
npm install react-ga4
```

**Cost:** Free

---

### 8. Email Service (For notifications)

#### Option A: Resend (Recommended)

1. Go to [resend.com](https://resend.com)
2. Create account
3. Verify domain
4. Create API key → `RESEND_API_KEY`

**Cost:** Free (3K emails/month), $20/month for 50K

#### Option B: SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Create account
3. Create API key → `SENDGRID_API_KEY`

**Cost:** Free (100 emails/day), $15/month for 40K

---

## ⚙️ Environment Configuration

### 1. Create Production Environment File

```bash
cd ascevo
cp .env.production.example .env.production
```

### 2. Fill in All Values

Open `.env.production` and replace all placeholder values with your actual keys from the services above.

### 3. Set Supabase Secrets

For backend-only secrets (never exposed to client):

```bash
# Set OpenAI key
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Set Stripe keys
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Set Supabase service role key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Set Web Push private key
supabase secrets set WEB_PUSH_PRIVATE_KEY=...

# Set email API key
supabase secrets set RESEND_API_KEY=re_...

# Verify secrets
supabase secrets list
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy rex-chat
supabase functions deploy stripe-webhook
supabase functions deploy generate-morning-briefing
# ... etc
```

---

## 🚀 Deployment Steps

### Step 1: Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Supabase migrations applied
- [ ] Stripe products created
- [ ] Domain purchased and DNS configured
- [ ] SSL certificate ready (automatic with hosting)
- [ ] Edge functions deployed
- [ ] Webhook endpoints configured

### Step 2: Build for Production

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for web
expo export:web

# Verify build
ls -la web-build/
```

### Step 3: Deploy to Hosting

#### Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Or use GitHub integration (automatic)
```

#### Netlify:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod

# Or use GitHub integration (automatic)
```

### Step 4: Configure DNS

Point your domain to hosting provider:

**For Vercel:**
- Add A record: `76.76.21.21`
- Add CNAME: `cname.vercel-dns.com`

**For Netlify:**
- Add CNAME: `your-site.netlify.app`

**For Cloudflare:**
- Automatic if using Cloudflare DNS

### Step 5: Test Production Deployment

1. Visit your domain: `https://app.growthovo.com`
2. Test PWA installation
3. Test authentication flow
4. Test payment flow (use Stripe test mode first!)
5. Test offline functionality
6. Test push notifications
7. Check error monitoring (Sentry)
8. Verify analytics tracking

---

## ✅ Post-Deployment Checklist

### Security

- [ ] HTTPS enabled and working
- [ ] CSP headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Secrets not exposed in client code
- [ ] RLS policies active on Supabase

### Performance

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Images optimized (WebP)
- [ ] Code splitting working
- [ ] Service worker caching working

### Functionality

- [ ] Sign up/sign in working
- [ ] Subscription payments working
- [ ] AI features responding
- [ ] Offline mode working
- [ ] Push notifications working
- [ ] All critical user flows tested

### Monitoring

- [ ] Error tracking active (Sentry)
- [ ] Analytics tracking (GA/Plausible)
- [ ] Uptime monitoring configured
- [ ] Performance monitoring active
- [ ] Cost alerts configured (OpenAI, Stripe)

### Legal & Compliance

- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie consent banner active
- [ ] GDPR compliance verified
- [ ] Data retention policy documented

---

## 🔍 Monitoring & Maintenance

### Daily Checks

- Check Sentry for new errors
- Monitor OpenAI usage and costs
- Check Stripe for failed payments

### Weekly Checks

- Review analytics for user behavior
- Check performance metrics
- Review and respond to user feedback
- Update dependencies if needed

### Monthly Checks

- Review total costs vs. budget
- Analyze user retention and churn
- Review and optimize AI prompts
- Update content and features

---

## 🆘 Troubleshooting

### Common Issues

**1. "Missing environment variables" error**
- Verify all EXPO_PUBLIC_ variables are set
- Check hosting platform environment variables
- Rebuild and redeploy

**2. Stripe webhook not working**
- Verify webhook URL is correct
- Check webhook signing secret
- Test with Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook`

**3. OpenAI API errors**
- Check API key is valid
- Verify billing is set up
- Check usage limits not exceeded
- Monitor rate limits

**4. PWA not installing**
- Verify manifest.json is accessible
- Check service worker registration
- Ensure HTTPS is enabled
- Test on different browsers

**5. Push notifications not working**
- Verify VAPID keys are correct
- Check notification permissions
- Test on supported browsers (Chrome, Firefox, Edge)
- iOS Safari doesn't support Web Push (yet)

---

## 📞 Support Resources

- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **OpenAI:** [platform.openai.com/docs](https://platform.openai.com/docs)
- **Stripe:** [stripe.com/docs](https://stripe.com/docs)
- **Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Expo:** [docs.expo.dev](https://docs.expo.dev)

---

## 🎉 You're Ready!

Once you've completed all steps above, your Growthovo PWA will be production-ready and accessible to users worldwide. Monitor your metrics, gather user feedback, and iterate!

**Next Steps:**
1. Set up marketing site (growthovo.com)
2. Create app store listings (iOS/Android)
3. Launch marketing campaigns
4. Gather user feedback
5. Iterate and improve

Good luck! 🚀
