# Premium Splash & Platform Tracking - Design Document

## 1. Architecture Overview

### 1.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Entry Point (index.html)                 │
│  • Instant inline splash (0ms load)                         │
│  • Service worker registration                              │
│  • Platform detection initialization                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Premium Loading Splash (splash.html)            │
│  • Animated logo with breathing effect                      │
│  • Smooth progress bar (0-100% in 2.5s)                    │
│  • Rotating contextual messages                             │
│  • 6 pillar preview cards with hover states                 │
│  • Smart PWA install prompt (context-aware)                 │
│  • Ambient animated orbs (GPU-accelerated)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Platform Detection Service                    │
│  • User agent parsing                                       │
│  • Standalone mode detection (PWA)                          │
│  • React Native Platform API                                │
│  • Store in localStorage + Supabase                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Smart Routing Logic                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ First-time user?                                     │   │
│  │  → Show onboarding quiz                             │   │
│  │                                                      │   │
│  │ Returning user?                                      │   │
│  │  → Direct to home screen (app.html)                 │   │
│  │                                                      │   │
│  │ Session already active?                              │   │
│  │  → Skip splash entirely                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Premium Home Screen (app.html)                  │
│  • Personalized greeting with user name                     │
│  • Live stats (streak, XP, level) with count-up animation  │
│  • Today's mission card with shimmer effect                 │
│  • Growth pillars grid with progress rings                  │
│  • Smooth bottom navigation with haptic feedback            │
│  • Floating action button for quick check-in                │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
User Opens App
      ↓
Platform Detection
      ↓
Check Session Storage (splash_shown?)
      ↓
   ┌──NO──→ Show Premium Splash (2.5s)
   │              ↓
   │        Track Analytics
   │              ↓
   │        Set session flag
   │              ↓
   └──YES──→ Check Auth Status
                  ↓
            ┌─────┴─────┐
            │           │
      Authenticated   Not Auth
            │           │
            ↓           ↓
    Check Onboarding  Show Auth
            │
      ┌─────┴─────┐
      │           │
  Complete    Incomplete
      │           │
      ↓           ↓
  Home Screen  Onboarding
```

## 2. Premium Design Specifications

### 2.1 Loading Splash Screen (Enhanced)

**Visual Hierarchy:**
```
┌─────────────────────────────────────────────┐
│                                             │
│              [Animated Logo]                │ ← Breathing pulse
│                                             │
│              Growthovo                      │ ← Syne 800, 40px
│        Your AI growth companion             │ ← DM Sans 300, 14px
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ [Progress Bar: 0-100%]                │ │ ← Gradient fill
│  │                                       │ │
│  │ "Waking up Rex, your AI coach..."    │ │ ← Rotating messages
│  │                                       │ │
│  │ ─────────────────────────────────── │ │
│  │                                       │ │
│  │  🧠      💬      💼                  │ │
│  │ Mental Relations Career              │ │ ← Pillar preview
│  │                                       │ │
│  │  💪      💰      🎨                  │ │
│  │ Fitness Finance Hobbies              │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ 📱 Add to home screen                 │ │ ← Smart prompt
│  │    Instant access, no App Store       │ │
│  │                                       │ │
│  │  [Add to home screen →]               │ │ ← CTA button
│  └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**Premium Enhancements:**

1. **Animated Logo**
   - Breathing pulse effect (scale 1.0 → 1.05 → 1.0)
   - Subtle glow on pulse peak
   - 3-layer ellipse with different opacities
   - GPU-accelerated transform

2. **Progress Bar**
   - Smooth gradient fill (purple → teal)
   - Shimmer effect overlay
   - Easing: cubic-bezier(0.16, 1, 0.3, 1)
   - Duration: 2500ms

3. **Loading Messages**
   - Fade in/out transitions (400ms)
   - Contextual messages based on time of day
   - Rotate every 600ms
   - Messages:
     - "Waking up Rex, your AI coach..."
     - "Loading your 6 growth pillars..."
     - "Preparing today's mission..."
     - "Almost ready..."

