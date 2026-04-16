# Design Document: Duolingo Glassmorphism UI

## Overview

This design document specifies a comprehensive gamification and glassmorphism UI system for the ascevo React Native application. The system combines Duolingo-inspired engagement mechanics (streaks, XP, achievements, celebrations) with premium frosted glass visual effects to create a modern, motivating user experience.

The design integrates with the existing ascevo architecture, leveraging the current XP system, streak tracking, and progress services while adding new visual components and animation controllers. The system is built to work seamlessly across web (PWA) and mobile platforms using React Native's cross-platform capabilities.

## Architecture

### High-Level Component Structure

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  (Existing Screens: Home, Lesson, League, Profile)      │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────┐
│              Gamification UI System                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Visual Components (Glassmorphism)               │  │
│  │  - GlassCard, GlassModal, GlassOverlay          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Gamification Components                         │  │
│  │  - StreakDisplay, XPBar, AchievementBadge       │  │
│  │  - CelebrationModal, ProgressRing               │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Animation Controllers                           │  │
│  │  - useSpringAnimation, useCelebration           │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────┐
│              Services Layer                              │
│  - gamificationService (achievements, challenges)        │
│  - animationService (celebration triggers)               │
│  - themeService (light/dark mode)                        │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────┐
│         Existing Services (Reused)                       │
│  - progressService (XP, levels)                          │
│  - streakService (streak tracking)                       │
│  - supabaseClient (data persistence)                     │
└──────────────────────────────────────────────────────────┘
```

### Technology Stack

- **UI Framework**: React Native (cross-platform)
- **Animations**: React Native Reanimated 2 (GPU-accelerated)
- **Gestures**: React Native Gesture Handler
- **Blur Effects**: 
  - Web: CSS `backdrop-filter: blur()`
  - iOS: `BlurView` from `@react-native-community/blur`
  - Android: Custom blur implementation with fallback
- **State Management**: Zustand (existing store pattern)
- **Styling**: StyleSheet with theme system

## Components and Interfaces

### 1. Glassmorphism Components

#### GlassCard Component

A reusable card component with frosted glass effect.

```typescript
interface GlassCardProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy'; // blur intensity
  tint?: string; // background tint color
  borderColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

// Implementation approach:
// - Web: Use CSS backdrop-filter with rgba background
// - iOS: Use BlurView with overlay
// - Android: Use semi-transparent background with shadow (fallback)
```

#### GlassModal Component

Full-screen or partial modal with glassmorphism background.

```typescript
interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'fade' | 'slide' | 'scale';
  blurIntensity?: number;
}
```

### 2. Performance & Adaptive Management

#### Performance Monitor Service

Monitors frame rates and manages adaptive UI degradation.

```typescript
interface PerformanceSettings {
  glassmorphismEnabled: boolean;
  animationsEnabled: boolean;
  blurIntensity: 'light' | 'medium' | 'heavy';
  autoDegrade: boolean;
}

// Implementation approach:
// - Monitor FPS during active animations
// - Automatically reduce blur intensity if FPS < 30
// - Provide manual toggle for low-power mode
// - Sync settings via usePerformanceStore
```

#### useBlurOptimization Hook

Viewport-aware blur management for high-performance glass effects.

```typescript
interface BlurOptimizationConfig {
  enabled: boolean;
  disableOnScroll: boolean;
  checkViewport: boolean;
}

// Implementation approach:
// - Detect if component is currently visible in viewport
// - Temporarily disable blur during high-velocity scrolling
// - Automatically re-enable blur when scrolling stops
```

#### GlassOverlay Component

Backdrop overlay for modals and bottom sheets.

```typescript
interface GlassOverlayProps {
  visible: boolean;
  onPress?: () => void;
  blurAmount?: number;
  tintColor?: string;
  opacity?: number;
}
```

### 2. Gamification Components

#### StreakDisplay Component

Enhanced streak display with fire animations.

```typescript
interface StreakDisplayProps {
  streak: number;
  isAtRisk: boolean;
  freezeCount: number;
  onPress?: () => void;
  variant?: 'compact' | 'expanded';
}

