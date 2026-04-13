import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabaseClient';
import { getRexStreakWarning } from './rex';
import i18n from './i18nService';
import type { SupportedLanguage } from './i18nService';
import { isEligibleForMonthlyWrapped } from './wrappedService';
import { getActivePair } from './partnerService';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Register Push Token ──────────────────────────────────────────────────────

export async function registerPushToken(userId: string): Promise<void> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return; // User denied — silent fail

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const token = await Notifications.getExpoPushTokenAsync();

    // Store token in DB (upsert by user_id + type)
    await supabase.from('notifications').upsert(
      {
        user_id: userId,
        type: 'push_token',
        scheduled_time: '00:00',
        enabled: true,
      },
      { onConflict: 'user_id,type' }
    );

    // Persist the actual token to users table for server-side push delivery
    await supabase.from('users').update({ push_token: token.data }).eq('id', userId);

    // In production, store the actual token for server-side push
    console.log('Push token registered:', token.data);
  } catch (err) {
    // Silent fail — app works without notifications
    console.warn('Push token registration failed:', err);
  }
}

// ─── Schedule Default Notifications ──────────────────────────────────────────

export async function scheduleDefaultNotifications(userId: string): Promise<void> {
  await cancelAllNotifications();

  // Use i18n to get translated notification copy in the active language
  const t = (key: string) => i18n.t(key);

  const notifications = [
    {
      hour: 8, minute: 0,
      title: t('notifications.morning_title'),
      body: t('notifications.morning_body'),
      type: 'morning' as const,
    },
    {
      hour: 14, minute: 0,
      title: t('notifications.afternoon_title'),
      body: t('notifications.afternoon_body'),
      type: 'afternoon' as const,
    },
    {
      hour: 21, minute: 0,
      title: t('notifications.evening_title'),
      body: t('notifications.evening_body'),
      type: 'evening' as const,
    },
  ];

  const activeLanguage: SupportedLanguage = (i18n.language as SupportedLanguage) ?? 'en';

  for (const n of notifications) {
    await scheduleDaily(n.hour, n.minute, n.title, n.body);
    await supabase.from('notifications').upsert(
      {
        user_id: userId,
        type: n.type,
        scheduled_time: `${String(n.hour).padStart(2, '0')}:${String(n.minute).padStart(2, '0')}`,
        enabled: true,
        language: activeLanguage,
      },
      { onConflict: 'user_id,type' }
    );
  }
}

// ─── Rex Streak Warning Notification ─────────────────────────────────────────

/**
 * Sends an immediate local notification with Rex's personalised streak warning.
 * Call this when the streak-at-risk condition is detected (e.g. from HomeScreen).
 */
export async function sendRexStreakWarning(
  userId: string,
  streakDays: number,
  hoursLeft: number,
  lastChallenge: string
): Promise<void> {
  try {
    const message = await getRexStreakWarning({ userId, streakDays, hoursLeft, lastChallenge });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rex',
        body: message,
        sound: true,
      },
      trigger: null, // immediate
    });
  } catch (err) {
    console.warn('Rex streak warning notification failed:', err);
  }
}

// ─── Schedule Danger Window ───────────────────────────────────────────────────

export async function scheduleDangerWindow(userId: string, time: string): Promise<void> {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  await scheduleDaily(
    hour, minute,
    "Danger window alert ⚡",
    "You said this is a vulnerable time. Stay on track."
  );

  await supabase.from('notifications').upsert(
    {
      user_id: userId,
      type: 'danger_window',
      scheduled_time: time,
      enabled: true,
    },
    { onConflict: 'user_id,type' }
  );
}

// ─── Cancel All Notifications ─────────────────────────────────────────────────

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('Failed to cancel notifications:', err);
  }
}

// ─── Disable Notifications for User ──────────────────────────────────────────

export async function disableNotifications(userId: string): Promise<void> {
  await cancelAllNotifications();
  await supabase.from('notifications').update({ enabled: false }).eq('user_id', userId);
}

// ─── Schedule Capsule Unlock Notification ────────────────────────────────────

export async function scheduleCapsuleUnlockNotification(createdAt: string): Promise<void> {
  try {
    const unlockDate = new Date(new Date(createdAt).getTime() + 90 * 24 * 60 * 60 * 1000);
    unlockDate.setHours(8, 0, 0, 0);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your time capsule is ready 🔓',
        body: '90 days ago, you made a promise. Time to see how far you\'ve come.',
        sound: true,
      },
      trigger: {
        date: unlockDate,
      } as any,
    });
  } catch (err) {
    console.warn('Failed to schedule capsule unlock notification:', err);
  }
}

