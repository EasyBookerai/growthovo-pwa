/**
 * Platform-aware redirect URLs for OAuth and password reset flows.
 */

import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

const APP_URL = process.env.EXPO_PUBLIC_APP_URL?.replace(/\/$/, '');

export function getAuthCallbackUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  if (APP_URL) {
    return `${APP_URL}/auth/callback`;
  }
  return Linking.createURL('auth/callback');
}

export function getPasswordResetRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/reset-password`;
  }
  if (APP_URL) {
    return `${APP_URL}/reset-password`;
  }
  return Linking.createURL('reset-password');
}

export function getWebAuthPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export function syncWebPath(path: string): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  const normalized = getWebAuthPath(path);
  if (window.location.pathname !== normalized) {
    window.history.replaceState(null, '', normalized);
  }
}

export function getReturnPathFromUrl(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');
  if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
    return returnTo;
  }
  return null;
}
