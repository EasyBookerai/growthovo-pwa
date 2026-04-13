# Data Retention Policy

**Effective Date:** January 15, 2025
**Version:** 1.0
**Last Updated:** January 15, 2025

## Purpose

This Data Retention Policy defines how long Growthovo retains different types of user data and the procedures for data deletion. This policy ensures compliance with GDPR Article 5(1)(e) (storage limitation) and Romanian data protection laws.

## Scope

This policy applies to all personal data processed by Growthovo, including:
- User account information
- Chat messages and AI interactions
- Progress and behavioral data
- Payment and subscription information
- Legal consents and preferences
- System logs and analytics

## General Principles

1. **Necessity:** Data is retained only as long as necessary for the purposes for which it was collected
2. **Legality:** Retention periods comply with legal and regulatory requirements
3. **Security:** Retained data is protected with appropriate security measures
4. **Transparency:** Users are informed about retention periods in our Privacy Policy
5. **Deletion:** Data is securely deleted when retention period expires

## Retention Periods by Data Category

### 1. User Account Data

**Data Type:** Profile information (username, email, age verification, preferences)

**Retention Period:** Until account deletion + 30-day grace period

**Legal Basis:** Contract performance (GDPR Article 6(1)(b))

**Deletion Trigger:**
- User requests account deletion
- Account inactive for 5 years (with prior notification)

**Exceptions:**
- Email address may be retained in suppression list to prevent unwanted marketing (legitimate interest)

---

### 2. Chat History and AI Interactions

**Data Type:** Messages with Rex AI coach, conversation context, memory entries

**Retention Period:** Until account deletion + 30-day grace period

**Legal Basis:** Contract performance (GDPR Article 6(1)(b))

**Deletion Trigger:**
- User requests account deletion
- User manually deletes chat history

**Exceptions:**
- Aggregated, anonymized conversation metrics retained for 2 years for service improvement

---

### 3. Progress and Behavioral Data

**Data Type:** XP, levels, streaks, task completion, check-ins, pillar progress

**Retention Period:** Until account deletion + 30-day grace period

**Legal Basis:** Contract performance (GDPR Article 6(1)(b))

**Deletion Trigger:**
- User requests account deletion

**Exceptions:**
- Aggregated, anonymized usage statistics retained for 2 years

---

### 4. Payment and Subscription Data

**Data Type:** Transaction records, subscription history, billing information

**Retention Period:** 7 years after transaction date

**Legal Basis:** Legal obligation (tax and accounting laws)

**Deletion Trigger:**
- 7 years after transaction date (automatic)

**Exceptions:**
- Cannot be deleted earlier due to legal requirements
- Payment card details are NOT stored (handled by Stripe)

**Data Stored:**
- Transaction ID
- Amount and currency
- Date and time
- Subscription tier
- Invoice information

**Data NOT Stored:**
- Credit card numbers
- CVV codes
- Full card details (handled by Stripe PCI-compliant systems)

---

### 5. Legal Consents

**Data Type:** Consent records for Terms, Privacy Policy, AI transparency, age verification

**Retention Period:** 3 years after account deletion

**Legal Basis:** Legal obligation (proof of compliance)

**Deletion Trigger:**
- 3 years after account deletion (automatic)

**Exceptions:**
- Cannot be deleted earlier to maintain proof of GDPR compliance

**Data Stored:**
- User ID (anonymized after account deletion)
- Document type and version
- Consent timestamp
- IP address (anonymized after 1 year)
- User agent
- Consent method

---

### 6. Privacy Preferences

**Data Type:** Analytics consent, marketing consent, data sharing preferences

**Retention Period:** Until account deletion + 30-day grace period

**Legal Basis:** Consent (GDPR Article 6(1)(a))

**Deletion Trigger:**
- User requests account deletion

**Exceptions:**
- Marketing opt-out status retained indefinitely to prevent unwanted communications

---

### 7. Data Export Requests

**Data Type:** Logs of data export requests

**Retention Period:** 3 years after request

**Legal Basis:** Legal obligation (proof of compliance)

**Deletion Trigger:**
- 3 years after request (automatic)

**Data Stored:**
- User ID
- Request timestamp
- Export delivery method
- Completion status

---

### 8. Account Deletion Requests

