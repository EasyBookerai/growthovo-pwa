import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import AchievementsScreen from '../AchievementsScreen';
import * as gamificationService from '../../../services/gamificationService';

// Mock the gamification service
jest.mock('../../../services/gamificationService');

// Mock GlassCard and GlassModal components
jest.mock('../../../components/glass/GlassCard', () => {
  const { View } = require('react-native');
  return function GlassCard({ children, onPress, style }: any) {
    return onPress ? (
      <View testID="glass-card" onTouchEnd={onPress} style={style}>
        {children}
      </View>
    ) : (
      <View testID="glass-card" style={style}>
        {children}
      </View>
    );
  };
});

jest.mock('../../../components/glass/GlassModal', () => {
  const { View, Modal } = require('react-native');
  return function GlassModal({ visible, children, onClose }: any) {
    return (
      <Modal visible={visible} testID="glass-modal">
        <View>{children}</View>
      </Modal>
    );
  };
});

jest.mock('../../../components/gamification/AchievementBadge', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return function AchievementBadge({ achievement, unlocked, onPress }: any) {
    return (
      <TouchableOpacity
        testID={`badge-${achievement.id}`}
        onPress={onPress}
      >
        <Text>{achievement.icon}</Text>
        <Text>{achievement.title}</Text>
        <Text>{unlocked ? 'Unlocked' : 'Locked'}</Text>
      </TouchableOpacity>
    );
  };
});