4. **Pillar Pills**
   - Hover state: lift 2px, brighten background
   - Staggered fade-in animation
   - Micro-bounce on hover
   - Touch feedback on mobile

5. **PWA Install Card**
   - Glass morphism effect
   - Backdrop blur: 24px
   - Border gradient
   - Smart visibility:
     - Hide if already installed
     - Show iOS instructions on iOS
     - Show native prompt on Android/Desktop

6. **Ambient Orbs**
   - 3 floating orbs with blur
   - Subtle movement animation
   - Different colors (purple, teal, lavender)
   - GPU-accelerated (will-change: transform)

### 2.2 Home Screen (Premium Redesign)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  Hey, Champion! 👋              [Profile]   │ ← Personalized
│                                             │
│  ┌─────┐  ┌─────┐  ┌─────┐               │
│  │  0  │  │  0  │  │  1  │               │ ← Stats with
│  │ Day │  │ XP  │  │Level│               │   count-up
│  └─────┘  └─────┘  └─────┘               │
│                                             │
│  Today's Mission                            │
│  ┌───────────────────────────────────────┐ │
│  │ 🎯 Complete Your First Check-in       │ │ ← Mission card
│  │                                       │ │   with shimmer
│  │ Take 2 minutes to reflect...          │ │
│  │                                       │ │
│  │ +50 XP 💎                             │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  [Start Daily Check-in →]                  │ ← Primary CTA
│                                             │
│  Your Growth Pillars                        │
│  ┌─────────┐  ┌─────────┐                 │
│  │   🧠    │  │   💬    │                 │ ← Pillar cards
│  │ Mental  │  │Relations│                 │   with progress
│  │ Level 1 │  │ Level 1 │                 │   rings
│  └─────────┘  └─────────┘                 │
│  ┌─────────┐  ┌─────────┐                 │
│  │   💼    │  │   💪    │                 │
│  │ Career  │  │ Fitness │                 │
│  │ Level 1 │  │ Level 1 │                 │
│  └─────────┘  └─────────┘                 │
│                                             │
│ ─────────────────────────────────────────  │
│  🏠    🎯    💬    🏆    👤               │ ← Bottom nav
│ Home Pillars Rex League Profile            │
└─────────────────────────────────────────────┘
```

**Premium Enhancements:**

1. **Personalized Greeting**
   - Dynamic based on time of day
   - User's name with gradient color
   - Animated wave emoji

2. **Stats Cards**
   - Count-up animation on load
   - Gradient backgrounds
   - Subtle pulse on update
   - Glass morphism effect

3. **Mission Card**
   - Gradient border animation
   - Shimmer effect on hover
   - Micro-interaction on tap
   - Progress indicator if partially complete

4. **Primary CTA Button**
   - Gradient background
   - Hover: lift + glow
   - Active: scale down
   - Ripple effect on click

5. **Pillar Cards**
   - Circular progress rings
   - Hover: lift + brighten
   - Tap: scale + haptic feedback
   - Staggered load animation

6. **Bottom Navigation**
   - Active state: color + scale
   - Smooth transitions
   - Haptic feedback on tap
   - Badge notifications

### 2.3 Animation Specifications

**Timing Functions:**
```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

**Durations:**
```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-splash: 2500ms;
```

**Key Animations:**

1. **Fade In Up**
   ```css
   @keyframes fadeInUp {
     from {
       opacity: 0;
       transform: translateY(16px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }
   ```

2. **Breathing Pulse**
   ```css
   @keyframes breathe {
     0%, 100% {
       transform: scale(1);
       opacity: 0.7;
     }
     50% {
       transform: scale(1.05);
       opacity: 1;
     }
   }
   ```

3. **Shimmer Effect**
   ```css
   @keyframes shimmer {
     0% {
       background-position: -1000px 0;
     }
     100% {
       background-position: 1000px 0;
     }
   }
   ```