// Features:
// - Animated fire emoji that pulses
// - Warning state with skull emoji
// - Milestone celebrations (7, 30, 100 days)
// - Freeze indicator
```

#### XPBar Component

Animated XP progress bar with level display.

```typescript
interface XPBarProps {
  currentXP: number;
  requiredXP: number;
  level: number;
  animated?: boolean;
  showLabel?: boolean;
  gradient?: [string, string];
}

// Features:
// - Smooth fill animation
// - Gradient progress bar
// - Level badge
// - Overflow animation when leveling up
```

#### AchievementBadge Component

Individual achievement badge display.

```typescript
interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'lessons' | 'social' | 'special';
  unlockedAt?: string;
}
```

#### CelebrationModal Component

Full-screen celebration for major achievements.

```typescript
interface CelebrationModalProps {
  visible: boolean;
  type: 'lesson_complete' | 'level_up' | 'streak_milestone' | 'achievement';
  data: CelebrationData;
  onComplete: () => void;
}

interface CelebrationData {
  title: string;
  subtitle?: string;
  xpEarned?: number;
  achievements?: Achievement[];
  streakMilestone?: number;
  newLevel?: number;
}

// Features:
// - Confetti animation
// - Particle effects
// - Sound effects (optional)
// - Sequential reveals for multiple rewards
```

#### ProgressRing Component

Circular progress indicator for goals.

```typescript
interface ProgressRingProps {
  progress: number; // 0-1
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  animated?: boolean;
}
```

#### LeaderboardCard Component

Enhanced leaderboard display with glassmorphism.

```typescript
interface LeaderboardCardProps {
  members: LeagueMember[];
  currentUserId: string;
  onMemberPress?: (userId: string) => void;
  variant?: 'compact' | 'full';
}
```

#### DailyGoalCard Component

Daily challenge progress card.

```typescript
interface DailyGoalCardProps {
  goal: DailyGoal;
  progress: number;
  onPress?: () => void;
}

interface DailyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

### 3. Animation Hooks

#### useSpringAnimation Hook

Reusable spring animation hook.

```typescript
function useSpringAnimation(config?: SpringConfig): {
  value: Animated.SharedValue<number>;
  start: (toValue: number) => void;
  reset: () => void;
}

interface SpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
  overshootClamping?: boolean;
}
```

#### useCelebration Hook

Manages celebration state and sequencing.

```typescript
function useCelebration(): {
  trigger: (type: CelebrationType, data: CelebrationData) => void;
  isPlaying: boolean;
  queue: CelebrationData[];
}
```

#### useProgressAnimation Hook

Animates progress changes smoothly.

```typescript
function useProgressAnimation(targetValue: number, duration?: number): {
  animatedValue: Animated.SharedValue<number>;
  isAnimating: boolean;
}
```

### 4. Services

#### gamificationService

Manages achievements, challenges, and rewards.

```typescript
// Achievement tracking
export async function checkAchievements(
  userId: string,
  event: AchievementEvent
): Promise<Achievement[]>;

export async function unlockAchievement(
  userId: string,
  achievementId: string
): Promise<void>;

export async function getUserAchievements(
  userId: string
): Promise<Achievement[]>;

// Daily challenges
export async function getDailyGoals(
  userId: string
): Promise<DailyGoal[]>;

export async function updateGoalProgress(
  userId: string,
  goalId: string,
  progress: number
): Promise<void>;

export async function completeDailyGoal(
  userId: string,
  goalId: string
): Promise<number>; // returns XP earned

// Challenge definitions
export const ACHIEVEMENT_DEFINITIONS: Record<string, AchievementDefinition>;
export const DAILY_GOAL_TEMPLATES: DailyGoalTemplate[];
```

#### animationService

Centralized animation configuration and utilities.

