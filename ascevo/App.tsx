import 'react-native-url-polyfill/auto';
import './src/theme/variables.css';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, ActivityIndicator, AppState, Platform } from 'react-native';
import { Analytics } from '@vercel/analytics/react';
import { registerPushToken, scheduleDefaultNotifications, scheduleMorningBriefingNotification, scheduleEveningDebriefNotification, scheduleWeeklyReportNotification } from './src/services/notificationService';
import { initI18n } from './src/services/i18nService';
import MorningBriefingGate from './src/components/MorningBriefingGate';
import EveningDebriefGate from './src/components/EveningDebriefGate';
import { useLanguageStore, useAuthStore } from './src/store';
import { colors } from './src/theme';
import { syncWidgetData } from './src/services/widgetService';
import { initAssetLoading, preloadCriticalAssets } from './src/services/assetLoadingService';
import { AppProvider } from './src/context/AppContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';

// Screens
import NewOnboardingScreen from './src/screens/onboarding/NewOnboardingScreen';
import NotificationPermissionPrompt from './src/components/NotificationPermissionPrompt';
import { ToastProvider } from './src/context/ToastContext';
import MorningBriefingFlowScreen from './src/screens/worldclass/MorningBriefingFlowScreen';
import EveningDebriefFlowScreen from './src/screens/worldclass/EveningDebriefFlowScreen';
import TimeCapsuleScreen from './src/screens/worldclass/TimeCapsuleScreen';
import WeeklyWrappedFlowScreen from './src/screens/worldclass/WeeklyWrappedFlowScreen';
import FakeSquadScreen from './src/screens/worldclass/FakeSquadScreen';
import CompleteHomeScreen from './src/screens/home/CompleteHomeScreen';
import PillarsScreen from './src/screens/pillars/PillarsScreen';
import CompleteRexScreen from './src/screens/rex/CompleteRexScreen';
import SimpleLeagueScreen from './src/screens/league/SimpleLeagueScreen';
import SimpleProfileScreen from './src/screens/profile/SimpleProfileScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';
import CheckInScreen from './src/screens/checkin/CheckInScreen';
import PaywallScreen from './src/screens/paywall/PaywallScreen';
import StreakBrokeScreen from './src/screens/relapse/StreakBrokeScreen';
import ComebackChallengeScreen from './src/screens/relapse/ComebackChallengeScreen';
import ComebackSuccessScreen from './src/screens/relapse/ComebackSuccessScreen';
import StartFreshScreen from './src/screens/relapse/StartFreshScreen';
import SpeakingNavigator from './src/screens/speaking/SpeakingNavigator';
import MascotScreen from './src/screens/MascotScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home: '🏠',
  Pillars: '🎯',
  Rex: '💬',
  League: '🏆',
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
          <CompleteHomeScreen
            userId={userId}
            subscriptionStatus={subscriptionStatus}
            {...props}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Pillars">
        {(props) => (
          <PillarsScreen
            userId={userId}
            subscriptionStatus={subscriptionStatus}
            {...props}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Rex">
        {(props) => (
          <CompleteRexScreen
            userId={userId}
            subscriptionStatus={subscriptionStatus}
            {...props}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="League">
        {(props) => <SimpleLeagueScreen userId={userId} {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => (
          <SimpleProfileScreen
            userId={userId}
            {...props}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AuthSplash() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashLogo}>Growthovo</Text>
      <View style={styles.splashGlow} />
      <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      <Text style={styles.splashHint}>Loading your experience...</Text>
    </View>
  );
}

function AppContent() {
  const auth = useAuth();
  const [i18nReady, setI18nReady] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const [forceShowAuth, setForceShowAuth] = useState(false);
  const { setLanguage: setStoreLanguage } = useLanguageStore();

  // Check for ?showAuth=true in URL to force show auth screens
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('showAuth') === 'true') {
        setForceShowAuth(true);
      }
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const userId = auth.session?.user?.id;
        await initAssetLoading();
        preloadCriticalAssets().catch((err) => {
          console.warn('[App] Failed to preload critical assets:', err);
        });

        const resolvedLanguage = await initI18n(userId);
        useLanguageStore.setState({ language: resolvedLanguage });

        if (userId) {
          const { getLanguageFromSupabase } = await import('./src/services/languageService');
          const remoteLanguage = await getLanguageFromSupabase(userId).catch(() => null);
          if (remoteLanguage) {
            await setStoreLanguage(remoteLanguage, userId);
          }
        }
      } catch (err) {
        console.error('[App] Bootstrap error:', err);
      } finally {
        setI18nReady(true);
      }
    }

    if (auth.status !== 'initializing') {
      bootstrap();
    }
  }, [auth.status, auth.session?.user?.id, setStoreLanguage]);

  // Sync widget data whenever the app comes to the foreground
  useEffect(() => {
    useAuthStore.setState({
      session: auth.session,
      user: auth.profile as any,
    });
  }, [auth.session, auth.profile]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && auth.session?.user?.id) {
        syncWidgetData(auth.session.user.id).catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [auth.session?.user?.id]);

  // Register push when onboarding complete
  useEffect(() => {
    if (auth.profile?.onboarding_complete && auth.session?.user?.id) {
      registerPushToken(auth.session.user.id).catch(() => {});
    }
  }, [auth.profile?.onboarding_complete, auth.session?.user?.id]);

  async function handleOnboardingComplete() {
    await auth.refreshProfile();
    setShowNotifPrompt(true);
  }

  async function handleNotificationPromptDismiss() {
    setShowNotifPrompt(false);
    const userId = auth.session?.user?.id;
    if (!userId) return;
    await scheduleDefaultNotifications(userId).catch(() => {});
    await scheduleMorningBriefingNotification(userId).catch(() => {});
    await scheduleEveningDebriefNotification(userId).catch(() => {});
    await scheduleWeeklyReportNotification(userId).catch(() => {});
  }

  if (!i18nReady || auth.status === 'initializing' || auth.status === 'profile_loading') {
    return <AuthSplash />;
  }

  const userId = auth.session?.user?.id;
  const subscriptionStatus = auth.profile?.subscription_status ?? 'free';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!auth.isAuthenticated || forceShowAuth ? (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator needsEmailVerification={false} />}
          </Stack.Screen>
        ) : auth.needsPasswordReset ? (
          <Stack.Screen name="ResetPassword">
            {() => (
              <ResetPasswordScreen
                onNavigateToSignIn={() => auth.signOut()}
                onNavigateToForgotPassword={() => auth.signOut()}
                onSuccess={() => auth.clearPasswordRecovery()}
              />
            )}
          </Stack.Screen>
        ) : auth.needsEmailVerification ? (
          <Stack.Screen name="VerifyEmail">
            {() => <AuthNavigator needsEmailVerification />}
          </Stack.Screen>
        ) : auth.needsOnboarding || showNotifPrompt ? (
          showNotifPrompt && auth.profile?.onboarding_complete ? (
            <Stack.Screen name="NotificationPrompt">
              {() => (
                <View style={styles.root}>
                  <NotificationPermissionPrompt
                    visible
                    onDismiss={handleNotificationPromptDismiss}
                  />
                </View>
              )}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Onboarding">
              {() => (
                <NewOnboardingScreen
                  userId={userId}
                  onComplete={handleOnboardingComplete}
                />
              )}
            </Stack.Screen>
          )
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => (
                <ToastProvider>
                  <AppProvider userId={userId!}>
                    <MainTabs
                      userId={userId!}
                      subscriptionStatus={subscriptionStatus}
                      onPaywall={() => {}}
                    />
                  </AppProvider>
                </ToastProvider>
              )}
            </Stack.Screen>
            <Stack.Screen name="MorningBriefing">
              {(props) => (
                <ToastProvider>
                  <AppProvider userId={userId!}>
                    <MorningBriefingFlowScreen onClose={() => props.navigation.goBack()} />
                  </AppProvider>
                </ToastProvider>
              )}
            </Stack.Screen>
            <Stack.Screen name="EveningDebrief">
              {(props) => (
                <ToastProvider>
                  <AppProvider userId={userId!}>
                    <EveningDebriefFlowScreen onClose={() => props.navigation.goBack()} />
                  </AppProvider>
                </ToastProvider>
              )}
            </Stack.Screen>
            <Stack.Screen name="TimeCapsule">
              {(props) => (
                <ToastProvider>
                  <AppProvider userId={userId!}>
                    <TimeCapsuleScreen
                      onClose={() => props.navigation.goBack()}
                      onCheckout={() => props.navigation.navigate('Paywall')}
                    />
                  </AppProvider>
                </ToastProvider>
              )}
            </Stack.Screen>
            <Stack.Screen name="WeeklyWrapped">
              {(props) => (
                <ToastProvider>
                  <AppProvider userId={userId!}>
                    <WeeklyWrappedFlowScreen
                      onClose={() => props.navigation.goBack()}
                      onCheckout={() => props.navigation.navigate('Paywall')}
                    />
                  </AppProvider>
                </ToastProvider>
              )}
            </Stack.Screen>
            <Stack.Screen name="Squad">
              {(props) => (
                <ToastProvider>
                  <FakeSquadScreen onClose={() => props.navigation.goBack()} />
                </ToastProvider>
              )}
            </Stack.Screen>
            <Stack.Screen name="Settings">
              {() => (
                <SettingsScreen
                  userId={userId!}
                  onSignOut={() => auth.signOut()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="CheckIn">
              {(props) => (
                <CheckInScreen
                  userId={userId!}
                  onDone={() => props.navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="StreakBroke">
              {(props) => (
                <StreakBrokeScreen
                  streakCount={props.route.params?.streakCount || 0}
                  onContinue={() => props.navigation.navigate('ComebackChallenge', {
                    originalStreak: props.route.params?.streakCount || 0,
                  })}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="ComebackChallenge">
              {(props) => (
                <ComebackChallengeScreen
                  userId={userId!}
                  primaryPillar={auth.profile?.primary_pillar || 'discipline'}
                  originalStreak={props.route.params?.originalStreak || 0}
                  comebackUsedAt={null}
                  onAccept={() => {
                    props.navigation.navigate('ComebackSuccess', {
                      restoredStreak: Math.floor((props.route.params?.originalStreak || 0) / 2),
                      primaryPillar: auth.profile?.primary_pillar || 'discipline',
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
                  userId={userId!}
                  onContinue={() => props.navigation.navigate('Main')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Speaking">
              {() => (
                <SpeakingNavigator
                  userId={userId!}
                  subscriptionStatus={subscriptionStatus}
                  language={auth.profile?.language || 'en'}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Mascot">
              {(props) => <MascotScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="Paywall">
              {(props) => (
                <PaywallScreen
                  userId={userId!}
                  onClose={() => props.navigation.goBack()}
                  onSuccess={() => {
                    auth.refreshProfile();
                    props.navigation.goBack();
                  }}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <Analytics />
          <AppContent />
          <StatusBar style="light" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  splash: {
    flex: 1,
    backgroundColor: '#0B0618',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  splashGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    top: '35%',
  },
  splashHint: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
});
