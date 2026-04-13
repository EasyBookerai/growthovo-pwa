/**
 * INTEGRATION EXAMPLE
 * 
 * This file shows how to integrate the Legal Document Update Notification system
 * into your app. Copy the relevant code to your App.tsx or main navigation component.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { LegalDocumentUpdateManager } from './components/legal';

// ─── Example 1: Simple Integration (Recommended) ─────────────────────────────

/**
 * Add LegalDocumentUpdateManager to your app root.
 * This is the simplest and recommended approach.
 */
export function AppWithSimpleIntegration() {
  return (
    <>
      <NavigationContainer>
        {/* Your existing navigation */}
        <RootNavigator />
      </NavigationContainer>
      
      {/* Add this single line - it handles everything automatically */}
      <LegalDocumentUpdateManager mode="modal" autoShow={true} />
    </>
  );
}

// ─── Example 2: Banner Mode ───────────────────────────────────────────────────

/**
 * Use banner mode for a less intrusive notification.
 * Good for non-critical updates or when you want to minimize disruption.
 */
export function AppWithBannerMode() {
  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      
      {/* Banner slides in from top, less intrusive than modal */}
      <LegalDocumentUpdateManager mode="banner" autoShow={true} />
    </>
  );
}

// ─── Example 3: Custom Integration ───────────────────────────────────────────

/**
 * For more control, use the hook directly and build your own UI.
 */
import { useLegalDocumentUpdates } from './hooks/useLegalDocumentUpdates';
import { 
  LegalDocumentUpdateNotification,
  LegalDocumentUpdateBanner,
  LegalDocumentViewer,
} from './components/legal';

export function AppWithCustomIntegration() {
  const {
    updates,
    hasUpdates,
    hasRequiredUpdates,
    acknowledgeUpdate,
    dismissNotification,
    showNotification,
  } = useLegalDocumentUpdates();

  const [viewingDocument, setViewingDocument] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      
      {/* Show banner at top of screen */}
      <LegalDocumentUpdateBanner
        visible={showNotification && !showModal}
        updateCount={updates.length}
        onPress={() => setShowModal(true)}
        onDismiss={hasRequiredUpdates ? undefined : dismissNotification}
      />
      
      {/* Show modal when user taps banner */}
      <LegalDocumentUpdateNotification
        visible={showModal}
        updates={updates}
        onViewDocument={(docType) => setViewingDocument(docType)}
        onAcknowledge={async (docType) => {
          await acknowledgeUpdate(docType);
          if (updates.length === 1) {
            setShowModal(false);
          }
        }}
        onDismiss={hasRequiredUpdates ? undefined : () => {
          setShowModal(false);
          dismissNotification();
        }}
      />
      
      {/* Show document viewer when user wants to read full document */}
      {viewingDocument && (
        <LegalDocumentViewer
          visible={true}
          documentType={viewingDocument as any}
          onClose={() => setViewingDocument(null)}
          onAccept={
            viewingDocument === 'terms_conditions'
              ? async () => {
                  await acknowledgeUpdate(viewingDocument);
                  setViewingDocument(null);
                }
              : undefined
          }
        />
      )}
    </>
  );
}

// ─── Example 4: Conditional Display ──────────────────────────────────────────

/**
 * Only show notifications on certain screens or conditions.
 */
export function AppWithConditionalDisplay() {
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false);

  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      
      {/* Only show after onboarding is complete */}
      {isOnboardingComplete && (
        <LegalDocumentUpdateManager mode="modal" autoShow={true} />
      )}
    </>
  );
}

// ─── Example 5: Manual Trigger ────────────────────────────────────────────────

/**
 * Manually check for updates at specific times.
 */
import { useLegalDocumentUpdates } from './hooks/useLegalDocumentUpdates';

export function SettingsScreen() {
  const { checkForUpdates, hasUpdates, updates } = useLegalDocumentUpdates();

  return (
    <View>
      <TouchableOpacity onPress={checkForUpdates}>
        <Text>Check for Legal Document Updates</Text>
      </TouchableOpacity>
      
      {hasUpdates && (
        <Text>You have {updates.length} document(s) to review</Text>
      )}
    </View>
  );
}

// ─── Example 6: Navigation Integration ───────────────────────────────────────

/**
 * Navigate to a dedicated screen for reviewing updates.
 */
import { useNavigation } from '@react-navigation/native';

export function AppWithNavigationIntegration() {
  const navigation = useNavigation();
  const { updates, showNotification } = useLegalDocumentUpdates();

  React.useEffect(() => {
    if (showNotification && updates.length > 0) {
      // Navigate to a dedicated legal updates screen
      navigation.navigate('LegalUpdates', { updates });
    }
  }, [showNotification, updates, navigation]);

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// ─── Example 7: With Loading State ───────────────────────────────────────────

/**
 * Show loading indicator while checking for updates.
 */
export function AppWithLoadingState() {
  const { isLoading, error } = useLegalDocumentUpdates();

  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <Text>Checking for updates...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorBanner}>
          <Text>Failed to check for updates: {error}</Text>
        </View>
      )}
      
      <LegalDocumentUpdateManager mode="modal" autoShow={true} />
    </>
  );
}

// ─── Placeholder Components ───────────────────────────────────────────────────

// These are just placeholders for the examples above
function RootNavigator() {
  return null;
}

const styles = {
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 9999,
  },
  errorBanner: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#DC2626',
    padding: 16,
    zIndex: 9999,
  },
};

// ─── Notes ────────────────────────────────────────────────────────────────────

/**
 * IMPORTANT NOTES:
 * 
 * 1. The LegalDocumentUpdateManager should be added at the ROOT level of your app,
 *    outside of any navigation containers or screens.
 * 
 * 2. For Terms & Conditions updates, the notification CANNOT be dismissed until
 *    the user acknowledges the update. This is intentional and required by law.
 * 
 * 3. The system automatically checks for updates when:
 *    - The app launches
 *    - The user logs in
 *    - You manually call checkForUpdates()
 * 
 * 4. Dismissed updates (non-Terms) won't show again unless:
 *    - The user clears app data
 *    - A new version of that document is released
 * 
 * 5. All acknowledgments are logged in the database with timestamps for legal compliance.
 * 
 * 6. Make sure your translation files include all the necessary keys (see LEGAL_UPDATE_NOTIFICATIONS.md)
 */
