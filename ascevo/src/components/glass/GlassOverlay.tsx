import React from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  Platform,
  Animated,
} from 'react-native';
import { getGlassTheme, getResolvedTheme } from '../../services/themeService';
import { useBlurOptimization } from '../../hooks/useBlurOptimization';

export interface GlassOverlayProps {
  visible: boolean;
  onPress?: () => void;
  blurAmount?: number;
  tintColor?: string;
  opacity?: number;
  animated?: boolean;
  /**
   * Whether to optimize blur rendering
   * @default true
   */
  optimizeBlur?: boolean;
}

/**
 * GlassOverlay - Backdrop overlay for modals with blur and tint
 * 
 * Platform-specific implementations:
 * - Web: Uses CSS backdrop-filter for blur effect
 * - iOS: Uses @react-native-community/blur (to be added)
 * - Android: Uses semi-transparent background (fallback)
 * 
 * Performance optimizations:
 * - Viewport detection: Only applies blur to visible elements
 * - Scroll optimization: Disables blur during scrolling
 */
export default function GlassOverlay({
  visible,
  onPress,
  blurAmount = 20,
  tintColor,
  opacity = 0.8,
  animated = true,
  optimizeBlur = true,
}: GlassOverlayProps) {
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;

  // Blur optimization - overlays are always visible when rendered
  const { shouldBlur, ref } = useBlurOptimization({
    enabled: optimizeBlur,
    disableOnScroll: false, // Overlays typically don't need scroll optimization
    checkViewport: false, // Overlays are always in viewport when visible
  });

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedOpacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      animatedOpacity.setValue(visible ? 1 : 0);
    }
  }, [visible, animated, animatedOpacity]);

  if (!visible && !animated) {
    return null;
  }

  const theme = getResolvedTheme();
  const glassTheme = getGlassTheme(theme);
  const defaultTint = theme === 'dark' 
    ? glassTheme.tint.dark 
    : glassTheme.tint.light;

  const overlayStyle = getOverlayStyle(
    blurAmount,
    tintColor || defaultTint,
    opacity,
    shouldBlur
  );

  const content = (
    <Animated.View
      ref={ref}
      style={[
        styles.overlay,
        overlayStyle,
        animated && { opacity: animatedOpacity },
      ]}
      accessibilityRole="none"
      accessibilityLabel="Modal backdrop"
    />
  );

  if (onPress) {
    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        accessibilityHint="Tap to dismiss"
      >
        {content}
      </TouchableWithoutFeedback>
    );
  }

  return content;
}

/**
 * Get platform-specific overlay styling
 */
function getOverlayStyle(
  blurAmount: number,
  tintColor: string,
  opacity: number,
  shouldBlur: boolean = true
): ViewStyle {
  const baseStyle: ViewStyle = {
    backgroundColor: tintColor,
  };

  // If blur is disabled, return base style without blur
  if (!shouldBlur) {
    if (Platform.OS === 'ios') {
      return {
        ...baseStyle,
        opacity,
      };
    }
    return baseStyle;
  }

  // Web-specific: Add backdrop-filter for blur effect
  if (Platform.OS === 'web') {
    return {
      ...baseStyle,
      // @ts-ignore - backdrop-filter is not in React Native types but works on web
      backdropFilter: `blur(${blurAmount}px)`,
      // @ts-ignore - WebKit prefix for Safari support
      WebkitBackdropFilter: `blur(${blurAmount}px)`,
    };
  }

  // iOS: Will use BlurView component (to be implemented in future enhancement)
  // For now, use semi-transparent background
  if (Platform.OS === 'ios') {
    return {
      ...baseStyle,
      opacity,
    };
  }

  // Android: Use semi-transparent background
  return {
    ...baseStyle,
    opacity,
  };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});
