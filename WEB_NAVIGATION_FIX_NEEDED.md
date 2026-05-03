# Web Navigation Fix Required

## Problem

The bottom tab navigation (🏠Home 🎯Pillars 💬Rex 🏆League 👤Profile) is not working on the production web deployment at growthovo.com.

## Root Cause

The web build is currently serving static HTML files (`app.html`) instead of the actual React Native Web bundle. The static HTML has hardcoded navigation elements that don't use React Navigation, so clicking the tabs doesn't navigate between screens.

## Current State

- ✅ **React Native App (App.tsx)**: Navigation is correctly implemented with `{...props}` spread operator
- ✅ **Mobile Apps**: Navigation works correctly on iOS/Android
- ❌ **Web Production**: Serving static HTML files without React Navigation
- ❌ **Web Build Process**: `build-web.js` only copies static files, doesn't bundle React Native Web

## Solution Options

### Option 1: Use Expo Web Build (Recommended)

Replace the current `build-web.js` script with proper Expo web bundling:

```bash
# In ascevo directory
npx expo export:web
```

This will:
- Bundle the React Native Web app with all dependencies
- Generate proper JavaScript bundles
- Create an index.html that loads the React app
- Include all navigation logic from App.tsx

### Option 2: Use Metro Bundler for Web

Configure Metro bundler to output web bundles:

```json
// package.json
{
  "scripts": {
    "build:web": "expo export:web --output-dir web-build"
  }
}
```

### Option 3: Development Server (Temporary)

For immediate testing, run the Expo development server:

```bash
cd ascevo
npm run web
# or
expo start --web
```

This will start a development server where navigation works correctly.

## Implementation Steps

### Step 1: Update build-web.js

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Growthovo PWA for web...');

try {
  // Build React Native Web bundle with Expo
  console.log('Building React Native Web bundle...');
  execSync('npx expo export:web', { 
    stdio: 'inherit',
    cwd: __dirname 
  });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
```

### Step 2: Update Vercel Configuration

Ensure `vercel.json` uses the correct build command:

```json
{
  "buildCommand": "cd ascevo && npx expo export:web",
  "outputDirectory": "ascevo/web-build"
}
```

### Step 3: Test Locally

```bash
cd ascevo
npx expo export:web
npx serve web-build
```

Visit http://localhost:3000 and test navigation.

### Step 4: Deploy

```bash
git add .
git commit -m "Fix web navigation with proper Expo build"
git push
```

Vercel will automatically deploy with the new build process.

## Verification

After deployment, verify:

1. ✅ Home tab loads correctly
2. ✅ Clicking Pillars tab navigates to PillarsScreen
3. ✅ Clicking Rex tab navigates to RexScreen
4. ✅ Clicking League tab navigates to SimpleLeagueScreen
5. ✅ Clicking Profile tab navigates to SimpleProfileScreen
6. ✅ Active tab highlights in purple (#A78BFA)
7. ✅ All screens receive correct props (userId, subscriptionStatus, navigation, route)

## Alternative: Hybrid Approach

If Expo web build is too large or slow, consider:

1. Keep static HTML for splash/onboarding (fast initial load)
2. Load React Native Web bundle only for authenticated app screens
3. Use code splitting to reduce bundle size

## Current Workaround

For immediate access to working navigation:

1. Clone the repository
2. Run `cd ascevo && npm install`
3. Run `npm run web`
4. Open http://localhost:8081 in browser
5. Navigation will work correctly in development mode

## Files to Update

- `ascevo/build-web.js` - Replace with Expo build command
- `vercel.json` - Update buildCommand
- `ascevo/public/app.html` - Will be replaced by Expo-generated index.html
- `ascevo/package.json` - Ensure expo-cli is available

## Expected Outcome

After implementing this fix:

- ✅ Web app will use React Navigation
- ✅ All tabs will be clickable and functional
- ✅ Navigation state will be managed by React Navigation
- ✅ All screens will receive proper navigation props
- ✅ Active tab highlighting will work automatically
- ✅ Deep linking will work (if configured)
- ✅ Browser back/forward buttons will work

## Timeline

- **Immediate**: Document the issue (this file)
- **Next**: Implement Expo web build
- **Testing**: Verify navigation works locally
- **Deployment**: Push to production
- **Verification**: Test on growthovo.com

---

**Status**: 🔴 BLOCKED - Web navigation not functional  
**Priority**: 🔥 CRITICAL - Blocks access to 80% of app features  
**Assigned**: Development Team  
**Created**: May 3, 2026
