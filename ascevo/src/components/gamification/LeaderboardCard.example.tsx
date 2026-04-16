import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import LeaderboardCard from './LeaderboardCard';
import type { LeagueMember } from '../../types';
import { colors, spacing } from '../../theme';

/**
 * Example usage of LeaderboardCard component
 * 
 * This file demonstrates:
 * - Full variant with all members
 * - Compact variant with top 5 members
 * - Member press interaction
 * - Current user highlighting
 * - Rank-up animations
 */

const mockMembers: LeagueMember[] = [
  {
    id: '1',
    leagueId: 'league-1',
    userId: 'user-1',
    username: 'Alice',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    weeklyXp: 2500,
    rank: 1,
  },
  {
    id: '2',
    leagueId: 'league-1',
    userId: 'user-2',
    username: 'Bob',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    weeklyXp: 2200,
    rank: 2,
  },
  {
    id: '3',
    leagueId: 'league-1',
    userId: 'user-3',
    username: 'Charlie',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    weeklyXp: 1800,
    rank: 3,
  },
  {
    id: '4',
    leagueId: 'league-1',
    userId: 'current-user',
    username: 'You',
    weeklyXp: 1500,
    rank: 4,
  },
  {
    id: '5',
    leagueId: 'league-1',
    userId: 'user-5',
    username: 'Eve',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    weeklyXp: 1200,
    rank: 5,
  },
  {
    id: '6',
    leagueId: 'league-1',
    userId: 'user-6',
    username: 'Frank',
    weeklyXp: 1000,
    rank: 6,
  },
  {
    id: '7',
    leagueId: 'league-1',
    userId: 'user-7',
    username: 'Grace',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    weeklyXp: 800,
    rank: 7,
  },
  {
    id: '8',
    leagueId: 'league-1',
    userId: 'user-8',
    username: 'Henry',
    weeklyXp: 600,
    rank: 8,
  },
];

export default function LeaderboardCardExample() {
  const handleMemberPress = (userId: string) => {
    console.log('Member pressed:', userId);
    // Navigate to user profile or show details
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Full Variant */}
      <View style={styles.section}>
        <LeaderboardCard
          members={mockMembers}
          currentUserId="current-user"
          onMemberPress={handleMemberPress}
          variant="full"
        />
      </View>

      {/* Compact Variant */}
      <View style={styles.section}>
        <LeaderboardCard
          members={mockMembers}
          currentUserId="current-user"
          onMemberPress={handleMemberPress}
          variant="compact"
        />
      </View>

      {/* Without Press Handler */}
      <View style={styles.section}>
        <LeaderboardCard
          members={mockMembers.slice(0, 3)}
          currentUserId="current-user"
          variant="full"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
});
