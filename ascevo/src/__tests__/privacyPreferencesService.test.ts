import {
  getPrivacyPreferences,
  updatePrivacyPreferences,
  updateAnalyticsPreference,
  updateMarketingEmailsPreference,
  updateDataSharingPreference,
} from '../services/privacyPreferencesService';
import { supabase } from '../services/supabaseClient';

jest.mock('../services/supabaseClient');

describe('privacyPreferencesService', () => {
  const mockUserId = 'user-123';
  const mockPreferences = {
    user_id: mockUserId,
    analytics_enabled: true,
    marketing_emails_enabled: false,
    data_sharing_consent: false,
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrivacyPreferences', () => {
    it('should return existing preferences', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPreferences, error: null }),
      }));

      const result = await getPrivacyPreferences(mockUserId);

      expect(result).toEqual(mockPreferences);
    });

    it('should create default preferences if none exist', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          ...mockPreferences,
          analytics_enabled: true,
          marketing_emails_enabled: false,
          data_sharing_consent: false,
        },
        error: null,
      });

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
          .mockResolvedValue({ data: mockPreferences, error: null }),
        insert: mockInsert.mockReturnValue({
          select: mockSelect.mockReturnValue({
            single: mockSingle,
          }),
        }),
      }));

      const result = await getPrivacyPreferences(mockUserId);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          analytics_enabled: true,
          marketing_emails_enabled: false,
          data_sharing_consent: false,
        })
      );
      expect(result).toBeTruthy();
    });

    it('should throw error on database failure', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
      }));

      await expect(getPrivacyPreferences(mockUserId)).rejects.toThrow('Failed to load privacy preferences');
    });
  });

  describe('updatePrivacyPreferences', () => {
    it('should update preferences', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...mockPreferences, analytics_enabled: false },
        error: null,
      });

      (supabase.from as jest.Mock).mockImplementation(() => ({
        update: mockUpdate.mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: mockSelect.mockReturnValue({
              single: mockSingle,
            }),
          }),
        }),
      }));

      const result = await updatePrivacyPreferences(mockUserId, { analytics_enabled: false });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          analytics_enabled: false,
          last_updated: expect.any(String),
        })
      );
      expect(result.analytics_enabled).toBe(false);
    });

    it('should throw error on update failure', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
      }));

      await expect(
        updatePrivacyPreferences(mockUserId, { analytics_enabled: false })
      ).rejects.toThrow('Failed to update privacy preferences');
    });
  });

  describe('updateAnalyticsPreference', () => {
    it('should update analytics preference', async () => {
      const mockUpdate = jest.fn().mockReturnThis();

      (supabase.from as jest.Mock).mockImplementation(() => ({
        update: mockUpdate.mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockPreferences, analytics_enabled: false },
          error: null,
        }),
      }));

      await updateAnalyticsPreference(mockUserId, false);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          analytics_enabled: false,
        })
      );
    });
  });

  describe('updateMarketingEmailsPreference', () => {
    it('should update marketing emails preference', async () => {
      const mockUpdate = jest.fn().mockReturnThis();

      (supabase.from as jest.Mock).mockImplementation(() => ({
        update: mockUpdate.mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockPreferences, marketing_emails_enabled: true },
          error: null,
        }),
      }));

      await updateMarketingEmailsPreference(mockUserId, true);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          marketing_emails_enabled: true,
        })
      );
    });
  });

  describe('updateDataSharingPreference', () => {
    it('should update data sharing preference', async () => {
      const mockUpdate = jest.fn().mockReturnThis();

      (supabase.from as jest.Mock).mockImplementation(() => ({
        update: mockUpdate.mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockPreferences, data_sharing_consent: true },
          error: null,
        }),
      }));

      await updateDataSharingPreference(mockUserId, true);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data_sharing_consent: true,
        })
      );
    });
  });
});
