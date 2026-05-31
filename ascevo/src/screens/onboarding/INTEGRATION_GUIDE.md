# NewOnboardingScreen Integration Guide

## Overview

The `NewOnboardingScreen` component implements the 5-screen swipeable onboarding flow as specified in the Growthovo World-Class Experience feature requirements.

## Features Implemented (Task 1.1)

- ✅ 5 swipeable screens using FlatList horizontal pagination
- ✅ localStorage check to skip onboarding if already completed
- ✅ Skip button in top-right corner on all screens
- ✅ Skip button navigates directly to Screen 5
- ✅ Screen 1: Welcome with placeholder for egg hatching animation
- ✅ Screen 2: Feature highlights (3 features)
- ✅ Screen 3: Pillar selection (multi-select, minimum 1 required)
- ✅ Screen 4: Time commitment selection (4 radio options)
- ✅ Screen 5: Name input (20 char max) and avatar color selection (6 colors)

## Integration with App.tsx

To integrate this new onboarding screen, replace the existing `QuizFlow` in `App.tsx`:

### Before:
```tsx
import QuizFlow from './src/screens/onboarding/QuizFlow';

// In the render:
<Stack.Screen name="Onboarding">
  {() => (
    <QuizFlow
      userId={userId}
      onComplete={handleOnboardingComplete}
    />
  )}
</Stack.Screen>
```

### After:
```tsx
import NewOnboardingScreen from './src/screens/onboarding/NewOnboardingScreen';

// In the render:
<Stack.Screen name="Onboarding">
  {() => (
    <NewOnboardingScreen
      onComplete={handleOnboardingComplete}
    />
  )}
</Stack.Screen>
```

## Data Storage

The component saves the following data to AsyncStorage:

- `@growthovo:onboarding_complete`: `'true'` when onboarding is completed
- `@growthovo:selected_pillars`: JSON array of selected pillar keys
- `@growthovo:time_commitment`: Selected time commitment string
- `@growthovo:user_name`: User's entered name
- `@growthovo:avatar_color`: Selected avatar color hex code

## Accessing Saved Data

To retrieve the onboarding data in other components:

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if onboarding is complete
const isComplete = await AsyncStorage.getItem('@growthovo:onboarding_complete');

// Get selected pillars
const pillarsJson = await AsyncStorage.getItem('@growthovo:selected_pillars');
const selectedPillars = pillarsJson ? JSON.parse(pillarsJson) : [];

// Get user name
const userName = await AsyncStorage.getItem('@growthovo:user_name');

// Get avatar color
const avatarColor = await AsyncStorage.getItem('@growthovo:avatar_color');

// Get time commitment
const timeCommitment = await AsyncStorage.getItem('@growthovo:time_commitment');
```

## Next Steps

The following tasks will enhance this onboarding screen:

- **Task 1.2**: Implement egg hatching animation on Screen 1
- **Task 1.3**: Enhance Screen 2 feature highlights
- **Task 1.4**: Enhance Screen 3 pillar selection
- **Task 1.5**: Enhance Screen 4 time commitment
- **Task 1.6**: Enhance Screen 5 with AppContext integration

## Testing

Run the tests with:

```bash
npm test -- NewOnboardingScreen.test.tsx
```

## Requirements Validated

- ✅ Requirement 1.1: localStorage check to skip onboarding
- ✅ Requirement 1.2: 5 swipeable screens in sequential order
- ✅ Requirement 1.3: Skip button in top-right corner
- ✅ Requirement 1.4: Skip button navigates to Screen 5
- ✅ Requirement 1.19: Save selections to localStorage
- ✅ Requirement 1.20: Mark onboarding as complete
- ✅ Requirement 1.21: Navigate to Home screen on completion
