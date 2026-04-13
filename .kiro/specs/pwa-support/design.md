# Design Document: PWA Support

## Overview

This design document outlines the architecture and implementation strategy for adding Progressive Web App (PWA) support to the Growthovo React Native application. The solution leverages React Native Web to compile React Native components for web browsers, implements PWA features through service workers and web manifests, and provides graceful degradation for platform-specific features.

The design follows a progressive enhancement approach: core functionality works across all platforms, with enhanced experiences on modern browsers that support advanced APIs. The architecture maintains a single codebase for mobile and web while using platform detection and feature flags to adapt behavior appropriately.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Growthovo Application                       │
│                   (React Native Codebase)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │   Native Platform    │    │    Web Platform      │
    │   (iOS/Android)      │    │  (React Native Web)  │
    └──────────────────────┘    └──────────────────────┘
                                            │
                                            │
                        ┌───────────────────┼───────────────────┐
                        │                   │                   │
                        ▼                   ▼                   ▼
            ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
            │  Service Worker  │ │   Web Manifest   │ │  Platform APIs   │
            │  (Offline/Push)  │ │ (Installability) │ │ (Media, Storage) │
            └──────────────────┘ └──────────────────┘ └──────────────────┘
                        │                   │                   │
                        └───────────────────┼───────────────────┘
                                            │
                                            ▼
                                ┌──────────────────────┐
                                │   Supabase Backend   │
                                │  (Auth, Data, Edge)  │
                                └──────────────────────┘
```

### Platform Detection Layer

The application uses a platform detection layer to determine runtime environment and available features:

```typescript
interface PlatformCapabilities {
  isWeb: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  hasServiceWorker: boolean;
  hasMediaDevices: boolean;
  hasWebPush: boolean;
  hasNativeWidgets: boolean;
  hasNativeNotifications: boolean;
}

// Platform detection service
const detectPlatform = (): PlatformCapabilities => {
  const isWeb = Platform.OS === 'web';
  const isMobile = isWeb ? /Mobile|Android|iPhone/i.test(navigator.userAgent) : true;
  
  return {
    isWeb,
    isMobile,
    isDesktop: isWeb && !isMobile,
    hasServiceWorker: 'serviceWorker' in navigator,
    hasMediaDevices: 'mediaDevices' in navigator,
    hasWebPush: 'PushManager' in window,
    hasNativeWidgets: !isWeb,
    hasNativeNotifications: !isWeb,
  };
};
```

### Build Configuration

The build system uses Expo's web support with custom webpack configuration:

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  plugins: [
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.supabase\.co/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300, // 5 minutes
            },
          },
        },
      ],
    }),
  ],
};
```

## Components and Interfaces

### 1. PWA Configuration Module

**Purpose:** Manages PWA manifest generation and service worker registration.

**Interface:**

```typescript
interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  icons: Icon[];
  startUrl: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
}

interface Icon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

class PWAManager {
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null>;
  static async unregisterServiceWorker(): Promise<boolean>;
  static async checkForUpdates(): Promise<boolean>;
  static getManifest(): PWAConfig;
}
```

**Implementation Notes:**
- Service worker registration happens after app initialization to avoid blocking
- Update checks occur on app focus and periodically (every 1 hour)
- Manifest is generated dynamically based on app configuration

### 2. Platform Adapter Service

**Purpose:** Provides unified API for platform-specific features with automatic fallbacks.

**Interface:**

```typescript
interface PlatformAdapter {
  // Notifications
  requestNotificationPermission(): Promise<PermissionStatus>;
  scheduleNotification(notification: NotificationConfig): Promise<string>;
  cancelNotification(id: string): Promise<void>;
  
  // Media
  requestCameraPermission(): Promise<PermissionStatus>;
  requestMicrophonePermission(): Promise<PermissionStatus>;
  startVideoRecording(options: RecordingOptions): Promise<MediaRecorder>;
  startAudioRecording(options: RecordingOptions): Promise<MediaRecorder>;
  
  // Storage
  saveToGallery(uri: string): Promise<void>;
  pickImage(): Promise<ImageResult>;
  
  // Widgets
  updateWidget(data: WidgetData): Promise<void>;
  getWidgetCapabilities(): WidgetCapabilities;
}

class WebPlatformAdapter implements PlatformAdapter {
  // Web-specific implementations using browser APIs
}

class NativePlatformAdapter implements PlatformAdapter {
  // Native implementations using Expo modules
}
```

