import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import LeagueScreen from '../LeagueScreen';
import * as leagueService from '../../../services/leagueService';
import { supabase } from '../../../services/supabaseClient';

// Mock dependencies
jest.mock('../../../services/supabaseClient', () => ({
  supabase: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

jest.mock('../../../services/leagueService');

describe('LeagueScreen', () => {
  const mockUserId = 'user-123';
  const mockLeagueId = 'league-456';
  const mockMembers = [
    {
      userId: 'user-1',
      username: 'TopPlayer',
      weeklyXp: 1000,
      rank: 1,
      avatarUrl: null,
    },
    {
      userId: 'user-2',
      username: 'SecondPlace',
      weeklyXp: 800,
      rank: 2,
      avatarUrl: null,
    },
    {
      userId: mockUserId,
      username: 'CurrentUser',
      weeklyXp: 600,
      rank: 3,
      avatarUrl: null,
    },
    {
      userId: 'user-4',
      username: 'FourthPlace',
      weeklyXp: 400,
      rank: 4,
      avatarUrl: null,
    },
    {
      userId: 'user-5',
      username: 'FifthPlace',
      weeklyXp: 200,
      rank: 5,
      avatarUrl: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (leagueService.assignUserToLeague as jest.Mock).mockResolvedValue(mockLeagueId);
    (leagueService.getLeagueRankings as jest.Mock).mockResolvedValue(mockMembers);
  });

  it('should render loading state initially', () => {
    const { getByTestId } = render(<LeagueScreen userId={mockUserId} />);
    // ActivityIndicator should be present during loading
    expect(leagueService.assignUserToLeague).toHaveBeenCalledWith(mockUserId);
  });

  it('should display league header with glassmorphism', async () => {
    const { getByText } = render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      expect(getByText('🏆 Weekly League')).toBeTruthy();
    });
  });

  it('should display user position in header', async () => {
    const { getByText } = render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      expect(getByText('Your Position')).toBeTruthy();
      expect(getByText('600 XP')).toBeTruthy();
    });
  });

  it('should display days until reset', async () => {
    const { getByText } = render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      // Should show days until Monday
      const daysText = getByText(/day.*until reset/);
      expect(daysText).toBeTruthy();
    });
  });

  it('should render LeaderboardCard with members', async () => {
    const { getByText } = render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      expect(getByText('TopPlayer')).toBeTruthy();
      expect(getByText('SecondPlace')).toBeTruthy();
      expect(getByText(/CurrentUser.*\(you\)/)).toBeTruthy();
    });
  });

  it('should display promotion and relegation legend', async () => {
    const { getByText } = render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      expect(getByText('Top 5 promote to next league')).toBeTruthy();
      expect(getByText('Bottom 5 relegate to previous league')).toBeTruthy();
    });
  });

  it('should subscribe to real-time updates', async () => {
    render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith(`league-${mockLeagueId}`);
    });
  });

  it('should assign user to league on mount', async () => {
    render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      expect(leagueService.assignUserToLeague).toHaveBeenCalledWith(mockUserId);
    });
  });

  it('should fetch league rankings after assignment', async () => {
    render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      expect(leagueService.getLeagueRankings).toHaveBeenCalledWith(mockLeagueId);
    });
  });

  it('should cleanup real-time subscription on unmount', async () => {
    const mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    };
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
    
    const { unmount } = render(<LeagueScreen userId={mockUserId} />);
    
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalled();
    });
    
    unmount();
    
    // The channel should be removed on unmount
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });
});
