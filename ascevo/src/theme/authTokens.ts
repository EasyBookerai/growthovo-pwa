/**
 * Auth-specific design tokens — premium purple glass aesthetic.
 */

export const authColors = {
  background: '#0B0618',
  backgroundMid: '#150D2E',
  backgroundGlow: 'rgba(124, 58, 237, 0.18)',
  surface: 'rgba(22, 16, 40, 0.72)',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  surfaceHover: 'rgba(255, 255, 255, 0.04)',
  inputBg: 'rgba(255, 255, 255, 0.04)',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  inputBorderFocus: 'rgba(167, 139, 250, 0.6)',
  inputBorderError: 'rgba(239, 68, 68, 0.6)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.55)',
  textSubtle: 'rgba(255, 255, 255, 0.35)',
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryGlow: 'rgba(124, 58, 237, 0.35)',
  cta: '#FFFFFF',
  ctaText: '#0B0618',
  ctaDisabled: 'rgba(255, 255, 255, 0.25)',
  googleBg: 'rgba(255, 255, 255, 0.06)',
  googleBorder: 'rgba(255, 255, 255, 0.12)',
  error: '#EF4444',
  errorBg: 'rgba(239, 68, 68, 0.12)',
  success: '#22C55E',
  successBg: 'rgba(34, 197, 94, 0.12)',
  divider: 'rgba(255, 255, 255, 0.08)',
  strengthWeak: '#EF4444',
  strengthFair: '#F97316',
  strengthGood: '#EAB308',
  strengthStrong: '#22C55E',
} as const;

export const authSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const authRadius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

export const authAnimation = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

export const authTypography = {
  logo: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.2 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  link: { fontSize: 14, fontWeight: '600' as const },
} as const;
