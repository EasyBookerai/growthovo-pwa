# Legal Compliance Guide

## Overview

This guide provides comprehensive information on maintaining legal compliance for the Growthovo application. It covers GDPR requirements, EU consumer protection laws, and operational procedures for handling user data and legal documents.

## Legal Requirements

### GDPR Compliance

Growthovo must comply with the General Data Protection Regulation (GDPR) as it processes personal data of EU users.

**Key Principles:**
1. **Lawfulness, Fairness, and Transparency** - Process data legally with clear communication
2. **Purpose Limitation** - Collect data only for specified purposes
3. **Data Minimization** - Collect only necessary data
4. **Accuracy** - Keep data accurate and up-to-date
5. **Storage Limitation** - Retain data only as long as necessary
6. **Integrity and Confidentiality** - Secure data appropriately
7. **Accountability** - Demonstrate compliance

### EU Consumer Protection Laws

**14-Day Withdrawal Right:**
- EU consumers have 14 days to cancel subscriptions and receive full refund
- Must be clearly communicated in subscription terms
- Implemented in Stripe payment processing

**Transparent Pricing:**
- Display prices including VAT
- Show total cost before purchase
- Explain billing cycle and auto-renewal

**Easy Cancellation:**
- Cancellation must be as easy as subscription
- No hidden fees or penalties
- Immediate confirmation of cancellation

### Romanian Law Compliance

**Jurisdiction:**
- Governing law: Romanian law
- Jurisdiction: Romanian courts
- EU regulations apply

**Company Information:**
- Must display company registration details
- VAT number required
- Contact information mandatory

**Data Protection Authority:**
- Romanian ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal)
- Contact: anspdcp@dataprotection.ro
- Users can file complaints with ANSPDCP

## Legal Documents

### Document Structure

All legal documents follow this structure:

```markdown
# [Document Title]

**Effective Date:** [Date]
**Last Updated:** [Date]
**Version:** [X.X]

## 1. Introduction
...

## 2. [Section Title]
...

## Contact Information
Email: legal@growthovo.app
Address: [Company Address]
```

### Document Versions

**Version Numbering:**
- Major changes: Increment major version (1.0 → 2.0)
- Minor changes: Increment minor version (1.0 → 1.1)
- Typo fixes: Increment patch version (1.0.0 → 1.0.1)

**Major Changes** (require user re-consent):
- Changes to data collection practices
- Changes to data sharing with third parties
- Changes to user rights
- Changes to subscription terms or pricing
- Changes to liability limitations

**Minor Changes** (notification only):
- Clarifications of existing terms
- Addition of new features (without changing existing terms)
- Contact information updates
- Formatting improvements

### Updating Legal Documents

**Process:**

1. **Draft Update**
   - Create new version of document
   - Document all changes in change summary
   - Increment version number appropriately

2. **Internal Review**
   - Product team review
   - Development team review
   - Legal counsel review (recommended)

3. **Database Update**
   ```sql
   -- Insert new version
   INSERT INTO legal_document_versions (
     document_type,
     version,
     effective_date,
     content,
     language,
     is_current,
     change_summary
   ) VALUES (
     'privacy_policy',
     '2.0',
     '2025-02-01',
     '[Full document content]',
     'en',
     false,
     'Added new data collection category for voice recordings'
   );
   
   -- Update is_current flag after effective date
   UPDATE legal_document_versions
   SET is_current = false
   WHERE document_type = 'privacy_policy' AND version != '2.0';
   
   UPDATE legal_document_versions
   SET is_current = true
   WHERE document_type = 'privacy_policy' AND version = '2.0';
   ```

4. **User Notification**
   - For major changes: Use `legalNotificationService.sendLegalUpdateNotification()`
   - Send email notifications
   - Display in-app banner
   - Require re-consent for critical changes

5. **Update Markdown Files**
   - Update document in `.kiro/specs/legal-compliance-docs/`
   - Update web versions if hosted
   - Ensure consistency across all platforms

### Adding New Consent Types

**Steps:**

1. **Define Consent Type**
   - Choose unique identifier (e.g., 'marketing_consent')
   - Define version number (start with '1.0')
   - Determine consent method ('explicit_checkbox', 'click_through', 'passive_display')

2. **Create UI Component**
   - Create checkbox or modal component
   - Add i18n translations
   - Integrate with `legalConsentService`

3. **Log Consent**
   ```typescript
   import { logConsent } from '../../services/legalConsentService';
   
   async function handleAccept() {
     await logConsent(
       userId,
       'marketing_consent',
       '1.0',
       'explicit_checkbox'
     );
   }
   ```

