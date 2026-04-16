import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import type {
  UserProfile,
  StreakState,
  HeartsState,
  XPTransaction,
  LeagueMember,
} from '../types';

// ─── Auth Slice ───────────────────────────────────────────────────────────────

interface AuthSlice {
  session: Session | null;
  user: UserProfile | null;
  initialize: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthSlice>((set) => ({
  session: null,
  user: null,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
    });
  },

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));

// ─── Streak Slice ─────────────────────────────────────────────────────────────

interface StreakSlice {
  streak: StreakState | null;
  setStreak: (streak: StreakState | null) => void;
  isAtRisk: () => boolean;
}

export const useStreakStore = create<StreakSlice>((set, get) => ({
  streak: null,
  setStreak: (streak) => set({ streak }),
  isAtRisk: () => {
    const { streak } = get();
    if (!streak) return false;
    const today = new Date().toISOString().split('T')[0];
    return streak.lastActivityDate !== today;
  },
}));

// ─── Hearts Slice ─────────────────────────────────────────────────────────────

interface HeartsSlice {
  hearts: HeartsState | null;
  setHearts: (hearts: HeartsState | null) => void;
  hasHearts: () => boolean;
}

export const useHeartsStore = create<HeartsSlice>((set, get) => ({
  hearts: null,
  setHearts: (hearts) => set({ hearts }),
  hasHearts: () => {
    const { hearts } = get();
    return hearts ? hearts.count > 0 : false;
  },
}));

// ─── XP Slice ─────────────────────────────────────────────────────────────────

interface XPSlice {
  totalXP: number;
  recentTransactions: XPTransaction[];
  setTotalXP: (xp: number) => void;
  addTransaction: (tx: XPTransaction) => void;
}

export const useXPStore = create<XPSlice>((set) => ({
  totalXP: 0,
  recentTransactions: [],
  setTotalXP: (totalXP) => set({ totalXP }),
  addTransaction: (tx) =>
    set((state) => ({
      totalXP: state.totalXP + tx.amount,
      recentTransactions: [tx, ...state.recentTransactions].slice(0, 20),
    })),
}));

// ─── Performance Slice ────────────────────────────────────────────────────────

interface PerformanceSettings {
  glassmorphismEnabled: boolean;
  animationsEnabled: boolean;
  blurIntensity: 'light' | 'medium' | 'heavy';
  autoDegrade: boolean;
}

interface PerformanceSlice {
  settings: PerformanceSettings;
  updateSettings: (updates: Partial<PerformanceSettings>) => void;
}

export const usePerformanceStore = create<PerformanceSlice>((set) => ({
  settings: {
    glassmorphismEnabled: true,
    animationsEnabled: true,
    blurIntensity: 'medium',
    autoDegrade: true,
  },
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),
}));

// ─── League Slice ─────────────────────────────────────────────────────────────

interface LeagueSlice {
  leagueMembers: LeagueMember[];
  userRank: number | null;
  setLeagueMembers: (members: LeagueMember[]) => void;
}

export const useLeagueStore = create<LeagueSlice>((set) => ({
  leagueMembers: [],
  userRank: null,
  setLeagueMembers: (members) => {
    const sorted = [...members].sort((a, b) => b.weeklyXp - a.weeklyXp);
    set({ leagueMembers: sorted });
  },
}));

// ─── Language Slice ───────────────────────────────────────────────────────────

import type { SupportedLanguage } from '../services/i18nService';
import { setLanguage as persistLanguage } from '../services/languageService';
import i18n from '../services/i18nService';
import { scheduleDefaultNotifications } from '../services/notificationService';

interface LanguageSlice {
  language: SupportedLanguage;
  isChangingLanguage: boolean;
  setLanguage: (code: SupportedLanguage, userId?: string) => Promise<void>;
}

export const useLanguageStore = create<LanguageSlice>((set, get) => ({
  language: 'en',
  isChangingLanguage: false,

  setLanguage: async (code: SupportedLanguage, userId?: string) => {
    if (get().language === code) return; // no-op if already set
    set({ isChangingLanguage: true });
    try {
      // 1. Persist to AsyncStorage + Supabase
      await persistLanguage(code, userId);
      // 2. Switch i18next language (triggers re-render of all useTranslation consumers)
      await i18n.changeLanguage(code);
      // 3. Update store state
      set({ language: code });
      // 4. Reschedule notifications in new language (best-effort)
      if (userId) {
        scheduleDefaultNotifications(userId).catch(() => {});
      }
    } finally {
      set({ isChangingLanguage: false });
    }
  },
}));

// ─── Theme Slice ──────────────────────────────────────────────────────────────

import type { ThemeMode, ResolvedTheme, ColorScheme, GlassmorphismTheme } from '../services/themeService';
import {
  initializeTheme,
  setThemeMode as persistThemeMode,
  toggleTheme as toggleThemeMode,
  getColors,
  getGlassTheme,
  subscribeToTheme,
} from '../services/themeService';

interface ThemeSlice {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  colors: ColorScheme;
  glass: GlassmorphismTheme;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  setMode: (mode: ThemeMode, userId?: string) => Promise<void>;
  toggle: (userId?: string) => Promise<void>;
}

export const useThemeStore = create<ThemeSlice>((set, get) => ({
  mode: 'auto',
  resolved: 'dark',
  colors: getColors('dark'),
  glass: getGlassTheme('dark'),
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;

    const resolved = await initializeTheme();
    
    // Subscribe to theme changes
    subscribeToTheme((newTheme) => {
      set({
        resolved: newTheme,
        colors: getColors(newTheme),
        glass: getGlassTheme(newTheme),
      });
    });

    set({
      resolved,
      colors: getColors(resolved),
      glass: getGlassTheme(resolved),
      isInitialized: true,
    });
  },

  setMode: async (mode: ThemeMode, userId?: string) => {
    const resolved = await persistThemeMode(mode, userId);
    set({
      mode,
      resolved,
      colors: getColors(resolved),
      glass: getGlassTheme(resolved),
    });
  },

  toggle: async (userId?: string) => {
    const resolved = await toggleThemeMode(userId);
    const currentMode = get().resolved === 'dark' ? 'light' : 'dark';
    set({
      mode: currentMode,
      resolved,
      colors: getColors(resolved),
      glass: getGlassTheme(resolved),
    });
  },
}));
