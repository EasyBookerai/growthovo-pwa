import { supabase } from './supabaseClient';
import { getLatestConsent, type DocumentType } from './legalConsentService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LegalDocumentVersion {
  id: string;
  document_type: string;
  version: string;
  effective_date: string;
  content: string;
  language: string;
  is_current: boolean;
  change_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentUpdateStatus {
  document_type: DocumentType;
  current_version: string;
  user_consented_version: string | null;
  needs_review: boolean;
  change_summary: string | null;
}

export interface UserNeedingUpdate {
  user_id: string;
  document_type: DocumentType;
  current_version: string;
  user_version: string | null;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function friendlyError(raw: string): string {
  if (raw.includes('network') || raw.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  return 'Failed to check document version. Please try again.';
}

// ─── Get Current Document Version ────────────────────────────────────────────

/**
 * Get the current version of a legal document
 * @param documentType - The type of legal document
 * @param language - The language code (defaults to 'en')
 * @returns The current document version or null if not found
 */
export async function getCurrentDocumentVersion(
  documentType: string,
  language: string = 'en'
): Promise<LegalDocumentVersion | null> {
  const { data, error } = await supabase
    .from('legal_document_versions')
    .select('*')
    .eq('document_type', documentType)
    .eq('language', language)
    .eq('is_current', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(friendlyError(error.message));
  }

  return data;
}

// ─── Check if User Needs to Review Document ──────────────────────────────────

/**
 * Check if a user needs to review an updated legal document
 * @param userId - The user's ID
 * @param documentType - The type of legal document
 * @param language - The language code (defaults to 'en')
 * @returns Status indicating if user needs to review the document
 */
export async function checkUserNeedsReview(
  userId: string,
  documentType: DocumentType,
  language: string = 'en'
): Promise<DocumentUpdateStatus> {
  // Get current document version
  const currentDoc = await getCurrentDocumentVersion(documentType, language);
  
  if (!currentDoc) {
    throw new Error(`No current version found for ${documentType}`);
  }

  // Get user's last consent for this document
  const userConsent = await getLatestConsent(userId, documentType);

  const userVersion = userConsent?.document_version || null;
  const needsReview = !userVersion || userVersion !== currentDoc.version;

  return {
    document_type: documentType,
    current_version: currentDoc.version,
    user_consented_version: userVersion,
    needs_review: needsReview,
    change_summary: needsReview ? currentDoc.change_summary : null,
  };
}

// ─── Get All Documents User Needs to Review ──────────────────────────────────

/**
 * Get all legal documents that a user needs to review
 * @param userId - The user's ID
 * @param language - The language code (defaults to 'en')
 * @returns Array of documents that need review
 */
export async function getAllDocumentsNeedingReview(
  userId: string,
  language: string = 'en'
): Promise<DocumentUpdateStatus[]> {
  const documentTypes: DocumentType[] = [
    'privacy_policy',
    'terms_conditions',
    'ai_transparency',
    'crisis_disclaimer',
    'subscription_terms',
    'cookie_policy',
  ];

  const results = await Promise.all(
    documentTypes.map(async (docType) => {
      try {
        return await checkUserNeedsReview(userId, docType, language);
      } catch (error) {
        // If document doesn't exist, skip it
        return null;
      }
    })
  );

  // Filter out null results and only return documents that need review
  return results.filter(
    (result): result is DocumentUpdateStatus => result !== null && result.needs_review
  );
}

// ─── Get Users Who Need to Review a Document ─────────────────────────────────

/**
 * Get all users who need to review a specific document update
 * This is useful for sending notifications about document updates
 * @param documentType - The type of legal document
 * @param currentVersion - The current version of the document
 * @returns Array of users who need to review the document
 */
export async function getUsersNeedingDocumentReview(
  documentType: DocumentType,
  currentVersion: string
): Promise<UserNeedingUpdate[]> {
  // Get all users who have consented to this document type
  const { data: consents, error: consentsError } = await supabase
    .from('user_legal_consents')
    .select('user_id, document_version')
    .eq('document_type', documentType)
    .order('consented_at', { ascending: false });

  if (consentsError) {
    throw new Error(friendlyError(consentsError.message));
  }

  // Group by user_id to get the latest consent per user
  const latestConsentsByUser = new Map<string, string>();
  
  if (consents) {
    for (const consent of consents) {
      if (!latestConsentsByUser.has(consent.user_id)) {
        latestConsentsByUser.set(consent.user_id, consent.document_version);
      }
    }
  }

  // Get all registered users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id');

  if (usersError) {
    throw new Error(friendlyError(usersError.message));
  }

  // Identify users who need to review
  const usersNeedingUpdate: UserNeedingUpdate[] = [];

  if (users) {
    for (const user of users) {
      const userVersion = latestConsentsByUser.get(user.id) || null;
      
      // User needs update if they haven't consented or have an old version
      if (!userVersion || userVersion !== currentVersion) {
        usersNeedingUpdate.push({
          user_id: user.id,
          document_type: documentType,
          current_version: currentVersion,
          user_version: userVersion,
        });
      }
    }
  }

  return usersNeedingUpdate;
}

// ─── Compare Version Strings ──────────────────────────────────────────────────

/**
 * Compare two version strings (e.g., "1.0" vs "2.0")
 * @param version1 - First version string
 * @param version2 - Second version string
 * @returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  const maxLength = Math.max(v1Parts.length, v2Parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part < v2Part) return -1;
    if (v1Part > v2Part) return 1;
  }
  
  return 0;
}

// ─── Check if Version is Outdated ────────────────────────────────────────────

/**
 * Check if a user's consented version is outdated compared to current version
 * @param userVersion - The version the user consented to
 * @param currentVersion - The current version of the document
 * @returns true if user version is outdated
 */
export function isVersionOutdated(
  userVersion: string | null,
  currentVersion: string
): boolean {
  if (!userVersion) return true;
  return compareVersions(userVersion, currentVersion) < 0;
}
