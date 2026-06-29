/**
 * Native platform utilities
 * This file is used on native platforms (iOS/Android)
 */

import { Platform, Dimensions } from 'react-native';

/**
 * Check if running in a standalone PWA mode (always false on native)
 */
export const isStandalone = (): boolean => {
  return false;
};

/**
 * Check if the device is a touch device (always true on mobile)
 */
export const isTouchDevice = (): boolean => {
  return true;
};

/**
 * Get the browser name (not applicable on native)
 */
export const getBrowserName = (): string => {
  return 'native';
};

/**
 * Check if platform supports a specific feature
 */
export const supportsFeature = (feature: string): boolean => {
  switch (feature) {
    case 'serviceWorker':
      return false; // Not applicable on native
    case 'pushNotifications':
      return true; // Native push notifications
    case 'notifications':
      return true; // Native notifications
    case 'mediaDevices':
      return true; // Expo Camera and Audio
    case 'indexedDB':
      return false; // Use AsyncStorage instead
    case 'localStorage':
      return false; // Use AsyncStorage instead
    case 'webShare':
      return true; // Expo Sharing module
    default:
      return false;
  }
};

/**
 * Get device type based on screen size
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const { width } = Dimensions.get('window');
  
  if (width < 768) {
    return 'mobile';
  }
  
  if (width >= 768 && width <= 1024) {
    return 'tablet';
  }
  
  return 'desktop'; // Unlikely on native, but possible on tablets
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return __DEV__;
};
