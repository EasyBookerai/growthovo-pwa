import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ScrollView, ActivityIndicator, Linking, Alert, Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabaseClient';
import { signOut } from '../../services/authService';
import { getPortalLink } from '../../services/subscriptionService';
import {
  scheduleDefaultNotifications,
  cancelAllNotifications,
} from '../../services/notificationService';
import { exportUserData, shareExportedData, deleteExportedFile } from '../../services/dataExportService';
import { 
  scheduleAccountDeletion, 
  cancelAccountDeletion, 
  getDeletionStatus 
} from '../../services/accountDeletionService';
import {
  getPrivacyPreferences,
  updateAnalyticsPreference,
  updateMarketingEmailsPreference,
  updateDataSharingPreference,
} from '../../services/privacyPreferencesService';
import { useLanguageStore } from '../../store';
import LanguagePicker from '../../components/LanguagePicker';
import { LANGUAGE_OPTIONS } from '../../services/i18nService';
import { colors, typography, spacing, radius } from '../../theme';

interface Props {
  userId: string;
  onSignOut: () => void;
  onNavigateToLegalDocument?: (documentType: 'privacy_policy' | 'terms_conditions' | 'cookie_policy') => void;
}

export default function SettingsScreen({ userId, onSignOut, onNavigateToLegalDocument }: Props) {
  const { t } = useTranslation();
  const { language, setLanguage, isChangingLanguage } = useLanguageStore();

  const [freezeCount, setFreezeCount] = useState(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [notifMorning, setNotifMorning] = useState(true);
  const [notifAfternoon, setNotifAfternoon] = useState(true);
  const [notifEvening, setNotifEvening] = useState(true);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  // Data management states
  const [exportLoading, setExportLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<{
    isScheduled: boolean;
    scheduledDate: string | null;
    gracePeriodEnds: string | null;
  }>({ isScheduled: false, scheduledDate: null, gracePeriodEnds: null });
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const [dataSharingEnabled, setDataSharingEnabled] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [streakData, userData, notifData, privacyPrefs, delStatus] = await Promise.all([
      supabase.from('streaks').select('freeze_count').eq('user_id', userId).single(),
      supabase.from('users').select('subscription_status').eq('id', userId).single(),
      supabase.from('notifications').select('type, enabled').eq('user_id', userId),
      getPrivacyPreferences(userId).catch(() => null),
      getDeletionStatus(userId).catch(() => ({ isScheduled: false, scheduledDate: null, gracePeriodEnds: null })),
    ]);

    setFreezeCount(streakData.data?.freeze_count ?? 0);
    setSubscriptionStatus(userData.data?.subscription_status ?? 'free');

    const notifs = notifData.data ?? [];
    setNotifMorning(notifs.find((n: any) => n.type === 'morning')?.enabled ?? true);
    setNotifAfternoon(notifs.find((n: any) => n.type === 'afternoon')?.enabled ?? true);
    setNotifEvening(notifs.find((n: any) => n.type === 'evening')?.enabled ?? true);

    if (privacyPrefs) {
      setAnalyticsEnabled(privacyPrefs.analytics_enabled);
      setMarketingEnabled(privacyPrefs.marketing_emails_enabled);
      setDataSharingEnabled(privacyPrefs.data_sharing_consent);
    }

    setDeletionStatus(delStatus);

    setLoading(false);
  }

  async function handleNotifToggle(type: 'morning' | 'afternoon' | 'evening', value: boolean) {
    if (type === 'morning') setNotifMorning(value);
    if (type === 'afternoon') setNotifAfternoon(value);
    if (type === 'evening') setNotifEvening(value);

    await supabase.from('notifications')
      .update({ enabled: value })
      .eq('user_id', userId)
      .eq('type', type);

    const morning = type === 'morning' ? value : notifMorning;
    const afternoon = type === 'afternoon' ? value : notifAfternoon;
    const evening = type === 'evening' ? value : notifEvening;

    if (!morning && !afternoon && !evening) {
      await cancelAllNotifications();
    } else {
      await scheduleDefaultNotifications(userId);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const url = await getPortalLink(userId);
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert(t('errors.generic'), e.message);
    } finally {
      setPortalLoading(false);
    }
  }

  async function handleSignOut() {
    Alert.alert(
      t('settings.sign_out_confirm_title'),
      t('settings.sign_out_confirm_message'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.sign_out'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            onSignOut();
          },
        },
      ]
    );
  }

  async function handleExportData() {
    setExportLoading(true);
    try {
      const fileUri = await exportUserData(userId);
      await shareExportedData(fileUri);
      Alert.alert(t('settings.export_success'));
      // Clean up the file after sharing
      await deleteExportedFile(fileUri);
    } catch (error: any) {
      Alert.alert(t('settings.export_error'), error.message);
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteAccount() {
    Alert.alert(
      t('settings.delete_confirm_title'),
      t('settings.delete_confirm_message'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.delete_confirm_button'),
          style: 'destructive',
          onPress: async () => {
            try {
              const status = await scheduleAccountDeletion(userId);
              setDeletionStatus(status);
              Alert.alert(
                t('settings.deletion_scheduled'),
                `Your account will be permanently deleted on ${new Date(status.gracePeriodEnds!).toLocaleDateString()}`
              );
            } catch (error: any) {
              Alert.alert(t('errors.generic'), error.message);
            }
          },
        },
      ]
    );
  }

  async function handleCancelDeletion() {
    try {
      await cancelAccountDeletion(userId);
      setDeletionStatus({ isScheduled: false, scheduledDate: null, gracePeriodEnds: null });
      Alert.alert(t('settings.deletion_cancelled'));
    } catch (error: any) {
      Alert.alert(t('errors.generic'), error.message);
    }
  }

  async function handleAnalyticsToggle(value: boolean) {
    setAnalyticsEnabled(value);
    try {
      await updateAnalyticsPreference(userId, value);
    } catch (error: any) {
      setAnalyticsEnabled(!value);
      Alert.alert(t('errors.generic'), error.message);
    }
  }

  async function handleMarketingToggle(value: boolean) {
    setMarketingEnabled(value);
    try {
      await updateMarketingEmailsPreference(userId, value);
    } catch (error: any) {
      setMarketingEnabled(!value);
      Alert.alert(t('errors.generic'), error.message);
    }
  }

  async function handleDataSharingToggle(value: boolean) {
    setDataSharingEnabled(value);
    try {
      await updateDataSharingPreference(userId, value);
    } catch (error: any) {
      setDataSharingEnabled(!value);
      Alert.alert(t('errors.generic'), error.message);
    }
  }

  const currentLangOption = LANGUAGE_OPTIONS.find((o) => o.code === language);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('settings.title')}</Text>

        {/* Language */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language_section')}</Text>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setLanguageModalVisible(true)}
            disabled={isChangingLanguage}
            accessibilityRole="button"
            accessibilityLabel={t('settings.language')}
          >
            <Text style={styles.rowLabel}>
              {currentLangOption?.flag} {currentLangOption?.nativeName}
            </Text>
            {isChangingLanguage ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.rowChevron}>›</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Streak Freezes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.streak_freezes')}</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.available_freezes')}</Text>
            <Text style={styles.rowValue}>{freezeCount}/3</Text>
          </View>
          <Text style={styles.hint}>{t('settings.freezes_hint')}</Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.morning')}</Text>
            <Switch
              value={notifMorning}
              onValueChange={(v) => handleNotifToggle('morning', v)}
              trackColor={{ true: colors.primary }}
              accessibilityLabel={t('settings.morning')}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.afternoon')}</Text>
            <Switch
              value={notifAfternoon}
              onValueChange={(v) => handleNotifToggle('afternoon', v)}
              trackColor={{ true: colors.primary }}
              accessibilityLabel={t('settings.afternoon')}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.evening')}</Text>
            <Switch
              value={notifEvening}
              onValueChange={(v) => handleNotifToggle('evening', v)}
              trackColor={{ true: colors.primary }}
              accessibilityLabel={t('settings.evening')}
            />
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.subscription')}</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('settings.current_plan')}</Text>
            <Text style={[styles.rowValue, { color: subscriptionStatus !== 'free' ? colors.success : colors.textMuted }]}>
              {subscriptionStatus === 'active' ? t('settings.plan_premium') :
               subscriptionStatus === 'trialing' ? t('settings.plan_trial') : t('settings.plan_free')}
            </Text>
          </View>
          {subscriptionStatus !== 'free' && (
            <TouchableOpacity
              style={styles.manageBtn}
              onPress={handleManageSubscription}
              disabled={portalLoading}
              accessibilityRole="button"
            >
              {portalLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.manageBtnText}>{t('settings.manage_subscription')}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Privacy Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy_preferences')}</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('settings.analytics')}</Text>
              <Text style={styles.hint}>{t('settings.analytics_hint')}</Text>
            </View>
            <Switch
              value={analyticsEnabled}
              onValueChange={handleAnalyticsToggle}
              trackColor={{ true: colors.primary }}
              accessibilityLabel={t('settings.analytics')}
            />
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('settings.marketing_emails')}</Text>
              <Text style={styles.hint}>{t('settings.marketing_emails_hint')}</Text>
            </View>
            <Switch
              value={marketingEnabled}
              onValueChange={handleMarketingToggle}
              trackColor={{ true: colors.primary }}
              accessibilityLabel={t('settings.marketing_emails')}
            />
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('settings.data_sharing')}</Text>
              <Text style={styles.hint}>{t('settings.data_sharing_hint')}</Text>
            </View>
            <Switch
              value={dataSharingEnabled}
              onValueChange={handleDataSharingToggle}
              trackColor={{ true: colors.primary }}
              accessibilityLabel={t('settings.data_sharing')}
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.data_management')}</Text>
          
          {/* Export Data */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleExportData}
            disabled={exportLoading}
            accessibilityRole="button"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{t('settings.export_my_data')}</Text>
              <Text style={styles.hint}>{t('settings.export_my_data_hint')}</Text>
            </View>
            {exportLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.rowChevron}>›</Text>
            )}
          </TouchableOpacity>

          {/* Delete Account */}
          {deletionStatus.isScheduled ? (
            <View style={styles.deletionWarning}>
              <Text style={styles.deletionWarningTitle}>{t('settings.deletion_scheduled')}</Text>
              <Text style={styles.deletionWarningText}>
                {t('settings.deletion_scheduled_hint', { 
                  date: new Date(deletionStatus.gracePeriodEnds!).toLocaleDateString() 
                })}
              </Text>
              <TouchableOpacity
                style={styles.cancelDeletionBtn}
                onPress={handleCancelDeletion}
                accessibilityRole="button"
              >
                <Text style={styles.cancelDeletionText}>{t('settings.cancel_deletion')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleDeleteAccount}
              accessibilityRole="button"
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.error }]}>{t('settings.delete_account')}</Text>
                <Text style={styles.hint}>{t('settings.delete_account_hint')}</Text>
              </View>
              <Text style={[styles.rowChevron, { color: colors.error }]}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Legal Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.legal_documents')}</Text>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => onNavigateToLegalDocument?.('privacy_policy')}
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>{t('settings.privacy_policy')}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => onNavigateToLegalDocument?.('terms_conditions')}
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>{t('settings.terms_conditions')}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => onNavigateToLegalDocument?.('cookie_policy')}
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>{t('settings.cookie_policy')}</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            Version 1.0 • Effective Date: January 2024
          </Text>
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel={t('settings.sign_out')}
        >
          <Text style={styles.signOutText}>{t('settings.sign_out')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language picker modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('settings.language_section')}</Text>
            <TouchableOpacity
              onPress={() => setLanguageModalVisible(false)}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Text style={styles.modalClose}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {isChangingLanguage ? (
              <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: spacing.xl }} />
            ) : (
              <LanguagePicker
                selected={language}
                onSelect={async (code) => {
                  await setLanguage(code, userId);
                  setLanguageModalVisible(false);
                }}
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  container: { padding: spacing.lg, paddingTop: 60, paddingBottom: 80, gap: spacing.lg },
  title: { ...typography.h2, color: colors.text },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { ...typography.bodyBold, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  rowLabel: { ...typography.body, color: colors.text },
  rowValue: { ...typography.bodyBold, color: colors.text },
  rowChevron: { ...typography.h2, color: colors.textMuted },
  hint: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  manageBtn: { paddingVertical: spacing.sm },
  manageBtnText: { ...typography.body, color: colors.primary },
  deletionWarning: {
    backgroundColor: colors.error + '15',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  deletionWarningTitle: { ...typography.bodyBold, color: colors.error, marginBottom: spacing.xs },
  deletionWarningText: { ...typography.small, color: colors.text, marginBottom: spacing.sm },
  cancelDeletionBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cancelDeletionText: { ...typography.bodyBold, color: colors.primary },
  signOutBtn: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.error,
  },
  signOutText: { color: colors.error, ...typography.bodyBold },
  // Modal
  modalRoot: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalClose: { ...typography.body, color: colors.primary },
  modalContent: { padding: spacing.lg },
});
