// 📊 Performance Monitor Service
// Monitors FPS and automatically degrades effects when performance drops

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePerformanceStore } from '../store';

interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  averageFps: number;
  timestamp: number;
}

interface PerformanceSettings {
  glassmorphismEnabled: boolean;
  animationsEnabled: boolean;
  blurIntensity: 'light' | 'medium' | 'heavy';
  autoDegrade: boolean;
}

const STORAGE_KEY = '@performance_settings';
const FPS_THRESHOLD = 30;
const FRAME_DROP_THRESHOLD = 5;
const MEASUREMENT_INTERVAL = 1000; // 1 second
const DEGRADATION_COOLDOWN = 5000; // 5 seconds

let performanceSettings: PerformanceSettings = {
  glassmorphismEnabled: true,
  animationsEnabled: true,
  blurIntensity: 'medium',
  autoDegrade: true,
};

let currentMetrics: PerformanceMetrics = {
  fps: 60,
  frameDrops: 0,
  averageFps: 60,
  timestamp: Date.now(),
};

let frameCount = 0;
let lastFrameTime = Date.now();
let fpsHistory: number[] = [];
let lastDegradationTime = 0;
let monitoringActive = false;
let rafId: number | null = null;

/**
 * Initialize performance monitoring
 */
export async function initializePerformanceMonitor(): Promise<void> {
  // Load saved settings
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      performanceSettings = { ...performanceSettings, ...JSON.parse(saved) };
      // Sync store with saved settings
      usePerformanceStore.getState().updateSettings(performanceSettings);
    }
  } catch (error) {
    console.warn('Failed to load performance settings:', error);
  }

  // Start monitoring if auto-degrade is enabled
  if (performanceSettings.autoDegrade) {
    startMonitoring();
  }
}

/**
 * Start FPS monitoring
 */
export function startMonitoring(): void {
  if (monitoringActive) return;
  
  monitoringActive = true;
  frameCount = 0;
  lastFrameTime = Date.now();
  fpsHistory = [];

  measureFps();
}

/**
 * Stop FPS monitoring
 */
