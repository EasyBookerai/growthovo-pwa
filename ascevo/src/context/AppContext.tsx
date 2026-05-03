import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';

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
  xp: number;
  streak: number;
  level: number;
  isLoading: boolean;
  error: string | null;
  updateXP: (amount: number) => Promise<void>;
  updateStreak: (newStreak: number) => Promise<void>;
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
  const [level, setLevel] = useState<number>(1);
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
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('total_xp, current_streak')
        .eq('id', userId)
        .single();

      if (fetchError) {
        const errorMessage = 'Unable to load your progress. Please check your connection.';
        console.error('[AppContext] Failed to fetch user data:', fetchError);
        setError(errorMessage);
        return;
      }

      if (data) {
        setXp(data.total_xp || 0);
        setStreak(data.current_streak || 0);
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

  const value: AppContextState = {
    xp,
    streak,
    level,
    isLoading,
    error,
    updateXP,
    updateStreak,
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
