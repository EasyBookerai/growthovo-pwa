import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../../services/supabaseClient';
import { colors, typography, spacing, radius } from '../../theme';
import CheckInModal from '../../components/CheckInModal';
import { useAppContext } from '../../context/AppContext';

/**
 * SimpleHomeScreen Props Interface
 * 
 * @property {string} userId - Authenticated user ID for data fetching
 * @property {string} subscriptionStatus - User's subscription tier (e.g., 'free', 'premium')
 * @property {any} [navigation] - React Navigation object (optional, framework-specific type)
 */
interface Props {
  userId: string;
  subscriptionStatus: string;
  navigation?: any;
}

const PILLARS = [
  { key: 'mind', emoji: '🧠', name: 'Mental', progress: 0, color: '#7C3AED' },
  { key: 'discipline', emoji: '🎯', name: 'Discipline', progress: 0, color: '#DB2777' },
  { key: 'communication', emoji: '💬', name: 'Relations', progress: 0, color: '#EA580C' },
  { key: 'money', emoji: '💰', name: 'Finance', progress: 0, color: '#F59E0B' },
  { key: 'relationships', emoji: '💪', name: 'Fitness', progress: 0, color: '#16A34A' },
];

/**
 * SimpleHomeScreen Component
 * 
 * Main home screen displaying user stats, daily mission, growth pillars, and quick actions.
 * Integrates with AppContext for real-time XP, streak, and level updates.
 * 
 * Features:
 * - Real-time stat cards (XP, Streak, Level) from AppContext
 * - Daily check-in button with modal
 * - Premium XP gain animation with spring physics
 * - Horizontal scrolling pillar cards
 * - Quick action buttons for key features
 * - Error banner with dismiss functionality
 * 
 * @param {Props} props - Component props
 * @param {string} props.userId - Authenticated user ID
 * @param {string} props.subscriptionStatus - User's subscription tier
 * @param {any} props.navigation - React Navigation object (optional)
 * 
 * @example
 * ```tsx
 * <SimpleHomeScreen
 *   userId={user.id}
 *   subscriptionStatus="free"
 *   navigation={navigation}
 * />
 * ```
 */
