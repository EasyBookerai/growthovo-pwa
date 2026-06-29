/**
 * Web-specific platform utilities
 * This file is automatically used on web platform due to .web.ts extension
 */

/**
 * Check if running in a standalone PWA mode
 */
export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if the device is a touch device
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get the browser name
 */
export const getBrowserName = (): string => {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  
  return 'unknown';
};

/**
 * Check if browser supports a specific feature
 */
export const supportsFeature = (feature: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  switch (feature) {
    case 'serviceWorker':
      return 'serviceWorker' in navigator;
    case 'pushNotifications':
      return 'PushManager' in window;
    case 'notifications':
      return 'Notification' in window;
    case 'mediaDevices':
      return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    case 'indexedDB':
      return 'indexedDB' in window;
    case 'localStorage':
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch {
        return false;
      }
    case 'webShare':
      return 'share' in navigator;
    default:
      return false;
  }
};

/**
 * Get device type based on screen size and user agent
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (width < 768 || /mobile|android|iphone|ipod/.test(userAgent)) {
    return 'mobile';
  }
  
  if (width >= 768 && width <= 1024 || /tablet|ipad/.test(userAgent)) {
    return 'tablet';
  }
  
  return 'desktop';
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};
