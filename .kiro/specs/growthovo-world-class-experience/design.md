# Design Document: Growthovo World-Class Experience

## Overview

This design transforms Growthovo into a world-class, habit-forming, revenue-generating product through 13 major UI/UX enhancements. The implementation leverages the existing React Native + Expo architecture with TypeScript, building upon established service layers (growthovoExperienceService, streakService, briefingService, debriefService) to deliver production-ready features.

**Core Philosophy**: Every interaction must feel premium. Every state must be handled gracefully. No placeholders, no TODOs—only complete, polished features that users will pay €9.99/month for.

**Technology Stack**:
- React Native 0.74.2 with Expo ~51.0.0
- TypeScript ~5.3.3 with strict mode
- AsyncStorage for local persistence with in-memory fallback
- Supabase for backend (auth, database, edge functions)
- React Navigation v6 for routing
- Zustand for global state management
- react-native-reanimated for animations
- expo-haptics for tactile feedback
- expo-notifications for push notifications
- fast-check for property-based testing

**Architecture Principles**:
1. **Service-First Design**: All business logic in services, screens orchestrate UI
2. **Graceful Degradation**: Local-first with AsyncStorage, Supabase for sync
3. **Accessibility**: All interactions keyboard-navigable, screen reader compatible
4. **Performance**: Lazy loading, memoization, native driver animations
5. **Testing**: Property-based tests for universal properties, unit tests for edge cases

## Architecture

### Component Hierarchy

```
AppNavigator (React Navigation)
├── OnboardingScreen (5-part swipeable flow)
├── HomeScreen
│   ├── QuickActionsCard
│   │   ├── MorningBriefingButton
│   │   └── EveningDebriefButton
│   ├── WeeklyWrappedCard (Monday only)
│   └── PullToRefresh
├── MorningBriefingScreen (5-part flow)
├── EveningDebriefScreen (4-part flow)
├── TimeCapsuleScreen
│   ├── CapsuleList
│   └── CreateCapsuleFlow (4 steps)
├── WeeklyWrappedScreen (6 slides)
├── SquadScreen
│   ├── SquadMemberList
│   ├── ActivityFeed
│   └── InviteModal
├── ProfileScreen
│   └── TimeCapsuleLink
├── LeagueScreen
│   └── SquadLink
├── SettingsScreen
│   ├── EditProfileSection
│   ├── NotificationsSection
│   ├── LanguageSection
│   ├── AppearanceSection
│   ├── MyProgressModal
│   ├── DataExportSection
│   └── AccountDeletionSection
└── PaywallModal (bottom sheet)
```

### Service Layer Architecture

```
growthovoExperienceService.ts
├── Onboarding persistence
├── Time-based access control (isBeforeNoon, isAfter6PM, isMonday)
├── Motivational quote rotation
├── Time capsule CRUD
├── Weekly data aggregation
└── Premium status checks

streakService.ts
├── Streak calculation with freeze mechanics
├── Milestone detection (3, 7, 14, 30 days)
├── Freeze award on 7-day intervals
└── Celebration event storage

briefingService.ts
├── Morning state selection and Rex reactions
├── Fallback truth and focus rotation
└── XP award on briefing dismissal

debriefService.ts
├── Evening debrief validation and submission
├── Q2 obstacle insight generation
├── Tomorrow focus preview (weakest pillar)
└── Memory extraction trigger

notificationService.ts
├── Permission prompts
├── Scheduled notifications (8am, 8pm, 11pm)
├── Preference management
└── Service Worker scheduling

themeService.ts
├── Light/dark/system mode toggle
├── Color palette management
└── Persistence to AsyncStorage

animationService.ts
├── Confetti system (CSS-based)
├── XP gain animations
├── Level-up modal
└── Haptic feedback patterns

ToastContext.tsx
├── Toast display queue
├── Auto-dismiss (3 seconds)
└── 4 types: success, info, warning, error
```

### Data Flow

**Onboarding Flow**:
1. User completes 5 screens → selections stored in local state
2. Screen 5 submission → `saveNewOnboardingToSupabase()` + local AsyncStorage
3. Navigate to Home → AppContext syncs from AsyncStorage
4. Notification permission prompt → `scheduleNotifications()`

**Daily Ritual Flow (Morning Briefing)**:
1. User taps "☀️ Morning Briefing" → check `isBeforeNoon()`
2. Display 5-part flow → each part managed by local state
3. Part 5 completion → `markMorningBriefingDone()` + `awardXP(20)`
4. Trigger daily check-in → `recordDailyCheckIn()` → streak update

**Daily Ritual Flow (Evening Debrief)**:
1. User taps "🌙 Evening Debrief" → check `isAfter6PM()`
2. Display 4-part flow → validation on Q2 (5-word minimum)
3. Part 4 completion → `submitDebrief()` → Edge Function
4. Edge Function → stores debrief, awards 30 XP, extracts memories
5. Display tomorrow's reminder → saved to AsyncStorage

**Streak System Flow**:
1. Daily check-in → `recordDailyCheckIn(userId)`
2. Calculate days since last check-in
3. If missed > 1 day AND freezes > 0 → consume freeze, preserve streak
4. Otherwise → `incrementStreak()` → Supabase RPC
5. Check milestone → trigger celebration modal + confetti
6. If streak % 7 === 0 → award freeze (max 2)

**Paywall Flow**:
1. User hits free tier limit → trigger `PaywallModal`
2. Display pricing with monthly/yearly toggle
3. User taps "Start 7-Day Free Trial" → navigate to `/checkout`
4. Premium status updated → `setPremiumUser(true)` → unlock all features


## Components and Interfaces

### OnboardingScreen Component

**Purpose**: 5-screen swipeable onboarding flow for first-time users.

**Props**:
```typescript
interface OnboardingScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
}
```

**State**:
```typescript
interface OnboardingState {
  currentScreen: number; // 0-4
  selectedPillars: PillarKey[];
  timeCommitment: string;
  userName: string;
  avatarColor: string;
}
```

**Key Methods**:
- `handleSkip()`: Navigate to Screen 5
- `handleNext()`: Advance to next screen with validation
- `handlePillarToggle(pillar: PillarKey)`: Multi-select pillar
- `handleComplete()`: Save onboarding data, navigate to Home

**Implementation Details**:
- Use `FlatList` with `horizontal` and `pagingEnabled` for swipeable screens
- Screen 1: Egg hatching animation using `Animated.timing()` with scale/opacity
- Screen 3: Disable continue button when `selectedPillars.length < 1`
- Screen 5: Validate userName max 20 characters, save via `saveNewOnboardingToSupabase()`

---

### MorningBriefingScreen Component

**Purpose**: 5-part morning ritual flow with time-based access control.

**Props**:
```typescript
interface MorningBriefingScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MorningBriefing'>;
}
```

**State**:
```typescript
interface MorningBriefingState {
  part: 1 | 2 | 3 | 4 | 5;
  quote: string;
  streak: number;
  yesterdayActivity: YesterdayActivity;
  suggestedLessons: Array<{ pillar: PillarKey; lesson: string }>;
  dailyIntention: string;
  voiceNoteEnabled: boolean;
  rexMessage: string;
}
```

