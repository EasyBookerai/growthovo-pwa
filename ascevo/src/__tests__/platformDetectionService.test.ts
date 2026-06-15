/**
 * Tests for platformDetectionService
 *
 * Covers:
 *  - Unit tests: detectPlatform, trackPlatformAccess, getCachedPlatformInfo
 *  - Platform detection for web, iOS, Android, PWA, React Native
 *  - localStorage caching
 *  - Supabase integration
 *
 * Feature: simplified-splash-routing
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { supabase } from '../services/supabaseClient';
import {
  detectPlatform,
  trackPlatformAccess,
  getCachedPlatformInfo,
  getPlatformEmoji,
  getPlatformDisplayName,
  type PlatformInfo,
  type PlatformSource,
} from '../services/platformDetectionService';

// Mock the supabase client
jest.mock('../services/supabaseClient');

describe('platformDetectionService', () => {
  let originalNavigator: Navigator;
  let originalWindow: Window & typeof globalThis;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Store original values
    originalNavigator = 