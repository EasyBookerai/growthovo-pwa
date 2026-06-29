/**
 * Unit Tests for Platform Detection Service
 */

import { Platform } from 'react-native';
import { PlatformDetectionService } from '../services/platformDetectionService';

// Mock the platform utils
jest.mock('../utils/platform', () => ({
  isStandalone: jest.fn(() => false),
  isTouchDevice: jest.fn(() => true),
  getBrowserName: jest.fn(() => 'Chrome'),
  supportsFeature: jest.fn((feature: string) => {
    const features: Record<string, boolean> = {
      serviceWorker: true,
      pushNotifications: true,
      notifications: true,
      mediaDevices: true,
      indexedDB: true,
      localStorage: true,
      webShare: false,
    };
    return features[feature] || false;
  }),
  getDeviceType: jest.fn(() => 'mobile'),
  isDevelopment: jest.fn(() => true),
}));

describe('PlatformDetectionService', () => {
  let service: PlatformDetectionService;

  beforeEach(() => {
    service = new PlatformDetectionService();
    service.reset();
  });

  describe('detectPlatform', () => {
    it('should detect web platform correctly', () => {
      // Platform.OS is already 'web' in test environment
      const capabilities = service.detectPlatform();

      expect(capabilities.isWeb).toBe(true);
      expect(capabilities.isNative).toBe(false);
      expect(capabilities.platform).toBe('web');
    });

    it('should detect device type correctly', () => {
      const capabilities = service.detectPlatform();

      expect(capabilities.deviceType).toBe('mobile');
      expect(capabilities.isMobile).toBe(true);
      expect(capabilities.isTablet).toBe(false);
      expect(capabilities.isDesktop).toBe(false);
    });

    it('should detect feature availability', () => {
      const capabilities = service.detectPlatform();

      expect(capabilities.hasServiceWorker).toBe(true);
      expect(capabilities.hasMediaDevices).toBe(true);
      expect(capabilities.hasWebPush).toBe(true);
      expect(capabilities.hasIndexedDB).toBe(true);
      expect(capabilities.hasLocalStorage).toBe(true);
    });

    it('should detect native-specific features', () => {
      const capabilities = service.detectPlatform();

      // On web, these should be false
      expect(capabilities.hasNativeWidgets).toBe(false);
      expect(capabilities.hasNativeNotifications).toBe(false);
    });

    it('should include browser name on web', () => {
      const capabilities = service.detectPlatform();

      expect(capabilities.browserName).toBe('Chrome');
    });

    it('should cache capabilities on subsequent calls', () => {
      const first = service.detectPlatform();
      const second = service.detectPlatform();

      expect(first).toBe(second); // Same object reference
    });

    it('should reset capabilities when reset is called', () => {
      const first = service.detectPlatform();
      service.reset();
      const second = service.detectPlatform();

      expect(first).not.toBe(second); // Different object references
    });
  });

  describe('hasFeature', () => {
    it('should check if a feature is available', () => {
      expect(service.hasFeature('hasServiceWorker')).toBe(true);
      expect(service.hasFeature('hasMediaDevices')).toBe(true);
      expect(service.hasFeature('hasWebShare')).toBe(false);
    });

    it('should check platform identification', () => {
      expect(service.hasFeature('isWeb')).toBe(true);
      expect(service.hasFeature('isNative')).toBe(false);
    });
  });

  describe('getPlatformName', () => {
    it('should return web browser for web platform', () => {
      const name = service.getPlatformName();

      expect(name).toBe('Web Browser');
    });

    it('should return PWA when in standalone mode', () => {
      const platformUtils = require('../utils/platform');
      platformUtils.isStandalone.mockReturnValue(true);

      service.reset();
      const name = service.getPlatformName();

      expect(name).toBe('PWA');

      // Reset for other tests
      platformUtils.isStandalone.mockReturnValue(false);
    });
  });

  describe('isTouchDevice', () => {
    it('should detect touch device', () => {
      expect(service.isTouchDevice()).toBe(true);
    });

    it('should use platform utils', () => {
      const platformUtils = require('../utils/platform');
      
      service.isTouchDevice();
      
      expect(platformUtils.isTouchDevice).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle development mode detection', () => {
      const capabilities = service.detectPlatform();

      expect(capabilities.isDevelopment).toBe(true);
    });

    it('should handle standalone mode detection', () => {
      const capabilities = service.detectPlatform();

      expect(capabilities.isStandalone).toBe(false);
    });
  });
});
