import React, { useState, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

/**
 * SimpleLeagueScreen Props Interface
 * 
 * @property {string} userId - Authenticated user ID
 * @property {any} [navigation] - React Navigation object (optional, framework-specific type)
 */
interface Props {
  userId: string;
  navigation?: any;
}

/**
 * Leaderboard entry interface
 * 
 * Represents a single row in the leaderboard.
 * 
 * @property {number} rank - User's rank position (1-based)
 * @property {string} username - Display username
 * @property {number} xp - Total XP points
 * @property {string} avatar - Avatar initial letter
 * @property {string} [medal] - Medal emoji for top 3 (🥇🥈🥉)
 * @property {boolean} [isCurrentUser] - True if this is the current user's row
 */
interface LeaderboardEntry {
  rank: number;
  username: string;
  xp: number;
  avatar: string;
  medal?: string;
  isCurrentUser?: boolean;
}

/**
 * LeaderboardRow Props Interface
 * 
 * Props for the memoized LeaderboardRow component.
 * 
 * @property {LeaderboardEntry} entry - Leaderboard entry data to display
 */
interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

/**
 * Memoized leaderboard row component to prevent unnecessary re-renders
 * Only re-renders when entry data changes
 */
const LeaderboardRow = memo(({ entry }: LeaderboardRowProps) => {
  return (
    <View
      style={[
        styles.leaderboardRow,
        entry.isCurrentUser && styles.leaderboardRowCurrent,
      ]}
    >
      {entry.isCurrentUser && <View style={styles.currentUserIndicator} />}
      <Text style={styles.leaderboardRank}>
        {entry.medal || `#${entry.rank}`}
      </Text>
      <View style={styles.leaderboardAvatar}>
        <Text style={styles.leaderboardAvatarText}>{entry.avatar}</Text>
      </View>
      <Text
        style={[
          styles.leaderboardUsername,
          entry.isCurrentUser && styles.leaderboardUsernameCurrent,
        ]}
      >
        {entry.username}
      </Text>
      <Text style={styles.leaderboardXP}>{entry.xp} XP</Text>
    </View>
  );
});

interface Props {
  userId: string;
  navigation?: any;
}

/**
 * Memoized squad card component to prevent unnecessary re-renders
 * Only re-renders when member data changes
 */
const SquadCard = memo(({ member }: SquadCardProps) => {
  return (
    <View style={styles.squadCard}>
      <View style={styles.squadAvatar}>
        <Text style={styles.squadAvatarText}>{member.name[0]}</Text>
      </View>
      <View style={styles.squadInfo}>
        <Text style={styles.squadName}>{member.name}</Text>
        <Text style={styles.squadXP}>{member.xp} XP</Text>
      </View>
      <View
        style={[
          styles.squadStatus,
          member.online ? styles.squadStatusOnline : styles.squadStatusOffline,
        ]}
      />
    </View>
  );
});

/**
 * Squad member interface
 * 
 * Represents a squad member with online status.
 * 
 * @property {string} id - Unique member identifier
 * @property {string} name - Member's display name
 * @property {number} xp - Member's total XP
 * @property {boolean} online - True if member is currently online
 */
interface SquadMember {
  id: string;
  name: string;
  xp: number;
  online: boolean;
}

/**
 * SquadCard Props Interface
 * 
 * Props for the memoized SquadCard component.
 * 
 * @property {SquadMember} member - Squad member data to display
 */
interface SquadCardProps {
  member: SquadMember;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'Sarah_M', xp: 500, avatar: 'S', medal: '🥇' },
  { rank: 2, username: 'Mike_K', xp: 480, avatar: 'M', medal: '🥈' },
  { rank: 3, username: 'Alex_R', xp: 450, avatar: 'A', medal: '🥉' },
  { rank: 4, username: 'Emma_L', xp: 420, avatar: 'E', medal: '' },
  { rank: 5, username: 'David_P', xp: 400, avatar: 'D', medal: '' },
  { rank: 6, username: 'Lisa_W', xp: 380, avatar: 'L', medal: '' },
  { rank: 7, username: 'Tom_H', xp: 360, avatar: 'T', medal: '' },
  { rank: 8, username: 'Nina_S', xp: 350, avatar: 'N', medal: '' },
  { rank: 9, username: 'Chris_B', xp: 345, avatar: 'C', medal: '' },
  { rank: 10, username: 'Maya_D', xp: 340, avatar: 'M', medal: '' },
  { rank: 12, username: 'You', xp: 340, avatar: 'C', medal: '', isCurrentUser: true },
];

const SQUAD: SquadMember[] = [
  { id: '1', name: 'Sarah_M', xp: 500, online: true },
  { id: '2', name: 'Mike_K', xp: 480, online: true },
  { id: '3', name: 'Alex_R', xp: 450, online: false },
];

