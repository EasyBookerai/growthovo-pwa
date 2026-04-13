/**
 * Tests for legalDocumentUpdateService
 *
 * Covers:
 *  - Unit tests: getCurrentDocumentVersion, checkUserNeedsReview, getAllDocumentsNeedingReview
 *  - Unit tests: getUsersNeedingDocumentReview, compareVersions, isVersionOutdated
 *  - Database interaction tests with mocked Supabase client
 *
 * Feature: legal-compliance-docs
 * Task: 8.1 Create document version check function
 */

import { supabase } from '../services/supabaseClient';
import * as legalConsentService from '../services/legalConsentService';
import {
  getCurrentDocumentVersion,
  checkUserNeedsReview,
  getAllDocumentsNeedingReview,
  getUsersNeedingDocumentReview,
  compareVersions,
  isVersionOutdated,
  type LegalDocumentVersion,
  type DocumentUpdateStatus,
  type UserNeedingUpdate,
} from '../services/legalDocumentUpdateService';
import type { DocumentType, LegalConsent } from '../services/legalConsentService';

// Mock the supabase client
jest.mock('../services/supabaseClient');

// Mock expo-constants (required by legalConsentService)
jest.mock('expo-constants', () => ({
  default: {
    deviceName: 'Test Device',
  },
}));

// Mock react-native Platform (required by legalConsentService)
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
  },
}));

// Mock legalConsentService
jest.mock('../services/legalConsentService', () => ({
  ...jest.requireActual('../services/legalConsentService'),
  getLatestConsent: jest.fn(),
}));

