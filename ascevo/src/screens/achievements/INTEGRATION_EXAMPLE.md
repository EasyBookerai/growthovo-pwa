# AchievementsScreen Integration Example

This document shows how to integrate the AchievementsScreen into your navigation.

## Option 1: Add to ProfileScreen

Add a button in ProfileScreen to navigate to achievements:

```tsx
// In ProfileScreen.tsx
<TouchableOpacity
  style={styles.achievementsButton}
  onPress={() => navigation.navigate('Achievements')}
>
  <Text style={styles.buttonText}>🏆 View Achievements</Text>
</TouchableOpacity>
```

## Option 2: Add to App.tsx Navigation

Add the AchievementsScreen to your stack navigator:

```tsx
// In App.tsx
import AchievementsScreen from './src/screens/achievements/AchievementsScreen';

// Inside your Stack.Navigator
<Stack.Screen name="Achievements">
  {(props) => <AchievementsScreen userId={userId} />}
</Stack.Screen>
```

## Option 3: Add as Tab (Alternative)

If you want achievements as a main tab:

```tsx
// In App.tsx MainTabs component
<Tab.Screen name="Achievements">
  {() => <AchievementsScreen userId={userId} />}
</Tab.Screen>
```

## Usage Example

The screen is fully self-contained and only requires a userId prop:

```tsx
<AchievementsScreen userId="user-123" />
```

## Features Implemented

✅ Display all achievements in grid layout
✅ Show unlocked badges with unlock dates
✅ Show locked badges with requirements
✅ Filter by category (all, streak, lessons, social, special)
✅ Badge detail modal with unlock information
✅ Progress tracking (X/Y unlocked, percentage)
✅ Glassmorphism UI with theme support
✅ Responsive grid layout (3 columns)
✅ Accessibility support

## Requirements Satisfied

- **Requirement 3.2**: Achievement unlock celebration and display
- **Requirement 3.3**: Locked badge display with requirements
- **Requirement 3.4**: Achievement collection display
- **Requirement 3.5**: Category filtering support

## Testing

Run tests with:
```bash
npm test AchievementsScreen
```

All tests are passing ✅