```typescript
export const ANIMATION_CONFIGS = {
  spring: {
    gentle: { damping: 20, stiffness: 90 },
    bouncy: { damping: 10, stiffness: 100 },
    stiff: { damping: 15, stiffness: 200 },
  },
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

export function createCelebrationSequence(
  celebrations: CelebrationData[]
): AnimationSequence;

export function triggerHaptic(type: 'light' | 'medium' | 'heavy'): void;
```

#### themeService

Enhanced theme management with glassmorphism support.

```typescript
export interface GlassmorphismTheme {
  blur: {
    light: number;
    medium: number;
    heavy: number;
  };
  tint: {
    light: string;
    dark: string;
  };
  opacity: {
    light: number;
    medium: number;
    heavy: number;
  };
  shadow: {
    color: string;
    offset: { width: number; height: number };
    opacity: number;
    radius: number;
  };
}

export function getGlassStyle(
  intensity: 'light' | 'medium' | 'heavy',
  isDark: boolean
): ViewStyle;

export function useTheme(): {
  isDark: boolean;
  toggle: () => void;
  colors: ColorScheme;
  glass: GlassmorphismTheme;
};
```

## Data Models

### Database Schema Extensions

```sql
-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_achievements_unlocked ON achievements(unlocked_at);

-- Daily goals table
CREATE TABLE daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_type, date)
);

CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, date);
CREATE INDEX idx_daily_goals_completed ON daily_goals(completed_at);

-- Celebration history (for analytics)
CREATE TABLE celebration_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  celebration_type TEXT NOT NULL,
  data JSONB,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_celebration_history_user ON celebration_history(user_id);
CREATE INDEX idx_celebration_history_type ON celebration_history(celebration_type);
```

### TypeScript Type Extensions

