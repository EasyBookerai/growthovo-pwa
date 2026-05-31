import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { colors, typography, spacing, radius } from '../theme';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export default function NotificationPermissionPrompt({ visible, onDismiss }: Props) {
  async function handleAllow() {
    if (Platform.OS !== 'web') {
      await Notifications.requestPermissionsAsync();
    } else if (typeof Notification !== 'undefined') {
      await Notification.requestPermission();
    }
    onDismiss();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🔔</Text>
          <Text style={styles.title}>Stay on track — Rex will send you daily nudges</Text>
          <TouchableOpacity style={styles.allowBtn} onPress={handleAllow}>
            <Text style={styles.allowText}>Allow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterBtn} onPress={onDismiss}>
            <Text style={styles.laterText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  allowBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  allowText: { ...typography.bodyBold, color: '#fff' },
  laterBtn: { padding: spacing.sm },
  laterText: { color: colors.textMuted, ...typography.body },
});