/**
 * SimpleLeagueScreen Component
 * 
 * Displays weekly league leaderboard with user rank card and squad section.
 * Shows fake leaderboard data for demonstration purposes.
 * 
 * Features:
 * - User rank card with Bronze League badge
 * - Progress bar showing XP needed to rank up
 * - Leaderboard with 10 entries (ranks 1-10)
 * - Medals for top 3 ranks (🥇🥈🥉)
 * - Current user row highlighted in purple
 * - Squad section with online/offline status
 * - Invite friend button
 * - Countdown timer for league reset
 * 
 * Performance optimizations:
 * - Memoized LeaderboardRow components
 * - Memoized SquadCard components
 * - Prevents unnecessary re-renders
 * 
 * @param {Props} props - Component props
 * @param {string} props.userId - Authenticated user ID
 * @param {any} props.navigation - React Navigation object (optional)
 * 
 * @example
 * ```tsx
 * <SimpleLeagueScreen
 *   userId={user.id}
 *   navigation={navigation}
 * />
 * ```
 */
export default function SimpleLeagueScreen({ userId, navigation }: Props) {
  const [timeRemaining, setTimeRemaining] = useState('3d 14h');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, you would fetch leaderboard data here
  // For now, we're using hardcoded data
  const hasLeaderboardData = LEADERBOARD.length > 0;

  return (
    <SafeAreaView style={styles.root} testID="league-screen">
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Weekly League 🏆</Text>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>Resets in {timeRemaining}</Text>
          </View>
        </View>

        {/* User Rank Card */}
        <View style={styles.userRankCard}>
          <View style={styles.userRankHeader}>
            <Text style={styles.userRankLabel}>YOUR RANK</Text>
            <Text style={styles.userLeague}>Bronze League</Text>
          </View>
          <View style={styles.userRankStats}>
            <View style={styles.userRankStat}>
              <Text style={styles.userRankNumber}>#12</Text>
              <Text style={styles.userRankStatLabel}>Rank</Text>
            </View>
            <View style={styles.userRankStat}>
              <Text style={styles.userRankNumber}>340</Text>
              <Text style={styles.userRankStatLabel}>XP</Text>
            </View>
          </View>
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>160 XP to rank up</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '68%' }]} />
            </View>
          </View>
        </View>

        {/* Leaderboard */}
        <Text style={styles.sectionTitle}>Leaderboard</Text>
        {!hasLeaderboardData ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏆</Text>
            <Text style={styles.emptyText}>No leaderboard data yet</Text>
            <Text style={styles.emptySubtext}>Complete lessons to join the competition!</Text>
          </View>
        ) : (
          <View style={styles.leaderboard}>
            {LEADERBOARD.map((entry) => (
              <LeaderboardRow key={entry.rank} entry={entry} />
            ))}
          </View>
        )}

        {/* Squad Section */}
        <Text style={styles.sectionTitle}>Your Squad</Text>
        <View style={styles.squadSection}>
          {SQUAD.map((member) => (
            <SquadCard key={member.id} member={member} />
          ))}
          <TouchableOpacity style={styles.inviteButton} activeOpacity={0.7}>
            <Text style={styles.inviteButtonText}>Invite a Friend →</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  countdownBadge: {
    backgroundColor: '#1DB88A',
    borderRadius: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  countdownText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  userRankCard: {
    backgroundColor: 'rgba(124,58,237,0.2)',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  userRankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userRankLabel: {
    ...typography.caption,
    color: '#A78BFA',
  },
  userLeague: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  userRankStats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  userRankStat: {
    alignItems: 'center',
  },
  userRankNumber: {
    ...typography.h1,
    color: '#A78BFA',
  },
  userRankStatLabel: {
    ...typography.small,
    color: 'rgba(255,255,255,0.5)',
  },
  progressSection: {
    marginTop: spacing.sm,
  },
  progressLabel: {
    ...typography.small,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#A78BFA',
    borderRadius: 4,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  leaderboard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
    position: 'relative',
  },
  leaderboardRowCurrent: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderRadius: 8,
  },
  currentUserIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  leaderboardRank: {
    ...typography.bodyBold,
    color: 'rgba(255,255,255,0.5)',
    width: 32,
    textAlign: 'center',
  },
  leaderboardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124,58,237,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderboardAvatarText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  leaderboardUsername: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  leaderboardUsernameCurrent: {
    color: '#A78BFA',
    fontWeight: '700',
  },
  leaderboardXP: {
    ...typography.bodyBold,
    color: '#F59E0B',
  },
  squadSection: {
    gap: spacing.sm,
  },
  squadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  squadAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squadAvatarText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  squadInfo: {
    flex: 1,
  },
  squadName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  squadXP: {
    ...typography.small,
    color: 'rgba(255,255,255,0.5)',
  },
  squadStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  squadStatusOnline: {
    backgroundColor: '#16A34A',
  },
  squadStatusOffline: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  inviteButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
  },
  inviteButtonText: {
    ...typography.bodyBold,
    color: '#7C3AED',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
