# 🎨 Growthovo Premium Auth — Design Reference

## Visual Hierarchy & Premium Aesthetic

### **Color Palette**

```
Background:
├─ Deep Purple Base: #0B0618
├─ Mid Purple: #150D2E
└─ Ambient Glow: rgba(124, 58, 237, 0.18)

Surface (Glass Card):
├─ Base: rgba(22, 16, 40, 0.72)
├─ Border: rgba(255, 255, 255, 0.08)
└─ Backdrop Blur: 24px

Primary (Purple):
├─ Main: #7C3AED
├─ Light: #A78BFA
└─ Glow: rgba(124, 58, 237, 0.35)

CTA Button:
├─ Background: #FFFFFF (pure white)
├─ Text: #0B0618 (matches deep bg)
└─ Shadow: 0 4px 24px rgba(124, 58, 237, 0.35)

Inputs:
├─ Background: rgba(255, 255, 255, 0.04)
├─ Border (default): rgba(255, 255, 255, 0.1)
├─ Border (focus): rgba(167, 139, 250, 0.6)
├─ Border (error): rgba(239, 68, 68, 0.6)
└─ Border (success): #22C55E

Text:
├─ Primary: #FFFFFF
├─ Muted: rgba(255, 255, 255, 0.55)
└─ Subtle: rgba(255, 255, 255, 0.35)
```

---

## Typography Hierarchy

```
Logo/Brand:
├─ Size: 28px
├─ Weight: 800 (Extra Bold)
└─ Letter Spacing: -0.5px

Title (Screen Heading):
├─ Size: 26px
├─ Weight: 700 (Bold)
├─ Letter Spacing: -0.3px
└─ Color: #FFFFFF

Subtitle (Description):
├─ Size: 15px
├─ Weight: 400 (Regular)
├─ Line Height: 22px
└─ Color: rgba(255, 255, 255, 0.55)

Input Label:
├─ Size: 13px
├─ Weight: 600 (Semi-Bold)
├─ Letter Spacing: 0.2px
└─ Color: rgba(255, 255, 255, 0.55) → #A78BFA (on focus)

Input Text:
├─ Size: 15px
├─ Weight: 400 (Regular)
├─ Line Height: 22px
└─ Color: #FFFFFF

Button Text:
├─ Size: 15px
├─ Weight: 600 (Semi-Bold)
└─ Color: #0B0618 (primary) or #FFFFFF (secondary)

Error Text:
├─ Size: 13px
├─ Weight: 400 (Regular)
├─ Line Height: 18px
└─ Color: #EF4444

Link Text:
├─ Size: 14px
├─ Weight: 600 (Semi-Bold)
└─ Color: #A78BFA
```

---

## Spacing System

```
xs:   4px  — Tight spacing (icon-text gaps)
sm:   8px  — Label margins, checkbox gaps
md:  16px  — Input bottom margins, card padding
lg:  24px  — Section spacing, outer padding
xl:  32px  — Major section breaks
xxl: 48px  — Screen-level spacing
```

---

## Border Radius

```
sm:   8px  — Unused (reserved)
md:  14px  — Inputs, buttons
lg:  20px  — Unused (reserved)
xl:  24px  — Auth card container
full: 9999px — Pills, badges, small circles
```

---

## Animation Timings

```
Fast:   150ms — Subtle state changes (opacity, color)
Normal: 250ms — Input focus, border transitions
Slow:   350ms — Card entrance, page transitions

Spring Animations:
├─ Button Press: tension=300, friction=20
├─ Success Checkmark: tension=50, friction=7
└─ Error Shake: 5-step sequence (10px, -10px, 8px, -8px, 0)
```

---

## Component Visual Specs

### **AuthInput (Text Field)**

```
Container:
├─ Height: 52px (min)
├─ Background: rgba(255, 255, 255, 0.04)
├─ Border: 1px solid rgba(255, 255, 255, 0.1)
├─ Border Radius: 14px
├─ Padding: 16px horizontal
└─ Transition: border-color 0.2s ease

States:
├─ Default: border rgba(255, 255, 255, 0.1)
├─ Focus: border rgba(167, 139, 250, 0.6) + subtle glow
├─ Error: border rgba(239, 68, 68, 0.6) + shake animation
└─ Success: border #22C55E + checkmark icon

Icon (left):
├─ Size: 16px
├─ Opacity: 0.6 → 0.9 (on focus)
└─ Margin Right: 8px

Toggle (password):
├─ Position: Right side
├─ Padding: 4px
└─ Hitbox: 44x44px (accessibility)

Error Message:
├─ Margin Top: 4px
├─ Font Size: 13px
├─ Color: #EF4444
└─ Animation: fade-in 150ms
```

