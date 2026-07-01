import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  FlatList,
  Share,
  Platform,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import {
  getWeeklyXp,
  getUserName,
  isPremiumUser,
  getSelectedPillars,
  KEYS,
} from '../../services/growthovoExperienceService';
import PaywallModal from '../../components/PaywallModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchConfetti, triggerHaptic } from '../../services/webThemeService';

const { width: SW } = Dimensions.get('window');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  onClose: () => void;
  onCheckout: () => void;
}

interface WeeklyStats {
  totalXp: number;
  lessons: number;
  showUps: number;
  moods: string[];
  bestDay: string;
  topStat: string;
}

const PILLAR_NAMES: Record<string, string> = {
  mind: 'Mind',
  discipline: 'Discipline',
  communication: 'Communication',
  money: 'Money',
  relationships: 'Relationships',
};

export default function WeeklyWrappedFlowScreen({ onClose, onCheckout }: Props) {
  const { xp, streak, updateXP } = useAppContext();
  const [slide, setSlide] = useState(0);
  const [weeklyXp, setWeeklyXp] = useState<Record<string, number>>({});
  const [name, setName] = useState('Champion');
  const [premium, setPremium] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [stats, setStats] = useState<WeeklyStats>({
    totalXp: 0,
    lessons: 0,
    showUps: 0,
    moods: [],
    bestDay: 'Wed',
    topStat: 'XP',
  });
  const [weakestPillar, setWeakestPillar] = useState('Communication');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [weeklyXpData, userName, isPremium, pillars] = await Promise.all([
      getWeeklyXp(),
      getUserName(),
      isPremiumUser(),
      getSelectedPillars(),
    ]);

    setWeeklyXp(weeklyXpData);
    setName(userName);
    setPremium(isPremium);

    // Calculate real weekly stats
    const totalWeeklyXp = Object.values(weeklyXpData).reduce((a, b) => a + b, 0) || xp;
    const showUps = Object.values(weeklyXpData).filter((v) => v > 0).length;
    
    // Get lessons from localStorage (fallback to estimated)
    const lessonsRaw = await AsyncStorage.getItem(KEYS.weeklyLessons);
    const lessons = lessonsRaw ? JSON.parse(lessonsRaw) : Math.ceil(totalWeeklyXp / 25);

    // Get moods from localStorage
    const moodsRaw = await AsyncStorage.getItem(KEYS.weeklyMoods);
    const moods = moodsRaw ? JSON.parse(moodsRaw) : ['🙂', '😐', '🔥', '🙂', '💪'];

    // Determine best day
    const bestDay = Object.entries(weeklyXpData).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Wed';

    // Determine top stat
    let topStat = 'XP';
    if (streak > totalWeeklyXp && streak > lessons) topStat = 'Streak';
    else if (lessons > totalWeeklyXp && lessons > streak) topStat = 'Lessons';

    // Determine weakest pillar (first selected or Communication as growth edge)
    const pillarName = pillars[0] ? PILLAR_NAMES[pillars[0]] : 'Communication';
    setWeakestPillar(pillarName);

    setStats({
      totalXp: totalWeeklyXp,
      lessons,
      showUps,
      moods,
      bestDay,
      topStat,
    });
  }

  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const range = `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  async function acceptChallenge() {
    triggerHaptic('medium');
    await updateXP(50);
    setChallengeAccepted(true);
  }

  async function share() {
    if (!premium) {
      setPaywall(true);
      return;
    }
    triggerHaptic('light');
    const message = `My Growthovo week: ${stats.totalXp} XP, ${stats.showUps} show-ups! 🔥 Join me at growthovo.com`;
    if (Platform.OS === 'web' && navigator.share) {
      await navigator.share({ text: message });
    } else {
      await Share.share({ message });
    }
  }

  function getPersonalizedRexMessage(): string {
    const messages: string[] = [];
    
    if (stats.showUps >= 6) {
      messages.push(`${name}, you showed up ${stats.showUps} times this week. That's what champions do.`);
    } else if (stats.showUps >= 3) {
      messages.push(`${name}, ${stats.showUps} show-ups this week. You're building momentum.`);
    } else {
      messages.push(`${name}, every show-up counts. Let's make next week even stronger.`);
    }

    if (streak > 7) {
      messages.push(`Your ${streak}-day streak proves you're committed to growth.`);
    }

    if (stats.totalXp > 200) {
      messages.push('The effort you put in this week will compound over time.');
    }

    return messages.join(' ');
  }

  function getOverallVibe(): string {
    const moodEmojis = stats.moods.join('');
    if (moodEmojis.includes('🔥') || moodEmojis.includes('💪')) return 'motivated';
    if (moodEmojis.includes('😐') || moodEmojis.includes('😔')) return 'steady';
    return 'positive';
  }

  function handleSlideChange(index: number) {
    if (index === 5) {
      // Final slide reached - trigger confetti
      launchConfetti();
      triggerHaptic('success');
    }
  }

  const slides = [
    <View key="1" style={styles.slide}>
      <Text style={styles.slideTitle}>Week of {range} 📅</Text>
      <Text style={styles.heroStat}>Top stat: {stats.topStat}</Text>
      <Text style={styles.bigNumber}>
        {stats.topStat === 'XP' ? stats.totalXp : stats.topStat === 'Streak' ? streak : stats.lessons}
      </Text>
      <Text style={styles.body}>
        {stats.showUps} days active • {stats.lessons} lessons completed
      </Text>
    </View>,
    <View key="2" style={styles.slide}>
      <Text style={styles.slideTitle}>XP earned this week</Text>
      <View style={styles.chart}>
        {DAYS.map((d) => {
          const v = weeklyXp[d] ?? 0;
          const maxVal = Math.max(...Object.values(weeklyXp), 50);
          const h = Math.max(12, (v / maxVal) * 120);
          return (
            <View key={d} style={styles.barCol}>
              <View style={[styles.bar, { height: h }]}>
                {v > 0 && <Text style={styles.barValue}>{v}</Text>}
              </View>
              <Text style={styles.barLabel}>{d}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.body}>
        {stats.totalXp > 0
          ? `Your best day was ${stats.bestDay} 🔥`
          : 'Start your journey this week'}
      </Text>
    </View>,
    <View key="3" style={styles.slide}>
      <Text style={styles.slideTitle}>Lessons completed</Text>
      <Text style={styles.bigNumber}>{stats.lessons}</Text>
      <Text style={styles.body}>🧠 Mind • 🔥 Discipline • 💬 Communication</Text>
      <Text style={styles.body}>You spent ~{stats.lessons * 8} minutes learning</Text>
      <Text style={styles.hint}>
        That's {Math.floor((stats.lessons * 8) / 60)}h {((stats.lessons * 8) % 60)}m invested in yourself
      </Text>
    </View>,
    <View key="4" style={styles.slide}>
      <Text style={styles.slideTitle}>Mood trend</Text>
      <Text style={styles.moodRow}>{stats.moods.join(' ')}</Text>
      <Text style={styles.body}>Your overall vibe: {getOverallVibe()}</Text>
      <Text style={styles.hint}>Self-awareness is the first step to growth</Text>
    </View>,
    <View key="5" style={styles.slide}>
      <Text style={styles.slideTitle}>Rex says 🦖</Text>
      <Text style={styles.rex}>{getPersonalizedRexMessage()}</Text>
    </View>,
    <View key="6" style={styles.slide}>
      <Text style={styles.slideTitle}>Next week challenge 🎯</Text>
      <Text style={styles.body}>
        Complete 2 {weakestPillar} lessons — your growth edge.
      </Text>
      {!challengeAccepted ? (
        <TouchableOpacity
          style={[styles.btn, styles.btnActive]}
          onPress={acceptChallenge}
          accessibilityRole="button"
          accessibilityLabel="Accept Challenge"
        >
          <Text style={styles.btnText}>Accept Challenge +50 XP →</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.acceptedBadge}>
          <Text style={styles.acceptedText}>✓ Challenge accepted! +50 XP</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.btn, styles.btnOutline]}
        onPress={share}
        accessibilityRole="button"
        accessibilityLabel={premium ? 'Share your week' : 'Share requires premium'}
      >
        <Text style={styles.btnTextOutline}>Share My Week 📤</Text>
      </TouchableOpacity>
      {!premium && <Text style={styles.hint}>Sharing requires Growthovo Pro</Text>}
    </View>,
  ];

  if (stats.totalXp === 0 && xp === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <Text style={styles.empty}>Complete activities this week to unlock Wrapped 📊</Text>
          <Text style={styles.emptyHint}>
            Lessons, check-ins, and Rex chats all count toward your weekly stats
          </Text>
          <TouchableOpacity style={[styles.btn, styles.btnActive]} onPress={onClose}>
            <Text style={styles.btnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <FlatList
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newSlide = Math.round(e.nativeEvent.contentOffset.x / SW);
          setSlide(newSlide);
          handleSlideChange(newSlide);
        }}
        renderItem={({ item }) => <View style={{ width: SW }}>{item}</View>}
        keyExtractor={(_, i) => String(i)}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, slide === i && styles.dotActive]} />
        ))}
      </View>
      {slide < 5 && (
        <TouchableOpacity
          style={styles.skip}
          onPress={() => {
            setSlide(5);
            handleSlideChange(5);
          }}
          accessibilityRole="button"
          accessibilityLabel="Skip to final slide"
        >
          <Text style={styles.skipText}>Skip →</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.close} onPress={onClose} accessibilityRole="button">
        <Text style={styles.closeText}>{slide === 5 ? 'Done' : 'Close'}</Text>
      </TouchableOpacity>
      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} onStartTrial={onCheckout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  slide: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  slideTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  heroStat: { ...typography.body, color: colors.textMuted },
  bigNumber: { fontSize: 64, fontWeight: '800', color: colors.primary },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, marginVertical: spacing.lg },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { 
    width: 20, 
    backgroundColor: colors.primary, 
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  barValue: { ...typography.small, color: '#fff', fontWeight: '700', fontSize: 10 },
  barLabel: { ...typography.small, color: colors.textMuted, marginTop: 4 },
  body: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
  moodRow: { fontSize: 32, letterSpacing: 8, marginVertical: spacing.lg },
  rex: { ...typography.body, color: colors.text, lineHeight: 26 },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnActive: {
    backgroundColor: colors.primary,
  },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
  btnText: { ...typography.bodyBold, color: '#fff' },
  btnTextOutline: { ...typography.bodyBold, color: colors.primary },
  acceptedBadge: {
    backgroundColor: colors.success + '20',
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  acceptedText: { ...typography.bodyBold, color: colors.success },
  hint: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  skip: { position: 'absolute', top: 60, right: spacing.lg },
  skipText: { ...typography.body, color: colors.primary },
  close: { alignItems: 'center', padding: spacing.lg },
  closeText: { ...typography.body, color: colors.textMuted },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg, alignItems: 'center' },
  empty: { ...typography.h3, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  emptyHint: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
});
