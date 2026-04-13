# Legal Document Update Notifications

This document explains how to use the legal document update notification system in the Growthovo app.

## Overview

The legal document update notification system automatically detects when legal documents (Privacy Policy, Terms & Conditions, etc.) have been updated and notifies users to review the changes. For Terms & Conditions updates, users must explicitly acknowledge the changes before continuing to use the app.

## Components

### 1. LegalDocumentUpdateNotification

A full-screen modal that displays detailed information about document updates.

**Features:**
- Shows all updated documents with version numbers
- Displays change summaries for each document
- Provides "View Document" button to read full document
- Requires acknowledgment for Terms & Conditions updates
- Can be dismissed for non-critical updates

**Usage:**
```tsx
import { LegalDocumentUpdateNotification } from '../components/legal';

<LegalDocumentUpdateNotification
  visible={showModal}
  updates={documentUpdates}
  onViewDocument={(docType) => {
    // Navigate to document viewer
    navigation.navigate('LegalDocument', { type: docType });
  }}
  onAcknowledge={(docType) => {
    // Log user acknowledgment
    handleAcknowledge(docType);
  }}
  onDismiss={() => {
    // Only available for non-Terms updates
    setShowModal(false);
  }}
/>
```

### 2. LegalDocumentUpdateBanner

A compact banner that slides in from the top of the screen.

**Features:**
- Less intrusive than the modal
- Shows update count
- Tappable to view details
- Can be dismissed (unless Terms update)
- Animated slide-in effect

**Usage:**
```tsx
import { LegalDocumentUpdateBanner } from '../components/legal';

<LegalDocumentUpdateBanner
  visible={showBanner}
  updateCount={updates.length}
  onPress={() => {
    // Show full modal or navigate to updates screen
    setShowModal(true);
  }}
  onDismiss={() => {
    // Dismiss banner (if allowed)
    dismissBanner();
  }}
/>
```

### 3. LegalDocumentUpdateManager

A convenience component that manages the entire update notification flow.

**Features:**
- Automatically checks for updates
- Manages notification state
- Handles acknowledgments
- Integrates document viewer
- Supports both modal and banner modes

**Usage:**
```tsx
import { LegalDocumentUpdateManager } from '../components/legal';

// In App.tsx or main navigation component
function App() {
  return (
    <>
      <NavigationContainer>
        {/* Your app navigation */}
      </NavigationContainer>
      
      {/* Add this at the root level */}
      <LegalDocumentUpdateManager 
        mode="modal"  // or "banner"
        autoShow={true}
      />
    </>
  );
}
```

## Hook: useLegalDocumentUpdates

A React hook that provides all the functionality for managing legal document updates.

**Features:**
- Checks for document updates on mount
- Tracks which updates have been dismissed
- Prevents dismissal of required updates (Terms)
- Handles acknowledgment logging
- Provides loading and error states

**Usage:**
```tsx
import { useLegalDocumentUpdates } from '../hooks/useLegalDocumentUpdates';

function MyComponent() {
  const {
    updates,              // Array of documents needing review
    hasUpdates,           // Boolean: any updates available
    hasRequiredUpdates,   // Boolean: Terms update present
    isLoading,            // Boolean: checking for updates
    error,                // String | null: error message
    checkForUpdates,      // Function: manually check for updates
    acknowledgeUpdate,    // Function: log user acknowledgment
    dismissNotification,  // Function: dismiss notification
    showNotification,     // Boolean: should show notification
  } = useLegalDocumentUpdates();

  // Use the values in your component
  return (
    <View>
      {hasUpdates && (
        <Text>You have {updates.length} document(s) to review</Text>
      )}
    </View>
  );
}
```

## Integration Guide

### Step 1: Add to App Root

Add the `LegalDocumentUpdateManager` to your app's root component:

```tsx
// App.tsx
import { LegalDocumentUpdateManager } from './src/components/legal';

export default function App() {
  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      
      {/* Add this - it will automatically show when updates are available */}
      <LegalDocumentUpdateManager mode="modal" autoShow={true} />
    </>
  );
}
```

### Step 2: Update Translations

Ensure your translation files include the necessary keys:

