import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabaseClient';
import { useLanguageStore } from '../../store';
import LanguagePicker from '../../components/LanguagePicker';
import { colors, typography, spacing, radius } from '../../theme';
import type { SupportedLanguage } from '../../services/i18nService';

const PILLARS = [
  { key: 'mind',          icon: '🧠', colour: colors.pillars.mind },
  { key: 'discipline',    icon: '🔥', colour: colors.pillars.discipline },
  { key: 'communication', icon: '💬', colour: colors.pillars.communication },
  { key: 'money',         icon: '💰', colour: colors.pillars.money },
  { key: 'career',        icon: '🚀', colour: colors.pillars.career },
  { key: 'relationships', icon: '❤️', colour: colors.pillars.relationships },
];

const GOAL_VALUES: (5 | 10 | 15)[] = [5, 10, 15];

interface Props {
  userId: string;
  onComplete: () => void;
}

type Step = 'language' | 'pillars' | 'goal';

export default function OnboardingScreen({ userId, onComplete }: Props) {
  const { t } = useTranslation();
  const { language, setLanguage, isChangingLanguage } = useLanguageStore();

  const [step, setStep] = useState<Step>('language');
  const [selectedPillars, setSelectedPillars] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState<5 | 10 | 15>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function togglePillar(key: string) {
    setSelectedPillars((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleLanguageSelect(code: SupportedLanguage) {
    await setLanguage(code, userId);
  }

  async function handleComplete() {
    setError('');
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          daily_goal_minutes: dailyGoal,
          onboarding_complete: true,
          language,
        })
        .eq('id', userId);

      if (updateError) throw updateError;
      onComplete();
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  }

  // Language step
  if (step === 'language') {
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t('onboarding.language_title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.language_subtitle')}</Text>

          {isChangingLanguage ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
          ) : (
            <LanguagePicker selected={language} onSelect={handleLanguageSelect} />
          )}

          <TouchableOpacity
            style={styles.btn}
            onPress={() => setStep('pillars')}
            disabled={isChangingLanguage}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.continue')}
          >
            <Text style={styles.btnText}>{t('onboarding.continue')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Pillars step
  if (step === 'pillars') {
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>{t('onboarding.pillars_title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.pillars_subtitle')}</Text>

          <View style={styles.grid}>
            {PILLARS.map((p) => {
              const selected = selectedPillars.includes(p.key);
              const label = t(`onboarding.pillars.${p.key}`);
              return (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.pillarCard,
                    selected && { borderColor: p.colour, backgroundColor: p.colour + '22' },
                  ]}
                  onPress={() => togglePillar(p.key)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={label}
                >
                  <Text style={styles.pillarIcon}>{p.icon}</Text>
                  <Text style={[styles.pillarLabel, selected && { color: p.colour }]}>
                    {label}
                  </Text>
                  {selected && (
                    <View style={[styles.checkBadge, { backgroundColor: p.colour }]}>
                      <Text style={styles.checkMark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.btn, selectedPillars.length === 0 && styles.btnDisabled]}
            onPress={() => setStep('goal')}
            disabled={selectedPillars.length === 0}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.continue')}
          >
            <Text style={styles.btnText}>{t('onboarding.continue')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setStep('language')}
            accessibilityRole="button"
          >
            <Text style={styles.back}>{t('onboarding.back')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Goal step
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('onboarding.goal_title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.goal_subtitle')}</Text>

        <View style={styles.goalRow}>
          {GOAL_VALUES.map((value) => {
            const labelKey = value === 5 ? 'light' : value === 10 ? 'steady' : 'serious';
            return (
              <TouchableOpacity
                key={value}
                style={[
                  styles.goalCard,
                  dailyGoal === value && styles.goalCardSelected,
                ]}
                onPress={() => setDailyGoal(value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: dailyGoal === value }}
                accessibilityLabel={`${value} minutes`}
              >
                <Text style={[styles.goalText, dailyGoal === value && styles.goalTextSelected]}>
                  {`${value} min\n${t(`onboarding.goals.${labelKey}`)}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleComplete}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.lets_go')}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{t('onboarding.lets_go')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setStep('pillars')} accessibilityRole="button">
          <Text style={styles.back}>{t('onboarding.back')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, paddingTop: 60 },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.xl },
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
  pillarIcon: { fontSize: 32, marginBottom: 8 },
  pillarLabel: { ...typography.bodyBold, color: colors.text },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 11, fontWeight: '800' },
  goalRow: { flexDirection: 'row', gap: 12, marginBottom: spacing.xl },
  goalCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  goalCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
  goalText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  goalTextSelected: { color: colors.primary, ...typography.bodyBold },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', ...typography.bodyBold },
  error: { color: colors.error, marginBottom: spacing.md, ...typography.body },
  back: { color: colors.textMuted, textAlign: 'center', ...typography.body },
});
