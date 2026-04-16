import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
} from 'react-native-reanimated';
import { useProgressAnimation } from '../../hooks/useProgressAnimation';

// Create animated Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  progress: number; // 0-1 (0% to 100%)
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  animated?: boolean;
  style?: ViewStyle;
}

/**
 * ProgressRing - Circular progress indicator using SVG
 * 
 * Features:
 * - Circular progress indicator using React Native SVG
 * - Animated stroke drawing with smooth transitions
 * - Custom size, stroke width, and colors support
 * - Allow children content in center
 * - Cross-platform compatibility (web, iOS, Android)
 * 
 * Requirements: 7.2, 7.3
 */
export default function ProgressRing({
  progress,
  size,
  strokeWidth,
  color,
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  children,
  animated = true,
  style,
}: ProgressRingProps) {
  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  // Convert progress (0-1) to percentage (0-100) for animation
  const progressPercentage = clampedProgress * 100;
  
  // Use progress animation hook for smooth transitions
  const { animatedValue } = useProgressAnimation(
    animated ? progressPercentage : progressPercentage,
    animated ? 500 : 0
  );

  // Calculate circle dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    // Calculate stroke dash offset based on animated progress
    // Progress goes from 0 to 100, we want strokeDashoffset to go from circumference to 0
    const progressValue = animatedValue.value / 100;
    const strokeDashoffset = circumference * (1 - progressValue);
    
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* SVG for circular progress */}
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          // Rotate to start from top (-90 degrees)
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>

      {/* Children content in center */}
      {children && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  childrenContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