```json
{
  "legal": {
    "updateNotification": {
      "title": "Legal Documents Updated",
      "subtitleRequired": "Please review and acknowledge the changes to continue.",
      "subtitleOptional": "Please review the changes when you have a moment.",
      "version": "Version {{version}}",
      "whatsNew": "What's New:",
      "viewDocument": "View Document",
      "acknowledge": "I Acknowledge",
      "requirementNotice": "You must acknowledge the Terms & Conditions update.",
      "dismiss": "I'll Review Later"
    },
    "updateBanner": {
      "title": "Legal Documents Updated",
      "subtitle": "{{count}} document updated",
      "subtitle_plural": "{{count}} documents updated",
      "accessibilityLabel": "View legal document updates",
      "dismiss": "Dismiss notification"
    },
    "documents": {
      "privacyPolicy": "Privacy Policy",
      "termsConditions": "Terms & Conditions",
      "cookiePolicy": "Cookie Policy",
      "subscriptionTerms": "Subscription Terms",
      "aiTransparency": "AI Transparency Notice",
      "crisisDisclaimer": "Crisis Disclaimer"
    }
  }
}
```

### Step 3: Create Document Versions

When you update a legal document, create a new version in the database:

```sql
-- Example: Update Privacy Policy to version 2.0
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
  '2024-02-01',
  '... full document content ...',
  'en',
  true,
  'Updated data retention policies and added new third-party processors'
);

-- Mark previous version as not current
UPDATE legal_document_versions
SET is_current = false
WHERE document_type = 'privacy_policy'
  AND version = '1.0';
```

## Behavior

### Non-Critical Updates (Privacy Policy, Cookie Policy, etc.)

- User sees notification modal or banner
- User can view the updated document
- User can dismiss the notification
- Dismissed updates won't show again (unless user clears app data)

### Critical Updates (Terms & Conditions)

- User sees notification modal (cannot be dismissed)
- User MUST acknowledge the update to continue using the app
- "Dismiss" button is not shown
- Acknowledgment is logged in the database
- User can view the full document before acknowledging

### Update Detection

The system checks for updates:
1. When the app launches
2. When the user logs in
3. When manually triggered via `checkForUpdates()`

Updates are detected by comparing:
- Current document version (from `legal_document_versions` table)
- User's last consented version (from `user_legal_consents` table)

## Database Schema

### legal_document_versions

Stores all versions of legal documents:

```sql
CREATE TABLE legal_document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type TEXT NOT NULL,
  version TEXT NOT NULL,
  effective_date DATE NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  is_current BOOLEAN NOT NULL DEFAULT false,
  change_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### user_legal_consents

Tracks user acknowledgments:

```sql
CREATE TABLE user_legal_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  document_type TEXT NOT NULL,
  document_version TEXT NOT NULL,
  consented_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  consent_method TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

Run the tests:

```bash
npm test -- --testPathPattern="LegalDocumentUpdate"
```

Tests cover:
- Component rendering
- User interactions
- Acknowledgment flow
- Dismissal behavior
- Required vs optional updates
- Hook state management
- Error handling

## Accessibility

All components include proper accessibility features:
- `accessibilityRole` for buttons
- `accessibilityLabel` for screen readers
- Keyboard navigation support
- High contrast text
- Clear visual hierarchy

## Customization

### Change Display Mode

Switch between modal and banner:

```tsx
// Modal (default, more prominent)
<LegalDocumentUpdateManager mode="modal" />

// Banner (less intrusive)
<LegalDocumentUpdateManager mode="banner" />
```

### Manual Control

For more control, use the hook directly:

```tsx
function CustomUpdateFlow() {
  const {
    updates,
    acknowledgeUpdate,
    dismissNotification,
  } = useLegalDocumentUpdates();

  return (
    <MyCustomUI
      updates={updates}
      onAcknowledge={acknowledgeUpdate}
      onDismiss={dismissNotification}
    />
  );
}
```

## Best Practices

1. **Always use LegalDocumentUpdateManager at the app root** - This ensures updates are checked on app launch

2. **Include change summaries** - Help users understand what changed without reading the full document

3. **Test the flow** - Verify that Terms updates properly block app usage until acknowledged

4. **Version documents properly** - Use semantic versioning (1.0, 1.1, 2.0) for clarity

5. **Notify users in advance** - Consider sending push notifications before major updates go live

6. **Keep translations updated** - Ensure all supported languages have the notification text

## Troubleshooting

### Updates not showing

- Check that `is_current` is set to `true` for the new version
- Verify user hasn't already consented to this version
- Ensure user is logged in (updates only show for authenticated users)

### Cannot dismiss Terms update

- This is intentional! Terms updates require explicit acknowledgment
- User must tap "I Acknowledge" button

### Updates showing repeatedly

- Check that `logConsent()` is being called successfully
- Verify database permissions for `user_legal_consents` table
- Check for errors in the console

## Support

For questions or issues, contact the development team or refer to:
- [Legal Compliance Spec](.kiro/specs/legal-compliance-docs/)
- [Task List](.kiro/specs/legal-compliance-docs/tasks.md)
- [Design Document](.kiro/specs/legal-compliance-docs/design.md)