4. **Check Consent Status**
   ```typescript
   import { hasUserConsented } from '../../services/legalConsentService';
   
   const hasConsented = await hasUserConsented(
     userId,
     'marketing_consent',
     '1.0' // minimum version
   );
   ```

5. **Update Database**
   - No schema changes needed (uses existing `user_legal_consents` table)
   - Ensure RLS policies allow user access

## Handling User Data Requests

### Right to Access (Article 15)

**Request:** User wants to know what data we have about them.

**Response Time:** 30 days maximum

**Process:**

1. **Verify Identity**
   - Confirm user identity through email verification
   - May request additional verification for sensitive requests

2. **Generate Data Export**
   ```typescript
   import { exportUserData } from '../../services/dataExportService';
   
   const exportData = await exportUserData(userId);
   ```

3. **Provide Data**
   - Send JSON export via email or in-app download
   - Include all personal data categories
   - Explain data processing purposes

**Data Categories to Include:**
- Profile information (username, email, age verification)
- Chat history with Rex
- Progress data (XP, levels, streaks)
- Behavioral data (task completion, check-ins)
- Subscription information
- Privacy preferences
- Legal consents

### Right to Erasure (Article 17)

**Request:** User wants to delete their account and data.

**Response Time:** 30 days maximum (with 30-day grace period)

**Process:**

1. **Initiate Deletion**
   ```typescript
   import { requestAccountDeletion } from '../../services/accountDeletionService';
   
   await requestAccountDeletion(userId, reason);
   ```

2. **Grace Period**
   - 30-day grace period before permanent deletion
   - User can cancel deletion during this period
   - Send reminder emails at 7 days and 1 day before deletion

3. **Cancel Active Subscriptions**
   - Automatically cancel Stripe subscriptions
   - Process any pending refunds
   - Send cancellation confirmation

4. **Permanent Deletion**
   ```typescript
   import { confirmAccountDeletion } from '../../services/accountDeletionService';
   
   await confirmAccountDeletion(userId);
   ```

5. **Data Retention**
   - Delete most personal data immediately after grace period
   - Retain some data for legal compliance:
     - Payment records (7 years for tax purposes)
     - Legal consents (3 years for proof of compliance)
     - Aggregated analytics (anonymized)

**What Gets Deleted:**
- Profile information
- Chat history
- Progress data
- Behavioral data
- Privacy preferences
- Personal identifiers

**What Gets Retained:**
- Payment transaction records (anonymized where possible)
- Legal consent logs (for compliance proof)
- Aggregated usage statistics (fully anonymized)

### Right to Rectification (Article 16)

**Request:** User wants to correct inaccurate data.

**Response Time:** 30 days maximum

**Process:**

1. **Verify Request**
   - Confirm which data needs correction
   - Verify user identity

2. **Update Data**
   - Allow user to update profile information in Settings
   - Manually correct data if needed
   - Notify user of changes

3. **Propagate Changes**
   - Update all systems where data is stored
   - Notify third parties if data was shared (e.g., payment processor)

### Right to Data Portability (Article 20)

**Request:** User wants data in machine-readable format.

**Response Time:** 30 days maximum

**Process:**

1. **Generate Export**
   - Use `dataExportService.exportUserData()`
   - Provide JSON format (machine-readable)

2. **Deliver Data**
   - Email download link
   - Or provide in-app download
   - Include instructions for importing to other services

### Right to Object (Article 21)

**Request:** User objects to data processing for specific purposes.

**Response Time:** Immediate

**Process:**

1. **Update Privacy Preferences**
   ```typescript
   import { updatePrivacyPreferences } from '../../services/privacyPreferencesService';
   
   await updatePrivacyPreferences(userId, {
     analytics_enabled: false,
     marketing_emails_enabled: false,
     data_sharing_consent: false,
   });
   ```

2. **Stop Processing**
   - Immediately stop processing for objected purposes
   - Update all systems
   - Confirm changes to user

3. **Exceptions**
   - Cannot object to processing necessary for service delivery
   - Cannot object to legal obligations
   - Can object to marketing and analytics

## Data Retention Policies

### Retention Periods

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Profile Information | Until account deletion | Service delivery |
| Chat History | Until account deletion | Service delivery |
| Progress Data | Until account deletion | Service delivery |
| Behavioral Data | Until account deletion | Service delivery |
| Legal Consents | 3 years after account deletion | Compliance proof |
| Payment Records | 7 years after transaction | Tax/legal requirements |
| Analytics Data | 2 years (anonymized) | Service improvement |
| Logs | 90 days | Security/debugging |
| Backup Data | 30 days | Disaster recovery |