```typescript
// Add to existing types/index.ts

export interface Achievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  createdAt: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'lessons' | 'social' | 'special';
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: 'streak' | 'xp_total' | 'lessons_count' | 'level' | 'custom';
  threshold: number;
  pillarId?: string;
}

export interface DailyGoal {
  id: string;
  userId: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  date: string;
  completedAt?: string;
  createdAt: string;
}

export interface CelebrationEvent {
  id: string;
  userId: string;
  celebrationType: 'lesson_complete' | 'level_up' | 'streak_milestone' | 'achievement';
  data: Record<string, any>;
  triggeredAt: string;
}

export type AchievementEvent =
  | { type: 'lesson_complete'; lessonId: string }
  | { type: 'streak_updated'; streak: number }
  | { type: 'xp_earned'; amount: number; total: number }
  | { type: 'level_up'; level: number; pillarId: string };
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, let me analyze the acceptance criteria for testability.



### Property 1: Streak State Transitions

*For any* user streak state, when a daily goal is completed, the streak count should increment by one, and when a streak is broken without a freeze, the current streak should reset to zero while preserving the longest streak if it was a new record.

**Validates: Requirements 1.1, 1.5**

### Property 2: Milestone Celebration Triggers

*For any* streak value that equals a milestone (7, 30, 100, or 365), the system should trigger a celebration event with the appropriate milestone data.

**Validates: Requirements 1.3**

### Property 3: At-Risk Streak Detection

*For any* user with a streak, if the last activity date is not today, the streak should be marked as at-risk.

**Validates: Requirements 1.4**

### Property 4: XP Award Calculation

*For any* completed action, the XP awarded should match the predefined amount for that action type and difficulty level.

**Validates: Requirements 2.1**

### Property 5: Level Progression

*For any* XP total that crosses a level threshold, the user's level should increment, and a level-up celebration should be triggered.

**Validates: Requirements 2.2, 2.3**

### Property 6: XP Display Completeness

*For any* XP display component, it should show current XP, required XP for next level, and current level.

**Validates: Requirements 2.4**

### Property 7: Progressive XP Scaling

*For any* level N in the level thresholds array, the XP required for level N+1 should be greater than the XP required for level N.

**Validates: Requirements 2.5**

### Property 8: Achievement Unlock and Celebration

*For any* user state that meets an achievement's criteria, the achievement should be unlocked and a celebration modal should be triggered with the achievement details.

**Validates: Requirements 3.1, 3.2**

### Property 9: Locked Achievement Display

*For any* achievement that is not unlocked, it should be displayed with locked visual state and include unlock requirement information.

**Validates: Requirements 3.3**

### Property 10: Achievement Collection Completeness

*For any* user, the achievement collection display should include all achievements they have unlocked.

**Validates: Requirements 3.4**

### Property 11: Achievement Category Support

*For any* achievement definition, it should have a valid category from the set (streak, lessons, social, special events).

**Validates: Requirements 3.5**

### Property 12: Daily Goal Persistence

*For any* daily goal that is created, it should be stored with target value and progress tracking should update the current value correctly.

**Validates: Requirements 4.1, 4.2**

### Property 13: Goal Completion Rewards

*For any* daily goal that reaches 100% completion, it should be marked as complete and award the specified XP bonus.

**Validates: Requirements 4.3**

### Property 14: Daily Goal Reset

*For any* new day, daily goals from the previous day should not be active, and new goals should be generated for the current day.

**Validates: Requirements 4.4**

### Property 15: Goal Difficulty Levels

*For any* daily goal, it should have a difficulty level of easy, medium, or hard.

**Validates: Requirements 4.5**

### Property 16: Leaderboard Ranking Correctness

*For any* set of users with weekly XP totals, the leaderboard rankings should be ordered from highest to lowest XP, with correct rank positions assigned.

**Validates: Requirements 5.1, 5.2**

### Property 17: Rank Change Animation Trigger

*For any* user whose rank improves from one update to the next, a rank-up animation should be triggered.

**Validates: Requirements 5.3**

### Property 18: Leaderboard Type Support

*For any* leaderboard query, it should support filtering by type (friends, global, squad).

**Validates: Requirements 5.4**

### Property 19: Leaderboard Entry Completeness

*For any* leaderboard entry, it should include user avatar, name, XP, and rank position.

**Validates: Requirements 5.5**

### Property 20: Lesson Completion Celebration

*For any* completed lesson, a full-screen celebration should be triggered with the lesson completion type.

**Validates: Requirements 6.1**

### Property 21: Celebration Data Completeness

*For any* celebration, it should include XP earned, current streak status, and any newly unlocked achievements.

**Validates: Requirements 6.2**

### Property 22: Celebration Sequencing

*For any* set of multiple celebrations triggered simultaneously, they should be queued and played in sequence rather than overlapping.

**Validates: Requirements 6.3**

### Property 23: Celebration Intensity Levels

*For any* celebration, it should have an intensity level that corresponds to the significance of the achievement.

**Validates: Requirements 6.4**

### Property 24: Celebration Skip Functionality

*For any* playing celebration, the user should be able to skip or fast-forward it.

**Validates: Requirements 6.5**

### Property 25: Progress Animation Triggers

*For any* progress value change, an animation should be triggered from the old value to the new value.

**Validates: Requirements 7.2**

### Property 26: Progress Color Mapping

*For any* progress percentage, the color should map correctly to the appropriate level (low, medium, high, complete).

**Validates: Requirements 7.3**

### Property 27: Completion Animation Trigger

*For any* progress that reaches exactly 100%, a completion animation should be triggered.

**Validates: Requirements 7.5**

### Property 28: Glassmorphism Blur Range

*For any* glassmorphism effect, the blur radius should be within the valid range for the specified intensity level.

**Validates: Requirements 8.2**

### Property 29: Interaction Animation Triggers

*For any* user interaction with an interactive UI element, an appropriate micro-animation should be triggered.

**Validates: Requirements 9.1**

### Property 30: Reduced Motion Accessibility

*For any* animation, if the system's reduced motion setting is enabled, animations should be disabled or simplified.

**Validates: Requirements 9.5**

### Property 31: Theme Consistency

*For any* theme mode (light or dark), all glassmorphism effects should use the appropriate tint colors, opacity values, and shadow styles for that mode.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 32: Theme Persistence

*For any* theme preference change, the new preference should be persisted and restored in subsequent app sessions.

**Validates: Requirements 10.4**

### Property 33: Auto-Theme System Sync

*For any* system theme change, if auto-theme is enabled, the app theme should update to match the system theme.

**Validates: Requirements 10.5**

### Property 34: Performance Degradation Gracefully

*For any* device with limited performance, glassmorphism effects should degrade gracefully while maintaining UI usability.

**Validates: Requirements 11.3**

### Property 35: Responsive Layout Adaptation

*For any* screen size, UI layouts should adapt appropriately to fit the available space.

**Validates: Requirements 11.4**

### Property 36: Input Type Handling

*For any* input type (touch or mouse), the appropriate interaction patterns should be applied.

**Validates: Requirements 11.5**

### Property 37: Visible Element Blur Optimization

*For any* glassmorphism effect, blur should only be applied to elements that are currently visible in the viewport.

**Validates: Requirements 12.1**

### Property 38: Asset Lazy Loading

*For any* heavy visual asset (celebration animations, large images), it should not be loaded until it is needed for display.

**Validates: Requirements 12.4**

## Error Handling

### Glassmorphism Fallbacks

**Platform Compatibility**:
- Web: Check for `backdrop-filter` support, fall back to solid backgrounds with opacity
- Android: Use semi-transparent backgrounds with elevation shadows if blur is unavailable
- iOS: Use native `BlurView` component

**Error States**:
```typescript
function getGlassStyle(intensity: 'light' | 'medium' | 'heavy'): ViewStyle {
  if (Platform.OS === 'web' && !supportsBackdropFilter()) {
    return getFallbackStyle(intensity);
  }
  if (Platform.OS === 'android' && !supportsBlur()) {
    return getAndroidFallbackStyle(intensity);
  }
  return getGlassStyleForPlatform(intensity);
}
```

### Animation Error Handling

**Performance Degradation**:
- Monitor frame rate during animations
- Automatically reduce animation complexity if FPS drops below 30
- Provide manual setting to disable animations

**Accessibility**:
- Respect `prefers-reduced-motion` system setting
- Provide in-app toggle for animations
- Ensure all functionality works without animations

### Data Synchronization Errors

**Achievement Unlock Failures**:
- Queue achievement unlocks locally if network fails
- Retry on next app launch
- Show cached achievements immediately, sync in background

**Leaderboard Update Failures**:
- Display last known rankings with timestamp
- Show "updating..." indicator during refresh
- Gracefully handle missing user data

**Celebration Trigger Failures**:
- Log celebration events even if display fails
- Allow manual replay of missed celebrations
- Never block core functionality due to celebration errors

## Testing Strategy

### Unit Testing

Unit tests will verify specific examples, edge cases, and error conditions for individual components and services.

**Focus Areas**:
- Component rendering with different props
- Service function return values
- Error handling paths
- Edge cases (empty states, maximum values, null data)

**Example Unit Tests**:
```typescript
describe('StreakDisplay', () => {
  it('should display warning state when streak is at risk', () => {
    const { getByText } = render(
      <StreakDisplay streak={5} isAtRisk={true} freezeCount={2} />
    );
    expect(getByText('💀')).toBeTruthy();
  });

  it('should show freeze count correctly', () => {
    const { getByText } = render(
      <StreakDisplay streak={10} isAtRisk={false} freezeCount={3} />
    );
    expect(getByText(/3/)).toBeTruthy();
  });
});

