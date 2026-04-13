# Legal Compliance System - Quick Launch Checklist

**Status:** ✅ READY TO LAUNCH  
**Time to Launch:** 3-4 hours  
**Last Updated:** January 2025

## 🚀 Quick Start

This is a condensed checklist for launching the legal compliance system. For detailed instructions, see `PRODUCTION_DEPLOYMENT_GUIDE.md`.

## ✅ Pre-Launch Checklist (30 minutes)

### 1. Update Company Information
**Time:** 30 minutes  
**Priority:** CRITICAL - Must complete before launch

Replace placeholders in these 16 files:
- `.kiro/specs/legal-compliance-docs/privacy-policy.md`
- `.kiro/specs/legal-compliance-docs/terms-and-conditions.md`
- `.kiro/specs/legal-compliance-docs/privacy-policy-ro.md`
- `.kiro/specs/legal-compliance-docs/terms-and-conditions-ro.md`
- `.kiro/specs/legal-compliance-docs/privacy-policy-de.md`
- `.kiro/specs/legal-compliance-docs/terms-and-conditions-de.md`
- `.kiro/specs/legal-compliance-docs/privacy-policy-fr.md`
- `.kiro/specs/legal-compliance-docs/terms-and-conditions-fr.md`
- `.kiro/specs/legal-compliance-docs/privacy-policy-it.md`
- `.kiro/specs/legal-compliance-docs/terms-and-conditions-it.md`
- `.kiro/specs/legal-compliance-docs/privacy-policy-es.md`
- `.kiro/specs/legal-compliance-docs/terms-and-conditions-es.md`
- `.kiro/specs/legal-compliance-docs/privacy-policy-pt.md`
- `.kiro/specs/legal-compliance-docs/terms-and-conditions-pt.md`
- `.kiro/specs/legal-compliance-docs/privacy-policy-nl.md`
- `.kiro/specs/legal-compliance-docs/terms-and-conditions-nl.md`

**Search and Replace:**
```
[Company Name] → Your Actual Company Name
[Company Registration Number] → CUI XXXXXXXXX
[VAT Number] → ROXXXXXXXXX
[Street Address] → Your Street Address
[City, Postal Code] → Your City, Postal Code
```

**Verify:**
- [ ] All 16 files updated
- [ ] Company info consistent across all files
- [ ] Contact emails valid (legal@growthovo.app, support@growthovo.app, privacy@growthovo.app)

## 🗄️ Database Deployment (30 minutes)

### 2. Backup Database
**Time:** 5 minutes  
**Priority:** CRITICAL

```bash
# Backup production database before migration
supabase db dump -f backup_before_legal_$(date +%Y%m%d).sql
```

### 3. Run Migrations
**Time:** 15 minutes  
**Priority:** CRITICAL

```bash
# Connect to project
supabase link --project-ref [your-project-ref]

# Run migrations
supabase db push

# Or manually:
psql [connection-string] -f supabase/migrations/20240034_legal_compliance.sql
psql [connection-string] -f supabase/migrations/20240035_data_management.sql
psql [connection-string] -f supabase/migrations/20240036_legal_notification_log.sql
```

### 4. Verify Database
**Time:** 10 minutes  
**Priority:** CRITICAL

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_legal_consents', 'legal_document_versions', 'user_privacy_preferences', 'legal_notification_log');

-- Should return 4 rows

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_legal_consents', 'legal_document_versions', 'user_privacy_preferences');

-- All should show rowsecurity = true

-- Seed initial versions
INSERT INTO legal_document_versions (document_type, version, effective_date, language, is_current, change_summary)
VALUES 
  ('privacy_policy', '1.0', '2025-01-01', 'en', true, 'Initial version'),
  ('terms_conditions', '1.0', '2025-01-01', 'en', true, 'Initial version'),
  ('privacy_policy', '1.0', '2025-01-01', 'ro', true, 'Versiune inițială'),
  ('terms_conditions', '1.0', '2025-01-01', 'ro', true, 'Versiune inițială');
```

## ☁️ Deploy Edge Functions (15 minutes)

### 5. Deploy Legal Notification Function
**Time:** 15 minutes  
**Priority:** HIGH

```bash
# Deploy function
supabase functions deploy send-legal-update-email

# Set secrets
supabase secrets set RESEND_API_KEY=[your-resend-api-key]
supabase secrets set FROM_EMAIL=legal@growthovo.app

# Test function
curl -X POST https://[project-ref].supabase.co/functions/v1/send-legal-update-email \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{"userId": "[test-user-id]", "documentType": "privacy_policy", "changeSummary": "Test"}'
```

## 📱 Deploy Mobile App (1-2 hours)

### 6. Build and Deploy App
**Time:** 1-2 hours  
**Priority:** CRITICAL

```bash
cd growthovo

