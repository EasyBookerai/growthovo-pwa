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
} from '../../services/growthovoExperienceService';
import PaywallModal from '../../components/PaywallModal';

const { width: SW } = Dimensions.get('window');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  onClose: () => void;
  onCheckout: () => void;
}

export default function WeeklyWrappedFlowScreen({ onClose, onCheckout }: Props) {
  const { xp, streak, updateXP } = useAppContext();
  const [slide, setSlide] = useState(0);
  const [weeklyXp, setWeeklyXp] = useState<Record<string, number>>({});
  const [name, setName] = useState('Champion');
  const [premium, setPremium] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [challengeAccepted, setChallengeAccepted] = useState(false);

  const lessons = 4;
  const showUps = 5;
  const totalWeeklyXp = Object.values(weeklyXp).reduce((a, b) => a + b, 0) || xp;
  const bestDay = Object.entries(weeklyXp).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Wed';
  const topStat = Math.max(totalWeeklyXp, streak, lessons) === totalWeeklyXp ? 'XP' : streak >= lessons ? 'Streak' : 'Lessons';

  useEffect(() => {
    (async () => {
      setWeeklyXp(await getWeeklyXp());
      setName(await getUserName());
      setPremium(await isPremiumUser());
    })();
  }, []);

  const start = new Date();
  start.setDate(start.getDate() - start.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const range = `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  async function acceptChallenge() {
    await updateXP(50);
    setChallengeAccepted(true);
  }

  async function share() {
    if (!premium) {
      setPaywall(true);
      return;
    }
    const message = `My Growthovo week: ${totalWeeklyXp} XP, ${showUps} show-ups! growthovo.com`;
    if (Platform.OS === 'web' && navigator.share) {
      await navigator.share({ text: message });
    } else {
      await Share.share({ message });
    }
  }

  const slides = [
    <View key="1" style={styles.slide}>
      <Text style={styles.slideTitle}>Week of {range} 📅</Text>
      <Text style={styles.heroStat}>Top stat: {topStat}</Text>
      <Text style={styles.bigNumber}>{topStat === 'XP' ? totalWeeklyXp : topStat === 'Streak' ? streak : lessons}</Text>
    </View>,
    <View key="2" style={styles.slide}>
      <Text style={styles.slideTitle}>XP earned this week</Text>
      <View style={styles.chart}>
        {DAYS.map((d) => {
          const v = weeklyXp[d] ?? Math.floor(Math.random() * 40);
          const h = Math.max(8, (v / 50) * 80);
          return (
            <View key={d} style={styles.barCol}>
              <View style={[styles.bar, { height: h }]} />
              <Text style={styles.barLabel}>{d}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.body}>Your best day was {bestDay}</Text>
    </View>,
    <View key="3" style={styles.slide}>
      <Text style={styles.slideTitle}>Lessons completed</Text>
      <Text style={styles.body}>🧠 Mind · 🔥 Discipline · 💬 Communication</Text>
      <Text style={styles.body}>You spent ~{lessons * 8} minutes learning</Text>
    </View>,
    <View key="4" style={styles.slide}>
      <Text style={styles.slideTitle}>Mood trend</Text>
      <Text style={styles.moodRow}>🙂 😐 🔥 🙂 💪</Text>
      <Text style={styles.body}>Your overall vibe: motivated</Text>
    </View>,
    <View key="5" style={styles.slide}>
      <Text style={styles.slideTitle}>Rex says</Text>
      <Text style={styles.rex}>
        {name}, this week you showed up {showUps} times. That&apos;s what champions do.
      </Text>
    </View>,
    <View key="6" style={styles.slide}>
      <Text style={styles.slideTitle}>Next week challenge</Text>
      <Text style={styles.body}>Complete 2 Communication lessons — your growth edge.</Text>
      {!challengeAccepted ? (
        <TouchableOpacity style={styles.btn} onPress={acceptChallenge}>
          <Text style={styles.btnText}>Accept Challenge →</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.body}>Challenge accepted! +50 XP</Text>
      )}
      <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={share}>
        <Text style={styles.btnTextOutline}>Share</Text>
      </TouchableOpacity>
      {!premium && <Text style={styles.hint}>Share requires Pro</Text>}
    </View>,
  ];

  if (totalWeeklyXp === 0 && xp === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <Text style={styles.empty}>Complete activities this week to unlock Wrapped</Text>
          <TouchableOpacity style={styles.btn} onPress={onClose}>
            <Text style={styles.btnText}>Back</Text>
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
        onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / SW))}
        renderItem={({ item }) => <View style={{ width: SW }}>{item}</View>}
        keyExtractor={(_, i) => String(i)}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, slide === i && styles.dotActive]} />
        ))}
      </View>
      <TouchableOpacity style={styles.close} onPress={onClose}>
        <Text style={styles.closeText}>Close</Text>
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
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginVertical: spacing.lg },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 20, backgroundColor: colors.primary, borderRadius: 4 },
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
  btnOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
  btnText: { ...typography.bodyBold, color: '#fff' },
  btnTextOutline: { ...typography.bodyBold, color: colors.primary },
  hint: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 20 },
  close: { alignItems: 'center', padding: spacing.lg },
  closeText: { color: colors.textMuted },
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
});
