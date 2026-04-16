# Gamification Components

This directory contains UI components for the Duolingo-style gamification system, including streak tracking, XP display, achievements, and celebrations.

## Components

### StreakDisplay

Enhanced streak display component with fire animations and milestone celebrations.

#### Features

- **Animated Fire Emoji**: Continuous pulse animation for visual engagement
- **Warning State**: Displays skull emoji and warning when streak is at risk
- **Freeze Indicator**: Shows available streak freezes with snowflake badge
- **Two Variants**: Compact for inline display, expanded for detail screens
- **Milestone Celebrations**: Special banners for 7, 30, 100, and 365 day streaks
- **Accessibility**: Full screen reader support with descriptive labels

#### Props

```typescript
interface StreakDisplayProps {
  streak: number;           // Current streak count
  isAtRisk: boolean;        // Whether streak is at risk (no activity today)
  freezeCount: number;      // Number of available streak freezes
  onPress?: () => void;     // Optional press handler
  variant?: 'compact' | 'expanded'; // Display variant (default: 'compact')
}
```

#### Usage

**Compact Variant (HomeScreen)**
```tsx
import StreakDisplay from './components/gamification/StreakDisplay';

<StreakDisplay
  streak={15}
  isAtRisk={false}
  freezeCount={2}
  variant="compact"
  onPress={() => navigation.navigate('StreakDetails')}
/>
```

**Expanded Variant (Details Screen)**
```tsx
<StreakDisplay
  streak={30}
  isAtRisk={false}
  freezeCount={3}
  variant="expanded"
  onPress={() => navigation.navigate('StreakHistory')}
/>
```

**At-Risk Warning**
```tsx
<StreakDisplay
  streak={7}
  isAtRisk={true}
  freezeCount={1}
  variant="compact"
  onPress={() => showStreakRecoveryModal()}
/>
```

#### Visual States

1. **Normal State**: Fire emoji (🔥) with orange color
2. **At-Risk State**: Skull emoji (💀) with red color and warning label
3. **Milestone State**: Special celebration banner (7, 30, 100, 365 days)
4. **With Freezes**: Snowflake badge showing available freezes

#### Integration with Existing Services

The component integrates with the existing `streakService`:

```typescript
import { getStreak } from '../../services/streakService';

// Fetch streak data
const streakData = await getStreak(userId);

// Check if at risk (no activity today)
const today = new Date().toISOString().split('T')[0];
const isAtRisk = streakData.last_activity_date !== today;

// Render component
<StreakDisplay
  streak={streakData.current_streak}
  isAtRisk={isAtRisk}
  freezeCount={streakData.freeze_count}
  variant="compact"
/>
```

#### Animations

- **Pulse Animation**: Fire emoji scales from 1.0 to 1.2 and back in 1.6s cycles
- **Spring Physics**: Uses React Native Reanimated for smooth, native animations
- **Performance**: GPU-accelerated transforms for 60fps on all platforms

#### Accessibility

- **Screen Reader**: Descriptive labels like "15 day streak, at risk"
- **Accessibility Hint**: "Tap to view streak details"
- **Role**: Properly marked as "button" when interactive
- **Reduced Motion**: Respects system accessibility settings

#### Testing

Unit tests cover:
- Rendering both variants correctly
- Displaying correct emoji based on at-risk state
- Showing freeze count badge
- Milestone detection (7, 30, 100, 365 days)
- Press handler functionality
- Accessibility labels and hints
- Edge cases (zero streak, large numbers)

Run tests:
```bash
npm test -- StreakDisplay.test.tsx
```

#### Requirements Validated

- **1.1**: Streak count display with fire animation
- **1.2**: Visual feedback for streak status
- **1.4**: At-risk warning indicator

#### Future Enhancements

- [ ] Sound effects for milestone celebrations
- [ ] Haptic feedback on press
- [ ] Animated transitions between states
- [ ] Streak history graph
- [ ] Social sharing for milestones

---

### XPBar

Animated XP progress bar component with level display and smooth fill animations.

#### Features

