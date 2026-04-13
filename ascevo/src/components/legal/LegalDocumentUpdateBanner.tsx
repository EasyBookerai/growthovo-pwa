import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../theme';

interface LegalDocumentUpdateBannerProps {
  visible: boolean;
  updateCount: number;
  onPress: () => void;
  onDismiss?: () => void;
}

/**
 * LegalDocumentUpdateBanner
 * 
 * Non-blocking banner displayed at the top of screens to notify users
 * of legal document updates. Less intrusive than the modal.
 * 
 * Requirements: 11.2 (Document Update Notifications)
 * Task: 8.2 (Create update notification UI)
 */
export default function LegalDocumentUpdateBanner({
  visible,
  updateCount,
  onPress,
  onDismiss,
}: LegalDocumentUpdateBannerProps) {
  const { t } = useTranslation();
  const [slideAnim] = React.useState(new Animated.Value(-100));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={t('legal.updateBanner.accessibilityLabel')}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>📢</Text>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {t('legal.updateBanner.title')}
            </Text>
            <Text style={styles.subtitle}>
              {t('legal.updateBanner.subtitle', { count: updateCount })}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>

      {onDismiss && (
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('legal.updateBanner.dismiss')}
        >
          <Text style={styles.dismissIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  banner: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
  subtitle: {
    ...typography.small,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  arrow: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  dismissButton: {
    position: 'absolute',
    top: spacing.md + spacing.xs,
    right: spacing.md + spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
