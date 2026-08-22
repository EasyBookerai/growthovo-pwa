# 🦅 Mascot System - Quick Reference Card

One-page reference for the Growthovo mascot evolution system.

---

## 🚀 Launch Checklist (15 min total)

```bash
# 1. Database (5 min)
# → Open Supabase SQL Editor
# → Run: ascevo/supabase/migrations/003_mascot_evolution_system.sql

# 2. Real-time (1 min)
# → Supabase → Database → Replication
# → Enable: user_mascot_progress, mascot_evolution_history

# 3. Test (5 min)
npm start

# 4. Add XP to test evolution (in Supabase SQL):
INSERT INTO xp_transactions (user_id, amount, source)
VALUES ('your-user-id', 500, 'test');

# 5. Watch evolution modal appear! 🎉
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `ascevo/supabase/migrations/003_mascot_evolution_system.sql` | Database |
| `ascevo/src/types/mascot.ts` | TypeScript types |
| `ascevo/src/services/mascotService.ts` | API calls |
| `ascevo/src/components/MascotDisplay.tsx` | Display component |
| `ascevo/src/components/MascotEvolutionModal.tsx` | Evolution modal |
| `ascevo/src/hooks/useMascot.ts` | React hook |
| `ascevo/src/screens/MascotScreen.tsx` | Full screen |
| `ascevo/src/utils/mascotHelpers.ts` | Utilities |
| `ascevo/src/__tests__/mascotSystem.test.ts` | Tests |
| `ascevo/assets/images/mascot_stage_1.png` | Egg image |
| `ascevo/assets/images/mascot_stage_2.png` | Hatchling image |
| `ascevo/assets/images/mascot_stage_3.png` | Juvenile image |
| `ascevo/assets/images/mascot_stage_4.png` | Master image |

---

## 🦅 The 4 Stages

| # | Name | Unlock | Visual |
|---|------|--------|--------|
| 1 | Egg | Level 1 (0 XP) | 🥚 Simple egg |
| 2 | Hatchling | Level 10 (500 XP) | 🐣 Fluffy griffin |
| 3 | Juvenile | Level 25 (1,250 XP) | 🦅 Griffin + goggles |
| 4 | Master | Level 50 (2,500 XP) | 👑 Griffin + crown + glow |

**Formula**: `Level = floor(sqrt(Total_XP / 50))`

---

## 💻 How to Use

### Basic Usage (Show Mascot)

```typescript
import { MascotDisplay } from './src/components/MascotDisplay';
import { useMascot } from './src/hooks/useMascot';

const { status } = useMascot(userId);

<MascotDisplay stage={status?.stageId || 1} size={120} />
```

### Full Integration (with Evolution Modal)

```typescript
import { MascotDisplay } from './src/components/MascotDisplay';
import { MascotEvolutionModal } from './src/components/MascotEvolutionModal';
import { useMascot } from './src/hooks/useMascot';

const {
  status,
  showEvolutionModal,
  lastEvolution,
  dismissEvolutionModal
} = useMascot(userId);

return (
  <>
    {status && (
      <MascotDisplay 
        stage={status.stageId} 
        size={120}
        showGlow={status.stageId === 4}
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
  </>
);
```

### Navigate to Mascot Screen

```typescript
navigation.navigate('Mascot');
```

---

## 📊 Database Queries

### Check User's Mascot

```sql
SELECT * FROM user_mascot_progress 
WHERE user_id = 'your-user-id';
```

### Add XP (Test Evolution)

```sql
INSERT INTO xp_transactions (user_id, amount, source)
VALUES ('your-user-id', 500, 'test');
```

### View Evolution History

```sql
SELECT * FROM mascot_evolution_history 
WHERE user_id = 'your-user-id' 
ORDER BY evolved_at DESC;
```

### Users by Stage

```sql
SELECT 
  ms.name,
  COUNT(*) as users
FROM user_mascot_progress ump
JOIN mascot_stages ms ON ms.id = ump.current_stage
GROUP BY ms.name, ms.id
ORDER BY ms.id;
```

---

## 🎨 Component Props

### MascotDisplay

```typescript
<MascotDisplay
  stage={1-4}           // Required: Current stage
  size={200}            // Optional: Size in pixels (default: 200)
  animated={false}      // Optional: Pop-in animation (default: false)
  showGlow={false}      // Optional: Pulsing glow (default: false)
  style={{}}            // Optional: Custom styles
/>
```

### MascotEvolutionModal

```typescript
<MascotEvolutionModal
  visible={true}        // Required: Show modal
  fromStage={1}         // Required: Previous stage
  toStage={2}           // Required: New stage
  newLevel={10}         // Required: Level reached
  onClose={() => {}}    // Required: Close handler
/>
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Images not loading | `npm start -- --reset-cache` |
| Mascot not evolving | Check trigger exists in Supabase |
| Real-time not working | Enable replication in Supabase |
| TypeScript errors | `npm install` then restart |

---

## 📈 Evolution Milestones

```
Lessons: 50 XP each
Challenges: 30 XP each

To reach Hatchling (500 XP):
  → 10 lessons  OR
  → 17 challenges  OR
  → Mix of both

To reach Juvenile (1,250 XP):
  → 25 lessons total  OR
  → 42 challenges total

To reach Master (2,500 XP):
  → 50 lessons total  OR
  → 84 challenges total
```

---

## 🎯 Where to Add

**Recommended locations:**

1. ✅ **Home Screen** - Widget with mascot + level
2. ✅ **Profile** - Header with mascot avatar
3. ✅ **Lesson Complete** - Show mascot celebrating
4. ✅ **Navigation** - Dedicated mascot button
5. ✅ **Daily Check-in** - Mascot greets user

---

## 📞 Help

- **Setup**: `MASCOT_IMPLEMENTATION_COMPLETE.md`
- **Complete Docs**: `MASCOT_EVOLUTION_SYSTEM.md`
- **Examples**: `MASCOT_INTEGRATION_EXAMPLES.md`

---

## ✨ Status

🟢 **READY TO LAUNCH**

All code written and tested.  
Just run the database migration! 🚀

---

*Keep this card for quick reference during development*
