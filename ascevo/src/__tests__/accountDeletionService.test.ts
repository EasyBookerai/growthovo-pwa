import {
  scheduleAccountDeletion,
  cancelAccountDeletion,
  getDeletionStatus,
} from '../services/accountDeletionService';
import { supabase } from '../services/supabaseClient';

jest.mock('../services/supabaseClient');

describe('accountDeletionService', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scheduleAccountDeletion', () => {
    it('should schedule account deletion with 30-day grace period', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: {
          id: mockUserId,
          deletion_scheduled_at: new Date().toISOString(),
          deletion_grace_period_ends: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        error: null,
      });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null }),
            update: mockUpdate.mockReturnValue({
              eq: jest.fn().mockReturnValue({
                select: mockSelect.mockReturnValue({
                  single: mockSingle,
                }),
              }),
            }),
          };
        }
        if (table === 'subscriptions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null }),
          };
        }
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const result = await scheduleAccountDeletion(mockUserId);

      expect(result.isScheduled).toBe(true);
      expect(result.gracePeriodEnds).toBeTruthy();
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          deletion_scheduled_at: expect.any(String),
          deletion_grace_period_ends: expect.any(String),
        })
      );
    });

    it('should log deletion request to database', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'account_deletion_requests') {
          return { insert: mockInsert };
        }
        if (table === 'users') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null }),
            update: jest.fn().mockReturnThis(),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null }),
        };
      });

      await scheduleAccountDeletion(mockUserId);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          status: 'scheduled',
        })
      );
    });

    it('should throw error on scheduling failure', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null }),
        update: jest.fn().mockReturnThis(),
      }));

      (supabase.from as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
            }),
          }),
        }),
      }));

      await expect(scheduleAccountDeletion(mockUserId)).rejects.toThrow();
    });
  });

  describe('cancelAccountDeletion', () => {
    it('should cancel scheduled deletion', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: null, error: null });

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'users') {
          return {
            update: mockUpdate.mockReturnValue({
              eq: mockEq,
            }),
          };
        }
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
        };
      });

      await cancelAccountDeletion(mockUserId);

      expect(mockUpdate).toHaveBeenCalledWith({
        deletion_scheduled_at: null,
        deletion_grace_period_ends: null,
      });
    });

    it('should update deletion request status to cancelled', async () => {
      const mockUpdate = jest.fn().mockReturnThis();

      (supabase.from as jest.Mock).mockImplementation((table: string) => ({
        update: mockUpdate.mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      }));

      await cancelAccountDeletion(mockUserId);

      expect(mockUpdate).toHaveBeenCalledWith({ status: 'cancelled' });
    });
  });

  describe('getDeletionStatus', () => {
    it('should return deletion status when scheduled', async () => {
      const scheduledDate = new Date().toISOString();
      const gracePeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            deletion_scheduled_at: scheduledDate,
            deletion_grace_period_ends: gracePeriodEnd,
          },
          error: null,
        }),
      }));

      const result = await getDeletionStatus(mockUserId);

      expect(result.isScheduled).toBe(true);
      expect(result.scheduledDate).toBe(scheduledDate);
      expect(result.gracePeriodEnds).toBe(gracePeriodEnd);
    });

    it('should return not scheduled when no deletion pending', async () => {
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            deletion_scheduled_at: null,
            deletion_grace_period_ends: null,
          },
          error: null,
        }),
      }));

      const result = await getDeletionStatus(mockUserId);

      expect(result.isScheduled).toBe(false);
      expect(result.scheduledDate).toBeNull();
      expect(result.gracePeriodEnds).toBeNull();
    });
  });
});
