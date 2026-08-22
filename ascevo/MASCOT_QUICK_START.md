# 🚀 Mascot Evolution System - Quick Start

Get the mascot system running in 10 minutes!

---

## ✅ Prerequisites

- Supabase project set up
- React Native environment configured
- User authentication working
- XP system already tracking points

---

## 📝 Step-by-Step Setup

### Step 1: Database Setup (5 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `ascevo/supabase/migrations/003_mascot_evolution_system.sql`
4. Paste and click **Run**
5. Verify tables were created:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'mascot%';

-- Should return:
-- mascot_stages
-- user_mascot_progress
-- mascot_evolution_history
```

### Step 2: Enable Real-time (1 minute)

1. In Supabase Dashboard, go to **Database > Replication**
2. Enable replication for these tables:
   - ✅ `user_mascot_progress`
   - ✅ `mascot_evolution_history`

### Step 3: Add Mascot Image (1 minute)

1. Save your `image_16.png` to `ascevo/assets/images/`
2. Ensure the file shows all 4 stages horizontally arranged

### Step 4: Add to Your Dashboard (3 minutes)

Open your main dashboard or home screen and add:

```typescript
import { useMascot } from './src/hooks/useMascot';
import { MascotDisplay } from './src/components/MascotDisplay';
import { MascotEvolutionModal } from './src/components/MascotEvolutionModal';