export default function SimpleHomeScreen({ userId, subscriptionStatus, navigation }: Props) {
  // Use AppContext for global state (xp, streak, level)
  const { xp, streak, level, updateXP, error, clearError } = useAppContext();
  
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [xpAnimation] = useState(new Animated.Value(0));
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);

  /**
   * Handle check-in completion
   * 
   * Called when user completes all 3 steps of the check-in modal.
   * Awards +50 XP through AppContext and triggers premium spring animation.
   * 
   * Animation sequence:
   * 1. Spring animation rises XP text upward with bounce
   * 2. Fade out as it reaches peak
   * 3. Reset position for next animation
   * 
   * @param {Object} data - Check-in data from modal
   * @param {string} data.mood - Selected mood emoji value
   * @param {string} data.focus - User's focus text
   * @param {string} data.intention - User's intention (optional)
   */
  function handleCheckInComplete(data: { mood: string; focus: string; intention: string }) {
    // Award XP through AppContext
    const xpAmount = 50;
    updateXP(xpAmount);
    
    // Show premium XP gain animation
    setXpGainAmount(xpAmount);
    setShowXPGain(true);
    
    // Premium spring animation: rise and fade
    Animated.sequence([
      Animated.spring(xpAnimation, {
        toValue: -80,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(xpAnimation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowXPGain(false);
    });
  }

  /**
   * Handle pillar card press
   * 
   * Navigates to the Pillars tab with the selected pillar pre-selected.
   * This allows users to quickly jump to a specific pillar's lessons.
   * 
   * @param {Object} pillar - The pillar that was tapped
   * @param {string} pillar.key - Pillar identifier (e.g., 'mind', 'discipline')
   * @param {string} pillar.name - Display name
   * @param {string} pillar.emoji - Pillar emoji
   * @param {string} pillar.color - Theme color for pillar
   */
  function handlePillarPress(pillar: typeof PILLARS[0]) {
    navigation?.navigate('Pillars', { selectedPillar: pillar.key });
  }

  return (
    <SafeAreaView style={styles.root} testID="home-screen">
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {error}</Text>
            <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
              <Text style={styles.errorDismissText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, Champion! 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>C</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#F97316' }]}>
            <Text style={styles.statLabel}>Day Streak</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statIcon}>🔥</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
            <Text style={styles.statLabel}>XP Points</Text>
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statIcon}>⚡</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#7C3AED' }]}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statIcon}>🏆</Text>
          </View>
        </View>

        {/* Today's Mission */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>Today's Mission</Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+20 XP</Text>
            </View>
          </View>
          <Text style={styles.missionTask}>Complete your daily check-in</Text>
        </View>

        {/* Check-in Button */}
        <TouchableOpacity
          style={styles.checkInButton}
          onPress={() => setCheckInVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.checkInButtonText}>Start Daily Check-in →</Text>
        </TouchableOpacity>

        {/* Growth Pillars */}
        <Text style={styles.sectionTitle}>Your Growth Pillars</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillarsScroll}
        >
          {PILLARS.map((pillar) => (
            <TouchableOpacity
              key={pillar.key}
              style={styles.pillarCard}
              onPress={() => handlePillarPress(pillar)}
              activeOpacity={0.7}
            >
              <Text style={styles.pillarEmoji}>{pillar.emoji}</Text>
              <Text style={styles.pillarName}>{pillar.name}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${pillar.progress * 100}%`,
                      backgroundColor: pillar.color,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
            <Text style={styles.quickActionEmoji}>☀️</Text>
            <Text style={styles.quickActionLabel}>Morning Briefing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} activeOpacity={0.7}>
            <Text style={styles.quickActionEmoji}>🆘</Text>
            <Text style={styles.quickActionLabel}>SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation?.navigate('Rex')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionEmoji}>🤖</Text>
            <Text style={styles.quickActionLabel}>Talk to Rex</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* XP Gain Animation - Premium floating text */}
      {showXPGain && (
        <Animated.View
          style={[
            styles.xpGainFloat,
            {
              transform: [{ translateY: xpAnimation }],
              opacity: xpAnimation.interpolate({
                inputRange: [-80, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <View style={styles.xpGainContainer}>
            <Text style={styles.xpGainText}>+{xpGainAmount} XP</Text>
            <Text style={styles.xpGainEmoji}>⚡</Text>
          </View>
        </Animated.View>
      )}

      {/* Check-in Modal */}
      <CheckInModal
        visible={checkInVisible}
        userId={userId}
        onComplete={handleCheckInComplete}
        onClose={() => setCheckInVisible(false)}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.h3,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: {
    ...typography.small,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  statValue: {
    ...typography.h2,
    color: '#A78BFA',
    fontWeight: '700',
  },
  statIcon: {
    fontSize: 20,
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  missionCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  missionTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  xpBadge: {
    backgroundColor: '#1DB88A',
    borderRadius: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  xpBadgeText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  missionTask: {
    ...typography.body,
    color: 'rgba(255,255,255,0.7)',
  },
  checkInButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 100,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkInButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  pillarsScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.lg,
  },
  pillarCard: {
    width: 110,
    height: 130,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillarEmoji: {
    fontSize: 28,
  },
  pillarName: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    height: 64,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickActionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionLabel: {
    ...typography.small,
    color: colors.text,
    fontSize: 11,
  },
  xpGainFloat: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -75 }],
    zIndex: 1000,
  },
  xpGainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 100,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  xpGainText: {
    ...typography.h2,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 28,
    marginRight: spacing.xs,
  },
  xpGainEmoji: {
    fontSize: 24,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerText: {
    ...typography.small,
    color: '#FCA5A5',
    flex: 1,
  },
  errorDismiss: {
    padding: spacing.xs,
  },
  errorDismissText: {
    color: '#FCA5A5',
    fontSize: 18,
  },
});
