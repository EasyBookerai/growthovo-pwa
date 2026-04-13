import * as Notifications from 'expo-notifications';
import { supabase } from './supabaseClient';
import { getUsersNeedingDocumentReview, getCurrentDocumentVersion } from './legalDocumentUpdateService';
import type { DocumentType } from './legalConsentService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LegalUpdateNotificationPayload {
  document_type: DocumentType;
  version: string;
  change_summary: string | null;
  requires_acknowledgment: boolean;
}

// ─── Send Push Notification for Legal Update ─────────────────────────────────

/**
 * Send a push notification to a specific user about a legal document update
 * @param userId - The user's ID
 * @param documentType - The type of legal document that was updated
 * @param version - The new version number
 * @param changeSummary - Brief summary of what changed
 * @param requiresAcknowledgment - Whether the user must acknowledge (e.g., Terms & Conditions)
 */
export async function sendLegalUpdatePushNotification(
  userId: string,
  documentType: DocumentType,
  version: string,
  changeSummary: string | null,
  requiresAcknowledgment: boolean
): Promise<void> {
  try {
    // Get user's push token
    const { data: user, error } = await supabase
      .from('users')
      .select('push_token')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user?.push_token) {
      console.warn(`No push token found for user ${userId}`);
      return;
    }

    // Format document type for display
    const documentName = formatDocumentTypeName(documentType);

    // Create notification title and body
    const title = requiresAcknowledgment
      ? '⚠️ Important Legal Update'
      : '📄 Legal Document Updated';

    const body = requiresAcknowledgment
      ? `Our ${documentName} has been updated. Please review and acknowledge the changes.`
      : `Our ${documentName} has been updated to version ${version}. ${changeSummary || 'Please review when convenient.'}`;

    // Send push notification via Expo
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.push_token,
        title,
        body,
        sound: 'default',
        data: {
          type: 'legal_update',
          document_type: documentType,
          version,
          change_summary: changeSummary,
          requires_acknowledgment: requiresAcknowledgment,
          // Deep link to legal document viewer
          screen: 'LegalDocuments',
          params: { documentType },
        } as LegalUpdateNotificationPayload,
      }),
    });

    console.log(`Legal update push notification sent to user ${userId} for ${documentType}`);
  } catch (err) {
    console.warn(`Failed to send legal update push notification to user ${userId}:`, err);
  }
}

// ─── Send Email Notification for Legal Update ────────────────────────────────

/**
 * Send an email notification to a user about a legal document update
 * @param userId - The user's ID
 * @param documentType - The type of legal document that was updated
 * @param version - The new version number
 * @param changeSummary - Brief summary of what changed
 * @param requiresAcknowledgment - Whether the user must acknowledge
 */
export async function sendLegalUpdateEmailNotification(
  userId: string,
  documentType: DocumentType,
  version: string,
  changeSummary: string | null,
  requiresAcknowledgment: boolean
): Promise<void> {
  try {
    // Get user's email
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user?.email) {
      console.warn(`No email found for user ${userId}`);
      return;
    }

    const documentName = formatDocumentTypeName(documentType);
    const subject = requiresAcknowledgment
      ? `Action Required: ${documentName} Updated`
      : `${documentName} Updated - Version ${version}`;

    const htmlBody = generateEmailHTML(
      documentName,
      version,
      changeSummary,
      requiresAcknowledgment,
      documentType
    );

    // Call Supabase Edge Function to send email
    const { error: emailError } = await supabase.functions.invoke('send-legal-update-email', {
      body: {
        to: user.email,
        subject,
        html: htmlBody,
        document_type: documentType,
        version,
      },
    });

    if (emailError) {
      throw emailError;
    }

    console.log(`Legal update email sent to user ${userId} for ${documentType}`);
  } catch (err) {
    console.warn(`Failed to send legal update email to user ${userId}:`, err);
  }
}

// ─── Notify All Users About Document Update ──────────────────────────────────

/**
 * Send notifications (push + email) to all users who need to review a document update
 * This should be called when a new version of a legal document is published
 * @param documentType - The type of legal document that was updated
 * @param version - The new version number
 * @param language - The language of the document (defaults to 'en')
 */