**Key Methods**:
- `loadBriefingData()`: Fetch streak, quote, yesterday's activity
- `handlePartComplete(part: number)`: Advance to next part
- `handleFinish()`: Award 20 XP, mark briefing done, close flow
- `generateRexMessage()`: Personalized message based on streak, mood, day

**Implementation Details**:
- Check `isBeforeNoon()` on mount, block access after 12pm
- Part 1: Rotate quote from pool of 20 using `getDailyQuote()`
- Part 2: Display "Fresh start today 💪" when all yesterday stats === 0
- Part 3: Show top 2 pillars from onboarding, suggest 1 lesson per pillar
- Part 4: Check Web Speech API support (`window.webkitSpeechRecognition || window.SpeechRecognition`)
- Part 5: Call `generateRexMorningMessage()` with streak, mood, dayOfWeek

---

### EveningDebriefScreen Component

**Purpose**: 4-part evening reflection flow with validation.

**Props**:
```typescript
interface EveningDebriefScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EveningDebrief'>;
}
```

**State**:
```typescript
interface EveningDebriefState {
  part: 1 | 2 | 3 | 4;
  dayRating: number; // 1-5 stars
  q2Obstacle: string;
  q3Note: string;
  tomorrowPriority: string;
  rexResponse: string;
}
```

**Key Methods**:
- `handleStarSelect(rating: number)`: Update day rating with haptic feedback
- `validateQ2()`: Ensure min 5 words before allowing next
- `handleSubmit()`: Call `submitDebrief()`, award 30 XP, save tomorrow reminder
- `displayRexResponse()`: Show "Got it. I'll remind you about [answer] tomorrow morning 💪"