### 3. Service Worker Manager

**Purpose:** Handles offline caching, background sync, and push notifications.

**Service Worker Structure:**

```typescript
// service-worker.ts
interface CacheStrategy {
  cacheName: string;
  urlPattern: RegExp;
  handler: 'CacheFirst' | 'NetworkFirst' | 'StaleWhileRevalidate';
  expiration?: {
    maxEntries: number;
    maxAgeSeconds: number;
  };
}

const cacheStrategies: CacheStrategy[] = [
  {
    cacheName: 'app-shell',
    urlPattern: /\.(js|css|html)$/,
    handler: 'CacheFirst',
    expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
  },
  {
    cacheName: 'images',
    urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
    handler: 'CacheFirst',
    expiration: { maxEntries: 100, maxAgeSeconds: 604800 },
  },
  {
    cacheName: 'api-data',
    urlPattern: /^https:\/\/.*\.supabase\.co/,
    handler: 'NetworkFirst',
    expiration: { maxEntries: 50, maxAgeSeconds: 300 },
  },
];

// Background sync for offline actions
interface SyncTask {
  id: string;
  type: 'check-in' | 'progress-update' | 'streak-update';
  data: any;
  timestamp: number;
  retries: number;
}

class BackgroundSyncManager {
  static async queueTask(task: SyncTask): Promise<void>;
  static async processSyncQueue(): Promise<void>;
  static async retryFailedTasks(): Promise<void>;
}
```

### 4. Media Recording Service

**Purpose:** Provides unified interface for video/audio recording across platforms.

**Interface:**

```typescript
interface RecordingOptions {
  type: 'video' | 'audio';
  maxDuration?: number;
  quality?: 'low' | 'medium' | 'high';
}

interface RecordingResult {
  uri: string;
  duration: number;
  size: number;
  mimeType: string;
}

class MediaRecordingService {
  async startRecording(options: RecordingOptions): Promise<void>;
  async stopRecording(): Promise<RecordingResult>;
  async pauseRecording(): Promise<void>;
  async resumeRecording(): Promise<void>;
  getRecordingState(): 'idle' | 'recording' | 'paused';
  
  // Web-specific implementation
  private async initWebRecorder(options: RecordingOptions): Promise<MediaRecorder>;
  private async requestMediaPermissions(type: 'video' | 'audio'): Promise<MediaStream>;
}
```

**Web Implementation:**

```typescript
class WebMediaRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  
  async start(options: RecordingOptions): Promise<void> {
    const constraints = {
      video: options.type === 'video' ? { width: 1280, height: 720 } : false,
      audio: true,
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    // Determine supported MIME type
    const mimeType = this.getSupportedMimeType(options.type);
    
    this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.start();
  }
  
  private getSupportedMimeType(type: 'video' | 'audio'): string {
    const types = type === 'video'
      ? ['video/webm;codecs=vp9', 'video/webm', 'video/mp4']
      : ['audio/webm', 'audio/mp4', 'audio/wav'];
    
    return types.find(t => MediaRecorder.isTypeSupported(t)) || types[0];
  }
}
```

### 5. Web Push Notification Service

**Purpose:** Manages push notification subscriptions and delivery on web.

**Interface:**

```typescript
interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class WebPushService {
  async requestPermission(): Promise<NotificationPermission>;
  async subscribe(): Promise<PushSubscription>;
  async unsubscribe(): Promise<void>;
  async getSubscription(): Promise<PushSubscription | null>;
  
  // Store subscription in Supabase
  async saveSubscription(userId: string, subscription: PushSubscription): Promise<void>;
  async deleteSubscription(userId: string): Promise<void>;
}
```

