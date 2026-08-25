import React, { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import AuthCallbackScreen from '../screens/auth/AuthCallbackScreen';
import { syncWebPath, getWebAuthPath } from '../utils/authRedirect';

export type AuthRoute =
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email'
  | 'auth/callback';

const ROUTE_TO_PATH: Record<AuthRoute, string> = {
  login: '/login',
  signup: '/signup',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  'verify-email': '/verify-email',
  'auth/callback': '/auth/callback',
};

const PATH_TO_ROUTE: Record<string, AuthRoute> = Object.fromEntries(
  Object.entries(ROUTE_TO_PATH).map(([route, path]) => [path, route as AuthRoute])
);

function getInitialRoute(): AuthRoute {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (PATH_TO_ROUTE[path]) return PATH_TO_ROUTE[path];
    if (path === '/signin') return 'login';
    if (path === '/register') return 'signup';
  }
  return 'login';
}

interface AuthNavigatorProps {
  needsEmailVerification?: boolean;
}

export default function AuthNavigator({ needsEmailVerification = false }: AuthNavigatorProps) {
  const [route, setRoute] = useState<AuthRoute>(
    needsEmailVerification ? 'verify-email' : getInitialRoute()
  );
  const [forceShowAuth, setForceShowAuth] = useState(false);

  // Debug: Check URL for ?showAuth=true to force show auth screens
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('showAuth') === 'true') {
        setForceShowAuth(true);
      }
    }
  }, []);

  const navigate = useCallback((next: AuthRoute) => {
    setRoute(next);
    syncWebPath(ROUTE_TO_PATH[next]);
  }, []);

  useEffect(() => {
    if (needsEmailVerification) {
      navigate('verify-email');
    }
  }, [needsEmailVerification, navigate]);

  // Browser back/forward on web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/$/, '') || '/';
      const matched = PATH_TO_ROUTE[path];
      if (matched) setRoute(matched);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  switch (route) {
    case 'signup':
      return <SignUpScreen onNavigateToSignIn={() => navigate('login')} />;
    case 'forgot-password':
      return (
        <ForgotPasswordScreen
          onNavigateToSignIn={() => navigate('login')}
        />
      );
    case 'reset-password':
      return (
        <ResetPasswordScreen
          onNavigateToSignIn={() => navigate('login')}
          onNavigateToForgotPassword={() => navigate('forgot-password')}
          onSuccess={() => navigate('login')}
        />
      );
    case 'verify-email':
      return (
        <EmailVerificationScreen
          onNavigateToSignIn={() => navigate('login')}
        />
      );
    case 'auth/callback':
      return (
        <AuthCallbackScreen
          onComplete={() => navigate('login')}
          onError={() => navigate('login')}
        />
      );
    case 'login':
    default:
      return (
        <LoginScreen
          onNavigateToSignUp={() => navigate('signup')}
          onNavigateToForgotPassword={() => navigate('forgot-password')}
        />
      );
  }
}

export { getWebAuthPath, ROUTE_TO_PATH };
