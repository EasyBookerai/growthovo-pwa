import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import {
  isAfter6PM,
  markEveningDebriefDone,
  saveTomorrowReminder,
  addWeeklyXp,
} from '../../services/growthovoExperienceService';

interface Props {
  onClose: () => void;
}

export default function EveningDebriefFlowScreen({ onClose }: Props) {
  const { updateXP } = useAppContext();
  const [step, setStep] = useState(0);
  const [rating, setRating] = useState(0);
  const [win, setWin] = useState('');
  const [challenge, setChallenge] = useState('');
  const [tomorrow, setTomorrow] = useState('');
  const [rexReply, setRexReply] = useState('');

  if (!isAfter6PM()) {
    return null;
  }

  async function finish() {
    const reply = `Got it. I'll remind you about ${tomorrow.trim() || 'your priority'} tomorrow morning 💪`;
    setRexReply(reply);
    setStep(4);
  }

  async function complete() {
    await updateXP(30);
    await addWeeklyXp(30);
    await saveTomorrowReminder(tomorrow.trim());
    await markEveningDebriefDone();
    onClose();
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 0 && (
          <>
            <Text style={styles.heading}>How was your day overall?</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setRating(n)} accessibilityLabel={`${n} stars`}>
                  <Text style={[styles.star, n <= rating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        {step === 1 && (
          <>
            <Text style={styles.heading}>What was your win today?</Text>
            <TextInput
              style={styles.input}
              placeholder="Even something small counts..."
              placeholderTextColor={colors.textMuted}
              value={win}
              onChangeText={setWin}
              multiline
              numberOfLines={3}
            />
          </>
        )}
        {step === 2 && (
          <>
            <Text style={styles.heading}>What challenged you?</Text>
            <TextInput
              style={styles.input}
              placeholder="No judgment, just reflection..."
              placeholderTextColor={colors.textMuted}
              value={challenge}
              onChangeText={setChallenge}
              multiline
            />
          </>
        )}
        {step === 3 && (
          <>
            <Text style={styles.heading}>What&apos;s the ONE thing you want to do tomorrow?</Text>
            <TextInput
              style={styles.input}
              placeholder="Your top priority..."
              placeholderTextColor={colors.textMuted}
              value={tomorrow}
              onChangeText={setTomorrow}
            />
          </>
        )}
        {step === 4 && (
          <>
            <Text style={styles.rexBubble}>{rexReply}</Text>
            <Text style={styles.xpNote}>+30 XP earned 🌙</Text>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {step < 3 && (
          <TouchableOpacity
            style={[styles.btn, step === 0 && rating === 0 && styles.btnDisabled]}
            disabled={step === 0 && rating === 0}
            onPress={() => setStep((s) => s + 1)}
          >
            <Text style={styles.btnText}>Continue →</Text>
          </TouchableOpacity>
        )}
        {step === 3 && (
          <TouchableOpacity style={styles.btn} onPress={finish} disabled={!tomorrow.trim()}>
            <Text style={styles.btnText}>Submit →</Text>
          </TouchableOpacity>
        )}
        {step === 4 && (
          <TouchableOpacity style={styles.btn} onPress={complete}>
            <Text style={styles.btnText}>Done</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onClose} style={styles.skip}>
          <Text style={styles.skipText}>Close</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: 120 },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  stars: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  star: { fontSize: 40, color: colors.border },
  starActive: { color: '#FBBF24' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rexBubble: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.primary + '22',
    padding: spacing.lg,
    borderRadius: radius.lg,
    lineHeight: 24,
  },
  xpNote: { ...typography.bodyBold, color: colors.success, marginTop: spacing.lg, textAlign: 'center' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { ...typography.bodyBold, color: '#fff' },
  skip: { alignItems: 'center', marginTop: spacing.md },
  skipText: { color: colors.textMuted },
});