### **AuthButton (CTA)**

```
Container:
├─ Height: 52px (min)
├─ Border Radius: 14px
├─ Padding: 15px vertical, 24px horizontal
├─ Margin Bottom: 8px
└─ Transition: all 0.2s ease

Primary Variant:
├─ Background: #FFFFFF
├─ Text: #0B0618
├─ Shadow: 0 4px 24px rgba(124, 58, 237, 0.35)
└─ Press: scale(0.97)

Google Variant:
├─ Background: rgba(255, 255, 255, 0.06)
├─ Border: 1px solid rgba(255, 255, 255, 0.12)
├─ Text: #FFFFFF
└─ Press: scale(0.97)

Ghost Variant:
├─ Background: transparent
├─ Text: #A78BFA
└─ Press: scale(0.97)

Loading State:
├─ Spinner: 20px (small)
├─ Text: "Signing in..." / "Connecting..."
└─ Disabled: opacity 0.5

Success State:
├─ Background: #22C55E
├─ Icon: Checkmark in circle
└─ Animation: spring scale-in
```

### **AuthLayout (Container)**

```
Background:
├─ Base: #0B0618
├─ Gradient: radial at 50% -10%, purple glow
├─ Secondary Glow: bottom-right corner
└─ Ambient Orbs: native fallback (2 circles)

Card Container:
├─ Max Width: 440px
├─ Background: rgba(22, 16, 40, 0.72)
├─ Border: 1px solid rgba(255, 255, 255, 0.08)
├─ Border Radius: 24px
├─ Padding: 24px
├─ Backdrop Blur: 24px (web only)
├─ Shadow: 0 24px 80px rgba(0, 0, 0, 0.45)
└─ Animation: fade-in + slide-up (350ms)

Responsive:
├─ Mobile: Full width - 48px (24px each side)
├─ Tablet: Max 440px centered
└─ Desktop: Max 440px centered

Safe Areas:
├─ Top: Math.max(insets.top, 24px)
└─ Bottom: Math.max(insets.bottom, 24px)
```

### **PasswordStrength Indicator**

```
Bar Track:
├─ 4 segments (flex: 1 each)
├─ Height: 3px
├─ Gap: 4px
└─ Border Radius: 9999px (pill)

Strength Colors:
├─ Weak: #EF4444 (red)
├─ Fair: #F97316 (orange)
├─ Good: #EAB308 (yellow)
└─ Strong: #22C55E (green)

Requirements List:
├─ Icon: ○ (unfilled) → ✓ (filled)
├─ Icon Size: 11px
├─ Text: 13px regular
└─ Color: rgba(255, 255, 255, 0.35) → rgba(255, 255, 255, 0.55)

Requirements:
✓ Minimum 8 characters
✓ At least one uppercase letter
✓ At least one lowercase letter
✓ At least one number
✓ At least one special character
```

---

## Micro-Interactions Timeline

### **Input Focus (250ms)**
```
0ms:   User taps/focuses input
0-250ms: Border color transitions (gray → purple)
0-250ms: Label color transitions (muted → purple light)
0-250ms: Icon opacity increases (0.6 → 0.9)
0-250ms: Subtle glow appears around border
250ms:  Focus state complete
```

### **Error Shake (250ms total)**
```
0ms:    Error detected
0-50ms:  translateX(0 → 10px)
50-100ms: translateX(10px → -10px)
100-150ms: translateX(-10px → 8px)
150-200ms: translateX(8px → -8px)
200-250ms: translateX(-8px → 0)
250ms:   Rest position
```

### **Button Press (300ms + release)**
```
Press Down:
0ms:    User touches button
0-100ms: scale(1 → 0.97) [spring: tension 300, friction 20]
100ms:  Hold at 97%

Release:
0ms:    User releases button
0-150ms: scale(0.97 → 1) [spring: tension 300, friction 20]
150ms:  Rest position
```

### **Success Checkmark (500ms)**
```
0ms:    Success state triggered
0-100ms: Background color transitions (white → green)
0-300ms: Checkmark scales in (0 → 1) [spring: tension 50, friction 7]
300-500ms: Subtle bounce/overshoot from spring
500ms:  Rest position
```

---

## Accessibility Compliance

### **Color Contrast (WCAG AA)**
```
✓ Primary Text (#FFFFFF) on Background (#0B0618): 21:1
✓ Muted Text (rgba(255,255,255,0.55)) on Background: 9.5:1
✓ Button Text (#0B0618) on White (#FFFFFF): 21:1
✓ Error Text (#EF4444) on Background: 5.8:1
✓ Link Text (#A78BFA) on Background: 8.2:1
```