4. **Count Up**
   ```javascript
   function countUp(element, target, duration) {
     const start = 0;
     const increment = target / (duration / 16);
     let current = start;
     
     const timer = setInterval(() => {
       current += increment;
       if (current >= target) {
         element.textContent = target;
         clearInterval(timer);
       } else {
         element.textContent = Math.floor(current);
       }
     }, 16);
   }
   ```

### 2.4 Color System (Premium Palette)

```css
/* Primary Colors */
--color-primary: #7C3AED;           /* Purple 600 */
--color-primary-light: #A78BFA;     /* Purple 400 */
--color-primary-dark: #6D28D9;      /* Purple 700 */

/* Accent Colors */
--color-accent-teal: #14B8A6;       /* Teal 500 */
--color-accent-green: #34D399;      /* Green 400 */
--color-accent-blue: #60A5FA;       /* Blue 400 */

/* Neutral Colors */
--color-background: #08080F;        /* Near black */
--color-surface: #1A1A24;           /* Dark surface */
--color-surface-elevated: #252530;  /* Elevated surface */

/* Text Colors */
--color-text-primary: #FFFFFF;      /* White */
--color-text-secondary: rgba(255, 255, 255, 0.85);
--color-text-muted: rgba(255, 255, 255, 0.5);
--color-text-disabled: rgba(255, 255, 255, 0.3);

/* Semantic Colors */
--color-success: #34D399;
--color-warning: #FBBF24;
--color-error: #F87171;
--color-info: #60A5FA;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%);
--gradient-accent: linear-gradient(90deg, #7C3AED, #34D399);
--gradient-surface: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(167, 139, 250, 0.10) 100%);
```

### 2.5 Typography System

```css
/* Font Families */
--font-display: 'Syne', sans-serif;
--font-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 11px;
--text-sm: 12px;
--text-base: 14px;
--text-lg: 16px;
--text-xl: 18px;
--text-2xl: 20px;
--text-3xl: 24px;
--text-4xl: 28px;
--text-5xl: 36px;
--text-6xl: 40px;

/* Font Weights */
--weight-light: 300;
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;

/* Line Heights */
--leading-tight: 1.1;
--leading-snug: 1.3;
--leading-normal: 1.5;
--leading-relaxed: 1.7;
```

## 3. Platform Detection Service

### 3.1 Detection Logic

```typescript
// src/services/platformDetectionService.ts

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

export function detectPlatform(): PlatformInfo {
  const ua = navigator.userAgent;
  const isStandalone = 
    ('standalone' in window.navigator && window.navigator.standalone) ||
    window.matchMedia('(display-mode: standalone)').matches;
  
  let source: PlatformSource = 'web';
  let isMobile = false;
  
  // Check for React Native
  if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
    const platform = (window as any).Platform;
    source = platform?.OS === 'ios' ? 'ios' : 'android';
    isMobile = true;
  }
  // Check for PWA
  else if (isStandalone) {
    source = 'pwa';
    isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  }
  // Check for mobile browser
  else if (/iPhone|iPad|iPod/i.test(ua)) {
    source = 'web';
    isMobile = true;
  }
  else if (/Android/i.test(ua)) {
    source = 'web';
    isMobile = true;
  }
  
  return {
    source,
    userAgent: ua,
    isStandalone,
    isMobile,
    timestamp: new Date().toISOString(),
  };
}

export async function trackPlatformAccess(userId: string, platformInfo: PlatformInfo) {
  // Store in localStorage for quick access
  localStorage.setItem('growthovo_platform', JSON.stringify(platformInfo));
  
  // Send to Supabase
  await supabase
    .from('users')
    .update({
      platform_source: platformInfo.source,
      last_access_platform: platformInfo.source,
      platform_updated_at: platformInfo.timestamp,
    })
    .eq('id', userId);
  
  // Track analytics event
  if (window.gtag) {
    window.gtag('event', 'platform_detected', {
      platform_source: platformInfo.source,
      is_mobile: platformInfo.isMobile,
      is_standalone: platformInfo.isStandalone,
    });
  }
}
```

### 3.2 Database Schema

