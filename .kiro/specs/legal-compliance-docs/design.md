# Design Document: Legal Compliance Documentation

## Overview

The Legal Compliance Documentation system provides comprehensive legal protection for the Growthovo mobile application through a suite of user-friendly legal documents and in-app notices. The system addresses GDPR compliance, EU consumer protection laws, AI transparency requirements, and crisis safety considerations while maintaining accessible language suitable for a startup MVP.

The design focuses on three key aspects:
1. **Document Generation**: Creating complete, legally sound documents that are ready to deploy
2. **In-App Integration**: Defining clear placement and presentation of legal notices at critical touchpoints
3. **User Rights Management**: Implementing mechanisms for users to exercise their GDPR rights

This is primarily a documentation and content design specification rather than a software implementation, though it includes requirements for how legal content should be integrated into the existing Growthovo application.

## Architecture

### Document Structure

The legal documentation system consists of three layers:

1. **Standalone Legal Documents**: Complete documents accessible via web URLs or in-app viewers
   - Privacy Policy
   - Terms and Conditions
   - Cookie Policy

2. **In-App Notices**: Contextual legal notices displayed at specific interaction points
   - AI Transparency Notice (before first Rex interaction)
   - Crisis Disclaimer (on panic/help button)
   - Subscription Terms (at paywall)
   - Age Verification (at signup)

3. **User Rights Interface**: Settings screen sections enabling GDPR rights
   - Data export functionality
   - Account deletion flow
   - Privacy preferences management

### Integration Points

Legal content integrates with existing Growthovo screens:

```
SignUpScreen
├── Age verification checkbox
├── Terms acceptance checkbox
└── Privacy Policy link

SettingsScreen
├── Legal Documents section
│   ├── Privacy Policy
│   ├── Terms and Conditions
│   └── Cookie Policy
├── Data Management section
│   ├── Export my data
│   ├── Delete my account
│   └── Privacy preferences
└── About section
    └── Version and effective dates

PaywallScreen
├── Subscription terms link
└── Refund policy summary

RexChatBottomSheet (first use)
├── AI Transparency Notice modal
└── Disclaimer acknowledgment

SOSService (panic/help button)
├── Crisis Disclaimer banner
└── Emergency resources list
```

### Data Flow

```
User Action → Legal Notice Display → User Acknowledgment → Logged Consent
                                                              ↓
                                                    Stored in Supabase
                                                    (user_legal_consents table)
```

## Components and Interfaces

### 1. Legal Document Templates

Each legal document follows a consistent structure:

**Document Header**
- Document title
- Effective date
- Last updated date
- Version number

**Document Body**
- Numbered sections with clear headings
- Plain language explanations
- Specific details relevant to Growthovo
- Contact information

**Document Footer**
- Links to related documents
- Language selector (for multi-language support)

### 2. Privacy Policy Component

**Structure:**
```
1. Introduction
   - What this policy covers
   - Who we are (Data Controller information)

2. Data We Collect
   - Account information (email, age verification)
   - Chat messages with Rex
   - Behavioral data (task completion, check-ins)
   - Usage analytics
   - Subscription and payment information

3. How We Use Your Data
   - Personalize AI coaching responses
   - Track progress and provide insights
   - Process payments
   - Improve the service
   - Legal basis for each purpose (GDPR Article 6)

4. Data Sharing and Third Parties
   - AI API providers (OpenAI, Anthropic, etc.)
   - Supabase (database hosting)
   - Stripe (payment processing)
   - Analytics services
   - No selling of personal data

5. Data Storage and Security
   - Encryption in transit and at rest
   - Access controls
   - Regular security audits
   - Data retention periods

6. Your Rights Under GDPR
   - Right to access
   - Right to rectification
   - Right to erasure ("right to be forgotten")
   - Right to data portability
   - Right to object
   - Right to withdraw consent
   - How to exercise each right

7. International Data Transfers
   - Where data is stored (EU/US)
   - Safeguards for international transfers
   - Standard contractual clauses

8. Children's Privacy
   - Minimum age requirement (13+)
   - Parental consent procedures if applicable

9. Changes to This Policy
   - How users will be notified
   - Effective date of changes

10. Contact Information
    - Email for privacy inquiries
    - Data Protection Officer contact (if applicable)
    - Mailing address
```

