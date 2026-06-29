import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  TextInput,
  ViewToken,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius } from '../../theme';
import NotificationPermissionPrompt from '../../components/NotificationPermissionPrompt';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AVATAR_COLORS = [
  '#7C3AED', // Purple
  '#34D399', // Teal
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
];

const PILLARS = [
  { key: 'mind', label: 'Mind', icon: '🧠' },
  { key: 'discipline', label: 'Discipline', icon: '🔥' },
  { key: 'communication', label: 'Communication', icon: '💬' },
  { key: 'money', label: 'Money', icon: '💰' },
  { key: 'career', label: 'Career', icon: '🚀' },
  { key: 'relationships', label: 'Relationships', icon: '❤️' },
];

const TIME_COMMITMENTS = ['5 min', '10 min', '20 min', '30 min+'];

interface Props {
  userId?: string;
  onComplete: () => void;
}

export default function NewOnboardingScreen({ userId, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  // Check if onboarding was already completed
  React.useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('@growthovo:onboarding_complete');
      if (completed === 'true') {
        onComplete();
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleSkip = () => {
    // Navigate directly to Screen 5 (index 4)
    flatListRef.current?.scrollToIndex({ index: 4, animated: true });
  };

  const handleNext = () => {
    if (currentIndex < 4) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const getItemLayout = (_data: any, index: number) => ({
    length: SCREEN_WIDTH,
    offset: SCREEN_WIDTH * index,
    index,
  });

  const togglePillar = (pillarKey: string) => {
    setSelectedPillars((prev) =>
      prev.includes(pillarKey)
        ? prev.filter((k) => k !== pillarKey)
        : [...prev, pillarKey]
    );
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.multiSet([
        ['@growthovo:onboarding_complete', 'true'],
        ['@growthovo:selected_pillars', JSON.stringify(selectedPillars)],
        ['@growthovo:time_commitment', timeCommitment],
        ['@growthovo:user_name', userName],
        ['@growthovo:avatar_color', avatarColor],
      ]);

      if (userId) {
        const { saveNewOnboardingToSupabase } = await import('../../services/growthovoExperienceService');
        await saveNewOnboardingToSupabase(userId, {
          pillars: selectedPillars,
          timeCommitment,
          userName,
          avatarColor,
        });
      }

      // Show notification permission prompt after onboarding completes
      setShowNotificationPrompt(true);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const handleNotificationPromptDismiss = () => {
    setShowNotificationPrompt(false);
    onComplete();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderScreen = ({ item }: { item: number }) => {
    switch (item) {
      case 0:
        return <Screen1 onNext={handleNext} />;
      case 1:
        return <Screen2 onNext={handleNext} />;
      case 2:
        return (
          <Screen3
            selectedPillars={selectedPillars}
            onTogglePillar={togglePillar}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <Screen4
            timeCommitment={timeCommitment}
            onSelectTime={setTimeCommitment}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <Screen5
            userName={userName}
            onChangeUserName={setUserName}
            avatarColor={avatarColor}
            onSelectColor={setAvatarColor}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip button in top-right corner */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Skip onboarding"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={[0, 1, 2, 3, 4]}
        renderItem={renderScreen}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEnabled={true}
        bounces={false}
        getItemLayout={getItemLayout}
      />

      {/* Page indicators */}
      <View style={styles.pagination}>
        {[0, 1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      {/* Notification Permission Prompt */}
      <NotificationPermissionPrompt
        visible={showNotificationPrompt}
        onDismiss={handleNotificationPromptDismiss}
      />
    </View>
  );
}

// ─── Screen 1: Welcome with egg hatching animation ────────────────────────────

function Screen1({ onNext }: { onNext: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const crackOpacityAnim = useRef(new Animated.Value(0)).current;
  const hatchedOpacityAnim = useRef(new Animated.Value(0)).current;
  const hatchedScaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Start the egg hatching animation sequence
    const animationSequence = Animated.sequence([
      // Phase 1: Egg wobbles (scale pulses)
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 }
      ),
      // Phase 2: Show cracks
      Animated.timing(crackOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Phase 3: Egg breaks (fade out and scale down)
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Phase 4: Hatched creature appears (fade in and scale up)
      Animated.parallel([
        Animated.timing(hatchedOpacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(hatchedScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start();
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.screenContent}>
        <Text style={styles.logo}>Growthovo</Text>
        <Text style={styles.welcomeText}>Your growth adventure starts now</Text>
        
        {/* Egg hatching animation */}
        <View style={styles.eggContainer}>
          {/* Egg with wobble and fade out */}
          <Animated.View
            style={[
              styles.eggWrapper,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <Text style={styles.eggEmoji}>🥚</Text>
            {/* Crack overlay */}
            <Animated.View
              style={[
                styles.crackOverlay,
                { opacity: crackOpacityAnim },
              ]}
            >
              <Text style={styles.crackEmoji}>💥</Text>
            </Animated.View>
          </Animated.View>

          {/* Hatched creature (appears after egg breaks) */}
          <Animated.View
            style={[
              styles.hatchedWrapper,
              {
                opacity: hatchedOpacityAnim,
                transform: [{ scale: hatchedScaleAnim }],
              },
            ]}
          >
            <Text style={styles.hatchedEmoji}>🐣</Text>
          </Animated.View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Continue to next screen"
      >
        <Text style={styles.primaryButtonText}>Get Started →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 2: Feature highlights ──────────────────────────────────────────────

function Screen2({ onNext }: { onNext: () => void }) {
  const features = [
    { icon: '🤖', text: 'Rex, your AI coach — always there' },
    { icon: '🎮', text: 'Earn XP, level up, beat your league' },
    { icon: '🌱', text: 'Grow across 6 areas of your life' },
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.screenContent}>
        <Text style={styles.title}>What makes Growthovo special</Text>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        testID="onboarding-screen2-continue"
        style={styles.primaryButton}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Continue to pillar selection"
      >
        <Text style={styles.primaryButtonText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 3: Pillar selection ────────────────────────────────────────────────

interface Screen3Props {
  selectedPillars: string[];
  onTogglePillar: (key: string) => void;
  onNext: () => void;
}

function Screen3({ selectedPillars, onTogglePillar, onNext }: Screen3Props) {
  const canContinue = selectedPillars.length >= 1;

  return (
    <View style={styles.screen}>
      <View style={styles.screenContent}>
        <Text style={styles.title}>Which areas matter most right now?</Text>
        <Text style={styles.subtitle}>Select at least one</Text>

        <View style={styles.pillarsGrid}>
          {PILLARS.map((pillar) => {
            const isSelected = selectedPillars.includes(pillar.key);
            return (
              <TouchableOpacity
                key={pillar.key}
                style={[
                  styles.pillarCard,
                  isSelected && styles.pillarCardSelected,
                ]}
                onPress={() => onTogglePillar(pillar.key)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={pillar.label}
              >
                <Text style={styles.pillarIcon}>{pillar.icon}</Text>
                <Text style={styles.pillarLabel}>{pillar.label}</Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        testID="onboarding-screen3-continue"
        style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
        onPress={onNext}
        disabled={!canContinue}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canContinue }}
        accessibilityLabel="Continue to time commitment"
      >
        <Text style={styles.primaryButtonText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 4: Time commitment selection ───────────────────────────────────────

interface Screen4Props {
  timeCommitment: string;
  onSelectTime: (time: string) => void;
  onNext: () => void;
}

function Screen4({ timeCommitment, onSelectTime, onNext }: Screen4Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.screenContent}>
        <Text style={styles.title}>How much time can you commit daily?</Text>

        <View style={styles.timeOptionsContainer}>
          {TIME_COMMITMENTS.map((time) => {
            const isSelected = timeCommitment === time;
            return (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOption,
                  isSelected && styles.timeOptionSelected,
                ]}
                onPress={() => onSelectTime(time)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={time}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    isSelected && styles.timeOptionTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        testID="onboarding-screen4-continue"
        style={styles.primaryButton}
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel="Continue to personalization"
      >
        <Text style={styles.primaryButtonText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen 5: Name and avatar customization ───────────────────────────────────

interface Screen5Props {
  userName: string;
  onChangeUserName: (name: string) => void;
  avatarColor: string;
  onSelectColor: (color: string) => void;
  onComplete: () => void;
}

function Screen5({
  userName,
  onChangeUserName,
  avatarColor,
  onSelectColor,
  onComplete,
}: Screen5Props) {
  return (
    <View style={styles.screen}>
      <View style={styles.screenContent}>
        <Text style={styles.title}>What should Rex call you?</Text>
        
        <TextInput
          style={styles.nameInput}
          value={userName}
          onChangeText={onChangeUserName}
          placeholder="Enter your name"
          placeholderTextColor={colors.textMuted}
          maxLength={20}
          accessibilityLabel="Name input"
        />

        <Text style={[styles.title, { marginTop: spacing.xl }]}>
          Choose your avatar color
        </Text>

        <View style={styles.colorSwatchesContainer}>
          {AVATAR_COLORS.map((color) => {
            const isSelected = avatarColor === color;
            return (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color },
                  isSelected && styles.colorSwatchSelected,
                ]}
                onPress={() => onSelectColor(color)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`Color ${color}`}
              >
                {isSelected && (
                  <Text style={styles.colorSwatchCheck}>✓</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onComplete}
        accessibilityRole="button"
        accessibilityLabel="Complete onboarding"
      >
        <Text style={styles.primaryButtonText}>Let's go →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textMuted,
  },
  screen: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 100,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  screenContent: {
    flex: 1,
  },
  logo: {
    ...typography.h1,
    fontSize: 48,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  welcomeText: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  eggContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl * 2,
    height: 200,
  },
  eggWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eggEmoji: {
    fontSize: 120,
  },
  crackOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crackEmoji: {
    fontSize: 80,
  },
  hatchedWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hatchedEmoji: {
    fontSize: 120,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  featuresContainer: {
    marginTop: spacing.xl,
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  featureText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: spacing.md,
  },
  pillarCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  pillarCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '22',
  },
  pillarIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  pillarLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  timeOptionsContainer: {
    marginTop: spacing.xl,
  },
  timeOption: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  timeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '22',
  },
  timeOptionText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 18,
  },
  timeOptionTextSelected: {
    color: colors.primary,
  },
  nameInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    ...typography.body,
    color: colors.text,
    marginTop: spacing.md,
  },
  colorSwatchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: spacing.lg,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSwatchSelected: {
    borderColor: '#fff',
  },
  colorSwatchCheck: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    ...typography.bodyBold,
    color: '#fff',
    fontSize: 18,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});