**Implementation Details**:
- Check `isAfter6PM()` on mount, hide button before 6pm
- Part 1: Stars fill with gold (#FFD700) on tap, trigger `Haptics.impactAsync()`
- Part 2: Limit textarea to 3 lines, placeholder "Even something small counts..."
- Part 4: Save `tomorrowPriority` to `KEYS.tomorrowReminder` for next morning

---

### StreakSystemUI Component

**Purpose**: Display streak count with freeze indicators and milestone celebrations.

**Props**:
```typescript
interface StreakSystemUIProps {
  streak: number;
  freezeCount: number;
  onStreakTap?: () => void;
}
```

**State**:
```typescript
interface StreakState {
  showMilestoneModal: boolean;
  milestoneData: { title: string; bonusXp: number; days: number } | null;
}
```

**Key Methods**:
- `checkAndShowMilestone(streak: number)`: Check if streak is milestone value
- `handleMilestoneClose()`: Dismiss modal, award bonus XP, trigger confetti

**Implementation Details**:
- Display ❄️ icon next to streak count when `freezeCount > 0`
- Milestone modal: Full overlay with dark background, large emoji + title
- Confetti trigger on modal display: 30 colored squares, random trajectories
- Milestone thresholds: 3 (🔥 0xp), 7 (⚡ 100xp), 14 (💎 250xp), 30 (👑 500xp)

---

### TimeCapsuleScreen Component

**Purpose**: Create and unlock time capsules with messages to future self.

**Props**:
```typescript
interface TimeCapsuleScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TimeCapsule'>;
}
```

**State**:
```typescript
interface TimeCapsuleState {
  capsules: TimeCapsuleRecord[];
  creatingCapsule: boolean;
  createStep: 1 | 2 | 3 | 4;
  newCapsule: {
    letter: string;
    unlockDate: string;
    promise: string;
  };
}
```

**Key Methods**:
- `loadCapsules()`: Fetch from `getTimeCapsules()`
- `handleCreateStart()`: Begin 4-step creation flow
- `handleSealCapsule()`: Save capsule, award 75 XP, trigger animation
- `handleUnlockCapsule(id: string)`: Flip animation, mark as opened

**Implementation Details**:
- Locked card: Display countdown "Opens in X days" using date math
- Unlock date reached: Add glow effect with `shadowOpacity` animation
- Step 1: Textarea with 500 char max, placeholder "Hey future me, right now I'm feeling..."
- Step 2: 4 preset options (1/3/6/12 months) + custom date picker
- Step 4: Preview card with flip animation on seal (rotateY from 0 to 180deg)
- Free tier: Max 1 capsule, show paywall on attempt to create second

---

### WeeklyWrappedScreen Component

**Purpose**: 6-slide shareable summary of user's week, auto-shown on Mondays.

**Props**:
```typescript
interface WeeklyWrappedScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WeeklyWrapped'>;
  data: WeeklyWrappedData;
}
```

**State**:
```typescript
interface WeeklyWrappedData {
  weekRange: string; // "Dec 16 - Dec 22"
  topStat: { label: string; value: number };
  dailyXp: Record<string, number>; // 7 days
  bestDay: string;
  lessonsCompleted: Array<{ title: string; pillar: PillarKey }>;
  totalMinutes: number;
  moodTimeline: Array<{ day: string; mood: string }>;
  overallVibe: string;
  rexMessage: string;
  nextChallenge: string;
  weakestPillar: PillarKey;
}
```

**Key Methods**:
- `handleSlideChange(index: number)`: Track current slide
- `handleAcceptChallenge()`: Award 50 XP, close modal
- `handleShare()`: Generate canvas screenshot, trigger Web Share API or download PNG

**Implementation Details**:
- Slide 1: Display week range, highlight top stat (max of XP/streak/lessons)
- Slide 2: Hand-drawn style bar chart using SVG with randomized heights
- Slide 3: List lessons with pillar emojis, calculate total minutes (lessons * avg 8 min)
- Slide 4: Emoji timeline across 7 days, mode calculation for overall vibe
- Slide 5: Rex message includes "This week you showed up [X] times. That's what champions do."
- Slide 6: Challenge based on weakest pillar XP in last 7 days
- Share: Add watermark "growthovo.com" on bottom-right, use `expo-sharing`

---

### SquadScreen Component

**Purpose**: Fake MVP social accountability with 3 fake members and activity feed.

**Props**:
```typescript
interface SquadScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Squad'>;
}
```

**State**:
```typescript
interface SquadState {
  members: SquadMember[];
  activityFeed: ActivityItem[];
  reactions: Record<string, string[]>; // activityId -> emoji array
  showMiniProfile: string | null; // memberId or null
}
```

**Types**:
```typescript
interface SquadMember {
  id: string;
  name: string;
  streak: number;
  xp: number;
  lastActivity: string;
  badges: string[];
  isFreezed?: boolean;
}

interface ActivityItem {
  id: string;
  memberId: string;
  memberName: string;
  action: string;
  timestamp: string;
}
```

**Key Methods**:
- `handleMemberTap(id: string)`: Show mini profile modal
- `handleActivityTap(id: string)`: Show emoji reaction options
- `handleReaction(activityId: string, emoji: string)`: Save locally, update UI
- `handleInvite()`: Generate shareable link, copy to clipboard, show toast

**Implementation Details**:
- Hardcoded 3 members: Ana M. (12 days, 420 XP), Bogdan T. (5 days, 280 XP), Ioana S. (freeze, 195 XP)
- Activity feed: Mix of member actions + user's actions, sorted by timestamp
- Mini profile: Modal with name, XP, streak, badges (hardcoded)
- Reaction options: ❤️ 🔥 💪 👏 displayed as horizontal row on activity tap
- Invite link format: `growthovo.com/squad/join?code=[random]`

---

### PaywallModal Component

**Purpose**: Premium subscription modal with pricing and trial button.

**Props**:
```typescript
interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  trigger: 'rex_limit' | 'lesson_limit' | 'speaking_limit' | 'capsule_limit' | 'wrapped_share';
}
```

**State**:
```typescript
interface PaywallState {
  selectedPlan: 'monthly' | 'yearly';
}
```

**Key Methods**:
- `handlePlanToggle()`: Switch between monthly and yearly
- `handleStartTrial()`: Navigate to `/checkout`
- `handleMaybeLater()`: Dismiss modal without action

**Implementation Details**:
- Slide up from bottom with spring animation
- Display 3 benefits: Unlimited Rex, All 24 lessons, Public Speaking unlimited
- Monthly: €9.99/mo, Yearly: €79.99/yr (shown as €6.67/mo · Save 33%)
- Yearly option highlighted with "Most Popular" badge
- Primary button: Purple (#7C3AED), full width, "Start 7-Day Free Trial →"
- "Maybe later" as text link below button

---

### Toast Component

**Purpose**: Bottom-screen slide-up notifications that auto-dismiss in 3 seconds.

**Props**:
```typescript
interface ToastProps {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  visible: boolean;
  onDismiss: () => void;
}
```

**Implementation Details**:
- Position: Bottom 80px from screen bottom
- Animation: Slide up with `Animated.timing()`, translateY from 200 to 0
- Colors: success (#34D399), info (#7C3AED), warning (#F59E0B), error (#EF4444)
- Auto-dismiss: `setTimeout(() => onDismiss(), 3000)` on mount
- Z-index: 9999 to appear above all content

---

### ConfettiSystem Component

**Purpose**: CSS-based animated colored squares for celebrations.

**Props**:
```typescript
interface ConfettiSystemProps {
  trigger: boolean;
  intensity?: 'low' | 'medium' | 'high';
}
```

**Implementation Details**:
- 30 colored squares per trigger
- Random colors: purple, teal, gold, pink
- Random trajectories: -50 to 50deg rotation, translateY from 0 to screen height
- Duration: 2 seconds with ease-out
- Used on: level up, streak milestones, pillar completion

---

### NotificationPermissionPrompt Component

**Purpose**: Custom permission prompt shown after onboarding completion.

**Props**:
```typescript
interface NotificationPermissionPromptProps {
  onAllow: () => void;
  onMaybeLater: () => void;
}
```

**Implementation Details**:
- Display: "🔔 Stay on track — Rex will send you daily nudges"
- [Allow] button: Trigger `Notifications.requestPermissionsAsync()`
- [Maybe later] button: Dismiss without triggering browser prompt
- Store permission status to AsyncStorage



## Data Models

### Onboarding Data

```typescript
interface OnboardingData {
  isComplete: boolean;
  selectedPillars: PillarKey[];
  timeCommitment: string; // "5 min", "10 min", "20 min", "30 min+"
  userName: string; // max 20 chars
  avatarColor: string; // hex color
}

// AsyncStorage keys
KEYS.onboardingComplete: string; // 'true' | 'false'
KEYS.selectedPillars: string; // JSON array
KEYS.timeCommitment: string;
KEYS.userName: string;
KEYS.avatarColor: string;
```

### Streak Data

```typescript
interface StreakData {
  currentStreak: number;
  lastCheckInDate: string; // ISO date YYYY-MM-DD
  freezeCount: number; // 0-2
  longestStreak: number;
}

// Supabase streaks table
interface StreakRecord {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  freeze_count: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

// Milestone definitions
STREAK_MILESTONES: {
  3: { title: "🔥 You're on fire!", bonusXp: 0 },
  7: { title: '⚡ One week strong!', bonusXp: 100 },
  14: { title: '💎 Two weeks! Legendary.', bonusXp: 250 },
  30: { title: "👑 30 days. You're unstoppable.", bonusXp: 500 },
}
```

### Morning Briefing Data

```typescript
interface MorningBriefingData {
  lastCompletedDate: string; // ISO date
  todaysQuote: string;
  yesterdayActivity: YesterdayActivity;
  suggestedLessons: Array<{
    pillar: PillarKey;
    lessonId: string;
    lessonTitle: string;
  }>;
  dailyIntention: string;
  rexMessage: string;
}

interface YesterdayActivity {
  xp: number;
  lessons: number;
  mood: string | null; // 'positive' | 'neutral' | 'negative' | null
}

// AsyncStorage keys
KEYS.morningBriefingDate: string; // YYYY-MM-DD
KEYS.yesterdayActivity: string; // JSON
KEYS.dailyIntention: string; // JSON
```

### Evening Debrief Data

```typescript
interface EveningDebriefData {
  lastCompletedDate: string; // ISO date
  dayRating: number; // 1-5
  q2Obstacle: string; // min 5 words
  q3Note: string;
  tomorrowPriority: string;
  rexResponse: string;
}

// Supabase evening_debriefs table
interface EveningDebriefRecord {
  id: string;
  user_id: string;
  date: string;
  day_rating: number;
  q2_obstacle: string;
  q3_note: string;
  tomorrow_priority: string;
  rex_verdict: string;
  created_at: string;
}

// AsyncStorage keys
KEYS.eveningDebriefDate: string; // YYYY-MM-DD
KEYS.tomorrowReminder: string;
```

### Time Capsule Data

```typescript
interface TimeCapsuleRecord {
  id: string;
  letter: string; // max 500 chars
  promise: string;
  createdAt: string; // ISO timestamp
  unlockAt: string; // ISO timestamp
  opened: boolean;
}

// AsyncStorage key
KEYS.timeCapsules: string; // JSON array of TimeCapsuleRecord[]

// Premium limits
MAX_CAPSULES_FREE = 1;
MAX_CAPSULES_PREMIUM = Infinity;
```

### Weekly Wrapped Data

```typescript
interface WeeklyWrappedData {
  weekStartDate: string; // ISO date (Monday)
  weekRange: string; // "Dec 16 - Dec 22"
  topStat: {
    label: 'XP earned' | 'Streak days' | 'Lessons completed';
    value: number;
  };
  dailyXp: {
    Mon: number;
    Tue: number;
    Wed: number;
    Thu: number;
    Fri: number;
    Sat: number;
    Sun: number;
  };
  bestDay: string; // day of week
  lessonsCompleted: Array<{
    title: string;
    pillar: PillarKey;
  }>;
  totalMinutes: number;
  moodTimeline: Array<{
    day: string;
    mood: string; // emoji
  }>;
  overallVibe: string; // most common mood emoji
  rexMessage: string;
  nextChallenge: {
    pillar: PillarKey;
    description: string;
  };
}

// AsyncStorage keys
KEYS.weeklyXp: string; // JSON object
KEYS.weeklyLessons: string; // JSON array
KEYS.weeklyMoods: string; // JSON array
KEYS.wrappedDismissedWeek: string; // ISO date of dismissed week
```

### Squad Data

```typescript
interface SquadMember {
  id: string;
  name: string;
  streak: number;
  xp: number;
  lastActivity: string;
  badges: string[]; // emoji badges
  isStreakFrozen: boolean;
}

interface ActivityItem {
  id: string;
  memberId: string;
  memberName: string;
  action: string; // "Studied Finance today", "Completed Fitness lesson"
  timestamp: string; // ISO timestamp
}

interface SquadData {
  members: SquadMember[]; // Hardcoded 3 members + user
  activityFeed: ActivityItem[];
  reactions: Record<string, string[]>; // activityId -> emoji array
}

// AsyncStorage key
KEYS.squadReactions: string; // JSON object

// Hardcoded squad members
SQUAD_MEMBERS: [
  { id: '1', name: 'Ana M.', streak: 12, xp: 420, lastActivity: 'Studied Finance today', badges: ['🔥', '⚡'], isStreakFrozen: false },
  { id: '2', name: 'Bogdan T.', streak: 5, xp: 280, lastActivity: 'Completed Fitness lesson', badges: ['💪'], isStreakFrozen: false },
  { id: '3', name: 'Ioana S.', streak: 7, xp: 195, lastActivity: 'Missed yesterday', badges: ['❄️'], isStreakFrozen: true }
]
```

### Notification Preferences

```typescript
interface NotificationPrefs {
  morning: boolean; // 8:00 AM
  evening: boolean; // 8:00 PM
  streak: boolean; // 11:00 PM streak warning
  league: boolean; // Sunday 8:00 PM league reset
}

// AsyncStorage key
KEYS.notificationPrefs: string; // JSON object

// Default: all true
```

### Premium Status

```typescript
interface PremiumStatus {
  isPremium: boolean;
  subscriptionType: 'monthly' | 'yearly' | null;
  trialEndDate: string | null; // ISO timestamp
  subscriptionEndDate: string | null; // ISO timestamp
}

// AsyncStorage key
KEYS.isPremium: string; // 'true' | 'false'

// Free tier limits
FREE_TIER_LIMITS: {
  rexMessages: 10,
  speakingSessions: 2,
  timeCapsules: 1,
  wrappedShare: false,
  leagueXp: false
}
```

### Appearance Preference

```typescript
type AppearanceMode = 'dark' | 'light' | 'system';

// AsyncStorage key
KEYS.appearance: string; // 'dark' | 'light' | 'system'

// Color palettes
DARK_MODE_COLORS: {
  background: '#0A0A12',
  card: '#1A1A2E',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.5)',
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  teal: '#34D399',
  border: 'rgba(255,255,255,0.08)'
}

LIGHT_MODE_COLORS: {
  background: '#F5F5FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: 'rgba(26,26,46,0.5)',
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  teal: '#34D399',
  border: 'rgba(0,0,0,0.08)'
}
```

### Usage Counters

```typescript
interface UsageCounters {
  rexMessagesUsed: number; // Daily counter, resets midnight
  speakingSessionsUsed: number; // Daily counter, resets midnight
  lastResetDate: string; // ISO date for daily reset tracking
}

// AsyncStorage keys
KEYS.rexMessagesUsed: string; // integer string
KEYS.speakingSessionsUsed: string; // integer string
```



## Error Handling

### Network Errors

**Scenario**: Supabase operations fail due to network issues.

**Strategy**:
1. Use AsyncStorage as primary source of truth for UI state
2. Queue failed operations for retry when connection restored
3. Display user-friendly error messages with retry buttons
4. Never block user from viewing cached data

**Implementation**:
```typescript
async function syncToSupabase(data: any): Promise<void> {
  try {
    await supabase.from('table').upsert(data);
  } catch (error) {
    // Queue for retry
    await queueOperation({ type: 'upsert', table: 'table', data });
    // Show non-blocking toast
    showToast('info', 'Data will sync when online');
  }
}
```

### Storage Errors

**Scenario**: AsyncStorage operations fail (rare on mobile).

**Strategy**:
1. Fallback to in-memory storage (Map-based)
2. Preserve data in memory for session duration
3. Attempt to write to AsyncStorage on next operation
4. Display toast: "Data will sync when connection is restored"

**Implementation**:
```typescript
const memoryStore = new Map<string, string>();

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}
```

### API Timeout

**Scenario**: Supabase Edge Functions time out (>3 seconds).

**Strategy**:
1. Set 3-second timeout on all Edge Function calls
2. Fallback to pre-written content for Rex messages, insights
3. Continue flow without blocking user
4. Never show "Loading..." for more than 3 seconds

**Implementation**:
```typescript
async function callEdgeFunction(name: string, body: any): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body,
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (error) throw error;
    return data;
  } catch {
    clearTimeout(timeout);
    // Return fallback content
    return getFallbackContent(name, body);
  }
}
```

### Permission Denial

**Scenario**: User denies notification permissions.

**Strategy**:
1. Never block app functionality based on permissions
2. Store permission status to AsyncStorage
3. Provide settings option to re-request later
4. Display informative (not error) message

**Implementation**:
```typescript
async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  await AsyncStorage.setItem('notification_permission', status);
  
  if (status !== 'granted') {
    showToast('info', 'You can enable notifications later in Settings');
    return false;
  }
  return true;
}
```

### Web Speech API Unavailable

**Scenario**: Web Speech API not supported in browser.

**Strategy**:
1. Silently fallback to text-only input
2. Never show error message about missing feature
3. Check support on component mount
4. Hide voice note button if unsupported

**Implementation**:
```typescript
const isWebSpeechSupported = (): boolean => {
  return !!(window.webkitSpeechRecognition || window.SpeechRecognition);
};

// In component
const [voiceEnabled] = useState(isWebSpeechSupported());

// Render conditionally
{voiceEnabled && <VoiceNoteButton />}
```

### Free Tier Limits

**Scenario**: User hits free tier limit (Rex messages, lessons, speaking sessions).

**Strategy**:
1. Display counter before limit is reached
2. Trigger paywall modal on limit hit
3. Allow "Maybe later" to dismiss
4. Never block navigation or other features

**Implementation**:
```typescript
async function checkRexLimit(): Promise<boolean> {
  const remaining = await getRexMessagesRemaining();
  
  if (remaining === 0) {
    showPaywallModal('rex_limit');
    return false;
  }
  
  if (remaining <= 3) {
    showToast('warning', `${remaining} Rex messages left today`);
  }
  
  return true;
}
```

### Invalid User Input

**Scenario**: User enters invalid data (empty name, no pillars selected).

**Strategy**:
1. Disable submit button when validation fails
2. Show inline validation hints (not error messages)
3. Never allow submission of invalid data
4. Provide clear feedback on what's needed

**Implementation**:
```typescript
const isValid = userName.trim().length > 0 && selectedPillars.length >= 1;

<Button
  disabled={!isValid}
  title="Continue"
  onPress={handleNext}
/>

{!isValid && (
  <Text style={styles.hint}>
    Choose at least one area to focus on
  </Text>
)}
```

### Time-Based Access Violations

**Scenario**: User tries to access Morning Briefing after 12pm.

**Strategy**:
1. Check time on component mount
2. Display friendly message explaining time restriction
3. Show when feature will be available again
4. Never show cryptic error

**Implementation**:
```typescript
if (!isBeforeNoon()) {
  return (
    <View style={styles.restricted}>
      <Text style={styles.emoji}>☀️</Text>
      <Text style={styles.message}>
        Morning Briefing is available before 12:00 PM
      </Text>
      <Text style={styles.hint}>
        Come back tomorrow morning!
      </Text>
    </View>
  );
}
```

### Edge Function Errors

**Scenario**: Supabase Edge Function returns error response.

**Strategy**:
1. Parse error message for user-friendly display
2. Fallback to pre-written content when possible
3. Log errors for debugging (console.error)
4. Never show raw error messages to user

**Implementation**:
```typescript
try {
  const { data, error } = await supabase.functions.invoke('submit-debrief', {
    body: debriefData
  });
  
  if (error) {
    console.error('Debrief submission error:', error);
    throw new Error('Failed to submit debrief');
  }
  
  return data;
} catch (error) {
  showToast('error', 'Unable to save your reflection. Please try again.');
  throw error;
}
```



## Testing Strategy

### Overview

This feature is **not suitable for property-based testing** because it consists primarily of:
- UI rendering and layout (React Native components)
- User interaction workflows (multi-step flows)
- Time-based configuration checks (access control)
- AsyncStorage CRUD operations (simple persistence)
- Modal displays and navigation (UI orchestration)

Instead, we use a comprehensive testing strategy combining:
1. **Unit tests**: Specific examples, edge cases, service logic
2. **Integration tests**: End-to-end workflow validation
3. **Snapshot tests**: UI component rendering
4. **Mock-based tests**: External service behavior

### Unit Testing Strategy

**Service Layer Tests**:
- Test all service functions with example-based inputs
- Mock AsyncStorage and Supabase for isolated testing
- Test error handling with specific failure scenarios
- Validate data transformations and calculations

**Example Test Cases**:

```typescript
// growthovoExperienceService.ts
describe('isBeforeNoon', () => {
  it('returns true when time is 11:59 AM', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(11);
    expect(isBeforeNoon()).toBe(true);
  });

  it('returns false when time is 12:00 PM', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
    expect(isBeforeNoon()).toBe(false);
  });
});

describe('getDailyQuote', () => {
  it('returns consistent quote for same day', () => {
    const quote1 = getDailyQuote();
    const quote2 = getDailyQuote();
    expect(quote1).toBe(quote2);
  });

  it('returns different quote for different day', () => {
    jest.spyOn(Date.prototype, 'getDate').mockReturnValueOnce(1);
    const quote1 = getDailyQuote();
    
    jest.spyOn(Date.prototype, 'getDate').mockReturnValueOnce(2);
    const quote2 = getDailyQuote();
    
    expect(quote1).not.toBe(quote2);
  });
});

describe('recordDailyCheckIn', () => {
  it('increments streak when checking in next day', async () => {
    // Setup: last check-in was yesterday
    // Execute: check in today
    // Verify: streak incremented by 1
  });

  it('consumes freeze when missing 2+ days with freezes available', async () => {
    // Setup: last check-in was 3 days ago, 1 freeze available
    // Execute: check in today
    // Verify: freeze consumed, streak preserved
  });

  it('resets streak when missing 2+ days with no freezes', async () => {
    // Setup: last check-in was 3 days ago, 0 freezes
    // Execute: check in today
    // Verify: streak reset to 1
  });
});
```

**Component Logic Tests**:
- Test state transitions with user actions
- Validate button enable/disable logic
- Test input validation rules
- Verify navigation calls

```typescript
// OnboardingScreen.test.tsx
describe('OnboardingScreen', () => {
  it('disables continue button when no pillars selected', () => {
    const { getByText } = render(<OnboardingScreen />);
    // Navigate to Screen 3
    // Verify continue button is disabled
  });

  it('enables continue button when 1+ pillars selected', () => {
    const { getByText, getByTestId } = render(<OnboardingScreen />);
    // Navigate to Screen 3
    // Select 1 pillar
    // Verify continue button is enabled
  });

  it('saves all data to AsyncStorage on completion', async () => {
    // Fill out all 5 screens
    // Tap "Let's go →" button
    // Verify AsyncStorage.setItem called with correct keys
  });
});
```

### Integration Testing Strategy

**End-to-End Workflow Tests**:
- Test complete user flows from start to finish
- Mock Supabase and AsyncStorage
- Verify XP awards, streak updates, navigation
- Test cross-component state synchronization

**Example Test Cases**:

```typescript
// MorningBriefingFlow.integration.test.tsx
describe('Morning Briefing Flow', () => {
  it('completes full 5-part flow and awards 20 XP', async () => {
    const { getByText } = render(<App />);
    
    // Navigate to Morning Briefing
    fireEvent.press(getByText('☀️ Morning Briefing'));
    
    // Complete Part 1 (greeting)
    fireEvent.press(getByText('Continue'));
    
    // Complete Part 2 (recap)
    fireEvent.press(getByText('Continue'));
    
    // Complete Part 3 (suggested lessons)
    fireEvent.press(getByText('Continue'));
    
    // Complete Part 4 (intention)
    fireEvent.changeText(getByTestId('intention-input'), 'Complete my workout');
    fireEvent.press(getByText('Continue'));
    
    // Complete Part 5 (Rex message)
    fireEvent.press(getByText('Start your day →'));
    
    // Verify XP awarded
    expect(mockAwardXP).toHaveBeenCalledWith(userId, 20, 'morning_briefing');
    
    // Verify navigation back to Home
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('blocks access after 12:00 PM', () => {
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(13);
    
    const { getByText } = render(<App />);
    
    // Verify button shows "Come back tomorrow morning ☀️"
    expect(getByText('Come back tomorrow morning ☀️')).toBeTruthy();
  });
});

// StreakSystem.integration.test.tsx
describe('Streak System Integration', () => {
  it('awards freeze on 7-day milestone', async () => {
    // Setup: streak at 6 days
    // Execute: complete daily check-in
    // Verify: streak = 7, freezeCount = 1, milestone modal shown
  });

  it('shows milestone modal with confetti on 30-day streak', async () => {
    // Setup: streak at 29 days
    // Execute: complete daily check-in
    // Verify: modal displays "👑 30 days. You're unstoppable."
    // Verify: confetti animation triggered
    // Verify: 500 XP awarded
  });
});
```

### Snapshot Testing Strategy

**Component UI Tests**:
- Snapshot test for each major screen and component
- Test both dark mode and light mode variants
- Test empty states, loading states, error states
- Test with different data scenarios

```typescript
// WeeklyWrappedScreen.snapshot.test.tsx
describe('WeeklyWrappedScreen Snapshots', () => {
  it('matches snapshot for Slide 1 with high XP', () => {
    const data = { topStat: { label: 'XP earned', value: 850 }, ... };
    const tree = renderer.create(<WeeklyWrappedScreen data={data} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for empty week (no data)', () => {
    const data = { topStat: { label: 'XP earned', value: 0 }, ... };
    const tree = renderer.create(<WeeklyWrappedScreen data={data} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

// TimeCapsuleScreen.snapshot.test.tsx
describe('TimeCapsuleScreen Snapshots', () => {
  it('matches snapshot for locked capsule', () => {
    const capsule = { id: '1', opened: false, unlockAt: futureDate, ... };
    const tree = renderer.create(<CapsuleCard capsule={capsule} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot for unlocked capsule with glow', () => {
    const capsule = { id: '1', opened: false, unlockAt: pastDate, ... };
    const tree = renderer.create(<CapsuleCard capsule={capsule} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
```

### Mock-Based Testing Strategy

**External Service Tests**:
- Mock AsyncStorage for all persistence operations
- Mock Supabase for all database and Edge Function calls
- Mock expo-haptics for vibration feedback
- Mock expo-notifications for permission requests

```typescript
// Mock setup
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('./services/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
    functions: { invoke: jest.fn() },
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));
```

### Empty State Tests

```typescript
describe('Empty States', () => {
  it('shows empty state for time capsule list when no capsules exist', () => {
    const { getByText } = render(<TimeCapsuleScreen />);
    expect(getByText('Create your first time capsule 📬')).toBeTruthy();
  });

  it('shows empty state for squad feed when no activities exist', () => {
    const { getByText } = render(<SquadScreen />);
    expect(getByText("Your squad's activity will appear here")).toBeTruthy();
  });
});
```

### Loading State Tests

```typescript
describe('Loading States', () => {
  it('shows skeleton loader while fetching weekly wrapped data', () => {
    const { getByTestId } = render(<WeeklyWrappedScreen />);
    expect(getByTestId('skeleton-loader')).toBeTruthy();
  });

  it('shows skeleton loader while fetching lesson list', () => {
    const { getByTestId } = render(<LessonsScreen />);
    expect(getByTestId('lesson-skeleton')).toBeTruthy();
  });
});
```

### Error State Tests

```typescript
describe('Error States', () => {
  it('shows retry button when Supabase query fails', async () => {
    mockSupabase.from.mockRejectedValue(new Error('Network error'));
    
    const { getByText } = render(<LeagueScreen />);
    
    await waitFor(() => {
      expect(getByText('Unable to load data. Please check your connection.')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
    });
  });

  it('falls back to in-memory storage when AsyncStorage fails', async () => {
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
    
    await safeSetItem('test_key', 'test_value');
    
    // Verify data stored in memory
    expect(memoryStore.get('test_key')).toBe('test_value');
  });
});
```

### Accessibility Tests

```typescript
describe('Accessibility', () => {
  it('provides accessible labels for all interactive elements', () => {
    const { getAllByRole } = render(<OnboardingScreen />);
    const buttons = getAllByRole('button');
    
    buttons.forEach(button => {
      expect(button).toHaveAccessibilityLabel();
    });
  });

  it('supports keyboard navigation for onboarding flow', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    
    // Simulate Tab key press
    fireEvent(getByTestId('pillar-card-1'), 'focus');
    
    // Verify focus moves to next pillar
    expect(getByTestId('pillar-card-2')).toHaveFocus();
  });
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  it('renders Home screen in under 100ms', () => {
    const start = performance.now();
    render(<HomeScreen />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100);
  });

  it('animates confetti without blocking UI thread', () => {
    const { getByTestId } = render(<ConfettiSystem trigger={true} />);
    
    // Verify animation uses native driver
    expect(getByTestId('confetti-container')).toHaveStyle({
      // Native driver properties
    });
  });
});
```

### Test Coverage Goals

- **Service Layer**: 90%+ code coverage
- **Components**: 80%+ code coverage (excluding styling)
- **Integration Tests**: Cover all major user workflows
- **Snapshot Tests**: All screens with 2+ variants (dark/light, empty/loaded)

### Test Execution

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test suite
npm test -- OnboardingScreen.test.tsx

# Run integration tests only
npm test -- --testPathPattern=integration
```

### Continuous Integration

All tests must pass before merging to main branch. CI pipeline:
1. Run linter (ESLint)
2. Run TypeScript type checking
3. Run unit tests with coverage report
4. Run integration tests
5. Generate snapshot diff report
6. Fail if coverage drops below 80%



## Implementation Notes

### Onboarding Flow Implementation

**Screen Navigation**:
- Use `FlatList` with `horizontal={true}` and `pagingEnabled={true}` for swipeable screens
- Track current screen index in state
- Implement skip button that sets index to 4 (Screen 5)

**Egg Hatching Animation (Screen 1)**:
```typescript
const eggScale = useRef(new Animated.Value(1)).current;
const eggOpacity = useRef(new Animated.Value(1)).current;

const playHatchAnimation = () => {
  Animated.sequence([
    // Wobble effect
    Animated.timing(eggScale, {
      toValue: 1.1,
      duration: 200,
      useNativeDriver: true
    }),
    Animated.timing(eggScale, {
      toValue: 0.9,
      duration: 200,
      useNativeDriver: true
    }),
    // Crack and fade
    Animated.parallel([
      Animated.timing(eggScale, {
        toValue: 1.3,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.timing(eggOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      })
    ])
  ]).start();
};
```

**Data Persistence**:
- Save to AsyncStorage immediately on "Let's go →" button press
- Also call `saveNewOnboardingToSupabase()` for server sync
- Mark `onboarding_complete: true` to skip flow on future launches

### Morning Briefing Implementation

**Time-Based Access Control**:
```typescript
useEffect(() => {
  if (!isBeforeNoon()) {
    setAccessDenied(true);
  }
}, []);

if (accessDenied) {
  return <AccessDeniedView message="Come back tomorrow morning ☀️" />;
}
```

**Quote Rotation**:
- Use `getDailyQuote()` which indexes into 20-quote array by day of month
- Ensures same quote shown all day for consistency

**Web Speech API Integration** (Part 4):
```typescript
const isWebSpeechSupported = () => {
  return !!(window.webkitSpeechRecognition || window.SpeechRecognition);
};

const startVoiceRecording = () => {
  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setDailyIntention(transcript);
  };
  
  recognition.start();
};
```

**Rex Message Personalization**:
- Call `generateRexMorningMessage()` with streak, yesterday's mood, day of week
- Conditionally include phrases based on conditions (see service implementation)

### Evening Debrief Implementation

**Q2 Word Count Validation**:
```typescript
const validateMinWords = (text: string, min: number): boolean => {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length >= min;
};

const handlePart2Next = () => {
  if (!validateMinWords(q2Obstacle, 5)) {
    showToast('warning', 'Please write at least 5 words');
    return;
  }
  setPart(3);
};
```

**Edge Function Submission**:
```typescript
const handleSubmit = async () => {
  try {
    const debrief = await submitDebrief(userId, {
      dayRating,
      q2Obstacle,
      q3Note,
      tomorrowPriority
    });
    
    // Display Rex verdict
    setRexResponse(debrief.rex_verdict);
    
    // Award XP (handled by Edge Function)
    // Save tomorrow reminder
    await saveTomorrowReminder(tomorrowPriority);
    
    // Trigger memory extraction (async, non-blocking)
    extractMemoriesFromDebrief(userId, debrief);
    
  } catch (error) {
    showToast('error', 'Unable to save your reflection. Please try again.');
  }
};
```

### Streak System Implementation

**Daily Check-In with Freeze Logic**:
```typescript
const handleDailyCheckIn = async () => {
  try {
    const result = await recordDailyCheckIn(userId);
    
    // Update UI state
    setStreak(result.streak);
    setFreezeCount(result.freezeCount);
    
    // Show freeze toast if consumed
    if (result.freezeUsed) {
      showToast('info', '❄️ Streak Freeze used!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    
    // Show milestone modal if milestone reached
    if (result.milestone) {
      const milestoneData = STREAK_MILESTONES[result.milestone];
      setMilestoneModal({
        visible: true,
        title: milestoneData.title,
        bonusXp: milestoneData.bonusXp,
        days: result.milestone
      });
      
      // Trigger confetti
      setConfettiTrigger(true);
      
      // Award bonus XP
      if (milestoneData.bonusXp > 0) {
        await awardXP(userId, milestoneData.bonusXp, 'streak_milestone');
      }
    }
    
  } catch (error) {
    showToast('error', 'Unable to update streak. Please try again.');
  }
};
```

**Freeze Award on 7-Day Intervals**:
- Handled automatically in `streakService.incrementStreak()`
- Awards 1 freeze when `streak % 7 === 0`
- Caps at 2 freezes stored

### Notification Implementation

**Permission Prompt**:
```typescript
const NotificationPermissionPrompt = ({ onAllow, onMaybeLater }) => {
  const handleAllow = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === 'granted') {
      // Schedule notifications
      await scheduleNotifications();
      onAllow();
    } else {
      showToast('info', 'You can enable notifications later in Settings');
      onMaybeLater();
    }
  };
  
  return (
    <Modal visible={true} transparent>
      <View style={styles.container}>
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.message}>
          Stay on track — Rex will send you daily nudges
        </Text>
        <Button title="Allow" onPress={handleAllow} />
        <Button title="Maybe later" onPress={onMaybeLater} />
      </View>
    </Modal>
  );
};
```

**Scheduled Notifications**:
```typescript
const scheduleNotifications = async () => {
  const prefs = await getNotificationPrefs();
  
  // Morning briefing (8:00 AM)
  if (prefs.morning) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Good morning!',
        body: '☀️ Morning briefing is ready, [name]!',
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true
      }
    });
  }
  
  // Evening debrief (8:00 PM)
  if (prefs.evening) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to reflect',
        body: '🌙 Time for your evening debrief',
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true
      }
    });
  }
  
  // Streak warning (11:00 PM)
  if (prefs.streak) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Streak alert!',
        body: '🔥 [name], your X-day streak ends in 1 hour!',
      },
      trigger: {
        hour: 23,
        minute: 0,
        repeats: true
      }
    });
  }
  
  // League reset (Sunday 8:00 PM)
  if (prefs.league) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'League update',
        body: '🏆 League resets tomorrow — make your final push!',
      },
      trigger: {
        weekday: 1, // Sunday
        hour: 20,
        minute: 0,
        repeats: true
      }
    });
  }
};
```

### Time Capsule Implementation

**Unlock Date Calculation**:
```typescript
const calculateUnlockDate = (option: '1m' | '3m' | '6m' | '1y'): string => {
  const now = new Date();
  
  switch (option) {
    case '1m':
      now.setMonth(now.getMonth() + 1);
      break;
    case '3m':
      now.setMonth(now.getMonth() + 3);
      break;
    case '6m':
      now.setMonth(now.getMonth() + 6);
      break;
    case '1y':
      now.setFullYear(now.getFullYear() + 1);
      break;
  }
  
  return now.toISOString();
};
```

**Glow Effect for Unlocked Capsules**:
```typescript
const glowAnimation = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (isUnlocked) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false
        })
      ])
    ).start();
  }
}, [isUnlocked]);

