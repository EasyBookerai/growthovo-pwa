/**
 * Maps Supabase/auth technical errors to human-readable messages.
 * Never expose sensitive details or raw error codes to users.
 */

const ERROR_MAP: Array<[RegExp | string, string]> = [
  [/Invalid login credentials/i, "Email or password doesn't look right. Check your details and try again."],
  [/Email not confirmed/i, 'Please verify your email before signing in. Check your inbox for the confirmation link.'],
  [/User already registered/i, 'An account with this email already exists. Try signing in instead.'],
  [/Password should be at least/i, 'Password must be at least 8 characters with uppercase, lowercase, and a number.'],
  [/Unable to validate email/i, 'Please enter a valid email address.'],
  [/Email rate limit exceeded|Too many requests|rate limit/i, 'Too many attempts. Please wait a moment before trying again.'],
  [/network|fetch failed|Failed to fetch/i, 'Something went wrong. Check your connection and try again.'],
  [/User not found/i, "We couldn't find an account with that email."],
  [/Invalid refresh token|Refresh Token Not Found/i, 'Your session has expired. Please sign in again.'],
  [/Email link is invalid or has expired|otp_expired|Token has expired/i, 'This link has expired. Request a new one to continue.'],
  [/New password should be different/i, 'Choose a password you haven\'t used before.'],
  [/Signup requires a valid password/i, 'Please choose a stronger password that meets all requirements.'],
  [/OAuth/i, 'Google sign-in was interrupted. Please try again.'],
  [/access_denied|popup_closed/i, 'Sign-in was cancelled. You can try again whenever you\'re ready.'],
  [/unique.*username|duplicate key.*username/i, 'That username is already taken. Please choose another.'],
  [/For security purposes/i, 'For your security, please wait a moment before requesting another email.'],
];

export function mapAuthError(raw: string | undefined | null): string {
  if (!raw?.trim()) return 'Something went wrong. Please try again.';

  for (const [pattern, message] of ERROR_MAP) {
    if (typeof pattern === 'string' ? raw.includes(pattern) : pattern.test(raw)) {
      return message;
    }
  }

  return 'Something went wrong. Please try again.';
}
