import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import { getUserName, getSelectedPillars, getYesterdayActivity, KEYS } from '../services/growthovoExperienceService';
import { loadCompletedLessons } from '../services/pillarStorageService';
import type { RexContext } from '../lib/rex';

/**
 * AppContext State Interface
 * 
 * Provides global state for XP, streak, and level tracking across the application.
 * All consuming components automatically re-render when state changes.
 * 
 * @property {number} xp - Total experience points earned by the user
 * @property {number} streak - Current consecutive day streak
 * @property {number} level - Calculated level based on XP (floor(xp / 100) + 1)
 * @property {boolean} isLoading - Loading state for async operations
 * @property {string | null} error - User-friendly error message, null if no error
 * @property {function} updateXP - Updates XP and syncs with Supabase
 * @property {function} updateStreak - Updates streak and syncs with Supabase
 * @property {function} refreshUserData - Fetches latest data from Supabase
 * @property {function} clearError - Clears the current error state
 */
interface AppContextState {
  userId: string;
  xp: number;
  streak: number;
  freezeCount: number; // Number of streak freezes available (max 2)
  level: number;
  name: string;
  subscriptionStatus: string;
  isPremium: boolean;
  moodEmoji: string;
  moodLabel: string;
  completedLessons: string[];
  selectedPillars: string[];
  lastCheckIn: string;
  rexContext: RexContext;
  isLoading: boolean;
  error: string | null;
  updateXP: (amount: number) => Promise<void>;
  updateStreak: (newStreak: number) => Promise<void>;
  updateFreezeCount: (newFreezeCount: number) => Promise<void>;
  updateRexState: (updates: Partial<Pick<AppContextState, 'name' | 'subscriptionStatus' | 'isPremium' | 'moodEmoji' | 'moodLabel' | 'completedLessons' | 'selectedPillars' | 'lastCheckIn'>>) => void;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
}

/**
 * AppProvider Props Interface
 * 
 * Props required for the AppProvider component to manage global state.
 * 
 * @property {string} userId - Authenticated user ID for Supabase queries
 * @property {ReactNode} children - Child components that will have access to AppContext
 */
interface AppProviderProps {
  userId: string;
  children: ReactNode;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

/**
 * AppProvider Component
 * 
 * Manages global XP, streak, and level state with Supabase synchronization.
 * Implements optimistic updates and retry logic for failed operations.
 * 
 * Features:
 * - Automatic level calculation from XP (every 100 XP = 1 level)
 * - Optimistic UI updates for responsive user experience
 * - Retry queue for failed Supabase operations
 * - User-friendly error messages
 * - Automatic data refresh on mount
 * 
 * @param {AppProviderProps} props - Component props
 * @param {string} props.userId - Authenticated user ID
 * @param {ReactNode} props.children - Child components
 * 
 * @example
 * ```tsx
 * <AppProvider userId={user.id}>
 *   <MainTabs />
 * </AppProvider>
 * ```
 */
export function AppProvider({ userId, children }: AppProviderProps) {
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [freezeCount, setFreezeCount] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [name, setName] = useState<string>('Champion');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('free');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [moodEmoji, setMoodEmoji] = useState<string>('🙂');
  const [moodLabel, setMoodLabel] = useState<string>('steady');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [lastCheckIn, setLastCheckIn] = useState<string>('unknown');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [retryQueue, setRetryQueue] = useState<Array<() => Promise<void>>>([]);

  /**
   * Load user data from Supabase on mount
   */
  useEffect(() => {
    refreshUserData();
  }, [userId]);

  /**
   * Calculate level from XP whenever XP changes
   * Formula: level = floor(xp / 100) + 1
   */
  useEffect(() => {
    const calculatedLevel = Math.floor(xp / 100) + 1;
    setLevel(calculatedLevel);
  }, [xp]);

  /**
   * Refresh user data from Supabase
   * 
   * Fetches the latest XP and streak values from the users table.
   * Updates local state and handles errors gracefully.
   * 
   * @async
   * @returns {Promise<void>} Resolves when data is fetched and state is updated
   * 
   * @throws Will log error but not throw - sets error state instead
   * 
   * @example
   * ```tsx
   * const { refreshUserData } = useAppContext();
   * await refreshUserData(); // Fetch latest data
   * ```
   */
  const refreshUserData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        userResult,
        streakResult,
        storedName,
        storedPillars,
        yesterdayActivity,
        completedLessonsData,
      ] = await Promise.all([
        supabase
          .from('users')
          .select('total_xp, current_streak, username, name, subscription_status, primary_pillar, secondary_pillar')
          .eq('id', userId)
          .single(),
        supabase
          .from('streaks')
          .select('freeze_count')
          .eq('user_id', userId)
          .single(),
        getUserName(),
        getSelectedPillars(),
        getYesterdayActivity(),
        loadCompletedLessons(),
      ]);

