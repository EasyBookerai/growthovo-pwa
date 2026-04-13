import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AITransparencyNotice from '../AITransparencyNotice';
import CrisisDisclaimerBanner from '../CrisisDisclaimerBanner';
import AgeVerificationCheckbox from '../AgeVerificationCheckbox';
import SubscriptionTermsModal from '../SubscriptionTermsModal';
import CookieConsentBanner from '../CookieConsentBanner';
import LegalDocumentViewer from '../LegalDocumentViewer';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

describe('Legal Components', () => {
  describe('AITransparencyNotice', () => {
    it('renders when visible', () => {
      const onAccept = jest.fn();
      const { getByText } = render(
        <AITransparencyNotice visible={true} onAccept={onAccept} />
      );
      expect(getByText('legal.aiNotice.title')).toBeTruthy();
    });

    it('calls onAccept when accept button is pressed', () => {
      const onAccept = jest.fn();
      const { getByText } = render(
        <AITransparencyNotice visible={true} onAccept={onAccept} />
      );
      fireEvent.press(getByText('legal.aiNotice.accept'));
      expect(onAccept).toHaveBeenCalled();
    });

    it('calls onLearnMore when provided and pressed', () => {
      const onAccept = jest.fn();
      const onLearnMore = jest.fn();
      const { getByText } = render(
        <AITransparencyNotice
          visible={true}
          onAccept={onAccept}
          onLearnMore={onLearnMore}
        />
      );
      fireEvent.press(getByText('legal.aiNotice.learnMore'));
      expect(onLearnMore).toHaveBeenCalled();
    });
  });

  describe('CrisisDisclaimerBanner', () => {
    it('renders crisis warning', () => {
      const { getByText } = render(<CrisisDisclaimerBanner />);
      expect(getByText('legal.crisisDisclaimer.title')).toBeTruthy();
    });

    it('calls onViewResources when provided and pressed', () => {
      const onViewResources = jest.fn();
      const { getByText } = render(
        <CrisisDisclaimerBanner onViewResources={onViewResources} />
      );
      fireEvent.press(getByText('legal.crisisDisclaimer.viewResources'));
      expect(onViewResources).toHaveBeenCalled();
    });
  });

  describe('AgeVerificationCheckbox', () => {
    it('renders unchecked by default', () => {
      const onToggle = jest.fn();
      const { getByText } = render(
        <AgeVerificationCheckbox checked={false} onToggle={onToggle} />
      );
      expect(getByText('legal.ageVerification.label')).toBeTruthy();
    });

    it('calls onToggle when pressed', () => {
      const onToggle = jest.fn();
      const { getByText } = render(
        <AgeVerificationCheckbox checked={false} onToggle={onToggle} />
      );
      fireEvent.press(getByText('legal.ageVerification.label'));
      expect(onToggle).toHaveBeenCalled();
    });

    it('shows checkmark when checked', () => {
      const onToggle = jest.fn();
      const { getByText } = render(
        <AgeVerificationCheckbox checked={true} onToggle={onToggle} />
      );
      expect(getByText('✓')).toBeTruthy();
    });
  });

  describe('SubscriptionTermsModal', () => {
    it('renders when visible', () => {
      const onClose = jest.fn();
      const { getByText } = render(
        <SubscriptionTermsModal visible={true} onClose={onClose} />
      );
      expect(getByText('legal.subscriptionTerms.title')).toBeTruthy();
    });

    it('calls onClose when close button is pressed', () => {
      const onClose = jest.fn();
      const { getAllByText } = render(
        <SubscriptionTermsModal visible={true} onClose={onClose} />
      );
      // There are multiple close buttons (header X and footer button)
      const closeButtons = getAllByText('common.close');
      fireEvent.press(closeButtons[0]);
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onViewFullTerms when provided and pressed', () => {
      const onClose = jest.fn();
      const onViewFullTerms = jest.fn();
      const { getByText } = render(
        <SubscriptionTermsModal
          visible={true}
          onClose={onClose}
          onViewFullTerms={onViewFullTerms}
        />
      );
      fireEvent.press(getByText('legal.subscriptionTerms.viewFullTerms'));
      expect(onViewFullTerms).toHaveBeenCalled();
    });
  });

  describe('CookieConsentBanner', () => {
    it('renders when visible', () => {
      const onAcceptAll = jest.fn();
      const onEssentialOnly = jest.fn();
      const { getByText } = render(
        <CookieConsentBanner
          visible={true}
          onAcceptAll={onAcceptAll}
          onEssentialOnly={onEssentialOnly}
        />
      );
      expect(getByText('legal.cookieConsent.title')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const onAcceptAll = jest.fn();
      const onEssentialOnly = jest.fn();
      const { queryByText } = render(
        <CookieConsentBanner
          visible={false}
          onAcceptAll={onAcceptAll}
          onEssentialOnly={onEssentialOnly}
        />
      );
      expect(queryByText('legal.cookieConsent.title')).toBeNull();
    });

    it('calls onAcceptAll when accept all button is pressed', () => {
      const onAcceptAll = jest.fn();
      const onEssentialOnly = jest.fn();
      const { getByText } = render(
        <CookieConsentBanner
          visible={true}
          onAcceptAll={onAcceptAll}
          onEssentialOnly={onEssentialOnly}
        />
      );
      fireEvent.press(getByText('legal.cookieConsent.acceptAll'));
      expect(onAcceptAll).toHaveBeenCalled();
    });

    it('calls onEssentialOnly when essential only button is pressed', () => {
      const onAcceptAll = jest.fn();
      const onEssentialOnly = jest.fn();
      const { getByText } = render(
        <CookieConsentBanner
          visible={true}
          onAcceptAll={onAcceptAll}
          onEssentialOnly={onEssentialOnly}
        />
      );
      fireEvent.press(getByText('legal.cookieConsent.essentialOnly'));
      expect(onEssentialOnly).toHaveBeenCalled();
    });

    it('calls onCustomize when provided and pressed', () => {
      const onAcceptAll = jest.fn();
      const onEssentialOnly = jest.fn();
      const onCustomize = jest.fn();
      const { getByText } = render(
        <CookieConsentBanner
          visible={true}
          onAcceptAll={onAcceptAll}
          onEssentialOnly={onEssentialOnly}
          onCustomize={onCustomize}
        />
      );
      fireEvent.press(getByText('legal.cookieConsent.customize'));
      expect(onCustomize).toHaveBeenCalled();
    });
  });

  describe('LegalDocumentViewer', () => {
    it('renders loading state initially', () => {
      const { getByText } = render(
        <LegalDocumentViewer documentType="privacy_policy" />
      );
      expect(getByText('legal.viewer.loading')).toBeTruthy();
    });

    it('calls onBack when back button is pressed', async () => {
      const onBack = jest.fn();
      const { findByText } = render(
        <LegalDocumentViewer documentType="privacy_policy" onBack={onBack} />
      );
      
      // Wait for document to load
      const backButton = await findByText('← common.back');
      fireEvent.press(backButton);
      expect(onBack).toHaveBeenCalled();
    });

    it('calls onAccept when accept button is pressed', async () => {
      const onAccept = jest.fn();
      const { findByText } = render(
        <LegalDocumentViewer
          documentType="privacy_policy"
          onAccept={onAccept}
          showAcceptButton={true}
        />
      );
      
      // Wait for document to load
      const acceptButton = await findByText('legal.viewer.accept');
      fireEvent.press(acceptButton);
      expect(onAccept).toHaveBeenCalled();
    });

    it('displays document metadata', async () => {
      const { findByText } = render(
        <LegalDocumentViewer documentType="privacy_policy" />
      );
      
      // Wait for document to load and check for version info
      const versionText = await findByText(/legal\.viewer\.version/);
      expect(versionText).toBeTruthy();
    });

    it('toggles table of contents', async () => {
      const { findByText } = render(
        <LegalDocumentViewer
          documentType="privacy_policy"
          showTableOfContents={true}
        />
      );
      
      // Wait for document to load
      const tocTitle = await findByText('legal.viewer.tableOfContents');
      expect(tocTitle).toBeTruthy();
    });

    it('does not show accept button when showAcceptButton is false', async () => {
      const { queryByText, findByText } = render(
        <LegalDocumentViewer
          documentType="privacy_policy"
          showAcceptButton={false}
        />
      );
      
      // Wait for document to load
      await findByText(/legal\.viewer\.version/);
      
      // Accept button should not be present
      expect(queryByText('legal.viewer.accept')).toBeNull();
    });
  });
});
