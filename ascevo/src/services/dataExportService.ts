import { supabase } from './supabaseClient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserDataExport {
  exportDate: string;
  profile: any;
  chatHistory: any[];
  progress: any[];
  streaks: any;
  xpTransactions: any[];
  challenges: any[];
  subscriptions: any[];
  legalConsents: any[];
  privacyPreferences: any;
  memories: any[];
  briefings: any[];
  debriefs: any[];
  sosEvents: any[];
  speakingSessions: any[];
}

// ─── Export User Data ─────────────────────────────────────────────────────────

export async function exportUserData(userId: string): Promise<string> {
  try {
    // Fetch all user data from various tables
    const [
      profileData,
      chatData,
      progressData,
      streakData,
      xpData,
      challengeData,
      subscriptionData,
      consentData,
      preferencesData,
      memoriesData,
      briefingsData,
      debriefsData,
      sosData,
      speakingData,
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      supabase.from('rex_messages').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('user_progress').select('*').eq('user_id', userId),
      supabase.from('streaks').select('*').eq('user_id', userId).single(),
      supabase.from('xp_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('challenge_completions').select('*').eq('user_id', userId),
      supabase.from('subscriptions').select('*').eq('user_id', userId),
      supabase.from('user_legal_consents').select('*').eq('user_id', userId),
      supabase.from('user_privacy_preferences').select('*').eq('user_id', userId).single(),
      supabase.from('rex_memories').select('*').eq('user_id', userId),
      supabase.from('daily_checkins').select('*').eq('user_id', userId),
      supabase.from('evening_debriefs').select('*').eq('user_id', userId),
      supabase.from('sos_events').select('*').eq('user_id', userId),
      supabase.from('speech_sessions').select('*').eq('user_id', userId),
    ]);

    // Build export object
    const exportData: UserDataExport = {
      exportDate: new Date().toISOString(),
      profile: profileData.data || null,
      chatHistory: chatData.data || [],
      progress: progressData.data || [],
      streaks: streakData.data || null,
      xpTransactions: xpData.data || [],
      challenges: challengeData.data || [],
      subscriptions: subscriptionData.data || [],
      legalConsents: consentData.data || [],
      privacyPreferences: preferencesData.data || null,
      memories: memoriesData.data || [],
      briefings: briefingsData.data || [],
      debriefs: debriefsData.data || [],
      sosEvents: sosData.data || [],
      speakingSessions: speakingData.data || [],
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Save to file
    const fileName = `growthovo_data_export_${userId}_${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Log export request
    await supabase.from('data_export_requests').insert({
      user_id: userId,
      export_date: new Date().toISOString(),
      file_size_bytes: jsonString.length,
    });

    return fileUri;
  } catch (error: any) {
    console.error('Data export error:', error);
    throw new Error('Failed to export data. Please try again.');
  }
}

// ─── Share Exported Data ──────────────────────────────────────────────────────

export async function shareExportedData(fileUri: string): Promise<void> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Export Your Growthovo Data',
      UTI: 'public.json',
    });
  } catch (error: any) {
    console.error('Share error:', error);
    throw new Error('Failed to share exported data.');
  }
}

// ─── Delete Exported File ─────────────────────────────────────────────────────

export async function deleteExportedFile(fileUri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  } catch (error) {
    console.warn('Failed to delete exported file:', error);
  }
}
