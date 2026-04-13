# Design Document: GROWTHOVO Features V3

## Overview

This document covers the technical design for five new GROWTHOVO features: Onboarding Personality Quiz, Home Screen Widget, Progress Time Capsule, GROWTHOVO Wrapped, and Relapse Protection System. All features are built on the existing React Native / Expo + Supabase stack using TypeScript, react-native-reanimated, and dark-mode-first design.

---

## Architecture

The five features follow the existing layered architecture:

```
UI Layer (screens + components)
    ↓
Service Layer (TypeScript services)
    ↓
Store Layer (Zustand slices)
    ↓
Data Layer (Supabase + AsyncStorage)
```

New services introduced:
- `onboardingQuizService.ts` — quiz scoring and pillar persistence
- `widgetService.ts` — AsyncStorage sync for native widgets
- `capsuleService.ts` — time capsule creation, locking, unlocking
- `wrappedService.ts` — wrapped data computation and caching
- `relapseService.ts` — streak break detection and comeback challenge
- `freezeService.ts` — XP-based streak freeze purchase and consumption

Native widget extensions live outside the Expo JS bundle:
- iOS: `ios/GrowthovoWidget/` (Swift, WidgetKit)
- Android: `android/app/src/main/java/.../widget/` (Kotlin, Glance)

---

## Components and Interfaces

### Feature 1: Onboarding Personality Quiz

#### Screen Flow

```
WelcomeScreen → QuizQuestionScreen (×5) → PillarResultScreen
  → DailyGoalScreen → NotificationPermissionScreen → PaywallScreen
```

#### Key Components

```typescript
// QuizQuestionScreen props
interface QuizQuestionProps {
  questionIndex: number;       // 0–4
  question: QuizQuestion;
  onAnswer: (pillar: PillarKey) => void;
  progress: number;            // 0.0–1.0
}

// PillarResultScreen props
interface PillarResultProps {
  primaryPillar: PillarKey;
  secondaryPillar: PillarKey;
  onContinue: () => void;
}
```

#### Quiz Data Structure

```typescript
type PillarKey = 'mind' | 'discipline' | 'communication' | 'money' | 'relationships';

interface QuizAnswer {
  text: string;
  pillar: PillarKey;
}

interface QuizQuestion {
  emoji: string;
  text: string;
  answers: [QuizAnswer, QuizAnswer, QuizAnswer, QuizAnswer];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    emoji: '🧠',
    text: "What's holding you back the most right now?",
    answers: [
      { text: 'I overthink everything and anxiety controls me', pillar: 'mind' },
      { text: 'I know what to do but never actually do it', pillar: 'discipline' },
      { text: 'I struggle to express myself and connect with people', pillar: 'communication' },
      { text: "I'm broke or terrible with money", pillar: 'money' },
      // Q1 has 5 answers — 5th maps to relationships
    ],
  },
  // ... Q2–Q5
];
```

> Note: Q1 has 5 answer options per the brief. The UI renders all 5 as scrollable cards within the full-screen layout.

#### Scoring Algorithm

```typescript
function scoreQuiz(answers: PillarKey[]): { primary: PillarKey; secondary: PillarKey } {
  const counts = new Map<PillarKey, number>();
  const firstSeen = new Map<PillarKey, number>();

  answers.forEach((pillar, index) => {
    counts.set(pillar, (counts.get(pillar) ?? 0) + 1);
    if (!firstSeen.has(pillar)) firstSeen.set(pillar, index);
  });

  const sorted = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return (firstSeen.get(a[0]) ?? 99) - (firstSeen.get(b[0]) ?? 99); // tie-break by first appearance
  });

  return { primary: sorted[0][0], secondary: sorted[1]?.[0] ?? sorted[0][0] };
}
```

#### Transition Animation

Uses `react-native-reanimated` shared value for horizontal slide:

```typescript
const translateX = useSharedValue(SCREEN_WIDTH);
// On answer: animate translateX to 0 (slide in from right)
// 300ms delay after tap before advancing
```

