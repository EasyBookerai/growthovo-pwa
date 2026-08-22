# 🎨 Mascot Integration Examples

Real-world examples of integrating the mascot system into your Growthovo app.

---

## 📱 Example 1: Lesson Completion Flow

Add mascot celebration to your lesson completion screen:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMascot } from '../hooks/useMascot';
import { MascotDisplay } from '../components/MascotDisplay';
import { MascotEvolutionModal } from '../components/MascotEvolutionModal';
import { willEvolveWithXP } from '../utils/mascotHelpers';

interface LessonCompleteScreenProps {
  route: {
    params: {
      lessonId: string;
      xpEarned: number;
      correctAnswers: number;
      totalQuestions: number;
    };
  };
  navigation: any;
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({
  route,
  navigation,
}) => {
  const { xpEarned } = route.params;
  const { user } = useAuth();
  const {
    status,
    showEvolutionModal,
    lastEvolution,
    dismissEvolutionModal,
  } = useMascot(user?.id);

  const [willEvolve, setWillEvolve] = useState(false);

  useEffect(() => {
    if (status) {
      const { willEvolve: evolving } = willEvolveWithXP(
        status.totalXP,
        status.currentLevel,
        xpEarned
      );
      setWillEvolve(evolving);
    }
  }, [status, xpEarned]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lesson Complete! 🎉</Text>

      {/* XP Earned */}
      <View style={styles.xpCard}>
        <Text style={styles.xpLabel}>XP Earned</Text>
        <Text style={styles.xpValue}>+{xpEarned}</Text>
      </View>

      {/* Mascot Display */}
      {status && (
        <View style={styles.mascotSection}>
          <MascotDisplay
            stage={status.stageId}
            size={140}
            animated={true}
            showGlow={willEvolve}
          />
          <Text style={styles.levelText}>Level {status.currentLevel}</Text>

          {/* Evolution Teaser */}
          {willEvolve && (
            <View style={styles.evolutionTeaser}>
              <Text style={styles.evolutionText}>
                ✨ Evolution incoming! ✨
              </Text>
            </View>
          )}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              {status.xpForNextLevel} XP to Level {status.currentLevel + 1}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((status.totalXP % 50) / 50) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Evolution Modal */}
      {showEvolutionModal && lastEvolution && (
        <MascotEvolutionModal
          visible={showEvolutionModal}
          fromStage={lastEvolution.fromStage}
          toStage={lastEvolution.toStage}
          newLevel={lastEvolution.levelAtEvolution}
          onClose={() => {
            dismissEvolutionModal();
            // Optional: Navigate somewhere special after evolution
            // navigation.navigate('MascotCelebration');
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 24,
  },
  xpCard: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    minWidth: 200,
  },
  xpLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  xpValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#333',
  },
  mascotSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  evolutionTeaser: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  evolutionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  progressContainer: {
    width: '100%',
    marginTop: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  continueButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
```

---

## 🏠 Example 2: Dashboard Widget

Add a compact mascot widget to your dashboard:

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMascot } from '../hooks/useMascot';
import { MascotDisplay } from '../components/MascotDisplay';
import { getStageEmoji } from '../utils/mascotHelpers';

export const DashboardMascotWidget: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const { status, loading } = useMascot(user?.id);

  if (loading || !status) {
    return null;
  }

  const progressPercent = status.xpForNextStage > 0
    ? ((status.totalXP / (status.totalXP + status.xpForNextStage)) * 100)
    : 100;

  return (
    <TouchableOpacity
      style={styles.widget}
      onPress={() => navigation.navigate('Mascot')}
      activeOpacity={0.8}
    >
      <View style={styles.mascotContainer}>
        <MascotDisplay stage={status.stageId} size={80} />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.stageName}>
          {getStageEmoji(status.stageId)} {status.stageName}
        </Text>
        <Text style={styles.levelText}>Level {status.currentLevel}</Text>

        {/* Mini progress bar */}
        <View style={styles.miniProgressBar}>
          <View
            style={[styles.miniProgressFill, { width: `${progressPercent}%` }]}
          />
        </View>

        {status.stageId < 4 && (
          <Text style={styles.nextStageText}>
            {status.xpForNextStage} XP to evolve
          </Text>
        )}
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  widget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mascotContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  nextStageText: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    fontSize: 24,
    color: '#CCC',
    marginLeft: 8,
  },
});
```

---

## 👤 Example 3: Profile Header

Show mascot in user profile:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMascot } from '../hooks/useMascot';
import { MascotDisplay } from '../components/MascotDisplay';
import { shouldShowGlow } from '../utils/mascotHelpers';

export const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const { status } = useMascot(user?.id);

  if (!status) return null;

  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.username}</Text>
        <Text style={styles.level}>Level {status.currentLevel}</Text>
        <Text style={styles.xp}>{status.totalXP} Total XP</Text>
      </View>

      <View style={styles.mascotContainer}>
        <MascotDisplay
          stage={status.stageId}
          size={100}
          showGlow={shouldShowGlow(status.stageId)}
        />
        <Text style={styles.stageName}>{status.stageName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  level: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  xp: {
    fontSize: 14,
    color: '#999',
  },
  mascotContainer: {
    alignItems: 'center',
  },
  stageName: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
```

---

## 🏆 Example 4: League Leaderboard with Mascots

Show mini mascots next to usernames:

```typescript
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MascotDisplay } from '../components/MascotDisplay';

interface LeaderboardEntry {
  userId: string;
  username: string;
  weeklyXP: number;
  rank: number;
  mascotStage: number;
  level: number;
}

export const LeagueLeaderboard: React.FC<{
  entries: LeaderboardEntry[];
}> = ({ entries }) => {
  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.userId}
      renderItem={({ item }) => (
        <View style={styles.entry}>
          <Text style={styles.rank}>#{item.rank}</Text>

          <View style={styles.mascotMini}>
            <MascotDisplay stage={item.mascotStage} size={40} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.level}>Level {item.level}</Text>
          </View>

          <Text style={styles.xp}>{item.weeklyXP} XP</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  entry: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  rank: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    width: 40,
  },
  mascotMini: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  level: {
    fontSize: 12,
    color: '#666',
  },
  xp: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
});
```

---

## 🎯 Example 5: Daily Check-in with Mascot

Show mascot during daily check-in:

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useMascot } from '../hooks/useMascot';
import { MascotDisplay } from '../components/MascotDisplay';
import { getEncouragementMessage } from '../utils/mascotHelpers';

export const DailyCheckInModal: React.FC<{
  visible: boolean;
  onComplete: (intention: string) => void;
}> = ({ visible, onComplete }) => {
  const { user } = useAuth();
  const { status } = useMascot(user?.id);
  const [intention, setIntention] = useState('');

  if (!visible || !status) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Daily Check-In</Text>

        {/* Mascot greeting */}
        <View style={styles.mascotSection}>
          <MascotDisplay stage={status.stageId} size={120} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {getEncouragementMessage(status)}
            </Text>
          </View>
        </View>

        {/* Intention input */}
        <Text style={styles.label}>What's your intention today?</Text>
        <TextInput
          style={styles.input}
          placeholder="E.g., Complete 2 lessons..."
          value={intention}
          onChangeText={setIntention}
          multiline
        />

        {/* Submit button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => onComplete(intention)}
          disabled={!intention.trim()}
        >
          <Text style={styles.submitButtonText}>Start My Day</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  mascotSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  speechText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
```

---

## 🎊 Example 6: Milestone Celebration

Special celebration when reaching Master:

```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MascotDisplay } from '../components/MascotDisplay';
import { MascotStage } from '../types/mascot';

export const MasterMilestoneScreen: React.FC = () => {
  const confettiRef = useRef(null);

  useEffect(() => {
    // Fire confetti on mount
    confettiRef.current?.start();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Master Griffin Unlocked! 🎉</Text>

      <MascotDisplay
        stage={MascotStage.MASTER}
        size={280}
        animated={true}
        showGlow={true}
      />

      <Text style={styles.subtitle}>
        You've reached the pinnacle of growth!
      </Text>

      <Text style={styles.message}>
        Your dedication and consistency have transformed your Growthovo
        into a powerful Master Griffin. This achievement represents your
        commitment to personal growth across all life pillars.
      </Text>

      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: -10, y: 0 }}
        fadeOut={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 20,
  },
});
```

---

## 📊 Example 7: Progress Analytics with Mascot

Show mascot evolution timeline:

```typescript
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useMascot } from '../hooks/useMascot';
import { MascotDisplay } from '../components/MascotDisplay';
import { MASCOT_STAGE_NAMES } from '../types/mascot';

export const ProgressTimeline: React.FC = () => {
  const { user } = useAuth();
  const { evolutionHistory, status } = useMascot(user?.id);

  if (!status) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Growth Journey</Text>

      {/* Current Stage */}
      <View style={styles.currentStage}>
        <MascotDisplay
          stage={status.stageId}
          size={140}
          showGlow={status.stageId === 4}
        />
        <Text style={styles.currentStageText}>Current Stage</Text>
        <Text style={styles.currentStageName}>
          {MASCOT_STAGE_NAMES[status.stageId]}
        </Text>
      </View>

      {/* Evolution History */}
      <Text style={styles.sectionTitle}>Evolution History</Text>
      {evolutionHistory.map((evolution, index) => (
        <View key={evolution.id} style={styles.evolutionCard}>
          <View style={styles.evolutionStages}>
            <MascotDisplay stage={evolution.fromStage} size={60} />
            <Text style={styles.evolutionArrow}>→</Text>
            <MascotDisplay stage={evolution.toStage} size={60} />
          </View>

          <Text style={styles.evolutionTitle}>
            Evolved to {MASCOT_STAGE_NAMES[evolution.toStage]}
          </Text>
          <Text style={styles.evolutionDetails}>
            Level {evolution.levelAtEvolution} • {evolution.xpAtEvolution} XP
          </Text>
          <Text style={styles.evolutionDate}>
            {new Date(evolution.evolvedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  currentStage: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  currentStageText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
  },
  currentStageName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginLeft: 16,
    marginBottom: 16,
  },
  evolutionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  evolutionStages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  evolutionArrow: {
    fontSize: 24,
    color: '#FFD700',
    marginHorizontal: 16,
  },
  evolutionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  evolutionDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  evolutionDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
```

---

These examples show how flexible the mascot system is! You can integrate it anywhere in your app to boost engagement and celebrate user progress. 🚀
