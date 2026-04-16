import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from 'react-native';
import { colors, shadows } from '../../theme';
import { useBlurOptimization } from '../../hooks/useBlurOptimization';
import { usePerformanceStore } from '../../store';

export interface GlassCardProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  tint?: string;
  borderColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
  /**
   * Whether to optimize blur rendering (viewport detection, scroll handling)
   * @default true
   */
  optimizeBlur?: boolean;
  /**
   * Whether to disable blur during scrolling
   * @default true
   */
  disableBlurOnScroll?: boolean;
}

/**
 * GlassCard - A reusable card component with frosted glass effect
 * 
 * Platform-specific implementations:
 * - Web: Uses CSS backdrop-filter for blur effect
 * - iOS: Uses @react-native-community/blur (to be added)
 * - Android: Uses semi-transparent background with shadow (fallback)
 * 
 * Performance optimizations:
 * - Viewport detection: Only applies blur to visible elements
 * - Scroll optimization: Disables blur during scrolling
 * - Automatic re-enable: Re-enables blur when scrolling stops
 */
export default function GlassCard({
  children,
  intensity: propIntensity = 'medium',
  tint,
  borderColor,
  style,
  onPress,
  optimizeBlur = true,
  disableBlurOnScroll = true,
}: GlassCardProps) {
  const { settings } = usePerformanceStore();
  const intensity = settings.glassmorphismEnabled ? (settings.blurIntensity || propIntensity) : 'light';
  const isBlurEnabled = settings.glassmorphismEnabled;

  const { shouldBlur, ref } = useBlurOptimization({
    enabled: optimizeBlur && isBlurEnabled,
    disableOnScroll: disableBlurOnScroll,
    checkViewport: true,
  });

  const glassStyle = getGlassStyle(
    intensity as 'light' | 'medium' | 'heavy',
    tint,
    borderColor,
    shouldBlur && isBlurEnabled
  );

  const containerStyle = [styles.container, glassStyle, style];

  if (onPress) {
    return (
      <TouchableOpacity
        ref={ref}
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View ref={ref} style={containerStyle}>
      {children}
    </View>
  );
}

/**
 * Get platform-specific glass styling based on intensity
 */
function getGlassStyle(
  intensity: 'light' | 'medium' | 'heavy',
  tint?: string,
  borderColor?: string,
  shouldBlur: boolean = true
): ViewStyle {
  const config = GLASS_CONFIGS[intensity];
  
  const baseStyle: ViewStyle = {
    backgroundColor: tint || config.tint,
    borderWidth: 1,
    borderColor: borderColor || config.borderColor,
    ...config.shadow,
  };

  // If blur is disabled (scrolling or not visible), return base style without blur
  if (!shouldBlur) {
    if (Platform.OS === 'android') {
      return {
        ...baseStyle,
        elevation: config.elevation,
      };
    }
    return baseStyle;
  }

  // Web-specific: Add backdrop-filter for blur effect
  if (Platform.OS === 'web') {
    return {
      ...baseStyle,
      // @ts-ignore - backdrop-filter is not in React Native types but works on web
      backdropFilter: `blur(${config.blur}px)`,
      // @ts-ignore - WebKit prefix for Safari support
      WebkitBackdropFilter: `blur(${config.blur}px)`,
    };
  }

  // iOS: Will use BlurView component (to be implemented in future enhancement)
  // For now, use semi-transparent background
  if (Platform.OS === 'ios') {
    return {
      ...baseStyle,
      // iOS will eventually use BlurView wrapper
      // For MVP, use enhanced transparency
      backgroundColor: tint || config.tint,
    };
  }

  // Android: Use semi-transparent background with elevation
  return {
    ...baseStyle,
    elevation: config.elevation,
  };
}

/**
 * Glass effect configurations for different intensity levels
 */
const GLASS_CONFIGS = {
  light: {
    blur: 8,
    tint: 'rgba(20, 20, 20, 0.6)', // surface with 60% opacity
    opacity: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadow: shadows.sm,
    elevation: 2,
  },
  medium: {
    blur: 16,
    tint: 'rgba(20, 20, 20, 0.75)', // surface with 75% opacity
    opacity: 0.75,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadow: shadows.md,
    elevation: 4,
  },
  heavy: {
    blur: 24,
    tint: 'rgba(20, 20, 20, 0.85)', // surface with 85% opacity
    opacity: 0.85,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadow: shadows.md,
    elevation: 6,
  },
} as const;

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
});
