/**
 * Centralized authentication state for Growthovo.
 * Single source of truth — prevents auth race conditions and UI flashes.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import {
  ensureUserProfile,
  getUserProfile,
  isEmailVerified,
  signOut as authSignOut,
  type DbUserProfile,
} from '../services/authService';
import { getReturnPathFromUrl } from '../utils/authRedirect';

export type AuthStatus =
  | 'initializing'
  | 'unauthenticated'
  | 'authenticated'
  | 'email_verification_required'
  | 'profile_loading'
  | 'password_recovery';

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  profile: DbUserProfile | null;
  error: string | null;
  returnTo: string | null;
  setReturnTo: (path: string | null) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  clearPasswordRecovery: () => void;
  isReady: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  needsEmailVerification: boolean;
  needsPasswordReset: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DbUserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(() => getReturnPathFromUrl());
  const loadingProfileRef = useRef(false);

  const loadProfile = useCallback(async (userId: string, user: User) => {
    if (loadingProfileRef.current) return;
    loadingProfileRef.current = true;
    setStatus('profile_loading');

    try {
      await ensureUserProfile(userId, {
        email: user.email ?? undefined,
        metadata: user.user_metadata,
      });

      const data = await getUserProfile(userId);
      setProfile(data);

      if (!isEmailVerified(user) && user.app_metadata?.provider === 'email') {
        setStatus('email_verification_required');
      } else {
        setStatus('authenticated');
      }
    } catch (err: any) {
      console.error('[Auth] Profile load failed:', err);
      setError(err.message ?? 'Failed to load your profile.');
      setStatus('authenticated');
    } finally {
      loadingProfileRef.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!mounted) return;

        // Detect password recovery from URL hash (web)
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const hash = window.location.hash;
          if (hash.includes('type=recovery')) {
            setSession(currentSession);
            setStatus('password_recovery');
            return;
          }
        }

        setSession(currentSession);
        if (currentSession?.user) {
          await loadProfile(currentSession.user.id, currentSession.user);
        } else {
          setStatus('unauthenticated');
        }
      } catch (err) {
        console.error('[Auth] Init failed:', err);
        if (mounted) setStatus('unauthenticated');
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);

      if (event === 'PASSWORD_RECOVERY') {
        setStatus('password_recovery');
        return;
      }

      if (nextSession?.user) {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          await loadProfile(nextSession.user.id, nextSession.user);
        }
      } else {
        setProfile(null);
        setStatus('unauthenticated');
      }
    });

    // Cross-tab logout sync on web
    const handleStorage = (e: StorageEvent) => {
      if (Platform.OS !== 'web') return;
      if (e.key?.includes('supabase.auth.token') && !e.newValue) {
        setSession(null);
        setProfile(null);
        setStatus('unauthenticated');
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    loadingProfileRef.current = false;
    await loadProfile(session.user.id, session.user);
  }, [session, loadProfile]);

  const signOut = useCallback(async () => {
    setError(null);
    await authSignOut();
    setSession(null);
    setProfile(null);
    setStatus('unauthenticated');
  }, []);

  const clearPasswordRecovery = useCallback(() => {
    if (session?.user) {
      loadProfile(session.user.id, session.user);
    } else {
      setStatus('unauthenticated');
    }
  }, [session, loadProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    session,
    user: session?.user ?? null,
    profile,
    error,
    returnTo,
    setReturnTo,
    refreshProfile,
    signOut,
    clearError: () => setError(null),
    clearPasswordRecovery,
    isReady: status !== 'initializing' && status !== 'profile_loading',
    isAuthenticated: status === 'authenticated' || status === 'email_verification_required' || status === 'password_recovery',
    needsOnboarding: profile ? !profile.onboarding_complete : true,
    needsEmailVerification: status === 'email_verification_required',
    needsPasswordReset: status === 'password_recovery',
  }), [status, session, profile, error, returnTo, refreshProfile, signOut, clearPasswordRecovery]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext);
}
