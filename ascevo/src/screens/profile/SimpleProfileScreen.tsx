import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { supabase } from '../../services/supabaseClient';

interface Props {
  userId: string;
  navigation?: any;
}

const ACHIEVEMENTS = [
  { id: '1', emoji: '🐣', name: 'First Step', unlocked: true },
  { id: '2', emoji: '🔥', name: '7-Day Streak', unlocked: false },
  { id: '3', emoji: '🧠', name: 'Mind Master', unlocked: false },
  { id: '4', emoji: '💬', name: 'Social Butterfly', unlocked: false },
  { id: '5', emoji: '☀️', name: 'Early Bird', unlocked: false },
];

const SETTINGS_SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: '1', icon: '✏️', label: 'Edit Profile', action: 'edit_profile' },
      { id: '2', icon: '🔔', label: 'Notification Settings', action: 'notifications' },
      { id: '3', icon: '🌐', label: 'Language', value: 'English', action: 'language' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: '4', icon: '🔒', label: 'Privacy & Data', action: 'privacy' },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: '5', icon: '❓', label: 'Help Center', action: 'help' },
      { id: '6', icon: '⭐', label: 'Rate Growthovo', action: 'rate' },
    ],
  },
];

export default function SimpleProfileScreen({ userId, navigation }: Props) {
  const [username] = useState('Champion');
  const [totalXP] = useState(1250);
  const [streak] = useState(7);
  const [lessonsCompleted] = useState(15);

  async function handleLogOut() {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  }

  function handleSettingPress(action: string) {
    console.log('Setting pressed:', action);
    // TODO: Navigate to respective screens
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>C</Text>
          </View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.memberSince}>Member since April 2026</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalXP}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lessonsCompleted}</Text>
              <Text style={styles.statLabel}>Lessons Done</Text>
            </View>
          </View>
        </View>

        {/* Achievement Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievement Badges</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {ACHIEVEMENTS.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementBadge,
                  !achievement.unlocked && styles.achievementBadgeLocked,
                ]}
              >
                <Text
                  style={[
                    styles.achievementEmoji,
                    !achievement.unlocked && styles.achievementEmojiLocked,
                  ]}
                >
                  {achievement.emoji}
                </Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                {!achievement.unlocked && (
                  <View style={styles.lockIcon}>
                    <Text style={styles.lockIconText}>🔒</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Settings */}
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.settingsList}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingRow,
                    index < section.items.length - 1 && styles.settingRowBorder,
                  ]}
                  onPress={() => handleSettingPress(item.action)}
                >
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  {item.value && (
                    <Text style={styles.settingValue}>{item.value}</Text>
                  )}
                  <Text style={styles.settingChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Log Out */}
        <TouchableOpacity style={styles.logOutButton} onPress={handleLogOut}>
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Legal Footer */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>
            Growthovo v1.0.0 • Legal docs v1.0
          </Text>
          <Text style={styles.legalText}>Effective: Jan 2024</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A12',
  },
  container: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    ...typography.h1,
    color: colors.text,
  },
  username: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  memberSince: {
    ...typography.small,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: '#A78BFA',
    fontWeight: '700',
  },
  statLabel: {
    ...typography.small,
    color: 'rgba(255,255,255,0.5)',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  achievementsScroll: {
    gap: spacing.sm,
  },
  achievementBadge: {
    width: 80,
    height: 100,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  achievementBadgeLocked: {
    opacity: 0.35,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  achievementEmojiLocked: {
    filter: 'grayscale(100%)',
  },
  achievementName: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontSize: 10,
  },
  lockIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  lockIconText: {
    fontSize: 12,
  },
  settingsList: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  settingIcon: {
    fontSize: 18,
    width: 24,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  settingValue: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
  },
  settingChevron: {
    ...typography.h3,
    color: 'rgba(255,255,255,0.3)',
  },
  logOutButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: spacing.lg,
  },
  logOutText: {
    ...typography.bodyBold,
    color: '#EF4444',
  },
  legalFooter: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  legalText: {
    ...typography.small,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
});
