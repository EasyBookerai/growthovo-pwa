import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Modal,
  Pressable,
  Easing,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../services/supabaseClient';
import { colors, typography, spacing } from '../../theme';
import CheckInModal from '../../components/CheckInModal';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import {
  isBeforeNoon,
  isAfter6PM,
  isMonday,
  weekKey,
  getUserName,
  getStreakFreezes,
  recordDailyCheckIn,
  STREAK_MILESTONES,
  KEYS,
} from '../../services/growthovoExperienceService';

interface Props {
  userId: string;
  subscriptionStatus: string;
  navigation?: any;
}

const PILLARS = [
  { key: 'mental-health', emoji: '🧠', name: 'Mental', color: '#A78BFA' },
  { key: 'relationships', emoji: '💬', name: 'Relations', color: '#F472B6' },
  { key: 'career', emoji: '💼', name: 'Career', color: '#60A5FA' },
  { key: 'fitness', emoji: '💪', name: 'Fitness', color: '#34D399' },
  { key: 'finance', emoji: '💰', name: 'Finance', color: '#FBBF24' },
  { key: 'hobbies', emoji: '🎨', name: 'Hobbies', color: '#F87171' },
];

const SOS_OPTIONS = [
  { id: 'anxiety', emoji: '😰', label: 'Anxiety', response: "I hear you. Anxiety is your body's alarm system—it's not dangerous, just uncomfortable. Let's try this: Take 3 deep breaths. In for 4, hold for 4, out for 4. You've got this. 💜" },
  { id: 'anger', emoji: '😤', label: 'Anger', response: "Anger is energy. Let's channel it. Take 5 deep breaths. Then ask: What boundary was crossed? What do I need? You're in control. 🔥" },
  { id: 'heartbreak', emoji: '💔', label: 'Heartbreak', response: "Heartbreak hurts because love mattered. Feel it. Cry if you need to. You're not broken—you're healing. One day at a time. 💜" },
  { id: 'overwhelm', emoji: '😩', label: 'Overwhelm', response: "Too much at once? Let's simplify. Pick ONE thing. Just one. Do that. Then the next. You don't have to do it all right now. 🌊" },
  { id: 'numbness', emoji: '😶', label: 'Numbness', response: "Feeling nothing is still feeling something. Your body is protecting you. Be gentle with yourself. Small steps. You'll feel again. 🤍" },
  { id: 'no-motivation', emoji: '😴', label: 'No Motivation', response: "Motivation is a myth. Discipline is the key. Start with 2 minutes. Just 2. Action creates momentum. You've got this. 💪" },
];

const REX_MOTIVATIONS = [
  'You showed up — that already puts you ahead.',
  'One small win today is enough to keep momentum.',
  'Your future self will thank you for this.',
];

