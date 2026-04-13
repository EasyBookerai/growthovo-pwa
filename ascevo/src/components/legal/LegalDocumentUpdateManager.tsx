import React, { useState } from 'react';
import { useLegalDocumentUpdates } from '../../hooks/useLegalDocumentUpdates';
import LegalDocumentUpdateNotification from './LegalDocumentUpdateNotification';
import LegalDocumentUpdateBanner from './LegalDocumentUpdateBanner';
import LegalDocumentViewer from './LegalDocumentViewer';

interface LegalDocumentUpdateManagerProps {
  /**
   * Display mode for the notification
   * - 'modal': Full-screen modal (default, more prominent)
   * - 'banner': Top banner (less intrusive)
   */
  mode?: 'modal' | 'banner';
  
  /**
   * Whether to show the notification automatically
   * If false, you can control visibility externally
   */
  autoShow?: boolean;
}

/**
 * LegalDocumentUpdateManager
 * 
 * Manages the display of legal document update notifications.
 * Can be used in modal or banner mode.
 * 
 * Usage:
 * ```tsx
 * // In App.tsx or main navigation component
 * <LegalDocumentUpdateManager mode="modal" autoShow={true} />
 * ```
 * 
 * Requirements: 11.2-11.4 (Document Update Notifications)
 * Task: 8.2 (Create update notification UI)
 */
export default function LegalDocumentUpdateManager({
  mode = 'modal',
  autoShow = true,
}: LegalDocumentUpdateManagerProps) {
  const {
    updates,
    hasUpdates,
    hasRequiredUpdates,
    acknowledgeUpdate,
    dismissNotification,
    showNotification,
  } = useLegalDocumentUpdates();

  const [viewingDocument, setViewingDocument] = useState<string | null>(null);

  const handleViewDocument = (documentType: string) => {
    setViewingDocument(documentType);
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
  };

  const handleAcknowledge = async (documentType: string) => {
    await acknowledgeUpdate(documentType);
    
    // If viewing this document, close the viewer
    if (viewingDocument === documentType) {
      setViewingDocument(null);
    }
  };

  const handleDismiss = () => {
    if (!hasRequiredUpdates) {
      dismissNotification();
    }
  };

  const handleBannerPress = () => {
    // When banner is pressed, we could either:
    // 1. Show the modal version
    // 2. Navigate to a dedicated screen
    // For now, we'll just show the first document
    if (updates.length > 0) {
      handleViewDocument(updates[0].document_type);
    }
  };

  if (!autoShow || !hasUpdates) {
    return null;
  }

  return (
    <>
      {mode === 'modal' ? (
        <LegalDocumentUpdateNotification
          visible={showNotification}
          updates={updates}
          onViewDocument={handleViewDocument}
          onAcknowledge={handleAcknowledge}
          onDismiss={hasRequiredUpdates ? undefined : handleDismiss}
        />
      ) : (
        <LegalDocumentUpdateBanner
          visible={showNotification}
          updateCount={updates.length}
          onPress={handleBannerPress}
          onDismiss={hasRequiredUpdates ? undefined : handleDismiss}
        />
      )}

      {viewingDocument && (
        <LegalDocumentViewer
          visible={true}
          documentType={viewingDocument as any}
          onClose={handleCloseViewer}
          onAccept={
            viewingDocument === 'terms_conditions'
              ? () => handleAcknowledge(viewingDocument)
              : undefined
          }
        />
      )}
    </>
  );
}
