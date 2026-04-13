import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../theme';
import { DocumentType } from '../../services/legalConsentService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LegalDocument {
  type: DocumentType;
  version: string;
  effectiveDate: string;
  content: string;
  sections: DocumentSection[];
}

export interface DocumentSection {
  id: string;
  title: string;
  level: number; // 1 for h1, 2 for h2, etc.
  position: number; // Character position in content
}

interface LegalDocumentViewerProps {
  documentType: DocumentType;
  onAccept?: () => void;
  onBack?: () => void;
  showAcceptButton?: boolean;
  showTableOfContents?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * LegalDocumentViewer
 * 
 * Displays legal documents with markdown rendering, table of contents,
 * and optional accept button. Supports navigation and scrolling for long documents.
 * 
 * Requirements: Task 6.1, 6.2 (Legal Document Viewer)
 */
export default function LegalDocumentViewer({
  documentType,
  onAccept,
  onBack,
  showAcceptButton = false,
  showTableOfContents = true,
}: LegalDocumentViewerProps) {
  const { t, i18n } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTOC, setShowTOC] = useState(false);
  const [sectionPositions, setSectionPositions] = useState<Map<string, number>>(new Map());
  const [isFallbackLanguage, setIsFallbackLanguage] = useState(false);

  // ─── Load Document ──────────────────────────────────────────────────────────

  useEffect(() => {
    loadDocument();
  }, [documentType, i18n.language]);

  async function loadDocument() {
    setLoading(true);
    setError(null);
    setIsFallbackLanguage(false);

    try {
      // Try to load document in user's language first
      let doc: LegalDocument | null = null;
      let usedFallback = false;

      try {
        doc = await loadLocalDocument(documentType, i18n.language);
      } catch (err) {
        // If document not available in user's language, fall back to English
        console.log(`Document not available in ${i18n.language}, falling back to English`);
        if (i18n.language !== 'en') {
          try {
            doc = await loadLocalDocument(documentType, 'en');
            usedFallback = true;
          } catch (fallbackErr) {
            throw fallbackErr; // Re-throw if even English version fails
          }
        } else {
          throw err; // Re-throw if already trying English
        }
      }

      if (doc) {
        setDocument(doc);
        setIsFallbackLanguage(usedFallback);
      }
    } catch (err) {
      console.error('Failed to load document:', err);
      setError(t('legal.viewer.loadError'));
    } finally {
      setLoading(false);
    }
  }

  // ─── Load Local Document ────────────────────────────────────────────────────

  async function loadLocalDocument(
    type: DocumentType,
    language: string
  ): Promise<LegalDocument> {
    // Map document types to file names
    const documentFiles: Record<DocumentType, string> = {
      privacy_policy: 'privacy-policy',
      terms_conditions: 'terms-and-conditions',
      cookie_policy: 'cookie-policy',
      subscription_terms: 'subscription-terms',
      ai_transparency: 'ai-transparency',
      crisis_disclaimer: 'crisis-disclaimer',
      age_verification: 'age-verification',
    };

    const fileName = documentFiles[type];
    
    // Try to load the document in the specified language
    // For non-English languages, append the language code to the filename
    const languageSuffix = language !== 'en' ? `-${language}` : '';
    const fullFileName = `${fileName}${languageSuffix}`;
    
    // Load the markdown file
    const content = await loadMarkdownFile(fullFileName, language);
    
    // Parse the document
    const sections = parseDocumentSections(content);
    const metadata = parseDocumentMetadata(content);

    return {
      type,
      version: metadata.version,
      effectiveDate: metadata.effectiveDate,
      content,
      sections,
    };
  }

  // ─── Parse Document Sections ────────────────────────────────────────────────

  function parseDocumentSections(content: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = content.split('\n');
    let position = 0;

    for (const line of lines) {
      // Match markdown headers (# Header, ## Header, etc.)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        
        // Skip the main title (usually # at the top)
        if (level > 1 || sections.length > 0) {
          sections.push({
            id: `section-${sections.length}`,
            title,
            level,
            position,
          });
        }
      }
      position += line.length + 1; // +1 for newline
    }

