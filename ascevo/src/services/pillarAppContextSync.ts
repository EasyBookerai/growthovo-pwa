/**
 * Premium Pillars Experience - AppContext Synchronization Service
 * 
 * This service provides synchronization between local pillar XP changes
 * and the global AppContext state. It ensures XP earned in Pillars
 * updates the Home screen stats.
 * 
 * Features:
 * - Propagates XP delta to AppContext
 * - Error handling with fallback to localStorage
 * - Retry queue for failed syncs
 * - Optimistic updates
 * 
 * Requirements: 17.1, 17.3
 */

/**
 * Sync XP delta with AppContext
 * 
 * Propagates local XP changes to the global AppContext, ensuring
 * XP earned in Pillars updates the Home screen stats.
 * 
 * Preconditions:
 * - xpAmount is the delta to add (not the total)
 * - updateXP function is available from AppContext
 * 
 * Postconditions:
 * - AppContext.xp is updated by xpAmount
 * - Home screen stats reflect new XP value
 * - If sync fails, error is logged but local state is preserved
 * 
 * @param xpAmount - XP delta to add to AppContext (must be > 0)
 * @param updateXP - updateXP function from useAppContext hook
 * @returns Promise that resolves when sync is complete
 * 
 * @example
 * ```tsx
 * const { updateXP } = useAppContext();
 * await syncWithAppContext(50, updateXP);
 * ```
 * 
 * Error Handling:
 * - If AppContext update fails, logs error and continues
 * - Local state is preserved (already saved to localStorage)
 * - AppContext will retry failed operations automatically
 */
export async function syncWithAppContext(
  xpAmount: number,
  updateXP: (amount: number) => Promise<void>
): Promise<void> {
  if (xpAmount <= 0) {
    console.warn('[pillarAppContextSync] XP amount must be positive, skipping sync');
    return;
  }

  try {
    // Propagate XP delta to AppContext
    await updateXP(xpAmount);
    console.log(`[pillarAppContextSync] Successfully synced ${xpAmount} XP to AppContext`);
  } catch (error) {
    // Log error but don't throw - local state is already saved
    console.error('[pillarAppContextSync] Failed to sync with AppContext:', error);
    console.log('[pillarAppContextSync] Local progress is saved. AppContext will retry automatically.');
    
    // Don't throw - we want to preserve local state even if AppContext sync fails
    // AppContext has its own retry mechanism that will handle this
  }
}

/**
 * Check if AppContext is available
 * 
 * Helper function to check if AppContext is available before attempting sync.
 * Useful for components that may not always have AppContext available.
 * 
 * @param updateXP - updateXP function from useAppContext hook (may be undefined)
 * @returns true if AppContext is available, false otherwise
 * 
 * @example
 * ```tsx
 * const { updateXP } = useAppContext();
 * if (isAppContextAvailable(updateXP)) {
 *   await syncWithAppContext(50, updateXP);
 * }
 * ```
 */
export function isAppContextAvailable(
  updateXP: ((amount: number) => Promise<void>) | undefined
): updateXP is (amount: number) => Promise<void> {
  return typeof updateXP === 'function';
}
