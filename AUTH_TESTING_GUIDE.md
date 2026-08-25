# 🧪 Growthovo Authentication — Testing Guide

## Comprehensive Test Scenarios

This guide provides step-by-step testing scenarios to validate the premium authentication experience across all devices, platforms, and edge cases.

---

## 🎯 Core User Flows

### **Flow 1: New User Sign-Up (Happy Path)**

```
STEPS:
1. Open app/website
2. Click "Sign up"
3. Enter username: "testuser"
4. Tab to email field (should auto-focus)
5. Enter email: "test@example.com"
6. Tab to password field
7. Type password: "Test123!@#"
8. Watch password strength indicator update
9. Tab to confirm password
10. Type same password: "Test123!@#"
11. Check age verification checkbox
12. Check terms acceptance checkbox
13. Press Enter or click "Create Account"
14. See "Check your email" success screen

EXPECTED RESULTS:
✓ Password strength updates in real-time
✓ Confirm password shows green checkmark when matching
✓ All inputs smoothly transition between fields
✓ Button shows loading state while creating account
✓ Success screen appears with clear instructions
✓ Email sent to provided address

VISUAL CHECKS:
✓ Purple glow appears on input focus
✓ Labels change from gray to purple on focus
✓ Button scales down when pressed
✓ No layout shifts during typing
✓ Smooth fade-in for success screen
```

---

### **Flow 2: Existing User Sign-In (Happy Path)**

```
STEPS:
1. Open app/website (should default to login)
2. Enter email: "existing@example.com"
3. Tab to password field
4. Enter password: "CorrectPassword123!"
5. Leave "Remember me" checked
6. Press Enter or click "Sign In"
7. Wait for authentication
8. Dashboard loads

EXPECTED RESULTS:
✓ Email remembered on next visit (if checked)
✓ Loading state shows "Signing in..."
✓ No flashes of unauthorized content
✓ Direct navigation to dashboard
✓ Session persists across browser refresh

VISUAL CHECKS:
✓ Button press animation triggers
✓ Inputs remain accessible during load
✓ Smooth transition to dashboard
✓ No console errors
```

---

### **Flow 3: Google OAuth Sign-In/Up**

```
STEPS:
1. Open login or signup screen
2. Click "Sign in with Google" button
3. Google popup/redirect appears
4. Select/sign in with Google account
5. Grant permissions if prompted
6. Return to Growthovo
7. Profile auto-created (first time) or logged in

EXPECTED RESULTS:
✓ Google OAuth popup opens correctly
✓ Return URL redirects properly
✓ User profile created with Google metadata
✓ Session established immediately
✓ Onboarding shown for new users
✓ Dashboard shown for existing users

EDGE CASES:
□ User closes popup → Error message shown
□ Network fails mid-OAuth → Friendly error
□ Google account already linked → Signs in
□ Email conflict → Clear resolution path
```

---

### **Flow 4: Forgot Password → Reset**

```
STEPS:
1. From login screen, click "Forgot password?"
2. Enter email: "forgot@example.com"
3. Click "Send Reset Email"
4. Check email inbox
5. Click reset link in email
6. Enter new password: "NewPassword123!@#"
7. Confirm new password
8. Click "Reset Password"
9. See success message
10. Return to login
11. Sign in with new password

EXPECTED RESULTS:
✓ Reset email sent within 1 minute
✓ Reset link valid and secure (token)
✓ Password strength indicator works
✓ Expired tokens show clear error
✓ Success confirmation clear
✓ New password works immediately

VISUAL CHECKS:
✓ Rate limiting appears after 3 attempts
✓ Success screen well-designed
✓ Instructions clear and helpful
```

---

## ❌ Error Handling Test Cases

### **Invalid Credentials**

```
TEST: Enter wrong email/password
INPUT:
  Email: "valid@example.com"
  Password: "WrongPassword123"

EXPECTED:
✓ Error banner: "Email or password doesn't look right..."
✓ No specific indication of which field is wrong (security)
✓ Inputs remain filled (user can correct)
✓ Clear error on next typing
✓ No shake animation (only on validation errors)
```

---

### **Validation Errors (Real-Time)**

```
TEST 1: Invalid email format
INPUT: "notanemail"
TRIGGER: Blur event (leave field)
EXPECTED:
✓ Red border appears
✓ Error text: "Please enter a valid email address."
✓ Input shakes subtly
✓ Error clears when user types

TEST 2: Weak password
INPUT: "12345"
TRIGGER: Real-time while typing
EXPECTED:
✓ Strength bar shows red (weak)
✓ Requirements list shows unmet items
✓ No error message (just indicator)
✓ Updates live as user types

TEST 3: Passwords don't match
INPUT:
  Password: "Test123!@#"
  Confirm: "Test123!@"
TRIGGER: Blur on confirm field
EXPECTED:
✓ Red border on confirm field
✓ Error: "Passwords do not match."
✓ Shakes on blur
✓ Clears and shows checkmark when matching
```

