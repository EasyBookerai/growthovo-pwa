# Legal Document Update Notification Integration

This document explains how to integrate the legal document update notification system into your application.

## Overview

The legal notification service automatically notifies users when important legal documents (Privacy Policy, Terms & Conditions, etc.) are updated. It sends both push notifications and email notifications to ensure users are aware of changes.

## Components

### 1. Legal Notification Service (`legalNotificationService.ts`)

Core service that handles sending notifications to users about legal document updates.

**Key Functions:**

- `sendLegalUpdatePushNotification()` - Send push notification to a single user
- `sendLegalUpdateEmailNotification()` - Send email notification to a single user
- `notifyAllUsersAboutDocumentUpdate()` - Notify all users who need to review a document update
- `checkAndNotifyDocumentUpdates()` - Background job to check for updates and notify users

### 2. Supabase Edge Function (`send-legal-update-email`)

Serverless function that sends email notifications via Resend API.

**Environment Variables Required:**
- `RESEND_API_KEY` - API key for Resend email service
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

### 3. Database Migration (`20240036_legal_notification_log.sql`)

Creates the `legal_notification_log` table to track all notifications sent to users.

## Setup Instructions

### Step 1: Deploy Supabase Edge Function

```bash
cd growthovo/supabase
supabase functions deploy send-legal-update-email
```

### Step 2: Set Environment Variables

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### Step 3: Run Database Migration

```bash
supabase db push
```

Or manually run the migration:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/20240036_legal_notification_log.sql
```

### Step 4: Configure Resend Email Service

1. Sign up for [Resend](https://resend.com)
2. Verify your domain (e.g., `growthovo.app`)
3. Create an API key
4. Add the API key to Supabase secrets (see Step 2)

### Step 5: Schedule Background Checks

Add to your app initialization (e.g., `App.tsx` or when user logs in):

```typescript
import { scheduleLegalDocumentUpdateCheck } from './src/services/notificationService';
import { checkAndNotifyDocumentUpdates } from './src/services/legalNotificationService';

// Schedule daily check for legal document updates
await scheduleLegalDocumentUpdateCheck(userId);

// Optionally, check immediately on app start
await checkAndNotifyDocumentUpdates();
```

## Usage Examples

### Example 1: Notify Users When Publishing a New Document Version

When you publish a new version of a legal document:

```typescript
import { notifyAllUsersAboutDocumentUpdate } from './src/services/legalNotificationService';

// After updating the document in legal_document_versions table
await notifyAllUsersAboutDocumentUpdate('privacy_policy', '2.0');
```

### Example 2: Manual Notification to Specific User

```typescript
import {
  sendLegalUpdatePushNotification,
  sendLegalUpdateEmailNotification,
} from './src/services/legalNotificationService';

// Send push notification
await sendLegalUpdatePushNotification(
  userId,
  'terms_conditions',
  '2.0',
  'Updated liability terms',
  true // requires acknowledgment
);

// Send email notification
await sendLegalUpdateEmailNotification(
  userId,
  'terms_conditions',
  '2.0',
  'Updated liability terms',
  true
);
```

### Example 3: Background Job for Periodic Checks

Set up a cron job or scheduled task to check for updates daily:

```typescript
import { checkAndNotifyDocumentUpdates } from './src/services/legalNotificationService';

// Run daily at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  await checkAndNotifyDocumentUpdates();
});
```

## Notification Behavior

### Push Notifications

**For Required Updates (Terms & Conditions):**
- Title: "⚠️ Important Legal Update"
- Body: "Our Terms & Conditions has been updated. Please review and acknowledge the changes."
- Deep link: Opens legal document viewer in app

**For Optional Updates (Privacy Policy, Cookie Policy, etc.):**
- Title: "📄 Legal Document Updated"
- Body: "Our Privacy Policy has been updated to version 2.0. [Change summary]"
- Deep link: Opens legal document viewer in app

### Email Notifications

Emails include:
- Professional HTML template with GROWTHOVO branding
- Document name and version number
- Change summary (what's new)
- Call-to-action button to view document
- Different styling for required vs optional updates
- Contact information for questions

### Notification Frequency

- Users are notified **once** when a new version is published
- Notifications are sent in **batches of 50** to avoid rate limiting
- **1-second delay** between batches
- Notifications are logged in `legal_notification_log` table

## Deep Linking

Push notifications include deep link data to navigate users directly to the legal document viewer:

```typescript
{
  type: 'legal_update',
  document_type: 'privacy_policy',
  version: '2.0',
  screen: 'LegalDocuments',
  params: { documentType: 'privacy_policy' }
}
```

Handle deep links in your navigation:

```typescript
// In your notification handler
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data;
  
  if (data.type === 'legal_update') {
    navigation.navigate('LegalDocuments', {
      documentType: data.document_type,
    });
  }
});
```

## Testing

### Run Unit Tests

```bash
npm test -- legalNotificationService.test.ts
```

### Test Email Sending (Development)

If `RESEND_API_KEY` is not set, emails will be simulated and logged to console:

```typescript
await sendLegalUpdateEmailNotification(
  'test-user-id',
  'privacy_policy',
  '2.0',
  'Test update',
  false
);
// Console: "RESEND_API_KEY not configured. Email would be sent to: user@example.com"
```

### Test Push Notifications

Use Expo's push notification tool:
1. Get a test push token from your device
2. Send a test notification via [Expo Push Notification Tool](https://expo.dev/notifications)

## Monitoring

### View Notification Logs

Query the `legal_notification_log` table to see all notifications sent:

```sql
SELECT 
  recipient_email,
  document_type,
  version,
  notification_type,
  status,
  sent_at
