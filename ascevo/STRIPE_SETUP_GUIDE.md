# 💳 Stripe Setup Guide - Step by Step

This guide shows you exactly how to create products in Stripe and get the Price IDs you need.

## 📋 What You'll Get

After following this guide, you'll have:
- ✅ Stripe account (verified)
- ✅ Two products (Monthly & Annual subscriptions)
- ✅ Price IDs for your `.env` file
- ✅ Webhook configured
- ✅ API keys

---

## 🚀 Step 1: Create Stripe Account (10 min)

### 1.1 Sign Up
1. Go to [stripe.com](https://stripe.com)
2. Click "Start now" or "Sign up"
3. Enter your email and create password
4. Verify your email

### 1.2 Complete Business Information
1. Go to **Settings** (top right)
2. Click **Business settings**
3. Fill in:
   - Business name: "Growthovo" (or your company name)
   - Business type: Individual or Company
   - Country: Your country
   - Industry: Software/SaaS
4. Click **Save**

### 1.3 Activate Your Account
1. Go to **Settings > Account**
2. Click **Activate account**
3. Provide:
   - Tax ID (if applicable)
   - Bank account details (for payouts)
   - Personal identification
4. Submit for review (usually approved within 1-2 business days)

**Note:** You can use test mode while waiting for approval!

---

## 🎯 Step 2: Create Products (5 min)

### 2.1 Create Monthly Subscription

1. Go to **Products** in the left sidebar
2. Click **+ Add product**
3. Fill in the form:

```
Product name: Growthovo Premium Monthly
Description: Monthly subscription to Growthovo Premium features
```

4. Under **Pricing**:
   - Click **+ Add another price**
   - Pricing model: **Standard pricing**
   - Price: **$14.99**
   - Billing period: **Monthly**
   - Currency: **USD** (or your currency)

5. Click **Save product**

6. **IMPORTANT:** Copy the Price ID
   - It looks like: `price_1234567890abcdef`
   - Save it as: `EXPO_PUBLIC_STRIPE_PRICE_MONTHLY`

### 2.2 Create Annual Subscription

1. Click **+ Add product** again
2. Fill in the form:

```
Product name: Growthovo Premium Annual
Description: Annual subscription to Growthovo Premium features (save 17%)
```

3. Under **Pricing**:
   - Click **+ Add another price**
   - Pricing model: **Standard pricing**
   - Price: **$119.99**
   - Billing period: **Yearly**
   - Currency: **USD** (or your currency)

4. Click **Save product**

5. **IMPORTANT:** Copy the Price ID
   - It looks like: `price_0987654321fedcba`
   - Save it as: `EXPO_PUBLIC_STRIPE_PRICE_ANNUAL`

### 2.3 Verify Your Products

1. Go to **Products** page
2. You should see:
   - ✅ Growthovo Premium Monthly - $14.99/month
   - ✅ Growthovo Premium Annual - $119.99/year

---

## 🔑 Step 3: Get API Keys (2 min)

### 3.1 Get Publishable Key (Public)

1. Go to **Developers > API keys**
2. Find **Publishable key** section
3. Copy the key starting with `pk_test_...` (test mode) or `pk_live_...` (live mode)
4. Save as: `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3.2 Get Secret Key (Private)

1. On the same page, find **Secret key** section
2. Click **Reveal test key** (or **Reveal live key**)
3. Copy the key starting with `sk_test_...` or `sk_live_...`
4. Save as: `STRIPE_SECRET_KEY`
5. **IMPORTANT:** Keep this secret! Never commit to git!

---

## 🔔 Step 4: Set Up Webhook (5 min)

### 4.1 Create Webhook Endpoint

1. Go to **Developers > Webhooks**
2. Click **+ Add endpoint**
3. Enter endpoint URL:

```
https://your-project-id.supabase.co/functions/v1/stripe-webhook
```

Replace `your-project-id` with your actual Supabase project ID.

### 4.2 Select Events

Click **Select events** and choose these:

- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_failed`
- ✅ `invoice.payment_succeeded`

### 4.3 Get Webhook Secret

1. Click **Add endpoint**
2. Click on your newly created endpoint
3. Click **Reveal** under **Signing secret**
4. Copy the secret starting with `whsec_...`
5. Save as: `STRIPE_WEBHOOK_SECRET`

---

## 📝 Step 5: Fill in Your .env File

Now you have everything! Update your `.env.production`:

```bash
# Stripe - PUBLIC (safe to expose)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC...xyz
EXPO_PUBLIC_STRIPE_PRICE_MONTHLY=price_1ABC...monthly
EXPO_PUBLIC_STRIPE_PRICE_ANNUAL=price_1ABC...annual

# Stripe - SECRET (backend only)
STRIPE_SECRET_KEY=sk_live_51ABC...xyz
STRIPE_WEBHOOK_SECRET=whsec_ABC...xyz
```

### Set Supabase Secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_51ABC...xyz
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_ABC...xyz
```

---

## 🧪 Step 6: Test Your Setup (5 min)

### 6.1 Test Mode First!

Before going live, test with test mode:

1. Switch to **Test mode** (toggle in top right)
2. Use test API keys (starting with `pk_test_` and `sk_test_`)
3. Use test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### 6.2 Test Subscription Flow

1. Build and deploy your app
2. Go to the paywall
3. Click "Subscribe"
4. Use test card: `4242 4242 4242 4242`
5. Expiry: Any future date (e.g., `12/34`)
6. CVC: Any 3 digits (e.g., `123`)
7. ZIP: Any 5 digits (e.g., `12345`)

### 6.3 Verify in Stripe Dashboard

1. Go to **Payments** in Stripe
2. You should see the test payment
3. Go to **Customers**
4. You should see the test customer
5. Go to **Subscriptions**
6. You should see the active subscription

---

## 🎉 Step 7: Go Live! (When Ready)

### 7.1 Activate Live Mode

1. Complete account verification (if not done)
2. Switch to **Live mode** (toggle in top right)
3. Get live API keys (starting with `pk_live_` and `sk_live_`)
4. Update your `.env.production` with live keys
5. Redeploy your app

### 7.2 Update Webhook for Live Mode

1. Go to **Developers > Webhooks**
2. Create a new endpoint for live mode
3. Use the same URL and events
4. Get the new live webhook secret
5. Update `STRIPE_WEBHOOK_SECRET`

---

## 💡 Pro Tips

### Pricing Strategy

**Monthly vs Annual:**
- Monthly: $14.99/month = $179.88/year
- Annual: $119.99/year = **33% discount**
- This encourages annual subscriptions (better for cash flow!)

**Alternative Pricing:**
- Budget: $9.99/month or $99.99/year
- Standard: $14.99/month or $119.99/year
- Premium: $19.99/month or $199.99/year

### Free Trial

To add a free trial:
1. Edit your product
2. Under **Pricing**, click **Add trial period**
3. Set trial days (e.g., 7 days, 14 days, 30 days)
4. Save

### Coupons/Discounts

To create a discount code:
1. Go to **Products > Coupons**
2. Click **+ New**
3. Set:
   - Code: `LAUNCH50` (or any code)
   - Discount: 50% off
   - Duration: Once, Forever, or Repeating
4. Share code with users!

---

## 🔍 Troubleshooting

### "Invalid API key"
- Make sure you're using the correct mode (test vs live)
- Check for extra spaces when copying
- Regenerate key if needed

### "Webhook signature verification failed"
- Verify webhook secret is correct
- Check webhook URL is correct
- Ensure webhook is enabled

### "Product not found"
- Verify Price IDs are correct
- Make sure you're in the right mode (test vs live)
- Check product is active

### "Payment declined"
- In test mode: Use test cards only
- In live mode: Ask user to check card details
- Check Stripe logs for specific error

---

## 📊 Monitoring Your Revenue

### Daily Checks
1. Go to **Home** in Stripe
2. Check today's revenue
3. Review failed payments

### Weekly Reports
1. Go to **Reports**
2. Review:
   - New subscriptions
   - Churned subscriptions
   - Monthly Recurring Revenue (MRR)
   - Failed payments

### Set Up Alerts
1. Go to **Settings > Notifications**
2. Enable:
   - Failed payments
   - Successful payments
   - Subscription cancellations
   - Disputes

---

## 📞 Need Help?

- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support:** [support.stripe.com](https://support.stripe.com)
- **Test Cards:** [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## ✅ Checklist

Before going live, verify:

- [ ] Stripe account activated
- [ ] Business information complete
- [ ] Bank account added (for payouts)
- [ ] Monthly product created
- [ ] Annual product created
- [ ] Price IDs copied to `.env`
- [ ] API keys copied to `.env`
- [ ] Webhook endpoint created
- [ ] Webhook secret copied to `.env`
- [ ] Test payment successful
- [ ] Webhook receiving events
- [ ] Ready to switch to live mode!

---

## 🎯 Quick Reference

### Where to Find Everything

| Item | Location in Stripe |
|------|-------------------|
| Products | Products |
| Price IDs | Products > Click product > Copy price ID |
| API Keys | Developers > API keys |
| Webhooks | Developers > Webhooks |
| Test Cards | Developers > Testing |
| Payments | Payments |
| Customers | Customers |
| Subscriptions | Subscriptions |
| Revenue | Home or Reports |

---

## 🚀 You're Done!

You now have:
- ✅ Stripe account set up
- ✅ Products created
- ✅ Price IDs for monthly and annual plans
- ✅ API keys configured
- ✅ Webhook ready
- ✅ Ready to accept payments!

**Next step:** Add these to your `.env.production` file and deploy! 🎉
