# Data Management Features

This document describes the GDPR-compliant data management features implemented for Growthovo.

## Overview

The data management system provides users with control over their personal data through three main features:

1. **Data Export** - Download all personal data in JSON format
2. **Account Deletion** - Permanently delete account with 30-day grace period
3. **Privacy Preferences** - Control analytics, marketing, and data sharing

## Services

### dataExportService.ts

Handles exporting user data to JSON format and sharing it with the user.

**Functions:**
- `exportUserData(userId: string): Promise<string>` - Exports all user data to a JSON file
- `shareExportedData(fileUri: string): Promise<void>` - Shares the exported file using native sharing
- `deleteExportedFile(fileUri: string): Promise<void>` - Cleans up the exported file

**Data Included in Export:**
- User profile
- Chat history with Rex
- Progress and completed lessons
- Streak data
- XP transactions
- Challenge completions
- Subscription information
- Legal consents
- Privacy preferences
- Rex memories
- Morning briefings
- Evening debriefs
- SOS events
- Speaking sessions

### accountDeletionService.ts

Manages account deletion requests with a 30-day grace period.

**Functions:**
- `scheduleAccountDeletion(userId: string): Promise<DeletionStatus>` - Schedules account for deletion
- `cancelAccountDeletion(userId: string): Promise<void>` - Cancels a scheduled deletion
- `getDeletionStatus(userId: string): Promise<DeletionStatus>` - Gets current deletion status
- `permanentlyDeleteAccount(userId: string): Promise<void>` - Permanently deletes account (backend job)

**Grace Period:**
- Users have 30 days to cancel deletion
- During grace period, account remains accessible
- After grace period, account is permanently deleted by backend job

### privacyPreferencesService.ts

Manages user privacy preferences for analytics, marketing, and data sharing.

**Functions:**
- `getPrivacyPreferences(userId: string): Promise<PrivacyPreferences>` - Gets user preferences
- `updatePrivacyPreferences(userId, preferences): Promise<PrivacyPreferences>` - Updates preferences
- `updateAnalyticsPreference(userId, enabled): Promise<void>` - Updates analytics preference
- `updateMarketingEmailsPreference(userId, enabled): Promise<void>` - Updates marketing preference
- `updateDataSharingPreference(userId, enabled): Promise<void>` - Updates data sharing preference

**Default Preferences:**
- Analytics: Enabled (helps improve the app)
- Marketing Emails: Disabled
- Data Sharing: Disabled

## Database Schema

### data_export_requests

Tracks all data export requests for audit purposes.

```sql
CREATE TABLE data_export_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  export_date TIMESTAMPTZ,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ
);
```

### account_deletion_requests

Tracks account deletion requests with status.

```sql
CREATE TABLE account_deletion_requests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ,
  grace_period_ends TIMESTAMPTZ,
  status TEXT CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### user_privacy_preferences

Stores user privacy preferences.

```sql
CREATE TABLE user_privacy_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  analytics_enabled BOOLEAN DEFAULT true,
  marketing_emails_enabled BOOLEAN DEFAULT false,
  data_sharing_consent BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

### users table additions

Added columns to track deletion schedule:

```sql
ALTER TABLE users ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN deletion_grace_period_ends TIMESTAMPTZ;
```

## UI Integration

### SettingsScreen

The SettingsScreen has been updated with three new sections:

**Privacy Preferences Section:**
- Toggle for analytics data collection
- Toggle for marketing emails
- Toggle for data sharing with partners

**Data Management Section:**
- "Export My Data" button - Downloads all user data as JSON
- "Delete My Account" button - Schedules account deletion with warning
- Deletion status display (if scheduled) with cancel option

**Legal Documents Section:**
- Links to Privacy Policy
- Links to Terms & Conditions
- Links to Cookie Policy

## Usage Examples

### Export User Data

```typescript
import { exportUserData, shareExportedData, deleteExportedFile } from '../services/dataExportService';

async function handleExport(userId: string) {
  try {
    const fileUri = await exportUserData(userId);
    await shareExportedData(fileUri);
    await deleteExportedFile(fileUri);
  } catch (error) {
    console.error('Export failed:', error);
  }
}
```

### Schedule Account Deletion

```typescript
import { scheduleAccountDeletion } from '../services/accountDeletionService';

async function handleDelete(userId: string) {
  try {
    const status = await scheduleAccountDeletion(userId);
    console.log(`Account will be deleted on ${status.gracePeriodEnds}`);
  } catch (error) {
    console.error('Deletion scheduling failed:', error);
  }
}
```

### Update Privacy Preferences

```typescript
import { updateAnalyticsPreference } from '../services/privacyPreferencesService';

async function toggleAnalytics(userId: string, enabled: boolean) {
  try {
    await updateAnalyticsPreference(userId, enabled);
  } catch (error) {
    console.error('Update failed:', error);
  }
}
```

## GDPR Compliance

These features ensure compliance with GDPR requirements:

- **Right to Access** (Article 15) - Data export functionality
- **Right to Erasure** (Article 17) - Account deletion with grace period
- **Right to Object** (Article 21) - Privacy preferences for analytics and marketing
- **Data Portability** (Article 20) - JSON export in machine-readable format

## Testing

All services have comprehensive unit tests:

- `dataExportService.test.ts` - Tests data export and sharing
- `accountDeletionService.test.ts` - Tests deletion scheduling and cancellation
- `privacyPreferencesService.test.ts` - Tests preference management

Run tests with:
```bash
npm test -- dataExportService accountDeletionService privacyPreferencesService
```

## Backend Jobs

A backend job should be implemented to:

1. Check for accounts past their grace period
2. Permanently delete those accounts
3. Clean up associated data
4. Update deletion request status

Use the `get_accounts_ready_for_deletion()` SQL function to find accounts ready for deletion.

## Future Enhancements

- Email notifications for deletion schedule
- Data export via email delivery
- Granular data deletion options
- Export format options (CSV, PDF)
- Automated deletion reminders
