import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SpeakingHomeScreen from './SpeakingHomeScreen';
import RecordingScreen from './RecordingScreen';
import FeedbackScreen from './FeedbackScreen';
import ProgressDashboard from './ProgressDashboard';

const Stack = createNativeStackNavigator();

interface SpeakingNavigatorProps {
  userId: string;
  subscriptionStatus: string;
  language: string;
}

export default function SpeakingNavigator({
  userId,
  subscriptionStatus,
  language,
}: SpeakingNavigatorProps) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SpeakingHome">
        {(props) => (
          <SpeakingHomeScreen
            {...props}
            route={{
              ...props.route,
              params: {
                userId,
                subscriptionStatus,
                language,
              },
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="RecordingScreen" component={RecordingScreen} />
      <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
      <Stack.Screen name="ProgressDashboard" component={ProgressDashboard} />
    </Stack.Navigator>
  );
}