// ─── Internal: Schedule Daily Notification ───────────────────────────────────

async function scheduleDaily(hour: number, minute: number, title: string, body: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: {
        hour,
        minute,
        repeats: true,
      } as any,
    });
  } catch (err) {
    // Log failure without crashing
    console.warn(`Failed to schedule notification at ${hour}:${minute}:`, err);
  }
}

// ─── Schedule Monthly Wrapped Notification ────────────────────────────────────

/**
 * Schedules a push notification for the last day of the current month at 8:00 PM,
 * but only if the user has been active on at least 7 days this month.
 * Validates: Requirements 4.2
 */
export async function scheduleMonthlyWrappedNotification(
  userId: string,
  activeDaysThisMonth: number
): Promise<void> {
  if (!isEligibleForMonthlyWrapped(activeDaysThisMonth)) return;

  try {
    const now = new Date();
    // Last day of the current month
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(20, 0, 0, 0);

    // Only schedule if the last day is in the future
    if (lastDay <= now) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Monthly Wrapped is ready 🎁',
        body: 'See how you grew this month. Your GROWTHOVO Wrapped is here.',
        sound: true,
      },
      trigger: {
        date: lastDay,
      } as any,
    });
  } catch (err) {
    console.warn('Failed to schedule monthly wrapped notification:', err);
  }
}

// ─── Schedule Yearly Wrapped Notification ─────────────────────────────────────

/**
 * Schedules a push notification for December 31st of the current year at 8:00 PM.
 * Validates: Requirements 4.3
 */
export async function scheduleYearlyWrappedNotification(): Promise<void> {
  try {
    const now = new Date();
    const dec31 = new Date(now.getFullYear(), 11, 31); // December 31
    dec31.setHours(20, 0, 0, 0);

    // Only schedule if Dec 31 is in the future
    if (dec31 <= now) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Year in GROWTHOVO 🎊',
        body: '365 days. See everything you built. Your GROWTHOVO Wrapped is ready.',
        sound: true,
      },
      trigger: {
        date: dec31,
      } as any,
    });
  } catch (err) {
    console.warn('Failed to schedule yearly wrapped notification:', err);
  }
}

// ─── Schedule Morning Briefing Notification ───────────────────────────────────

/**
 * Schedules a daily push notification for the morning briefing at the user's
 * configured time (default 07:30 local time).
 * Requirement 1.1: "Rex has your briefing. 60 seconds."
 */
export async function scheduleMorningBriefingNotification(
  userId: string,
  hour = 7,
  minute = 30
): Promise<void> {
  await scheduleDaily(
    hour,
    minute,
    'Rex',
    'Rex has your briefing. 60 seconds.'
  );

  await supabase.from('notifications').upsert(
    {
      user_id: userId,
      type: 'morning_briefing',
      scheduled_time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      enabled: true,
    },
    { onConflict: 'user_id,type' }
  );
}

// ─── Schedule Evening Debrief Notification ────────────────────────────────────

/**
 * Schedules a daily push notification for the evening debrief at the user's
 * configured time (default 21:00 local time).
 * Requirement 16.1: "Rex is waiting. 2 minutes."
 */
export async function scheduleEveningDebriefNotification(
  userId: string,
  hour = 21,
  minute = 0
): Promise<void> {
  await scheduleDaily(
    hour,
    minute,
    'Rex',
    'Rex is waiting. 2 minutes.'
  );

  await supabase.from('notifications').upsert(
    {
      user_id: userId,
      type: 'evening_debrief',
      scheduled_time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      enabled: true,
    },
    { onConflict: 'user_id,type' }
  );
}

// ─── Partner Notification Helpers ─────────────────────────────────────────────

/**
 * Looks up the Expo push token for a given user from the users table.
 * Returns null if no token is stored.
 */
async function getPartnerPushToken(partnerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('push_token')
    .eq('id', partnerId)
    .maybeSingle();

  if (error || !data?.push_token) return null;
  return data.push_token as string;
}

/**
 * Sends an Expo push notification directly to a partner's device token.
 * Uses the Expo push API endpoint.
 */
async function sendExpoPushToPartner(
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to: token, title, body, data: data ?? {}, sound: 'default' }),
    });
  } catch (err) {
    console.warn('Failed to send partner push notification:', err);
  }
}

// ─── Partner Check-In Notification ────────────────────────────────────────────

/**
 * Sends a push notification to the user's partner when the user checks in.
 * Message: "[Name] checked in. They're going for day [X]."
 * Requirement 20.2
 */