const shadowOpacity = glowAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [0.3, 0.8]
});
```

**Flip Animation on Unlock**:
```typescript
const flipAnimation = useRef(new Animated.Value(0)).current;

const flipCard = () => {
  Animated.timing(flipAnimation, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true
  }).start(() => {
    setContentVisible(true);
  });
};

const rotateY = flipAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '180deg']
});
```

### Weekly Wrapped Implementation

**Data Aggregation**:
```typescript
const generateWeeklyWrappedData = async (userId: string): Promise<WeeklyWrappedData> => {
  const weekStart = getWeekStartDate(); // Monday
  const weekEnd = getWeekEndDate(); // Sunday
  
  // Fetch daily XP from last 7 days
  const dailyXp = await getWeeklyXp();
  
  // Fetch completed lessons
  const lessons = await getWeeklyLessons();
  
  // Fetch mood logs
  const moods = await getWeeklyMoods();
  
  // Calculate top stat
  const xpTotal = Object.values(dailyXp).reduce((sum, xp) => sum + xp, 0);
  const streakDays = await getStreakCount();
  const lessonsCount = lessons.length;
  
  const topStat = Math.max(xpTotal, streakDays, lessonsCount);
  const topLabel = topStat === xpTotal ? 'XP earned' :
                   topStat === streakDays ? 'Streak days' :
                   'Lessons completed';
  
  // Find best day (highest XP)
  const bestDay = Object.entries(dailyXp).reduce((best, [day, xp]) => 
    xp > dailyXp[best] ? day : best, 'Mon'
  );
  
  // Calculate overall vibe (most common mood)
  const moodCounts = moods.reduce((acc, m) => {
    acc[m.mood] = (acc[m.mood] || 0) + 1;
    return acc;
  }, {});
  const overallVibe = Object.entries(moodCounts).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0];
  
  // Generate Rex message
  const showUpCount = Object.values(dailyXp).filter(xp => xp > 0).length;
  const rexMessage = `This week you showed up ${showUpCount} times. That's what champions do.`;
  
  // Determine weakest pillar for next challenge
  const weakestPillar = await getWeakestPillar(userId);
  const nextChallenge = {
    pillar: weakestPillar,
    description: `Complete 3 ${weakestPillar} lessons this week`
  };
  
  return {
    weekRange: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
    topStat: { label: topLabel, value: topStat },
    dailyXp,
    bestDay,
    lessonsCompleted: lessons,
    totalMinutes: lessons.length * 8,
    moodTimeline: moods,
    overallVibe,
    rexMessage,
    nextChallenge
  };
};
```

**Share Functionality**:
```typescript
const shareWrapped = async (slideData: any) => {
  try {
    // Generate canvas screenshot
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Draw slide content
    // ... (canvas rendering logic)
    
    // Add watermark
    ctx.font = '14px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('growthovo.com', canvas.width - 150, canvas.height - 20);
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'weekly-wrapped.png', { type: 'image/png' });
      
      // Try Web Share API
      if (navigator.share) {
        await navigator.share({
          title: 'My Week on Growthovo',
          files: [file]
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'weekly-wrapped.png';
        link.click();
      }
    });
    
  } catch (error) {
    showToast('error', 'Unable to share. Please try again.');
  }
};
```

### Paywall Implementation

**Free Tier Limit Checks**:
```typescript
// Before Rex chat
const canSendMessage = async (): Promise<boolean> => {
  if (await isPremiumUser()) return true;
  
  const remaining = await getRexMessagesRemaining();
  if (remaining === 0) {
    showPaywallModal('rex_limit');
    return false;
  }
  
  return true;
};