    return sections;
  }

  // ─── Parse Document Metadata ────────────────────────────────────────────────

  function parseDocumentMetadata(content: string): {
    version: string;
    effectiveDate: string;
  } {
    const versionMatch = content.match(/\*\*Version:\*\*\s+(.+)/);
    const dateMatch = content.match(/\*\*Effective Date:\*\*\s+(.+)/);

    return {
      version: versionMatch ? versionMatch[1].trim() : '1.0',
      effectiveDate: dateMatch ? dateMatch[1].trim() : 'N/A',
    };
  }

  // ─── Load Markdown File ─────────────────────────────────────────────────────

  async function loadMarkdownFile(fileName: string, language: string): Promise<string> {
    // This is a placeholder - in production, you would:
    // 1. Bundle markdown files with the app using require()
    // 2. Fetch from a CDN or API
    // 3. Load from Supabase storage
    
    // For now, check if the file exists and return placeholder or throw error
    const availableDocuments = [
      'privacy-policy',
      'privacy-policy-ro',
      'privacy-policy-de',
      'privacy-policy-fr',
      'privacy-policy-it',
      'privacy-policy-es',
      'privacy-policy-pt',
      'privacy-policy-nl',
      'terms-and-conditions',
      'terms-and-conditions-ro',
      'terms-and-conditions-de',
      'terms-and-conditions-fr',
      'terms-and-conditions-it',
      'terms-and-conditions-es',
      'terms-and-conditions-pt',
      'terms-and-conditions-nl',
      'cookie-policy',
      'subscription-terms',
    ];

    if (!availableDocuments.includes(fileName)) {
      throw new Error(`Document ${fileName} not available`);
    }
    
    return getPlaceholderContent(fileName);
  }

  // ─── Get Placeholder Content ────────────────────────────────────────────────

  function getPlaceholderContent(fileName: string): string {
    // This would be replaced with actual bundled content
    const placeholders: Record<string, string> = {
      'privacy-policy': `# Privacy Policy

**Effective Date:** January 1, 2025  
**Version:** 1.0

## 1. Introduction

Welcome to Growthovo. We're committed to protecting your privacy and being transparent about how we handle your personal information.

## 2. What Data We Collect

We collect different types of information to provide and improve our service.

## 3. How We Use Your Data

We use your personal information to provide and improve our service.

## 4. Your Rights

You have rights regarding your personal data under GDPR.`,
      
      'terms-and-conditions': `# Terms and Conditions

**Effective Date:** January 1, 2025  
**Version:** 1.0

## 1. Acceptance of Terms

By using Growthovo, you agree to these terms.

## 2. Description of Service

Growthovo provides self-improvement tools and AI coaching.

## 3. User Responsibilities

You are responsible for your account and usage.`,
      
      'cookie-policy': `# Cookie Policy

**Effective Date:** January 1, 2025  
**Version:** 1.0

## 1. What Are Cookies

Cookies are small text files stored on your device.

## 2. How We Use Cookies

We use cookies to improve your experience.`,
      
      'subscription-terms': `# Subscription Terms

**Effective Date:** January 1, 2025  
**Version:** 1.0

## 1. Pricing and Billing

Details about subscription pricing and billing.

## 2. Cancellation and Refunds

How to cancel and request refunds.`,
    };

    return placeholders[fileName] || `# ${fileName}\n\nDocument content not available.`;
  }

  // ─── Scroll to Section ──────────────────────────────────────────────────────

  function scrollToSection(sectionId: string) {
    const position = sectionPositions.get(sectionId);
    if (position !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: position, animated: true });
      setShowTOC(false);
    }
  }

  // ─── Render Markdown ────────────────────────────────────────────────────────

  function renderMarkdown(content: string) {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const text = headerMatch[2].trim();
        
        elements.push(
          <View
            key={key++}
            onLayout={(e) => {
              const sectionId = `section-${elements.length}`;
              setSectionPositions(prev => new Map(prev).set(sectionId, e.nativeEvent.layout.y));
            }}
          >
            <Text style={[styles.text, getHeaderStyle(level)]}>{text}</Text>
          </View>
        );
        continue;
      }

      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.+?)\*\*/g);
        elements.push(
          <Text key={key++} style={styles.text}>
            {parts.map((part, idx) =>
              idx % 2 === 1 ? (
                <Text key={idx} style={styles.bold}>{part}</Text>
              ) : (
                part
              )
            )}
          </Text>
        );
        continue;
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        elements.push(
          <Text key={key++} style={styles.bullet}>• {text}</Text>
        );
        continue;
      }

      // Regular paragraph
      if (line.trim()) {
        elements.push(
          <Text key={key++} style={styles.text}>{line}</Text>
        );
      } else {
        // Empty line for spacing
        elements.push(<View key={key++} style={styles.spacing} />);
      }
    }

    return elements;
  }

  // ─── Get Header Style ───────────────────────────────────────────────────────

  function getHeaderStyle(level: number) {
    switch (level) {
      case 1:
        return styles.h1;
      case 2:
        return styles.h2;
      case 3:
        return styles.h3;
      default:
        return styles.h4;
    }
  }

  // ─── Render Table of Contents ───────────────────────────────────────────────

  function renderTableOfContents() {
    if (!document || !showTableOfContents) return null;

    return (
      <View style={styles.tocContainer}>
        <View style={styles.tocHeader}>
          <Text style={styles.tocTitle}>{t('legal.viewer.tableOfContents')}</Text>
          <TouchableOpacity onPress={() => setShowTOC(!showTOC)}>
            <Text style={styles.tocToggle}>{showTOC ? '▼' : '▶'}</Text>
          </TouchableOpacity>
        </View>
        
        {showTOC && (
          <View style={styles.tocList}>
            {document.sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                onPress={() => scrollToSection(section.id)}
                style={[styles.tocItem, { paddingLeft: spacing.md * section.level }]}
              >
                <Text style={styles.tocItemText}>{section.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  // ─── Render Loading ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('legal.viewer.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render Error ───────────────────────────────────────────────────────────

  if (error || !document) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || t('legal.viewer.notFound')}</Text>
          {onBack && (
            <TouchableOpacity style={styles.button} onPress={onBack}>
              <Text style={styles.buttonText}>{t('common.back')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ─── Render Document ────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← {t('common.back')}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            {t('legal.viewer.version')}: {document.version}
          </Text>
          <Text style={styles.metadataText}>
            {t('legal.viewer.effectiveDate')}: {document.effectiveDate}
          </Text>
        </View>
      </View>

      {/* Language Fallback Notice */}
      {isFallbackLanguage && (
        <View style={styles.fallbackNotice}>
          <Text style={styles.fallbackNoticeText}>
            ℹ️ {t('legal.viewer.fallbackNotice')}
          </Text>
        </View>
      )}

      {/* Table of Contents */}
      {renderTableOfContents()}

      {/* Document Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
      >
        {renderMarkdown(document.content)}
      </ScrollView>

      {/* Accept Button */}
      {showAcceptButton && onAccept && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={onAccept}
            accessibilityRole="button"
            accessibilityLabel={t('legal.viewer.accept')}
          >
            <Text style={styles.acceptButtonText}>{t('legal.viewer.accept')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metadataText: {
    ...typography.small,
    color: colors.textMuted,
  },
  fallbackNotice: {
    backgroundColor: colors.warning || '#FFF3CD',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.md,
  },
  fallbackNoticeText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
  tocContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tocHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  tocTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  tocToggle: {
    ...typography.body,
    color: colors.primary,
  },
  tocList: {
    paddingBottom: spacing.md,
  },
  tocItem: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  tocItemText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  h1: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  h2: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  h3: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  h4: {
    ...typography.bodyBold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  bold: {
    ...typography.bodyBold,
    color: colors.text,
  },
  bullet: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    paddingLeft: spacing.md,
  },
  spacing: {
    height: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  acceptButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.text,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
});