---

### **Rate Limiting**

```
TEST: Attempt login 6 times with wrong password
STEPS:
1. Enter wrong password
2. Click "Sign In"
3. Repeat 5 more times

EXPECTED AFTER 5TH ATTEMPT:
✓ Error: "Too many attempts. Please wait a moment."
✓ Sign In button disabled
✓ Message clear and friendly
✓ No infinite retry allowed

RECOVERY:
□ Wait 1-2 minutes
□ Button re-enables
□ Counter resets
□ Or: User can use "Forgot password" immediately
```

---

### **Network Errors**

```
TEST 1: Offline during sign-in
STEPS:
1. Turn off WiFi/mobile data
2. Try to sign in
EXPECTED:
✓ Error: "Something went wrong. Check your connection..."
✓ Retry button available
✓ No technical error codes shown

TEST 2: Slow network
STEPS:
1. Throttle to 3G speed
2. Click "Sign In"
EXPECTED:
✓ Loading state persists
✓ Eventually resolves (or timeout)
✓ No frozen UI
✓ User can cancel
```

---

### **Account Already Exists**

```
TEST: Sign up with existing email
INPUT:
  Email: "existing@example.com" (already in database)
  Password: "NewPassword123!@#"

EXPECTED:
✓ Error: "An account with this email already exists..."
✓ Suggestion: "Try signing in instead."
✓ Link to login screen
✓ No creation occurs (security)
```

---

## 📱 Mobile-Specific Tests

### **iOS Testing**

```
DEVICES:
□ iPhone SE (2022) — Small screen
□ iPhone 15 Pro — Notch/Dynamic Island
□ iPhone 15 Pro Max — Large screen
□ iPad Air — Tablet

SCENARIOS:
1. Keyboard Appearance
   ✓ Inputs remain visible when keyboard opens
   ✓ Form scrolls to keep focused input visible
   ✓ Keyboard dismisses on form submit
   ✓ Return key types correct (Next, Go, Done)

2. Safe Areas
   ✓ Content respects notch
   ✓ No content hidden by home indicator
   ✓ Card doesn't overlap system UI

3. Autofill
   ✓ iOS password manager appears
   ✓ Email autofill from contacts
   ✓ SMS verification codes auto-fill (future)

4. PWA Mode (Safari)
   ✓ Installed from home screen works
   ✓ OAuth redirects return correctly
   ✓ Session persists across launches
   ✓ Splash screen shows
```

---

### **Android Testing**

```
DEVICES:
□ Pixel 6 — Standard Android
□ Samsung Galaxy S23 — OneUI
□ Low-end device (2GB RAM) — Performance

SCENARIOS:
1. Keyboard Behavior
   ✓ Inputs remain visible
   ✓ Navigation bar spacing correct
   ✓ Back button returns to previous screen
   ✓ Keyboard type correct (email, text, numeric)

2. Autofill
   ✓ Google Autofill works
   ✓ Password manager integration
   ✓ SMS codes auto-fill (future)

3. PWA Mode (Chrome)
   ✓ Add to home screen works
   ✓ OAuth flow correct
   ✓ Standalone mode UI correct
   ✓ Push notifications work (future)
```

---

## 💻 Web/Desktop Testing

### **Browser Compatibility**

```
BROWSERS TO TEST:
□ Chrome (latest)
□ Safari (latest)
□ Firefox (latest)
□ Edge (Chromium)

SCENARIOS:
1. Keyboard Navigation
   ✓ Tab through all fields
   ✓ Enter submits form
   ✓ Escape closes modals (future)
   ✓ Focus visible (purple ring)

2. Hover States
   ✓ Buttons show hover effect
   ✓ Links change color on hover
   ✓ Cursor changes to pointer
   ✓ Tooltips appear (future)

3. Browser Features
   ✓ Password manager integration
   ✓ Remember Me works
   ✓ Session cookie secure
   ✓ HTTPS enforced

4. Responsive Design
   ✓ Window resize smooth
   ✓ Breakpoints work (375px, 768px, 1024px)
   ✓ Text scales properly
   ✓ No horizontal scroll
```

---

## ♿ Accessibility Testing

