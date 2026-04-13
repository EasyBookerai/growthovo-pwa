# Implementation Tasks: Legal Compliance Documentation

## Task 1: Create Legal Document Content Files

Create all legal document content as markdown files that can be displayed in-app or hosted on a website.

### Subtasks

- [x] 1.1 Create Privacy Policy document (GDPR-compliant)
  - Include all data collection categories
  - Document third-party processors (AI APIs, Supabase, Stripe)
  - Explain data retention periods
  - List all GDPR user rights with exercise instructions
  - Add contact information section
  - Use clear, non-legalistic language

- [x] 1.2 Create Terms and Conditions document
  - Describe Growthovo service and features
  - Define user responsibilities and acceptable use
  - Specify limitation of liability
  - Include termination rights
  - Add intellectual property section
  - Specify governing law (Romanian/EU)

- [x] 1.3 Create Medical/Professional Disclaimer document
  - State explicitly: not medical/psychological/financial advice
  - Explain AI limitations and potential inaccuracies
  - Emphasize user responsibility for decisions
  - Recommend professional consultation when needed

- [x] 1.4 Create Subscription Terms document
  - Detail subscription tiers and pricing
  - Explain billing cycle and auto-renewal
  - Provide cancellation instructions
  - Define refund policy (14-day EU consumer right)
  - Identify Stripe as payment processor

- [x] 1.5 Create Cookie Policy document
  - List all cookies and tracking technologies
  - Explain purpose of each
  - Distinguish essential vs. non-essential
  - Provide cookie management instructions

## Task 2: Create In-App Legal Notice Components

Create reusable React Native components for displaying legal notices at critical touchpoints.

### Subtasks

- [x] 2.1 Create AITransparencyNotice component
  - Modal dialog design
  - Clear explanation that Rex is AI
  - List capabilities and limitations
  - "I Understand" acknowledgment button
  - Store consent in database

- [x] 2.2 Create CrisisDisclaimerBanner component
  - Prominent warning banner
  - Emergency contact numbers (EU: 112, Romania-specific helplines)
  - "Not an emergency service" message
  - Link to more crisis resources

- [x] 2.3 Create AgeVerificationCheckbox component
  - Checkbox for 13+ age confirmation
  - Explanation of age requirement
  - Link to why age restrictions exist

- [x] 2.4 Create SubscriptionTermsModal component
  - Display full subscription terms
  - Pricing and billing information
  - Cancellation and refund policy
  - Link to full Terms and Conditions

- [x] 2.5 Create CookieConsentBanner component
  - Banner for first app launch
  - "Accept All" / "Essential Only" / "Customize" options
  - Link to full Cookie Policy

## Task 3: Integrate Legal Notices into Existing Screens

Add legal notice components to appropriate screens in the Growthovo app.

### Subtasks

- [x] 3.1 Update SignUpScreen with legal elements
  - Add age verification checkbox
  - Add Terms acceptance checkbox with link
  - Add Privacy Policy link
  - Require both checkboxes before signup
  - Log consent with timestamp

- [x] 3.2 Update SettingsScreen with legal section
  - Add "Legal Documents" section
  - Link to Privacy Policy viewer
  - Link to Terms and Conditions viewer
  - Link to Cookie Policy viewer
  - Display current version numbers and effective dates

- [x] 3.3 Update PaywallScreen with subscription terms
  - Add "Subscription Terms" link above purchase button
  - Display refund policy summary
  - Show pricing with VAT included

- [x] 3.4 Update RexChatBottomSheet for first-time users
  - Detect first Rex interaction
  - Display AITransparencyNotice modal
  - Require acknowledgment before chat begins
  - Store consent in database

- [x] 3.5 Update SOSBottomSheet with crisis disclaimer
  - Display CrisisDisclaimerBanner at top
  - Add emergency contact numbers for Romania/EU
  - Include mental health crisis helplines
  - Keep banner visible during interaction

- [x] 3.6 Add legal footer to main navigation
  - Add "About" or "Legal" section
  - Links to all legal documents
  - App version and document effective dates

## Task 4: Implement Data Management Features

Create functionality for users to exercise their GDPR rights.

### Subtasks

- [x] 4.1 Create data export functionality
  - Add "Export My Data" button in Settings
  - Generate JSON export of user data (profile, chat history, progress)
  - Include all personal data categories
  - Provide download link or email delivery
  - Log export requests