### Deletion Procedures

**Automated Deletion:**
- Logs older than 90 days
- Backup data older than 30 days
- Analytics data older than 2 years

**Manual Deletion:**
- Account deletion requests (after grace period)
- Data export requests (after delivery)
- Support tickets (after resolution + 1 year)

**Legal Retention:**
- Payment records: 7 years (cannot be deleted earlier)
- Legal consents: 3 years (cannot be deleted earlier)
- Compliance documentation: Indefinite

## Compliance Checklist for New Features

When adding new features, ensure legal compliance:

### Data Collection

- [ ] Document what data is collected
- [ ] Explain why data is needed (purpose)
- [ ] Update Privacy Policy if new data categories
- [ ] Obtain user consent if required
- [ ] Implement data minimization (collect only necessary data)

### Third-Party Integration

- [ ] Document third-party processors
- [ ] Review third-party privacy policies
- [ ] Ensure data processing agreements in place
- [ ] Update Privacy Policy with third-party information
- [ ] Verify third-party GDPR compliance

### User Rights

- [ ] Ensure data can be exported (data portability)
- [ ] Ensure data can be deleted (right to erasure)
- [ ] Ensure data can be corrected (right to rectification)
- [ ] Allow users to object to processing (right to object)

### Consent

- [ ] Determine if explicit consent is required
- [ ] Create consent UI if needed
- [ ] Log consent with `legalConsentService`
- [ ] Allow users to withdraw consent
- [ ] Update legal documents if needed

### Security

- [ ] Encrypt sensitive data
- [ ] Implement access controls
- [ ] Audit data access
- [ ] Plan for data breach response
- [ ] Document security measures

### Testing

- [ ] Test data export includes new data
- [ ] Test data deletion removes new data
- [ ] Test consent logging works
- [ ] Test privacy preferences apply to new feature
- [ ] Test with different user roles/permissions

## Data Breach Response

### Immediate Actions (Within 24 Hours)

1. **Contain the Breach**
   - Identify affected systems
   - Stop unauthorized access
   - Preserve evidence

2. **Assess Impact**
   - Determine what data was accessed
   - Identify affected users
   - Evaluate risk level

3. **Notify Internal Team**
   - Alert management
   - Inform legal counsel
   - Engage security team

### Notification Requirements (Within 72 Hours)

**Notify Data Protection Authority:**
- Romanian ANSPDCP must be notified within 72 hours
- Provide breach details, impact assessment, mitigation measures
- Email: anspdcp@dataprotection.ro

**Notify Affected Users:**
- Required if high risk to user rights and freedoms
- Provide clear information about the breach
- Explain steps taken and user actions needed
- Use multiple channels (email, in-app notification)

### Documentation

- Document all breach details
- Record timeline of events
- Document notification actions
- Keep evidence for compliance proof

### Prevention

- Regular security audits
- Penetration testing
- Employee training
- Incident response plan
- Regular backups

## Contact Information

### Legal Inquiries
- Email: legal@growthovo.app
- Response time: 5 business days

### Data Protection Inquiries
- Email: privacy@growthovo.app
- Response time: 30 days (GDPR requirement)

### Romanian Data Protection Authority
- ANSPDCP (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal)
- Email: anspdcp@dataprotection.ro
- Website: www.dataprotection.ro
- Phone: +40 21 252 5599

### Support
- Email: support@growthovo.app
- Response time: 24-48 hours

## Resources

### Internal Documentation
- Privacy Policy: `.kiro/specs/legal-compliance-docs/privacy-policy.md`
- Terms and Conditions: `.kiro/specs/legal-compliance-docs/terms-and-conditions.md`
- Implementation Checklist: `.kiro/specs/legal-compliance-docs/LEGAL_IMPLEMENTATION_CHECKLIST.md`
- Data Management README: `growthovo/src/services/DATA_MANAGEMENT_README.md`

### External Resources
- GDPR Official Text: https://gdpr-info.eu/
- Romanian Data Protection Authority: https://www.dataprotection.ro/
- EU Consumer Rights: https://europa.eu/youreurope/citizens/consumers/
- Stripe Documentation: https://stripe.com/docs/security

### Legal Templates
- Data Processing Agreement template
- Data breach notification template
- User data request response templates
- Consent withdrawal confirmation template

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-15 | Initial version | Kiro AI |

---

**Last Updated:** January 2025
**Next Review:** July 2025 (or upon significant legal/regulatory changes)