### 3. Terms and Conditions Component

**Structure:**
```
1. Acceptance of Terms
   - Agreement to be bound by terms
   - Capacity to enter agreement

2. Description of Service
   - Daily self-improvement tasks
   - AI coaching with Rex
   - Evening check-ins
   - Panic/help button features
   - Subscription features

3. User Accounts
   - Registration requirements
   - Account security responsibilities
   - Account termination

4. User Responsibilities
   - Accurate information
   - Appropriate use of AI coach
   - Compliance with laws
   - Respect for intellectual property

5. Acceptable Use Policy
   - Prohibited activities
   - Content restrictions
   - Consequences of violations

6. Subscription and Payments
   - Subscription tiers
   - Billing terms
   - Auto-renewal
   - Cancellation
   - Refunds (reference separate Subscription Terms)

7. Intellectual Property
   - Growthovo owns the app and content
   - User owns their personal data
   - License to use the service

8. Disclaimers and Limitations of Liability
   - Service provided "as is"
   - No warranties
   - Limitation of damages
   - Indemnification

9. Termination
   - User's right to terminate
   - Growthovo's right to terminate
   - Effect of termination on data

10. Dispute Resolution
    - Governing law
    - Jurisdiction
    - Arbitration clause (if applicable)

11. Changes to Terms
    - Right to modify
    - Notice of changes
    - Continued use constitutes acceptance

12. Miscellaneous
    - Severability
    - Entire agreement
    - Contact information
```

### 4. Disclaimers Component

**Medical/Professional Disclaimer:**
```
IMPORTANT DISCLAIMER

Growthovo is a self-improvement tool and is NOT a substitute for professional 
medical, psychological, or financial advice, diagnosis, or treatment.

Rex, our AI coach, is an artificial intelligence system designed to provide 
motivational support and general guidance. Rex:
- Cannot diagnose medical or mental health conditions
- Cannot provide therapy or clinical treatment
- Cannot offer professional financial advice
- May provide inaccurate or inappropriate responses
- Should not be relied upon for critical decisions

If you are experiencing a medical emergency, mental health crisis, or 
thoughts of self-harm, please:
- Call emergency services (112 in EU, 911 in US)
- Contact a mental health crisis helpline
- Seek immediate professional help

Always consult qualified professionals for:
- Medical conditions and symptoms
- Mental health concerns
- Financial planning and investment decisions
- Legal matters

By using Growthovo, you acknowledge that you are responsible for your own 
decisions and actions. Growthovo and its creators are not liable for any 
consequences resulting from your use of the app or reliance on AI-generated 
content.
```

### 5. AI Transparency Notice Component

**Display:** Modal dialog on first Rex interaction

**Content:**
```
Meet Rex: Your AI Coach

Before we begin, here's what you should know:

🤖 Rex is Artificial Intelligence
Rex is powered by advanced AI technology, not a human coach. While Rex can 
provide helpful guidance and support, AI has limitations.

💡 What Rex Can Do:
- Remember your past conversations and progress
- Provide personalized motivation and suggestions
- Help you reflect on your goals and challenges
- Offer strategies for self-improvement

⚠️ What Rex Cannot Do:
- Replace professional therapy or medical advice
- Guarantee accurate responses in all situations
- Understand complex emotional nuances like a human
- Provide emergency crisis intervention

🔒 Your Privacy:
Your conversations with Rex are stored securely to personalize your 
experience. See our Privacy Policy for details.

🆘 In Crisis?
If you're in distress, please contact emergency services or a crisis 
helpline. Rex is not equipped for emergency situations.

By continuing, you acknowledge that you understand Rex is an AI system 
with limitations.

[I Understand] [Learn More]
```

### 6. Age Verification Component

**Display:** Checkbox on signup screen

**Content:**
```
☐ I confirm that I am at least 13 years old

Growthovo requires users to be at least 13 years of age. If you are under 13, 
please do not use this app. If you are between 13 and 18, please ensure you 
have parental permission to use Growthovo.

[Why do we have age restrictions?]
```