export async function sendPartnerCheckinNotification(
  userId: string,
  userName: string,
  streakCount: number
): Promise<void> {
  try {
    const pair = await getActivePair(userId);
    if (!pair) return;

    const token = await getPartnerPushToken(pair.partnerId);
    if (!token) return;

    await sendExpoPushToPartner(
      token,
      'Accountability Partner',
      `${userName} checked in. They're going for day ${streakCount}.`,
      { type: 'partner_checkin', userId }
    );
  } catch (err) {
    console.warn('sendPartnerCheckinNotification failed:', err);
  }
}

// ─── Partner Debrief Reminder Notification ────────────────────────────────────

/**
 * Sends a push notification to the user's partner at 22:00 if the user
 * has not submitted their evening debrief.
 * Message: "[Name] hasn't checked in tonight. Send them a message?"
 * Requirement 20.3
 */
export async function sendPartnerDebriefReminderNotification(
  userId: string,
  partnerName: string
): Promise<void> {
  try {
    const pair = await getActivePair(userId);
    if (!pair) return;

    const token = await getPartnerPushToken(pair.partnerId);
    if (!token) return;

    await sendExpoPushToPartner(
      token,
      'Accountability Partner',
      `${partnerName} hasn't checked in tonight. Send them a message?`,
      {
        type: 'partner_debrief_reminder',
        userId,
        quickReplies: ['You got this 💪', "Don't break it 🔥", "I'm watching 👀"],
      }
    );
  } catch (err) {
    console.warn('sendPartnerDebriefReminderNotification failed:', err);
  }
}

// ─── Schedule Partner Debrief Reminder Check ──────────────────────────────────

/**
 * Schedules a daily local notification at 22:00 that acts as a trigger for the
 * partner debrief reminder check. The app handles the actual push-to-partner
 * logic when this notification fires (via a notification response handler).
 * Requirement 20.3
 */
export async function schedulePartnerDebriefReminderCheck(userId: string): Promise<void> {
  await scheduleDaily(
    22,
    0,
    'partner_debrief_check',
    'Check if partner completed debrief'
  );

  await supabase.from('notifications').upsert(
    {
      user_id: userId,
      type: 'partner_debrief_check',
      scheduled_time: '22:00',
      enabled: true,
    },
    { onConflict: 'user_id,type' }
  );
}

// ─── Schedule Weekly Report Notification ─────────────────────────────────────

/**
 * Schedules a weekly push notification every Sunday at 20:00 local time.
 * Message: "Rex has your weekly report. 2 minutes."
 * Requirements: 22.1
 */
export async function scheduleWeeklyReportNotification(userId: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rex',
        body: 'Rex has your weekly report. 2 minutes.',
        sound: true,
      },
      trigger: {
        weekday: 1, // Sunday (Expo uses 1=Sunday, 2=Monday, ..., 7=Saturday)
        hour: 20,
        minute: 0,
        repeats: true,
      } as any,
    });

    await supabase.from('notifications').upsert(
      {
        user_id: userId,
        type: 'weekly_report',
        scheduled_time: '20:00',
        enabled: true,
      },
      { onConflict: 'user_id,type' }
    );
  } catch (err) {
    console.warn('Failed to schedule weekly report notification:', err);
  }
}

// ─── Partner Streak Break Notification ────────────────────────────────────────

/**
 * Sends a push notification to the user's partner when the user's streak breaks.
 * Sent before any other streak-break notification.
 * Requirement 20.5
 */
export async function sendPartnerStreakBreakNotification(
  userId: string,
  userName: string
): Promise<void> {
  try {
    const pair = await getActivePair(userId);
    if (!pair) return;

    const token = await getPartnerPushToken(pair.partnerId);
    if (!token) return;

    await sendExpoPushToPartner(
      token,
      'Accountability Partner',
      `${userName}'s streak just broke. They need you right now.`,
      { type: 'partner_streak_break', userId }
    );
  } catch (err) {
    console.warn('sendPartnerStreakBreakNotification failed:', err);
  }
}

// ─── Schedule Legal Document Update Check ────────────────────────────────────

/**
 * Schedules a daily check for legal document updates at 9:00 AM local time.
 * When updates are detected, users will be notified via push and email.
 * This should be set up once when the user registers or logs in.
 */
export async function scheduleLegalDocumentUpdateCheck(userId: string): Promise<void> {
  await scheduleDaily(
    9,
    0,
    'legal_update_check',
    'Check for legal document updates'
  );

  await supabase.from('notifications').upsert(
    {
      user_id: userId,
      type: 'legal_update_check',
      scheduled_time: '09:00',
      enabled: true,
    },
    { onConflict: 'user_id,type' }
  );
}