**Service Worker Push Handler:**

```typescript
// In service worker
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json();
  
  const options: NotificationOptions = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: data.url,
      type: data.type,
    },
    actions: data.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

### 6. Responsive Layout Manager

**Purpose:** Adapts UI layout based on screen size and device type.

**Interface:**

```typescript
interface BreakpointConfig {
  mobile: number;    // < 768px
  tablet: number;    // 768px - 1024px
  desktop: number;   // > 1024px
}

interface LayoutContext {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
}

class ResponsiveLayoutManager {
  static useLayout(): LayoutContext;
  static useBreakpoint(): 'mobile' | 'tablet' | 'desktop';
  static useOrientation(): 'portrait' | 'landscape';
}
```

**Usage Example:**

```typescript
const HomeScreen = () => {
  const { breakpoint } = ResponsiveLayoutManager.useLayout();
  
  return (
    <View style={styles.container}>
      {breakpoint === 'desktop' ? (
        <TwoColumnLayout />
      ) : (
        <SingleColumnLayout />
      )}
    </View>
  );
};
```

### 7. Offline Sync Manager

**Purpose:** Manages data synchronization when transitioning between offline and online states.

**Interface:**

```typescript
interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

class OfflineSyncManager {
  async queueOperation(operation: Omit<SyncOperation, 'id' | 'status'>): Promise<string>;
  async syncPendingOperations(): Promise<SyncResult[]>;
  async getPendingOperations(): Promise<SyncOperation[]>;
  async clearCompletedOperations(): Promise<void>;
  
  // Conflict resolution
  async resolveConflict(operation: SyncOperation, serverData: any): Promise<any>;
}

interface SyncResult {
  operationId: string;
  success: boolean;
  error?: string;
}
```

**Storage Implementation:**

```typescript
class IndexedDBStorage {
  private db: IDBDatabase;
  
  async saveOperation(operation: SyncOperation): Promise<void> {
    const tx = this.db.transaction(['sync_queue'], 'readwrite');
    const store = tx.objectStore('sync_queue');
    await store.add(operation);
  }
  
  async getOperations(): Promise<SyncOperation[]> {
    const tx = this.db.transaction(['sync_queue'], 'readonly');
    const store = tx.objectStore('sync_queue');
    return await store.getAll();
  }
}
```

### 8. Stripe Web Integration

**Purpose:** Handles payment processing on web using Stripe's web SDK.

**Interface:**

```typescript
interface StripeWebConfig {
  publishableKey: string;
  returnUrl: string;
  cancelUrl: string;
}

class StripeWebService {
  private stripe: Stripe;
  
  async initialize(config: StripeWebConfig): Promise<void>;
  async createCheckoutSession(priceId: string): Promise<string>;
  async redirectToCheckout(sessionId: string): Promise<void>;
  async createCustomerPortalSession(): Promise<string>;
  async redirectToCustomerPortal(): Promise<void>;
}
```

**Implementation:**

```typescript
class StripeWebService {
  async createCheckoutSession(priceId: string): Promise<string> {
    // Call Supabase Edge Function to create session
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId, platform: 'web' },
    });
    
    if (error) throw error;
    return data.sessionId;
  }
  
  async redirectToCheckout(sessionId: string): Promise<void> {
    const { error } = await this.stripe.redirectToCheckout({ sessionId });
    if (error) throw error;
  }
}
```

### 9. Widget Alternative Component

**Purpose:** Provides web-based alternatives to native widgets.

**Interface:**

```typescript
interface WidgetData {
  streak: number;
  dailyProgress: number;
  dailyGoal: number;
  xp: number;
}

