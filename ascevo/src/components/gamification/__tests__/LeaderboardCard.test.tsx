import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LeaderboardCard from '../LeaderboardCard';
import type { LeagueMember } from '../../../types';

describe('LeaderboardCard', () => {
  const mockMembers: LeagueMember[] = [
    {
      id: '1',
      leagueId: 'league-1',
      userId: 'user-1',
      username: 'Alice',
      avatarUrl: 'https://example.com/alice.jpg',
      weeklyXp: 1500,
      rank: 1,
    },
    {
      id: '2',
      leagueId: 'league-1',
      userId: 'user-2',
      username: 'Bob',
      weeklyXp: 1200,
      rank: 2,
    },
    {
      id: '3',
      leagueId: 'league-1',
      userId: 'user-3',
      username: 'Charlie',
      avatarUrl: 'https://example.com/charlie.jpg',
      weeklyXp: 1000,
      rank: 3,
    },
    {
      id: '4',
      leagueId: 'league-1',
      userId: 'user-4',
      username: 'David',
      weeklyXp: 800,
      rank: 4,
    },
    {
      id: '5',
      leagueId: 'league-1',
      userId: 'user-5',
      username: 'Eve',
      weeklyXp: 600,
      rank: 5,
    },
  ];

  describe('Rendering', () => {
    it('should render leaderboard with all members in full variant', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-3"
          variant="full"
        />
      );

      expect(getByText('🏆 Leaderboard')).toBeTruthy();
      expect(getByText('Alice')).toBeTruthy();
      expect(getByText('Bob')).toBeTruthy();
      expect(getByText('Charlie (you)')).toBeTruthy();
      expect(getByText('David')).toBeTruthy();
      expect(getByText('Eve')).toBeTruthy();
    });

    it('should render only top 5 members in compact variant', () => {
      const manyMembers = [
        ...mockMembers,
        {
          id: '6',
          leagueId: 'league-1',
          userId: 'user-6',
          username: 'Frank',
          weeklyXp: 400,
          rank: 6,
        },
      ];

      const { getByText, queryByText } = render(
        <LeaderboardCard
          members={manyMembers}
          currentUserId="user-1"
          variant="compact"
        />
      );

      expect(getByText('Alice (you)')).toBeTruthy();
      expect(getByText('Eve')).toBeTruthy();
      expect(queryByText('Frank')).toBeNull();
    });

    it('should display rank emojis for top 3', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByText('🥇')).toBeTruthy(); // Rank 1
      expect(getByText('🥈')).toBeTruthy(); // Rank 2
      expect(getByText('🥉')).toBeTruthy(); // Rank 3
      expect(getByText('#4')).toBeTruthy(); // Rank 4
    });

    it('should display XP with proper formatting', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByText('1,500')).toBeTruthy();
      expect(getByText('1,200')).toBeTruthy();
    });

    it('should show avatar placeholder when avatarUrl is missing', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-2"
          variant="full"
        />
      );

      // Bob has no avatar, should show first letter
      expect(getByText('B')).toBeTruthy();
    });
  });

  describe('Current User Highlighting', () => {
    it('should highlight current user row', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-3"
          variant="full"
        />
      );

      const currentUserText = getByText('Charlie (you)');
      expect(currentUserText).toBeTruthy();
    });

    it('should append "(you)" to current user name', () => {
      const { getByText, queryByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByText('Alice (you)')).toBeTruthy();
      expect(queryByText('Bob (you)')).toBeNull();
    });
  });

  describe('Interaction', () => {
    it('should call onMemberPress when member row is pressed', () => {
      const onMemberPress = jest.fn();
      const { getByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          onMemberPress={onMemberPress}
          variant="full"
        />
      );

      fireEvent.press(getByText('Bob'));
      expect(onMemberPress).toHaveBeenCalledWith('user-2');
    });

    it('should not make rows pressable when onMemberPress is not provided', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          variant="full"
        />
      );

      // Should not throw error when pressing
      const bobText = getByText('Bob');
      expect(() => fireEvent.press(bobText)).not.toThrow();
    });
  });

  describe('Variants', () => {
    it('should show rank labels in full variant', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByText('Rank #1')).toBeTruthy();
      expect(getByText('Rank #2')).toBeTruthy();
    });

    it('should not show rank labels in compact variant', () => {
      const { queryByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          variant="compact"
        />
      );

      expect(queryByText('Rank #1')).toBeNull();
      expect(queryByText('Rank #2')).toBeNull();
    });

    it('should show "View All" in compact variant when more than 5 members', () => {
      const manyMembers = [
        ...mockMembers,
        {
          id: '6',
          leagueId: 'league-1',
          userId: 'user-6',
          username: 'Frank',
          weeklyXp: 400,
          rank: 6,
        },
      ];

      const { getByText } = render(
        <LeaderboardCard
          members={manyMembers}
          currentUserId="user-1"
          variant="compact"
        />
      );

      expect(getByText('View All')).toBeTruthy();
    });

    it('should not show "View All" in compact variant when 5 or fewer members', () => {
      const { queryByText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          variant="compact"
        />
      );

      expect(queryByText('View All')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty members array', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={[]}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByText('🏆 Leaderboard')).toBeTruthy();
    });

    it('should handle single member', () => {
      const { getByText } = render(
        <LeaderboardCard
          members={[mockMembers[0]]}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByText('Alice (you)')).toBeTruthy();
      expect(getByText('🥇')).toBeTruthy();
    });

    it('should handle very long usernames', () => {
      const longNameMember: LeagueMember = {
        id: '1',
        leagueId: 'league-1',
        userId: 'user-1',
        username: 'VeryLongUsernameThatshouldBeTruncated',
        weeklyXp: 1000,
        rank: 1,
      };

      const { getByText } = render(
        <LeaderboardCard
          members={[longNameMember]}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByText('VeryLongUsernameThatshouldBeTruncated (you)')).toBeTruthy();
    });

    it('should handle large XP values', () => {
      const highXpMember: LeagueMember = {
        id: '1',
        leagueId: 'league-1',
        userId: 'user-1',
        username: 'HighScorer',
        weeklyXp: 999999,
        rank: 1,
      };

      const { getByText } = render(
        <LeaderboardCard
          members={[highXpMember]}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByText('999,999')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for avatars', () => {
      const { getByLabelText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          variant="full"
        />
      );

      expect(getByLabelText("Alice's avatar")).toBeTruthy();
    });

    it('should have proper accessibility role for pressable rows', () => {
      const onMemberPress = jest.fn();
      const { getByLabelText } = render(
        <LeaderboardCard
          members={mockMembers}
          currentUserId="user-1"
          onMemberPress={onMemberPress}
          variant="full"
        />
      );

      expect(getByLabelText("View Bob's profile")).toBeTruthy();
    });
  });
});
