# 🦅 Growthovo Mascot Evolution System

Complete technical documentation for the dynamic mascot progression system in Growthovo.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Evolution Logic](#evolution-logic)
7. [Integration Guide](#integration-guide)
8. [Animation System](#animation-system)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The mascot evolution system gamifies user progression by evolving a griffin character through 4 distinct stages based on XP and level milestones.

### Mascot Stages

| Stage | Name | Requirements | Visual Description |
|-------|------|--------------|-------------------|
| 1 | **Egg** | Level 1+ (0 XP) | Cream-colored egg on gold base |
| 2 | **Hatchling** | Level 10+ (500 XP) | Small fluffy griffin with red XP badge |
| 3 | **Juvenile** | Level 25+ (1250 XP) | Larger griffin with aviator goggles & harness |
| 4 | **Master** | Level 50+ (2500 XP) | Powerful griffin with wings, crown, armor & glow |

### Key Features

- ✅ **Automatic Evolution**: Triggers when user reaches milestones
- ✅ **Real-time Updates**: Uses Supabase real-time subscriptions
- ✅ **Smooth Animations**: Celebration effects with particles & haptics
- ✅ **Progress Tracking**: Visual progress bars for levels & stages
- ✅ **Evolution History**: Complete timeline of user's mascot journey
- ✅ **Single Asset**: Uses cropping technique on `image_16.png` chart

---

## 🏗️ Architecture

### System Flow

```
User Action (Complete Lesson)
    ↓
XP Transaction Created
    ↓
Database Trigger Fires
    ↓
Mascot Progression Updated
    ↓
Real-time Event Sent
    ↓
Frontend Receives Event
    ↓
Evolution Modal Displays (if evolved)
    ↓
Mascot Display Updates
```

### Tech Stack

- **Backend**: Supabase (PostgreSQL + Real-time)
- **Frontend**: React Native + Expo
- **State Management**: Zustand (optional) + React Hooks
- **Animations**: React Native Animated API
- **Haptics**: Expo Haptics

---

## 💾 Database Schema

### Tables Created

#### `mascot_stages`
Reference table for the 4 evolution stages.

```sql
CREATE TABLE mascot_stages (
  id INT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  min_level INT NOT NULL,
  min_xp INT NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `user_mascot_progress`
Tracks each user's current mascot state.

```sql
CREATE TABLE user_mascot_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_stage INT NOT NULL DEFAULT 1 REFERENCES mascot_stages(id),
  total_xp INT NOT NULL DEFAULT 0,
  current_level INT NOT NULL DEFAULT 1,
  last_evolution_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `mascot_evolution_history`
Records all evolution events for analytics.

```sql
CREATE TABLE mascot_evolution_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  from_stage INT REFERENCES mascot_stages(id),
  to_stage INT NOT NULL REFERENCES mascot_stages(id),
  xp_at_evolution INT NOT NULL,
  level_at_evolution INT NOT NULL,
  evolved_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Functions

#### `calculate_level_from_xp(xp INT)`
Calculates user level based on total XP using formula: `Level = floor(sqrt(XP / 50))`

#### `determine_mascot_stage(xp INT, level INT)`
Returns appropriate stage ID based on XP/level thresholds.

#### `update_mascot_progression(p_user_id UUID, p_xp_gained INT)`
Core function that updates mascot when XP is gained. Returns evolution data.

#### `get_user_mascot_status(p_user_id UUID)`
Returns complete mascot status including progress to next stage.

### Automatic Triggers

1. **Initialize Mascot**: Creates mascot record when user signs up
2. **Update on XP Gain**: Automatically updates mascot when XP transaction is created

---

## 🔌 API Endpoints

All endpoints use Supabase RPC (Remote Procedure Call) functions.

### Get Mascot Status

```typescript
const { data, error } = await supabase.rpc('get_user_mascot_status', {
  p_user_id: userId
});
```

**Returns:**
```typescript
{
  stage_id: number;
  stage_name: string;
  stage_description: string;
  current_level: number;
  total_xp: number;
  xp_for_next_level: number;
  xp_for_next_stage: number;
  next_stage_level: number;
  last_evolution_at: string | null;
}
```

### Manual Update (Optional)

```typescript
const { data, error } = await supabase.rpc('update_mascot_progression', {
  p_user_id: userId,
  p_xp_gained: 50
});
```

**Returns:**
```typescript
{
  new_stage: number;
  new_level: number;
  new_xp: number;
  evolved: boolean;
  previous_stage: number;
}
```

### Real-time Subscriptions

#### Subscribe to Evolution Events

```typescript
const subscription = supabase
  .channel(`mascot_evolution:${userId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'mascot_evolution_history',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Handle evolution event
      console.log('Mascot evolved!', payload);
    }
  )
  .subscribe();
```

---

## 🎨 Frontend Components

### 1. `MascotDisplay`

Renders the mascot at a specific stage using cropping technique.

```typescript
import { MascotDisplay } from '../components/MascotDisplay';

<MascotDisplay
  stage={MascotStage.HATCHLING}
  size={200}
  animated={true}
  showGlow={false}
/>
```

**Props:**
- `stage` (required): Current mascot stage (1-4)
- `size`: Display size in pixels (default: 200)
- `animated`: Enable pop-in animation (default: false)
- `showGlow`: Show pulsing glow effect (default: false)
- `style`: Custom styles

### 2. `MascotEvolutionModal`

Full-screen celebration modal for evolution events.

```typescript
import { MascotEvolutionModal } from '../components/MascotEvolutionModal';

<MascotEvolutionModal
  visible={showModal}
  fromStage={MascotStage.EGG}
  toStage={MascotStage.HATCHLING}
  newLevel={10}
  onClose={() => setShowModal(false)}
/>
```

**Features:**
- ✨ Particle effects
- 📳 Haptic feedback
- 🎬 Smooth stage transition
- ⏱️ Auto-dismisses after 4 seconds

### 3. `useMascot` Hook

Custom React hook for mascot state management.

```typescript
import { useMascot } from '../hooks/useMascot';

const {
  status,           // Current mascot status
  loading,          // Loading state
  error,            // Error message
  refresh,          // Manual refresh function
  evolutionHistory, // Past evolutions
  showEvolutionModal, // Modal visibility
  lastEvolution,    // Last evolution data
  dismissEvolutionModal, // Close modal function
} = useMascot(userId);
```

---

## ⚙️ Evolution Logic

### XP to Level Formula

```
Level = floor(sqrt(Total_XP / 50))
```

**Examples:**
- 0 XP → Level 1
- 500 XP → Level 10
- 1250 XP → Level 25
- 2500 XP → Level 50

### Stage Determination

```typescript
if (level >= 50 || xp >= 2500) → Stage 4 (Master)
else if (level >= 25 || xp >= 1250) → Stage 3 (Juvenile)
else if (level >= 10 || xp >= 500) → Stage 2 (Hatchling)
else → Stage 1 (Egg)
```

### Evolution Triggers

Evolution happens automatically when:
1. User completes a lesson (gains 50 XP)
2. User completes a daily challenge (gains 30 XP)
3. Any other XP-earning action

**Flow:**
```sql
INSERT INTO xp_transactions (user_id, amount, source)
  ↓
Trigger: trigger_mascot_xp_update
  ↓
Function: update_mascot_progression()
  ↓
IF stage changed:
  - INSERT INTO mascot_evolution_history
  - UPDATE user_mascot_progress.last_evolution_at
  ↓
Real-time event published
```

---

## 🚀 Integration Guide

### Step 1: Run Database Migration

```bash
# Navigate to your Supabase project
cd ascevo/supabase

# Run the migration in Supabase SQL editor
# Copy contents of migrations/003_mascot_evolution_system.sql
# Execute in your Supabase dashboard
```

### Step 2: Add Mascot Chart Image

1. Save your `image_16.png` to `ascevo/assets/images/`
2. Ensure it shows all 4 stages in horizontal layout
3. Update import path in `MascotDisplay.tsx` if needed

### Step 3: Use in Your App

#### Option A: Add to Existing Screen

```typescript
import { useMascot } from '../hooks/useMascot';
import { MascotDisplay } from '../components/MascotDisplay';
import { MascotEvolutionModal } from '../components/MascotEvolutionModal';

function MyScreen() {
  const { user } = useAuth();
  const {
    status,
    showEvolutionModal,
    lastEvolution,
    dismissEvolutionModal,
  } = useMascot(user?.id);

  return (
    <View>
      {status && (
        <MascotDisplay
          stage={status.stageId}
          size={150}
        />
      )}

      {showEvolutionModal && lastEvolution && (
        <MascotEvolutionModal
          visible={showEvolutionModal}
          fromStage={lastEvolution.fromStage}
          toStage={lastEvolution.toStage}
          newLevel={lastEvolution.levelAtEvolution}
          onClose={dismissEvolutionModal}
        />
      )}
    </View>
  );
}
```

#### Option B: Use Dedicated Mascot Screen

```typescript
import MascotScreen from '../screens/MascotScreen';

// Add to your navigation
<Stack.Screen name="Mascot" component={MascotScreen} />
```

### Step 4: Configure Navigation (Optional)

Add mascot screen to your bottom tabs or drawer:

```typescript
<Tab.Screen
  name="Mascot"
  component={MascotScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="egg" size={size} color={color} />
    ),
  }}
/>
```

---

## 🎬 Animation System

### Stage Transition Animation

```typescript
// Pop-in effect when stage changes
Animated.spring(scaleAnim, {
  toValue: 1,
  friction: 6,
  tension: 40,
  useNativeDriver: true,
}).start();
```

### Glow Effect

```typescript
// Pulsing glow for Master Griffin
Animated.loop(
  Animated.sequence([
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }),
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }),
  ])
).start();
```

### Particle Effects

Golden particles animate upward and fade out during evolution:

```typescript
Animated.parallel([
  Animated.timing(translateY, {
    toValue: -200,
    duration: 2000,
    useNativeDriver: true,
  }),
  Animated.timing(opacity, {
    toValue: 0,
    duration: 2000,
    useNativeDriver: true,
  }),
]).start();
```

### Haptic Feedback

```typescript
// On evolution
Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);

// On stage reveal
Haptics.impactAsync(
  Haptics.ImpactFeedbackStyle.Heavy
);
```

---

## 🧪 Testing

### Unit Tests

Test mascot service functions:

```typescript
import { getUserMascotStatus, calculateStageProgress } from '../services/mascotService';

describe('Mascot Service', () => {
  it('should fetch user mascot status', async () => {
    const status = await getUserMascotStatus('user-id');
    expect(status).toBeDefined();
    expect(status.stageId).toBeGreaterThanOrEqual(1);
    expect(status.stageId).toBeLessThanOrEqual(4);
  });

  it('should calculate stage progress correctly', () => {
    const mockStatus = {
      stageId: 2,
      totalXP: 750,
      xpForNextStage: 500,
      // ... other fields
    };
    const progress = calculateStageProgress(mockStatus);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests

Test evolution flow:

```typescript
describe('Evolution Flow', () => {
  it('should evolve mascot when reaching milestone', async () => {
    const userId = 'test-user';

    // Start at stage 1
    let status = await getUserMascotStatus(userId);
    expect(status.stageId).toBe(1);

    // Add XP to reach level 10
    await supabase.rpc('update_mascot_progression', {
      p_user_id: userId,
      p_xp_gained: 500,
    });

    // Should now be stage 2
    status = await getUserMascotStatus(userId);
    expect(status.stageId).toBe(2);
  });
});
```

### Manual Testing Checklist

- [ ] Mascot displays correctly for each stage (1-4)
- [ ] Evolution modal appears when reaching milestones
- [ ] Haptic feedback works on mobile devices
- [ ] Particle effects render smoothly
- [ ] Progress bars update correctly
- [ ] Real-time updates work across devices
- [ ] Evolution history displays correctly
- [ ] Glow effect animates on Master Griffin

---

## 🐛 Troubleshooting

### Issue: Mascot not appearing

**Solution:**
```typescript
// Check if user_mascot_progress record exists
const { data } = await supabase
  .from('user_mascot_progress')
  .select('*')
  .eq('user_id', userId)
  .single();

// If missing, manually initialize
await supabase
  .from('user_mascot_progress')
  .insert({
    user_id: userId,
    current_stage: 1,
    total_xp: 0,
    current_level: 1,
  });
```

### Issue: Evolution not triggering

**Solution:**
Check if database trigger is active:

```sql
-- Verify trigger exists
SELECT * FROM pg_trigger
WHERE tgname = 'trigger_mascot_xp_update';

-- Re-create trigger if needed
DROP TRIGGER IF EXISTS trigger_mascot_xp_update ON xp_transactions;
CREATE TRIGGER trigger_mascot_xp_update
  AFTER INSERT ON xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_mascot_on_xp();
```

### Issue: Real-time updates not working

**Solution:**
```typescript
// Enable real-time for tables in Supabase Dashboard
// Settings > API > Realtime > Enable for:
// - user_mascot_progress
// - mascot_evolution_history

// Check subscription status
const subscription = supabase.channel('test');
console.log('Subscription status:', subscription.state);
```

### Issue: Image cropping incorrect

**Solution:**
Adjust `STAGE_CROP_POSITIONS` in `types/mascot.ts`:

```typescript
export const STAGE_CROP_POSITIONS: Record<MascotStage, StageCropPosition> = {
  [MascotStage.EGG]: { x: 0, width: 25 },
  [MascotStage.HATCHLING]: { x: 25, width: 25 },
  [MascotStage.JUVENILE]: { x: 50, width: 25 },
  [MascotStage.MASTER]: { x: 75, width: 25 },
};
```

---

## 📊 Analytics & Metrics

Track these metrics for engagement analysis:

- **Evolution Rate**: % of users reaching each stage
- **Time to Evolution**: Average time between stages
- **XP Velocity**: XP earned per day by stage
- **Evolution Dropoff**: Where users stop progressing

Query example:

```sql
-- Evolution completion rates
SELECT
  ms.name AS stage,
  COUNT(DISTINCT ump.user_id) AS users_reached,
  ROUND(
    COUNT(DISTINCT ump.user_id) * 100.0 /
    (SELECT COUNT(*) FROM users),
    2
  ) AS percentage
FROM mascot_stages ms
LEFT JOIN user_mascot_progress ump ON ump.current_stage >= ms.id
GROUP BY ms.id, ms.name
ORDER BY ms.id;
```

---

## 🎁 Future Enhancements

Potential features to add:

1. **Customization**: Allow users to name their mascot
2. **Cosmetics**: Unlock special accessories/colors
3. **Interactions**: Feed, pet, or play mini-games
4. **Social**: Share evolution milestones
5. **Achievements**: Special badges for evolution speed
6. **Multiplayer**: Mascot battles or races
7. **AR Mode**: View mascot in augmented reality

---

## 📚 References

- [Supabase Real-time Docs](https://supabase.com/docs/guides/realtime)
- [React Native Animated API](https://reactnative.dev/docs/animated)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)

---

## 👨‍💻 Support

For questions or issues:
- **Email**: support@growthovo.com
- **GitHub**: [Your Repo Issues]
- **Discord**: [Your Discord Server]

---

**Built with ❤️ for Growthovo**
