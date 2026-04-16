# Simplified Splash Screen & Platform Tracking

## Overview
Remove the "Welcome to Growthovo" onboarding splash screen and redirect users directly from the loading splash to the home screen. Add platform tracking to identify web vs native app users in Supabase.

## User Stories

### 1. Simplified User Flow
**As a** new or returning user  
**I want** to see a quick loading screen and go straight to the home screen  
**So that** I can start using the app immediately without unnecessary welcome screens

**Acceptance Criteria:**
- 1.1 Users see the loading splash (with progress bar, pillars, and "Add to home screen" prompt)
- 1.2 After 2.5 seconds or when loading completes, users are redirected to `/app.html` (home screen)
- 1.3 The "Welcome to Growthovo" screen with "Let's Begin" button is removed
- 1.4 The onboarding flow (quiz) is only shown for first-time users who haven't completed it
- 1.5 Session storage prevents showing splash on subsequent page loads in the same session

### 2. Platform Source Tracking
**As a** product manager  
**I want** to track whether users are accessing from web browser or native app  
**So that** I can analyze user behavior and optimize each platform

**Acceptance Criteria:**
- 2.1 Platform source is detected on app initialization (web, ios, android, pwa)
- 2.2 Platform source is stored in the `users` table in Supabase
- 2.3 Platform source is sent with authentication events (sign up, sign in)
- 2.4 Platform source is available for analytics and reporting
- 2.5 Platform detection works for:
  - Web browser (desktop/mobile)
  - iOS native app
  - Android native app
  - PWA (installed web app)

### 3. Analytics Integration
**As a** data analyst  
**I want** platform source included in all analytics events  
**So that** I can segment user behavior by platform

**Acceptance Criteria:**
- 3.1 Platform source is included in page view events
- 3.2 Platform source is included in user action events
- 3.3 Platform source is queryable in Supabase analytics
- 3.4 Platform source is visible in user profile data

## Technical Requirements

### Database Schema
- Add `platform_source` column to `users` table (enum: 'web', 'ios', 'android', 'pwa')
- Add `first_access_platform` column to track initial platform
- Add `last_access_platform` column to track most recent platform
- Add `platform_updated_at` timestamp

### Platform Detection Logic
- User agent parsing for web/mobile browser
- React Native Platform API for native apps
- Standalone mode detection for PWA
- Environment variable for build-time platform identification

### Routing Changes
- Remove `/onboarding.html` redirect from splash screen
- Redirect directly to `/app.html` after splash
- Keep onboarding quiz accessible for first-time users via app logic

## Out of Scope
- Custom onboarding flows per platform
- Platform-specific feature flags
- Cross-platform user migration tools
- Historical platform data backfill

## Success Metrics
- Reduced time-to-home-screen by 3-5 seconds
- 100% of new users have platform_source recorded
- Platform distribution visible in analytics dashboard
- No increase in bounce rate from simplified flow
