import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLegalDocumentUpdates } from '../useLegalDocumentUpdates';
import * as legalDocumentUpdateService from '../../services/legalDocumentUpdateService';
import * as legalConsentService from '../../services/legalConsentService';

// Mock the services
jest.mock('../../services/legalDocumentUpdateService');
jest.mock('../../services/legalConsentService');

// Mock the auth store
const mockUser = { id: 'test-user-id' };
jest.mock('../../store', () => ({
  useAuthStore: (selector: any) => {
    const state = { user: mockUser };
    return selector ? selector(state) : state;
  },
}));

describe('useLegalDocumentUpdates', () => {
  const mockGetAllDocumentsNeedingReview = jest.mocked(
    legalDocumentUpdateService.getAllDocumentsNeedingReview
  );
  const mockLogConsent = jest.mocked(legalConsentService.logConsent);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty state', () => {
    mockGetAllDocumentsNeedingReview.mockResolvedValue([]);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    expect(result.current.updates).toEqual([]);
    expect(result.current.hasUpdates).toBe(false);
    expect(result.current.hasRequiredUpdates).toBe(false);
    expect(result.current.showNotification).toBe(false);
  });

  it('checks for updates on mount', async () => {
    const mockUpdates = [
      {
        document_type: 'privacy_policy' as const,
        current_version: '2.0',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Updated data retention',
      },
    ];

    mockGetAllDocumentsNeedingReview.mockResolvedValue(mockUpdates);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    await waitFor(() => {
      expect(result.current.updates).toEqual(mockUpdates);
      expect(result.current.hasUpdates).toBe(true);
      expect(result.current.showNotification).toBe(true);
    });

    expect(mockGetAllDocumentsNeedingReview).toHaveBeenCalledWith('test-user-id');
  });

  it('identifies required updates (Terms and Conditions)', async () => {
    const mockUpdates = [
      {
        document_type: 'terms_conditions' as const,
        current_version: '3.0',
        user_consented_version: '2.0',
        needs_review: true,
        change_summary: 'Updated liability clauses',
      },
    ];

    mockGetAllDocumentsNeedingReview.mockResolvedValue(mockUpdates);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    await waitFor(() => {
      expect(result.current.hasRequiredUpdates).toBe(true);
    });
  });

  it('acknowledges an update', async () => {
    const mockUpdates = [
      {
        document_type: 'privacy_policy' as const,
        current_version: '2.0',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Updated data retention',
      },
    ];

    mockGetAllDocumentsNeedingReview.mockResolvedValue(mockUpdates);
    mockLogConsent.mockResolvedValue({} as any);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    await waitFor(() => {
      expect(result.current.updates).toEqual(mockUpdates);
    });

    await act(async () => {
      await result.current.acknowledgeUpdate('privacy_policy');
    });

    expect(mockLogConsent).toHaveBeenCalledWith(
      'test-user-id',
      'privacy_policy',
      '2.0',
      'click_through'
    );

    await waitFor(() => {
      expect(result.current.updates).toEqual([]);
      expect(result.current.showNotification).toBe(false);
    });
  });

  it('dismisses notification for non-required updates', async () => {
    const mockUpdates = [
      {
        document_type: 'privacy_policy' as const,
        current_version: '2.0',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Updated data retention',
      },
    ];

    mockGetAllDocumentsNeedingReview.mockResolvedValue(mockUpdates);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    await waitFor(() => {
      expect(result.current.showNotification).toBe(true);
    });

    act(() => {
      result.current.dismissNotification();
    });

    expect(result.current.showNotification).toBe(false);
  });

  it('does not dismiss notification for required updates', async () => {
    const mockUpdates = [
      {
        document_type: 'terms_conditions' as const,
        current_version: '3.0',
        user_consented_version: '2.0',
        needs_review: true,
        change_summary: 'Updated liability clauses',
      },
    ];

    mockGetAllDocumentsNeedingReview.mockResolvedValue(mockUpdates);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    await waitFor(() => {
      expect(result.current.showNotification).toBe(true);
    });

    act(() => {
      result.current.dismissNotification();
    });

    // Should still be visible because it's a required update
    expect(result.current.showNotification).toBe(true);
  });

  it('handles errors gracefully', async () => {
    const mockError = new Error('Network error');
    mockGetAllDocumentsNeedingReview.mockRejectedValue(mockError);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('manually checks for updates', async () => {
    const mockUpdates = [
      {
        document_type: 'cookie_policy' as const,
        current_version: '1.5',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Added new cookies',
      },
    ];

    mockGetAllDocumentsNeedingReview.mockResolvedValue([]);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    await waitFor(() => {
      expect(result.current.updates).toEqual([]);
    });

    // Simulate new updates available
    mockGetAllDocumentsNeedingReview.mockResolvedValue(mockUpdates);

    await act(async () => {
      await result.current.checkForUpdates();
    });

    await waitFor(() => {
      expect(result.current.updates).toEqual(mockUpdates);
    });
  });

  it('filters out dismissed updates on subsequent checks', async () => {
    const mockUpdates = [
      {
        document_type: 'privacy_policy' as const,
        current_version: '2.0',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Updated data retention',
      },
      {
        document_type: 'cookie_policy' as const,
        current_version: '1.5',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Added new cookies',
      },
    ];

    mockGetAllDocumentsNeedingReview.mockResolvedValue(mockUpdates);

    const { result } = renderHook(() => useLegalDocumentUpdates());

    await waitFor(() => {
      expect(result.current.updates).toHaveLength(2);
    });

    // Dismiss the notification
    act(() => {
      result.current.dismissNotification();
    });

    // Check for updates again
    await act(async () => {
      await result.current.checkForUpdates();
    });

    // Dismissed updates should be filtered out
    await waitFor(() => {
      expect(result.current.updates).toEqual([]);
    });
  });
});
