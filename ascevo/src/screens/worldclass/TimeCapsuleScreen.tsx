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
  getUserName,
} from '../../services/growthovoExperienceService';
import PaywallModal from '../../components/PaywallModal';
import { launchConfetti, triggerHaptic } from '../../services/webThemeService';

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

const PROMISE_EXAMPLES = [
  '...go to the gym 3x a week',
  '...finish my project',
  '...be kinder to myself',
];

function daysUntil(unlockAt: string): number {
  return Math.max(0, Math.ceil((new Date(unlockAt).getTime() - Date.now()) / 86400000));
}

function monthsAgo(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(1, Math.round(diff / (30 * 86400000)));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
  const [customDate, setCustomDate] = useState('');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [paywall, setPaywall] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setCapsules(await getTimeCapsules());
    setUserName(await getUserName());
  }

  async function startCreate() {
    const premium = await isPremiumUser();
    if (!premium && capsules.length >= 1) {
      setPaywall(true);
      return;
    }
    
    triggerHaptic(8);
    setMode('create');
    setCreateStep(0);
    setLetter('');
    setPromise('');
    setMonths(3);
  }

  function getUnlockDate(monthsFromNow: number): Date {
    const unlock = new Date();
    unlock.setMonth(unlock.getMonth() + monthsFromNow);
    return unlock;
  }

  async function seal() {
    const unlock = getUnlockDate(months);
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
    
    triggerHaptic([8, 40, 8]);
    showToast('+75 XP ✨', 'success');
    
    setMode('list');
    setCreateStep(0);
    await load();
  }

  function openCapsule(c: TimeCapsuleRecord) {
    const days = daysUntil(c.unlockAt);
    
    if (days > 0) {
      triggerHaptic([30, 20, 30]);
      showToast(`This capsule opens on ${formatDate(c.unlockAt)} 🔒`, 'info');
      return;
    }
    
    if (c.opened) return;
    
    triggerHaptic([20, 10, 20, 10, 60]);
    setFlippedId(c.id);
    
    // Flip animation
    Animated.spring(flipAnim, {
      toValue: 1,
      tension: 10,
      friction: 8,
      useNativeDriver: true,
    }).start(async () => {
      await markCapsuleOpened(c.id);
      launchConfetti();
      await load();
    });
  }

  function handleContinue() {
    triggerHaptic(8);
    setCreateStep((s) => s + 1);
  }

  if (mode === 'create') {
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Progress dots */}
          <View style={styles.progressDots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  createStep >= i && styles.dotActive,
                  createStep === i && styles.dotCurrent,
                ]}
              />
            ))}
          </View>

          {createStep === 0 && (
            <>
              <Text style={styles.heading}>Write a letter to your future self</Text>
              <TextInput
                style={styles.textarea}
                placeholder={`Dear future ${userName}, right now I'm feeling...`}
                placeholderTextColor={colors.textMuted}
                value={letter}
                onChangeText={(t) => setLetter(t.slice(0, 500))}
                multiline
                maxLength={500}
              />
              <Text style={[styles.counter, letter.length > 450 && { color: colors.warning }]}>
                {letter.length}/500
              </Text>
            </>
          )}
          
          {createStep === 1 && (
            <>
              <Text style={styles.heading}>Set unlock date</Text>
              {UNLOCK_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.months}
                  style={[styles.option, months === o.months && styles.optionActive]}
                  onPress={() => {
                    triggerHaptic(8);
                    setMonths(o.months);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionText}>{o.label}</Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.preview}>
                You'll read this on {formatDate(getUnlockDate(months).toISOString())}
              </Text>
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
              <View style={styles.examples}>
                {PROMISE_EXAMPLES.map((ex) => (
                  <Text key={ex} style={styles.exampleText}>{ex}</Text>
                ))}
              </View>
            </>
          )}
          
          {createStep === 3 && (
            <>
              <Text style={styles.heading}>Seal your capsule</Text>
              <View style={styles.previewCard}>
                <View style={styles.blurPreview}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
                <View style={styles.previewMeta}>
                  <Text style={styles.previewMetaText}>
                    From: {userName}, {formatDate(new Date().toISOString())}
                  </Text>
                  <Text style={styles.previewMetaText}>
                    Opens: {formatDate(getUnlockDate(months).toISOString())}
                  </Text>
                  <View style={styles.xpBadge}>
                    <Text style={styles.xpBadgeText}>+75 XP</Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
        
        <View style={styles.footer}>
          {createStep < 3 ? (
            <TouchableOpacity
              style={[
                styles.btn,
                (createStep === 0 && !letter.trim()) && styles.btnDisabled,
                (createStep === 2 && !promise.trim()) && styles.btnDisabled,
              ]}
              disabled={(createStep === 0 && !letter.trim()) || (createStep === 2 && !promise.trim())}
              onPress={handleContinue}
            >
              <Text style={styles.btnText}>Continue →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btn} onPress={seal}>
              <Text style={styles.btnText}>🔒 Seal Capsule</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            onPress={() => {
              triggerHaptic(8);
              setMode('list');
              setCreateStep(0);
            }} 
            style={styles.skip}
          >
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
        
        <Text style={styles.heading}>🔒 Time Capsule</Text>
        <Text style={styles.subtitle}>Letters to your future self</Text>
        
        {capsules.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🥚</Text>
            <Text style={styles.emptyText}>Your first capsule is waiting to be written</Text>
            <TouchableOpacity style={styles.btn} onPress={startCreate}>
              <Text style={styles.btnText}>Create Capsule</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {capsules.map((c) => {
              const days = daysUntil(c.unlockAt);
              const unlocked = days === 0 && !c.opened;
              const isOpened = c.opened;
              
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.capsuleCard,
                    unlocked && styles.capsuleGlow,
                    isOpened && styles.capsuleOpened,
                  ]}
                  onPress={() => openCapsule(c)}
                  activeOpacity={unlocked || isOpened ? 0.8 : 1}
                >
                  {isOpened ? (
                    <View>
                      <Text style={styles.body}>{c.letter}</Text>
                      <Text style={styles.promiseLabel}>Promise: {c.promise}</Text>
                    </View>
                  ) : unlocked ? (
                    <>
                      <Text style={styles.unlockIcon}>📬</Text>
                      <Text style={styles.unlockMsg}>Open Your Letter</Text>
                      <Text style={styles.unlockHint}>Tap to reveal</Text>
                    </>
                  ) : (
                    <>
                      <View style={styles.lockedContent}>
                        <Text style={styles.lockIcon}>🔒</Text>
                        <Text style={styles.locked}>
                          To you, from {monthsAgo(c.createdAt)} month{monthsAgo(c.createdAt) > 1 ? 's' : ''} ago
                        </Text>
                      </View>
                      <Text style={styles.countdown}>Opens in {days} day{days !== 1 ? 's' : ''}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
            
            <TouchableOpacity 
              style={[styles.btn, styles.btnSecondary, { marginTop: spacing.lg }]} 
              onPress={startCreate}
            >
              <Text style={styles.btnTextSecondary}>+ New Capsule</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      
      <PaywallModal visible={paywall} onClose={() => setPaywall(false)} onStartTrial={onCheckout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingBottom: 100 },
  back: { marginBottom: spacing.md },
  backText: { color: colors.primary, ...typography.body },
  heading: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  
  // Progress dots
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.xl },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, opacity: 0.5 },
  dotCurrent: { opacity: 1, width: 20 },
  
  // Empty state
  empty: { alignItems: 'center', paddingVertical: spacing.xl * 2 },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyText: { ...typography.body, color: colors.textMuted, marginBottom: spacing.lg, textAlign: 'center' },
  
  // Capsule cards
  capsuleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  capsuleGlow: { 
    borderColor: colors.primary, 
    shadowColor: colors.primary, 
    shadowOpacity: 0.6, 
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  capsuleOpened: { borderColor: colors.success, backgroundColor: colors.surface },
  
  lockedContent: { alignItems: 'center', marginBottom: spacing.sm },
  lockIcon: { fontSize: 48, marginBottom: spacing.sm },
  locked: { ...typography.bodyBold, color: colors.text, textAlign: 'center' },
  countdown: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  
  unlockIcon: { fontSize: 48, textAlign: 'center', marginBottom: spacing.sm },
  unlockMsg: { ...typography.h3, color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  unlockHint: { ...typography.small, color: colors.textMuted, textAlign: 'center' },
  
  body: { ...typography.body, color: colors.text, lineHeight: 24 },
  promiseLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.md, fontStyle: 'italic' },
  
  // Form inputs
  textarea: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text,
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'top',
    ...typography.body,
  },
  counter: { ...typography.small, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
  },
  
  // Options
  option: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  optionText: { ...typography.bodyBold, color: colors.text, textAlign: 'center' },
  
  preview: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  
  examples: { marginTop: spacing.md, gap: spacing.xs },
  exampleText: { ...typography.small, color: colors.textMuted, fontStyle: 'italic' },
  
  // Preview card
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  blurPreview: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  previewMeta: { padding: spacing.md, gap: spacing.xs },
  previewMetaText: { ...typography.small, color: colors.textMuted },
  xpBadge: {
    backgroundColor: colors.success + '22',
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.success + '44',
  },
  xpBadgeText: { ...typography.smallBold, color: colors.success },
  
  // Footer
  footer: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg, 
    borderTopWidth: 1, 
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  
  // Buttons
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { ...typography.bodyBold, color: '#fff' },
  
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  btnTextSecondary: { ...typography.bodyBold, color: colors.primary },
  
  skip: { alignItems: 'center', marginTop: spacing.md },
  skipText: { color: colors.textMuted, ...typography.body },
});