export function stopMonitoring(): void {
  monitoringActive = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Measure FPS using requestAnimationFrame
 */
function measureFps(): void {
  if (!monitoringActive) return;

  const now = Date.now();
  const delta = now - lastFrameTime;

  if (delta >= MEASUREMENT_INTERVAL) {
    const fps = Math.round((frameCount * 1000) / delta);
    updateMetrics(fps);
    
    frameCount = 0;
    lastFrameTime = now;
  }

  frameCount++;
  rafId = requestAnimationFrame(measureFps);
}

/**
 * Update performance metrics
 */
function updateMetrics(fps: number): void {
  fpsHistory.push(fps);
  if (fpsHistory.length > 10) {
    fpsHistory.shift();
  }

  const averageFps = Math.round(
    fpsHistory.reduce((sum, f) => sum + f, 0) / fpsHistory.length
  );

  const frameDrops = fps < FPS_THRESHOLD ? 1 : 0;

  currentMetrics = {
    fps,
    frameDrops: currentMetrics.frameDrops + frameDrops,
    averageFps,
    timestamp: Date.now(),
  };

  // Check if we need to degrade performance
  if (performanceSettings.autoDegrade) {
    checkAndDegrade();
  }

  // Log metrics for debugging
  logMetrics();
}

/**
 * Check if performance degradation is needed
 */
function checkAndDegrade(): void {
  const now = Date.now();
  
  // Don't degrade too frequently
  if (now - lastDegradationTime < DEGRADATION_COOLDOWN) {
    return;
  }

  // Check if FPS is consistently low
  if (currentMetrics.averageFps < FPS_THRESHOLD) {
    degradePerformance();
    lastDegradationTime = now;
  }

  // Check for frequent frame drops
  if (currentMetrics.frameDrops > FRAME_DROP_THRESHOLD) {
    degradePerformance();
    lastDegradationTime = now;
    currentMetrics.frameDrops = 0; // Reset counter
  }
}

/**
 * Degrade performance settings
 */
function degradePerformance(): void {
  console.log('⚠️ Performance degradation triggered', currentMetrics);
  const { updateSettings } = usePerformanceStore.getState();

  // Step 1: Reduce blur intensity
  if (performanceSettings.blurIntensity === 'heavy') {
    performanceSettings.blurIntensity = 'medium';
    console.log('→ Reduced blur intensity to medium');
    updateSettings({ blurIntensity: 'medium' });
    saveSettings();
    return;
  }

  if (performanceSettings.blurIntensity === 'medium') {
    performanceSettings.blurIntensity = 'light';
    console.log('→ Reduced blur intensity to light');
    updateSettings({ blurIntensity: 'light' });
    saveSettings();
    return;
  }

  // Step 2: Disable glassmorphism
  if (performanceSettings.glassmorphismEnabled) {
    performanceSettings.glassmorphismEnabled = false;
    console.log('→ Disabled glassmorphism');
    updateSettings({ glassmorphismEnabled: false });
    saveSettings();
    return;
  }

  // Step 3: Disable animations
  if (performanceSettings.animationsEnabled) {
    performanceSettings.animationsEnabled = false;
    console.log('→ Disabled animations');
    updateSettings({ animationsEnabled: false });
    saveSettings();
    return;
  }
}

/**
 * Get current performance settings
 */
export function getPerformanceSettings(): PerformanceSettings {
  return { ...performanceSettings };
}

/**
 * Update performance settings
 */
export async function updatePerformanceSettings(
  updates: Partial<PerformanceSettings>
): Promise<void> {
  performanceSettings = { ...performanceSettings, ...updates };
  usePerformanceStore.getState().updateSettings(updates);
  await saveSettings();

  // Restart monitoring if auto-degrade changed
  if ('autoDegrade' in updates) {
    if (updates.autoDegrade) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }
}

/**
 * Save settings to storage
 */
async function saveSettings(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(performanceSettings));
  } catch (error) {
    console.warn('Failed to save performance settings:', error);
  }
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...currentMetrics };
}

/**
 * Reset performance settings to defaults
 */
export async function resetPerformanceSettings(): Promise<void> {
  const defaults: PerformanceSettings = {
    glassmorphismEnabled: true,
    animationsEnabled: true,
    blurIntensity: 'medium',
    autoDegrade: true,
  };
  performanceSettings = { ...defaults };
  usePerformanceStore.getState().updateSettings(defaults);
  await saveSettings();
}

/**
 * Check if glassmorphism should be used based on settings
 */
export function shouldUseGlassmorphism(): boolean {
  return performanceSettings.glassmorphismEnabled;
}

/**
 * Check if animations should be used based on settings
 */
export function shouldUseAnimations(): boolean {
  return performanceSettings.animationsEnabled;
}

/**
 * Get current blur intensity setting
 */
export function getBlurIntensity(): 'light' | 'medium' | 'heavy' {
  return performanceSettings.blurIntensity;
}

/**
 * Log performance metrics
 */
function logMetrics(): void {
  if (__DEV__) {
    console.log('📊 Performance:', {
      fps: currentMetrics.fps,
      avg: currentMetrics.averageFps,
      drops: currentMetrics.frameDrops,
      settings: performanceSettings,
    });
  }
}

/**
 * Check if glassmorphism should be enabled
 */
export function shouldUseGlassmorphism(): boolean {
  return performanceSettings.glassmorphismEnabled;
}

/**
 * Check if animations should be enabled
 */
export function shouldUseAnimations(): boolean {
  return performanceSettings.animationsEnabled;
}

/**
 * Get current blur intensity
 */
export function getBlurIntensity(): 'light' | 'medium' | 'heavy' {
  return performanceSettings.blurIntensity;
}

/**
 * Manually trigger performance check
 */
export function checkPerformance(): void {
  if (performanceSettings.autoDegrade) {
    checkAndDegrade();
  }
}