describe('gamificationService', () => {
  it('should unlock achievement when criteria met', async () => {
    const achievement = await checkAchievements(userId, {
      type: 'streak_updated',
      streak: 7,
    });
    expect(achievement).toContainEqual(
      expect.objectContaining({ achievementId: 'streak_7_days' })
    );
  });

  it('should handle missing user gracefully', async () => {
    await expect(
      getUserAchievements('invalid-user-id')
    ).rejects.toThrow();
  });
});
```

### Property-Based Testing

Property tests will verify universal properties across all inputs using randomized test data. Each property test should run a minimum of 100 iterations.

**Property Test Configuration**:
- Use `fast-check` library for TypeScript/JavaScript
- Minimum 100 iterations per test
- Tag each test with feature name and property number

**Example Property Tests**:
```typescript
import fc from 'fast-check';

describe('Property Tests: duolingo-glassmorphism-ui', () => {
  // Feature: duolingo-glassmorphism-ui, Property 1: Streak State Transitions
  it('should increment streak on goal completion and reset on break', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 365 }), // current streak
        fc.integer({ min: 0, max: 365 }), // longest streak
        fc.boolean(), // has freeze
        (currentStreak, longestStreak, hasFreeze) => {
          // Test increment
          const afterCompletion = incrementStreakLogic(currentStreak);
          expect(afterCompletion).toBe(currentStreak + 1);

          // Test break
          const afterBreak = breakStreakLogic(
            currentStreak,
            longestStreak,
            hasFreeze
          );
          if (hasFreeze) {
            expect(afterBreak.current).toBe(currentStreak);
          } else {
            expect(afterBreak.current).toBe(0);
            expect(afterBreak.longest).toBe(
              Math.max(longestStreak, currentStreak)
            );
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: duolingo-glassmorphism-ui, Property 7: Progressive XP Scaling
  it('should have increasing XP requirements for each level', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: PILLAR_LEVEL_THRESHOLDS.length - 2 }),
        (levelIndex) => {
          const currentThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex];
          const nextThreshold = PILLAR_LEVEL_THRESHOLDS[levelIndex + 1];
          expect(nextThreshold).toBeGreaterThan(currentThreshold);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: duolingo-glassmorphism-ui, Property 16: Leaderboard Ranking Correctness
  it('should rank users correctly by XP', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            userId: fc.uuid(),
            username: fc.string(),
            weeklyXp: fc.integer({ min: 0, max: 10000 }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        (users) => {
          const ranked = rankLeaderboard(users);
          
          // Check ordering
          for (let i = 0; i < ranked.length - 1; i++) {
            expect(ranked[i].weeklyXp).toBeGreaterThanOrEqual(
              ranked[i + 1].weeklyXp
            );
          }
          
          // Check rank assignment
          ranked.forEach((user, index) => {
            expect(user.rank).toBe(index + 1);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: duolingo-glassmorphism-ui, Property 26: Progress Color Mapping
  it('should map progress percentages to correct colors', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (progress) => {
          const color = getProgressColor(progress);
          
          if (progress < 25) {
            expect(color).toBe(colors.progressLow);
          } else if (progress < 50) {
            expect(color).toBe(colors.progressMedium);
          } else if (progress < 100) {
            expect(color).toBe(colors.progressHigh);
          } else {
            expect(color).toBe(colors.progressComplete);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: duolingo-glassmorphism-ui, Property 31: Theme Consistency
  it('should apply consistent glassmorphism styles for each theme', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light', 'medium', 'heavy'),
        fc.boolean(), // isDark
        (intensity, isDark) => {
          const style = getGlassStyle(intensity, isDark);
          
          // Check tint color matches theme
          if (isDark) {
            expect(style.backgroundColor).toContain('rgba(0, 0, 0');
          } else {
            expect(style.backgroundColor).toContain('rgba(255, 255, 255');
          }
          
          // Check blur amount is appropriate for intensity
          const blurAmount = extractBlurAmount(style);
          if (intensity === 'light') {
            expect(blurAmount).toBeLessThan(15);
          } else if (intensity === 'heavy') {
            expect(blurAmount).toBeGreaterThan(20);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests will verify that components work together correctly:

- Streak increment triggers celebration when milestone reached
- XP award triggers level-up celebration when threshold crossed
- Achievement unlock triggers celebration modal display
- Theme changes propagate to all glassmorphism components
- Leaderboard updates reflect in real-time across components

### Visual Regression Testing

For glassmorphism effects and animations:
- Capture screenshots of glass components in light/dark modes
- Compare against baseline images
- Verify blur effects render correctly on different platforms
- Test animation keyframes and transitions

### Performance Testing

- Measure FPS during complex animations
- Monitor memory usage with multiple celebrations
- Test blur rendering performance on low-end devices
- Verify lazy loading reduces initial bundle size

## Implementation Notes

### Cross-Platform Considerations

**Web (PWA)**:
- Use CSS `backdrop-filter: blur()` for glassmorphism
- Provide fallback for browsers without support (Safari < 14)
- Use CSS animations for better performance
- Implement service worker caching for celebration assets

**iOS**:
- Use `@react-native-community/blur` for native blur
- Leverage `UIVisualEffectView` for best performance
- Use `react-native-reanimated` for 60fps animations
- Test on older devices (iPhone 8, iPhone X)

**Android**:
- Use `BlurView` with RenderScript backend
- Provide fallback for devices without RenderScript
- Optimize blur radius for performance
- Test on various Android versions (8.0+)

### Performance Optimization Strategies

1. **Blur Optimization**:
   - Only apply blur to visible elements
   - Use lower blur radius on low-end devices
   - Cache blur views when possible
   - Disable blur during scrolling

2. **Animation Optimization**:
   - Use `useNativeDriver: true` for all animations
   - Animate only transform and opacity properties
   - Batch animation updates
   - Cancel animations when components unmount

3. **Asset Loading**:
   - Lazy load celebration animations
   - Preload critical assets during splash screen
   - Use progressive image loading
   - Implement asset caching strategy

4. **Memory Management**:
   - Clean up animation listeners
   - Dispose of unused celebration assets
   - Limit concurrent animations
   - Monitor memory usage in production

### Accessibility Considerations

- Respect `prefers-reduced-motion` system setting
- Provide alternative text for all visual elements
- Ensure sufficient color contrast in all themes
- Support screen readers for all interactive elements
- Provide keyboard navigation for web platform
- Test with VoiceOver (iOS) and TalkBack (Android)

### Localization

All gamification text should support internationalization:
- Achievement titles and descriptions
- Celebration messages
- Daily goal descriptions
- Leaderboard labels
- Error messages

Use existing i18n infrastructure with new translation keys:
```typescript
// locales/en/translation.json
{
  "gamification": {
    "streak": {
      "title": "Day Streak",
      "at_risk": "At Risk!",
      "milestone_7": "7 Day Streak!",
      "milestone_30": "30 Day Streak!",
      "milestone_100": "100 Day Streak!"
    },
    "achievements": {
      "unlocked": "Achievement Unlocked!",
      "locked": "Locked",
      "view_all": "View All Achievements"
    },
    "celebrations": {
      "lesson_complete": "Lesson Complete!",
      "level_up": "Level Up!",
      "skip": "Skip",
      "continue": "Continue"
    }
  }
}
```

### Migration Strategy

Since this is a new feature being added to an existing app:

1. **Phase 1: Core Components** (Week 1-2)
   - Implement glassmorphism base components
   - Add theme service enhancements
   - Create animation hooks

2. **Phase 2: Gamification Services** (Week 2-3)
   - Implement achievement system
   - Add daily goals functionality
   - Create celebration service

3. **Phase 3: UI Integration** (Week 3-4)
   - Enhance existing screens with glass effects
   - Add celebration modals
   - Integrate achievement displays

4. **Phase 4: Polish & Testing** (Week 4-5)
   - Performance optimization
   - Cross-platform testing
   - Accessibility improvements
   - Bug fixes

### Feature Flags

Use feature flags to gradually roll out the new UI:
```typescript
const FEATURE_FLAGS = {
  GLASSMORPHISM_UI: true,
  CELEBRATION_ANIMATIONS: true,
  ACHIEVEMENT_SYSTEM: true,
  DAILY_GOALS: true,
};
```

This allows:
- A/B testing of new UI vs old UI
- Gradual rollout to user segments
- Quick rollback if issues arise
- Platform-specific enabling (e.g., disable on low-end Android)
