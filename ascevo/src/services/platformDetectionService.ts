// 🎯 Platform Detection Service
// Detects where users are accessing from: web, iOS, Android, or PWA
// Like a friendly detective, but for platforms! 🕵️

import { supabase } from './supabaseClient';

export type PlatformSource = 'web' | 'ios' | 'android' | 'pwa';

export interface PlatformInfo {
  source: PlatformSource;
  userAgent: string;
  isStandalone: boolean;
  isMobile: boolean;
  osVersion?: string;
  browserName?: string;
  timestamp: string;
}

/**
 * 🔍 Detect the current platform
 * Returns detailed info about where the user is accessing from
 */
export function detectPlatform(): PlatformInfo {
  const ua = navigator.userAgent;
  
  // Check if running as PWA (installed app)
  const isStandalone = 
    ('standalone' in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia('(display-mode: standalone)').matches;
  
  let source: PlatformSource = 'web';
  let isMobile = false;
  let osVersion: string | undefined;
  let browserName: string | undefined;
  
  // 📱 Check for React Native (native app)
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    const platform = (window as any).Platform;
    source = platform?.OS === 'ios' ? 'ios' : 'android';
    isMobile = true;
    osVersion = platform?.Version;
  }
  // 🌐 Check for PWA (installed web app)
  else if (isStandalone) {
    source = 'pwa';
    isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    
    // Detect OS for PWA
    if (/iPhone|iPad|iPod/i.test(ua)) {
      const match = ua.match(/OS (\d+)_(\d+)/);
      if (match) osVersion = `${match[1]}.${match[2]}`;
    } else if (/Android/i.test(ua)) {
      const match = ua.match(/Android (\d+\.?\d*)/);
      if (match) osVersion = match[1];
    }
  }
  // 🌍 Web browser
  else {
    source = 'web';
    isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    
    // Detect browser
    if (/Chrome/i.test(ua) && !/Edge/i.test(ua)) {
      browserName = 'Chrome';
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      browserName = 'Safari';
    } else if (/Firefox/i.test(ua)) {
      browserName = 'Firefox';
    } else if (/Edge/i.test(ua)) {
      browserName = 'Edge';
    }
  }
  
  return {
    source,
    userAgent: ua,
    isStandalone,
    isMobile,
    osVersion,
    browserName,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 💾 Track platform access in Supabase
 * Stores platform info for analytics and personalization
 */
export async function trackPlatformAccess(
  userId: string,
  platformInfo: PlatformInfo
): Promise<void> {
  try {
    // 🏠 Store locally for quick access
    localStorage.setItem('growthovo_platform', JSON.stringify(platformInfo));
    
    // ☁️ Update Supabase
    const { error } = await supabase
      .from('users')
      .update({
        platform_source: platformInfo.source,
        last_access_platform: platformInfo.source,
        platform_updated_at: platformInfo.timestamp,
      })
      .eq('id', userId);
    
    if (error) {
      console.error('[Platform] Failed to track platform:', error);
      return;
    }
    
    // 📊 Track analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'platform_detected', {
        platform_source: platformInfo.source,
        is_mobile: platformInfo.isMobile,
        is_standalone: platformInfo.isStandalone,
        browser_name: platformInfo.browserName,
        os_version: platformInfo.osVersion,
      });
    }
    
    console.log(`[Platform] ✅ Detected: ${platformInfo.source}`);
  } catch (error) {
    console.error('[Platform] Error tracking platform:', error);
  }
}

/**
 * 📖 Get cached platform info
 * Returns platform info from localStorage if available
 */
export function getCachedPlatformInfo(): PlatformInfo | null {
  try {
    const cached = localStorage.getItem('growthovo_platform');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('[Platform] Error reading cached platform:', error);
  }
  return null;
}

/**
 * 🎨 Get platform-specific emoji
 * Returns a fun emoji based on the platform
 */
export function getPlatformEmoji(source: PlatformSource): string {
  const emojis: Record<PlatformSource, string> = {
    web: '🌐',
    ios: '📱',
    android: '🤖',
    pwa: '⚡',
  };
  return emojis[source] || '💻';
}

/**
 * 🎯 Get platform display name
 * Returns a friendly name for the platform
 */
export function getPlatformDisplayName(source: PlatformSource): string {
  const names: Record<PlatformSource, string> = {
    web: 'Web Browser',
    ios: 'iOS App',
    android: 'Android App',
    pwa: 'Installed App',
  };
  return names[source] || 'Unknown';
}