FROM legal_notification_log
WHERE sent_at > NOW() - INTERVAL '7 days'
ORDER BY sent_at DESC;
```

### Check Failed Notifications

```sql
SELECT *
FROM legal_notification_log
WHERE status = 'failed'
ORDER BY sent_at DESC;
```

### User-Specific Notification History

```sql
SELECT *
FROM legal_notification_log
WHERE recipient_user_id = 'user-id-here'
ORDER BY sent_at DESC;
```

## Best Practices

### 1. Material Changes Only

Only send notifications for **material changes** to legal documents:
- ✅ Changes to data retention policies
- ✅ Changes to user rights
- ✅ Changes to liability terms
- ✅ New third-party integrations
- ❌ Typo fixes
- ❌ Formatting changes
- ❌ Minor clarifications

### 2. Clear Change Summaries

Always provide a clear, concise change summary:

```typescript
// Good
change_summary: "We now retain user data for 90 days instead of 30 days"

// Bad
change_summary: "Updated section 4.2"
```

### 3. Timing

- Send notifications during **business hours** (9 AM - 5 PM local time)
- Avoid weekends and holidays if possible
- Give users **at least 7 days** before enforcing new terms

### 4. Required vs Optional

- **Terms & Conditions**: Always require acknowledgment
- **Privacy Policy**: Optional (but recommended to review)
- **Cookie Policy**: Optional
- **Subscription Terms**: Optional (unless changing pricing)

### 5. Testing Before Production

Always test notifications with a small group before sending to all users:

```typescript
// Test with specific users first
const testUsers = ['user-1', 'user-2', 'user-3'];

for (const userId of testUsers) {
  await sendLegalUpdatePushNotification(userId, 'privacy_policy', '2.0', 'Test', false);
  await sendLegalUpdateEmailNotification(userId, 'privacy_policy', '2.0', 'Test', false);
}
```

## Troubleshooting

### Push Notifications Not Received

1. Check user has a valid push token:
   ```sql
   SELECT push_token FROM users WHERE id = 'user-id';
   ```

2. Verify push token is valid (starts with `ExponentPushToken[`)

3. Check notification permissions are granted on device

4. Review `legal_notification_log` for errors

### Emails Not Sent

1. Verify `RESEND_API_KEY` is set:
   ```bash
   supabase secrets list
   ```

2. Check Resend dashboard for delivery status

3. Verify sender domain is verified in Resend

4. Check spam folder

5. Review Edge Function logs:
   ```bash
   supabase functions logs send-legal-update-email
   ```

### Users Not Being Notified

1. Check if users have consented to the previous version:
   ```sql
   SELECT * FROM user_legal_consents 
   WHERE document_type = 'privacy_policy'
   ORDER BY consented_at DESC;
   ```

2. Verify current document version is marked as `is_current = true`:
   ```sql
   SELECT * FROM legal_document_versions 
   WHERE document_type = 'privacy_policy' AND is_current = true;
   ```

3. Check `getUsersNeedingDocumentReview()` returns expected users

## Integration with Existing Features

### With Legal Document Update UI (Task 8.2)

The notification system works seamlessly with the UI components:

1. User receives push/email notification
2. User opens app (via deep link or manually)
3. `LegalDocumentUpdateManager` detects pending updates
4. User sees `LegalDocumentUpdateNotification` modal
5. User reviews and acknowledges changes
6. Consent is logged via `legalConsentService`

### With User Preferences

Respect user notification preferences:

```typescript
// Check if user has notifications enabled
const { data: prefs } = await supabase
  .from('user_privacy_preferences')
  .select('marketing_emails_enabled')
  .eq('user_id', userId)
  .single();

// Only send email if user has opted in
if (prefs?.marketing_emails_enabled) {
  await sendLegalUpdateEmailNotification(...);
}
```

### With Multi-Language Support

Send notifications in user's preferred language:

```typescript
// Get user's language preference
const { data: user } = await supabase
  .from('users')
  .select('language')
  .eq('id', userId)
  .single();

// Get document in user's language
const document = await getCurrentDocumentVersion(
  'privacy_policy',
  user.language || 'en'
);

// Send notification with localized content
await notifyAllUsersAboutDocumentUpdate(
  'privacy_policy',
  document.version,
  user.language || 'en'
);
```

## Security Considerations

1. **Rate Limiting**: Notifications are sent in batches to avoid overwhelming the system
2. **Authentication**: Edge function verifies authorization header
3. **Data Privacy**: Email addresses are not exposed in push notifications
4. **Logging**: All notifications are logged for audit purposes
5. **RLS Policies**: Users can only view their own notification logs

## Support

For questions or issues:
- Review this documentation
- Check test files for usage examples
- See `.kiro/specs/legal-compliance-docs/` for requirements
- Contact: support@growthovo.app