---

### Feature 2: Home Screen Widget

#### AsyncStorage Schema

```typescript
const WIDGET_STORAGE_KEY = '@growthovo_widget_data';

interface WidgetData {
  streak: number;
  xp: number;
  hearts: number;
  challengeTitle: string;
  leaguePosition: number;
  primaryPillar: PillarKey;
  rexDailyLine: string;
  updatedAt: string; // ISO timestamp
}
```

#### Rex Daily Lines (7 entries, rotate by day-of-year % 7)

```typescript
const REX_DAILY_LINES = [
  "You've gone this far. Don't be stupid now.",
  "Day {X}. Most people are still asleep. Not you.",
  "Your streak is the only thing standing between you and who you were.",
  "Open the app. Do the thing. That's it.",
  "Rex is watching. Not in a weird way.",
  "Consistency is boring. Quitting is worse.",
  "{X} days. Keep going or explain yourself.",
];
```

#### Widget Sizes

| Size | Content |
|------|---------|
| Small (2×2) | Logo, streak + flame, pillar accent background |
| Medium (4×2) | Streak, challenge title (1 line), XP bar, pillar icon |
| Large (4×4) | Streak, XP, hearts, challenge, league position, Rex line |

#### iOS WidgetKit (Swift)

```swift
// GrowthovoWidgetEntry reads from shared App Group UserDefaults
// App Group ID: group.com.growthovo.app
struct GrowthovoEntry: TimelineEntry {
    let date: Date
    let widgetData: WidgetData
}
```

The React Native app writes to the shared App Group via `@react-native-async-storage/async-storage` configured with the App Group suite name.

#### Android Glance (Kotlin)

```kotlin
class GrowthovoWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        // Read widget data written by RN AsyncStorage
    }
}
```

#### Staleness Check

```typescript
function isWidgetDataStale(data: WidgetData): boolean {
  const age = Date.now() - new Date(data.updatedAt).getTime();
  return age > 24 * 60 * 60 * 1000; // 24 hours
}
```

---

### Feature 3: Progress Time Capsule

#### Screen Flow

```
TimeCapsuleIntroScreen → VideoRecordScreen → WrittenPromisesScreen
  → CapsuleCreatedScreen (sealed)
  ...day 90...
CapsuleUnlockScreen → VideoPlaybackScreen → PromisesRevealScreen
  → StatsComparisonScreen → ShareCardScreen
```

#### Data Models

```typescript
interface TimeCapsule {
  id: string;
  userId: string;
  videoUrl: string;           // Supabase Storage path
  promise1: string;
  promise2: string;
  promise3: string;
  primaryPillar: PillarKey;
  quizScores: Record<PillarKey, number>;
  startingXp: number;         // always 0
  createdAt: string;
  unlockedAt?: string;
}

interface CapsuleStatsSnapshot {
  date: string;
  primaryPillar: PillarKey;
  quizScores: Record<PillarKey, number>;
  startingXp: number;
}
```

#### Supabase Table

```sql
CREATE TABLE time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  video_url TEXT NOT NULL,
  promise_1 TEXT NOT NULL,
  promise_2 TEXT NOT NULL,
  promise_3 TEXT NOT NULL,
  primary_pillar TEXT NOT NULL,
  quiz_scores JSONB NOT NULL DEFAULT '{}',
  starting_xp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ
);
```

#### RLS Policy (Lock Mechanism)

```sql
-- Users can INSERT their own capsule
CREATE POLICY "capsule_insert" ON time_capsules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can SELECT only after 90 days
CREATE POLICY "capsule_select_after_90" ON time_capsules
  FOR SELECT USING (
    auth.uid() = user_id
    AND created_at + INTERVAL '90 days' <= NOW()
  );

-- Users can UPDATE only to set unlocked_at (after 90 days)
CREATE POLICY "capsule_update_unlock" ON time_capsules
  FOR UPDATE USING (
    auth.uid() = user_id
    AND created_at + INTERVAL '90 days' <= NOW()
  );
```

