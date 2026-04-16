// 📱 Responsive Design Utilities for Gamification Components
// Provides adaptive layouts for different screen sizes

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Screen size breakpoints
 */
export const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

/**
 * Get current device type
 */
export function getDeviceType(): 'phone' | 'tablet' | 'desktop' {
  if (SCREEN_WIDTH >= BREAKPOINTS.desktop) {
    return 'desktop';
  }
  if (SCREEN_WIDTH >= BREAKPOINTS.tablet) {
    return 'tablet';
  }
  return 'phone';
}

/**
 * Check if device is tablet or larger
 */
export function isTabletOrLarger(): boolean {
  return SCREEN_WIDTH >= BREAKPOINTS.tablet;
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
  return SCREEN_WIDTH >= BREAKPOINTS.desktop;
}

/**
 * Get responsive grid columns for achievements
 */
export function getAchievementGridColumns(): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return 4;
    case 'tablet':
      return 3;
    case 'phone':
    default:
      return 3;
  }
}

/**
 * Get responsive achievement badge size
 */
export function getAchievementBadgeSize(): 'small' | 'medium' | 'large' {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return 'large';
    case 'tablet':
      return 'medium';
    case 'phone':
    default:
      return 'small';
  }
}

/**
 * Get responsive daily goal card width
 */
export function getDailyGoalCardWidth(): number {
  const deviceType = getDeviceType();
  const padding = 32; // Total horizontal padding
  
  switch (deviceType) {
    case 'desktop':
      return (SCREEN_WIDTH - padding) / 3 - 16; // 3 columns
    case 'tablet':
      return (SCREEN_WIDTH - padding) / 2 - 16; // 2 columns
    case 'phone':
    default:
      return SCREEN_WIDTH - padding; // 1 column
  }
}

/**
 * Get responsive leaderboard card height
 */
export function getLeaderboardCardHeight(): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return 80;
    case 'tablet':
      return 72;
    case 'phone':
    default:
      return 64;
  }
}

/**
 * Get responsive celebration modal size
 */
export function getCelebrationModalSize(): { width: number; height: number } {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return { width: 600, height: 700 };
    case 'tablet':
      return { width: 500, height: 600 };
    case 'phone':
    default:
      return { width: SCREEN_WIDTH - 32, height: SCREEN_HEIGHT * 0.8 };
  }
}

/**
 * Get responsive font size
 */
export function getResponsiveFontSize(base: number): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return base * 1.2;
    case 'tablet':
      return base * 1.1;
    case 'phone':
    default:
      return base;
  }
}

/**
 * Get responsive spacing
 */
export function getResponsiveSpacing(base: number): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return base * 1.5;
    case 'tablet':
      return base * 1.25;
    case 'phone':
    default:
      return base;
  }
}

/**
 * Get minimum touch target size (44x44 for accessibility)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Ensure touch target meets minimum size
 */
export function ensureMinTouchTarget(size: number): number {
  return Math.max(size, MIN_TOUCH_TARGET);
}

/**
 * Get responsive progress ring size
 */
export function getProgressRingSize(): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return 120;
    case 'tablet':
      return 100;
    case 'phone':
    default:
      return 80;
  }
}

/**
 * Get responsive XP bar height
 */
export function getXPBarHeight(): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return 16;
    case 'tablet':
      return 14;
    case 'phone':
    default:
      return 12;
  }
}

/**
 * Get responsive streak display variant
 */
export function getStreakDisplayVariant(): 'compact' | 'expanded' {
  return isTabletOrLarger() ? 'expanded' : 'compact';
}

/**
 * Get responsive padding for glass cards
 */
export function getGlassCardPadding(): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return 24;
    case 'tablet':
      return 20;
    case 'phone':
    default:
      return 16;
  }
}

/**
 * Get responsive border radius
 */
export function getResponsiveBorderRadius(base: number): number {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'desktop':
      return base * 1.5;
    case 'tablet':
      return base * 1.25;
    case 'phone':
    default:
      return base;
  }
}

/**
 * Check if landscape orientation
 */
export function isLandscape(): boolean {
  return SCREEN_WIDTH > SCREEN_HEIGHT;
}

/**
 * Get safe area insets for different platforms
 */
export function getSafeAreaInsets(): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  // Default safe area insets
  const defaults = { top: 0, bottom: 0, left: 0, right: 0 };
  
  if (Platform.OS === 'ios') {
    // iOS notch devices
    return { top: 44, bottom: 34, left: 0, right: 0 };
  }
  
  if (Platform.OS === 'android') {
    // Android with gesture navigation
    return { top: 24, bottom: 24, left: 0, right: 0 };
  }
  
  return defaults;
}

/**
 * Get responsive modal padding
 */
export function getModalPadding(): number {
  const deviceType = getDeviceType();
  const safeArea = getSafeAreaInsets();
  
  const basePadding = deviceType === 'phone' ? 16 : 24;
  return Math.max(basePadding, safeArea.top, safeArea.bottom);
}

/**
 * Calculate responsive grid item size
 */
export function getGridItemSize(
  columns: number,
  spacing: number,
  containerWidth: number = SCREEN_WIDTH
): number {
  const totalSpacing = spacing * (columns + 1);
  return (containerWidth - totalSpacing) / columns;
}

/**
 * Get responsive icon size
 */
export function getIconSize(variant: 'small' | 'medium' | 'large'): number {
  const deviceType = getDeviceType();
  const multiplier = deviceType === 'desktop' ? 1.2 : deviceType === 'tablet' ? 1.1 : 1;
  
  const sizes = {
    small: 24,
    medium: 32,
    large: 48,
  };
  
  return Math.round(sizes[variant] * multiplier);
}
