import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, ActivityIndicator, AppState } from 'react-native';
import { supabase } from './src/services/supabaseClient';
import { registerPushToken, scheduleDefaultNotifications, scheduleMorningBriefingNotification, scheduleEveningDebriefNotification, scheduleWeeklyReportNotification } from './src/services/notificationService';
import { initI18n } from './src/services/i18nService';
import MorningBriefingGate from './src/components/MorningBriefingGate';
import EveningDebriefGate from './src/components/EveningDebriefGate';
import { useLanguageStore } from './src/store';
import { colors } from './src/theme';
import { syncWidgetData } from './src/services/widgetService';
import { initAssetLoading, preloadCriticalAssets } from './src/services/assetLoadingService';
import AppNavigator from './src/navigation/AppNavigator';
import { AppProvider } from './src/context/AppContext';

// Screens
import SignInScreen from './src/screens/auth/SignInScreen';
import SignUpScreen from './src/screens/auth/SignUpScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import QuizFlow from './src/screens/onboarding/QuizFlow';
import HomeScreen from './src/screens/home/HomeScreen';
import PillarsMapScreen from './src/screens/pillars/PillarsMapScreen';
import LeagueScreen from './src/screens/league/LeagueScreen';
import SquadScreen from './src/screens/squad/SquadScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import CheckInScreen from './src/screens/checkin/CheckInScreen';
import PaywallScreen from './src/screens/paywall/PaywallScreen';
import StreakBrokeScreen from './src/screens/relapse/StreakBrokeScreen';
import ComebackChallengeScreen from './src/screens/relapse/ComebackChallengeScreen';
import ComebackSuccessScreen from './src/screens/relapse/ComebackSuccessScreen';
import StartFreshScreen from './src/screens/relapse/StartFreshScreen';
import SpeakingNavigator from './src/screens/speaking/SpeakingNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Pillars: '🗺️',
  League: '🏆',
  Squad: '⚔️',
  Profile: '👤',
};