function DashboardScreen() {
  const { user } = useAuth();
  const {
    status,
    showEvolutionModal,
    lastEvolution,
    dismissEvolutionModal,
  } = useMascot(user?.id);

  return (
    <ScrollView>
      {/* Your existing dashboard content */}

      {/* Add mascot widget */}
      {status && (
        <View style={styles.mascotWidget}>
          <Text style={styles.widgetTitle}>Your Growthovo</Text>
          <MascotDisplay
            stage={status.stageId}
            size={120}
          />
          <Text style={styles.levelText}>
            Level {status.currentLevel}
          </Text>
        </View>
      )}

      {/* Evolution modal */}
      {showEvolutionModal && lastEvolution && (
        <MascotEvolutionModal
          visible={showEvolutionModal}
          fromStage={lastEvolution.fromStage}
          toStage={lastEvolution.toStage}
          newLevel={lastEvolution.levelAtEvolution}
          onClose={dismissEvolutionModal}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mascotWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});
```

---

## 🧪 Testing Your Setup

### Test 1: Check Initial State

```typescript
// Should show Egg (Stage 1) for new users
const status = await getUserMascotStatus(userId);
console.log('Stage:', status.stageId); // Should be 1
console.log('Level:', status.currentLevel); // Should be 1
```

### Test 2: Simulate Evolution

Add XP to trigger evolution:

```sql
-- In Supabase SQL Editor
-- Replace 'your-user-id' with actual user ID

-- Add 500 XP (should evolve to Hatchling)
INSERT INTO xp_transactions (user_id, amount, source)
VALUES ('your-user-id', 500, 'test');

-- Check new stage
SELECT current_stage, current_level, total_xp
FROM user_mascot_progress
WHERE user_id = 'your-user-id';
```

### Test 3: Verify Real-time

1. Open app on device/emulator
2. Run the SQL above to add XP
3. Evolution modal should appear automatically
4. Mascot display should update to new stage

---

## 🎨 Customization Options

### Change Evolution Thresholds

Edit the stage requirements in the migration:

```sql
-- In 003_mascot_evolution_system.sql
INSERT INTO mascot_stages (id, name, description, min_level, min_xp, display_order) VALUES
  (1, 'egg', '...', 0, 0, 1),
  (2, 'hatchling', '...', 5, 250, 2),    -- Changed from 10/500
  (3, 'juvenile', '...', 15, 750, 3),    -- Changed from 25/1250
  (4, 'master', '...', 30, 1500, 4);     -- Changed from 50/2500
```

### Adjust XP-to-Level Formula

Edit `calculate_level_from_xp()` function:

```sql
-- Current: Level = sqrt(XP / 50)
-- Example: Make leveling faster
RETURN GREATEST(1, FLOOR(SQRT(xp * 0.04))); -- Double the speed
```

### Customize Animations

In `MascotEvolutionModal.tsx`:

```typescript
// Change animation durations
const ANIMATION_DURATION = 2000; // Default: 1500
const GLOW_DURATION = 3000;      // Default: 2000
const AUTO_CLOSE_DELAY = 6000;   // Default: 4000
```

---

## 🔗 Navigation Setup

### Add Dedicated Mascot Screen

In your navigation file:

```typescript
import MascotScreen from './src/screens/MascotScreen';

// For Stack Navigator
<Stack.Screen
  name="Mascot"
  component={MascotScreen}
  options={{
    title: 'Your Growthovo',
    headerStyle: { backgroundColor: '#FFD700' },
  }}
/>

// For Tab Navigator
<Tab.Screen
  name="Mascot"
  component={MascotScreen}
  options={{
    tabBarLabel: 'Mascot',
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="egg-outline" size={size} color={color} />
    ),
  }}
/>
```

---

## 🎯 Common Use Cases

### Show Mascot in Profile

```typescript
function ProfileScreen() {
  const { user } = useAuth();
  const { status } = useMascot(user?.id);

  return (
    <View>
      <Text>Profile</Text>
      {status && (
        <View>
          <MascotDisplay stage={status.stageId} size={80} />
          <Text>Level {status.currentLevel}</Text>
        </View>
      )}
    </View>
  );
}
```

### Show Progress in Header

```typescript
function CustomHeader() {
  const { user } = useAuth();
  const { status } = useMascot(user?.id);

  return (
    <View style={styles.header}>
      <Text>Growthovo</Text>
      {status && (
        <View style={styles.headerMascot}>
          <MascotDisplay stage={status.stageId} size={40} />
        </View>
      )}
    </View>
  );
}
```

### Show Mini Mascot in Lesson Completion

```typescript
function LessonCompleteScreen({ xpEarned }) {
  const { user } = useAuth();
  const { status } = useMascot(user?.id);

  return (
    <View>
      <Text>Lesson Complete! +{xpEarned} XP</Text>
      {status && (
        <View>
          <MascotDisplay
            stage={status.stageId}
            size={100}
            animated={true}
            showGlow={xpEarned >= 50}
          />
          <Text>Level {status.currentLevel}</Text>
          <ProgressBar
            current={status.totalXP}
            max={status.totalXP + status.xpForNextLevel}
          />
        </View>
      )}
    </View>
  );
}
```

---

## 🐛 Quick Troubleshooting

### Mascot not showing?

```typescript
// Debug: Check if data exists
const { data, error } = await supabase
  .from('user_mascot_progress')
  .select('*')
  .eq('user_id', userId);

console.log('Mascot data:', data, error);

// If null, trigger initialization
await supabase.rpc('initialize_user_mascot');
```

### Evolution not triggering?

```sql
-- Check if trigger is active
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_mascot_xp_update';

-- If missing, re-run migration
```

### Image not displaying?

```typescript
// Verify image path
const MASCOT_CHART_IMAGE = require('../../assets/images/image_16.png');

// Test image loads
<Image source={MASCOT_CHART_IMAGE} style={{ width: 200, height: 200 }} />
```

---

## 📊 Monitoring & Analytics

### Track Evolution Rates

```sql
-- Users at each stage
SELECT
  ms.name,
  COUNT(*) as user_count
FROM user_mascot_progress ump
JOIN mascot_stages ms ON ms.id = ump.current_stage
GROUP BY ms.name, ms.id
ORDER BY ms.id;
```

### Average Time to Evolution

```sql
-- Time between evolutions
SELECT
  to_stage,
  AVG(EXTRACT(EPOCH FROM (evolved_at - lag(evolved_at) OVER (PARTITION BY user_id ORDER BY evolved_at)))) / 86400 as avg_days
FROM mascot_evolution_history
GROUP BY to_stage;
```

---

## 🎉 You're Done!

Your mascot evolution system is now live! Users will see their mascot evolve as they progress through Growthovo.

### Next Steps:

1. ✅ Test evolution on a test account
2. ✅ Add mascot to key screens (dashboard, profile)
3. ✅ Monitor evolution rates in analytics
4. ✅ Gather user feedback on animations
5. ✅ Consider adding more customization options

---

## 📞 Need Help?

- **Documentation**: See `MASCOT_EVOLUTION_SYSTEM.md` for complete technical details
- **Issues**: Check the Troubleshooting section
- **Support**: support@growthovo.com

**Happy Growing! 🌱🦅**
