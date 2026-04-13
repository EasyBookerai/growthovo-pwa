# 🌐 Growthovo PWA - Web-Only Setup Guide

This is a simplified guide for deploying **ONLY the Progressive Web App** (no native mobile apps).

## 🎯 What You Need (Simplified)

### 1. Supabase ($25/month)
- Database, authentication, storage, edge functions
- Sign up: [supabase.com](https://supabase.com)

### 2. OpenAI ($50-500/month)
- AI features (Rex, briefings, analysis)
- Sign up: [platform.openai.com](https://platform.openai.com)

### 3. Stripe (2.9% + $0.30/transaction)
- Payment processing
- Sign up: [stripe.com](https://stripe.com)

### 4. Vercel/Netlify (Free or $20/month)
- Web hosting
- Sign up: [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com)

### 5. Domain (~$12/year)
- Your website address
- Buy from: Namecheap, Google Domains, etc.

**Total: $34-172/month** depending on usage

---

## 📝 Environment Variables You Actually Need

Copy `.env.pwa-only.example` to `.env.production` and fill in:

### Client-Side (Safe to expose in browser)
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
EXPO_PUBLIC_STRIPE_PRICE_ANNUAL=price_...

# Web Push
EXPO_PUBLIC_WEB_PUSH_PUBLIC_KEY=BG...

# URLs
EXPO_PUBLIC_APP_URL=https://app.growthovo.com
```

### Server-Side (Keep secret - set via Supabase CLI)
```bash
# Set these via: supabase secrets set KEY=value
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
WEB_PUSH_PRIVATE_KEY=...
```

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Supabase Setup (15 min)

```bash
# 1. Create account at supabase.com
# 2. Create new project
# 3. Copy credentials to .env.production

# 4. Install Supabase CLI
npm install -g supabase

# 5. Link project
supabase link --project-ref your-project-id

# 6. Run migrations
supabase db push

# 7. Set secrets
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# 8. Deploy edge functions
supabase functions deploy
```

### Step 2: OpenAI Setup (5 min)

```bash
# 1. Go to platform.openai.com
# 2. Create API key
# 3. Add to Supabase secrets (done in Step 1)
# 4. Set usage limit ($100-500/month)
```

### Step 3: Stripe Setup (15 min)

```bash
# 1. Go to stripe.com
# 2. Complete business verification
# 3. Create products:
#    - Monthly: $14.99/month
#    - Annual: $119.99/year
# 4. Copy keys to .env.production
# 5. Set up webhook:
#    URL: https://your-project.supabase.co/functions/v1/stripe-webhook
#    Events: customer.subscription.*, invoice.payment_failed
```

### Step 4: Web Push Setup (2 min)

```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Copy public key to .env.production
# Copy private key to Supabase secrets
supabase secrets set WEB_PUSH_PRIVATE_KEY=...
```

### Step 5: Deploy to Vercel (10 min)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build for web
expo export:web

# 3. Deploy
vercel --prod

# 4. Add environment variables in Vercel dashboard
# 5. Configure custom domain
```

---

## ❌ What You DON'T Need

Since you're building PWA-only, you can skip:

- ❌ Expo Application Services (EAS) account
- ❌ Apple Developer account ($99/year)
- ❌ Google Play Console account ($25 one-time)
- ❌ Native push notification certificates (APNS, FCM)
- ❌ App store screenshots and metadata
- ❌ Native build configurations
- ❌ Code signing certificates
- ❌ Provisioning profiles
- ❌ Native module configurations

---

## 🎯 Simplified Cost Breakdown

### Minimum (100 users)
- Supabase: $25
- OpenAI: $8
- Hosting: $0 (free tier)
- Domain: $1
- **Total: $34/month**

### Growing (500 users)
- Supabase: $25
- OpenAI: $40
- Hosting: $20
- Domain: $1
- Monitoring: $26
- **Total: $112/month**

### Established (1,000 users)
- Supabase: $25
- OpenAI: $80
- Hosting: $20
- Domain: $1
- Monitoring: $26
- **Total: $152/month**

---

## 🔧 Build Commands

```bash
# Development
npm start
# Then press 'w' for web

# Production build
expo export:web

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

---

## ✅ Testing Checklist

- [ ] Visit https://your-domain.com
- [ ] Test sign up/sign in
- [ ] Test subscription payment
- [ ] Test AI features (Rex chat)
- [ ] Test offline mode
- [ ] Install PWA (Chrome: Settings > Install app)
- [ ] Test push notifications
- [ ] Run Lighthouse audit (score > 90)

---

## 📊 What to Monitor

### Daily
- Sentry errors
- OpenAI costs
- Stripe payments

### Weekly
- User analytics
- Performance metrics
- User feedback

### Monthly
- Total costs
- Revenue
- User retention

---

## 🆘 Common Issues

**"Missing environment variables"**
- Check all EXPO_PUBLIC_* variables are set
- Rebuild: `expo export:web`

**"Stripe webhook not working"**
- Verify webhook URL in Stripe dashboard
- Check webhook secret is correct

**"OpenAI errors"**
- Verify API key is valid
- Check usage limits not exceeded

**"PWA not installing"**
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Test on Chrome/Edge (best support)

---

## 🎉 That's It!

You now have everything you need for a production-ready PWA. No native app complexity!

**Estimated setup time:** 1-2 hours
**Monthly cost:** $34-152
**Break-even:** 3-11 subscribers at $14.99/month

---

## 📞 Need Help?

- Supabase: [supabase.com/docs](https://supabase.com/docs)
- OpenAI: [platform.openai.com/docs](https://platform.openai.com/docs)
- Stripe: [stripe.com/docs](https://stripe.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)

Good luck! 🚀