### **Screen Readers**

```
TEST WITH:
□ VoiceOver (iOS/macOS)
□ TalkBack (Android)
□ NVDA (Windows)
□ JAWS (Windows)

CHECKS:
1. Navigation
   ✓ All elements announced correctly
   ✓ Button roles clear
   ✓ Form fields labeled properly
   ✓ Errors announced immediately

2. Form Completion
   ✓ Field labels read aloud
   ✓ Required fields indicated
   ✓ Validation errors announced
   ✓ Success states clear

3. Error Handling
   ✓ Live regions work (role="alert")
   ✓ Error messages clear
   ✓ Actionable guidance provided
   ✓ Focus moved appropriately
```

---

### **Keyboard-Only Navigation**

```
STEPS:
1. Tab through entire auth flow
2. Never touch mouse/trackpad
3. Complete sign-up/login

CHECKS:
✓ Can reach all interactive elements
✓ Focus order logical (top to bottom)
✓ Focus visible at all times
✓ Can check checkboxes with Space
✓ Can submit form with Enter
✓ Can't get trapped in any element
✓ Skip links available (web)
```

---

### **Reduced Motion**

```
TEST:
1. Enable "Reduce Motion" in system settings
2. Navigate through auth screens

EXPECTED:
✓ No animations trigger
✓ Instant state changes
✓ No parallax effects
✓ No sliding/fading transitions
✓ Static feedback (color only)
✓ Functionality unchanged
```

---

### **Color Contrast**

```
TOOL: Use WCAG Color Contrast Checker

CHECKS:
✓ Text on background: 21:1 (AAA)
✓ Muted text: 9.5:1 (AA)
✓ Error text: 5.8:1 (AA)
✓ Link text: 8.2:1 (AAA)
✓ Button text: 21:1 (AAA)
✓ All pass WCAG AA minimum (4.5:1 normal, 3:1 large)
```

---

### **Touch Targets**

```
MEASURE: Use developer tools ruler

CHECKS:
✓ All buttons: ≥44x44px
✓ Input fields: ≥52px height
✓ Checkboxes: ≥40x40px hitbox
✓ Links: ≥44x44px with padding
✓ Password toggle: ≥44x44px
✓ No targets smaller than 44px
```

---

## 🎨 Visual Polish Verification

### **Micro-Interactions Checklist**

```
ANIMATION: Input Focus
□ Border transitions gray → purple (250ms)
□ Label color changes (250ms)
□ Icon opacity increases
□ Subtle glow appears
□ No jank/stuttering

ANIMATION: Error Shake
□ Input shakes horizontally
□ 5-step sequence visible
□ Returns to rest position
□ No overshoot

ANIMATION: Button Press
□ Scales down to 97% on press
□ Springs back to 100% on release
□ Feels tactile and responsive
□ Works on touch and click

ANIMATION: Success Checkmark
□ Background transitions to green
□ Checkmark scales in with spring
□ Subtle bounce at end
□ Feels rewarding
```

---

### **Loading States**

```
CHECKS:
□ Spinner appears immediately
□ Label changes ("Sign In" → "Signing in...")
□ Spinner color matches context
□ Size appropriate (not giant)
□ Smooth rotation
□ Button disabled during load
□ Inputs disabled during load
```

---

### **Success States**

```
CHECKS:
□ Checkmark appears (inputs/buttons)
□ Background color transitions
□ Animation feels celebratory
□ User understands what succeeded
□ Clear next steps provided
```

---

## 🚀 Performance Testing

### **Load Times**

```
TEST: Initial auth screen load
TARGET: < 2 seconds on 3G

MEASURE:
1. Open DevTools Network tab
2. Throttle to 3G
3. Load auth screen
4. Record time to interactive

CHECKS:
✓ Background loads progressively
✓ Card appears within 1 second
✓ Inputs functional within 2 seconds
✓ No blank white screen
✓ Loading state shown if slow
```

---

### **Animation Performance**

```
TEST: Input focus during typing
TARGET: 60fps (16.67ms per frame)

MEASURE:
1. Open DevTools Performance tab
2. Record while typing rapidly
3. Check frame timing

CHECKS:
✓ No frames dropped
✓ Smooth 60fps throughout
✓ useNativeDriver utilized
✓ No layout thrashing
✓ GPU acceleration active
```

---

### **Memory Usage**

```
TEST: Navigate through auth flow 10 times
TARGET: No memory leaks

MEASURE:
1. Open DevTools Memory tab
2. Take heap snapshot
3. Complete auth flow 10x
4. Take another snapshot
5. Compare

CHECKS:
✓ No significant growth
✓ Listeners removed
✓ Components unmounted
✓ No retained objects
```

