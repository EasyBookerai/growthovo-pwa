/**
 * Auth Service — manages user authentication and profile creation.
 * Remote: Supabase Auth + users table
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';
import { detectPlatform, trackPlatformAccess } from './platformDetectionService';
import { mapAuthError } from '../utils/authErrors';
import { getAuthCallbackUrl, getPasswordResetRedirectUrl } from '../utils/authRedirect';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthError {
  message: string;
}

export interface DbUserProfile {
  id: string;
  username: string;
  onboarding_complete: boolean;
  subscription_status: string;
  primary_pillar?: string;
  language?: string;
  avatar_url?: string;
  created_at?: string;
}

const REMEMBER_EMAIL_KEY = '@growthovo:remembered_email';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function throwFriendly(error: { message: string }): never {
  throw new Error(mapAuthError(error.message));
}

export async function getRememberedEmail(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
  } catch {
    return null;
  }
}

export async function setRememberedEmail(email: string | null): Promise<void> {
  try {
    if (email) {
      await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
  } catch {
    // Non-critical
  }
}

function deriveUsername(metadata: Record<string, unknown> | undefined, email?: string): string {
  const fullName = metadata?.full_name ?? metadata?.name;
  if (typeof fullName === 'string' && fullName.trim()) {
    return fullName.trim().replace(/\s+/g, '').slice(0, 20);
  }
  if (typeof metadata?.preferred_username === 'string') {
    return metadata.preferred_username.slice(0, 20);
  }
  const localPart = email?.split('@')[0] ?? 'user';
  return localPart.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20) || `user${Date.now().toString(36)}`;
}

async function makeUniqueUsername(base: string): Promise<string> {
  let candidate = base.slice(0, 20) || `user${Date.now().toString(36)}`;
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from('users').select('id').eq('username', candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base.slice(0, 16)}${Math.floor(Math.random() * 9999)}`;
  }
  return `user${Date.now().toString(36)}`;
}

/** Ensures public.users + streaks + hearts rows exist (email signup + OAuth). */
export async function ensureUserProfile(userId: string, options?: { username?: string; email?: string; metadata?: Record<string, unknown> }) {
  const { data: existing } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
  if (existing) return existing;

  const baseUsername = options?.username ?? deriveUsername(options?.metadata, options?.email);
  const username = await makeUniqueUsername(baseUsername);

  const { error: profileError } = await supabase.from('users').insert({ id: userId, username });
  if (profileError) {
    if (profileError.message.includes('duplicate') || profileError.message.includes('unique')) {
      return { id: userId };
    }
    throw new Error(mapAuthError(profileError.message));
  }

  await Promise.all([
    supabase.from('streaks').insert({ user_id: userId }).then(({ error }) => {
      if (error && !error.message.includes('duplicate')) console.warn('[auth] streak init:', error.message);
    }),
    supabase.from('hearts').insert({ user_id: userId }).then(({ error }) => {
      if (error && !error.message.includes('duplicate')) console.warn('[auth] hearts init:', error.message);
    }),
  ]);

  const platformInfo = detectPlatform();
  await trackPlatformAccess(userId, platformInfo).catch(() => {});

  return { id: userId, username };
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
      data: { username },
    },
  });
  if (error) throwFriendly(error);

  const userId = data.user?.id;
  if (!userId) throw new Error('Sign up failed. Please try again.');

  await ensureUserProfile(userId, { username, email });
  return data;
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string, rememberMe = true) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throwFriendly(error);

  if (rememberMe) {
    await setRememberedEmail(email);
  } else {
    await setRememberedEmail(null);
  }

  if (data.user?.id) {
    await ensureUserProfile(data.user.id, {
      email: data.user.email ?? email,
      metadata: data.user.user_metadata,
    });
    const platformInfo = detectPlatform();
    await trackPlatformAccess(data.user.id, platformInfo).catch(() => {});
  }

  return data;
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const redirectTo = getAuthCallbackUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) throwFriendly(error);

  if (Platform.OS === 'web' && data?.url) {
    window.location.href = data.url;
  }

  return data;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectUrl(),
  });
  if (error) throwFriendly(error);
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throwFriendly(error);
}

// ─── Email Verification ───────────────────────────────────────────────────────

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: getAuthCallbackUrl() },
  });
  if (error) throwFriendly(error);
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throwFriendly(error);
}

// ─── Session ──────────────────────────────────────────────────────────────────

export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throwFriendly(error);
  return data.session;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throwFriendly(error);
  return data.session;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function getUserProfile(userId: string): Promise<DbUserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(mapAuthError(error.message));
  return data;
}

export function isEmailVerified(user: { email_confirmed_at?: string | null } | null | undefined): boolean {
  return Boolean(user?.email_confirmed_at);
}

export async function handleOAuthCallback(): Promise<void> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throwFriendly(error);
  if (!session?.user) return;

  await ensureUserProfile(session.user.id, {
    email: session.user.email ?? undefined,
    metadata: session.user.user_metadata,
  });
}
