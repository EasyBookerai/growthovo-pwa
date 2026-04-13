# 🔒 GitHub Security Guide - GROWTHOVO

Complete guide to securely pushing your repository to GitHub and maintaining security best practices.

---

## 🚀 Quick Start: Push to GitHub Safely

### 1. Run Security Check

```bash
# Make script executable (first time only)
chmod +x scripts/security-check.sh

# Run security check
./scripts/security-check.sh
```

If all checks pass ✅, you're safe to push!

### 2. Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit: GROWTHOVO app"
```

### 3. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (public or private)
3. **DO NOT** initialize with README, .gitignore, or license

### 4. Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🛡️ Security Features Implemented

### 1. Comprehensive .gitignore

**Location:** `ascevo/.gitignore` and `.gitignore` (root)

**Protects:**
- ✅ All `.env` files (except `.env.example`)
- ✅ API keys and secrets
- ✅ SSL certificates and keystores
- ✅ Build artifacts
- ✅ Test output files
- ✅ OS and IDE files

### 2. Automated Security Scanning

**GitHub Actions:** `.github/workflows/security-scan.yml`

**Runs on:**
- Every push to main/develop
- Every pull request
- Weekly schedule (Mondays)

**Checks:**
- No hardcoded API keys
- No .env files committed
- No database credentials
- Dependency vulnerabilities
- .gitignore configuration

### 3. Pre-Push Security Script

**Location:** `scripts/security-check.sh`

**Usage:**
```bash
./scripts/security-check.sh
```

**Checks:**
- Stripe API keys
- OpenAI API keys
- JWT tokens
- Database credentials
- Private key files
- .env files
- Git history

---

## 🔐 Environment Variable Management

### Development Setup

1. **Copy example file:**
   ```bash
   cd ascevo
   cp .env.example .env
   ```

2. **Add your secrets:**
   ```bash
   # Edit .env with your actual keys
   nano .env
   ```

3. **Verify .env is ignored:**
   ```bash
   git status --ignored | grep .env
   # Should show: .env (ignored)
   ```

### Production Setup

**For Supabase Functions:**
```bash
# Set secrets via Supabase CLI
supabase secrets set OPENAI_API_KEY=sk-proj-...
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Verify
supabase secrets list
```

**For Frontend (Expo):**
```bash
# Use .env.production
cp .env.production.example .env.production
# Edit with production values
```

---

## 🔍 Security Verification

### Before Every Push

```bash
# 1. Run security check
./scripts/security-check.sh

# 2. Check what will be committed
git status

# 3. Review changes
git diff --cached

# 4. Verify no secrets
git grep -E "(sk_live_|sk_test_|API_KEY)" -- "*.ts" "*.tsx"
```

### After First Push

1. **Enable GitHub Security Features:**
   - Go to Settings → Security & analysis
   - Enable Dependabot alerts
   - Enable Secret scanning
   - Enable Code scanning (CodeQL)

2. **Set up Branch Protection:**
   - Go to Settings → Branches
   - Add rule for `main` branch
   - Require pull request reviews
   - Require status checks to pass

3. **Add GitHub Secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Add production secrets for CI/CD

---

## 🚨 What to Do If You Accidentally Commit a Secret

### Immediate Actions

1. **Rotate the compromised secret immediately:**
   - Stripe: Generate new API key
   - OpenAI: Rotate API key
   - Supabase: Reset service role key

2. **Remove from git history:**

   ```bash
   # Option 1: Using BFG Repo-Cleaner (recommended)
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/
   
   java -jar bfg.jar --replace-text secrets.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   
   # Option 2: Using git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (if not yet public):**
   ```bash
   git push origin --force --all
   ```

4. **Notify team and update documentation**

### Prevention

- Use pre-commit hooks
- Enable GitHub push protection
- Regular security audits
- Team training

---

## 📋 Security Checklist

### Before Initial Push

- [ ] Run `./scripts/security-check.sh`
- [ ] Verify `.env` files are not tracked
- [ ] Check no API keys in code
- [ ] Review `.gitignore` configuration
- [ ] Test with `git status --ignored`

### After Initial Push

- [ ] Enable GitHub secret scanning
- [ ] Enable Dependabot alerts
- [ ] Set up branch protection
- [ ] Configure GitHub Actions secrets
- [ ] Review security alerts

### Regular Maintenance

- [ ] Weekly: Review Dependabot alerts
- [ ] Monthly: Rotate API keys
- [ ] Quarterly: Security audit
- [ ] Annually: Review access permissions

---

## 🔧 GitHub Repository Settings

### Recommended Settings

**General:**
- ✅ Require pull request reviews
- ✅ Automatically delete head branches
- ✅ Allow squash merging

**Security & Analysis:**
- ✅ Dependabot alerts: Enabled
- ✅ Dependabot security updates: Enabled
- ✅ Secret scanning: Enabled
- ✅ Push protection: Enabled
- ✅ Code scanning: Enabled (CodeQL)

**Branches:**
- ✅ Branch protection rule for `main`
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution

**Actions:**
- ✅ Allow GitHub Actions
- ✅ Require approval for first-time contributors

---

## 🔑 Managing Secrets in GitHub Actions

### Add Secrets

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### Use in Workflows

```yaml
- name: Deploy to Supabase
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
  run: |
    supabase functions deploy
```

---

## 📚 Additional Resources

### Tools

- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) - Remove secrets from git history
- [git-secrets](https://github.com/awslabs/git-secrets) - Prevent committing secrets
- [TruffleHog](https://github.com/trufflesecurity/trufflehog) - Find secrets in git history
- [GitGuardian](https://www.gitguardian.com/) - Real-time secret detection

### Documentation

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/securing-your-repository)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### Guides

- `SECURITY_AUDIT.md` - Complete security audit report
- `.env.example` - Environment variable template
- `PRODUCTION_SETUP_GUIDE.md` - Production deployment guide

---

## 🆘 Support

### Common Issues

**Issue:** "Found .env file in repository"
```bash
# Solution: Remove from git
git rm --cached .env
git commit -m "Remove .env from tracking"
```

**Issue:** "API key detected in code"
```bash
# Solution: Move to environment variable
# 1. Add to .env file
# 2. Load via process.env or Deno.env.get()
# 3. Remove hardcoded value
```

**Issue:** "Secret found in git history"
```bash
# Solution: Use BFG Repo-Cleaner
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## ✅ Final Verification

Before considering your repository secure:

```bash
# 1. Security check passes
./scripts/security-check.sh

# 2. No secrets in current files
git grep -E "(sk_live_|sk_test_|API_KEY)" -- "*.ts" "*.tsx"

# 3. No .env files tracked
git ls-files | grep "\.env$"

# 4. .gitignore working
git status --ignored | grep .env

# 5. GitHub Actions passing
# Check: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

---

**Status:** 🔒 SECURE  
**Ready for GitHub:** ✅ YES  
**Last Updated:** Auto-generated
