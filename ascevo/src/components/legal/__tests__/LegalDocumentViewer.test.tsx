import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LegalDocumentViewer from '../LegalDocumentViewer';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const { useTranslation } = require('react-i18next');

describe('LegalDocumentViewer - Language Fallback', () => {
  const mockT = (key: string) => {
    const translations: Record<string, string> = {
      'legal.viewer.loading': 'Loading document...',
      'legal.viewer.loadError': 'Failed to load document. Please try again.',
      'legal.viewer.notFound': 'Document not found.',
      'legal.viewer.version': 'Version',
      'legal.viewer.effectiveDate': 'Effective Date',
      'legal.viewer.tableOfContents': 'Table of Contents',
      'legal.viewer.accept': 'I Accept',
      'legal.viewer.fallbackNotice': 'This document is not available in your language. English version is displayed.',
      'common.back': 'Back',
    };
    return translations[key] || key;
  };

  beforeEach(() => {
    useTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'en',
      },
    });
  });

  it('should display fallback notice when document is not available in user language', async () => {
    // Mock i18n to return a non-English language
    useTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'zh', // Chinese - not supported
      },
    });

    const { getByText } = render(
      <LegalDocumentViewer
        documentType="privacy_policy"
        showAcceptButton={false}
        showTableOfContents={false}
      />
    );

    // Wait for document to load
    await waitFor(() => {
      expect(getByText(/This document is not available in your language/)).toBeTruthy();
    });
  });

  it('should NOT display fallback notice when document is available in user language', async () => {
    // Mock i18n to return English
    useTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'en',
      },
    });

    const { queryByText } = render(
      <LegalDocumentViewer
        documentType="privacy_policy"
        showAcceptButton={false}
        showTableOfContents={false}
      />
    );

    // Wait for document to load
    await waitFor(() => {
      expect(queryByText(/This document is not available in your language/)).toBeNull();
    });
  });

  it('should handle loading state correctly', async () => {
    const { getByText } = render(
      <LegalDocumentViewer
        documentType="privacy_policy"
        showAcceptButton={false}
        showTableOfContents={false}
      />
    );

    // Should show loading initially
    expect(getByText('Loading document...')).toBeTruthy();
  });

  it('should display document metadata when loaded', async () => {
    const { getByText } = render(
      <LegalDocumentViewer
        documentType="privacy_policy"
        showAcceptButton={false}
        showTableOfContents={true}
      />
    );

    // Wait for document to load
    await waitFor(() => {
      expect(getByText(/Version:/)).toBeTruthy();
      expect(getByText(/Effective Date:/)).toBeTruthy();
    });
  });

  it('should render accept button when showAcceptButton is true', async () => {
    const mockOnAccept = jest.fn();

    const { getByText } = render(
      <LegalDocumentViewer
        documentType="privacy_policy"
        showAcceptButton={true}
        onAccept={mockOnAccept}
        showTableOfContents={false}
      />
    );

    // Wait for document to load
    await waitFor(() => {
      expect(getByText('I Accept')).toBeTruthy();
    });
  });

  it('should render back button when onBack is provided', async () => {
    const mockOnBack = jest.fn();

    const { getByText } = render(
      <LegalDocumentViewer
        documentType="privacy_policy"
        showAcceptButton={false}
        onBack={mockOnBack}
        showTableOfContents={false}
      />
    );

    // Wait for document to load
    await waitFor(() => {
      expect(getByText(/Back/)).toBeTruthy();
    });
  });
});