**Data Type:** Logs of account deletion requests

**Retention Period:** 3 years after deletion completion

**Legal Basis:** Legal obligation (proof of compliance)

**Deletion Trigger:**
- 3 years after deletion completion (automatic)

**Data Stored:**
- User ID (anonymized)
- Request timestamp
- Deletion reason
- Completion timestamp
- Grace period cancellation (if applicable)

---

### 9. System Logs

**Data Type:** Application logs, error logs, access logs

**Retention Period:** 90 days

**Legal Basis:** Legitimate interest (security and debugging)

**Deletion Trigger:**
- 90 days after log creation (automatic)

**Exceptions:**
- Logs related to security incidents retained for 1 year
- Logs required for legal proceedings retained until case closure

**Data Stored:**
- Timestamps
- User IDs (anonymized after 30 days)
- IP addresses (anonymized after 30 days)
- Error messages
- API endpoints accessed

---

### 10. Analytics Data

**Data Type:** Usage statistics, feature adoption, performance metrics

**Retention Period:** 2 years (anonymized)

**Legal Basis:** Legitimate interest (service improvement)

**Deletion Trigger:**
- 2 years after collection (automatic)

**Data Stored:**
- Aggregated usage patterns
- Feature usage statistics
- Performance metrics
- User journey analytics (anonymized)

**Data NOT Stored:**
- Individual user identifiers (anonymized immediately)
- Personal information

---

### 11. Backup Data

**Data Type:** Database backups, file backups

**Retention Period:** 30 days

**Legal Basis:** Legitimate interest (disaster recovery)

**Deletion Trigger:**
- 30 days after backup creation (automatic)

**Exceptions:**
- Backups may contain deleted user data during retention period
- Users informed that backup deletion may take up to 30 days

---

### 12. Support Tickets and Communications

**Data Type:** Support emails, chat transcripts, issue reports

**Retention Period:** 1 year after ticket closure

**Legal Basis:** Legitimate interest (customer support quality)

**Deletion Trigger:**
- 1 year after ticket closure (automatic)

**Exceptions:**
- Tickets related to legal disputes retained until case closure

---

### 13. Marketing Communications

**Data Type:** Email marketing lists, campaign data

**Retention Period:** Until user unsubscribes + indefinite suppression list

**Legal Basis:** Consent (GDPR Article 6(1)(a))

**Deletion Trigger:**
- User unsubscribes from marketing

**Exceptions:**
- Email address retained in suppression list to prevent re-subscription
- Suppression list retained indefinitely (legitimate interest)

---

## Deletion Procedures

### Automated Deletion

**Daily Automated Tasks:**
- Delete system logs older than 90 days
- Delete backup data older than 30 days
- Anonymize IP addresses in logs older than 30 days

**Monthly Automated Tasks:**
- Delete analytics data older than 2 years
- Delete support tickets older than 1 year (after closure)
- Process account deletions past grace period

**Annual Automated Tasks:**
- Delete payment records older than 7 years
- Delete legal consent records older than 3 years (after account deletion)

### Manual Deletion

**User-Initiated:**
- Account deletion requests (30-day grace period)
- Chat history deletion (immediate)
- Data export requests (deleted after delivery)

**Admin-Initiated:**
- Inactive account cleanup (after 5 years + notification)
- Legal compliance deletions
- Security incident data (after investigation)

### Secure Deletion Methods

**Database Records:**
- Hard delete from production database
- Overwrite in backups (after backup retention period)
- Verify deletion with audit queries

**File Storage:**
- Secure file deletion (overwrite)
- Remove from all storage locations
- Verify deletion with storage audits

**Third-Party Systems:**
- Request deletion from Stripe (payment data)
- Request deletion from AI providers (if applicable)
- Verify deletion with third-party confirmation

**Anonymization:**
- Replace user IDs with anonymous identifiers
- Remove or hash IP addresses
- Remove personal identifiers
- Retain only aggregated statistics

---

## Legal Retention Requirements

### Romanian Law

**Tax Records:** 7 years
- Payment transactions
- Invoices
- Subscription records

**Accounting Records:** 7 years
- Financial transactions
- Revenue records

**Employment Records:** N/A (no employees in scope)

### GDPR Requirements

