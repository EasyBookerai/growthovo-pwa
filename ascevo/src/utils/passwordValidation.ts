/**
 * Password validation utilities for signup and reset flows.
 */

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function getPasswordStrength(password: string): {
  score: number;
  metCount: number;
  total: number;
  isValid: boolean;
  label: 'weak' | 'fair' | 'good' | 'strong';
} {
  const met = PASSWORD_REQUIREMENTS.filter((r) => r.test(password));
  const metCount = met.length;
  const total = PASSWORD_REQUIREMENTS.length;
  const isValid = metCount === total;

  let label: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
  if (metCount >= 5) label = 'strong';
  else if (metCount >= 4) label = 'good';
  else if (metCount >= 2) label = 'fair';

  return { score: metCount / total, metCount, total, isValid, label };
}

export function validatePassword(password: string): string | null {
  const { isValid } = getPasswordStrength(password);
  if (!isValid) return 'Password must meet all requirements below.';
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address.';
  return null;
}