const WebWidgetDashboard: React.FC = () => {
  const widgetData = useWidgetData();
  
  return (
    <View style={styles.dashboard}>
      <StreakCard streak={widgetData.streak} />
      <ProgressCard 
        progress={widgetData.dailyProgress} 
        goal={widgetData.dailyGoal} 
      />
      <XPCard xp={widgetData.xp} />
    </View>
  );
};
```

### 10. SEO Manager

**Purpose:** Manages meta tags, structured data, and SEO optimization.

**Interface:**

```typescript
interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogType: string;
  twitterCard: 'summary' | 'summary_large_image';
  canonicalUrl: string;
}

class SEOManager {
  static setPageMeta(config: SEOConfig): void;
  static generateStructuredData(type: string, data: any): string;
  static updateMetaTags(tags: Record<string, string>): void;
}
```

**Implementation:**

```typescript
class SEOManager {
  static setPageMeta(config: SEOConfig): void {
    // Update document title
    document.title = config.title;
    
    // Update meta tags
    this.updateMetaTags({
      'description': config.description,
      'keywords': config.keywords.join(', '),
      'og:title': config.title,
      'og:description': config.description,
      'og:image': config.ogImage,
      'og:type': config.ogType,
      'twitter:card': config.twitterCard,
      'twitter:title': config.title,
      'twitter:description': config.description,
      'twitter:image': config.ogImage,
    });
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', config.canonicalUrl);
  }
}
```

## Data Models

### PWA Installation State

```typescript
interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  installPromptEvent: BeforeInstallPromptEvent | null;
  lastPromptDate: Date | null;
}
```

### Service Worker State

```typescript
interface ServiceWorkerState {
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
  lastUpdateCheck: Date | null;
}
```

### Platform Feature Flags

```typescript
interface FeatureFlags {
  // Core features
  offlineMode: boolean;
  pushNotifications: boolean;
  videoRecording: boolean;
  audioRecording: boolean;
  
  // Platform-specific
  nativeWidgets: boolean;
  nativeShare: boolean;
  nativePayments: boolean;
  