- **Smooth Fill Animation**: Uses `useProgressAnimation` hook for fluid transitions
- **Gradient Progress Bar**: Customizable gradient colors for visual appeal
- **Level Badge**: Circular badge displaying current level
- **Overflow Animation**: Special visual effect when ready to level up
- **Cross-Platform**: Works on web, iOS, and Android with platform-specific optimizations
- **Accessibility**: Full screen reader support and keyboard navigation

#### Props

```typescript
interface XPBarProps {
  currentXP: number;        // Current XP amount
  requiredXP: number;       // XP required for next level
  level: number;            // Current level
  animated?: boolean;       // Enable/disable animation (default: true)
  showLabel?: boolean;      // Show XP label (default: true)
  gradient?: [string, string]; // Custom gradient colors (default: gold)
  onPress?: () => void;     // Optional press handler
}
```

#### Usage

**Basic Usage**
```tsx
import XPBar from './components/gamification/XPBar';

<XPBar
  currentXP={150}
  requiredXP={250}
  level={3}
/>
```

**Custom Gradient (Pillar-Specific)**
```tsx
import { colors } from '../../theme';

<XPBar
  currentXP={450}
  requiredXP={500}
  level={5}
  gradient={[colors.pillars.mind, '#6D28D9']}
  onPress={() => navigation.navigate('PillarProgress', { pillarId: 'mind' })}
/>
```

**Without Label (Compact View)**
```tsx
<XPBar
  currentXP={180}
  requiredXP={250}
  level={4}
  showLabel={false}
/>
```

**Level-Up State**
```tsx
<XPBar
  currentXP={250}
  requiredXP={250}
  level={4}
  // Shows "🎉 Ready to level up!" indicator
/>
```

#### Visual States

1. **Normal Progress**: Smooth animated fill from 0-99%
2. **Level-Up Ready**: Glowing effect and celebration indicator at 100%+
3. **Overflow State**: Handles XP exceeding requirement gracefully
4. **Animating**: Shine effect during progress transitions

#### Integration with Existing Services

The component integrates with the existing `progressService`:

```typescript
import { getUserPillarProgress } from '../../services/progressService';
import { PILLAR_LEVEL_THRESHOLDS } from '../../types';

// Fetch user progress
const progress = await getUserPillarProgress(userId, pillarId);

// Calculate current level and XP
const level = progress.level;
const currentXP = progress.xp;
const requiredXP = PILLAR_LEVEL_THRESHOLDS[level];

// Render component
<XPBar
  currentXP={currentXP}
  requiredXP={requiredXP}
  level={level}
  gradient={[getPillarColor(pillarId), darkenColor(getPillarColor(pillarId))]}
/>
```

#### Animations

- **Progress Fill**: Smooth timing animation over 500ms
- **Shine Effect**: Subtle shimmer during active animation
- **Level-Up Glow**: Pulsing shadow effect when ready to level up
- **Performance**: Uses React Native Reanimated for native performance

#### Accessibility

- **Screen Reader**: Announces "Level 3, 150 of 250 XP"
- **Accessibility Role**: Properly marked as "button" when interactive
- **Reduced Motion**: Respects system accessibility settings
- **Keyboard Navigation**: Full keyboard support on web platform

#### Testing

Unit tests cover:
- Rendering with current XP, required XP, and level
- Label visibility toggle
- Level-up indicator display
- Custom gradient colors
- Zero and maximum XP edge cases
- Overflow XP handling
- Animation enable/disable
- Press handler functionality

Run tests:
```bash
npm test -- XPBar.test.tsx
```

#### Requirements Validated

- **2.2**: XP accumulation and level progression display
- **2.4**: Shows current XP, required XP, and current level
- **7.2**: Animated progress bar with smooth transitions

#### Example Scenarios

See `XPBar.example.tsx` for comprehensive usage examples including:
- Interactive XP addition
- Different progress states (0%, 50%, 95%, 100%+)
- Custom gradients for different pillars
- Multiple XP bars for different pillars
- With and without labels
- With and without animations

#### Future Enhancements

- [ ] Particle effects for level-up
- [ ] Sound effects for XP gain
- [ ] Haptic feedback on level-up
- [ ] XP gain animation (numbers flying up)
- [ ] Historical XP graph

