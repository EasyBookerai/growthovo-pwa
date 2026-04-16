# 🧪 Growthovo Testing Guide

## Quick Start

### Local Testing

1. **Start a local server:**
```bash
cd growthovo/public
python -m http.server 8000
# or
npx serve
```

2. **Open in browser:**
```
http://localhost:8000
```

3. **Expected Flow:**
- First visit: Splash screen (2.5s) → Onboarding (4 screens) → Dashboard
- Return visit: Splash screen (2.5s) → Dashboard

---

## 🔄 Testing the Complete Flow

### First-Time User Experience

1. **Clear all data:**
```javascript
// Open browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

2. **You should see:**
- ✅ Splash screen with animated progress bar
- ✅ PWA install prompt (on supported browsers)
- ✅ Automatic redirect to onboarding after 2.5s

3. **Complete onboarding:**
- Screen 1: Click "Let's Begin"
- Screen 2: Enter your name
- Screen 3: Select 2-3 pillars
- Screen 4: Choose daily goal
- Screen 5: Click "Start Your Journey"

4. **You should land on:**
- ✅ Dashboard with personalized greeting
- ✅ Your selected pillars displayed
- ✅ Stats showing 0/0/1
- ✅ Daily mission card
- ✅ Bottom navigation

### Returning User Experience

1. **Refresh the page:**
```javascript
location.reload();
```

2. **You should see:**
- ✅ Splash screen (skipped if in same session)
- ✅ Direct to dashboard
- ✅ Your data persisted (name, pillars)

---

## 🎯 Feature Testing

### Splash Screen

**Test Cases:**
- [ ] Loads in <100ms
- [ ] Shows animated progress bar
- [ ] Displays 6 pillar pills
- [ ] Shows loading messages (4 variations)
- [ ] PWA install card appears (Chrome Android)
- [ ] iOS instructions show (Safari iOS)
- [ ] Redirects after 2.5s
- [ ] Session storage prevents re-show

**Test on:**
- Chrome Desktop
- Chrome Android
- Safari iOS
- Firefox Desktop

### Onboarding

**Test Cases:**
- [ ] Screen 1: Welcome animation plays
- [ ] Screen 2: Name input works
- [ ] Screen 2: Enter key submits
- [ ] Screen 3: Can select 2-3 pillars
- [ ] Screen 3: Can't select more than 3
- [ ] Screen 3: Button disabled until 2 selected
- [ ] Screen 4: Radio selection works
- [ ] Screen 5: Success animation plays
- [ ] Data saves to localStorage
- [ ] Skip button works

**Test on:**
- Mobile (portrait)
- Tablet (portrait/landscape)
- Desktop

### Dashboard

**Test Cases:**
- [ ] Personalized greeting shows name
- [ ] Selected pillars display correctly
- [ ] Stats show 0/0/1
- [ ] Daily mission card visible
- [ ] CTA button works
- [ ] Bottom nav visible
- [ ] Responsive on all screens

**Test on:**
- iPhone (notched device)
- Android (various sizes)
- Desktop

---

## 🐛 Debug Tools

### Reset Onboarding

**In browser console:**
```javascript
// Reset everything
localStorage.clear();
sessionStorage.clear();
location.reload();

// Or use the helper function (on app.html)
resetOnboarding();
```

### Check Stored Data

```javascript
// View user data
console.log(JSON.parse(localStorage.getItem('growthovo_user')));

// View onboarding status
console.log(localStorage.getItem('growthovo_onboarded'));

// View splash status
console.log(sessionStorage.getItem('growthovo_splashed'));
```

### Simulate Different States

```javascript
// Simulate onboarded user
localStorage.setItem('growthovo_onboarded', 'true');
localStorage.setItem('growthovo_user', JSON.stringify({
  name: 'Test User',
  pillars: ['mental', 'fitness', 'career'],
  dailyGoal: '15'
}));
location.reload();

// Simulate new user
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 📱 PWA Testing

### Install Prompt (Chrome Android)

1. Open in Chrome Android
2. Wait for splash screen
3. Look for install card
4. Click "Add to home screen"
5. Verify app installs
6. Open from home screen
7. Verify standalone mode

### iOS Install (Safari)

1. Open in Safari iOS
2. Wait for splash screen
3. Look for iOS instructions
4. Tap Share button
5. Tap "Add to Home Screen"
6. Verify app installs
7. Open from home screen
8. Verify standalone mode

### Offline Mode

1. Install as PWA
2. Open DevTools → Application → Service Workers
3. Check "Offline"
4. Refresh page
5. Verify app still works
6. Check cached assets

---

## 🎨 Visual Testing

### Glassmorphism

