import { useState, useEffect, useCallback } from 'react';
import {
  getAllDocumentsNeedingReview,
  type DocumentUpdateStatus,
} from '../services/legalDocumentUpdateService';
import { logConsent } from '../services/legalConsentService';
import { useAuthStore } from '../store';

interface UseLegalDocumentUpdatesResult {
  updates: DocumentUpdateStatus[];
  hasUpdates: boolean;
  hasRequiredUpdates: boolean;
  isLoading: boolean;
  error: string | null;
  checkForUpdates: () => Promise<void>;
  acknowledgeUpdate: (documentType: string) => Promise<void>;
  dismissNotification: () => void;
  showNotification: boolean;
}

/**
 * Hook to manage legal document update notifications
 * 
 * Checks for document updates, manages notification state,
 * and handles user acknowledgments.
 * 
 * Requirements: 11.2-11.4 (Document Update Notifications)
 * Task: 8.2 (Create update notification UI)
 */
export function useLegalDocumentUpdates(): UseLegalDocumentUpdatesResult {
  const user = useAuthStore((state) => state.user);
  const [updates, setUpdates] = useState<DocumentUpdateStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [dismissedUpdates, setDismissedUpdates] = useState<Set<string>>(new Set());

  const checkForUpdates = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const needingReview = await getAllDocumentsNeedingReview(user.id);
      
      // Filter out dismissed updates (unless they're required)
      const filteredUpdates = needingReview.filter(
        (update) =>
          update.document_type === 'terms_conditions' ||
          !dismissedUpdates.has(update.document_type)
      );

      setUpdates(filteredUpdates);
      setShowNotification(filteredUpdates.length > 0);
    } catch (err) {
      console.error('Failed to check for legal document updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, dismissedUpdates]);

  const acknowledgeUpdate = useCallback(
    async (documentType: string) => {
      if (!user?.id) return;

      try {
        const update = updates.find((u) => u.document_type === documentType);
        if (!update) return;

        // Log the consent
        await logConsent(
          user.id,
          documentType as any,
          update.current_version,
          'click_through'
        );

        // Remove this update from the list
        setUpdates((prev) => prev.filter((u) => u.document_type !== documentType));

        // If no more updates, hide notification
        if (updates.length === 1) {
          setShowNotification(false);
        }
      } catch (err) {
        console.error('Failed to acknowledge update:', err);
        setError(err instanceof Error ? err.message : 'Failed to acknowledge update');
      }
    },
    [user?.id, updates]
  );

  const dismissNotification = useCallback(() => {
    // Only dismiss if there are no required updates
    const hasRequired = updates.some((u) => u.document_type === 'terms_conditions');
    
    if (!hasRequired) {
      // Mark all current updates as dismissed
      const newDismissed = new Set(dismissedUpdates);
      updates.forEach((update) => {
        newDismissed.add(update.document_type);
      });
      setDismissedUpdates(newDismissed);
      setShowNotification(false);
    }
  }, [updates, dismissedUpdates]);

  // Check for updates on mount and when user changes
  useEffect(() => {
    checkForUpdates();
  }, [checkForUpdates]);

  const hasUpdates = updates.length > 0;
  const hasRequiredUpdates = updates.some(
    (update) => update.document_type === 'terms_conditions'
  );

  return {
    updates,
    hasUpdates,
    hasRequiredUpdates,
    isLoading,
    error,
    checkForUpdates,
    acknowledgeUpdate,
    dismissNotification,
    showNotification,
  };
}