// Before lesson access
const canAccessLesson = async (lessonIndex: number, pillar: PillarKey): Promise<boolean> => {
  if (await isPremiumUser()) return true;
  
  if (lessonIndex >= 2) {
    showPaywallModal('lesson_limit');
    return false;
  }
  
  return true;
};

// Before speaking session
const canStartSession = async (): Promise<boolean> => {
  if (await isPremiumUser()) return true;
  
  const used = parseInt(await AsyncStorage.getItem(KEYS.speakingSessionsUsed) ?? '0');
  if (used >= 2) {
    showPaywallModal('speaking_limit');
    return false;
  }
  
  return true;
};
```

### Micro-Interactions Implementation

**Toast System**:
```typescript
const Toast = ({ type, message, visible, onDismiss }) => {
  const translateY = useRef(new Animated.Value(200)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true
      }).start();
      
      setTimeout(() => {
        Animated.timing(translateY, {
          toValue: 200,
          duration: 300,
          useNativeDriver: true
        }).start(onDismiss);
      }, 3000);
    }
  }, [visible]);
  
  const colors = {
    success: '#34D399',
    info: '#7C3AED',
    warning: '#F59E0B',
    error: '#EF4444'
  };
  
  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: colors[type], transform: [{ translateY }] }
      ]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};