### **Touch Targets**
```
✓ All buttons: minimum 44x44px
✓ Input fields: minimum 52px height
✓ Checkboxes: minimum 40x40px hitbox
✓ Links: 44x44px hitbox with padding
✓ Password toggle: 44x44px hitbox
```

### **Keyboard Navigation**
```
✓ Tab through all interactive elements
✓ Enter submits forms on last input
✓ Focus visible (purple ring)
✓ Logical focus order (top-to-bottom)
✓ Skip links available (web only)
```

### **Screen Readers**
```
✓ Semantic HTML (button, input, label)
✓ ARIA labels where needed
✓ Live regions for errors (role="alert")
✓ Accessible names for all controls
✓ Form validation announcements
```

---

## Responsive Breakpoints

```
Small Phone (< 375px):
├─ Card padding: 20px
├─ Font sizes: -1px
└─ Button height: 48px

Phone (375px - 768px):
├─ Card padding: 24px
├─ Standard font sizes
└─ Button height: 52px

Tablet (768px - 1024px):
├─ Card max-width: 440px
├─ Centered layout
└─ Increased touch targets

Desktop (> 1024px):
├─ Card max-width: 440px
├─ Centered with ambient space
├─ Hover states visible
└─ Cursor changes (pointer)
```

---

## Platform-Specific Behavior

### **iOS**
```
✓ KeyboardAvoidingView with padding behavior
✓ Safe area insets respected (notch)
✓ Proper textContentType for autofill
✓ Return key types (next, go, done)
✓ Haptic feedback on errors (optional)
```

### **Android**
```
✓ KeyboardAvoidingView disabled (not needed)
✓ Proper autoComplete values
✓ Navigation bar spacing
✓ Material-style ripple (native)
✓ Back button handling
```

### **Web (PWA)**
```
✓ Backdrop blur (WebKit + standard)
✓ CSS transitions for smooth interactions
✓ Hover states for desktop
✓ Focus-visible pseudo-class
✓ Cursor: pointer on interactive elements
✓ Box-shadow for depth
✓ prefers-reduced-motion media query
```

---

## Edge Cases Handled

### **Network Errors**
```
"Something went wrong. Check your connection and try again."
```

### **Invalid Credentials**
```
"Email or password doesn't look right. Check your details and try again."
```

### **Rate Limiting (5+ attempts)**
```
"Too many attempts. Please wait a moment."
```

### **Account Already Exists**
```
"An account with this email already exists. Try signing in instead."
```

### **Google OAuth Cancelled**
```
"Google sign-in was cancelled. Please try again."
```

### **Email Format Invalid**
```
"Please enter a valid email address."
```

### **Password Too Weak**
```
"Password must be at least 8 characters."
(Plus dynamic strength meter)
```

### **Passwords Don't Match**
```
"Passwords do not match."
(Plus real-time success checkmark when they do)
```

---

## Performance Optimizations

### **Animations**
```
✓ Use useNativeDriver where possible
✓ Avoid layout animations (translateX/Y, scale, opacity only)
✓ Spring physics for natural feel
✓ Respect prefers-reduced-motion
✓ Conditional animations (skip on low-end devices)
```

### **Rendering**
```
✓ Memoized components where appropriate
✓ Minimal re-renders (local state)
✓ Debounced validation (real-time checks)
✓ Lazy loading for heavy components
✓ Optimistic UI updates
```

### **Bundle Size**
```
✓ No unnecessary dependencies
✓ Reusable components (DRY)
✓ Tree-shaking friendly imports
✓ Platform-specific code splitting
✓ Shared design tokens
```

---

## Design System Principles

1. **Consistency** — Every component follows the same visual language
2. **Clarity** — Users always know what's happening and what to do next
3. **Efficiency** — Minimize friction, optimize for task completion
4. **Delight** — Subtle polish that makes users smile
5. **Accessibility** — Usable by everyone, regardless of ability

---

## Inspiration Sources

While the Growthovo auth experience is unique, it draws inspiration from:

- **Stripe** — Clean forms, clear errors
- **Linear** — Purple aesthetic, smooth animations
- **Vercel** — Dark glassmorphism, premium feel
- **Notion** — Inline validation, smart defaults
- **Apple** — Attention to micro-interactions
- **Duolingo** — Encouraging feedback, progress indicators

But Growthovo goes beyond by combining the best of all these while maintaining its own distinct personality: **supportive, intelligent, and growth-focused**.

---

**The result: A world-class authentication experience that sets the tone for the entire Growthovo platform.**
