# AppContext Synchronization for Premium Pillars Experience

## Overview

This document describes the AppContext synchronization mechanism that ensures XP earned in the Premium Pillars Experience updates the global app state and Home screen stats.

**Requirements**: 17.1, 17.3

## Architecture

### Data Flow

```
Pillar Action (Lesson/Challenge)
    ↓
Local Storage Update (pillarStorageService)
    ↓
Global XP Update (localStorage)
    ↓
AppContext Sync (pillarAppContextSync)
    ↓
Supabase Update (via AppContext)
    ↓
Home Screen Stats Update
```

### Key Components

1. **pillarAppContextSync.ts**: Utility functions for AppContext synchronization
2. **pillarChallengeService.ts**: `awardXP` function with optional AppContext callback
3. **pillarLessonService.ts**: `completeLesson` function with optional AppContext callback
4. **AppContext.tsx**: Global state management with `updateXP` method

## Implementation

### Service Layer

The service functions (`awardXP`, `completeLesson`, `completeDailyChallenge`) accept an optional callback parameter for AppContext synchronization:

```typescript
export async function awardXP(
  pillarKey: PremiumPillarKey,
  amount: number,
  onAppContextSync?: (xpAmount: number) => Promise<void>
): Promise<void> {
  // ... local storage updates ...
  
  // Sync with AppContext if callback provided
  if (onAppContextSync) {
    try {
      await onAppContextSync(amount);
    } catch (error) {
      // Log error but don't throw - local state is already saved
      console.error('[awardXP] Failed to sync with AppContext:', error);
    }
  }
}
```

### Component Integration

Components that use pillar services should:

1. Import `useAppContext` hook
2. Extract the `updateXP` function
3. Pass `updateXP` as the callback parameter

```typescript
import { useAppContext } from '../context/AppContext';
import { completeLesson } from '../services/pillarLessonService';

function MyComponent() {
  const { updateXP } = useAppContext();
  
  const handleLessonComplete = async () => {
    await completeLesson(pillarKey, lessonId, updateXP);
  };
}
```

## Error Handling

### Graceful Degradation

The synchronization mechanism implements graceful degradation:

1. **Local state is always saved first** to localStorage
2. **AppContext sync is attempted** but failures don't block the operation
3. **AppContext has retry logic** that will automatically retry failed syncs
4. **User sees immediate feedback** from optimistic updates

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| AppContext unavailable | Local state saved, no sync attempted |
| Network error | Local state saved, AppContext queues retry |
| Supabase error | Local state saved, AppContext queues retry |
| Invalid XP amount | Error thrown, no state changes |

## Testing

### Unit Tests

```typescript
// Test successful sync
it('should call updateXP with the correct amount', async () => {
  const mockUpdateXP = jest.fn().mockResolvedValue(undefined);
  await syncWithAppContext(50, mockUpdateXP);
  expect(mockUpdateXP).toHaveBeenCalledWith(50);
});

// Test error handling
it('should not throw when updateXP fails', async () => {
  const mockUpdateXP = jest.fn().mockRejectedValue(new Error('Network error'));
  await expect(syncWithAppContext(50, mockUpdateXP)).resolves.toBeUndefined();
});
```

### Integration Tests

Integration tests should verify:
- XP flows from Pillars to AppContext to Home screen
- Sync works across app navigation
- Fallback to localStorage when AppContext unavailable

## Usage Examples

### Example 1: Lesson Completion

```typescript
import { useAppContext } from '../context/AppContext';
import { completeLesson } from '../services/pillarLessonService';

function LessonModal({ pillarKey, lessonId }) {
  const { updateXP } = useAppContext();
  
  const handleComplete = async () => {
    try {
      // Complete lesson with AppContext sync
      await completeLesson(pillarKey, lessonId, updateXP);
      
      // Show success message
      showToast('Lesson complete! +50 XP');
    } catch (error) {
      showToast('Failed to complete lesson');
    }
  };
  
  return (
    <TouchableOpacity onPress={handleComplete}>
      <Text>Mark as Complete → +50 XP</Text>
    </TouchableOpacity>
  );
}
```

