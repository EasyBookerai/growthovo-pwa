import { supabase } from './supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthError {
  message: string;
}

function friendlyError(raw: string): string {
  if (raw.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (raw.includes('Email not confirmed')) return 'Please confirm your email before signing in.';
  if (raw.includes('User already registered')) return 'An account with this email already exists.';
  if (raw.includes('Password should be at least')) return 'Password must be at least 6 characters.';
  if (raw.includes('Unable to validate email')) return 'Please enter a valid email address.';
  if (raw.includes('network') || raw.includes('fetch')) return 'Network error. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(friendlyError(error.message));

  const userId = data.user?.id;
  if (!userId) throw new Error('Sign up failed. Please try again.');

  // Insert public user profile row
  const { error: profileError } = await supabase.from('users').insert({
    id: userId,
    username,
  });

  if (profileError) {
    // If username is taken, surface a clear message
    if (profileError.message.includes('unique')) {
      throw new Error('That username is already taken. Please choose another.');
    }
    throw new Error(friendlyError(profileError.message));
  }

  // Also initialise streak and hearts rows
  await Promise.all([
    supabase.from('streaks').insert({ user_id: userId }),
    supabase.from('hearts').insert({ user_id: userId }),
  ]);

  return data;
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendlyError(error.message));
  return data;
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'growthovo://auth/callback',
    },
  });
  if (error) throw new Error(friendlyError(error.message));
  return data;
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(friendlyError(error.message));
}

// ─── Refresh Session ──────────────────────────────────────────────────────────

export async function refreshSession() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw new Error(friendlyError(error.message));
  return data.session;
}

// ─── Get Current User Profile ─────────────────────────────────────────────────

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(friendlyError(error.message));
  return data;
}
