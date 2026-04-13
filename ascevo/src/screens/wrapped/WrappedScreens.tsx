/**
 * WrappedScreens.tsx
 * All 7 GROWTHOVO Wrapped screen components in a single file.
 * Each is exported individually and consumed by WrappedNavigator.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated as RNAnimated,
  Share,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, spacing, radius, getPillarColor } from '../../theme';
import { getShareCaption } from '../../services/wrappedService';
import type { WrappedData } from '../../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Shared screen wrapper ────────────────────────────────────────────────────

interface ScreenWrapperProps {
  children: React.ReactNode;
  backgroundColor?: string;
  scrollable?: boolean;
}

function ScreenWrapper({ children, backgroundColor, scrollable }: ScreenWrapperProps) {
  const bg = backgroundColor ?? colors.background;
  if (scrollable) {
    return (
      <ScrollView
        style={[styles.screen, { backgroundColor: bg }]}
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      {children}
    </View>
  );
}

// ─── 1. GrowthOverviewScreen ──────────────────────────────────────────────────

export function GrowthOverviewScreen({ data }: { data: WrappedData }) {
  const countAnim = useRef(new RNAnimated.Value(0)).current;
  const [displayCount, setDisplayCount] = useState(0);

  const titleOpacity = useSharedValue(0);
  const statsOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600 });
    statsOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    // Count up from 0 to totalLessons
    RNAnimated.timing(countAnim, {
      toValue: data.totalLessons,
      duration: 1800,
      useNativeDriver: false,
    }).start();

    const listener = countAnim.addListener(({ value }) => {
      setDisplayCount(Math.round(value));
    });

    return () => countAnim.removeListener(listener);
  }, [data.totalLessons]);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const statsStyle = useAnimatedStyle(() => ({ opacity: statsOpacity.value }));

  return (
    <ScreenWrapper>
      <View style={styles.centeredContent}>
        <Animated.View style={titleStyle}>
          <Text style={styles.screenLabel}>Your Growth</Text>
        </Animated.View>

        {/* Animated lesson count */}
        <View style={styles.bigNumberContainer}>
          <Text style={styles.bigNumber}>{displayCount}</Text>
          <Text style={styles.bigNumberLabel}>lessons completed</Text>
        </View>

        <Animated.View style={[styles.statsGrid, statsStyle]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{data.totalChallenges}</Text>
            <Text style={styles.statLabel}>challenges</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.xpGold }]}>{data.totalXp}</Text>
            <Text style={styles.statLabel}>XP earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.streakOrange }]}>
              {data.totalMinutesInApp}
            </Text>
            <Text style={styles.statLabel}>minutes</Text>
          </View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// ─── 2. StreakCalendarScreen ──────────────────────────────────────────────────

