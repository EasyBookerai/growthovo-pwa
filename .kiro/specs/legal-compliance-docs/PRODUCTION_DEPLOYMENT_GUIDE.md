# Legal Compliance System - Production Deployment Guide

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** READY FOR DEPLOYMENT  
**Estimated Deployment Time:** 4-6 hours

## Overview

This guide provides step-by-step instructions for deploying the Legal Compliance Documentation system to production. All core implementation is complete. This guide focuses on final configuration, testing, and deployment steps.

## Pre-Deployment Checklist

### Critical Items (Must Complete Before Launch)

- [ ] **1. Update Company Information** (30 minutes)
  - [ ] Replace `[Company Name]` with actual Romanian company name
  - [ ] Add company registration number (Cod Unic de Înregistrare - CUI)
  - [ ] Add VAT number (Cod de înregistrare în scopuri de TVA)
  - [ ] Add registered address in Romania
  - [ ] Add contact email (e.g., legal@growthovo.app)
  - [ ] Add contact phone number
  - [ ] Update in ALL language versions (8 files)

- [ ] **2. Verify Emergency Contact Numbers** (15 minutes)
  - [ ] Confirm 112 works for EU emergency services
  - [ ] Verify Romanian crisis helplines:
    - Telefonul Sufletului: 0800 801 200
    - Suicide Prevention: 116 123
  - [ ] Test that numbers are clickable in app
  - [ ] Add any additional Romanian mental health resources

- [ ] **3. Configure Email Service** (30 minutes)
  - [ ] Set up email sending for legal update notifications
  - [ ] Configure Supabase Edge Function: `send-legal-update-email`
  - [ ] Test email delivery
  - [ ] Set up email templates for:
    - Legal document updates
    - Account deletion confirmation
    - Data export delivery

- [ ] **4. Database Migration** (30 minutes)
  - [ ] Backup production database
  - [ ] Run migration: `20240034_legal_compliance.sql`
  - [ ] Run migration: `20240035_data_management.sql`
  - [ ] Run migration: `20240036_legal_notification_log.sql`
  - [ ] Verify tables created successfully
  - [ ] Verify RLS policies are active
  - [ ] Seed initial legal document versions

- [ ] **5. Environment Variables** (15 minutes)
  - [ ] Set `LEGAL_DOCUMENTS_VERSION` = "1.0"
  - [ ] Set `LEGAL_EFFECTIVE_DATE` = "2025-01-01"
  - [ ] Set `COMPANY_EMAIL` = "legal@growthovo.app"
  - [ ] Set `SUPPORT_EMAIL` = "support@growthovo.app"
  - [ ] Set `DATA_PROTECTION_EMAIL` = "privacy@growthovo.app"

### Important Items (Should Complete Before Launch)

- [ ] **6. Translation Review** (2-3 hours)
  - [ ] Have native German speaker review German translations
  - [ ] Have native French speaker review French translations
  - [ ] Have native Italian speaker review Italian translations
  - [ ] Have native Spanish speaker review Spanish translations
  - [ ] Have native Portuguese speaker review Portuguese translations
  - [ ] Have native Dutch speaker review Dutch translations
  - [ ] Have native Romanian speaker review Romanian translations
  - [ ] Verify legal terminology is accurate in all languages

- [ ] **7. Manual Testing** (3-4 hours)
  - [ ] Test complete signup flow with legal checkboxes
  - [ ] Test AI transparency notice on first Rex interaction
  - [ ] Test crisis disclaimer on SOS button
  - [ ] Test subscription terms display on paywall
  - [ ] Test legal document viewer in all 8 languages
  - [ ] Test data export functionality
  - [ ] Test account deletion flow (use test account)
  - [ ] Test privacy preferences management
  - [ ] Test legal document update notifications
  - [ ] Test consent logging (verify database entries)
  - [ ] Test language fallback mechanism

- [ ] **8. Legal Document Review** (Optional but Recommended)
  - [ ] Have Romanian lawyer review Privacy Policy
  - [ ] Have Romanian lawyer review Terms and Conditions
  - [ ] Verify GDPR compliance
  - [ ] Verify Romanian law compliance
  - [ ] Verify EU consumer protection compliance
  - [ ] Get sign-off from legal counsel

