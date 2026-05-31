import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import {
  getTimeCapsules,
  saveTimeCapsule,
  markCapsuleOpened,
  isPremiumUser,
  type TimeCapsuleRecord,
} from '../../services/growthovoExperienceService';
import PaywallModal from '../../components/PaywallModal';

interface Props {
  onClose: () => void;
  onCheckout: () => void;
}

const UNLOCK_OPTIONS = [
  { label: '1 month', months: 1 },
  { label: '3 months', months: 3 },
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
];

function daysUntil(unlockAt: string): number {
  return Math.max(0, Math.ceil((new Date(unlockAt).getTime() - Date.now()) / 86400000));
}

function monthsAgo(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(1, Math.round(diff / (30 * 86400000)));
}

export default function TimeCapsuleScreen({ onClose, onCheckout }: Props) {
  const { updateXP } = useAppContext();
  const { showToast } = useToast();
  const [capsules, setCapsules] = useState<TimeCapsuleRecord[]>([]);
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [createStep, setCreateStep] = useState(0);
  const [letter, setLetter] = useState('');
  const [promise, setPromise] = useState('');
  const [months, setMonths] = useState(3);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [paywall, setPaywall] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setCapsules(await getTimeCapsules());
  }

  async function startCreate() {
    const premium = await isPremiumUser();
    if (!premium && capsules.length >= 1) {
      setPaywall(true);
      return;
    }
    setMode('create');
    setCreateStep(0);
  }

  async function seal() {
    const unlock = new Date();
    unlock.setMonth(unlock.getMonth() + months);
    const capsule: TimeCapsuleRecord = {
      id: `cap_${Date.now()}`,
      letter: letter.trim(),
      promise: promise.trim(),
      createdAt: new Date().toISOString(),
      unlockAt: unlock.toISOString(),
      opened: false,
    };
    await saveTimeCapsule(capsule);
    await updateXP(75);
    showToast('+75 XP ✨', 'success');
    setMode('list');
    await load();
  }

  function openCapsule(c: TimeCapsuleRecord) {
    if (daysUntil(c.unlockAt) > 0) return;
    setFlippedId(c.id);
    Animated.timing(flipAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start(async () => {
      await markCapsuleOpened(c.id);
      await load();
    });
  }

  if (mode === 'create') {
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.container}>
          {createStep === 0 && (
            <>
              <Text style={styles.heading}>Write a letter to your future self</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Hey future me, right now I'm feeling..."
                placeholderTextColor={colors.textMuted}
                value={letter}
                onChangeText={(t) => setLetter(t.slice(0, 500))}
                multiline
                maxLength={500}
              />
              <Text style={styles.counter}>{letter.length}/500</Text>
            </>
          )}
          {createStep === 1 && (
            <>
              <Text style={styles.heading}>Set unlock date</Text>
              {UNLOCK_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.months}
                  style={[styles.option, months === o.months && styles.optionActive]}
                  onPress={() => setMonths(o.months)}
                >
                  <Text style={styles.optionText}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          {createStep === 2 && (
            <>
              <Text style={styles.heading}>Make one promise to your future self</Text>
              <TextInput
                style={styles.input}
                placeholder="I promise to..."
                placeholderTextColor={colors.textMuted}
                value={promise}
                onChangeText={setPromise}
              />
            </>
          )}
          {createStep === 3 && (
            <>
              <Text style={styles.heading}>Preview</Text>
              <View style={styles.previewCard}>
                <Text style={styles.previewText}>{letter.slice(0, 120)}...</Text>
                <Text style={styles.previewMeta}>Opens in {months} month(s)</Text>
              </View>
            </>
          )}
        </ScrollView>
        <View style={styles.footer}>
          {createStep < 3 ? (
            <TouchableOpacity
              style={[styles.btn, createStep === 0 && !letter.trim() && styles.btnDisabled]}
              disabled={createStep === 0 && !letter.trim()}
              onPress={() => setCreateStep((s) => s + 1)}
            >
              <Text style={styles.btnText}>Continue →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={seal}>
              <Text style={styles.btnText}>🔒 Seal Capsule →</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setMode('list')} style={styles.skip}>
            <Text style={styles.skipText}>Cancel</Text>
          </TouchableOpacity>
        </View>
        <PaywallModal visible={paywall} onClose={() => setPaywall(false)} onStartTrial={onCheckout} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={onClose} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Time Capsules 📬</Text>
        {capsules.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📬</Text>
            <Text style={styles.emptyText}>Create your first time capsule 📬</Text>
            <TouchableOpacity style={styles.btn} onPress={startCreate}>
              <Text style={styles.btnText}>Create Capsule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          capsules.map((c) => {
            const days = daysUntil(c.unlockAt);
            const unlocked = days === 0 || c.opened;
            const isFlipped = flippedId === c.id && c.opened;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.capsuleCard, unlocked && !c.opened && styles.capsuleGlow]}
                onPress={() => openCapsule(c)}
                activeOpacity={unlocked ? 0.8 : 1}
              >
                {isFlipped || c.opened ? (
                  <View>
                    <Text style={styles.body}>{c.letter}</Text>
                    <Text style={styles.promise}>Promise: {c.promise}</Text>
                  </View>
                ) : unlocked ? (
                  <Text style={styles.unlockMsg}>📬 Your past self wrote you something!</Text>
                ) : (
                  <>
                    <Text style={styles.locked}>🔒 To you, from {monthsAgo(c.createdAt)} months ago</Text>
                    <Text style={styles.countdown}>Opens in {days} days</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })
        )}
        {capsules.length > 0 && (
          <TouchableOpacity style={[styles.btn, { marginTop: spacing.lg }]} onPress={startCreate}>
            <Text style={styles.btnText}>+ New Capsule</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} onStartTrial={onCheckout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg },
  back: { marginBottom: spacing.md },
  backText: { color: colors.primary, ...typography.body },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.lg },
  empty: { alignItems: 'center', paddingVertical: spacing.xl * 2 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg },
  capsuleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  capsuleGlow: { borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 12 },
  locked: { ...typography.bodyBold, color: colors.text },
  countdown: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  unlockMsg: { ...typography.bodyBold, color: colors.primary },
  body: { ...typography.body, color: colors.text, lineHeight: 22 },
  promise: { ...typography.small, color: colors.textMuted, marginTop: spacing.md },
  textarea: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text,
    minHeight: 160,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'top',
  },
  counter: { ...typography.small, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionActive: { borderColor: colors.primary },
  optionText: { ...typography.bodyBold, color: colors.text, textAlign: 'center' },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: { ...typography.body, color: colors.text },
  previewMeta: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
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