---

## 🔒 Security Testing

### **Input Validation**

```
TESTS:
1. SQL Injection: ' OR '1'='1
2. XSS: <script>alert('xss')</script>
3. Long Input: 10,000 character string
4. Special Characters: unicode, emoji
5. Null Bytes: %00

EXPECTED:
✓ All sanitized server-side
✓ No execution of malicious code
✓ Proper escaping/encoding
✓ Length limits enforced
✓ No crashes or errors
```

---

### **Session Management**

```
TESTS:
1. Token Expiration
   □ Session expires after timeout
   □ Redirect to login automatic
   □ Refresh token mechanism works

2. Token Storage
   □ Stored securely (httpOnly cookies or secure storage)
   □ Not exposed in localStorage (web)
   □ Encrypted at rest (mobile)

3. Cross-Tab Sync
   □ Logout in one tab logs out all (web)
   □ Session shared across tabs
   □ No race conditions
```

---

### **Password Security**

```
CHECKS:
✓ Never logged to console
✓ Not stored in plain text
✓ Supabase handles hashing (bcrypt)
✓ Password strength enforced
✓ No password hints stored
✓ Reset tokens expire quickly
✓ One-time use reset tokens
```

---

## 📊 Analytics Events to Track

```
RECOMMENDED EVENTS:

Sign-Up Flow:
• sign_up_started
• sign_up_email_entered
• sign_up_password_created
• sign_up_completed
• sign_up_failed (with error type)

Sign-In Flow:
• sign_in_started
• sign_in_completed
• sign_in_failed (with error type)
• google_oauth_started
• google_oauth_completed
• google_oauth_failed

Password Reset:
• password_reset_requested
• password_reset_email_sent
• password_reset_completed
• password_reset_failed

Errors:
• validation_error (with field name)
• network_error
• rate_limit_triggered
• oauth_cancelled

Metrics:
• time_to_complete_signup
• time_to_sign_in
• password_strength_distribution
• error_rate_by_type
```

---

## ✅ Pre-Launch Checklist

### **Functional**
```
□ Sign-up with email works
□ Sign-in with email works
□ Google OAuth works
□ Password reset works
□ Email verification works
□ Remember Me works
□ Session persistence works
□ Multi-tab logout sync works
□ Rate limiting works
□ All error states handled
```

### **Visual**
```
□ All animations smooth (60fps)
□ No layout shifts
□ Proper loading states
□ Success feedback clear
□ Error messages helpful
□ Responsive on all screens
□ Dark mode optimized
□ Brand consistency maintained
```

### **Accessibility**
```
□ Screen reader compatible
□ Keyboard navigation works
□ Color contrast passes WCAG AA
□ Touch targets ≥44x44px
□ Focus visible
□ Reduced motion respected
□ Semantic HTML used
□ ARIA labels correct
```

### **Performance**
```
□ Auth screen loads <2s (3G)
□ No memory leaks
□ Bundle size optimized
□ Images optimized
□ Animations use native driver
□ No console errors
```

### **Security**
```
□ Passwords hashed (Supabase)
□ Tokens secure
□ Session timeout works
□ Input validation solid
□ XSS/SQL injection protected
□ HTTPS enforced
□ OAuth secure (PKCE if applicable)
```

### **Cross-Platform**
```
□ iOS tested (3 devices)
□ Android tested (3 devices)
□ Web tested (4 browsers)
□ PWA tested (iOS + Android)
□ Tablet tested (iPad + Android)
```

---

## 🐛 Common Issues & Solutions

### **Issue: OAuth popup blocked**
```
SOLUTION:
✓ Open OAuth in same window (redirect mode)
✓ Add browser popup exception
✓ Show clear message to user
```

### **Issue: Keyboard covers input (mobile)**
```
SOLUTION:
✓ KeyboardAvoidingView implemented
✓ ScrollView with keyboardShouldPersistTaps
✓ Proper behavior prop (iOS: padding, Android: none)
```

### **Issue: Animation jank**
```
SOLUTION:
✓ Use useNativeDriver: true
✓ Avoid animating layout properties
✓ Use transform/opacity only
✓ Check for unnecessary re-renders
```

### **Issue: Focus not visible (web)**
```
SOLUTION:
✓ Remove outline: none
✓ Add custom focus ring
✓ Use :focus-visible pseudo-class
✓ Test with keyboard navigation
```

---

**Test thoroughly. Ship confidently. Your users will feel the difference.** ✨