### Nice to Have (Post-Launch)

- [ ] **9. Web Hosting for Legal Documents** (Optional)
  - [ ] Set up static site or use Supabase Storage
  - [ ] Create HTML versions of legal documents
  - [ ] Configure URLs: growthovo.app/privacy-policy, etc.
  - [ ] Ensure mobile-responsive design
  - [ ] Link in-app viewers to web URLs

- [ ] **10. Analytics Setup** (Optional)
  - [ ] Track legal document views
  - [ ] Track consent acceptance rates
  - [ ] Track data export requests
  - [ ] Track account deletion requests
  - [ ] Monitor legal update notification engagement

## Step-by-Step Deployment Instructions

### Step 1: Update Company Information

**Files to Update:**
1. `.kiro/specs/legal-compliance-docs/privacy-policy.md`
2. `.kiro/specs/legal-compliance-docs/terms-and-conditions.md`
3. `.kiro/specs/legal-compliance-docs/privacy-policy-ro.md`
4. `.kiro/specs/legal-compliance-docs/terms-and-conditions-ro.md`
5. `.kiro/specs/legal-compliance-docs/privacy-policy-de.md`
6. `.kiro/specs/legal-compliance-docs/terms-and-conditions-de.md`
7. `.kiro/specs/legal-compliance-docs/privacy-policy-fr.md`
8. `.kiro/specs/legal-compliance-docs/terms-and-conditions-fr.md`
9. `.kiro/specs/legal-compliance-docs/privacy-policy-it.md`
10. `.kiro/specs/legal-compliance-docs/terms-and-conditions-it.md`
11. `.kiro/specs/legal-compliance-docs/privacy-policy-es.md`
12. `.kiro/specs/legal-compliance-docs/terms-and-conditions-es.md`
13. `.kiro/specs/legal-compliance-docs/privacy-policy-pt.md`
14. `.kiro/specs/legal-compliance-docs/terms-and-conditions-pt.md`
15. `.kiro/specs/legal-compliance-docs/privacy-policy-nl.md`
16. `.kiro/specs/legal-compliance-docs/terms-and-conditions-nl.md`

**Search and Replace:**
```
Find: [Company Name]
Replace: [Your Actual Company Name]

Find: [Company Registration Number]
Replace: CUI [Your CUI Number]

Find: [VAT Number]
Replace: RO[Your VAT Number]

Find: [Street Address]
Replace: [Your Actual Street Address]

Find: [City, Postal Code]
Replace: [Your City], [Postal Code]

Find: legal@growthovo.app
Verify: This is your actual legal contact email

Find: support@growthovo.app
Verify: This is your actual support email

Find: privacy@growthovo.app
Verify: This is your actual data protection email
```

**Verification:**
- [ ] All placeholders replaced in all 16 files
- [ ] Company information is consistent across all documents
- [ ] Contact emails are valid and monitored
- [ ] Romanian company details are accurate

### Step 2: Database Migration

**Prerequisites:**
- Backup production database
- Test migrations in staging environment first
- Have rollback plan ready

**Migration Commands:**
```bash
# Connect to Supabase project
supabase link --project-ref [your-project-ref]

# Run migrations
supabase db push

# Or manually run each migration:
psql [connection-string] -f supabase/migrations/20240034_legal_compliance.sql
psql [connection-string] -f supabase/migrations/20240035_data_management.sql
psql [connection-string] -f supabase/migrations/20240036_legal_notification_log.sql
```

**Verification Queries:**
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_legal_consents', 'legal_document_versions', 'user_privacy_preferences', 'legal_notification_log');

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_legal_consents', 'legal_document_versions', 'user_privacy_preferences');

-- Seed initial document versions
INSERT INTO legal_document_versions (document_type, version, effective_date, language, is_current, change_summary)
VALUES 
  ('privacy_policy', '1.0', '2025-01-01', 'en', true, 'Initial version'),
  ('terms_conditions', '1.0', '2025-01-01', 'en', true, 'Initial version'),
  ('privacy_policy', '1.0', '2025-01-01', 'ro', true, 'Versiune inițială'),
  ('terms_conditions', '1.0', '2025-01-01', 'ro', true, 'Versiune inițială');
