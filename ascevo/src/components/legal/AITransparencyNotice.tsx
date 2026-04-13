import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../theme';

interface AITransparencyNoticeProps {
  visible: boolean;
  onAccept: () => void;
  onLearnMore?: () => void;
}

/**
 * AITransparencyNotice
 * 
 * Modal displayed before first Rex interaction to inform users that Rex is AI.
 * Explains capabilities, limitations, and privacy considerations.
 * 
 * Requirements: 4.1-4.7 (AI Transparency Notice)
 */
export default function AITransparencyNotice({
  visible,
  onAccept,
  onLearnMore,
}: AITransparencyNoticeProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onAccept}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.emoji}>🤖</Text>
            <Text style={styles.title}>{t('legal.aiNotice.title')}</Text>
            <Text style={styles.subtitle}>{t('legal.aiNotice.subtitle')}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                💡 {t('legal.aiNotice.canDo.title')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.aiNotice.canDo.remember')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.aiNotice.canDo.personalize')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.aiNotice.canDo.reflect')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.aiNotice.canDo.strategies')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                ⚠️ {t('legal.aiNotice.cannotDo.title')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.aiNotice.cannotDo.replace')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.aiNotice.cannotDo.guarantee')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.aiNotice.cannotDo.understand')}
              </Text>
              <Text style={styles.bullet}>
                • {t('legal.aiNotice.cannotDo.emergency')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🔒 {t('legal.aiNotice.privacy.title')}
              </Text>
              <Text style={styles.body}>
                {t('legal.aiNotice.privacy.description')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                🆘 {t('legal.aiNotice.crisis.title')}
              </Text>
              <Text style={styles.body}>
                {t('legal.aiNotice.crisis.description')}
              </Text>
            </View>

            <Text style={styles.acknowledgment}>
              {t('legal.aiNotice.acknowledgment')}
            </Text>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
              accessibilityRole="button"
              accessibilityLabel={t('legal.aiNotice.accept')}
            >
              <Text style={styles.acceptButtonText}>
                {t('legal.aiNotice.accept')}
              </Text>
            </TouchableOpacity>
            {onLearnMore && (
              <TouchableOpacity
                onPress={onLearnMore}
                accessibilityRole="button"
                accessibilityLabel={t('legal.aiNotice.learnMore')}
              >
                <Text style={styles.learnMoreText}>
                  {t('legal.aiNotice.learnMore')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollView: {
    maxHeight: '100%',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bullet: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  acknowledgment: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  learnMoreText: {
    ...typography.body,
    color: colors.primary,
    textAlign: 'center',
  },
});