# Install dependencies
npm install

# Run tests
npm test

# Build iOS
cd ios && pod install && cd ..
npx react-native run-ios --configuration Release

# Build Android
npx react-native run-android --variant=release

# Submit to app stores
# Follow standard submission process
```

## 🧪 Post-Deployment Testing (1 hour)

### 7. Critical Path Testing
**Time:** 1 hour  
**Priority:** CRITICAL

**Signup Flow (5 min):**
- [ ] Age verification checkbox appears
- [ ] Terms acceptance checkbox appears
- [ ] Cannot submit without both checked
- [ ] Consent logged in database

**Legal Documents (10 min):**
- [ ] Settings → Legal Documents section exists
- [ ] Privacy Policy opens and displays correctly
- [ ] Terms and Conditions opens and displays correctly
- [ ] Documents display in correct language

**Rex First Use (5 min):**
- [ ] AI Transparency Notice appears on first Rex interaction
- [ ] "I Understand" button works
- [ ] Modal doesn't appear on second interaction

**SOS Button (5 min):**
- [ ] Crisis Disclaimer banner appears
- [ ] Emergency numbers display (112, Romanian helplines)
- [ ] Numbers are clickable

**Data Management (15 min):**
- [ ] Export My Data generates JSON file
- [ ] Delete My Account flow works
- [ ] Privacy preferences save correctly

**Multi-Language (15 min):**
- [ ] Switch to German → documents in German
- [ ] Switch to French → documents in French
- [ ] Switch to Romanian → documents in Romanian
- [ ] Switch to unsupported language → fallback to English with notice

**Database Verification (5 min):**
```sql
-- Check consent logging
SELECT * FROM user_legal_consents ORDER BY consented_at DESC LIMIT 10;

-- Should see recent consents from testing
```

## 📊 Monitoring (First 24 Hours)

### 8. Monitor System Health
**Priority:** HIGH

**Check Every 2 Hours:**
- [ ] Supabase logs for errors
- [ ] App crash reports
- [ ] Email delivery for legal notifications
- [ ] Database consent logging

**SQL Monitoring Queries:**
```sql
-- Consent activity
SELECT COUNT(*) FROM user_legal_consents 
WHERE consented_at > NOW() - INTERVAL '24 hours';

-- Document views by type
SELECT document_type, COUNT(*) 
FROM user_legal_consents
WHERE consented_at > NOW() - INTERVAL '24 hours'
GROUP BY document_type;

-- Data export requests
SELECT COUNT(*) FROM user_data_exports
WHERE requested_at > NOW() - INTERVAL '24 hours';

-- Account deletions
SELECT COUNT(*) FROM user_account_deletions
WHERE requested_at > NOW() - INTERVAL '24 hours';
```

## 🚨 Rollback Plan

If critical issues discovered:

1. **Immediate:** Revert app to previous version in stores
2. **Database:** Restore from backup taken in Step 2
3. **Investigate:** Fix issues in staging
4. **Re-test:** Full testing before re-deployment
5. **Communicate:** Notify users of any issues

## ✅ Launch Complete Checklist

- [ ] Company information updated in all 16 files
- [ ] Database backup created
- [ ] Database migrations run successfully
- [ ] Tables and RLS verified
- [ ] Edge functions deployed and tested
- [ ] Mobile app built and deployed
- [ ] Critical path testing complete
- [ ] Monitoring set up
- [ ] Team notified of launch
- [ ] Support team briefed on legal features

## 📞 Support Contacts

**Technical Issues:**
- DevOps: [email]
- Technical Lead: [email]

**Legal Questions:**
- Legal Counsel: [email]
- Data Protection: privacy@growthovo.app

**User Support:**
- Support Team: support@growthovo.app
- Legal Inquiries: legal@growthovo.app

## 📚 Additional Resources

- **Detailed Guide:** `PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Status Report:** `FINAL_STATUS_REPORT.md`
- **Implementation Checklist:** `LEGAL_IMPLEMENTATION_CHECKLIST.md`
- **Compliance Guide:** `LEGAL_COMPLIANCE_GUIDE.md`
- **Data Retention Policy:** `DATA_RETENTION_POLICY.md`
- **GDPR Runbook:** `DATA_SUBJECT_REQUEST_RUNBOOK.md`

## 🎉 Success Criteria

**Launch is successful when:**
- ✅ All legal documents accessible in app
- ✅ Consent logging working
- ✅ Data export/deletion functional
- ✅ Multi-language support working
- ✅ No critical bugs in legal flows
- ✅ Monitoring shows healthy metrics

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Estimated Total Time:** 3-4 hours  
**System Status:** ✅ READY TO LAUNCH