- [x] 4.2 Create account deletion flow
  - Add "Delete My Account" section in Settings
  - Display clear warning about data deletion
  - Show what will be deleted vs. retained
  - Require confirmation (type "DELETE" or similar)
  - Cancel active subscriptions
  - Implement soft delete with 30-day grace period
  - Send confirmation email

- [x] 4.3 Create privacy preferences management
  - Add "Privacy Preferences" section in Settings
  - Toggle for analytics data collection
  - Toggle for marketing emails
  - Toggle for data sharing with partners (if applicable)
  - Save preferences to database

## Task 5: Create Database Schema for Legal Compliance

Add database tables to track legal consents and document versions.

### Subtasks

- [x] 5.1 Create user_legal_consents table
  - Fields: id, user_id, document_type, document_version, consented_at, ip_address, user_agent, consent_method
  - Index on user_id and document_type
  - RLS policies for user access

- [x] 5.2 Create legal_document_versions table
  - Fields: id, document_type, version, effective_date, content, language, is_current, change_summary
  - Track all document versions
  - Support multi-language versions

- [x] 5.3 Create user_privacy_preferences table
  - Fields: user_id, analytics_enabled, marketing_emails_enabled, data_sharing_consent, last_updated
  - RLS policies for user access

- [x] 5.4 Create migration script
  - SQL migration file for all new tables
  - Seed initial document versions
  - Set up RLS policies

## Task 6: Create Legal Document Viewer Component

Build a reusable component for displaying legal documents within the app.

### Subtasks

- [x] 6.1 Create LegalDocumentViewer component
  - Accept document type as prop
  - Fetch document content from database or local files
  - Render markdown content
  - Display version number and effective date
  - Support scrolling for long documents
  - Add "Accept" button where needed

- [x] 6.2 Add document navigation
  - Table of contents for long documents
  - Jump to section functionality
  - Back button to return to previous screen

## Task 7: Implement Legal Consent Logging

Create service functions to log user consent for legal documents.

### Subtasks

- [x] 7.1 Create legalConsentService.ts
  - Function: logConsent(userId, documentType, version, method)
  - Function: getUserConsents(userId)
  - Function: hasUserConsented(userId, documentType, minVersion)
  - Store IP address and user agent for legal record

- [x] 7.2 Integrate consent logging into signup flow
  - Log Terms acceptance
  - Log Privacy Policy acceptance
  - Log age verification

- [x] 7.3 Integrate consent logging into feature flows
  - Log AI transparency notice acknowledgment
  - Log crisis disclaimer view
  - Log subscription terms acceptance

## Task 8: Create Legal Document Update Notification System

Implement system to notify users when legal documents are updated.

### Subtasks

- [x] 8.1 Create document version check function
  - Compare user's last consented version with current version
  - Identify users who need to review updates

- [x] 8.2 Create update notification UI
  - Modal or banner for material changes
  - Display change summary
  - Link to full updated document
  - Require acknowledgment for Terms updates

- [x] 8.3 Create notification service integration
  - Send push notification for important legal updates
  - Send email notification with update summary

## Task 9: Add Multi-Language Support for Legal Documents

Translate legal documents into supported languages.

### Subtasks

- [x] 9.1 Translate Privacy Policy
  - English (primary)
  - Romanian (required for Romanian users)
  - German, French, Italian, Spanish, Portuguese, Dutch (if app supports)

- [x] 9.2 Translate Terms and Conditions
  - All supported languages
  - Ensure legal accuracy in translations

- [x] 9.3 Translate in-app legal notices
  - Add translations to i18n files
  - AI Transparency Notice
  - Crisis Disclaimer
  - Age Verification text
  - Subscription Terms

- [x] 9.4 Implement language fallback
  - Display English version if translation unavailable
  - Show notice: "This document is not available in your language. English version is displayed."

## Task 10: Create Implementation Checklist Document

Create a comprehensive checklist for developers to ensure all legal requirements are met.

### Subtasks

- [x] 10.1 Create LEGAL_IMPLEMENTATION_CHECKLIST.md
  - List all screens requiring legal text
  - Specify exact placement for each legal element
  - Indicate which require explicit acceptance vs. passive display
  - Include testing checklist
  - Add compliance verification steps