describe('legalDocumentUpdateService', () => {
  const mockUserId = 'user-123';
  const mockDocumentType: DocumentType = 'privacy_policy';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── getCurrentDocumentVersion ──────────────────────────────────────────────

  describe('getCurrentDocumentVersion', () => {
    it('should return current document version', async () => {
      const mockDocument: LegalDocumentVersion = {
        id: 'doc-123',
        document_type: 'privacy_policy',
        version: '2.0',
        effective_date: '2024-01-01',
        content: 'Privacy policy content',
        language: 'en',
        is_current: true,
        change_summary: 'Updated data retention policy',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDocument, error: null }),
        }),
      });

      const result = await getCurrentDocumentVersion('privacy_policy', 'en');

      expect(result).toEqual(mockDocument);
      expect(supabase.from).toHaveBeenCalledWith('legal_document_versions');
    });

    it('should return null when document not found', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // No rows found
          }),
        }),
      });

      const result = await getCurrentDocumentVersion('privacy_policy', 'en');

      expect(result).toBeNull();
    });

    it('should throw error for database errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'OTHER_ERROR', message: 'Database error' },
          }),
        }),
      });

      await expect(getCurrentDocumentVersion('privacy_policy', 'en')).rejects.toThrow();
    });

    it('should default to English language', async () => {
      const mockEq = jest.fn().mockReturnThis();
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: mockEq,
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      });

      await getCurrentDocumentVersion('privacy_policy');

      // Should be called with 'en' as default language
      expect(mockEq).toHaveBeenCalledWith('language', 'en');
    });
  });

  // ─── checkUserNeedsReview ───────────────────────────────────────────────────

  describe('checkUserNeedsReview', () => {
    it('should return needs_review=true when user has not consented', async () => {
      const mockDocument: LegalDocumentVersion = {
        id: 'doc-123',
        document_type: 'privacy_policy',
        version: '2.0',
        effective_date: '2024-01-01',
        content: 'Privacy policy content',
        language: 'en',
        is_current: true,
        change_summary: 'Updated data retention policy',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDocument, error: null }),
        }),
      });

      (legalConsentService.getLatestConsent as jest.Mock).mockResolvedValue(null);

      const result = await checkUserNeedsReview(mockUserId, mockDocumentType);

      expect(result).toEqual({
        document_type: 'privacy_policy',
        current_version: '2.0',
        user_consented_version: null,
        needs_review: true,
        change_summary: 'Updated data retention policy',
      });
    });

    it('should return needs_review=true when user has old version', async () => {
      const mockDocument: LegalDocumentVersion = {
        id: 'doc-123',
        document_type: 'privacy_policy',
        version: '2.0',
        effective_date: '2024-01-01',
        content: 'Privacy policy content',
        language: 'en',
        is_current: true,
        change_summary: 'Updated data retention policy',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockConsent: LegalConsent = {
        id: 'consent-123',
        user_id: mockUserId,
        document_type: mockDocumentType,
        document_version: '1.0',
        consented_at: '2023-01-01T00:00:00Z',
        ip_address: null,
        user_agent: 'Test Device',
        consent_method: 'explicit_checkbox',
        created_at: '2023-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDocument, error: null }),
        }),
      });

      (legalConsentService.getLatestConsent as jest.Mock).mockResolvedValue(mockConsent);

      const result = await checkUserNeedsReview(mockUserId, mockDocumentType);

      expect(result).toEqual({
        document_type: 'privacy_policy',
        current_version: '2.0',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Updated data retention policy',
      });
    });

    it('should return needs_review=false when user has current version', async () => {
      const mockDocument: LegalDocumentVersion = {
        id: 'doc-123',
        document_type: 'privacy_policy',
        version: '2.0',
        effective_date: '2024-01-01',
        content: 'Privacy policy content',
        language: 'en',
        is_current: true,
        change_summary: 'Updated data retention policy',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockConsent: LegalConsent = {
        id: 'consent-123',
        user_id: mockUserId,
        document_type: mockDocumentType,
        document_version: '2.0',
        consented_at: '2024-01-01T00:00:00Z',
        ip_address: null,
        user_agent: 'Test Device',
        consent_method: 'explicit_checkbox',
        created_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDocument, error: null }),
        }),
      });

      (legalConsentService.getLatestConsent as jest.Mock).mockResolvedValue(mockConsent);

      const result = await checkUserNeedsReview(mockUserId, mockDocumentType);

      expect(result).toEqual({
        document_type: 'privacy_policy',
        current_version: '2.0',
        user_consented_version: '2.0',
        needs_review: false,
        change_summary: null,
      });
    });

    it('should throw error when document does not exist', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      });

      await expect(checkUserNeedsReview(mockUserId, mockDocumentType)).rejects.toThrow(
        'No current version found for privacy_policy'
      );
    });
  });

  // ─── getAllDocumentsNeedingReview ───────────────────────────────────────────

  describe('getAllDocumentsNeedingReview', () => {
    it('should return all documents that need review', async () => {
      const mockPrivacyDoc: LegalDocumentVersion = {
        id: 'doc-1',
        document_type: 'privacy_policy',
        version: '2.0',
        effective_date: '2024-01-01',
        content: 'Privacy policy content',
        language: 'en',
        is_current: true,
        change_summary: 'Updated data retention',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockTermsDoc: LegalDocumentVersion = {
        id: 'doc-2',
        document_type: 'terms_conditions',
        version: '1.5',
        effective_date: '2024-01-01',
        content: 'Terms content',
        language: 'en',
        is_current: true,
        change_summary: 'Updated liability terms',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock getCurrentDocumentVersion to return different documents
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockImplementation(async () => {
            // Return different documents based on call order
            const callCount = (supabase.from as jest.Mock).mock.calls.length;
            if (callCount === 1) {
              return { data: mockPrivacyDoc, error: null };
            } else if (callCount === 2) {
              return { data: mockTermsDoc, error: null };
            }
            return { data: null, error: { code: 'PGRST116' } };
          }),
        }),
      }));

      // Mock user consents - user has old privacy policy, no terms consent
      (legalConsentService.getLatestConsent as jest.Mock).mockImplementation(
        async (userId: string, docType: DocumentType) => {
          if (docType === 'privacy_policy') {
            return {
              id: 'consent-1',
              user_id: userId,
              document_type: docType,
              document_version: '1.0',
              consented_at: '2023-01-01T00:00:00Z',
              ip_address: null,
              user_agent: 'Test Device',
              consent_method: 'explicit_checkbox',
              created_at: '2023-01-01T00:00:00Z',
            };
          }
          return null;
        }
      );

      const result = await getAllDocumentsNeedingReview(mockUserId);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((doc) => doc.needs_review)).toBe(true);
    });

    it('should return empty array when all documents are up to date', async () => {
      const mockDocument: LegalDocumentVersion = {
        id: 'doc-123',
        document_type: 'privacy_policy',
        version: '2.0',
        effective_date: '2024-01-01',
        content: 'Privacy policy content',
        language: 'en',
        is_current: true,
        change_summary: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockDocument, error: null }),
        }),
      });

      // Mock user has consented to current version of all documents
      (legalConsentService.getLatestConsent as jest.Mock).mockResolvedValue({
        id: 'consent-123',
        user_id: mockUserId,
        document_type: 'privacy_policy',
        document_version: '2.0',
        consented_at: '2024-01-01T00:00:00Z',
        ip_address: null,
        user_agent: 'Test Device',
        consent_method: 'explicit_checkbox',
        created_at: '2024-01-01T00:00:00Z',
      });

      const result = await getAllDocumentsNeedingReview(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle missing documents gracefully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' },
          }),
        }),
      });

      const result = await getAllDocumentsNeedingReview(mockUserId);

      // Should not throw error, just return empty array
      expect(result).toEqual([]);
    });
  });

  // ─── getUsersNeedingDocumentReview ─────────────────────────────────────────

  describe('getUsersNeedingDocumentReview', () => {
    it('should return users who need to review document', async () => {
      const mockConsents = [
        { user_id: 'user-1', document_version: '1.0' },
        { user_id: 'user-2', document_version: '1.5' },
        { user_id: 'user-3', document_version: '2.0' }, // Up to date
      ];

      const mockUsers = [
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
        { id: 'user-4' }, // Never consented
      ];

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'user_legal_consents') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockConsents, error: null }),
              }),
            }),
          };
        } else if (table === 'users') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
          };
        }
        return {};
      });

      const result = await getUsersNeedingDocumentReview('privacy_policy', '2.0');

      expect(result).toHaveLength(3); // user-1, user-2, user-4 need update
      expect(result).toContainEqual({
        user_id: 'user-1',
        document_type: 'privacy_policy',
        current_version: '2.0',
        user_version: '1.0',
      });
      expect(result).toContainEqual({
        user_id: 'user-2',
        document_type: 'privacy_policy',
        current_version: '2.0',
        user_version: '1.5',
      });
      expect(result).toContainEqual({
        user_id: 'user-4',
        document_type: 'privacy_policy',
        current_version: '2.0',
        user_version: null,
      });
      
      // user-3 should not be in the list (already on v2.0)
      expect(result.find((u) => u.user_id === 'user-3')).toBeUndefined();
    });

    it('should return all users when no one has consented', async () => {
      const mockUsers = [{ id: 'user-1' }, { id: 'user-2' }];

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'user_legal_consents') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        } else if (table === 'users') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
          };
        }
        return {};
      });

      const result = await getUsersNeedingDocumentReview('privacy_policy', '1.0');

      expect(result).toHaveLength(2);
      expect(result.every((u) => u.user_version === null)).toBe(true);
    });

    it('should handle database errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      await expect(
        getUsersNeedingDocumentReview('privacy_policy', '2.0')
      ).rejects.toThrow();
    });

    it('should handle multiple consents per user correctly', async () => {
      const mockConsents = [
        { user_id: 'user-1', document_version: '2.0' }, // Latest
        { user_id: 'user-1', document_version: '1.0' }, // Older
        { user_id: 'user-1', document_version: '1.5' }, // Older
      ];

      const mockUsers = [{ id: 'user-1' }];

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'user_legal_consents') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue({ data: mockConsents, error: null }),
              }),
            }),
          };
        } else if (table === 'users') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockUsers, error: null }),
          };
        }
        return {};
      });

      const result = await getUsersNeedingDocumentReview('privacy_policy', '2.0');

      // User-1 should not need update (has v2.0)
      expect(result).toHaveLength(0);
    });
  });

  // ─── compareVersions ────────────────────────────────────────────────────────

  describe('compareVersions', () => {
    it('should return -1 when first version is lower', () => {
      expect(compareVersions('1.0', '2.0')).toBe(-1);
      expect(compareVersions('1.5', '1.6')).toBe(-1);
      expect(compareVersions('1.0.0', '1.0.1')).toBe(-1);
    });

    it('should return 1 when first version is higher', () => {
      expect(compareVersions('2.0', '1.0')).toBe(1);
      expect(compareVersions('1.6', '1.5')).toBe(1);
      expect(compareVersions('1.0.1', '1.0.0')).toBe(1);
    });

    it('should return 0 when versions are equal', () => {
      expect(compareVersions('1.0', '1.0')).toBe(0);
      expect(compareVersions('2.5', '2.5')).toBe(0);
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    });

    it('should handle different version lengths', () => {
      expect(compareVersions('1.0', '1.0.0')).toBe(0);
      expect(compareVersions('1.0.1', '1.0')).toBe(1);
      expect(compareVersions('1.0', '1.0.1')).toBe(-1);
    });

    it('should handle multi-digit version numbers', () => {
      expect(compareVersions('1.10', '1.9')).toBe(1);
      expect(compareVersions('2.0.10', '2.0.9')).toBe(1);
    });
  });

  // ─── isVersionOutdated ──────────────────────────────────────────────────────

  describe('isVersionOutdated', () => {
    it('should return true when user version is null', () => {
      expect(isVersionOutdated(null, '1.0')).toBe(true);
    });

    it('should return true when user version is lower', () => {
      expect(isVersionOutdated('1.0', '2.0')).toBe(true);
      expect(isVersionOutdated('1.5', '1.6')).toBe(true);
    });

    it('should return false when user version is current', () => {
      expect(isVersionOutdated('2.0', '2.0')).toBe(false);
    });

    it('should return false when user version is higher (edge case)', () => {
      expect(isVersionOutdated('2.0', '1.0')).toBe(false);
    });
  });
});
