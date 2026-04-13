// Growthovo Design System — Dark Mode First

export const colors = {
  // Base
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1E1E1E',
  border: '#2A2A2A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#666666',

  // Brand
  primary: '#7C3AED', // Mind purple — used as app primary

  // Pillars
  pillars: {
    mind: '#7C3AED',
    discipline: '#DC2626',
    communication: '#2563EB',
    money: '#16A34A',
    career: '#EA580C',
    relationships: '#DB2777',
  },

  // Semantic
  success: '#16A34A',
  error: '#DC2626',
  warning: '#EA580C',
  info: '#2563EB',

  // Gamification
  xpGold: '#F59E0B',
  heartRed: '#EF4444',
  streakOrange: '#F97316',
  leagueGold: '#EAB308',
  leagueSilver: '#94A3B8',
  leagueBronze: '#B45309',
  promotionGreen: '#22C55E',
  relegationRed: '#EF4444',
} as const;

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  small: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  smallBold: {
    fontSize: 13,
    fontWeight: '700' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  }),
} as const;

// Helper: get pillar colour by name
export function getPillarColor(pillarName: string): string {
  const key = pillarName.toLowerCase() as keyof typeof colors.pillars;
  return colors.pillars[key] ?? colors.primary;
}
