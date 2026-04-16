# Glassmorphism Components

This directory contains glassmorphism UI components that provide frosted glass effects across web and mobile platforms.

## GlassCard

A reusable card component with platform-specific blur implementations.

### Features

- **Cross-platform blur effects**:
  - Web: CSS `backdrop-filter` for native blur
  - iOS: Semi-transparent background (BlurView integration planned)
  - Android: Semi-transparent background with elevation shadows
- **Three intensity levels**: light, medium, heavy
- **Customizable tint and border colors**
- **Optional press interaction**
- **Accessible by default**

### Usage

```tsx
import { GlassCard } from '../components/glass';

// Basic usage
<GlassCard>
  <Text>Content goes here</Text>
</GlassCard>

// With intensity
<GlassCard intensity="heavy">
  <Text>Heavy blur effect</Text>
</GlassCard>

// With custom colors
<GlassCard
  intensity="medium"
  tint="rgba(100, 50, 200, 0.7)"
  borderColor="rgba(255, 255, 255, 0.3)"
>
  <Text>Custom styled glass</Text>
</GlassCard>

// Pressable card
<GlassCard
  intensity="light"
  onPress={() => console.log('Card pressed')}
>
  <Text>Tap me!</Text>
</GlassCard>

// With custom styling
<GlassCard
  style={{ marginTop: 20, padding: 24 }}
>
  <Text>Custom padding and margin</Text>
</GlassCard>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Content to render inside the card |
| `intensity` | `'light' \| 'medium' \| 'heavy'` | `'medium'` | Blur intensity level |
| `tint` | `string` | varies by intensity | Background tint color (rgba format) |
| `borderColor` | `string` | varies by intensity | Border color (rgba format) |
| `style` | `ViewStyle` | `undefined` | Additional custom styles |
| `onPress` | `() => void` | `undefined` | Optional press handler (makes card pressable) |

### Intensity Levels

- **Light**: Subtle blur (8px), 60% opacity, minimal shadow
- **Medium**: Moderate blur (16px), 75% opacity, medium shadow
- **Heavy**: Strong blur (24px), 85% opacity, prominent shadow

### Platform Considerations

#### Web
- Uses CSS `backdrop-filter` for native blur effect
- Includes `-webkit-backdrop-filter` for Safari support
- Gracefully degrades to semi-transparent background if blur is not supported

#### iOS
- Currently uses semi-transparent background
- Future enhancement: Will integrate `@react-native-community/blur` for native `UIVisualEffectView`

#### Android
- Uses semi-transparent background with elevation shadows
- Provides consistent visual hierarchy without blur
- Optimized for performance on lower-end devices

### Accessibility

- Automatically sets `accessibilityRole="button"` when `onPress` is provided
- Supports keyboard navigation on web
- Works with screen readers (VoiceOver, TalkBack)

### Performance

- Blur effects are GPU-accelerated on web
- Minimal re-renders with React.memo (if needed)
- Optimized for 60fps animations

### Requirements Validated

- **8.1**: Glassmorphism visual effects with backdrop blur
- **8.2**: Platform-appropriate blur implementations
- **11.1**: Web platform support with CSS backdrop-filter
- **11.2**: iOS platform support (semi-transparent, BlurView planned)
- **11.3**: Android platform support with fallback
