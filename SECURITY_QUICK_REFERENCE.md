# 🔒 Security Quick Reference

**One-page guide for secure GitHub operations**

---

## ⚡ Quick Commands

```bash
# Run security check before pushing
./scripts/security-check.sh

# Check what will be committed
git status

# Verify .env is ignored
git status --ignored | grep .env

# Search for potential secrets
git grep -E "(sk_live_|sk_test_|API_KEY)" -- "*.ts" "*.tsx"

# Check git history for .env files
git log --all --full-history -- "*.env"
```

---

## 🚫 Never Commit

- ❌ `.env` files (except `.env.example`)
- ❌ API keys or tokens
- ❌ Database credentials
- ❌ SSL certificates (`.pem`, `.key`, `.crt`)
- ❌ Keystores (`.jks`, `.keystore`, `.p12`)
- ❌ Service account JSON files
- ❌ Test output files

---

## ✅ Safe to Commit

- ✅ `.env.example` files
- ✅ Documentation (`.md` files)
- ✅ Source code (`.ts`, `.tsx`, `.js`)
- ✅ Configuration files (without secrets)
- ✅ Public assets
- ✅ Tests

---

## 🔐 Environment Variables

### Client-Side (Safe for Browser)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Server-Side (Backend Only)
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🚨 Emergency: Secret Committed

```bash
# 1. Rotate the secret IMMEDIATELY
# 2. Remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (if not public yet)
git push origin --force --all

# 4. Notify team
```

---

## 📋 Pre-Push Checklist

- [ ] Run `./scripts/security-check.sh` ✅
- [ ] No `.env` files in `git status`
- [ ] No API keys in code
- [ ] `.gitignore` includes `.env`
- [ ] Test files excluded

---

## 🔧 GitHub Settings

**Enable:**
- ✅ Secret scanning
- ✅ Push protection
- ✅ Dependabot alerts
- ✅ Branch protection
- ✅ Required reviews

---

## 📞 Quick Links

- Full Guide: `GITHUB_SECURITY_GUIDE.md`
- Audit Report: `SECURITY_AUDIT.md`
- Setup: `PRODUCTION_SETUP_GUIDE.md`

---

**Status:** 🔒 SECURE | **Ready:** ✅ YES