```sql
-- Migration: 20240040_platform_tracking.sql

ALTER TABLE users
ADD COLUMN IF NOT EXISTS platform_source TEXT CHECK (platform_source IN ('web', 'ios', 'android', 'pwa')),
ADD COLUMN IF NOT EXISTS first_access_platform TEXT CHECK (first_access_platform IN ('web', 'ios', 'android', 'pwa')),
ADD COLUMN IF NOT EXISTS last_access_platform TEXT CHECK (last_access_platform IN ('web', 'ios', 'android', 'pwa')),
ADD COLUMN IF NOT EXISTS platform_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Set first_access_platform on first update
CREATE OR REPLACE FUNCTION set_first_access_platform()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.first_access_platform IS NULL AND NEW.platform_source IS NOT NULL THEN
    NEW.first_access_platform := NEW.platform_source;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_first_access_platform
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_first_access_platform();

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_users_platform_source ON users(platform_source);
CREATE INDEX IF NOT EXISTS idx_users_first_access_platform ON users(first_access_platform);
```

## 4. Routing Logic

### 4.1 Enhanced Splash Screen Router

```javascript
// splash.html - Enhanced routing logic

const hideSplash = () => {
  clearInterval(messageInterval);
  const splashContainer = document.getElementById('splash-container');
  
  // Smooth fade out
  splashContainer.classList.add('fade-out');
  
  setTimeout(() => {
    splashContainer.style.display = 'none';
    splashContainer.remove();
    sessionStorage.setItem('growthovo_splashed', 'true');
    
    // Platform detection
    const platformInfo = detectPlatform();
    localStorage.setItem('growthovo_platform', JSON.stringify(platformInfo));
    
    // Analytics
    trackSplashCompletion(platformInfo);
    
    // Smart routing
    const hasOnboarded = localStorage.getItem('growthovo_onboarded');
    const isAuthenticated = localStorage.getItem('growthovo_auth_token');
    
    if (!isAuthenticated) {
      window.location.href = '/auth.html';
    } else if (hasOnboarded === 'true') {
      window.location.href = '/app.html';
    } else {
      window.location.href = '/onboarding.html';
    }
  }, 500);
};

// Auto-hide after 2.5s with smooth progress
const autoHideTimer = setTimeout(hideSplash, 2500);

// Preload next screen for instant transition
const preloadNextScreen = () => {
  const hasOnboarded = localStorage.getItem('growthovo_onboarded');
  const nextScreen = hasOnboarded === 'true' ? '/app.html' : '/onboarding.html';
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = nextScreen;
  document.head.appendChild(link);
};

preloadNextScreen();
```

### 4.2 Index.html Router

```javascript
// index.html - Instant routing

(function() {
  const hasSeenSplash = sessionStorage.getItem('growthovo_splashed');
  const hasOnboarded = localStorage.getItem('growthovo_onboarded');
  const isAuthenticated = localStorage.getItem('growthovo_auth_token');
  
  if (!hasSeenSplash) {
    // First visit - show splash
    window.location.href = '/splash.html';
  } else if (!isAuthenticated) {
    // Not logged in - show auth
    window.location.href = '/auth.html';
  } else if (hasOnboarded === 'true') {
    // Returning user - direct to home
    window.location.href = '/app.html';
  } else {
    // New user - show onboarding
    window.location.href = '/onboarding.html';
  }
})();
```

## 5. Performance Optimizations

### 5.1 Loading Performance

1. **Critical CSS Inline**
   - Inline splash screen styles in `<head>`
   - Defer non-critical CSS
   - Use font-display: swap