### 7. Data Deletion Instructions Component

**Location:** Settings > Data Management > Delete My Account

**Content:**
```
Delete My Account

Deleting your account will permanently remove:
✓ Your profile and account information
✓ All chat history with Rex
✓ Your progress data and completed tasks
✓ Subscription information (active subscriptions will be cancelled)

What happens to my data?
- Most data is deleted immediately
- Some data may be retained for up to 30 days for backup purposes
- Certain data may be retained longer for legal compliance (e.g., payment 
  records for tax purposes)

Before you delete:
- Consider exporting your data first (see "Export My Data" above)
- Cancel any active subscriptions to avoid future charges
- This action cannot be undone

[Export My Data First] [Cancel] [Delete My Account]
```

### 8. Crisis Disclaimer Component

**Display:** Banner at top of panic/help button screen

**Content:**
```
⚠️ IMPORTANT: Growthovo is not an emergency service

If you are in immediate danger or experiencing a mental health emergency:

🚨 Emergency Services: 112 (EU) / 911 (US)

🆘 Crisis Helplines:
- [Country-specific crisis line]
- [Mental health hotline]
- [Suicide prevention line]

Rex can provide support, but cannot replace professional help in a crisis.

[I Understand - Continue to Rex] [View More Resources]
```

### 9. Subscription Terms Component

**Display:** Link on PaywallScreen, full terms in modal

**Content:**
```
Subscription Terms

Pricing and Billing:
- [Monthly Plan]: €X.XX per month
- [Annual Plan]: €X.XX per year (save X%)
- Prices include applicable VAT
- Billed through Stripe payment processing

Auto-Renewal:
Your subscription automatically renews at the end of each billing period 
unless cancelled at least 24 hours before renewal. You will be charged the 
then-current subscription price.

Cancellation:
- Cancel anytime from Settings > Subscription
- Access continues until end of current billing period
- No refunds for partial periods

Refund Policy:
- 14-day money-back guarantee for first-time subscribers (EU consumer right)
- Request refunds within 14 days of initial purchase
- Contact support@growthovo.app for refund requests
- Refunds processed within 5-10 business days

What You Get:
- Unlimited access to Rex AI coach
- All premium features and content
- Priority support
- Ad-free experience

After Cancellation:
- Your data remains accessible
- You can resubscribe anytime
- Free tier features remain available

Payment Processing:
Payments are securely processed by Stripe. Growthovo does not store your 
payment card details.

Questions?
Contact support@growthovo.app or visit our Help Center.
```

### 10. Cookie Notice Component

**Display:** Banner on first app launch (if web version) or in settings

**Content:**
```
Cookie and Tracking Notice

Growthovo uses cookies and similar technologies to provide and improve our 
service.

Essential Cookies (Always Active):
- Authentication and security
- Remember your preferences
- Enable core app functionality

Analytics Cookies (Optional):
- Understand how you use the app
- Identify bugs and issues
- Improve user experience

You can manage your cookie preferences in Settings > Privacy.

For more information, see our Privacy Policy.

[Accept All] [Essential Only] [Customize]
```

## Data Models

### Legal Consent Tracking

```typescript
interface LegalConsent {
  id: string;
  user_id: string;
  document_type: 'privacy_policy' | 'terms_conditions' | 'ai_transparency' | 
                 'crisis_disclaimer' | 'subscription_terms' | 'age_verification';
  document_version: string;
  consented_at: timestamp;
  ip_address: string; // For legal record
  user_agent: string; // Device/browser info
  consent_method: 'explicit_checkbox' | 'click_through' | 'passive_display';
}
```

### Document Version Tracking

```typescript
interface LegalDocumentVersion {
  id: string;
  document_type: string;
  version: string;
  effective_date: date;
  content: text; // Full document content
  language: string; // 'en', 'de', 'fr', etc.
  is_current: boolean;
  change_summary: string; // What changed in this version
}
```

### User Privacy Preferences

```typescript
interface PrivacyPreferences {
  user_id: string;
  analytics_enabled: boolean;
  marketing_emails_enabled: boolean;
  data_sharing_consent: boolean;
  last_updated: timestamp;
}
```

## Correctness Properties

