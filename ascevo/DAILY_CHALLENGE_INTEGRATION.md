# Daily Challenge Integration Guide

## Overview

This guide explains how to integrate the daily challenge completion logic into the PillarsScreen DetailView. The implementation follows the design specification for Task 5.3.

## Implementation Summary

### Files Created

1. **`src/services/pillarChallengeService.ts`**
   - Core service for challenge completion logic
   - Functions: `awardXP`, `completeDailyChallenge`, `isChallengeCompletedToday`, `checkDailyResetForAllPillars`

2. **`src/__tests__/pillarChallengeService.test.ts`**
   - Unit tests for challenge service
   - 14 tests covering all functionality and edge cases

3. **`src/examples/DailyChallengeIntegration.example.tsx`**
   - Example component showing integration pattern

## Key Features

### 1. Challenge Completion
- Awards 30 XP when challenge is completed
- Updates pillar XP and recalculates level
- Syncs with global XP in localStorage
- Persists completion status

### 2. Daily Reset
- Challenges reset at midnight (based on date change)
- Automatic reset check when loading challenge status
- Can be triggered manually via `checkDailyResetForAllPillars()`

### 3. Error Handling
- Prevents duplicate completions on same day
- Validates pillar keys
- Handles localStorage errors gracefully

## Integration Steps

### Step 1: Import Required Functions

```typescript
import {
  completeDailyChallenge,
  isChallengeCompletedToday,
} from '../services/pillarChallengeService';
import { loadPillarProgress } from '../services/pillarStorageService';
```

### Step 2: Add State for Challenge Status

```typescript
const [challengeCompleted, setChallengeCompleted] = useState(false);
```

### Step 3: Load Challenge Status

Add this to your `loadPillarLessons` or similar function:

```typescript
async function loadPillarData(pillar: PillarDisplay) {
  try {
    // ... existing lesson loading code ...
    
    // Load challenge status
    const completed = await isChallengeCompletedToday(pillar.key as PremiumPillarKey);
    setChallengeCompleted(completed);
    
    // Load pillar progress for XP/level display
    const progress = await loadPillarProgress(pillar.key as PremiumPillarKey);
    // Update UI with progress.xp and progress.level
    
  } catch (error) {
    console.error('Failed to load pillar data:', error);
  }
}
```

### Step 4: Handle Challenge Completion

```typescript
async function handleChallengeComplete() {
  if (!selectedPillar) return;
  
  try {
    // Complete the challenge (awards 30 XP)
    await completeDailyChallenge(selectedPillar.key as PremiumPillarKey);
    
    // Update UI state
    setChallengeCompleted(true);
    
    // Reload pillar data to show updated XP/level
    await loadPillarData(selectedPillar);
    
    // Optional: Show success message
    console.log('✅ Challenge completed! +30 XP');
    
  } catch (error: any) {
    if (error.message === 'Challenge already completed today') {
      // User already completed this challenge
      setChallengeCompleted(true);
    } else {
      // Show error to user
      console.error('Failed to complete challenge:', error);
    }
  }
}
```

### Step 5: Render DailyChallengeCard

Add this to your DetailView modal, between the stats row and lessons list:

```typescript
{/* Daily Challenge Card */}
<DailyChallengeCard
  pillarKey={selectedPillar.key as PremiumPillarKey}
  isCompleted={challengeCompleted}
  onComplete={handleChallengeComplete}
/>
```

### Step 6: Add Daily Reset Check (Optional)

Add this to your app's foreground handler:

```typescript
import { checkDailyResetForAllPillars } from '../services/pillarChallengeService';

useEffect(() => {
  const subscription = AppState.addEventListener('change', async (nextState) => {
    if (nextState === 'active') {
      // Reset challenges if date has changed
      await checkDailyResetForAllPillars();
      
      // Reload current pillar if detail view is open
      if (selectedPillar) {
        await loadPillarData(selectedPillar);
      }
    }
  });
  
  return () => subscription.remove();
}, [selectedPillar]);
```

## API Reference

### `completeDailyChallenge(pillarKey: PremiumPillarKey): Promise<void>`

Completes the daily challenge for a pillar and awards 30 XP.

**Throws:**
- `Error('Challenge already completed today')` if challenge was already completed today

**Example:**
```typescript
await completeDailyChallenge('mental-health');
```

### `isChallengeCompletedToday(pillarKey: PremiumPillarKey): Promise<boolean>`

Checks if the challenge has been completed today. Automatically resets if date has changed.

**Returns:** `true` if completed today, `false` otherwise

**Example:**
```typescript
const isCompleted = await isChallengeCompletedToday('fitness');
```

### `awardXP(pillarKey: PremiumPillarKey, amount: number): Promise<void>`

Awards XP to a pillar and syncs with global XP. Used internally by `completeDailyChallenge`.

**Parameters:**
- `pillarKey`: Pillar identifier
- `amount`: XP amount (must be > 0)

**Example:**
```typescript
await awardXP('career', 30);
```

### `checkDailyResetForAllPillars(): Promise<void>`

Checks all pillars and resets challenges if date has changed. Call this when app comes to foreground.

**Example:**
```typescript
await checkDailyResetForAllPillars();
```

## Data Flow

```
User taps "Start Challenge" button
  ↓
handleChallengeComplete() called
  ↓
completeDailyChallenge(pillarKey)
  ↓
1. Load pillar progress from localStorage
2. Check if already completed (throw error if yes)
3. Mark challenge as completed
4. Save progress to localStorage
5. Award 30 XP via awardXP()
  ↓
awardXP(pillarKey, 30)
  ↓
1. Load pillar progress
2. Add 30 XP to pillar
3. Recalculate level (level = floor(xp / 500) + 1)
4. Save pillar progress
5. Update global XP
6. Save global XP
  ↓
UI updates to show "✓ Completed" state
```

## Storage Keys

The following localStorage keys are used:

- `growthovo_pillar_progress_{pillarKey}` - Pillar progress including challenge status
- `growthovo_xp` - Global XP total

## Testing

Run the unit tests:

```bash
npm test -- pillarChallengeService.test.ts
```

All 14 tests should pass:
- ✓ Award XP and update pillar progress
- ✓ Recalculate level when XP crosses threshold
- ✓ Throw error for invalid XP amounts
- ✓ Mark challenge as completed and award 30 XP
- ✓ Throw error if challenge already completed today
- ✓ Reset challenge if date has changed
- ✓ Check completion status correctly
- ✓ Handle daily reset for all pillars
- ✓ Handle edge cases (multiple awards, level boundaries)

## Requirements Validated

This implementation validates the following requirements from the spec:

- **Requirement 5.6**: Challenge completion marks itself as completed
- **Requirement 5.8**: Challenge awards 30 XP when completed
- **Daily Reset**: Challenge resets when date changes

## Next Steps

After integrating this into PillarsScreen:

1. Test the complete flow manually
2. Verify XP updates correctly
3. Verify level calculation works
4. Test daily reset by changing device date
5. Test error handling (try completing twice)

## Troubleshooting

### Challenge doesn't reset at midnight
- Ensure `checkDailyResetForAllPillars()` is called when app comes to foreground
- Check that `getCurrentDate()` returns correct YYYY-MM-DD format

### XP not updating
- Verify `loadPillarProgress()` is called after challenge completion
- Check AsyncStorage permissions
- Look for errors in console

### "Already completed" error when it shouldn't be
- Check that `challengeCompletionDate` matches current date
- Verify `getCurrentDate()` is working correctly
- Clear AsyncStorage and try again

## Example Usage

See `src/examples/DailyChallengeIntegration.example.tsx` for a complete working example.