### Example 2: Daily Challenge Completion

```typescript
import { useAppContext } from '../context/AppContext';
import { completeDailyChallenge } from '../services/pillarChallengeService';

function DailyChallengeCard({ pillarKey }) {
  const { updateXP } = useAppContext();
  
  const handleStart = async () => {
    try {
      // Complete challenge with AppContext sync
      await completeDailyChallenge(pillarKey, updateXP);
      
      // Show success message
      showToast('Challenge complete! +30 XP');
    } catch (error) {
      showToast('Failed to complete challenge');
    }
  };
  
  return (
    <TouchableOpacity onPress={handleStart}>
      <Text>Start Challenge →</Text>
    </TouchableOpacity>
  );
}
```

### Example 3: Without AppContext (Fallback)

If a component doesn't have access to AppContext, the service functions still work:

```typescript
import { completeLesson } from '../services/pillarLessonService';

function StandaloneComponent() {
  const handleComplete = async () => {
    // Complete lesson without AppContext sync
    // Local state is still saved to localStorage
    await completeLesson(pillarKey, lessonId);
    
    // XP is saved locally but won't sync to AppContext
    // This is acceptable for offline scenarios
  };
}
```

## Best Practices

### DO

✅ Always pass `updateXP` when available  
✅ Handle errors gracefully  
✅ Show immediate UI feedback (optimistic updates)  
✅ Trust local state as source of truth  
✅ Let AppContext handle retry logic  

### DON'T

❌ Don't throw errors if AppContext sync fails  
❌ Don't wait for AppContext sync before updating UI  
❌ Don't manually retry AppContext syncs  
❌ Don't assume AppContext is always available  
❌ Don't block user actions on sync failures  

## Troubleshooting

### XP not updating on Home screen

**Possible causes:**
1. AppContext not initialized
2. Network connectivity issues
3. Supabase authentication expired

**Solutions:**
1. Check AppContext is wrapped around the component tree
2. Check network connection
3. Verify user is authenticated
4. Check browser console for errors

### XP saved locally but not in Supabase

**Possible causes:**
1. Network error during sync
2. Supabase rate limiting
3. Invalid user ID

**Solutions:**
1. Wait for automatic retry (5 seconds)
2. Check AppContext retry queue
3. Manually call `refreshUserData()` from AppContext

### Duplicate XP awards

**Possible causes:**
1. Calling `completeLesson` multiple times
2. Not checking completion status

**Solutions:**
1. Use idempotent operations (built-in)
2. Check `isLessonCompleted()` before completing
3. Disable buttons during async operations

## Performance Considerations

### Optimizations

1. **Optimistic Updates**: UI updates immediately, sync happens in background
2. **Debounced Writes**: Multiple XP updates batched into single write
3. **Retry Queue**: Failed syncs queued and retried automatically
4. **Local Cache**: AppContext caches XP value to reduce Supabase queries

### Metrics

- Local storage write: < 50ms
- AppContext sync: < 500ms
- Supabase update: < 1000ms
- Total operation: < 1500ms (perceived as instant due to optimistic updates)

## Future Enhancements

### Planned Features

1. **Offline Queue**: Queue XP updates when offline, sync when online
2. **Conflict Resolution**: Handle concurrent XP updates from multiple devices
3. **Analytics**: Track XP sources and user engagement
4. **Leaderboards**: Real-time XP rankings with AppContext integration

### Migration Path

If AppContext structure changes:

1. Update `pillarAppContextSync.ts` callback signature
2. Update service function signatures
3. Update component integrations
4. Run integration tests
5. Deploy with backward compatibility

## References

- **Design Document**: `.kiro/specs/premium-pillars-experience/design.md`
- **Requirements**: `.kiro/specs/premium-pillars-experience/requirements.md` (17.1, 17.3)
- **AppContext**: `ascevo/src/context/AppContext.tsx`
- **Example**: `ascevo/src/examples/AppContextSyncIntegration.example.tsx`
