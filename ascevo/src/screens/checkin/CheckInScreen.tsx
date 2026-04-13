import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { getTodayChallenge, submitCheckIn, getTodayCompletion } from '../../services/challengeService';
import { getRexCheckInResponse } from '../../services/rex';
import { supabase } from '../../services/supabaseClient';
import { useStreakStore } from '../../store';
import { colors, typography, spacing, radius } from '../../theme';
import type { Challenge, ChallengeCompletion } from '../../types';

interface Props {
  userId: string;
  onDone: () => void;
}

export default function CheckInScreen({ userId, onDone }: Props) {
  const { t } = useTranslation();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [existing, setExisting] = useState<ChallengeCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [rexMessage, setRexMessage] = useState('');
  const [xpEarned, setXpEarned] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const c = await getTodayChallenge(userId);
    setChallenge(c);
    if (c) {
      const comp = await getTodayCompletion(userId, c.id);
      if (comp) {
        setExisting(comp);
        setRexMessage(comp.rexResponse ?? '');
        setDone(true);
      }
    }
    setLoading(false);
  }

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setProofUri(result.assets[0].uri);
    }
  }

  async function uploadPhoto(uri: string): Promise<string | undefined> {
    try {
      const ext = uri.split('.').pop() ?? 'jpg';
      const path = `challenge-proofs/${userId}/${Date.now()}.${ext}`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const { error } = await supabase.storage.from('challenge-proofs').upload(path, blob);
      if (error) return undefined;
      const { data } = supabase.storage.from('challenge-proofs').getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return undefined;
    }
  }

  async function handleSubmit(completed: boolean) {
    if (!challenge) return;
    setError('');
    setSubmitting(true);
    try {
      let photoUrl: string | undefined;
      if (proofUri) photoUrl = await uploadPhoto(proofUri);

      const { completion, xpAwarded } = await submitCheckIn(userId, challenge.id, completed, photoUrl);
      setXpEarned(xpAwarded);

      // Get Rex response using new typed service
      const streak = useStreakStore.getState().streak;
      const rex = await getRexCheckInResponse({
        userId,
        challengeCompleted: completed,
        challengeText: challenge.description,
        streakDays: streak?.currentStreak ?? 0,
        pillar: 'discipline', // default pillar; screens with pillar context can pass it
        recentHistory: [],
      });
      setRexMessage(rex);

      // Save Rex response to DB
      if (completion.id) {
        await supabase
          .from('challenge_completions')
          .update({ rex_response: rex })
          .eq('id', completion.id);
      }

      setDone(true);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No challenge yet</Text>
        <Text style={styles.emptyBody}>Complete a lesson first to get today's challenge.</Text>
        <TouchableOpacity style={styles.btn} onPress={onDone} accessibilityRole="button">
          <Text style={styles.btnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (done) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.doneIcon}>✅</Text>
        <Text style={styles.doneTitle}>Check-in complete!</Text>
        {xpEarned > 0 && <Text style={styles.xpBadge}>+{xpEarned} XP</Text>}

        {/* Rex feedback */}
        {rexMessage ? (
          <View style={styles.rexCard}>
            <Text style={styles.rexLabel}>Rex says:</Text>
            <Text style={styles.rexMessage}>{rexMessage}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.btn} onPress={onDone} accessibilityRole="button">
          <Text style={styles.btnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('checkin.title')}</Text>
      <Text style={styles.subtitle}>{t('checkin.question')}</Text>

      {/* Challenge recap */}
      <View style={styles.challengeCard}>
        <Text style={styles.challengeLabel}>🎯 TODAY'S CHALLENGE</Text>
        <Text style={styles.challengeText}>{challenge.description}</Text>
      </View>

      {/* Optional proof photo */}
      <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto} accessibilityRole="button">
        {proofUri ? (
          <Image source={{ uri: proofUri }} style={styles.proofImage} />
        ) : (
          <Text style={styles.photoBtnText}>📸 Add proof photo (optional)</Text>
        )}
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Yes / No */}
      <View style={styles.answerRow}>
        <TouchableOpacity
          style={[styles.answerBtn, styles.answerYes]}
          onPress={() => handleSubmit(true)}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={t('checkin.yes')}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.answerBtnText}>{t('checkin.yes')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.answerBtn, styles.answerNo]}
          onPress={() => handleSubmit(false)}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={t('checkin.no')}
        >
          <Text style={styles.answerBtnText}>{t('checkin.no')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.lg },
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: 60 },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
  challengeCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.md,
    borderLeftWidth: 4, borderLeftColor: colors.pillars.discipline,
  },
  challengeLabel: { ...typography.caption, color: colors.pillars.discipline, marginBottom: spacing.sm },
  challengeText: { ...typography.body, color: colors.text, lineHeight: 26 },
  photoBtn: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  photoBtnText: { ...typography.body, color: colors.textMuted },
  proofImage: { width: '100%', height: 180, borderRadius: radius.md },
  error: { color: colors.error, marginBottom: spacing.md, ...typography.body },
  answerRow: { gap: spacing.sm },
  answerBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  answerYes: { backgroundColor: colors.success },
  answerNo: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  answerBtnText: { color: '#fff', ...typography.bodyBold },
  doneIcon: { fontSize: 56, textAlign: 'center', marginBottom: spacing.md },
  doneTitle: { ...typography.h2, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  xpBadge: {
    ...typography.bodyBold, color: colors.xpGold,
    textAlign: 'center', marginBottom: spacing.lg,
    fontSize: 20,
  },
  rexCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.xl,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  rexLabel: { ...typography.caption, color: colors.primary, marginBottom: spacing.sm },
  rexMessage: { ...typography.body, color: colors.text, lineHeight: 26 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnText: { color: '#fff', ...typography.bodyBold },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  emptyBody: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
});