2. **Resource Hints**
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="dns-prefetch" href="https://your-supabase-url.supabase.co">
   <link rel="prefetch" href="/app.html">
   ```

3. **Image Optimization**
   - Use WebP with PNG fallback
   - Lazy load below-the-fold images
   - Responsive images with srcset

4. **JavaScript Optimization**
   - Defer non-critical scripts
   - Use dynamic imports
   - Tree-shake unused code

### 5.2 Animation Performance

1. **GPU Acceleration**
   ```css
   .animated-element {
     will-change: transform, opacity;
     transform: translateZ(0);
     backface-visibility: hidden;
   }
   ```

2. **Reduce Paint**
   - Use transform instead of top/left
   - Use opacity instead of visibility
   - Avoid layout thrashing

3. **RequestAnimationFrame**
   ```javascript
   function smoothScroll(element, target) {
     const start = element.scrollTop;
     const distance = target - start;
     const duration = 300;
     let startTime = null;
     
     function animation(currentTime) {
       if (!startTime) startTime = currentTime;
       const elapsed = currentTime - startTime;
       const progress = Math.min(elapsed / duration, 1);
       const easing = easeOutCubic(progress);
       
       element.scrollTop = start + distance * easing;
       
       if (progress < 1) {
         requestAnimationFrame(animation);
       }
     }
     
     requestAnimationFrame(animation);
   }
   ```

### 5.3 Bundle Size

- Target: < 50KB gzipped for initial load
- Code splitting by route
- Lazy load heavy components
- Use dynamic imports for analytics

## 6. Analytics Integration

### 6.1 Events to Track

```typescript
// Platform Events
trackEvent('platform_detected', {
  platform_source: 'web' | 'ios' | 'android' | 'pwa',
  is_mobile: boolean,
  is_standalone: boolean,
});

// Splash Events
trackEvent('splash_view', {
  platform_source: string,
  duration_ms: number,
});

trackEvent('splash_skip', {
  platform_source: string,
  time_remaining_ms: number,
});

// Navigation Events
trackEvent('navigate_to_home', {
  platform_source: string,
  from_splash: boolean,
});

// PWA Events
trackEvent('pwa_install_prompt_shown', {
  platform_source: string,
});

trackEvent('pwa_install_accepted', {
  platform_source: string,
});
```

### 6.2 Platform Segmentation

```sql
-- Analytics queries

-- User distribution by platform
SELECT 
  platform_source,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM users
WHERE platform_source IS NOT NULL
GROUP BY platform_source;

-- Retention by platform
SELECT 
  first_access_platform,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT CASE WHEN last_seen_at > NOW() - INTERVAL '7 days' THEN user_id END) as active_7d,
  ROUND(
    COUNT(DISTINCT CASE WHEN last_seen_at > NOW() - INTERVAL '7 days' THEN user_id END) * 100.0 / 
    COUNT(DISTINCT user_id), 
    2
  ) as retention_rate_7d
FROM users
WHERE first_access_platform IS NOT NULL
GROUP BY first_access_platform;
```

## 7. Accessibility

### 7.1 WCAG 2.1 AA Compliance

1. **Color Contrast**
   - Text: 4.5:1 minimum
   - Large text: 3:1 minimum
   - Interactive elements: 3:1 minimum

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Visible focus indicators
   - Logical tab order

3. **Screen Reader Support**
   ```html
   <button aria-label="Start daily check-in">
     Start Daily Check-in →
   </button>
   
   <div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
     Loading...
   </div>
   ```

4. **Reduced Motion**
   ```css
   @media (prefers-reduced-motion: reduce) {
     * {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

## 8. Testing Strategy

### 8.1 Visual Regression Testing
- Capture screenshots of splash screen
- Compare across platforms
- Test animation states

### 8.2 Performance Testing
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s

### 8.3 Platform Testing Matrix
- iOS Safari (mobile)
- Android Chrome (mobile)
- Desktop Chrome
- Desktop Safari
- PWA (installed)
- React Native WebView

## 9. Success Metrics

### 9.1 Performance KPIs
- Splash screen load time: < 500ms
- Time to home screen: < 3s
- Animation frame rate: 60fps
- Bundle size: < 50KB gzipped

### 9.2 User Experience KPIs
- Bounce rate: < 5%
- PWA install rate: > 15%
- Platform detection accuracy: 100%
- User satisfaction: > 4.5/5

### 9.3 Business KPIs
- Platform distribution visibility
- Retention by platform
- Feature adoption by platform
- Conversion rate by platform
