/**
 * Web Theme Service — handles CSS class toggling for light/dark modes on web.
 * Works in conjunction with themeService.ts for React Native.
 */

import { Platform } from 'react-native';

/**
 * Apply theme to HTML element (web only)
 */
export function applyWebTheme(theme: 'light' | 'dark'): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  
  const html = document.documentElement;
  
  if (theme === 'light') {
    html.classList.add('light');
    html.classList.remove('dark');
  } else {
    html.classList.add('dark');
    html.classList.remove('light');
  }
}

/**
 * Initialize web theme on app load
 */
export function initWebTheme(theme: 'light' | 'dark'): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  
  applyWebTheme(theme);
}

/**
 * Launch confetti animation (pure CSS + JS, no libraries)
 */
export function launchConfetti(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  
  const colors = ['#7C3AED', '#A78BFA', '#34D399', '#F472B6', '#FBBF24', '#60A5FA'];
  const container = document.body;
  
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // Random properties
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.floor(Math.random() * 6) + 6; // 6-12px
    const left = Math.random() * 100; // 0-100%
    const delay = Math.random() * 200; // 0-200ms
    const duration = (Math.random() * 1.5) + 2.5; // 2.5-4s
    
    confetti.style.backgroundColor = color;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.left = `${left}%`;
    confetti.style.top = '0';
    confetti.style.animationDelay = `${delay}ms`;
    confetti.style.animationDuration = `${duration}s`;
    
    container.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => {
      confetti.remove();
    }, duration * 1000 + delay);
  }
}

/**
 * Show floating XP gain animation
 */
export function showXPGain(amount: number, elementOrPosition?: HTMLElement | { x: number; y: number }): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  
  const xpElement = document.createElement('div');
  xpElement.className = 'xp-gain';
  xpElement.textContent = `+${amount} XP ✨`;
  
  // Position
  if (elementOrPosition instanceof HTMLElement) {
    const rect = elementOrPosition.getBoundingClientRect();
    xpElement.style.left = `${rect.left + rect.width / 2}px`;
    xpElement.style.top = `${rect.top}px`;
  } else if (elementOrPosition) {
    xpElement.style.left = `${elementOrPosition.x}px`;
    xpElement.style.top = `${elementOrPosition.y}px`;
  } else {
    // Center of screen
    xpElement.style.left = '50%';
    xpElement.style.top = '50%';
    xpElement.style.transform = 'translateX(-50%)';
  }
  
  document.body.appendChild(xpElement);
  
  // Remove after animation
  setTimeout(() => {
    xpElement.remove();
  }, 1000);
}

/**
 * Trigger haptic feedback (web vibration API)
 */
export function triggerHaptic(pattern: number | number[]): void {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.vibrate) return;
  
  try {
    navigator.vibrate(pattern);
  } catch (e) {
    // Silent fail on unsupported devices
  }
}

/**
 * Add screen enter animation class
 */
export function animateScreenEnter(element: HTMLElement | null): void {
  if (!element || Platform.OS !== 'web') return;
  
  element.classList.add('screen-enter');
  
  // Remove class after animation
  setTimeout(() => {
    element.classList.remove('screen-enter');
  }, 220);
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Copy text to clipboard (web)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (e) {
    return false;
  }
}