export function StreakCalendarScreen({ data }: { data: WrappedData }) {
  const streakOpacity = useSharedValue(0);
  const streakScale = useSharedValue(0.6);
  const detailsOpacity = useSharedValue(0);

  useEffect(() => {
    streakOpacity.value = withTiming(1, { duration: 500 });
    streakScale.value = withSpring(1, { damping: 10, stiffness: 120 });
    detailsOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));
  }, []);

  const streakStyle = useAnimatedStyle(() => ({
    opacity: streakOpacity.value,
    transform: [{ scale: streakScale.value }],
  }));
  const detailsStyle = useAnimatedStyle(() => ({ opacity: detailsOpacity.value }));

  return (
    <ScreenWrapper>
      <View style={styles.centeredContent}>
        <Text style={styles.screenLabel}>Your Streak</Text>

        <Animated.View style={[styles.bigNumberContainer, streakStyle]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={[styles.bigNumber, { color: colors.streakOrange }]}>
            {data.longestStreak}
          </Text>
          <Text style={styles.bigNumberLabel}>longest streak</Text>
        </Animated.View>

        <Animated.View style={[styles.infoCard, detailsStyle]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View>
              <Text style={styles.infoTitle}>Most active day</Text>
              <Text style={styles.infoValue}>{data.mostActiveDayOfWeek}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { marginTop: spacing.md }]}>
            <Text style={styles.infoIcon}>⏰</Text>
            <View>
              <Text style={styles.infoTitle}>Peak time</Text>
              <Text style={styles.infoValue}>{data.mostActiveTimeOfDay}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// ─── 3. StrongestPillarScreen ─────────────────────────────────────────────────

export function StrongestPillarScreen({ data }: { data: WrappedData }) {
  const pillarColor = getPillarColor(data.strongestPillar);

  const titleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 500 });
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    contentScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 100 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  return (
    <ScreenWrapper backgroundColor={pillarColor}>
      <View style={styles.centeredContent}>
        <Animated.View style={titleStyle}>
          <Text style={[styles.screenLabel, { color: 'rgba(255,255,255,0.8)' }]}>
            Your Strongest Pillar
          </Text>
        </Animated.View>

        <Animated.View style={[styles.pillarContent, contentStyle]}>
          <Text style={styles.pillarEmoji}>💪</Text>
          <Text style={styles.pillarName}>
            {data.strongestPillar.charAt(0).toUpperCase() + data.strongestPillar.slice(1)}
          </Text>
          <Text style={styles.pillarXp}>{data.totalXp} XP</Text>
          <Text style={styles.pillarSubtext}>You dominated this pillar</Text>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// ─── 4. WeakestPillarScreen ───────────────────────────────────────────────────

export function WeakestPillarScreen({ data }: { data: WrappedData }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600 });
    translateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const pillarName =
    data.weakestPillar.charAt(0).toUpperCase() + data.weakestPillar.slice(1);

  return (
    <ScreenWrapper>
      <View style={styles.centeredContent}>
        <Text style={styles.screenLabel}>Room to Grow</Text>

        <Animated.View style={[styles.weakPillarContent, animStyle]}>
          <Text style={styles.weakPillarEmoji}>🌱</Text>
          <Text style={styles.weakPillarName}>{pillarName}</Text>
          <Text style={styles.weakPillarCopy}>
            Rex noticed you've been avoiding this one. That's okay — most people do.
          </Text>

          <View style={styles.ctaCard}>
            <Text style={styles.ctaText}>Start your {pillarName} journey</Text>
            <Text style={styles.ctaSubtext}>
              One lesson a day is all it takes. You've done it before.
            </Text>
          </View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// ─── 5. GlobalRankScreen ──────────────────────────────────────────────────────

export function GlobalRankScreen({ data }: { data: WrappedData }) {
  const countAnim = useRef(new RNAnimated.Value(100)).current;
  const [displayRank, setDisplayRank] = useState(100);

  const titleOpacity = useSharedValue(0);
  const rankOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 500 });
    rankOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

    // Count down from 100 to globalPercentileRank
    RNAnimated.timing(countAnim, {
      toValue: data.globalPercentileRank,
      duration: 2000,
      useNativeDriver: false,
    }).start();

    const listener = countAnim.addListener(({ value }) => {
      setDisplayRank(Math.round(value));
    });

    return () => countAnim.removeListener(listener);
  }, [data.globalPercentileRank]);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const rankStyle = useAnimatedStyle(() => ({ opacity: rankOpacity.value }));

  return (
    <ScreenWrapper>
      <View style={styles.centeredContent}>
        <Animated.View style={titleStyle}>
          <Text style={styles.screenLabel}>Your Global Rank</Text>
        </Animated.View>

        <Animated.View style={[styles.rankContainer, rankStyle]}>
          <Text style={styles.rankPrefix}>Top</Text>
          <Text style={[styles.bigNumber, { color: colors.leagueGold }]}>{displayRank}%</Text>
          <Text style={styles.rankSuffix}>globally</Text>
        </Animated.View>

        <Animated.View style={[styles.infoCard, rankStyle]}>
          <Text style={styles.rankDescription}>
            You&apos;re ahead of {100 - data.globalPercentileRank}% of all GROWTHOVO users.
            {data.globalPercentileRank <= 10 ? ' That\u2019s elite.' : ' Keep pushing.'}
          </Text>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// ─── 6. RexVerdictScreen ──────────────────────────────────────────────────────

export function RexVerdictScreen({
  data,
  rexVerdict,
}: {
  data: WrappedData;
  rexVerdict: string;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 500 });

    // Typewriter animation — reveal one character at a time
    const interval = setInterval(() => {
      if (indexRef.current < rexVerdict.length) {
        indexRef.current += 1;
        setDisplayedText(rexVerdict.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [rexVerdict]);

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));

  return (
    <ScreenWrapper scrollable>
      <View style={styles.centeredContent}>
        <Animated.View style={titleStyle}>
          <Text style={styles.screenLabel}>Rex's Verdict</Text>
        </Animated.View>

        <View style={styles.rexAvatarContainer}>
          <Text style={styles.rexAvatar}>🦖</Text>
        </View>

        <View style={styles.rexVerdictCard}>
          <Text style={styles.rexVerdictText}>{displayedText}</Text>
          {displayedText.length < rexVerdict.length && (
            <Text style={styles.cursor}>|</Text>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

// ─── 7. WrappedShareCardScreen ────────────────────────────────────────────────

export function WrappedShareCardScreen({
  data,
  period,
  rexVerdict,
}: {
  data: WrappedData;
  period: string;
  rexVerdict: string;
}) {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 600 });
    cardScale.value = withSpring(1, { damping: 14, stiffness: 120 });
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  const handleShare = async () => {
    try {
      const caption = getShareCaption(data, period);
      await Share.share({ message: caption, title: `My ${period} GROWTHOVO Wrapped` });
    } catch {
      // Share cancelled — no-op
    }
  };

  const pillarColor = getPillarColor(data.strongestPillar);
  const strongestName =
    data.strongestPillar.charAt(0).toUpperCase() + data.strongestPillar.slice(1);

  return (
    <ScreenWrapper scrollable>
      <View style={styles.centeredContent}>
        <Text style={styles.screenLabel}>Share Your Wrapped</Text>

        {/* Shareable card */}
        <Animated.View style={[styles.shareCard, cardStyle]}>
          {/* Header */}
          <View style={[styles.shareCardHeader, { backgroundColor: pillarColor }]}>
            <Text style={styles.shareCardLogo}>GROWTHOVO</Text>
            <Text style={styles.shareCardPeriod}>{period} Wrapped</Text>
          </View>

          {/* Stats */}
          <View style={styles.shareCardBody}>
            <View style={styles.shareStatRow}>
              <View style={styles.shareStat}>
                <Text style={styles.shareStatNumber}>{data.totalLessons}</Text>
                <Text style={styles.shareStatLabel}>lessons</Text>
              </View>
              <View style={styles.shareStat}>
                <Text style={[styles.shareStatNumber, { color: colors.streakOrange }]}>
                  {data.longestStreak}
                </Text>
                <Text style={styles.shareStatLabel}>streak</Text>
              </View>
              <View style={styles.shareStat}>
                <Text style={[styles.shareStatNumber, { color: colors.xpGold }]}>
                  {data.totalXp}
                </Text>
                <Text style={styles.shareStatLabel}>XP</Text>
              </View>
            </View>

            <View style={[styles.shareCardPillarBadge, { borderColor: pillarColor }]}>
              <Text style={[styles.shareCardPillarText, { color: pillarColor }]}>
                💪 Strongest: {strongestName}
              </Text>
            </View>

            <View style={styles.shareCardRankRow}>
              <Text style={styles.shareCardRankText}>
                🌍 Top {data.globalPercentileRank}% globally
              </Text>
            </View>

            <Text style={styles.shareCardHandle}>@growthovo</Text>
          </View>
        </Animated.View>

        {/* Share button */}
        <Animated.View style={[styles.shareButtonContainer, buttonStyle]}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            accessibilityRole="button"
            accessibilityLabel="Share your Wrapped"
          >
            <Text style={styles.shareButtonText}>Share My Wrapped 🔗</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: SCREEN_HEIGHT,
  },
  screenScrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl * 2,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 80,
    paddingBottom: 100,
    gap: spacing.xl,
  },
  screenLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 2,
  },

  // Big number (lessons, rank)
  bigNumberContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  bigNumber: {
    fontSize: 80,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -2,
  },
  bigNumberLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },

  // Stats grid (GrowthOverview)
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    width: '100%',
    maxWidth: 360,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },

  // Streak screen
  streakEmoji: {
    fontSize: 56,
  },

  // Info card (streak details, rank description)
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoIcon: {
    fontSize: 28,
  },
  infoTitle: {
    ...typography.small,
    color: colors.textMuted,
  },
  infoValue: {
    ...typography.bodyBold,
    color: colors.text,
  },

  // Strongest pillar
  pillarContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  pillarEmoji: {
    fontSize: 72,
  },
  pillarName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  pillarXp: {
    ...typography.h2,
    color: 'rgba(255,255,255,0.9)',
  },
  pillarSubtext: {
    ...typography.body,
    color: 'rgba(255,255,255,0.7)',
  },

  // Weakest pillar
  weakPillarContent: {
    alignItems: 'center',
    gap: spacing.lg,
    width: '100%',
    maxWidth: 360,
  },
  weakPillarEmoji: {
    fontSize: 64,
  },
  weakPillarName: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  weakPillarCopy: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  ctaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    gap: spacing.xs,
  },
  ctaText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  ctaSubtext: {
    ...typography.small,
    color: colors.textSecondary,
  },

  // Global rank
  rankContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  rankPrefix: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  rankSuffix: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  rankDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  // Rex verdict
  rexAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rexAvatar: {
    fontSize: 44,
  },
  rexVerdictCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
  },
  rexVerdictText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 28,
  },
  cursor: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },

  // Share card
  shareCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareCardHeader: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  shareCardLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  shareCardPeriod: {
    ...typography.small,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  shareCardBody: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  shareStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  shareStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  shareStatNumber: {
    ...typography.h2,
    color: colors.text,
  },
  shareStatLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  shareCardPillarBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
  },
  shareCardPillarText: {
    ...typography.smallBold,
  },
  shareCardRankRow: {
    alignItems: 'center',
  },
  shareCardRankText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  shareCardHandle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  shareButtonContainer: {
    width: '100%',
    maxWidth: 360,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  shareButtonText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
  },
});