**Check:**
- [ ] Ambient orbs visible
- [ ] Glass cards have blur effect
- [ ] Border highlights visible
- [ ] Animations smooth (60fps)
- [ ] Colors match design (#7C3AED, #A78BFA, #34D399)

### Typography

**Check:**
- [ ] Syne font loads (headings)
- [ ] DM Sans font loads (body)
- [ ] Font weights correct (300, 400, 500, 600, 700, 800)
- [ ] Letter spacing correct
- [ ] Line heights comfortable

### Animations

**Check:**
- [ ] Splash progress bar animates
- [ ] Loading messages crossfade
- [ ] Onboarding screens fade in
- [ ] Pillar cards have hover states
- [ ] Button hover effects work
- [ ] Success icon scales in

---

## ⚡ Performance Testing

### Lighthouse Audit

```bash
lighthouse http://localhost:8000 --view
```

**Target Scores:**
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >90
- PWA: 100

### Load Time

**Measure:**
- Time to first paint: <1s
- Time to interactive: <2s
- Splash duration: 2.5s
- Onboarding completion: <90s

### Bundle Size

**Check:**
- HTML files: <50KB each
- No external dependencies
- Fonts load from Google CDN
- Images optimized (when added)

---

## 🔐 Security Testing

### XSS Prevention

**Test:**
```javascript
// Try injecting script in name field
<script>alert('XSS')</script>

// Should be escaped/sanitized
```

### Data Privacy

**Check:**
- [ ] No sensitive data in console
- [ ] LocalStorage data encrypted (if needed)
- [ ] No data sent to external servers (yet)
- [ ] HTTPS enforced (in production)

---

## 📊 Analytics Testing

### Event Tracking

**Check these events fire:**
```javascript
// Onboarding
onboarding_start
onboarding_screen_view (1-5)
onboarding_complete

// Engagement
page_view (dashboard)
checkin_start
mission_view

// PWA
install_prompt_shown
install_accepted
install_declined
```

**Test with:**
- Google Analytics Debug Mode
- Browser console
- Network tab

---

## 🌐 Cross-Browser Testing

### Desktop

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile

- [ ] Chrome Android (latest)
- [ ] Safari iOS (latest)
- [ ] Samsung Internet
- [ ] Firefox Mobile

### Tablet

- [ ] iPad Safari
- [ ] Android Chrome
- [ ] Landscape orientation
- [ ] Portrait orientation

---

## 🚨 Common Issues & Fixes

### Issue: Splash doesn't redirect

**Fix:**
```javascript
// Check console for errors
// Verify files exist: /splash.html, /onboarding.html, /app.html
// Clear cache and reload
```

### Issue: Onboarding data not saving

**Fix:**
```javascript
// Check localStorage is enabled
// Check for console errors
// Verify JSON.stringify works
```

### Issue: PWA install prompt doesn't show

**Fix:**
- Must be HTTPS (or localhost)
- Must have valid manifest.json
- Must have service worker
- User must meet engagement criteria
- Only works on supported browsers

### Issue: Fonts don't load

**Fix:**
- Check network tab for 404s
- Verify Google Fonts URL
- Check CORS headers
- Use font-display: swap

### Issue: Animations laggy

**Fix:**
- Check GPU acceleration (will-change)
- Reduce blur radius
- Simplify animations
- Test on lower-end devices

---

## ✅ Pre-Deployment Checklist

### Files

- [ ] splash.html exists
- [ ] onboarding.html exists
- [ ] app.html exists
- [ ] manifest.json valid
- [ ] service-worker.js exists
- [ ] Icons generated (192, 512, favicon)

### Functionality

- [ ] Splash redirects correctly
- [ ] Onboarding completes
- [ ] Data persists
- [ ] Dashboard loads
- [ ] PWA installs
- [ ] Offline works

### Performance

- [ ] Lighthouse score >90
- [ ] Load time <2s
- [ ] No console errors
- [ ] No 404s

### Analytics

- [ ] Events tracking
- [ ] User properties set
- [ ] Conversion tracking ready

### Security

- [ ] HTTPS enabled
- [ ] XSS prevented
- [ ] CORS configured
- [ ] CSP headers set

---

## 🎉 Success Criteria

Your retention machine is working when:

1. **Splash → Onboarding → Dashboard** flow completes in <3 minutes
2. **Data persists** across sessions
3. **PWA installs** on mobile devices
4. **Lighthouse PWA score** is 100/100
5. **No console errors** in any browser
6. **Animations smooth** on all devices
7. **Responsive** on all screen sizes

---

## 📞 Need Help?

**Debug in console:**
```javascript
// Check routing
console.log('Onboarded:', localStorage.getItem('growthovo_onboarded'));
console.log('Splashed:', sessionStorage.getItem('growthovo_splashed'));
console.log('User:', localStorage.getItem('growthovo_user'));

// Force reset
resetOnboarding(); // On app.html
```

**Common commands:**
```bash
# Clear browser data
Ctrl+Shift+Delete (Chrome)
Cmd+Shift+Delete (Mac)

# Hard reload
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)

# Open DevTools
F12 or Ctrl+Shift+I
```

---

Happy testing! 🚀