export default function CompleteHomeScreen({ userId, subscriptionStatus, navigation }: Props) {
  const { xp, streak, level, updateXP, updateStreak, error, clearError } = useAppContext();
  const { showToast } = useToast();

  const [checkInVisible, setCheckInVisible] = useState(false);
  const [sosVisible, setSosVisible] = useState(false);
  const [selectedSOS, setSelectedSOS] = useState<typeof SOS_OPTIONS[0] | null>(null);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [userName, setUserName] = useState('Champion');
  const [freezeCount, setFreezeCount] = useState(0);
  const [wrappedDismissed, setWrappedDismissed] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState<string | null>(null);
  const [rexTip, setRexTip] = useState(REX_MOTIVATIONS[0]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animated values
  const [xpAnimation] = useState(new Animated.Value(0));
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);
  const streakAnim = useRef(new Animated.Value(0)).current;
  const xpAnim = useRef(new Animated.Value(0)).current;
  const levelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    checkTodayCheckIn();
    loadExtras();
  }, [userId]);

  async function loadExtras() {
    setFreezeCount(await getStreakFreezes());
    const name = await getUserName();
    if (name) setUserName(name);
    const dismissed = await AsyncStorage.getItem(KEYS.wrappedDismissedWeek);
    setWrappedDismissed(dismissed === weekKey());
  }

  useEffect(() => {
    // Count-up animations on mount
    animateCountUp(streakAnim, streak, 600);
    animateCountUp(xpAnim, xp, 600);
    animateCountUp(levelAnim, level, 600);
  }, [streak, xp, level]);

  async function loadUserData() {
    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();
    
    if (data?.name) {
      setUserName(data.name);
    }
  }

  async function checkTodayCheckIn() {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = await AsyncStorage.getItem(KEYS.lastCheckInDate);
    setTodayCheckedIn(lastCheckIn === today);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRexTip(REX_MOTIVATIONS[Math.floor(Math.random() * REX_MOTIVATIONS.length)]);
    await loadExtras();
    setRefreshing(false);
  }, []);

  function dismissWrapped() {
    AsyncStorage.setItem(KEYS.wrappedDismissedWeek, weekKey());
    setWrappedDismissed(true);
  }

  const morningLabel = isBeforeNoon() ? '☀️ Morning Briefing' : 'Come back tomorrow morning ☀️';

  function animateCountUp(animValue: Animated.Value, targetValue: number, duration: number) {
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: targetValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }

  async function handleCheckInComplete(data: { mood: string; focus: string; intention: string }) {
    const xpAmount = 50;
    updateXP(xpAmount);

    const result = await recordDailyCheckIn();
    if (result.freezeUsed) showToast('❄️ Streak Freeze used!', 'info');
    if (result.streak !== streak) updateStreak(result.streak);
    setFreezeCount(await getStreakFreezes());

    if (result.milestone && STREAK_MILESTONES[result.milestone]) {
      const m = STREAK_MILESTONES[result.milestone];
      setMilestoneModal(m.title);
      if (m.bonusXp > 0) updateXP(m.bonusXp);
    }

    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(KEYS.lastCheckInDate, today);
    setTodayCheckedIn(true);
    
    // Show XP gain animation
    setXpGainAmount(xpAmount);
    setShowXPGain(true);
    
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

  function handleSOSSelect(option: typeof SOS_OPTIONS[0]) {
    setSelectedSOS(option);
  }

  function handleSOSTalkToRex() {
    setSosVisible(false);
    setSelectedSOS(null);
    navigation?.navigate('Rex');
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
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
            <Text style={styles.greeting}>Hey, {userName}! 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation?.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>{userName[0]}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards with Count-up Animation */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#F97316' }]}>
            <Text style={styles.statLabel}>Day Streak</Text>
            <Animated.Text style={styles.statValue}>
              {streakAnim.interpolate({
                inputRange: [0, streak || 1],
                outputRange: ['0', String(streak)],
              })}
            </Animated.Text>
            <Text style={styles.statIcon}>🔥{freezeCount > 0 ? ' ❄️' : ''}</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
            <Text style={styles.statLabel}>XP Points</Text>
            <Animated.Text style={styles.statValue}>
              {xpAnim.interpolate({
                inputRange: [0, xp || 1],
                outputRange: ['0', String(xp)],
              })}
            </Animated.Text>
            <Text style={styles.statIcon}>⚡</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#7C3AED' }]}>
            <Text style={styles.statLabel}>Level</Text>
            <Animated.Text style={styles.statValue}>
              {levelAnim.interpolate({
                inputRange: [0, level || 1],
                outputRange: ['0', String(level)],
              })}
            </Animated.Text>
            <Text style={styles.statIcon}>🏆</Text>
          </View>
        </View>

        <Text style={styles.rexTip}>💬 Rex: {rexTip}</Text>

        {isMonday() && !wrappedDismissed && (
          <TouchableOpacity
            style={styles.wrappedCard}
            onPress={() => navigation?.navigate('WeeklyWrapped')}
            activeOpacity={0.85}
          >
            <Text style={styles.wrappedTitle}>Your Week Wrapped 🎁</Text>
            <Text style={styles.wrappedSub}>Tap to see your weekly highlights</Text>
            <TouchableOpacity onPress={dismissWrapped} hitSlop={12} style={styles.wrappedDismiss}>
              <Text style={styles.wrappedDismissText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Today's Mission */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>Today's Mission</Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpBadgeText}>+50 XP</Text>
            </View>
          </View>
          <Text style={styles.missionTask}>
            {todayCheckedIn
              ? '✓ Check-in complete! Great start to your day.'
              : 'Complete your daily check-in'}
          </Text>
        </View>

        {/* Check-in Button */}
        {!todayCheckedIn && (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={() => setCheckInVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.checkInButtonText}>Start Daily Check-in →</Text>
          </TouchableOpacity>
        )}

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
              <Text style={styles.pillarLevel}>Level 1</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: '30%',
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
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => isBeforeNoon() && navigation?.navigate('MorningBriefing')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionEmoji}>☀️</Text>
            <Text style={styles.quickActionLabel}>{morningLabel}</Text>
          </TouchableOpacity>
          {isAfter6PM() && (
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation?.navigate('EveningDebrief')}
              activeOpacity={0.7}
            >
              <Text style={styles.quickActionEmoji}>🌙</Text>
              <Text style={styles.quickActionLabel}>Evening Debrief</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation?.navigate('Rex')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionEmoji}>🤖</Text>
            <Text style={styles.quickActionLabel}>Talk to Rex</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => setSosVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionEmoji}>🆘</Text>
            <Text style={styles.quickActionLabel}>SOS</Text>
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
                inputRange: [-80, 0],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <View style={styles.xpGainContainer}>
            <Text style={styles.xpGainText}>+{xpGainAmount} XP</Text>
            <Text style={styles.xpGainEmoji}>✨</Text>
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

      <Modal visible={!!milestoneModal} transparent animationType="fade">
        <View style={styles.milestoneOverlay}>
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneTitle}>{milestoneModal}</Text>
            <TouchableOpacity style={styles.checkInButton} onPress={() => setMilestoneModal(null)}>
              <Text style={styles.checkInButtonText}>Claim reward →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SOS Modal */}
      <Modal
        visible={sosVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSosVisible(false)}
      >
        <Pressable
          style={styles.sosOverlay}
          onPress={() => {
            setSosVisible(false);
            setSelectedSOS(null);
          }}
        >
          <Pressable style={styles.sosModal} onPress={(e) => e.stopPropagation()}>
            {!selectedSOS ? (
              <>
                <View style={styles.sosHandle} />
                <Text style={styles.sosTitle}>How are you feeling?</Text>
                <Text style={styles.sosSubtitle}>Choose what you're experiencing right now</Text>
                
                <View style={styles.sosGrid}>
                  {SOS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.sosOption}
                      onPress={() => handleSOSSelect(option)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.sosOptionEmoji}>{option.emoji}</Text>
                      <Text style={styles.sosOptionLabel}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <View style={styles.sosHandle} />
                <Text style={styles.sosResponseEmoji}>{selectedSOS.emoji}</Text>
                <Text style={styles.sosResponseTitle}>{selectedSOS.label}</Text>
                <Text style={styles.sosResponseText}>{selectedSOS.response}</Text>
                
                <TouchableOpacity
                  style={styles.sosTalkButton}
                  onPress={handleSOSTalkToRex}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sosTalkButtonText}>Talk to Rex about this →</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.sosBackButton}
                  onPress={() => setSelectedSOS(null)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sosBackButtonText}>← Back</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    backgroundColor: '#34D399',
    borderRadius: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  xpBadgeText: {
    ...typography.small,
    color: '#000',
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
    height: 140,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillarEmoji: {
    fontSize: 32,
  },
  pillarName: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
  },
  pillarLevel: {
    ...typography.caption,
    color: '#A78BFA',
    fontSize: 10,
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
    height: 80,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickActionEmoji: {
    fontSize: 24,
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
    backgroundColor: 'rgba(52, 211, 153, 0.95)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 100,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#6EE7B7',
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
  rexTip: {
    ...typography.small,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  wrappedCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    position: 'relative',
  },
  wrappedTitle: { ...typography.bodyBold, color: colors.text },
  wrappedSub: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  wrappedDismiss: { position: 'absolute', top: 8, right: 12 },
  wrappedDismissText: { color: colors.textMuted, fontSize: 18 },
  milestoneOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  milestoneCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  milestoneTitle: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  sosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sosModal: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: 40,
    minHeight: '50%',
  },
  sosHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sosTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sosSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  sosOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#0A0A12',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sosOptionEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  sosOptionLabel: {
    ...typography.small,
    color: colors.text,
    textAlign: 'center',
    fontSize: 11,
  },
  sosResponseEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sosResponseTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sosResponseText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  sosTalkButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 100,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sosTalkButtonText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  sosBackButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  sosBackButtonText: {
    ...typography.body,
    color: '#A78BFA',
  },
});