```

**Haptic Feedback Patterns**:
```typescript
// Button tap
const onButtonPress = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // ... button action
};

// XP gain
const onXpGain = async () => {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  // ... XP animation
};

// Level up
const onLevelUp = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await new Promise(resolve => setTimeout(resolve, 100));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await new Promise(resolve => setTimeout(resolve, 100));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  // ... level up modal
};
```

**XP Gain Animation**:
```typescript
const XPAnimation = ({ amount, sourcePosition }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.xpBubble,
        { 
          transform: [{ translateY }],
          opacity,
          position: 'absolute',
          left: sourcePosition.x,
          top: sourcePosition.y
        }
      ]}
    >
      <Text style={styles.xpText}>+{amount} XP ✨</Text>
    </Animated.View>
  );
};
```

**Confetti System**:
```typescript
const ConfettiSystem = ({ trigger, intensity = 'medium' }) => {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (trigger) {
      const count = intensity === 'high' ? 50 : intensity === 'medium' ? 30 : 20;
      const colors = ['#7C3AED', '#34D399', '#FFD700', '#EC4899'];
      
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * window.innerWidth,
        rotation: Math.random() * 360,
        duration: 2 + Math.random()
      }));
      
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 3000);
    }
  }, [trigger]);
  
  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {particles.map(p => (
        <Animated.View
          key={p.id}
          style={[
            styles.confetti,
            {
              backgroundColor: p.color,
              left: p.x,
              transform: [{ rotate: `${p.rotation}deg` }]
            }
          ]}
        />
      ))}
    </View>
  );
};
```

### Theme Implementation

**Theme Context**:
```typescript
interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textMuted: string;
  purple: string;
  purpleLight: string;
  teal: string;
  border: string;
}