  // Web-specific
  webPush: boolean;
  serviceWorker: boolean;
  installPrompt: boolean;
}
```

### Offline Queue Entry

```typescript
interface OfflineQueueEntry {
  id: string;
  operation: 'check-in' | 'progress' | 'streak' | 'lesson-complete';
  payload: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified several areas where properties can be consolidated:

**Redundancy Analysis:**
1. Properties 5.5 and 5.6 (feature unavailability handling) can be combined into a single comprehensive property about graceful degradation
2. Properties 3.5 and 3.6 (caching strategies) are related but test different behaviors, so both should remain
3. Properties 11.1 and 11.3 (offline storage and sync) are complementary - one tests storage, one tests sync - both needed
4. Properties 19.2 and 19.3 (HTTPS and XSS) test different security aspects and should remain separate
5. Properties 20.2, 20.3, 20.6, and 20.7 (accessibility) each test distinct aspects and should remain separate

**Consolidation Decisions:**
- Combine 5.5 and 5.6 into a single "graceful degradation" property
- Keep all other properties as they provide unique validation value

### Correctness Properties

Property 1: Platform-specific code resolution
*For any* platform-specific import or API call, the system should resolve to the correct implementation (web or native) based on the runtime platform
**Validates: Requirements 1.4**

Property 2: Cached content served offline
*For any* resource that has been cached by the service worker, when the network is unavailable, that resource should be served from cache
**Validates: Requirements 3.3**

Property 3: Static asset cache-first strategy
*For any* static asset (JS, CSS, images), the service worker should check the cache first before making a network request
**Validates: Requirements 3.5**

Property 4: API request network-first strategy
*For any* API request, the service worker should attempt the network first and only fall back to cache if the network fails
**Validates: Requirements 3.6**

Property 5: Offline request queueing
*For any* API request that fails while offline, the system should add it to a queue and retry when connectivity is restored
**Validates: Requirements 3.7**

Property 6: Responsive layout adaptation
*For any* screen size change that crosses a breakpoint threshold (768px or 1024px), the layout should adapt to the appropriate breakpoint (mobile, tablet, or desktop)
**Validates: Requirements 4.1, 4.4**

Property 7: Navigation pattern adaptation
*For any* device type (mobile, tablet, desktop), the navigation component should render using the appropriate pattern for that device type
**Validates: Requirements 4.6**

Property 8: Graceful feature degradation
*For any* unavailable browser feature, the system should hide or disable related UI elements and display an informative message to the user
**Validates: Requirements 5.5, 5.6**

Property 9: Widget data real-time updates
*For any* change to widget data (streak, progress, XP), the web-based widget alternative should reflect the updated value within the next render cycle
**Validates: Requirements 6.4**

Property 10: Recording format compatibility
*For any* completed recording (video or audio), the output format should be one of the browser-supported formats (WebM, MP4 for video; WebM, MP3, WAV for audio)
**Validates: Requirements 7.5**

Property 11: Offline action storage
*For any* user action performed while offline (check-in, progress update, streak update), the system should store it locally in IndexedDB or localStorage
**Validates: Requirements 11.1**

Property 12: Online sync of pending changes
*For any* pending change stored locally, when connectivity is restored, the system should sync it to Supabase
**Validates: Requirements 11.3**

Property 13: Exponential backoff on sync failure
*For any* sync operation that fails, subsequent retry attempts should use exponentially increasing delays (e.g., 1s, 2s, 4s, 8s)
**Validates: Requirements 11.7**

Property 14: HTTPS for all requests
*For any* network request made by the application, the URL protocol should be HTTPS
**Validates: Requirements 19.2**

Property 15: User input sanitization
*For any* user-provided input that is rendered in the UI, the system should sanitize it to prevent XSS attacks by escaping HTML special characters
**Validates: Requirements 19.3**

Property 16: Progressive enhancement
*For any* modern browser API that is available, the system should enable enhanced features that use that API
**Validates: Requirements 18.2**

Property 17: Keyboard navigation support
*For any* interactive element (button, link, input), the element should be reachable and operable using only keyboard navigation (Tab, Enter, Space)
**Validates: Requirements 20.2**

Property 18: ARIA attributes presence
*For any* interactive element or custom component, the element should have appropriate ARIA labels, roles, or descriptions
**Validates: Requirements 20.3**

Property 19: Focus indicator visibility
*For any* focus change to an interactive element, a visible focus indicator should be displayed
**Validates: Requirements 20.6**

Property 20: Text alternatives for non-text content
*For any* non-text content (images, icons, videos), the element should have a text alternative (alt text, aria-label, or caption)
**Validates: Requirements 20.7**

Property 21: Error reporting
*For any* JavaScript error or exception that occurs, the system should send an error report to the monitoring service with stack trace and context
**Validates: Requirements 15.7**

## Error Handling

### Service Worker Errors

**Registration Failures:**
- If service worker registration fails, log the error and continue without offline support
- Display a non-intrusive message to the user about limited offline functionality
- Retry registration on next app load

**Cache Failures:**
- If cache operations fail, fall back to network-only mode
- Log cache errors for monitoring
- Clear corrupted caches and reinitialize

**Update Failures:**
- If service worker update fails, continue using the current version
- Retry update check on next app focus
- Notify user if they're using an outdated version

### Media Recording Errors

**Permission Denied:**
- Display clear message explaining why permission is needed
- Provide link to browser settings for permission management
- Disable recording features gracefully

**Unsupported Browser:**
- Detect MediaDevices API availability before showing recording UI
- Display message about browser compatibility
- Suggest alternative browsers or native app

**Recording Failures:**
- Catch MediaRecorder errors and display user-friendly messages
- Clean up media streams properly
- Allow user to retry recording

### Offline Sync Errors

**Conflict Resolution:**
- Use "last write wins" strategy for simple data
- For critical data (streaks), prefer server data and notify user
- Log conflicts for analysis

**Sync Failures:**
- Implement exponential backoff (1s, 2s, 4s, 8s, 16s, max 60s)
- After 5 failed attempts, mark operation as failed
- Allow user to manually retry failed operations
- Display sync status in UI

**Storage Quota Exceeded:**
- Detect quota errors and clean up old cached data
- Prioritize critical data (user progress, streaks)
- Notify user if storage is critically low

### Payment Errors

**Stripe Initialization Failures:**
- Fall back to displaying pricing information without checkout
- Log initialization errors
- Provide alternative contact method for purchases

**Checkout Session Errors:**
- Display clear error messages from Stripe
- Allow user to retry
- Provide support contact information

**Webhook Processing Errors:**
- Implement idempotent webhook handling
- Log all webhook events for debugging
- Retry failed webhook processing

### Authentication Errors

**Session Expiry:**
- Detect expired sessions on API calls
- Redirect to login with return URL
- Preserve user's current state

**OAuth Failures:**
- Handle OAuth errors gracefully
- Provide fallback to email/password auth
- Display clear error messages

**Network Errors:**
- Retry authentication requests with exponential backoff
- Cache authentication state for offline access
- Display connection status to user

## Testing Strategy

### Dual Testing Approach

The testing strategy combines unit tests for specific scenarios and property-based tests for universal properties:

**Unit Tests:**
- Specific examples of feature behavior
- Edge cases (empty inputs, boundary values)
- Error conditions and failure modes
- Integration points between components
- Browser-specific workarounds

**Property-Based Tests:**
- Universal properties that hold for all inputs
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: **Feature: pwa-support, Property {number}: {property_text}**

### Property-Based Testing Configuration

**Library Selection:**
- **JavaScript/TypeScript**: Use `fast-check` library
- Configuration: Minimum 100 iterations per test
- Seed-based reproducibility for failed tests

**Example Property Test:**

```typescript
import fc from 'fast-check';

// Feature: pwa-support, Property 11: Offline action storage
describe('Offline action storage', () => {
  it('should store any user action performed while offline', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          type: fc.constantFrom('check-in', 'progress', 'streak'),
          data: fc.anything(),
          timestamp: fc.integer({ min: 0 }),
        }),
        async (action) => {
          // Simulate offline state
          mockNetworkState('offline');
          
          // Perform action
          await performUserAction(action);
          
          // Verify stored in local storage
          const stored = await getStoredActions();
          expect(stored).toContainEqual(
            expect.objectContaining({
              type: action.type,
              data: action.data,
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Cross-Browser Testing

**Automated Testing:**
- Use Playwright for cross-browser E2E tests
- Test matrix: Chrome, Firefox, Safari, Edge
- Mobile browsers: iOS Safari, Android Chrome
- Screen sizes: 375px (mobile), 768px (tablet), 1920px (desktop)

**Manual Testing Checklist:**
- PWA installation flow on each platform
- Offline functionality
- Push notifications
- Media recording
- Payment flow
- Responsive layouts

### Performance Testing

**Metrics to Track:**
- Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
- Core Web Vitals (LCP, FID, CLS)
- Bundle sizes (initial, lazy-loaded chunks)
- Cache hit rates
- Service worker performance

**Performance Budgets:**
- Initial bundle: < 200KB gzipped
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance: > 90

### Integration Testing

**Critical User Flows:**
1. Sign up → Onboarding → First check-in
2. Daily briefing → Lesson → Progress update
3. Streak tracking → Widget update
4. Time capsule creation → Video recording
5. Payment → Subscription activation
6. Offline usage → Online sync

**Test Scenarios:**
- Fresh installation
- Returning user
- Offline to online transition
- Service worker update
- Cross-device sync

### Accessibility Testing

**Automated Tools:**
- axe-core for automated accessibility checks
- Lighthouse accessibility audit
- WAVE browser extension

**Manual Testing:**
- Keyboard navigation through all flows
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast verification
- Focus management
- ARIA attribute validation

### Security Testing

**Automated Scans:**
- OWASP ZAP for vulnerability scanning
- npm audit for dependency vulnerabilities
- Snyk for security monitoring

**Manual Review:**
- CSP header configuration
- CORS policy review
- Authentication flow security
- Token storage security
- Input sanitization verification

## Deployment Strategy

### Build Process

1. **Development Build:**
   ```bash
   expo start --web
   ```

2. **Production Build:**
   ```bash
   expo build:web
   ```

3. **Optimization:**
   - Code splitting by route
   - Tree shaking unused code
   - Image optimization (WebP with fallbacks)
   - CSS minification
   - JavaScript minification and compression

### Hosting Configuration

**Recommended Platform:** Vercel, Netlify, or Cloudflare Pages

**Configuration Requirements:**
- HTTPS enabled
- Custom domain support
- CDN for global distribution
- Automatic deployments from main branch
- Preview deployments for PRs

**Headers Configuration:**

```
# Security headers
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin

# Cache headers
Cache-Control: public, max-age=31536000, immutable  # For static assets
Cache-Control: no-cache  # For HTML files
```

### Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_WEB_PUSH_PUBLIC_KEY=your-vapid-public-key
EXPO_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Monitoring and Analytics

**Error Monitoring:**
- Sentry for error tracking
- Custom error boundaries for React errors
- Service worker error logging

**Analytics:**
- Google Analytics or Plausible for page views
- Custom events for feature usage
- Performance monitoring with Web Vitals

**Uptime Monitoring:**
- Health check endpoint: `/api/health`
- Status page for service status
- Alerting for downtime

## Migration Strategy

### Phase 1: Foundation (Week 1-2)
- Set up React Native Web configuration
- Configure webpack/metro for web
- Create platform detection layer
- Implement basic responsive layouts

### Phase 2: Core Features (Week 3-4)
- Implement PWA manifest and service worker
- Add offline support for critical features
- Implement web-based widget alternatives
- Set up authentication on web

### Phase 3: Media and Payments (Week 5-6)
- Implement web media recording
- Integrate Stripe for web payments
- Add web push notifications
- Test cross-platform functionality

### Phase 4: Optimization (Week 7-8)
- Performance optimization
- SEO implementation
- Accessibility improvements
- Cross-browser testing

### Phase 5: Launch (Week 9-10)
- Production deployment
- Monitoring setup
- Documentation
- User communication

## Feature Parity Matrix

| Feature | Native | Web | Notes |
|---------|--------|-----|-------|
| Authentication | ✅ | ✅ | Full parity |
| Daily Briefing | ✅ | ✅ | Full parity |
| Lessons | ✅ | ✅ | Full parity |
| Check-ins | ✅ | ✅ | Full parity |
| Streaks | ✅ | ✅ | Full parity |
| Rex AI Coach | ✅ | ✅ | Full parity |
| Time Capsules | ✅ | ✅ | Web uses MediaRecorder API |
| Speaking Trainer | ✅ | ✅ | Web uses MediaRecorder API |
| Video Recording | ✅ | ✅ | Different APIs, same functionality |
| Push Notifications | ✅ | ✅ | Web Push API vs native |
| Widgets | ✅ | ⚠️ | Web shows in-app alternatives |
| Offline Mode | ✅ | ✅ | Service worker vs native storage |
| Payments | ✅ | ✅ | Different Stripe SDKs |
| Social Sharing | ✅ | ⚠️ | Web Share API where supported |
| App Store | ✅ | ❌ | Web uses browser installation |

Legend:
- ✅ Full support
- ⚠️ Partial support or alternative implementation
- ❌ Not available

## Conclusion

This design provides a comprehensive approach to adding PWA support to the Growthovo React Native application. By leveraging React Native Web, implementing progressive enhancement, and providing graceful degradation for platform-specific features, we can deliver a high-quality web experience while maintaining a single codebase.

The architecture prioritizes:
1. **User Experience**: Responsive design, offline support, fast performance
2. **Developer Experience**: Single codebase, clear platform abstractions
3. **Maintainability**: Modular architecture, comprehensive testing
4. **Security**: HTTPS, CSP, input sanitization, secure authentication
5. **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support

The phased migration strategy allows for incremental delivery and validation, reducing risk while providing value early in the process.