#### Rex Reactions (Day 90)

```typescript
function getCapsuleRexReaction(currentStreak: number): string {
  if (currentStreak > 60) return "You did it. I didn't doubt you. Much.";
  if (currentStreak >= 30) return "Not perfect. But you showed up more than most.";
  return "Watch the video. Then decide if day 91 is different.";
}
```

#### Share Card

Generated using `react-native-view-shot` to capture a styled `<View>` as a PNG:
- Dark background, GROWTHOVO logo
- "90 Day Transformation" title
- Spider chart (day 1 empty vs day 90 filled) using `react-native-svg`
- Streak count, XP earned, challenges completed
- One promise from day 1
- @growthovo handle

---

### Feature 4: GROWTHOVO Wrapped

#### Screen Flow

```
WrappedEntryScreen (notification tap) →
  [1] GrowthOverviewScreen →
  [2] StreakCalendarScreen →
  [3] StrongestPillarScreen →
  [4] WeakestPillarScreen →
  [5] GlobalRankScreen →
  [6] RexVerdictScreen →
  [7] ShareCardScreen
```

#### Data Models

```typescript
type WrappedPeriod = `${number}-${number}` | `${number}`; // "2025-01" or "2025"

interface WrappedData {
  totalLessons: number;
  totalChallenges: number;
  longestStreak: number;
  totalXp: number;
  mostActiveDayOfWeek: string;
  mostActiveTimeOfDay: string;
  strongestPillar: PillarKey;
  weakestPillar: PillarKey;
  totalMinutesInApp: number;
  leaguePromotions: number;
  friendsInvited: number;
  globalPercentileRank: number; // 0–100, lower = better
}

interface WrappedSummary {
  id: string;
  userId: string;
  period: WrappedPeriod;
  dataJson: WrappedData;
  rexVerdict: string;
  createdAt: string;
}
```

#### Supabase Table

```sql
CREATE TABLE wrapped_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period TEXT NOT NULL,           -- "2025-01" or "2025"
  data_json JSONB NOT NULL,
  rex_verdict TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);
```

#### RLS

```sql
CREATE POLICY "wrapped_own" ON wrapped_summaries
  FOR ALL USING (auth.uid() = user_id);
```

#### Computation Strategy

Wrapped data is computed server-side via a Supabase Edge Function `generate-wrapped` to avoid heavy client-side queries. The function:
1. Aggregates `user_progress`, `challenge_completions`, `streaks`, `xp_transactions` for the period.
2. Calls GPT-4o via the existing `rex-response` function for the Rex verdict.
3. Upserts into `wrapped_summaries` (idempotent — skips if row exists).

#### Fallback Rex Verdicts (5 pre-written)

```typescript
const FALLBACK_VERDICTS = [
  "You showed up. That's more than most people manage. Keep going.",
  "The data doesn't lie. You put in work. Now put in more.",
  "Progress isn't always visible. But it's there. Trust the process.",
  "Some months are building blocks. This was one of them.",
  "You're still here. That's the whole point.",
];
```

#### Share Card (1080×1920)

Rendered via `react-native-view-shot` off-screen, then saved to camera roll via `expo-media-library`:
- GROWTHOVO logo + period label
- Total lessons, longest streak, strongest pillar, global rank
- Pre-written caption for native share sheet

---

### Feature 5: Relapse Protection System

#### Screen Flow

```
App open → RelapseDetectionGate →
  [if streak break + no freeze] →
    StreakBrokeScreen →
    ComebackChallengeScreen →
      [accept] → ChallengeProofScreen → ComebackSuccessScreen
      [decline] → StartFreshScreen
  [if freeze auto-activated] → normal app flow + push notification
```

#### Data Models

```typescript
interface ComebackChallenge {
  id: string;
  userId: string;
  challengeId: string;
  expiresAt: string;       // 24 hours from creation
  completed: boolean;
  proofUrl?: string;
  streakRestoredTo?: number;
  createdAt: string;
}
```

