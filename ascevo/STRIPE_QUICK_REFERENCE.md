# 💳 Stripe Quick Reference Card

## 🎯 What You Need from Stripe

### 1. Create Two Products

**Product 1: Monthly Subscription**
- Name: Growthovo Premium Monthly
- Price: $9.99/month
- Billing: Monthly
- **You get:** `price_1ABC...` → `EXPO_PUBLIC_STRIPE_PRICE_MONTHLY`

**Product 2: Annual Subscription**
- Name: Growthovo Premium Annual
- Price: $99.99/year
- Billing: Yearly
- **You get:** `price_0987...` → `EXPO_PUBLIC_STRIPE_PRICE_ANNUAL`

---

### 2. Get API Keys

**Publishable Key** (Public - safe to expose)
- Location: Developers > API keys
- Starts with: `pk_test_...` or `pk_live_...`
- **You get:** → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Secret Key** (Private - keep secret!)
- Location: Developers > API keys > Reveal
- Starts with: `sk_test_...` or `sk_live_...`
- **You get:** → `STRIPE_SECRET_KEY`

---

### 3. Set Up Webhook

**Webhook URL:**
```
https://your-project-id.supabase.co/functions/v1/stripe-webhook
```

**Events to Select:**
- ✅ customer.subscription.created
- ✅ customer.subscription.updated
- ✅ customer.subscription.deleted
- ✅ invoice.payment_failed

**Webhook Secret:**
- Location: Developers > Webhooks > Click endpoint > Reveal
- Starts with: `whsec_...`
- **You get:** → `STRIPE_WEBHOOK_SECRET`

---

## 📝 Your .env File

```bash
# PUBLIC (safe to expose in browser)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51ABC...xyz
EXPO_PUBLIC_STRIPE_PRICE_MONTHLY=price_1ABC...monthly
EXPO_PUBLIC_STRIPE_PRICE_ANNUAL=price_1ABC...annual

# SECRET (backend only - set via supabase secrets)
STRIPE_SECRET_KEY=sk_live_51ABC...xyz
STRIPE_WEBHOOK_SECRET=whsec_ABC...xyz
```

---

## 🧪 Test Cards

Use these in test mode:

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Decline |
| 4000 0025 0000 3155 | 🔐 3D Secure |

**Expiry:** Any future date (e.g., 12/34)
**CVC:** Any 3 digits (e.g., 123)
**ZIP:** Any 5 digits (e.g., 12345)

---

## 🔄 Test Mode vs Live Mode

### Test Mode (Development)
- Toggle: Top right corner
- Keys start with: `pk_test_` and `sk_test_`
- Use test cards
- No real money

### Live Mode (Production)
- Toggle: Top right corner
- Keys start with: `pk_live_` and `sk_live_`
- Real cards only
- Real money!

**Always test in test mode first!**

---

## ✅ Quick Checklist

- [ ] Created monthly product ($9.99/month)
- [ ] Created annual product ($99.99/year)
- [ ] Copied both Price IDs
- [ ] Copied Publishable Key
- [ ] Copied Secret Key
- [ ] Created webhook endpoint
- [ ] Copied Webhook Secret
- [ ] Tested with test card
- [ ] All keys in `.env.production`
- [ ] Secrets set in Supabase

---

## 🚀 Deploy Commands

```bash
# Set Stripe secrets in Supabase
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...

# Verify secrets
supabase secrets list

# Deploy
vercel --prod
```

---

## 📞 Quick Links

- **Dashboard:** [dashboard.stripe.com](https://dashboard.stripe.com)
- **Products:** [dashboard.stripe.com/products](https://dashboard.stripe.com/products)
- **API Keys:** [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
- **Webhooks:** [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
- **Test Cards:** [stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Docs:** [stripe.com/docs](https://stripe.com/docs)

---

## 💡 Pro Tips

1. **Start in test mode** - Always test before going live
2. **Save your Price IDs** - You'll need them in your code
3. **Keep secrets secret** - Never commit `sk_` keys to git
4. **Test the webhook** - Use Stripe CLI: `stripe listen`
5. **Monitor payments** - Check dashboard daily

---

## 🎯 That's It!

You now have everything you need from Stripe. Just:
1. Copy the values to `.env.production`
2. Set secrets in Supabase
3. Deploy your app
4. Start accepting payments! 💰
