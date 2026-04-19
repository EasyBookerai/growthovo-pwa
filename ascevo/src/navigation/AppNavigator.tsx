import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Screens
import SimpleHomeScreen from '../screens/home/SimpleHomeScreen';
import PillarsScreen from '../screens/pillars/PillarsScreen';
import RexScreen from '../screens/rex/RexScreen';
import SimpleLeagueScreen from '../screens/league/SimpleLeagueScreen';
import SimpleProfileScreen from '../screens/profile/SimpleProfileScreen';

const Tab = createBottomTabNavigator();

interface Props {
  userId: string;
  subscriptionStatus: string;
}

export default function AppNavigator({ userId, subscriptionStatus }: Props) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.3)',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          let emoji = '';
          switch (route.name) {
            case 'Home': emoji = '🏠'; break;
            case 'Pillars': emoji = '🎯'; break;
            case 'Rex': emoji = '💬'; break;
            case 'League': emoji = '🏆'; break;
            case 'Profile': emoji = '👤'; break;
          }
          return <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home">
        {(props) => <SimpleHomeScreen userId={userId} subscriptionStatus={subscriptionStatus} {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Pillars">
        {(props) => <PillarsScreen userId={userId} subscriptionStatus={subscriptionStatus} {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Rex">
        {(props) => <RexScreen userId={userId} subscriptionStatus={subscriptionStatus} {...props} />}
      </Tab.Screen>
      <Tab.Screen name="League">
        {(props) => <SimpleLeagueScreen userId={userId} {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <SimpleProfileScreen userId={userId} {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0F0F1A',
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