---

### ProgressRing

Circular progress indicator component using SVG with animated stroke drawing.

#### Features

- **SVG-Based**: Uses React Native SVG for crisp, scalable graphics
- **Animated Stroke**: Smooth circular progress animation
- **Customizable**: Size, stroke width, colors fully configurable
- **Center Content**: Supports children elements in the center
- **Cross-Platform**: Works seamlessly on web, iOS, and Android
- **Performance**: GPU-accelerated animations for smooth 60fps

#### Props

```typescript
interface ProgressRingProps {
  progress: number;         // Progress value from 0-1 (0% to 100%)
  size: number;             // Diameter of the ring in pixels
  strokeWidth: number;      // Width of the progress stroke
  color: string;            // Color of the progress stroke
  backgroundColor?: string; // Color of the background track (default: rgba(255,255,255,0.1))
  children?: React.ReactNode; // Content to display in center
  animated?: boolean;       // Enable/disable animation (default: true)
  style?: ViewStyle;        // Additional container styles
}
```

#### Usage

**Basic Progress Ring**
```tsx
import ProgressRing from './components/gamification/ProgressRing';
import { colors } from '../../theme';

<ProgressRing
  progress={0.75}
  size={120}
  strokeWidth={10}
  color={colors.primary}
/>
```

**With Text Content**
```tsx
<ProgressRing
  progress={0.65}
  size={140}
  strokeWidth={12}
  color={colors.success}
>
  <Text style={styles.percentage}>65%</Text>
  <Text style={styles.label}>Complete</Text>
</ProgressRing>
```

**Daily Goal Tracker**
```tsx
<ProgressRing
  progress={lessonsCompleted / dailyGoal}
  size={160}
  strokeWidth={14}
  color={colors.xpGold}
  backgroundColor="rgba(245, 158, 11, 0.15)"
>
  <Text style={styles.value}>{lessonsCompleted}/{dailyGoal}</Text>
  <Text style={styles.label}>Lessons</Text>
</ProgressRing>
```

**XP Progress to Next Level**
```tsx
<ProgressRing
  progress={currentXP / requiredXP}
  size={180}
  strokeWidth={16}
  color={colors.xpGold}
>
  <Text style={styles.xp}>{currentXP}</Text>
  <Text style={styles.xpLabel}>/ {requiredXP} XP</Text>
  <Text style={styles.level}>Level {level}</Text>
</ProgressRing>
```

**Without Animation**
```tsx
<ProgressRing
  progress={0.5}
  size={100}
  strokeWidth={8}
  color={colors.info}
  animated={false}
/>
```

#### Visual States

1. **Empty (0%)**: Only background track visible
2. **In Progress (1-99%)**: Animated stroke drawing clockwise from top
3. **Complete (100%)**: Full circle with optional completion animation
4. **Animating**: Smooth transition when progress value changes

#### Integration Examples

**With Daily Goals**
```typescript
import { getDailyGoals } from '../../services/gamificationService';

const goals = await getDailyGoals(userId);
const goal = goals[0];
const progress = goal.currentValue / goal.targetValue;

<ProgressRing
  progress={progress}
  size={140}
  strokeWidth={12}
  color={colors.xpGold}
>
  <Text>{goal.currentValue}/{goal.targetValue}</Text>
  <Text>{goal.title}</Text>
</ProgressRing>
```

**With Lesson Progress**
```typescript
const pillarProgress = await getUserPillarProgress(userId, pillarId);
const completedLessons = pillarProgress.completed_lessons;
const totalLessons = pillarProgress.total_lessons;

<ProgressRing
  progress={completedLessons / totalLessons}
  size={120}
  strokeWidth={10}
  color={getPillarColor(pillarId)}
>
  <Text>{completedLessons}/{totalLessons}</Text>
  <Text>Lessons</Text>
</ProgressRing>
```

#### Animations

