import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import GlassCard from '../glass/GlassCard';
import { colors, typography, spacing, radius } from '../../theme';
import type { LeagueMember } from '../../types';
import { getLeaderboardEntryAccessibilityLabel } from './accessibility';
import { getLeaderboardCardHeight } from './responsive';

export interface LeaderboardCardProps {
  members: LeagueMember[];
  currentUserId: string;
  onMemberPress?: (userId: string) => void;
  variant?: 'compact' | 'full';
  showZones?: boolean; // Show promotion/relegation zones
}

/**
 * LeaderboardCard - Enhanced leaderboard display with glassmorphism
 * 
 * Features:
 * - Compact and full variants
 * - User avatar, name, XP, and rank display
 * - Highlighted current user row
 * - Rank-up animation indicators
 * - Support for member press callback
 * - Promotion/relegation zone indicators
 */
export default function LeaderboardCard({
  members,
  currentUserId,
  onMemberPress,
  variant = 'full',
  showZones = true,
}: LeaderboardCardProps) {
  const isCompact = variant === 'compact';
  const displayMembers = isCompact ? members.slice(0, 5) : members;
  const cardHeight = getLeaderboardCardHeight();

  return (
    <GlassCard 
      intensity="medium" 
      style={[styles.container, { minHeight: cardHeight }]}
      accessibilityRole="list"
      accessibilityLabel="Weekly leaderboard"
    >
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        {isCompact && members.length > 5 && (
          <Text style={styles.viewAll}>View All</Text>
        )}
      </View>

      <View style={styles.list}>
        {displayMembers.map((member, index) => {
          const isPromotion = showZones && index < 5;
          const isRelegation = showZones && index >= members.length - 5 && members.length > 10;
          
          return (
            <LeaderboardRow
              key={member.userId}
              member={member}
              isCurrentUser={member.userId === currentUserId}
              onPress={onMemberPress ? () => onMemberPress(member.userId) : undefined}
              isCompact={isCompact}
              isPromotion={isPromotion}
              isRelegation={isRelegation && !isPromotion}
            />
          );
        })}
      </View>
    </GlassCard>
  );
}

interface LeaderboardRowProps {
  member: LeagueMember;
  isCurrentUser: boolean;
  onPress?: () => void;
  isCompact: boolean;
  isPromotion?: boolean;
  isRelegation?: boolean;
}

function LeaderboardRow({
  member,
  isCurrentUser,
  onPress,
  isCompact,
  isPromotion = false,
  isRelegation = false,
}: LeaderboardRowProps) {
  // Animation for rank changes
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const previousRank = useRef(member.rank);

  useEffect(() => {
    // Detect rank improvement (lower rank number = better position)
    if (previousRank.current > member.rank) {
      // Trigger rank-up animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    previousRank.current = member.rank;
  }, [member.rank]);

  const rowContent = (
    <Animated.View
      style={[
        styles.row,
        isCurrentUser && styles.rowHighlighted,
        isPromotion && styles.rowPromotion,
        isRelegation && styles.rowRelegation,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Zone indicator */}
      {(isPromotion || isRelegation) && (
        <View style={[
          styles.zoneIndicator,
          isPromotion && styles.zoneIndicatorPromotion,
          isRelegation && styles.zoneIndicatorRelegation,
        ]} />
      )}

      {/* Rank */}
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, getRankStyle(member.rank)]}>
          {getRankDisplay(member.rank)}
        </Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {member.avatarUrl ? (
          <Image
            source={{ uri: member.avatarUrl }}
            style={styles.avatar}
            accessibilityLabel={`${member.username}'s avatar`}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {member.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text
          style={[styles.username, isCurrentUser && styles.usernameHighlighted]}
          numberOfLines={1}
        >
          {member.username}
          {isCurrentUser && ' (you)'}
        </Text>
        {!isCompact && (
          <View style={styles.userMeta}>
            <Text style={styles.rankLabel}>
              Rank #{member.rank}
            </Text>
            {isPromotion && (
              <Text style={styles.zoneLabel}>↑ Promotion</Text>
            )}
            {isRelegation && (
              <Text style={styles.zoneLabelRelegation}>↓ Relegation</Text>
            )}
          </View>
        )}
      </View>

      {/* XP */}
      <View style={styles.xpContainer}>
        <Text style={styles.xp}>{formatXP(member.weeklyXp)}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={getLeaderboardEntryAccessibilityLabel(
          member.rank,
          member.username,
          member.weeklyXp,
          isCurrentUser
        )}
        accessibilityState={{ selected: isCurrentUser }}
      >
        {rowContent}
      </TouchableOpacity>
    );
  }

  return rowContent;
}

/**
 * Get rank display (emoji for top 3, number for others)
 */
function getRankDisplay(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

/**
 * Get rank-specific styling
 */
function getRankStyle(rank: number) {
  if (rank === 1) return { color: colors.leagueGold };
  if (rank === 2) return { color: colors.leagueSilver };
  if (rank === 3) return { color: colors.leagueBronze };
  return { color: colors.textMuted };
}

/**
 * Format XP with thousands separator
 */
function formatXP(xp: number): string {
  return xp.toLocaleString();
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  viewAll: {
    ...typography.small,
    color: colors.primary,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  rowHighlighted: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  rowPromotion: {
    borderLeftWidth: 3,
    borderLeftColor: colors.promotionGreen,
  },
  rowRelegation: {
    borderLeftWidth: 3,
    borderLeftColor: colors.relegationRed,
  },
  zoneIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  zoneIndicatorPromotion: {
    backgroundColor: colors.promotionGreen,
  },
  zoneIndicatorRelegation: {
    backgroundColor: colors.relegationRed,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    ...typography.h3,
    fontSize: 18,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    ...typography.body,
    color: colors.text,
  },
  usernameHighlighted: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  rankLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  zoneLabel: {
    ...typography.small,
    color: colors.promotionGreen,
    fontWeight: '600',
  },
  zoneLabelRelegation: {
    ...typography.small,
    color: colors.relegationRed,
    fontWeight: '600',
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xp: {
    ...typography.bodyBold,
    color: colors.xpGold,
    fontSize: 18,
  },
  xpLabel: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 2,
  },
});