function MainTabs({ userId, subscriptionStatus, onPaywall }: {
  userId: string;
  subscriptionStatus: string;
  onPaywall: () => void;
}) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: route.name,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home">
        {(props) => (
          <HomeScreen 
            userId={userId} 
            subscriptionStatus={subscriptionStatus}
            onNavigateToStreakBroke={(streakCount) => 
              (props.navigation as any).navigate('StreakBroke', { streakCount })
            }
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Pillars">
        {() => (
          <PillarsMapScreen
            userId={userId}
            subscriptionStatus={subscriptionStatus}
            onPaywall={onPaywall}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="League">
        {() => <LeagueScreen userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Squad">
        {() => <SquadScreen userId={userId} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => (
          <ProfileScreen
            userId={userId}
            onOpenSettings={() => (props.navigation as any).navigate('Settings')}
            onOpenSpeaking={() => (props.navigation as any).navigate('Speaking')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [i18nReady, setI18nReady] = useState(false);
  const [authScreen, setAuthScreen] = useState<'signin' | 'signup'>('signin');
  const [showPaywall, setShowPaywall] = useState(false);

  const { setLanguage: setStoreLanguage } = useLanguageStore();

  // Initialise i18n BEFORE rendering any screens — prevents untranslated flash
  useEffect(() => {
    async function bootstrap() {
      try {
        // Get current session to pass userId for Supabase language sync
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const userId = currentSession?.user?.id;

        // Initialize asset loading service and preload critical assets
        await initAssetLoading();
        preloadCriticalAssets().catch((err) => {
          console.warn('[App] Failed to preload critical assets:', err);
        });

        // initI18n resolves: AsyncStorage → Supabase → device locale → 'en'
        const resolvedLanguage = await initI18n(userId);

        // Sync resolved language into Zustand store
        useLanguageStore.setState({ language: resolvedLanguage });

        setSession(currentSession);
        if (userId) {
          await loadProfile(userId);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('[App] Bootstrap error:', err);
        setLoading(false);
      } finally {
        setI18nReady(true);
      }
    }

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // On sign-in: check Supabase for user's language preference
        const { getLanguageFromSupabase } = await import('./src/services/languageService');
        const remoteLanguage = await getLanguageFromSupabase(session.user.id).catch(() => null);
        if (remoteLanguage) {
          await setStoreLanguage(remoteLanguage, session.user.id);
        }
        await loadProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync widget data whenever the app comes to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && session?.user?.id) {
        syncWidgetData(session.user.id).catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [session?.user?.id]);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    setUserProfile(data);
    setLoading(false);

    if (data?.onboarding_complete) {
      await registerPushToken(userId).catch(() => {});
    }
  }

  async function handleOnboardingComplete() {
    if (!session?.user) return;
    await loadProfile(session.user.id);
    await scheduleDefaultNotifications(session.user.id).catch(() => {});
    await scheduleMorningBriefingNotification(session.user.id).catch(() => {});
    await scheduleEveningDebriefNotification(session.user.id).catch(() => {});
    await scheduleWeeklyReportNotification(session.user.id).catch(() => {});
  }

  // Show splash until both i18n and auth are ready — prevents untranslated flash
  if (!i18nReady || loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashText}>Growthovo</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const userId = session?.user?.id;
  const subscriptionStatus = userProfile?.subscription_status ?? 'free';

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            authScreen === 'signin' ? (
              <Stack.Screen name="SignIn">
                {() => <SignInScreen onNavigateToSignUp={() => setAuthScreen('signup')} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="SignUp">
                {() => <SignUpScreen onNavigateToSignIn={() => setAuthScreen('signin')} />}
              </Stack.Screen>
            )
          ) : !userProfile?.onboarding_complete ? (
            <Stack.Screen name="Onboarding">
              {() => (
                <QuizFlow
                  userId={userId}
                  onComplete={handleOnboardingComplete}
                />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main">
                {() => (
                  <AppNavigator
                    userId={userId}
                    subscriptionStatus={subscriptionStatus}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Settings">
                {() => (
                  <SettingsScreen
                    userId={userId}
                    onSignOut={() => setSession(null)}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="CheckIn">
                {(props) => (
                  <CheckInScreen
                    userId={userId}
                    onDone={() => props.navigation.goBack()}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="StreakBroke">
                {(props) => (
                  <StreakBrokeScreen
                    streakCount={props.route.params?.streakCount || 0}
                    onContinue={() => props.navigation.navigate('ComebackChallenge', { 
                      originalStreak: props.route.params?.streakCount || 0 
                    })}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="ComebackChallenge">
                {(props) => (
                  <ComebackChallengeScreen
                    userId={userId}
                    primaryPillar={userProfile?.primary_pillar || 'discipline'}
                    originalStreak={props.route.params?.originalStreak || 0}
                    comebackUsedAt={null} // Will be fetched in component
                    onAccept={(challengeId) => {
                      // Navigate to challenge proof screen (not implemented yet)
                      // For now, simulate success
                      props.navigation.navigate('ComebackSuccess', { 
                        restoredStreak: Math.floor((props.route.params?.originalStreak || 0) / 2),
                        primaryPillar: userProfile?.primary_pillar || 'discipline'
                      });
                    }}
                    onDecline={() => props.navigation.navigate('StartFresh')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="ComebackSuccess">
                {(props) => (
                  <ComebackSuccessScreen
                    restoredStreak={props.route.params?.restoredStreak || 0}
                    primaryPillar={props.route.params?.primaryPillar || 'discipline'}
                    onContinue={() => props.navigation.navigate('Main')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="StartFresh">
                {(props) => (
                  <StartFreshScreen
                    userId={userId}
                    onContinue={() => props.navigation.navigate('Main')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Speaking">
                {() => (
                  <SpeakingNavigator
                    userId={userId}
                    subscriptionStatus={subscriptionStatus}
                    language={userProfile?.language || 'en'}
                  />
                )}
              </Stack.Screen>
              {showPaywall && (
                <Stack.Screen name="Paywall">
                  {() => (
                    <PaywallScreen
                      userId={userId}
                      onClose={() => setShowPaywall(false)}
                      onSuccess={() => {
                        setShowPaywall(false);
                        loadProfile(userId);
                      }}
                    />
                  )}
                </Stack.Screen>
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  splash: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  splashText: { fontSize: 36, fontWeight: '800', color: colors.primary },
});
