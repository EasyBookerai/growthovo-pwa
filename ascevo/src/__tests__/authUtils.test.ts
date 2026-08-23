import { mapAuthError } from '../utils/authErrors';
import { validateEmail, validatePassword, getPasswordStrength, PASSWORD_REQUIREMENTS } from '../utils/passwordValidation';

describe('authErrors', () => {
  it('maps invalid credentials to friendly message', () => {
    expect(mapAuthError('Invalid login credentials')).toContain("doesn't look right");
  });

  it('maps rate limit errors', () => {
    expect(mapAuthError('Email rate limit exceeded')).toContain('Too many attempts');
  });

  it('maps network errors', () => {
    expect(mapAuthError('Failed to fetch')).toContain('connection');
  });

  it('returns generic message for unknown errors', () => {
    expect(mapAuthError('xyz_unknown')).toBe('Something went wrong. Please try again.');
  });
});

describe('passwordValidation', () => {
  it('validates email format', () => {
    expect(validateEmail('')).toBeTruthy();
    expect(validateEmail('bad')).toBeTruthy();
    expect(validateEmail('good@example.com')).toBeNull();
  });

  it('requires all password rules', () => {
    expect(validatePassword('short')).toBeTruthy();
    expect(validatePassword('ValidPass1!')).toBeNull();
  });

  it('calculates password strength', () => {
    const weak = getPasswordStrength('a');
    expect(weak.label).toBe('weak');
    expect(weak.isValid).toBe(false);

    const strong = getPasswordStrength('ValidPass1!');
    expect(strong.label).toBe('strong');
    expect(strong.isValid).toBe(true);
  });

  it('has five requirements', () => {
    expect(PASSWORD_REQUIREMENTS).toHaveLength(5);
  });
});
