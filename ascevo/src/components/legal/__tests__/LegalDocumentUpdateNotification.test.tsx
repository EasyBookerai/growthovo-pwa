import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LegalDocumentUpdateNotification from '../LegalDocumentUpdateNotification';
import type { DocumentUpdateStatus } from '../../../services/legalDocumentUpdateService';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'legal.updateNotification.title': 'Legal Documents Updated',
        'legal.updateNotification.subtitleRequired':
          'Please review and acknowledge the changes to continue.',
        'legal.updateNotification.subtitleOptional':
          'Please review the changes when you have a moment.',
        'legal.updateNotification.version': `Version ${params?.version || ''}`,
        'legal.updateNotification.whatsNew': "What's New:",
        'legal.updateNotification.viewDocument': 'View Document',
        'legal.updateNotification.acknowledge': 'I Acknowledge',
        'legal.updateNotification.requirementNotice':
          'You must acknowledge the Terms & Conditions update.',
        'legal.updateNotification.dismiss': "I'll Review Later",
        'legal.documents.privacyPolicy': 'Privacy Policy',
        'legal.documents.termsConditions': 'Terms & Conditions',
        'legal.documents.cookiePolicy': 'Cookie Policy',
      };
      return translations[key] || key;
    },
  }),
}));

describe('LegalDocumentUpdateNotification', () => {
  const mockOnViewDocument = jest.fn();
  const mockOnAcknowledge = jest.fn();
  const mockOnDismiss = jest.fn();

  const mockUpdates: DocumentUpdateStatus[] = [
    {
      document_type: 'privacy_policy',
      current_version: '2.0',
      user_consented_version: '1.0',
      needs_review: true,
      change_summary: 'Updated data retention policies',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when updates array is empty', () => {
    const { queryByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={[]}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    expect(queryByText('Legal Documents Updated')).toBeNull();
  });

  it('renders modal with update information', () => {
    const { getByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={mockUpdates}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    expect(getByText('Legal Documents Updated')).toBeTruthy();
    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('Version 2.0')).toBeTruthy();
    expect(getByText('Updated data retention policies')).toBeTruthy();
  });

  it('calls onViewDocument when view button is pressed', () => {
    const { getByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={mockUpdates}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    fireEvent.press(getByText('View Document'));
    expect(mockOnViewDocument).toHaveBeenCalledWith('privacy_policy');
  });

  it('shows acknowledge button for Terms and Conditions', () => {
    const termsUpdate: DocumentUpdateStatus[] = [
      {
        document_type: 'terms_conditions',
        current_version: '3.0',
        user_consented_version: '2.0',
        needs_review: true,
        change_summary: 'Updated liability clauses',
      },
    ];

    const { getByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={termsUpdate}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    expect(getByText('I Acknowledge')).toBeTruthy();
  });

  it('calls onAcknowledge when acknowledge button is pressed', () => {
    const termsUpdate: DocumentUpdateStatus[] = [
      {
        document_type: 'terms_conditions',
        current_version: '3.0',
        user_consented_version: '2.0',
        needs_review: true,
        change_summary: 'Updated liability clauses',
      },
    ];

    const { getByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={termsUpdate}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    fireEvent.press(getByText('I Acknowledge'));
    expect(mockOnAcknowledge).toHaveBeenCalledWith('terms_conditions');
  });

  it('shows requirement notice when Terms update is present', () => {
    const termsUpdate: DocumentUpdateStatus[] = [
      {
        document_type: 'terms_conditions',
        current_version: '3.0',
        user_consented_version: '2.0',
        needs_review: true,
        change_summary: 'Updated liability clauses',
      },
    ];

    const { getByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={termsUpdate}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    expect(
      getByText('You must acknowledge the Terms & Conditions update.')
    ).toBeTruthy();
  });

  it('shows dismiss button when no Terms update and onDismiss provided', () => {
    const { getByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={mockUpdates}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(getByText("I'll Review Later")).toBeTruthy();
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const { getByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={mockUpdates}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByText("I'll Review Later"));
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('does not show dismiss button when Terms update is present', () => {
    const termsUpdate: DocumentUpdateStatus[] = [
      {
        document_type: 'terms_conditions',
        current_version: '3.0',
        user_consented_version: '2.0',
        needs_review: true,
        change_summary: 'Updated liability clauses',
      },
    ];

    const { queryByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={termsUpdate}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(queryByText("I'll Review Later")).toBeNull();
  });

  it('handles multiple updates', () => {
    const multipleUpdates: DocumentUpdateStatus[] = [
      {
        document_type: 'privacy_policy',
        current_version: '2.0',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Updated data retention policies',
      },
      {
        document_type: 'cookie_policy',
        current_version: '1.5',
        user_consented_version: '1.0',
        needs_review: true,
        change_summary: 'Added new tracking cookies',
      },
    ];

    const { getByText } = render(
      <LegalDocumentUpdateNotification
        visible={true}
        updates={multipleUpdates}
        onViewDocument={mockOnViewDocument}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    expect(getByText('Privacy Policy')).toBeTruthy();
    expect(getByText('Cookie Policy')).toBeTruthy();
  });
});
