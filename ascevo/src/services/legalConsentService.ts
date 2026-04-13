import { supabase } from './supabaseClient';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'privacy_policy'
  | 'terms_conditions'
  | 'ai_transparency'
  | 'crisis_disclaimer'
  | 'subscription_terms'
  | 'age_verification'
  | 'cookie_policy';

export type ConsentMethod = 'explicit_checkbox' | 'click_through' | 'passive_display';

export interface LegalConsent {
  id: string;
  user_id: string;
  document_type: DocumentType;
  document_version: string;
  consented_at: string;
  ip_address: string | null;
  user_agent: string | null;
  consent_method: ConsentMethod;
  created_at: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getUserAgent(): string {
  try {
    const platform = Platform.OS;
    const version = Platform.Version;
    const deviceName = Constants.deviceName || 'Unknown Device';
    
    return `${deviceName} (${platform} ${version})`;
  } catch (error) {
    console.warn('Failed to get user agent:', error);
    return 'Unknown Device';
  }
}

function friendlyError(raw: string): string {
  if (raw.includes('duplicate key')) return 'Consent already recorded.';
  if (raw.includes('foreign key')) return 'Invalid user ID.';
  if (raw.includes('check constraint')) return 'Invalid document type or consent method.';
  if (raw.includes('network') || raw.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  return 'Failed to record consent. Please try again.';
}

// ─── Log Consent ──────────────────────────────────────────────────────────────

export async function logConsent(
  userId: string,
  documentType: DocumentType,
  version: string,
  method: ConsentMethod
): Promise<LegalConsent> {
  const userAgent = getUserAgent();

  const { data, error } = await supabase
    .from('user_legal_consents')
    .insert({
      user_id: userId,
      document_type: documentType,
      document_version: version,
      ip_address: null, // IP address not available in React Native without additional packages
      user_agent: userAgent,
      consent_method: method,
    })
    .select()
    .single();

  if (error) throw new Error(friendlyError(error.message));
  return data;
}

// ─── Get User Consents ────────────────────────────────────────────────────────

export async function getUserConsents(userId: string): Promise<LegalConsent[]> {
  const { data, error } = await supabase
    .from('user_legal_consents')
    .select('*')
    .eq('user_id', userId)
    .order('consented_at', { ascending: false });

  if (error) throw new Error(friendlyError(error.message));
  return data ?? [];
}

// ─── Has User Consented ───────────────────────────────────────────────────────

export async function hasUserConsented(
  userId: string,
  documentType: DocumentType,
  minVersion?: string
): Promise<boolean> {
  let query = supabase
    .from('user_legal_consents')
    .select('id')
    .eq('user_id', userId)
    .eq('document_type', documentType);

  if (minVersion) {
    query = query.gte('document_version', minVersion);
  }

  const { data, error } = await query.limit(1);

  if (error) throw new Error(friendlyError(error.message));
  return (data?.length ?? 0) > 0;
}

// ─── Get Latest Consent for Document ──────────────────────────────────────────

export async function getLatestConsent(
  userId: string,
  documentType: DocumentType
): Promise<LegalConsent | null> {
  const { data, error } = await supabase
    .from('user_legal_consents')
    .select('*')
    .eq('user_id', userId)
    .eq('document_type', documentType)
    .order('consented_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(friendlyError(error.message));
  }

  return data;
}

// ─── Get Consents by Document Type ────────────────────────────────────────────

export async function getConsentsByType(
  userId: string,
  documentType: DocumentType
): Promise<LegalConsent[]> {
  const { data, error } = await supabase
    .from('user_legal_consents')
    .select('*')
    .eq('user_id', userId)
    .eq('document_type', documentType)
    .order('consented_at', { ascending: false });

  if (error) throw new Error(friendlyError(error.message));
  return data ?? [];
}
