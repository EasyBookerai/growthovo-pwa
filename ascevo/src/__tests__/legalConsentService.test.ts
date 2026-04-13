/**
 * Tests for legalConsentService
 *
 * Covers:
 *  - Unit tests: logConsent, getUserConsents, hasUserConsented, getLatestConsent, getConsentsByType
 *  - Database interaction tests with mocked Supabase client
 *
 * Feature: legal-compliance-docs
 * Validates: Requirements 11.1, 11.2
 */

import { supabase } from '../services/supabaseClient';
import {
  logConsent,
  getUserConsents,
  hasUserConsented,
  getLatestConsent,
  getConsentsByType,
  type LegalConsent,
  type DocumentType,
  type ConsentMethod,
} from '../services/legalConsentService';

// Mock the supabase client
jest.mock('../services/supabaseClient');

// Mock Platform and Constants
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '17.0',
  },
}));

jest.mock('expo-constants', () => ({
  default: {
    deviceName: 'Test Device',
  },
}));

describe('legalConsentService', () => {
  const mockUserId = 'user-123';
  const mockDocumentType: DocumentType = 'privacy_policy';
  const mockVersion = '1.0';
  const mockMethod: ConsentMethod = 'explicit_checkbox';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── logConsent ─────────────────────────────────────────────────────────────

  describe('logConsent', () => {
    it('should successfully log consent with user agent', async () => {
      const mockConsent: LegalConsent = {
        id: 'consent-123',
        user_id: mockUserId,
        document_type: mockDocumentType,
        document_version: mockVersion,
        consented_at: new Date().toISOString(),
        ip_address: null,
        user_agent: 'Test Device (ios 17.0)',
        consent_method: mockMethod,
        created_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockConsent, error: null }),
          }),
        }),
      });

      const result = await logConsent(mockUserId, mockDocumentType, mockVersion, mockMethod);

      expect(result).toEqual(mockConsent);
      expect(supabase.from).toHaveBeenCalledWith('user_legal_consents');
    });

    it('should throw error when database insert fails', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      await expect(
        logConsent(mockUserId, mockDocumentType, mockVersion, mockMethod)
      ).rejects.toThrow();
    });

    it('should handle duplicate consent gracefully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'duplicate key value violates unique constraint' },
            }),
          }),
        }),
      });

      await expect(
        logConsent(mockUserId, mockDocumentType, mockVersion, mockMethod)
      ).rejects.toThrow('Consent already recorded.');
    });
  });

  // ─── getUserConsents ────────────────────────────────────────────────────────

  describe('getUserConsents', () => {
    it('should return all consents for a user', async () => {
      const mockConsents: LegalConsent[] = [
        {
          id: 'consent-1',
          user_id: mockUserId,
          document_type: 'privacy_policy',
          document_version: '1.0',
          consented_at: new Date().toISOString(),
          ip_address: null,
          user_agent: 'Test Device',
          consent_method: 'explicit_checkbox',
          created_at: new Date().toISOString(),
        },
        {
          id: 'consent-2',
          user_id: mockUserId,
          document_type: 'terms_conditions',
          document_version: '1.0',
          consented_at: new Date().toISOString(),
          ip_address: null,
          user_agent: 'Test Device',
          consent_method: 'explicit_checkbox',
          created_at: new Date().toISOString(),
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockConsents, error: null }),
          }),
        }),
      });

      const result = await getUserConsents(mockUserId);

      expect(result).toEqual(mockConsents);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when user has no consents', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });

      const result = await getUserConsents(mockUserId);

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
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

      await expect(getUserConsents(mockUserId)).rejects.toThrow();
    });
  });

  // ─── hasUserConsented ───────────────────────────────────────────────────────

  describe('hasUserConsented', () => {
    it('should return true when user has consented', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [{ id: 'consent-1' }], error: null }),
        }),
      });

      const result = await hasUserConsented(mockUserId, mockDocumentType);

      expect(result).toBe(true);
    });

    it('should return false when user has not consented', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await hasUserConsented(mockUserId, mockDocumentType);

      expect(result).toBe(false);
    });

    it('should check for minimum version when provided', async () => {
      const mockGte = jest.fn().mockReturnThis();
      
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          gte: mockGte,
          limit: jest.fn().mockResolvedValue({ data: [{ id: 'consent-1' }], error: null }),
        }),
      });

      await hasUserConsented(mockUserId, mockDocumentType, '2.0');

      expect(mockGte).toHaveBeenCalledWith('document_version', '2.0');
    });

    it('should return false when user has old version', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await hasUserConsented(mockUserId, mockDocumentType, '2.0');

      expect(result).toBe(false);
    });
  });

  // ─── getLatestConsent ───────────────────────────────────────────────────────

  describe('getLatestConsent', () => {
    it('should return the latest consent for a document type', async () => {
      const mockConsent: LegalConsent = {
        id: 'consent-123',
        user_id: mockUserId,
        document_type: mockDocumentType,
        document_version: '2.0',
        consented_at: new Date().toISOString(),
        ip_address: null,
        user_agent: 'Test Device',
        consent_method: 'explicit_checkbox',
        created_at: new Date().toISOString(),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockConsent, error: null }),
        }),
      });

      const result = await getLatestConsent(mockUserId, mockDocumentType);

      expect(result).toEqual(mockConsent);
    });

    it('should return null when no consent exists', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // No rows found
          }),
        }),
      });

      const result = await getLatestConsent(mockUserId, mockDocumentType);

      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'OTHER_ERROR', message: 'Database error' },
          }),
        }),
      });

      await expect(getLatestConsent(mockUserId, mockDocumentType)).rejects.toThrow();
    });
  });

  // ─── getConsentsByType ──────────────────────────────────────────────────────

  describe('getConsentsByType', () => {
    it('should return all consents for a specific document type', async () => {
      const mockConsents: LegalConsent[] = [
        {
          id: 'consent-1',
          user_id: mockUserId,
          document_type: mockDocumentType,
          document_version: '1.0',
          consented_at: '2024-01-01T00:00:00Z',
          ip_address: null,
          user_agent: 'Test Device',
          consent_method: 'explicit_checkbox',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'consent-2',
          user_id: mockUserId,
          document_type: mockDocumentType,
          document_version: '2.0',
          consented_at: '2024-02-01T00:00:00Z',
          ip_address: null,
          user_agent: 'Test Device',
          consent_method: 'explicit_checkbox',
          created_at: '2024-02-01T00:00:00Z',
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockConsents, error: null }),
        }),
      });

      const result = await getConsentsByType(mockUserId, mockDocumentType);

      expect(result).toEqual(mockConsents);
      expect(result).toHaveLength(2);
      expect(result[0].document_type).toBe(mockDocumentType);
      expect(result[1].document_type).toBe(mockDocumentType);
    });

    it('should return empty array when no consents exist for document type', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

      const result = await getConsentsByType(mockUserId, mockDocumentType);

      expect(result).toEqual([]);
    });
  });
});
