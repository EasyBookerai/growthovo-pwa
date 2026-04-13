# Legal Components

This directory contains React Native components for displaying legal documents and notices in the Growthovo app.

## Components

### LegalDocumentViewer

A reusable component for displaying legal documents with markdown rendering, table of contents, and navigation.

**Features:**
- Markdown content rendering with headers, bold text, and bullet points
- Collapsible table of contents for easy navigation
- Jump to section functionality
- Version number and effective date display
- Optional accept button
- Back button navigation
- Scrollable content for long documents

**Usage:**

```tsx
import { LegalDocumentViewer } from '../../components/legal';

// Basic usage
<LegalDocumentViewer
  documentType="privacy_policy"
  onBack={() => navigation.goBack()}
/>

// With accept button
<LegalDocumentViewer
  documentType="terms_conditions"
  onBack={() => navigation.goBack()}
  onAccept={handleAccept}
  showAcceptButton={true}
/>

// Without table of contents
<LegalDocumentViewer
  documentType="cookie_policy"
  onBack={() => navigation.goBack()}
  showTableOfContents={false}
/>
```

**Props:**

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `documentType` | `DocumentType` | Yes | - | Type of legal document to display |
| `onBack` | `() => void` | No | - | Callback when back button is pressed |
| `onAccept` | `() => void` | No | - | Callback when accept button is pressed |
| `showAcceptButton` | `boolean` | No | `false` | Whether to show the accept button |
| `showTableOfContents` | `boolean` | No | `true` | Whether to show table of contents |

**Document Types:**

- `privacy_policy` - Privacy Policy
- `terms_conditions` - Terms and Conditions
- `cookie_policy` - Cookie Policy
- `subscription_terms` - Subscription Terms
- `ai_transparency` - AI Transparency Notice
- `crisis_disclaimer` - Crisis Disclaimer
- `age_verification` - Age Verification

### AITransparencyNotice

Modal displayed before first Rex interaction to inform users that Rex is AI.

**Usage:**

```tsx
import { AITransparencyNotice } from '../../components/legal';

<AITransparencyNotice
  visible={showNotice}
  onAccept={handleAccept}
  onLearnMore={handleLearnMore}
/>
```

### CrisisDisclaimerBanner

Banner displayed on SOS/panic button screens with emergency contact information.

**Usage:**

```tsx
import { CrisisDisclaimerBanner } from '../../components/legal';

<CrisisDisclaimerBanner
  onViewResources={handleViewResources}
/>
```

### AgeVerificationCheckbox

Checkbox for age verification during signup.

**Usage:**

```tsx
import { AgeVerificationCheckbox } from '../../components/legal';

<AgeVerificationCheckbox
  checked={ageVerified}
  onToggle={setAgeVerified}
  onLearnMore={handleLearnMore}
/>
```

### SubscriptionTermsModal

Modal displaying subscription terms before purchase.

**Usage:**

```tsx
import { SubscriptionTermsModal } from '../../components/legal';

<SubscriptionTermsModal
  visible={showTerms}
  onClose={handleClose}
  onViewFullTerms={handleViewFullTerms}
/>
```

### CookieConsentBanner

Banner for cookie consent on first app launch.

**Usage:**

```tsx
import { CookieConsentBanner } from '../../components/legal';

<CookieConsentBanner
  visible={showBanner}
  onAcceptAll={handleAcceptAll}
  onEssentialOnly={handleEssentialOnly}
  onCustomize={handleCustomize}
/>
```

## Integration Example

See `growthovo/src/screens/legal/LegalDocumentsScreen.tsx` for a complete example of how to integrate the LegalDocumentViewer into a screen.

## Translations

All legal components use i18next for translations. Translation keys are under the `legal` namespace:

- `legal.aiNotice.*` - AI Transparency Notice
- `legal.crisisDisclaimer.*` - Crisis Disclaimer
- `legal.ageVerification.*` - Age Verification
- `legal.subscriptionTerms.*` - Subscription Terms
- `legal.cookieConsent.*` - Cookie Consent
- `legal.viewer.*` - Document Viewer
- `legal.documents.*` - Legal Documents Screen

## Testing

Tests are located in `__tests__/legalComponents.test.tsx`. Run tests with:

```bash
npm test -- legalComponents
```

## Requirements

These components fulfill the following requirements from the legal-compliance-docs spec:

- **Task 2**: Create In-App Legal Notice Components
- **Task 6**: Create Legal Document Viewer Component
- **Requirement 4**: AI Transparency Notice
- **Requirement 7**: Crisis and Safety Disclaimer
- **Requirement 8**: Subscription Terms and Billing
- **Requirement 9**: Cookie and Tracking Notice

## Notes

- Document content is currently loaded from placeholder functions. In production, these should be:
  1. Bundled with the app using `require()` for offline access
  2. Fetched from a CDN or API for easy updates
  3. Stored in Supabase storage with versioning

- The markdown renderer is basic and supports:
  - Headers (# to ######)
  - Bold text (**text**)
  - Bullet points (- or *)
  - Regular paragraphs

- For more complex markdown features, consider integrating a library like `react-native-markdown-display`