- **Stroke Drawing**: Smooth circular animation using `strokeDashoffset`
- **Duration**: 500ms default animation duration
- **Easing**: Uses timing animation for consistent progress
- **Performance**: Leverages React Native Reanimated for native performance
- **Direction**: Clockwise from top (12 o'clock position)

#### Accessibility

- **Children Content**: Ensure text children have proper accessibility labels
- **Progress Announcements**: Use `accessibilityValue` for screen readers
- **Reduced Motion**: Respects system accessibility settings via `animated` prop

#### Testing

Unit tests cover:
- Basic rendering with required props
- Children content display in center
- Progress clamping (0-1 range)
- Custom background color
- Animation enable/disable
- Custom styles
- Edge cases (0%, 100%)
- Different sizes and stroke widths
- Different colors
- Multiple children elements

Run tests:
```bash
npm test -- ProgressRing.test.tsx
```

#### Requirements Validated

- **7.2**: Animated progress visualization with smooth transitions
- **7.3**: Color gradients to indicate progress levels

#### Example Scenarios

See `ProgressRing.example.tsx` for comprehensive usage examples including:
- Basic progress ring
- With text content
- Daily goal tracker
- Animated progress updates
- Different sizes (small, medium, large)
- Different colors (success, warning, error)
- XP progress display
- Interactive progress control
- Without animation

#### Technical Details

**SVG Circle Calculation**
```typescript
const radius = (size - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;
const strokeDashoffset = circumference * (1 - progress);
```

**Animation Implementation**
- Uses `useProgressAnimation` hook for smooth transitions
- Animates `strokeDashoffset` from circumference to 0
- Rotates circle -90° to start from top
- Uses `strokeLinecap="round"` for smooth ends

**Platform Compatibility**
- **Web**: Uses SVG with CSS transforms
- **iOS**: Native SVG rendering via react-native-svg
- **Android**: Native SVG rendering via react-native-svg
- **Performance**: Hardware-accelerated on all platforms

#### Future Enhancements

- [ ] Gradient stroke colors
- [ ] Multiple progress rings (nested)
- [ ] Completion animation (confetti, pulse)
- [ ] Sound effects for milestones
- [ ] Haptic feedback on completion
- [ ] Custom start angle
- [ ] Counter-clockwise direction option

---

### LeaderboardCard

Enhanced leaderboard display component with glassmorphism effects and rank-up animations.

#### Features

- **Glassmorphism Design**: Uses GlassCard for premium frosted glass effect
- **Two Variants**: Compact (top 5) and full (all members) display modes
- **User Highlighting**: Current user row is visually highlighted
- **Rank-Up Animations**: Smooth scale animation when rank improves
- **Avatar Support**: Displays user avatars with fallback to initials
- **Interactive**: Optional press handler for member profiles
- **Rank Badges**: Medal emojis for top 3, numbers for others
- **XP Formatting**: Thousands separator for large XP values

#### Props

```typescript
interface LeaderboardCardProps {
  members: LeagueMember[];    // Array of league members with rankings
  currentUserId: string;      // ID of the current user for highlighting
  onMemberPress?: (userId: string) => void; // Optional callback when member is pressed
  variant?: 'compact' | 'full'; // Display variant (default: 'full')
}
```

#### Usage

**Full Leaderboard (LeagueScreen)**
```tsx
import LeaderboardCard from './components/gamification/LeaderboardCard';

<LeaderboardCard
  members={leagueMembers}
  currentUserId={userId}
  onMemberPress={(userId) => navigation.navigate('Profile', { userId })}
  variant="full"
/>
```

**Compact Leaderboard (HomeScreen)**
```tsx
<LeaderboardCard
  members={leagueMembers}
  currentUserId={userId}
  onMemberPress={(userId) => navigation.navigate('Profile', { userId })}
  variant="compact"
/>
```

**Without Interaction**
```tsx
<LeaderboardCard
  members={leagueMembers}
  currentUserId={userId}
  variant="full"
/>
```

#### Visual States

1. **Normal Row**: Semi-transparent background with subtle border
2. **Current User Row**: Highlighted with primary color border and tinted background
3. **Rank-Up Animation**: Scale animation (1.0 → 1.1 → 1.0) when rank improves
4. **Top 3 Ranks**: Gold (🥇), Silver (🥈), Bronze (🥉) medal emojis
5. **Other Ranks**: Numbered display (#4, #5, etc.)

#### Integration with Existing Services

The component integrates with the existing `leagueService`:

```typescript
import { getLeagueRankings } from '../../services/leagueService';
import LeaderboardCard from './components/gamification/LeaderboardCard';

// Fetch league rankings
const members = await getLeagueRankings(leagueId);

// Render component
<LeaderboardCard
  members={members}
  currentUserId={userId}
  onMemberPress={(userId) => {
    navigation.navigate('Profile', { userId });
  }}
  variant="full"
/>
```

#### Animations

- **Rank-Up Animation**: Triggered when member's rank improves (lower number)
- **Duration**: 400ms total (200ms scale up, 200ms scale down)
- **Scale**: 1.0 → 1.1 → 1.0
- **Performance**: Uses React Native Animated API with native driver
- **Detection**: Compares previous rank with current rank using useRef

#### Accessibility

- **Avatar Labels**: Descriptive labels like "Alice's avatar"
- **Profile Links**: Proper accessibility labels like "View Bob's profile"
- **Role**: Pressable rows marked as "button" when interactive
- **Screen Reader**: Full support for VoiceOver and TalkBack
- **Text Truncation**: Long usernames truncated with ellipsis

#### Testing

Unit tests cover:
- Rendering all members in full variant
- Rendering only top 5 in compact variant
- Rank emoji display (🥇, 🥈, 🥉, #4)
- XP formatting with thousands separator
- Avatar display with fallback to initials
- Current user highlighting
- "(you)" suffix for current user
- onMemberPress callback functionality
- Rank labels in full variant only
- "View All" link in compact variant
- Empty members array
- Single member
- Very long usernames
- Large XP values
- Accessibility labels

Run tests:
```bash
npm test -- LeaderboardCard.test.tsx
```

#### Requirements Validated

- **5.1**: Leaderboard displays rankings based on weekly XP totals
- **5.5**: Shows user avatar, name, XP, and rank position

#### Example Scenarios

See `LeaderboardCard.example.tsx` for comprehensive usage examples including:
- Full variant with all members
- Compact variant with top 5 members
- Member press interaction
- Current user highlighting
- Members with and without avatars
- Different XP values
- Different rank positions

#### Variants Comparison

**Compact Variant**
- Shows top 5 members only
- No rank labels (just emoji/number)
- "View All" link when more than 5 members
- Ideal for HomeScreen or dashboard widgets

**Full Variant**
- Shows all members
- Includes rank labels ("Rank #1", "Rank #2")
- No "View All" link
- Ideal for dedicated LeagueScreen

#### Data Structure

```typescript
interface LeagueMember {
  id: string;           // Unique member ID
  leagueId: string;     // League ID
  userId: string;       // User ID
  username: string;     // Display name
  avatarUrl?: string;   // Optional avatar URL
  weeklyXp: number;     // Weekly XP total
  rank: number;         // Current rank position (1-based)
}
```

#### Styling Details

- **Container**: GlassCard with medium intensity blur
- **Row Background**: Semi-transparent white (5% opacity)
- **Row Border**: Semi-transparent white (10% opacity)
- **Current User Border**: Primary color, 2px width
- **Current User Background**: Primary color with 15% opacity
- **Avatar Size**: 40x40 pixels with rounded corners
- **Rank Width**: 40 pixels, center-aligned
- **XP Color**: Gold (#F59E0B)

#### Performance Considerations

- **Animation**: Uses native driver for 60fps performance
- **Image Loading**: Avatars loaded asynchronously
- **List Rendering**: Efficient FlatList-style rendering for large lists
- **Memoization**: Consider wrapping in React.memo for large member lists

#### Future Enhancements

- [ ] Real-time rank updates with WebSocket
- [ ] Promotion/relegation zone indicators
- [ ] Rank change indicators (↑ +2, ↓ -1)
- [ ] Weekly XP gain sparkline chart
- [ ] League tier badges (Bronze, Silver, Gold)
- [ ] Friend highlighting
- [ ] Squad member highlighting
- [ ] Rank history tooltip
- [ ] Share leaderboard screenshot
