# Supabase CORS Configuration Guide

## Critical Issue
Your app is fully functional but blocked by CORS (Cross-Origin Resource Sharing) policy. This prevents your production domain from accessing Supabase.

## Step-by-Step Fix

### 1. Open Supabase Dashboard
Go to: https://supabase.com/dashboard

### 2. Select Your Project
Click on your Growthovo project

### 3. Navigate to API Settings
- Click "Settings" in the left sidebar (gear icon at bottom)
- Click "API" in the settings menu

### 4. Find CORS Configuration
Scroll down to find the "CORS Configuration" section

### 5. Add Your Domains
Add these domains to the allowed origins list:

```
https://growthovo.com
https://*.vercel.app
```

**Important**: 
- Include the `https://` protocol
- Use `*` as wildcard for all Vercel preview deployments
- Add each domain on a separate line

### 6. Save Changes
Click "Save" or "Update" button

### 7. Wait for Propagation
Changes may take 1-2 minutes to propagate

### 8. Test Your App
1. Open https://growthovo.com
2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Try clicking on tabs: Home, Pillars, Rex, League, Profile
4. Check browser console (F12) for any remaining errors

## What This Fixes

✅ Navigation tabs will be fully clickable
✅ Pillars screen will load real lessons from database
✅ Home screen will show your actual streak and XP
✅ Daily challenges will appear
✅ Lesson completion will work
✅ XP rewards will be tracked

## Alternative: If You Can't Find CORS Settings

If you can't find the CORS configuration in the Supabase dashboard:

1. Go to your project settings
2. Look for "Authentication" → "URL Configuration"
3. Add your domains to "Site URL" and "Redirect URLs"
4. Or contact Supabase support for help locating CORS settings

## Verification

After configuring CORS, open browser console (F12) and check:
- ❌ Before: `Access to fetch at 'https://xxx.supabase.co' from origin 'https://growthovo.com' has been blocked by CORS policy`
- ✅ After: No CORS errors, data loads successfully

## Current Status

✅ All code is implemented and deployed
✅ Navigation system is complete
✅ All screens are built
✅ Supabase integration is ready
❌ CORS configuration is missing (blocks everything)

**Once CORS is configured, your app will be 100% functional.**
