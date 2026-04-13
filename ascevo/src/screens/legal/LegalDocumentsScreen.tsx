import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../theme';
import { LegalDocumentViewer } from '../../components/legal';
import { DocumentType } from '../../services/legalConsentService';

/**
 * LegalDocumentsScreen
 * 
 * Screen that displays a list of legal documents and allows users to view them.
 * Accessible from Settings > Legal Documents.
 * 
 * Requirements: Task 3.2 (Update SettingsScreen with legal section)
 */
export default function LegalDocumentsScreen() {
  const { t } = useTranslation();
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);

  // ─── Document List ──────────────────────────────────────────────────────────

  const documents: Array<{
    type: DocumentType;
    title: string;
    description: string;
  }> = [
    {
      type: 'privacy_policy',
      title: t('legal.documents.privacyPolicy.title'),
      description: t('legal.documents.privacyPolicy.description'),
    },
    {
      type: 'terms_conditions',
      title: t('legal.documents.termsConditions.title'),
      description: t('legal.documents.termsConditions.description'),
    },
    {
      type: 'cookie_policy',
      title: t('legal.documents.cookiePolicy.title'),
      description: t('legal.documents.cookiePolicy.description'),
    },
    {
      type: 'subscription_terms',
      title: t('legal.documents.subscriptionTerms.title'),
      description: t('legal.documents.subscriptionTerms.description'),
    },
  ];

  // ─── Render Document List ───────────────────────────────────────────────────

  if (!selectedDocument) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('legal.documents.title')}</Text>
          <Text style={styles.subtitle}>{t('legal.documents.subtitle')}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {documents.map((doc) => (
            <TouchableOpacity
              key={doc.type}
              style={styles.documentCard}
              onPress={() => setSelectedDocument(doc.type)}
              accessibilityRole="button"
              accessibilityLabel={doc.title}
            >
              <Text style={styles.documentTitle}>{doc.title}</Text>
              <Text style={styles.documentDescription}>{doc.description}</Text>
              <Text style={styles.viewButton}>{t('legal.documents.view')} →</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('legal.documents.footer')}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Render Document Viewer ─────────────────────────────────────────────────

  return (
    <LegalDocumentViewer
      documentType={selectedDocument}
      onBack={() => setSelectedDocument(null)}
      showTableOfContents={true}
      showAcceptButton={false}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  documentCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  documentTitle: {
    ...typography.h3,
    color: colors.text,
  },
  documentDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  viewButton: {
    ...typography.bodyBold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerText: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