const DARK_COLORS: ThemeColors = {
  background: '#0A0A12',
  card: '#1A1A2E',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.5)',
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  teal: '#34D399',
  border: 'rgba(255,255,255,0.08)'
};

const LIGHT_COLORS: ThemeColors = {
  background: '#F5F5FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: 'rgba(26,26,46,0.5)',
  purple: '#7C3AED',
  purpleLight: '#A78BFA',
  teal: '#34D399',
  border: 'rgba(0,0,0,0.08)'
};

const useTheme = () => {
  const [mode, setMode] = useState<'dark' | 'light' | 'system'>('dark');
  const colorScheme = useColorScheme();
  
  const activeMode = mode === 'system' ? colorScheme : mode;
  const colors = activeMode === 'light' ? LIGHT_COLORS : DARK_COLORS;
  
  const toggleTheme = async (newMode: 'dark' | 'light' | 'system') => {
    setMode(newMode);
    await AsyncStorage.setItem(KEYS.appearance, newMode);
  };
  
  return { colors, mode, toggleTheme };
};
```

### Performance Optimizations

**Lazy Loading**:
```typescript
// Lazy load heavy screens
const WeeklyWrappedScreen = lazy(() => import('./screens/WeeklyWrappedScreen'));
const TimeCapsuleScreen = lazy(() => import('./screens/TimeCapsuleScreen'));