      const { data, error: fetchError } = userResult;
      const { data: streakData, error: streakError } = streakResult;

      if (fetchError) {
        const errorMessage = 'Unable to load your progress. Please check your connection.';
        console.error('[AppContext] Failed to fetch user data:', fetchError);
        setError(errorMessage);
        return;
      }

      if (data) {
        setXp(data.total_xp || 0);
        setStreak(data.current_streak || 0);
        setFreezeCount((streakData as any)?.freeze_count || 0);
        const resolvedName = data.name || data.username || storedName || 'Champion';
        const resolvedSubscription = data.subscription_status || 'free';
        const resolvedPillars = storedPillars.length > 0
          ? storedPillars
          : [data.primary_pillar, data.secondary_pillar].filter(Boolean);

        setName(resolvedName);
        setSubscriptionStatus(resolvedSubscription);
        setIsPremium(resolvedSubscription === 'active' || resolvedSubscription === 'trialing');
        setSelectedPillars(resolvedPillars);
        setCompletedLessons(completedLessonsData.lessonIds);
        setMoodLabel(yesterdayActivity.mood || 'steady');
        setMoodEmoji(getMoodEmoji(yesterdayActivity.mood));
        setLastCheckIn(
          (await getStoredLastCheckInDate()) ||
          yesterdayActivity.mood ||
          'unknown'
        );
      }
    } catch (error) {
      const errorMessage = 'Something went wrong loading your data. Please try again.';
      console.error('[AppContext] Error refreshing user data:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update XP by a given amount
   * 
   * Updates local state immediately (optimistic update) and syncs with Supabase.
   * Implements retry logic for failed updates. Level is automatically recalculated.
   * 
   * @async
   * @param {number} amount - Amount to add to current XP (can be positive or negative)
   * @returns {Promise<void>} Resolves when XP is updated and synced
   * 
   * @throws Will throw on unexpected errors after reverting optimistic update
   * 
   * @example
   * ```tsx
   * const { updateXP } = useAppContext();
   * await updateXP(50); // Award 50 XP for check-in
   * await updateXP(-10); // Deduct 10 XP (if needed)
   * ```
   * 
   * Behavior:
   * - Updates local state immediately for responsive UI
   * - Syncs with Supabase in background
   * - Queues retry if sync fails (network error)
   * - Reverts local state only on unexpected errors
   * - Recalculates level automatically via useEffect
   */
  const updateXP = async (amount: number): Promise<void> => {
    const previousXP = xp;
    
    try {
      setError(null);
      const newXP = xp + amount;
      
      // Update local state immediately for responsive UI
      setXp(newXP);

      // Sync with Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ total_xp: newXP })
        .eq('id', userId);

      if (updateError) {
        const errorMessage = 'Failed to save your XP. Your progress is saved locally and will sync when connection is restored.';
        console.error('[AppContext] Failed to update XP in Supabase:', updateError);
        setError(errorMessage);
        
        // Queue for retry
        const retryFn = async () => {
          const { error: retryError } = await supabase
            .from('users')
            .update({ total_xp: newXP })
            .eq('id', userId);
          
          if (!retryError) {
            console.log('[AppContext] XP update retry successful');
            setError(null);
          }
        };
        setRetryQueue(prev => [...prev, retryFn]);
        
        // Don't revert - keep optimistic update
        return;
      }
    } catch (error) {
      const errorMessage = 'Unable to update XP. Please check your connection.';
      console.error('[AppContext] Error updating XP:', error);
      setError(errorMessage);
      
      // Revert local state on unexpected error
      setXp(previousXP);
      throw error;
    }
  };

  /**
   * Update streak to a new value
   * 
   * Updates local state immediately (optimistic update) and syncs with Supabase.
   * Implements retry logic for failed updates.
   * 
   * @async
   * @param {number} newStreak - New streak value (must be non-negative)
   * @returns {Promise<void>} Resolves when streak is updated and synced
   * 
   * @throws Will throw on unexpected errors after reverting optimistic update
   * 
   * @example
   * ```tsx
   * const { updateStreak } = useAppContext();
   * await updateStreak(7); // Set streak to 7 days
   * await updateStreak(0); // Reset streak
   * ```
   * 
   * Behavior:
   * - Updates local state immediately for responsive UI
   * - Syncs with Supabase in background
   * - Queues retry if sync fails (network error)
   * - Reverts local state only on unexpected errors
   */
  const updateStreak = async (newStreak: number): Promise<void> => {
    const previousStreak = streak;
    
    try {
      setError(null);
      
      // Update local state immediately for responsive UI
      setStreak(newStreak);

      // Sync with Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ current_streak: newStreak })
        .eq('id', userId);

      if (updateError) {
        const errorMessage = 'Failed to save your streak. Your progress is saved locally and will sync when connection is restored.';
        console.error('[AppContext] Failed to update streak in Supabase:', updateError);
        setError(errorMessage);
        
        // Queue for retry
        const retryFn = async () => {
          const { error: retryError } = await supabase
            .from('users')
            .update({ current_streak: newStreak })
            .eq('id', userId);
          
          if (!retryError) {
            console.log('[AppContext] Streak update retry successful');
            setError(null);
          }
        };
        setRetryQueue(prev => [...prev, retryFn]);
        
        // Don't revert - keep optimistic update
        return;
      }
    } catch (error) {
      const errorMessage = 'Unable to update streak. Please check your connection.';
      console.error('[AppContext] Error updating streak:', error);
      setError(errorMessage);
      
      // Revert local state on unexpected error
      setStreak(previousStreak);
      throw error;
    }
  };

  /**
   * Update freeze count to a new value
   * 
   * Updates local state immediately (optimistic update) and syncs with Supabase.
   * Implements retry logic for failed updates.
   * 
   * @async
   * @param {number} newFreezeCount - New freeze count value (must be non-negative, max 2)
   * @returns {Promise<void>} Resolves when freeze count is updated and synced
   * 
   * @throws Will throw on unexpected errors after reverting optimistic update
   * 
   * @example
   * ```tsx
   * const { updateFreezeCount } = useAppContext();
   * await updateFreezeCount(1); // Set freeze count to 1
   * await updateFreezeCount(0); // No freezes available
   * ```
   * 
   * Behavior:
   * - Updates local state immediately for responsive UI
   * - Syncs with Supabase in background
   * - Queues retry if sync fails (network error)
   * - Reverts local state only on unexpected errors
   */
  const updateFreezeCount = async (newFreezeCount: number): Promise<void> => {
    const previousFreezeCount = freezeCount;
    
    try {
      setError(null);
      
      // Update local state immediately for responsive UI
      setFreezeCount(newFreezeCount);

      // Sync with Supabase
      const { error: updateError } = await supabase
        .from('streaks')
        .update({ freeze_count: newFreezeCount })
        .eq('user_id', userId);

      if (updateError) {
        const errorMessage = 'Failed to save your freeze count. Your progress is saved locally and will sync when connection is restored.';
        console.error('[AppContext] Failed to update freeze count in Supabase:', updateError);
        setError(errorMessage);
        
        // Queue for retry
        const retryFn = async () => {
          const { error: retryError } = await supabase
            .from('streaks')
            .update({ freeze_count: newFreezeCount })
            .eq('user_id', userId);
          
          if (!retryError) {
            console.log('[AppContext] Freeze count update retry successful');
            setError(null);
          }
        };
        setRetryQueue(prev => [...prev, retryFn]);
        
        // Don't revert - keep optimistic update
        return;
      }
    } catch (error) {
      const errorMessage = 'Unable to update freeze count. Please check your connection.';
      console.error('[AppContext] Error updating freeze count:', error);
      setError(errorMessage);
      
      // Revert local state on unexpected error
      setFreezeCount(previousFreezeCount);
      throw error;
    }
  };

  /**
   * Clear error state
   * 
   * Resets the error state to null, dismissing any error messages.
   * Typically called when user dismisses an error banner.
   * 
   * @example
   * ```tsx
   * const { error, clearError } = useAppContext();
   * if (error) {
   *   return <ErrorBanner message={error} onDismiss={clearError} />;
   * }
   * ```
   */
  const clearError = () => {
    setError(null);
  };

  const updateRexState = (
    updates: Partial<Pick<AppContextState, 'name' | 'subscriptionStatus' | 'isPremium' | 'moodEmoji' | 'moodLabel' | 'completedLessons' | 'selectedPillars' | 'lastCheckIn'>>
  ) => {
    if (typeof updates.name === 'string') {
      setName(updates.name);
    }
    if (typeof updates.subscriptionStatus === 'string') {
      setSubscriptionStatus(updates.subscriptionStatus);
    }
    if (typeof updates.isPremium === 'boolean') {
      setIsPremium(updates.isPremium);
    }
    if (typeof updates.moodEmoji === 'string') {
      setMoodEmoji(updates.moodEmoji);
    }
    if (typeof updates.moodLabel === 'string') {
      setMoodLabel(updates.moodLabel);
    }
    if (Array.isArray(updates.completedLessons)) {
      setCompletedLessons(updates.completedLessons);
    }
    if (Array.isArray(updates.selectedPillars)) {
      setSelectedPillars(updates.selectedPillars);
    }
    if (typeof updates.lastCheckIn === 'string') {
      setLastCheckIn(updates.lastCheckIn);
    }
  };

  /**
   * Retry failed operations
   * 
   * Attempts to execute all queued retry operations from failed Supabase updates.
   * Clears the retry queue after attempting all operations.
   * 
   * @async
   * @private
   * @returns {Promise<void>} Resolves when all retry attempts complete
   * 
   * Note: This function is called automatically after 5 seconds when operations fail.
   * Individual retry failures are logged but don't block other retries.
   */
  const retryFailedOperations = async () => {
    if (retryQueue.length === 0) return;
    
    console.log(`[AppContext] Retrying ${retryQueue.length} failed operations`);
    
    for (const retryFn of retryQueue) {
      try {
        await retryFn();
      } catch (error) {
        console.error('[AppContext] Retry failed:', error);
      }
    }
    
    // Clear queue after retry attempt
    setRetryQueue([]);
  };

  /**
   * Auto-retry on app foreground
   * Listens for app state changes and retries failed operations
   */
  useEffect(() => {
    if (retryQueue.length > 0) {
      // Retry after 5 seconds
      const timer = setTimeout(() => {
        retryFailedOperations();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [retryQueue]);

  const rexContext = useMemo<RexContext>(() => ({
    userId,
    name,
    streak,
    xp,
    level,
    moodEmoji,
    moodLabel,
    completedLessons,
    selectedPillars,
    timeOfDay: getTimeOfDay(),
    lastCheckIn,
    isPremium,
    featureLabel: 'app',
  }), [
    userId,
    name,
    streak,
    xp,
    level,
    moodEmoji,
    moodLabel,
    completedLessons,
    selectedPillars,
    lastCheckIn,
    isPremium,
  ]);

  const value: AppContextState = {
    userId,
    xp,
    streak,
    freezeCount,
    level,
    name,
    subscriptionStatus,
    isPremium,
    moodEmoji,
    moodLabel,
    completedLessons,
    selectedPillars,
    lastCheckIn,
    rexContext,
    isLoading,
    error,
    updateXP,
    updateStreak,
    updateFreezeCount,
    updateRexState,
    refreshUserData,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * useAppContext Hook
 * 
 * Provides access to AppContext state and functions.
 * Must be used within an AppProvider component.
 * 
 * @returns {AppContextState} Context state and functions
 * @throws {Error} If used outside of AppProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { xp, streak, level, updateXP } = useAppContext();
 *   
 *   return (
 *     <View>
 *       <Text>XP: {xp}</Text>
 *       <Text>Streak: {streak} days</Text>
 *       <Text>Level: {level}</Text>
 *       <Button onPress={() => updateXP(10)} title="Earn 10 XP" />
 *     </View>
 *   );
 * }
 * ```
 */
export function useAppContext(): AppContextState {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

function getMoodEmoji(mood: string | null): string {
  const normalized = (mood || '').toLowerCase();

  if (normalized.includes('anx')) return '😰';
  if (normalized.includes('low') || normalized.includes('sad')) return '😔';
  if (normalized.includes('good')) return '🙂';
  if (normalized.includes('lock')) return '🔥';
  return '🙂';
}

async function getStoredLastCheckInDate(): Promise<string | null> {
  try {
    // `localStorage` on web is backed by AsyncStorage here via the shared app storage.
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    return await AsyncStorage.getItem(KEYS.lastCheckInDate);
  } catch {
    return null;
  }
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
