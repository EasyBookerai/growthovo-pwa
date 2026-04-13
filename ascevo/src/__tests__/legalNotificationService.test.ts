import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  sendLegalUpdatePushNotification,
  sendLegalUpdateEmailNotification,
  notifyAllUsersAboutDocumentUpdate,
  checkAndNotifyDocumentUpdates,
} from '../services/legalNotificationService';

// Mock dependencies
jest.mock('../services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
  },
}));

jest.mock('../services/legalDocumentUpdateService', () => ({
  getCurrentDocumentVersion: jest.fn(),
  getUsersNeedingDocumentReview: jest.fn(),
}));

// Import mocked modules
const { supabase } = require('../services/supabaseClient');
const legalDocumentUpdateService = require('../services/legalDocumentUpdateService');

// Mock fetch
global.fetch = jest.fn() as any;

describe('legalNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendLegalUpdatePushNotification', () => {
    it('should send push notification to user with valid token', async () => {
      const mockUser = { push_token: 'ExponentPushToken[test123]' };
      
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'notification-id' } }),
      });

      await sendLegalUpdatePushNotification(
        'user-123',
        'privacy_policy',
        '2.0',
        'Updated data retention policy',
        false
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://exp.host/--/api/v2/push/send',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Privacy Policy'),
        })
      );
    });

    it('should handle missing push token gracefully', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      await expect(
        sendLegalUpdatePushNotification(
          'user-123',
          'privacy_policy',
          '2.0',
          'Updated data retention policy',
          false
        )
      ).resolves.not.toThrow();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should send different message for required acknowledgment', async () => {
      const mockUser = { push_token: 'ExponentPushToken[test123]' };
      
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 'notification-id' } }),
      });

      await sendLegalUpdatePushNotification(
        'user-123',
        'terms_conditions',
        '2.0',
        'Updated liability terms',
        true // requires acknowledgment
      );

      const fetchCall = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      
      expect(body.title).toContain('Important');
      expect(body.body).toContain('acknowledge');
      expect(body.data.requires_acknowledgment).toBe(true);
    });
  });

  describe('sendLegalUpdateEmailNotification', () => {
    it('should send email notification to user', async () => {
      const mockUser = { email: 'user@example.com' };
      
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      supabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await sendLegalUpdateEmailNotification(
        'user-123',
        'privacy_policy',
        '2.0',
        'Updated data retention policy',
        false
      );

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'send-legal-update-email',
        expect.objectContaining({
          body: expect.objectContaining({
            to: 'user@example.com',
            subject: expect.stringContaining('Privacy Policy'),
            document_type: 'privacy_policy',
            version: '2.0',
          }),
        })
      );
    });

    it('should handle missing email gracefully', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      await expect(
        sendLegalUpdateEmailNotification(
          'user-123',
          'privacy_policy',
          '2.0',
          'Updated data retention policy',
          false
        )
      ).resolves.not.toThrow();

      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should generate HTML email with change summary', async () => {
      const mockUser = { email: 'user@example.com' };
      
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: mockUser, error: null }),
          }),
        }),
      });

      supabase.functions.invoke.mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await sendLegalUpdateEmailNotification(
        'user-123',
        'privacy_policy',
        '2.0',
        'Updated data retention policy',
        false
      );

      const invokeCall = supabase.functions.invoke.mock.calls[0];
      const emailBody = invokeCall[1].body.html;
      
      expect(emailBody).toContain('Privacy Policy');
      expect(emailBody).toContain('2.0');
      expect(emailBody).toContain('Updated data retention policy');
    });
  });

  describe('notifyAllUsersAboutDocumentUpdate', () => {
    it('should notify all users needing update', async () => {
      const mockDocument = {
        id: 'doc-1',
        document_type: 'privacy_policy',
        version: '2.0',
        change_summary: 'Updated data retention policy',
        effective_date: '2024-01-01',
        content: 'Full document content',
        language: 'en',
        is_current: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockUsersNeedingUpdate = [
        { user_id: 'user-1', document_type: 'privacy_policy', current_version: '2.0', user_version: '1.0' },
        { user_id: 'user-2', document_type: 'privacy_policy', current_version: '2.0', user_version: null },
      ];

      legalDocumentUpdateService.getCurrentDocumentVersion.mockResolvedValue(mockDocument);
      legalDocumentUpdateService.getUsersNeedingDocumentReview.mockResolvedValue(mockUsersNeedingUpdate);

      // Mock user data
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { push_token: 'token', email: 'user@example.com' },
              error: null,
            }),
          }),
        }),
      });

      (global.fetch as any).mockResolvedValue({ ok: true });
      supabase.functions.invoke.mockResolvedValue({ data: { success: true }, error: null });

      await notifyAllUsersAboutDocumentUpdate('privacy_policy', '2.0');

      expect(legalDocumentUpdateService.getUsersNeedingDocumentReview).toHaveBeenCalledWith('privacy_policy', '2.0');
      expect(global.fetch).toHaveBeenCalledTimes(2); // 2 push notifications
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(2); // 2 emails
    });

    it('should handle Terms & Conditions as requiring acknowledgment', async () => {
      const mockDocument = {
        id: 'doc-1',
        document_type: 'terms_conditions',
        version: '2.0',
        change_summary: 'Updated liability terms',
        effective_date: '2024-01-01',
        content: 'Full document content',
        language: 'en',
        is_current: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockUsersNeedingUpdate = [
        { user_id: 'user-1', document_type: 'terms_conditions', current_version: '2.0', user_version: '1.0' },
      ];

      legalDocumentUpdateService.getCurrentDocumentVersion.mockResolvedValue(mockDocument);
      legalDocumentUpdateService.getUsersNeedingDocumentReview.mockResolvedValue(mockUsersNeedingUpdate);

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { push_token: 'token', email: 'user@example.com' },
              error: null,
            }),
          }),
        }),
      });

      (global.fetch as any).mockResolvedValue({ ok: true });
      supabase.functions.invoke.mockResolvedValue({ data: { success: true }, error: null });

      await notifyAllUsersAboutDocumentUpdate('terms_conditions', '2.0');

      const fetchCall = (global.fetch as any).mock.calls[0];
      const pushBody = JSON.parse(fetchCall[1].body);
      
      expect(pushBody.data.requires_acknowledgment).toBe(true);
    });
  });

  describe('checkAndNotifyDocumentUpdates', () => {
    it('should check all document types and notify users', async () => {
      const mockDocument = {
        id: 'doc-1',
        document_type: 'privacy_policy',
        version: '2.0',
        change_summary: 'Updated',
        effective_date: '2024-01-01',
        content: 'Content',
        language: 'en',
        is_current: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const mockUsersNeedingUpdate = [
        { user_id: 'user-1', document_type: 'privacy_policy', current_version: '2.0', user_version: '1.0' },
      ];

      legalDocumentUpdateService.getCurrentDocumentVersion.mockResolvedValue(mockDocument);
      legalDocumentUpdateService.getUsersNeedingDocumentReview.mockResolvedValue(mockUsersNeedingUpdate);

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { push_token: 'token', email: 'user@example.com' },
              error: null,
            }),
          }),
        }),
      });

      (global.fetch as any).mockResolvedValue({ ok: true });
      supabase.functions.invoke.mockResolvedValue({ data: { success: true }, error: null });

      await checkAndNotifyDocumentUpdates();

      // Should check 4 document types: privacy_policy, terms_conditions, cookie_policy, subscription_terms
      expect(legalDocumentUpdateService.getCurrentDocumentVersion).toHaveBeenCalledTimes(4);
    });

    it('should skip documents with no users needing update', async () => {
      const mockDocument = {
        id: 'doc-1',
        document_type: 'privacy_policy',
        version: '2.0',
        change_summary: 'Updated',
        effective_date: '2024-01-01',
        content: 'Content',
        language: 'en',
        is_current: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      legalDocumentUpdateService.getCurrentDocumentVersion.mockResolvedValue(mockDocument);
      legalDocumentUpdateService.getUsersNeedingDocumentReview.mockResolvedValue([]);

      await checkAndNotifyDocumentUpdates();

      expect(global.fetch).not.toHaveBeenCalled();
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      legalDocumentUpdateService.getCurrentDocumentVersion.mockRejectedValue(
        new Error('Database error')
      );

      await expect(checkAndNotifyDocumentUpdates()).resolves.not.toThrow();
    });
  });
});
