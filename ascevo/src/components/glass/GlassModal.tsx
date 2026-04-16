import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Platform,
  Animated,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import GlassOverlay from './GlassOverlay';
import { getGlassTheme, getResolvedTheme } from '../../services/themeService';
import { useBlurOptimization } from '../../hooks/useBlurOptimization';

export interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'fade' | 'slide' | 'scale';
  blurIntensity?: number;
  fullScreen?: boolean;
  style?: ViewStyle;
  showCloseButton?: boolean;
  /**
   * Whether to optimize blur rendering
   * @default true
   */
  optimizeBlur?: boolean;
  accessibilityLabel?: string;
  accessibilityViewIsModal?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * GlassModal - Full-screen or partial modal with glassmorphism background
 * 
 * Features:
 * - Multiple animation types (fade, slide, scale)
 * - Glassmorphism background with blur
 * - Accessibility support (screen reader, keyboard navigation)
 * - Platform-specific implementations
 * - Performance optimization (viewport detection, scroll handling)
 */
export default function GlassModal({
  visible,
  onClose,
  children,
  animationType = 'fade',
  blurIntensity = 20,
  fullScreen = false,
  style,
  showCloseButton = true,
  optimizeBlur = true,
  accessibilityLabel,
  accessibilityViewIsModal,
  importantForAccessibility,
}: GlassModalProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = React.useState(visible);

  // Blur optimization - modals are always visible when rendered
  const { shouldBlur, ref } = useBlurOptimization({
    enabled: optimizeBlur,
    disableOnScroll: false, // Modals typically don't need scroll optimization
    checkViewport: false, // Modals are always in viewport when visible
  });

  // Announce modal to screen readers
  React.useEffect(() => {
    if (visible) {
      AccessibilityInfo.announceForAccessibility('Modal opened');
    }
  }, [visible]);

  // Handle animation
  React.useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible, animatedValue]);

  // Handle hardware back button on Android
  React.useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      const backHandler = () => {
        onClose();
        return true;
      };
      
      // Note: BackHandler would be imported from react-native
      // For now, we'll handle this through the Modal component's onRequestClose
    }
  }, [visible, onClose]);

  if (!isRendered) {
    return null;
  }

  const theme = getResolvedTheme();
  const glassTheme = getGlassTheme(theme);
  
  const contentStyle = getContentStyle(
    animationType,
    animatedValue,
    fullScreen
  );

  const modalContentStyle = getModalContentStyle(
    blurIntensity,
    theme === 'dark',
    glassTheme,
    shouldBlur
  );

  return (
    <Modal
      visible={isRendered}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityLabel={accessibilityLabel}
      accessibilityViewIsModal={accessibilityViewIsModal}
      importantForAccessibility={importantForAccessibility}
    >
      <View style={styles.container}>
        {/* Backdrop overlay with blur */}
        <GlassOverlay
          visible={visible}
          onPress={onClose}
          blurAmount={blurIntensity}
          opacity={0.8}
          animated
          optimizeBlur={optimizeBlur}
        />

        {/* Modal content */}
        <Animated.View
          ref={ref}
          style={[
            fullScreen ? styles.fullScreenContent : styles.partialContent,
            modalContentStyle,
            contentStyle,
            style,
          ]}
          accessibilityLabel="Modal dialog"
          accessibilityViewIsModal
        >
          {showCloseButton && !fullScreen && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              accessibilityHint="Double tap to close the modal"
            >
              <View style={styles.closeIcon}>
                <View style={styles.closeIconLine1} />
                <View style={styles.closeIconLine2} />
              </View>
            </TouchableOpacity>
          )}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

/**
 * Get animation style based on animation type
 */
function getContentStyle(
  animationType: 'fade' | 'slide' | 'scale',
  animatedValue: Animated.Value,
  fullScreen: boolean
): Animated.WithAnimatedObject<ViewStyle> {
  switch (animationType) {
    case 'fade':
      return {
        opacity: animatedValue,
      };

    case 'slide':
      return {
        opacity: animatedValue,
        transform: [
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [SCREEN_HEIGHT, 0],
            }),
          },
        ],
      };

    case 'scale':
      return {
        opacity: animatedValue,
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      };

    default:
      return {
        opacity: animatedValue,
      };
  }
}

/**
 * Get modal content glassmorphism style
 */
function getModalContentStyle(
  blurIntensity: number,
  isDark: boolean,
  glassTheme: ReturnType<typeof getGlassTheme>,
  shouldBlur: boolean = true
): ViewStyle {
  const tintColor = isDark ? glassTheme.tint.dark : glassTheme.tint.light;
  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)';

  const baseStyle: ViewStyle = {
    backgroundColor: tintColor,
    borderWidth: 1,
    borderColor,
    ...glassTheme.shadow,
  };

  // If blur is disabled, return base style without blur
  if (!shouldBlur) {
    if (Platform.OS === 'ios') {
      return {
        ...baseStyle,
        opacity: 0.95,
      };
    }
    if (Platform.OS === 'android') {
      return {
        ...baseStyle,
        elevation: 8,
      };
    }
    return baseStyle;
  }

  // Web-specific: Add backdrop-filter for blur effect
  if (Platform.OS === 'web') {
    return {
      ...baseStyle,
      // @ts-ignore - backdrop-filter is not in React Native types but works on web
      backdropFilter: `blur(${blurIntensity}px)`,
      // @ts-ignore - WebKit prefix for Safari support
      WebkitBackdropFilter: `blur(${blurIntensity}px)`,
    };
  }

  // iOS: Will use BlurView component (to be implemented in future enhancement)
  // For now, use semi-transparent background
  if (Platform.OS === 'ios') {
    return {
      ...baseStyle,
      opacity: 0.95,
    };
  }

  // Android: Use semi-transparent background with elevation
  return {
    ...baseStyle,
    elevation: 8,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContent: {
    width: '100%',
    height: '100%',
    zIndex: 1001,
  },
  partialContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 24,
    padding: 24,
    zIndex: 1001,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconLine1: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  closeIconLine2: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
});
