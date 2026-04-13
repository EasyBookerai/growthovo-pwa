# Vercel Deployment Guide - Growthovo PWA

This guide walks you through deploying Growthovo as a Progressive Web App (PWA) on Vercel.

## Why PWA-Only?

- Users can install directly from the website to their home screen
- No App Store/Play Store approval needed
- Instant updates without app store delays
- Works on all platforms (iOS, Android, Desktop)
- Lower distribution costs

## Prerequisites

1. GitHub account with the repository pushed
2. Vercel account (sign up at https://vercel.com)
3. Supabase project set up and running
4. Stripe account configured (if using payments)

## Step 1: Connect GitHub to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Find and select `growthovo-pwa` from your repositories
5. Click "Import"

## Step 2: Configure Build Settings

Vercel should auto-detect the settings from `vercel.json`, but verify:

- **Framework Preset**: Other
- **Build Command**: `cd ascevo && npm install && npx expo export:web`
- **Output Directory**: `ascevo/dist`
- **Install Command**: `npm install` (in root)

## Step 3: Add Environment Variables

Click "Environment Variables" and add these (from your `.env.example`):

### Required Variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional (if using Stripe):
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Optional (for AI features):
```
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
```

**Important**: Make sure to add these for all environments (Production, Preview, Development)

## Step 4: Deploy

1. Click "Deploy"
2. Wait 3-5 minutes for the build to complete
3. Once deployed, you'll get a URL like: `https://growthovo-pwa.vercel.app`

## Step 5: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `app.growthovo.com`)
4. Follow Vercel's DNS configuration instructions

## Step 6: Test PWA Installation

### On Mobile (iOS/Android):
1. Open your deployed URL in Safari (iOS) or Chrome (Android)
2. Tap the Share button (iOS) or Menu (Android)
3. Select "Add to Home Screen"
4. The app will install like a native app

### On Desktop:
1. Open your deployed URL in Chrome/Edge
2. Look for the install icon in the address bar
3. Click to install as a desktop app

## Step 7: Configure Supabase Edge Functions

Your Supabase functions need to allow requests from your Vercel domain:

1. Go to Supabase Dashboard → Settings → API
2. Add your Vercel URL to allowed origins:
   - `https://growthovo-pwa.vercel.app`
   - `https://*.vercel.app` (for preview deployments)
   - Your custom domain if configured

## Step 8: Configure Stripe Webhooks (If Using Payments)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-supabase-url.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret
5. Add it to Supabase secrets: `STRIPE_WEBHOOK_SECRET`

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

## Monitoring & Analytics

### View Deployment Logs:
1. Go to your project in Vercel
2. Click "Deployments"
3. Select a deployment to view logs

### Add Analytics (Optional):
1. Go to project settings
2. Enable Vercel Analytics
3. View real-time traffic and performance

## Troubleshooting

### Build Fails:
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct dependencies

### App Doesn't Load:
- Check browser console for errors
- Verify Supabase URL and keys are correct
- Check CORS settings in Supabase

### PWA Not Installing:
- Ensure HTTPS is enabled (Vercel does this automatically)
- Check that manifest.json is being served
- Verify service worker is registered

### API Calls Failing:
- Check Supabase allowed origins
- Verify environment variables in Vercel
- Check Supabase function logs

## Performance Optimization

### Enable Caching:
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Enable Compression:
Vercel automatically compresses responses with gzip/brotli.

## Security Checklist

- ✅ Environment variables set in Vercel (not in code)
- ✅ Supabase RLS policies enabled
- ✅ CORS configured properly
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ API keys are public keys only (anon key, publishable key)

## Cost Estimate

### Vercel:
- **Hobby Plan**: Free (perfect for starting)
  - 100GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  
- **Pro Plan**: $20/month (when you scale)
  - 1TB bandwidth/month
  - Advanced analytics
  - Team collaboration

### Total Monthly Cost (Starting):
- Vercel: $0 (Hobby plan)
- Supabase: $0-25 (Free tier or Pro)
- Stripe: Pay per transaction
- **Total: $0-25/month**

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test PWA installation on mobile
3. ✅ Configure custom domain
4. ✅ Set up Stripe webhooks
5. ✅ Test all features in production
6. ✅ Share the URL with beta testers

## Support

- Vercel Docs: https://vercel.com/docs
- Expo Web Docs: https://docs.expo.dev/workflow/web/
- PWA Guide: https://web.dev/progressive-web-apps/

---

**Your app is now live as a PWA! Users can install it directly from the browser without any app store.**