// Use Suspense with loading fallback
<Suspense fallback={<LoadingSkeleton />}>
  <WeeklyWrappedScreen />
</Suspense>
```

**Memoization**:
```typescript
// Memoize expensive calculations
const weeklyStats = useMemo(() => {
  return calculateWeeklyStats(dailyXp, lessons, moods);
}, [dailyXp, lessons, moods]);

// Memoize components that don't change often
const StreakCard = memo(({ streak, freezeCount }) => {
  return (
    <View style={styles.card}>
      <Text>{streak} days 🔥</Text>
      {freezeCount > 0 && <Text>❄️ × {freezeCount}</Text>}
    </View>
  );
});
```

**Native Driver for Animations**:
```typescript
// Always use native driver when possible
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true // Runs on native thread, 60fps
}).start();

// Only exclude when animating layout properties
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: false // Required for width/height
}).start();
```

### Accessibility Considerations

**Screen Reader Support**:
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Complete morning briefing"
  accessibilityHint="Opens the 5-part morning ritual flow"
  accessibilityRole="button"
  onPress={handleBriefingPress}
>
  <Text>☀️ Morning Briefing</Text>
</TouchableOpacity>
```

**Keyboard Navigation**:
```typescript
// Support Tab navigation
<View accessible={true} accessibilityRole="group">
  <Pressable
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
  >
    <PillarCard pillar="mind" />
  </Pressable>
</View>
```

**Color Contrast**:
- Ensure all text meets WCAG AA standards (4.5:1 contrast ratio)
- Test both dark and light modes with contrast checker
- Use sufficient contrast for disabled states

**Touch Target Size**:
- Minimum 44×44 points for all interactive elements
- Add padding to small icons to meet minimum size
- Ensure spacing between adjacent interactive elements

### Security Considerations

**Data Sanitization**:
```typescript
// Sanitize user input before storage
const sanitizeInput = (text: string): string => {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500); // Enforce max length
};
```

**Sensitive Data Storage**:
- Never store auth tokens in AsyncStorage (use secure storage)
- Use Supabase session management for authentication
- Never log sensitive user data (mood notes, capsule letters)

**API Security**:
- All Supabase calls use Row Level Security (RLS)
- Edge Functions validate user permissions server-side
- Rate limiting on Edge Functions to prevent abuse