```

### Step 3: Deploy Supabase Edge Functions

**Functions to Deploy:**
1. `send-legal-update-email` - Sends email notifications for legal updates

**Deployment Commands:**
```bash
# Deploy legal notification function
supabase functions deploy send-legal-update-email

# Set environment variables
supabase secrets set RESEND_API_KEY=[your-resend-api-key]
supabase secrets set FROM_EMAIL=legal@growthovo.app
```

**Test Function:**
```bash
# Test email sending
curl -X POST https://[project-ref].supabase.co/functions/v1/send-legal-update-email \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "[test-user-id]",
    "documentType": "privacy_policy",
    "changeSummary": "Test notification"
  }'
```

### Step 4: Update Mobile App

**Files to Deploy:**
- All files in `growthovo/src/components/legal/`
- All files in `growthovo/src/services/` (legal-related)
- All files in `growthovo/src/screens/` (updated with legal integrations)
- All translation files in `growthovo/locales/`

**Build and Deploy:**
```bash
# Navigate to app directory
cd growthovo

# Install dependencies
npm install

# Run tests
npm test

# Build for production
# iOS
cd ios && pod install && cd ..
npx react-native run-ios --configuration Release

# Android
npx react-native run-android --variant=release

# Submit to app stores
# Follow standard app store submission process
```

### Step 5: Manual Testing Checklist

**Signup Flow:**
- [ ] Age verification checkbox appears
- [ ] Terms acceptance checkbox appears
- [ ] Privacy Policy link works
- [ ] Cannot submit without checking both boxes
- [ ] Consent is logged in database after signup

**Settings Screen:**
- [ ] Legal Documents section appears
- [ ] Privacy Policy link opens document viewer
- [ ] Terms and Conditions link opens document viewer
- [ ] Cookie Policy link opens document viewer
- [ ] Document viewer displays correct language
- [ ] Document viewer scrolls smoothly
- [ ] Version numbers and dates display correctly

**Rex Chat (First Use):**
- [ ] AI Transparency Notice modal appears on first interaction
- [ ] Modal explains Rex is AI
- [ ] "I Understand" button works
- [ ] Consent is logged in database
- [ ] Modal does not appear on subsequent interactions

**SOS/Panic Button:**
- [ ] Crisis Disclaimer banner appears at top
- [ ] Emergency numbers display correctly (112, Romanian helplines)
- [ ] Numbers are clickable/callable
- [ ] Banner remains visible during interaction

**Paywall Screen:**
- [ ] Subscription Terms link appears
- [ ] Link opens subscription terms modal
- [ ] Pricing displays correctly with VAT
- [ ] Refund policy is visible
- [ ] Terms acceptance is logged before purchase

**Data Management:**
- [ ] "Export My Data" button works
- [ ] Export generates JSON file with all user data
- [ ] Export includes: profile, chat history, progress, consents
- [ ] "Delete My Account" flow works
- [ ] Deletion warning displays correctly
- [ ] Confirmation required (type "DELETE")
- [ ] Account is soft-deleted with 30-day grace period
- [ ] Confirmation email sent

**Privacy Preferences:**
- [ ] Analytics toggle works
- [ ] Marketing emails toggle works
- [ ] Preferences save to database
- [ ] Preferences persist across app restarts

**Multi-Language:**
- [ ] Switch app language to German - legal docs display in German
- [ ] Switch to French - legal docs display in French
- [ ] Switch to Italian - legal docs display in Italian
- [ ] Switch to Spanish - legal docs display in Spanish
- [ ] Switch to Portuguese - legal docs display in Portuguese
- [ ] Switch to Dutch - legal docs display in Dutch
- [ ] Switch to Romanian - legal docs display in Romanian
- [ ] Switch to unsupported language - fallback to English with notice

**Legal Update Notifications:**
- [ ] Update document version in database
- [ ] Notification appears for users who haven't seen new version
- [ ] Notification displays change summary
- [ ] Link to full document works
- [ ] Acknowledgment is logged in database

### Step 6: Monitor and Verify

**Post-Deployment Monitoring (First 24 Hours):**

**Database Checks:**
```sql
-- Check consent logging is working
SELECT COUNT(*) FROM user_legal_consents 
WHERE consented_at > NOW() - INTERVAL '24 hours';