- [x] 10.2 Document legal text placement requirements
  - SignUpScreen: Age verification, Terms checkbox, Privacy link
  - SettingsScreen: Legal documents section, data management
  - PaywallScreen: Subscription terms link
  - RexChatBottomSheet: AI transparency notice (first use)
  - SOSBottomSheet: Crisis disclaimer banner
  - App footer: Links to all legal documents

## Task 11: Testing and Validation

Test all legal compliance features to ensure proper functionality.

### Subtasks

- [x] 11.1 Test legal document display
  - Verify all documents render correctly
  - Check version numbers and dates display
  - Test document viewer scrolling and navigation

- [x] 11.2 Test consent logging
  - Verify consents are stored in database
  - Check IP address and user agent capture
  - Validate timestamp accuracy

- [x] 11.3 Test data export functionality
  - Export data for test user
  - Verify all data categories included
  - Check JSON format validity

- [x] 11.4 Test account deletion flow
  - Complete deletion process
  - Verify data is removed
  - Check subscription cancellation
  - Validate grace period functionality

- [x] 11.5 Test legal notice display timing
  - AI transparency notice on first Rex use
  - Crisis disclaimer on SOS button
  - Age verification on signup
  - Subscription terms before purchase

- [x] 11.6 Test multi-language legal documents
  - Switch app language
  - Verify correct language document displays
  - Test fallback to English

## Task 12: Create Romanian-Specific Legal Content

Ensure compliance with Romanian law and provide Romanian language versions.

### Subtasks

- [x] 12.1 Add Romanian emergency contacts
  - Emergency services: 112
  - Mental health crisis line: 0800 801 200 (Telefonul Sufletului)
  - Suicide prevention: 116 123
  - Add to Crisis Disclaimer

- [x] 12.2 Specify Romanian jurisdiction in Terms
  - Governing law: Romanian law
  - Jurisdiction: Romanian courts
  - EU consumer protection laws apply

- [ ]* 12.3 Add Romanian company information
  - Company name and registration number
  - Registered address in Romania
  - VAT number
  - Contact email and phone

- [x] 12.4 Ensure Romanian GDPR compliance
  - Reference Romanian Data Protection Authority (ANSPDCP)
  - Provide contact for data protection inquiries
  - Explain rights under Romanian implementation of GDPR

## Task 13: Create Legal Document Hosting Solution

Set up hosting for legal documents accessible via web URLs.

### Subtasks

- [ ] 13.1 Create legal documents web pages
  - Set up simple website or use Supabase storage
  - Create HTML versions of legal documents
  - Ensure mobile-responsive design
  - Add version numbers and effective dates

- [ ] 13.2 Configure URLs for legal documents
  - https://growthovo.app/privacy-policy
  - https://growthovo.app/terms-and-conditions
  - https://growthovo.app/cookie-policy
  - https://growthovo.app/subscription-terms

- [ ] 13.3 Link in-app viewers to web URLs
  - Allow users to open in browser
  - Provide shareable links
  - Ensure consistency between in-app and web versions

## Task 14: Documentation and Developer Guide

Create documentation for maintaining legal compliance.

### Subtasks

- [x] 14.1 Create LEGAL_COMPLIANCE_GUIDE.md
  - Overview of legal requirements
  - How to update legal documents
  - How to add new consent types
  - How to handle user data requests
  - Compliance checklist for new features

- [x] 14.2 Document data retention policies
  - Specify retention period for each data type
  - Document deletion procedures
  - Explain legal retention requirements

- [x] 14.3 Create runbook for data subject requests
  - How to handle access requests
  - How to process deletion requests
  - How to provide data exports
  - Response time requirements (30 days under GDPR)

## Task 15: Final Review and Launch Preparation

Conduct final review before deploying legal compliance features.

### Subtasks

- [ ] 15.1 Legal review (if possible)
  - Have documents reviewed by legal professional
  - Verify GDPR compliance
  - Check Romanian law compliance
  - Validate EU consumer protection compliance

- [ ] 15.2 Stakeholder review
  - Review with product team
  - Review with development team
  - Ensure all requirements met

- [ ] 15.3 Create deployment plan
  - Plan for rolling out legal features
  - Communicate changes to existing users
  - Prepare support team for legal questions

- [ ] 15.4 Prepare user communication
  - Email to existing users about new legal documents
  - In-app announcement
  - FAQ for common legal questions
