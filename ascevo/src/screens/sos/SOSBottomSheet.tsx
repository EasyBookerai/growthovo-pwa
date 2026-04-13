import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';
import { startSOSEvent } from '../../services/sosService';
import CrisisDisclaimerBanner from '../../components/legal/CrisisDisclaimerBanner';
import type { SOSType } from '../../types';

interface Props {
  userId: string;
  visible: boolean;
  onClose: () => void;
  onSelectType: (type: SOSType) => void;
}

interface SOSOption {
  emoji: string;
  label: string;
  type: SOSType;
}

const SOS_OPTIONS: SOSOption[] = [
  { emoji: '😰', label: 'Anxiety Spike', type: 'anxiety_spike' },
  { emoji: '😤', label: 'About to React Badly', type: 'about_to_react' },
  { emoji: '😔', label: 'Zero Motivation', type: 'zero_motivation' },
  { emoji: '😬', label: 'Hard Conversation Coming', type: 'hard_conversation' },
  { emoji: '🔥', label: 'About to Break a Habit', type: 'habit_urge' },
  { emoji: '🌀', label: 'Overwhelmed / Too Much', type: 'overwhelmed' },
];

export default function SOSBottomSheet({ userId, visible, onClose, onSelectType }: Props) {
  const [loading, setLoading] = React.useState<SOSType | null>(null);

  async function handleSelect(option: SOSOption) {
    if (loading) return;
    setLoading(option.type);
    try {
      await startSOSEvent(userId, option.type);
      onSelectType(option.type);
    } catch (err) {
      console.error('Failed to start SOS event:', err);
      // Still navigate — don't block the user
      onSelectType(option.type);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Crisis Disclaimer Banner */}
        <View style={styles.disclaimerContainer}>
          <CrisisDisclaimerBanner
            onViewResources={() => {
              // TODO: Navigate to crisis resources page
            }}
          />
        </View>

        <Text style={styles.title}>What's happening?</Text>
        <Text style={styles.subtitle}>Pick your situation and Rex will help.</Text>

        <View style={styles.grid}>
          {SOS_OPTIONS.map((option) => {
            const isLoading = loading === option.type;
            return (
              <TouchableOpacity
                key={option.type}
                style={styles.card}
                onPress={() => handleSelect(option)}
                activeOpacity={0.7}
                disabled={loading !== null}
                accessibilityLabel={option.label}
                accessibilityRole="button"
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={styles.emoji}>{option.emoji}</Text>
                )}
                <Text style={styles.cardLabel}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  disclaimerContainer: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 80,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  cardLabel: {
    ...typography.smallBold,
    color: colors.text,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cancelText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