#### Supabase Tables

```sql
-- Extend existing streaks table
ALTER TABLE streaks
  ADD COLUMN IF NOT EXISTS comeback_used_at TIMESTAMPTZ;

-- Comeback challenges
CREATE TABLE comeback_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id),
  expires_at TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  proof_url TEXT,
  streak_restored_to INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### RLS

```sql
CREATE POLICY "comeback_own" ON comeback_challenges
  FOR ALL USING (auth.uid() = user_id);
```

#### Streak Restoration Logic

```typescript
function calculateRestoredStreak(originalStreak: number): number {
  return Math.floor(originalStreak / 2);
}
```

#### Comeback Eligibility Check

```typescript
function canUseComebackChallenge(comebackUsedAt: string | null): boolean {
  if (!comebackUsedAt) return true;
  const daysSince = (Date.now() - new Date(comebackUsedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 30;
}
```

#### Rex Lines by Streak Length

```typescript
function getStreakBrokeRexLine(streak: number): string {
  if (streak <= 7) return `It was only ${streak} days. Start again. Now.`;
  if (streak <= 30) return `You had ${streak} days. That's not nothing. But it's gone. What are you going to do about it?`;
  return `You had ${streak} days. That took real work. Losing it in one night is also real. Sit with that.`;
}
```

#### Freeze Purchase Flow

```typescript
const FREEZE_COST_XP = 500;
const MAX_FREEZES = 3;

async function purchaseStreakFreeze(userId: string, currentXp: number, currentFreezes: number): Promise<void> {
  if (currentXp < FREEZE_COST_XP) throw new Error('Insufficient XP');
  if (currentFreezes >= MAX_FREEZES) throw new Error('Maximum freezes held');
  // Deduct XP, increment freeze_count
}
```

> Note: The existing `streakService.ts` has `MAX_FREEZES = 5`. The new spec reduces this to 3 per the feature brief. The `freezeService` will enforce the new cap of 3.

---

## Data Models

### New Supabase Tables Summary

| Table | Purpose |
|-------|---------|
| `time_capsules` | Day-1 video URL, promises, stats snapshot |
| `comeback_challenges` | Active comeback challenge per user |
| `wrapped_summaries` | Cached monthly/yearly wrapped data |

### Extended Tables

| Table | New Columns |
|-------|------------|
| `users` | `primary_pillar TEXT`, `secondary_pillar TEXT` |
| `streaks` | `comeback_used_at TIMESTAMPTZ` |

### AsyncStorage Keys

| Key | Purpose |
|-----|---------|
| `@growthovo_widget_data` | Widget data blob (JSON) |
| `@growthovo_relapse_shown_{date}` | Prevents duplicate relapse flow per day |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

Property 1: Quiz scoring primary pillar is the most frequent answer
*For any* sequence of 5 quiz answers, the primary pillar returned by `scoreQuiz` must be the pillar that appears most frequently in the answer sequence (with tie-breaking by first appearance).
**Validates: Requirements 1.6, 1.7**

---

Property 2: Quiz scoring tie-break by first appearance
*For any* sequence of 5 quiz answers where two pillars are tied for highest count, the primary pillar must be the one that appeared first in the answer sequence.
**Validates: Requirements 1.7**

---

Property 3: Widget data staleness detection
*For any* WidgetData object, `isWidgetDataStale` must return true if and only if the `updatedAt` timestamp is more than 24 hours in the past.
**Validates: Requirements 2.11**

---

Property 4: Rex daily line rotation is deterministic and covers all 7 lines
*For any* day-of-year value, the selected Rex line index equals `dayOfYear % 7`, and every index 0–6 is reachable by some day-of-year value.
**Validates: Requirements 2.8**

---

Property 5: Streak restoration is always 50% rounded down
*For any* original streak value greater than 0, `calculateRestoredStreak` must return `Math.floor(originalStreak / 2)`.
**Validates: Requirements 5.6**

---

Property 6: Comeback challenge cooldown enforcement
*For any* `comebackUsedAt` timestamp, `canUseComebackChallenge` must return false if fewer than 30 days have elapsed, and true if 30 or more days have elapsed.
**Validates: Requirements 5.8**

---

Property 7: Freeze purchase XP deduction round-trip
*For any* user with sufficient XP and fewer than 3 freezes, purchasing a freeze must result in XP decreasing by exactly 500 and freeze count increasing by exactly 1.
**Validates: Requirements 5.11**

---

Property 8: Freeze cap enforcement
*For any* user already holding 3 freezes, attempting to purchase another must leave both XP and freeze count unchanged.
**Validates: Requirements 5.12, 5.16**

---

Property 9: Wrapped summary idempotency
*For any* user and period, calling the wrapped generation function twice must produce identical `data_json` and `rex_verdict` values (the second call returns the cached record).
**Validates: Requirements 4.8**

---

Property 10: Capsule RLS unlock timing
*For any* time capsule row, a SELECT by the owning user must succeed if and only if `created_at + 90 days <= NOW()`.
**Validates: Requirements 3.10**

---

## Error Handling

| Scenario | Handling |
|----------|---------|
| Supabase write fails during quiz completion | Show error, allow retry without losing answers (answers held in component state) |
| Video upload fails during capsule creation | Show retry button; written promises already saved separately |
| GPT-4o API unavailable for Wrapped verdict | Use pre-written fallback verdict from `FALLBACK_VERDICTS` array |
| Widget AsyncStorage read fails | Widget shows fallback "Open app to sync" state |
| Comeback challenge proof upload fails | Show retry; timer continues running |
| Freeze purchase with insufficient XP | Show error toast; no XP deducted |
| Wrapped Edge Function timeout | Return cached record if exists; otherwise show loading retry |

All screens implement:
- Loading state with `ActivityIndicator` or skeleton shimmer
- Error state with descriptive message and retry action
- Offline detection via `@react-native-community/netinfo`

---

## Testing Strategy

### Unit Tests

Unit tests cover specific examples, edge cases, and pure functions:
- `scoreQuiz` with all-same-pillar inputs, tie scenarios, and single-answer sequences
- `calculateRestoredStreak` with 0, 1, odd, and even values
- `canUseComebackChallenge` with null, exactly 30 days, and 29 days
- `isWidgetDataStale` with fresh, exactly 24h, and stale timestamps
- `getCapsuleRexReaction` with streak values 0, 29, 30, 60, 61
- `getStreakBrokeRexLine` with streak values 1, 7, 8, 30, 31

### Property-Based Tests

Property-based testing uses **fast-check** (already compatible with Jest/Vitest in the existing test setup).

Each property test runs a minimum of **100 iterations**.

Tag format: `Feature: growthovo-features-v3, Property {N}: {property_text}`

| Property | Test Description |
|----------|-----------------|
| P1 | Generate random 5-answer sequences; assert primary = most frequent (tie-break by first seen) |
| P2 | Generate tied sequences; assert primary = first-seen pillar |
| P3 | Generate timestamps; assert staleness matches 24h threshold |
| P4 | Generate day-of-year integers 0–364; assert index = value % 7, all 7 indices reachable |
| P5 | Generate positive integers; assert restored = floor(n/2) |
| P6 | Generate timestamps; assert cooldown logic matches 30-day threshold |
| P7 | Generate valid XP/freeze states; assert post-purchase state invariants |
| P8 | Generate states with freeze=3; assert no-op on purchase attempt |
| P9 | Generate wrapped inputs; assert second call returns identical output |
| P10 | Generate capsule created_at timestamps; assert RLS unlock condition |

### Integration Tests

- Onboarding quiz end-to-end: complete all 5 questions, verify Supabase `users` row updated with correct pillars
- Relapse flow: simulate missed day, accept comeback challenge, verify streak restored to 50%
- Wrapped generation: call Edge Function twice for same period, verify idempotency
- Time capsule: create capsule, verify SELECT blocked before day 90, verify SELECT succeeds after
