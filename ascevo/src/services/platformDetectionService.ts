/**
 * Platform Detection Service
 * Provides runtime information about the current platform and available features
 */

import { Platform } from 'react-native';
import * as platformUtils from '../utils/platform';

export interface PlatformCapabilities {
  // Platform identification
  isWeb: boolean;
  isNative: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isStandalone: boolean;
  
  // Feature availability
  hasServiceWorker: boolean;
  hasMediaDevices: boolean;
  hasWebPush: boolean;
  hasNativeWidgets: boolean;
  hasNativeNotifications: boolean;
  hasIndexedDB: boolean;
  hasLocalStorage: boolean;
  hasWebShare: boolean;
  
  // Platform details
  platform: 'web' | 'ios' | 'android';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserName?: string;
  isDevelopment: boolean;
}

class PlatformDetectionService {
  private capabilities: PlatformCapabilities | null = null;

  /**
   * Detect and return platform capabilities
   */
  public detectPlatform(): PlatformCapabilities {
    if (this.capabilities) {
      return this.capabilities;
    }

    const isWeb = Platform.OS === 'web';
    const isNative = !isWeb;
    const deviceType = platformUtils.getDeviceType();
    
    this.capabilities = {
      // Platform identification
      isWeb,
      isNative,
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      isStandalone: platformUtils.isStandalone(),
      
      // Feature availability
      hasServiceWorker: platformUtils.supportsFeature('serviceWorker'),
      hasMediaDevices: platformUtils.supportsFeature('mediaDevices'),
      hasWebPush: platformUtils.supportsFeature('pushNotifications'),
      hasNativeWidgets: isNative,
      hasNativeNotifications: isNative,
      hasIndexedDB: platformUtils.supportsFeature('indexedDB'),
      hasLocalStorage: platformUtils.supportsFeature('localStorage'),
      hasWebShare: platformUtils.supportsFeature('webShare'),
      
      // Platform details
      platform: Platform.OS as 'web' | 'ios' | 'android',
      deviceType,
      browserName: isWeb ? platformUtils.getBrowserName() : undefined,
      isDevelopment: platformUtils.isDevelopment(),
    };

    return this.capabilities;
  }

  /**
   * Check if a specific feature is available
   */
  public hasFeature(feature: keyof PlatformCapabilities): boolean {
    const capabilities = this.detectPlatform();
    return !!capabilities[feature];
  }

  /**
   * Get platform name
   */
  public getPlatformName(): string {
    const capabilities = this.detectPlatform();
    
    if (capabilities.isWeb) {
      return capabilities.isStandalone ? 'PWA' : 'Web Browser';
    }
    
    return capabilities.platform === 'ios' ? 'iOS' : 'Android';
  }

  /**
   * Check if touch device
   */
  public isTouchDevice(): boolean {
    return platformUtils.isTouchDevice();
  }

  /**
   * Reset cached capabilities (useful for testing)
   */
  public reset(): void {
    this.capabilities = null;
  }
}

// Export singleton instance
export const platformDetectionService = new PlatformDetectionService();

// Export for testing
export { PlatformDetectionService };