-- Check which documents users are viewing
SELECT document_type, COUNT(*) as views
FROM user_legal_consents
WHERE consented_at > NOW() - INTERVAL '24 hours'
GROUP BY document_type;

-- Check data export requests
SELECT COUNT(*) FROM user_data_exports
WHERE requested_at > NOW() - INTERVAL '24 hours';

-- Check account deletion requests
SELECT COUNT(*) FROM user_account_deletions
WHERE requested_at > NOW() - INTERVAL '24 hours';
```

**Error Monitoring:**
- [ ] Check Supabase logs for errors in legal services
- [ ] Check app crash reports for legal component issues
- [ ] Monitor email delivery for legal notifications
- [ ] Check for failed consent logging attempts

**User Feedback:**
- [ ] Monitor support tickets for legal-related questions
- [ ] Track user confusion or complaints about legal flows
- [ ] Gather feedback on document clarity
- [ ] Identify any UX issues with legal components

## Rollback Plan

If critical issues are discovered post-deployment:

**Immediate Actions:**
1. Revert app to previous version in app stores
2. Disable legal update notifications
3. Investigate and fix issues in staging
4. Re-test thoroughly before re-deploying

**Database Rollback:**
```sql
-- If needed, rollback migrations
-- (Have backup ready before deployment)
-- Restore from backup taken before migration
```

**Communication:**
- Notify users of any issues via email
- Post status updates on social media
- Provide timeline for resolution

## Post-Launch Tasks

**Week 1:**
- [ ] Monitor all metrics daily
- [ ] Respond to user feedback quickly
- [ ] Fix any minor bugs discovered
- [ ] Optimize performance if needed

**Month 1:**
- [ ] Analyze consent acceptance rates
- [ ] Review data export/deletion request volume
- [ ] Assess translation quality based on user feedback
- [ ] Plan improvements based on usage data

**Quarter 1:**
- [ ] Conduct legal review if not done pre-launch
- [ ] Update documents based on legal feedback
- [ ] Implement web hosting for documents
- [ ] Add analytics for legal flows
- [ ] Consider A/B testing for consent optimization

## Support and Maintenance

**Ongoing Responsibilities:**

**Legal Document Updates:**
- Review documents quarterly for accuracy
- Update when laws change (GDPR amendments, Romanian law changes)
- Update when service features change significantly
- Notify users of material changes via email and in-app

**User Rights Requests:**
- Respond to data access requests within 30 days (GDPR requirement)
- Process data export requests within 48 hours
- Process account deletion requests within 7 days
- Maintain log of all requests for compliance

**Monitoring:**
- Weekly review of consent logging
- Monthly review of legal document views
- Quarterly review of user rights requests
- Annual compliance audit

## Contact Information

**For Deployment Issues:**
- Technical Lead: [email]
- DevOps: [email]

**For Legal Questions:**
- Legal Counsel: [email]
- Data Protection Officer: [email]

**For User Support:**
- Support Team: support@growthovo.app
- Legal Inquiries: legal@growthovo.app
- Privacy Inquiries: privacy@growthovo.app

## Conclusion

This deployment guide provides a comprehensive checklist for launching the Legal Compliance Documentation system. Follow each step carefully, test thoroughly, and monitor closely post-launch.

**Estimated Total Deployment Time:** 4-6 hours (excluding optional legal review)

**Critical Path:**
1. Update company information (30 min)
2. Run database migrations (30 min)
3. Deploy edge functions (30 min)
4. Manual testing (3-4 hours)
5. Deploy to production (1 hour)

**System Status:** ✅ READY FOR PRODUCTION DEPLOYMENT

---

**Document Prepared By:** Kiro AI Assistant  
**Last Updated:** January 2025  
**Next Review:** Before deployment