export async function notifyAllUsersAboutDocumentUpdate(
  documentType: DocumentType,
  version: string,
  language: string = 'en'
): Promise<void> {
  try {
    // Get the current document version details
    const currentDoc = await getCurrentDocumentVersion(documentType, language);
    
    if (!currentDoc) {
      throw new Error(`No current version found for ${documentType}`);
    }

    // Get all users who need to review this update
    const usersNeedingUpdate = await getUsersNeedingDocumentReview(documentType, version);

    console.log(`Notifying ${usersNeedingUpdate.length} users about ${documentType} update to v${version}`);

    // Determine if this update requires acknowledgment
    // Only Terms & Conditions require explicit acknowledgment
    const requiresAcknowledgment = documentType === 'terms_conditions';

    // Send notifications to all users (in batches to avoid overwhelming the system)
    const batchSize = 50;
    for (let i = 0; i < usersNeedingUpdate.length; i += batchSize) {
      const batch = usersNeedingUpdate.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (user) => {
          // Send both push and email notifications
          await Promise.all([
            sendLegalUpdatePushNotification(
              user.user_id,
              documentType,
              version,
              currentDoc.change_summary,
              requiresAcknowledgment
            ),
            sendLegalUpdateEmailNotification(
              user.user_id,
              documentType,
              version,
              currentDoc.change_summary,
              requiresAcknowledgment
            ),
          ]);
        })
      );

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < usersNeedingUpdate.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Successfully notified all users about ${documentType} update`);
  } catch (err) {
    console.error(`Failed to notify users about ${documentType} update:`, err);
    throw err;
  }
}

// ─── Schedule Background Check for Document Updates ──────────────────────────

/**
 * Check for legal document updates and notify users if needed
 * This function should be called periodically (e.g., daily via a background job)
 * or when the app starts
 */
export async function checkAndNotifyDocumentUpdates(): Promise<void> {
  try {
    const documentTypes: DocumentType[] = [
      'privacy_policy',
      'terms_conditions',
      'cookie_policy',
      'subscription_terms',
    ];

    for (const docType of documentTypes) {
      const currentDoc = await getCurrentDocumentVersion(docType);
      
      if (!currentDoc) continue;

      // Get users who need to review this document
      const usersNeedingUpdate = await getUsersNeedingDocumentReview(
        docType,
        currentDoc.version
      );

      // If there are users who need to review, send notifications
      if (usersNeedingUpdate.length > 0) {
        console.log(`Found ${usersNeedingUpdate.length} users needing ${docType} update`);
        await notifyAllUsersAboutDocumentUpdate(docType, currentDoc.version);
      }
    }
  } catch (err) {
    console.error('Failed to check and notify document updates:', err);
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Format document type for display in notifications
 */
function formatDocumentTypeName(documentType: DocumentType): string {
  const names: Record<DocumentType, string> = {
    privacy_policy: 'Privacy Policy',
    terms_conditions: 'Terms & Conditions',
    ai_transparency: 'AI Transparency Notice',
    crisis_disclaimer: 'Crisis Disclaimer',
    subscription_terms: 'Subscription Terms',
    age_verification: 'Age Verification',
    cookie_policy: 'Cookie Policy',
  };

  return names[documentType] || documentType;
}

/**
 * Generate HTML email body for legal update notification
 */
function generateEmailHTML(
  documentName: string,
  version: string,
  changeSummary: string | null,
  requiresAcknowledgment: boolean,
  documentType: DocumentType
): string {
  const appUrl = 'https://growthovo.app'; // Replace with actual app URL or deep link

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentName} Updated</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #6366f1;
      margin-bottom: 10px;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .badge-required {
      background-color: #fef3c7;
      color: #92400e;
    }
    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }
    .content {
      margin-bottom: 30px;
    }
    .summary {
      background-color: #f9fafb;
      border-left: 4px solid #6366f1;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .summary-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #1f2937;
    }
    .cta-button {
      display: inline-block;
      background-color: #6366f1;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">GROWTHOVO</div>
      <div class="title">${documentName} Updated</div>
      <span class="badge ${requiresAcknowledgment ? 'badge-required' : 'badge-info'}">
        ${requiresAcknowledgment ? 'Action Required' : 'Information'}
      </span>
    </div>

    <div class="content">
      <p>Hello,</p>
      
      <p>We've updated our <strong>${documentName}</strong> to version <strong>${version}</strong>.</p>

      ${changeSummary ? `
      <div class="summary">
        <div class="summary-title">What's Changed:</div>
        <p>${changeSummary}</p>
      </div>
      ` : ''}

      ${requiresAcknowledgment ? `
      <p><strong>⚠️ Action Required:</strong> Please review and acknowledge these changes in the app. You'll need to accept the updated terms to continue using GROWTHOVO.</p>
      ` : `
      <p>Please take a moment to review these changes when you have time. You can continue using GROWTHOVO as normal.</p>
      `}

      <div style="text-align: center;">
        <a href="${appUrl}/legal/${documentType}" class="cta-button">
          ${requiresAcknowledgment ? 'Review & Acknowledge' : 'View Updated Document'}
        </a>
      </div>

      <p>If you have any questions about these changes, please don't hesitate to contact us at <a href="mailto:support@growthovo.app">support@growthovo.app</a>.</p>
    </div>

    <div class="footer">
      <p>This is an important notification about your GROWTHOVO account.</p>
      <p>&copy; ${new Date().getFullYear()} GROWTHOVO. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