**Consent Records:** Reasonable period to prove compliance (3 years recommended)
**Data Breach Records:** Indefinite (for compliance proof)
**Data Processing Records:** Indefinite (Article 30 requirement)

### Stripe Requirements

**Payment Records:** 7 years (PCI-DSS compliance)
**Dispute Records:** Until dispute resolution + 1 year

---

## User Rights and Retention

### Right to Erasure (Article 17)

Users can request deletion of their data at any time, subject to legal retention requirements.

**Immediate Deletion:**
- Profile information
- Chat history
- Progress data
- Privacy preferences

**Delayed Deletion:**
- Payment records (7 years)
- Legal consents (3 years)
- Backup data (30 days)

**Cannot Be Deleted:**
- Data required for legal compliance
- Data in legal proceedings
- Anonymized aggregated data

### Right to Data Portability (Article 20)

Users can export their data at any time. Exported data includes all personal data within retention period.

---

## Exceptions to Retention Periods

### Legal Proceedings

Data may be retained beyond normal retention periods if:
- Subject to legal hold
- Required for litigation
- Requested by law enforcement
- Part of regulatory investigation

**Process:**
1. Legal team issues data retention notice
2. Automated deletion suspended for affected data
3. Data retained until legal matter resolved
4. Normal retention resumes after legal hold lifted

### Security Incidents

Data related to security incidents may be retained for:
- Investigation purposes
- Evidence preservation
- Compliance reporting
- Future prevention

**Retention Period:** 1 year after incident resolution

### Regulatory Requests

Data may be retained to comply with:
- Data protection authority requests
- Tax authority audits
- Consumer protection investigations
- Other regulatory requirements

---

## Monitoring and Compliance

### Audit Schedule

**Monthly:**
- Review deletion logs
- Verify automated deletion tasks
- Check retention period compliance

**Quarterly:**
- Audit data retention practices
- Review retention policy effectiveness
- Update retention periods if needed

**Annually:**
- Comprehensive data retention audit
- Legal compliance review
- Policy update and approval

### Metrics Tracked

- Number of records deleted (by category)
- Average retention period (by category)
- Deletion request processing time
- Backup retention compliance
- Legal retention compliance

### Reporting

**Internal Reports:**
- Monthly deletion summary
- Quarterly compliance report
- Annual audit report

**External Reports:**
- Data protection authority (if requested)
- Legal counsel (as needed)
- Auditors (as needed)

---

## Policy Updates

This policy is reviewed annually and updated as needed to reflect:
- Changes in legal requirements
- Changes in business practices
- Changes in data processing activities
- Feedback from audits and reviews

**Update Process:**
1. Draft policy changes
2. Legal review
3. Management approval
4. User notification (if material changes)
5. Implementation
6. Training and communication

---

## Contact Information

### Data Retention Inquiries
- Email: privacy@growthovo.app
- Response time: 30 days

### Data Deletion Requests
- In-app: Settings > Data Management > Delete My Account
- Email: privacy@growthovo.app
- Response time: Immediate (30-day grace period)

### Legal Inquiries
- Email: legal@growthovo.app
- Response time: 5 business days

---

## Appendix: Retention Period Summary Table

| Data Category | Retention Period | Legal Basis | Can User Delete? |
|---------------|------------------|-------------|------------------|
| Profile Information | Until deletion + 30 days | Contract | Yes |
| Chat History | Until deletion + 30 days | Contract | Yes |
| Progress Data | Until deletion + 30 days | Contract | Yes |
| Payment Records | 7 years | Legal obligation | No |
| Legal Consents | 3 years after deletion | Legal obligation | No |
| Privacy Preferences | Until deletion + 30 days | Consent | Yes |
| Export Requests | 3 years | Legal obligation | No |
| Deletion Requests | 3 years | Legal obligation | No |
| System Logs | 90 days | Legitimate interest | No |
| Analytics Data | 2 years (anonymized) | Legitimate interest | No |
| Backups | 30 days | Legitimate interest | No |
| Support Tickets | 1 year after closure | Legitimate interest | Yes |
| Marketing Data | Until unsubscribe | Consent | Yes |

---

**Document Version:** 1.0
**Approved By:** [Management]
**Approval Date:** January 15, 2025
**Next Review Date:** January 15, 2026