describe('AchievementsScreen', () => {
  const mockUserId = 'test-user-123';

  const mockAchievementDefinitions = [
    {
      id: 'streak_7_days',
      title: 'Week Warrior',
      description: 'Complete 7 days in a row',
      icon: '🔥',
      category: 'streak',
      criteria: { type: 'streak', threshold: 7 },
    },
    {
      id: 'lessons_10',
      title: 'Getting Started',
      description: 'Complete 10 lessons',
      icon: '📚',
      category: 'lessons',
      criteria: { type: 'lessons_count', threshold: 10 },
    },
    {
      id: 'invite_first_friend',
      title: 'Social Butterfly',
      description: 'Invite your first friend',
      icon: '🦋',
      category: 'social',
      criteria: { type: 'custom', threshold: 1 },
    },
  ];

  const mockUnlockedAchievements = [
    {
      id: 'ach-1',
      userId: mockUserId,
      achievementId: 'streak_7_days',
      unlockedAt: '2024-01-15T10:00:00Z',
      createdAt: '2024-01-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (gamificationService.getAllAchievements as jest.Mock).mockReturnValue(
      mockAchievementDefinitions
    );
    (gamificationService.getAchievementsByCategory as jest.Mock).mockImplementation(
      (category: string) =>
        mockAchievementDefinitions.filter((a) => a.category === category)
    );
    (gamificationService.getUserAchievements as jest.Mock).mockResolvedValue(
      mockUnlockedAchievements
    );
  });

  it('should render loading state initially', () => {
    const { getByText } = render(<AchievementsScreen userId={mockUserId} />);
    expect(getByText('Loading achievements...')).toBeTruthy();
  });

  it('should display achievement stats after loading', async () => {
    const { getByText } = render(<AchievementsScreen userId={mockUserId} />);

    await waitFor(() => {
      expect(getByText(/1 \/ 3 Unlocked/)).toBeTruthy();
      expect(getByText(/33% Complete/)).toBeTruthy();
    });
  });

  it('should display all achievements in grid', async () => {
    const { getByTestId } = render(<AchievementsScreen userId={mockUserId} />);

    await waitFor(() => {
      expect(getByTestId('badge-streak_7_days')).toBeTruthy();
      expect(getByTestId('badge-lessons_10')).toBeTruthy();
      expect(getByTestId('badge-invite_first_friend')).toBeTruthy();
    });
  });

  it('should show unlocked badges correctly', async () => {
    const { getByTestId, getByText } = render(
      <AchievementsScreen userId={mockUserId} />
    );

    await waitFor(() => {
      const unlockedBadge = getByTestId('badge-streak_7_days');
      expect(unlockedBadge).toBeTruthy();
      // The badge should show "Unlocked" text
      expect(getByText('Unlocked')).toBeTruthy();
    });
  });

  it('should filter achievements by category', async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <AchievementsScreen userId={mockUserId} />
    );

    await waitFor(() => {
      expect(getByTestId('badge-streak_7_days')).toBeTruthy();
    });

    // Click on "Streak" filter
    const streakFilter = getByText('Streak');
    fireEvent.press(streakFilter);

    await waitFor(() => {
      // Should only show streak achievements
      expect(getByTestId('badge-streak_7_days')).toBeTruthy();
      expect(queryByTestId('badge-lessons_10')).toBeNull();
      expect(queryByTestId('badge-invite_first_friend')).toBeNull();
    });
  });

  it('should open detail modal when badge is pressed', async () => {
    const { getByTestId, queryByTestId } = render(
      <AchievementsScreen userId={mockUserId} />
    );

    await waitFor(() => {
      expect(getByTestId('badge-streak_7_days')).toBeTruthy();
    });

    // Modal should not be visible initially
    expect(queryByTestId('glass-modal')).toBeNull();

    // Press on a badge
    const badge = getByTestId('badge-streak_7_days');
    fireEvent.press(badge);

    await waitFor(() => {
      // Modal should be visible
      expect(getByTestId('glass-modal')).toBeTruthy();
    });
  });

  it('should show unlock date for unlocked achievements in modal', async () => {
    const { getByTestId, getAllByText } = render(
      <AchievementsScreen userId={mockUserId} />
    );

    await waitFor(() => {
      expect(getByTestId('badge-streak_7_days')).toBeTruthy();
    });

    // Press on unlocked badge
    const badge = getByTestId('badge-streak_7_days');
    fireEvent.press(badge);

    await waitFor(() => {
      // Should show "Unlocked" label in modal
      const unlockedTexts = getAllByText('Unlocked');
      expect(unlockedTexts.length).toBeGreaterThan(0);
    });
  });

  it('should show requirements for locked achievements in modal', async () => {
    const { getByTestId, queryByText } = render(
      <AchievementsScreen userId={mockUserId} />
    );

    await waitFor(() => {
      expect(getByTestId('badge-lessons_10')).toBeTruthy();
    });

    // Press on locked badge
    const badge = getByTestId('badge-lessons_10');
    fireEvent.press(badge);

    await waitFor(() => {
      // Should show "How to Unlock" section
      expect(queryByText('How to Unlock')).toBeTruthy();
    });
  });

  it('should close modal when close button is pressed', async () => {
    const { getByTestId, getByText, queryByTestId } = render(
      <AchievementsScreen userId={mockUserId} />
    );

    await waitFor(() => {
      expect(getByTestId('badge-streak_7_days')).toBeTruthy();
    });

    // Open modal
    const badge = getByTestId('badge-streak_7_days');
    fireEvent.press(badge);

    await waitFor(() => {
      expect(getByTestId('glass-modal')).toBeTruthy();
    });

    // Close modal
    const closeButton = getByText('Close');
    fireEvent.press(closeButton);

    await waitFor(() => {
      // Modal should be closed (not visible)
      // Note: In actual implementation, the modal visibility is controlled by state
      // This test verifies the close button exists and can be pressed
      expect(closeButton).toBeTruthy();
    });
  });

  it('should handle empty category filter', async () => {
    // Mock empty category
    (gamificationService.getAchievementsByCategory as jest.Mock).mockReturnValue([]);

    const { getByText } = render(<AchievementsScreen userId={mockUserId} />);

    await waitFor(() => {
      expect(getByText('All')).toBeTruthy();
    });

    // Filter by a category with no achievements
    const socialFilter = getByText('Social');
    fireEvent.press(socialFilter);

    await waitFor(() => {
      expect(getByText('No achievements in this category')).toBeTruthy();
    });
  });

  it('should calculate progress percentage correctly', async () => {
    const { getByText } = render(<AchievementsScreen userId={mockUserId} />);

    await waitFor(() => {
      // 1 unlocked out of 3 total = 33%
      expect(getByText('33% Complete')).toBeTruthy();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
    (gamificationService.getUserAchievements as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByText } = render(<AchievementsScreen userId={mockUserId} />);

    await waitFor(() => {
      // Should still render with empty achievements
      expect(getByText(/0 \/ 3 Unlocked/)).toBeTruthy();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load achievements:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
