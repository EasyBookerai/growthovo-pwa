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
import { useAppContext } from '../../context/AppContext';
import CheckInModal from '../../components/CheckInModal';

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

export default function SimpleHomeScreen({ userId, subscriptionStatus, navigation }: Props) {
  const { state, dispatch } = useAppContext();
  const [streak, setStreak] = useState(7);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [xpAnimation] = useState(new Animated.Value(0));
  const [showXPGain, setShowXPGain] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const { data: streakData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      if (streakData) {
        setStreak(streakData.current_streak);
        dispatch({ type: 'SET_STREAK', payload: streakData.current_streak });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  function handleCheckInComplete(data: { mood: string; focus: string; intention: string }) {
    // Award XP
    dispatch({ type: 'ADD_XP', payload: 50 });
    dispatch({ type: 'SET_MOOD', payload: data.mood });

    // Show XP gain animation
    setShowXPGain(true);
    Animated.sequence([
      Animated.timing(xpAnimation, {
        toValue: -50,
        duration: 1000,
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

  function handlePillarPress(pillar: typeof PILLARS[0]) {
    navigation?.navigate('Pillars', { selectedPillar: pillar.key });
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
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
            <Text style={styles.statValue}>{state.xp}</Text>
            <Text style={styles.statIcon}>⚡</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#7C3AED' }]}>
            <Text style={styles.statLabel}>Level</Text>
            <Text style={styles.statValue}>{state.level}</Text>
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
          <TouchableOpacity style={styles.quickActionCard}>
            <Text style={styles.quickActionEmoji}>☀️</Text>
            <Text style={styles.quickActionLabel}>Morning Briefing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard}>
            <Text style={styles.quickActionEmoji}>🆘</Text>
            <Text style={styles.quickActionLabel}>SOS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation?.navigate('Rex')}
          >
            <Text style={styles.quickActionEmoji}>🤖</Text>
            <Text style={styles.quickActionLabel}>Talk to Rex</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* XP Gain Animation */}
      {showXPGain && (
        <Animated.View
          style={[
            styles.xpGainFloat,
            {
              transform: [{ translateY: xpAnimation }],
              opacity: xpAnimation.interpolate({
                inputRange: [-50, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <Text style={styles.xpGainText}>+50 XP</Text>
        </Animated.View>
      )}

      {/* Check-in Modal */}
      <CheckInModal
        visible={checkInVisible}
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
    borderRadius: 14,
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
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  xpGainText: {
    ...typography.h2,
    color: '#F59E0B',
    fontWeight: '800',
  },
});
