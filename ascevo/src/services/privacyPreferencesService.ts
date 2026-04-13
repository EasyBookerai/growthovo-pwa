import { supabase } from './supabaseClient';
import { PrivacyPreferences } from '../types';

// ─── Get Privacy Preferences ──────────────────────────────────────────────────

export async function getPrivacyPreferences(userId: string): Promise<PrivacyPreferences> {
  try {
    const { data, error } = await supabase
      .from('user_privacy_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no preferences exist, create default ones
      if (error.code === 'PGRST116') {
        return await createDefaultPreferences(userId);
      }
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error('Get privacy preferences error:', error);
    throw new Error('Failed to load privacy preferences.');
  }
}

// ─── Create Default Preferences ───────────────────────────────────────────────

async function createDefaultPreferences(userId: string): Promise<PrivacyPreferences> {
  const defaultPrefs: Omit<PrivacyPreferences, 'created_at' | 'last_updated'> = {
    user_id: userId,
    analytics_enabled: true,
    marketing_emails_enabled: false,
    data_sharing_consent: false,
  };

  const { data, error } = await supabase
    .from('user_privacy_preferences')
    .insert(defaultPrefs)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Update Privacy Preferences ───────────────────────────────────────────────

export async function updatePrivacyPreferences(
  userId: string,
  preferences: Partial<Omit<PrivacyPreferences, 'user_id' | 'created_at' | 'last_updated'>>
): Promise<PrivacyPreferences> {
  try {
    const { data, error } = await supabase
      .from('user_privacy_preferences')
      .update({
        ...preferences,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Update privacy preferences error:', error);
    throw new Error('Failed to update privacy preferences.');
  }
}

// ─── Update Analytics Preference ──────────────────────────────────────────────

export async function updateAnalyticsPreference(
  userId: string,
  enabled: boolean
): Promise<void> {
  try {
    await updatePrivacyPreferences(userId, { analytics_enabled: enabled });
  } catch (error) {
    throw error;
  }
}

// ─── Update Marketing Emails Preference ───────────────────────────────────────

export async function updateMarketingEmailsPreference(
  userId: string,
  enabled: boolean
): Promise<void> {
  try {
    await updatePrivacyPreferences(userId, { marketing_emails_enabled: enabled });
  } catch (error) {
    throw error;
  }
}

// ─── Update Data Sharing Preference ───────────────────────────────────────────

export async function updateDataSharingPreference(
  userId: string,
  enabled: boolean
): Promise<void> {
  try {
    await updatePrivacyPreferences(userId, { data_sharing_consent: enabled });
  } catch (error) {
    throw error;
  }
}
