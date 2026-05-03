# Bugfix Requirements Document

## Introduction

The bottom tab navigation bar in the Growthovo PWA is visible but non-functional. Users can see all five tabs (Home, Pillars, Rex, League, Profile) but tapping on any tab except Home does not trigger navigation - the screen content remains on the Home screen. This prevents users from accessing core features of the application including Pillars management, Rex chat, League leaderboard, and Profile settings.

The bug affects all platforms where the PWA runs (growthovo.com) and represents a critical navigation failure that blocks access to 80% of the app's functionality.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user taps the Pillars tab in the bottom navigation THEN the system does not navigate and the screen stays on Home

1.2 WHEN a user taps the Rex tab in the bottom navigation THEN the system does not navigate and the screen stays on Home

1.3 WHEN a user taps the League tab in the bottom navigation THEN the system does not navigate and the screen stays on Home

1.4 WHEN a user taps the Profile tab in the bottom navigation THEN the system does not navigate and the screen stays on Home

1.5 WHEN a user taps any non-Home tab THEN the tab does not highlight in purple (#A78BFA) to indicate active state

### Expected Behavior (Correct)

2.1 WHEN a user taps the Pillars tab in the bottom navigation THEN the system SHALL navigate to the PillarsScreen and display pillar content

2.2 WHEN a user taps the Rex tab in the bottom navigation THEN the system SHALL navigate to the RexScreen and display chat interface

2.3 WHEN a user taps the League tab in the bottom navigation THEN the system SHALL navigate to the SimpleLeagueScreen and display leaderboard content

2.4 WHEN a user taps the Profile tab in the bottom navigation THEN the system SHALL navigate to the SimpleProfileScreen and display profile content

2.5 WHEN a user taps any tab THEN the system SHALL highlight that tab in purple (#A78BFA) to indicate it is the active tab

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user taps the Home tab in the bottom navigation THEN the system SHALL CONTINUE TO navigate to the Home screen successfully

3.2 WHEN the bottom tab bar is rendered THEN the system SHALL CONTINUE TO display all five tabs with correct icons and labels

3.3 WHEN the app is in dark theme mode THEN the system SHALL CONTINUE TO use the correct color scheme (#0A0A12 background, #1A1A2E cards, #7C3AED purple, #A78BFA light purple)

3.4 WHEN navigation occurs THEN the system SHALL CONTINUE TO pass userId and subscriptionStatus props to all screen components

3.5 WHEN the user is authenticated and onboarding is complete THEN the system SHALL CONTINUE TO display the MainTabs component with bottom navigation
