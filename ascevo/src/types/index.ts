// Growthovo App — TypeScript Types

export type SubscriptionStatus = 'free' | 'trialing' | 'active' | 'canceled';
export type XPSource = 'lesson' | 'challenge' | 'checkin' | 'streak_milestone' | 'level_up' | 'morning_briefing' | 'speaking_session' | 'speaking_challenge';
export type NotificationType = 'morning' | 'afternoon' | 'evening' | 'danger_window';
export type RexTrigger = 'lesson_complete' | 'checkin_positive' | 'checkin_negative' | 'streak_risk' | 'level_up';
export type CardRole = 'user' | 'assistant';
export type PillarKey = 'mind' | 'discipline' | 'communication' | 'money' | 'relationships';

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  dailyGoalMinutes: 5 | 10 | 15;
  onboardingComplete: boolean;
  stripeCustomerId?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: 'monthly' | 'annual';
  trialEndDate?: string;
  createdAt: string;
  primaryPillar?: PillarKey;
  secondaryPillar?: PillarKey;
}

export interface Pillar {
  id: string;
  name: string;
  colour: string;
  icon: string;
  displayOrder: number;
}

export interface Unit {
  id: string;
  pillarId: string;
  title: string;
  displayOrder: number;
}

export interface LessonCards {
  concept: string; // max 60 words
  example: string;
  mistake: string;
  science: string;
  challenge: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  displayOrder: number;
  cardConcept: string;
  cardExample: string;
  cardMistake: string;
  cardScience: string;
  cardChallenge: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  completedAt?: string;
  xpEarned: number;
}

export interface StreakState {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string; // ISO date
  freezeCount: number;
  updatedAt: string;
}

export interface HeartsState {
  id: string;
  userId: string;
  count: number;
  lastRefillDate: string; // ISO date
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  source: XPSource;
  referenceId?: string;
  createdAt: string;
}

export interface League {
  id: string;
  tier: number;
  weekStart: string;
  weekEnd: string;
}

export interface LeagueMember {
  id: string;
  leagueId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  weeklyXp: number;
  rank: number;
}

export interface Squad {
  id: string;
  name: string;
  pillarId: string;
  inviteCode: string;
  createdAt: string;
}

export interface SquadMember {
  id: string;
  squadId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  currentStreak: number;
  weeklyXp: number;
  joinedAt: string;
}

export interface Challenge {
  id: string;
  lessonId: string;
  description: string;
}

export interface ChallengeCompletion {
  id: string;
  userId: string;
  challengeId: string;
  completed: boolean;
  proofPhotoUrl?: string;
  rexResponse?: string;
  completedAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: NotificationType;
  scheduledTime: string; // HH:MM
  enabled: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: SubscriptionStatus;
  plan?: 'monthly' | 'annual';
  trialEnd?: string;
  currentPeriodEnd?: string;
  updatedAt: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  username: string;
  avatarUrl?: string;
  currentStreak: number;
  createdAt: string;
}

export interface RexMessage {
  id: string;
  userId: string;
  role: CardRole;
  content: string;
  createdAt: string;
}

// Pillar level thresholds (XP required to reach each level)
export const PILLAR_LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000, 6500];

// XP awards
export const XP_AWARDS = {
  LESSON_COMPLETE: 20,
  CHECKIN_POSITIVE: 15,
  CHECKIN_NEGATIVE: 5,
  DAILY_CHECKIN: 5,
  STREAK_7: 50,
  STREAK_30: 150,
  STREAK_100: 500,
  LEVEL_UP: 100,
} as const;

// Rex AI Coach types

export interface RexCheckInParams {
  userId: string
  challengeCompleted: boolean
  challengeText: string
  streakDays: number
  pillar: string
  recentHistory?: string[]
}

export interface RexWeeklySummaryParams {
  userId: string
  lessonsCompleted: number
  challengesCompleted: number
  streakDays: number
  xpEarned: number
  strongestPillar: string
  weakestPillar: string
  previousWeekLessons: number
}

export interface RexStreakWarningParams {
  userId: string
  streakDays: number
  hoursLeft: number
  lastChallenge: string
}

export interface RexCacheEntry {
  cacheKey: string
  response: string
  createdAt: string
}

export interface AiUsageRecord {
  id: string
  userId: string
  date: string
  count: number
}

export interface AiCostRecord {
  id: string
  date: string
  calls: number
  estimatedCostEur: number
}

export interface WeeklySummaryRecord {
  id: string
  userId: string
  weekStart: string
  summaryText: string
  pushSent: boolean
  createdAt: string
}

// ============================================================
// GROWTHOVO Features V3 — New Types
// ============================================================

export interface QuizAnswer {
  text: string;
  pillar: PillarKey;
}

export interface QuizQuestion {
  emoji: string;
  text: string;
  answers: QuizAnswer[];
}

export interface WidgetData {
  streak: number;
  xp: number;
  hearts: number;
  challengeTitle: string;
  leaguePosition: number;
  primaryPillar: PillarKey;
  rexDailyLine: string;
  updatedAt: string; // ISO timestamp
}

export interface TimeCapsule {
  id: string;
  userId: string;
  videoUrl: string;
  promise1: string;
  promise2: string;
  promise3: string;
  primaryPillar: PillarKey;
  quizScores: Record<PillarKey, number>;
  startingXp: number;
  createdAt: string;
  unlockedAt?: string;
}

export interface CapsuleStatsSnapshot {
  date: string;
  primaryPillar: PillarKey;
  quizScores: Record<PillarKey, number>;
  startingXp: number;
}

export type WrappedPeriod = string; // "2025-01" for monthly or "2025" for yearly

export interface WrappedData {
  totalLessons: number;
  totalChallenges: number;
  longestStreak: number;
  totalXp: number;
  mostActiveDayOfWeek: string;
  mostActiveTimeOfDay: string;
  strongestPillar: PillarKey;
  weakestPillar: PillarKey;
  totalMinutesInApp: number;
  leaguePromotions: number;
  friendsInvited: number;
  globalPercentileRank: number; // 0–100, lower = better rank
}

export interface WrappedSummary {
  id: string;
  userId: string;
  period: WrappedPeriod;
  dataJson: WrappedData;
  rexVerdict: string;
  createdAt: string;
}

export interface ComebackChallenge {
  id: string;
  userId: string;
  challengeId: string;
  expiresAt: string;
  completed: boolean;
  proofUrl?: string;
  streakRestoredTo?: number;
  createdAt: string;
}

export const FREEZE_COST_XP = 500;
export const MAX_FREEZES = 3;

// ============================================================
// GROWTHOVO Daily OS — New Types
// ============================================================

export type MentalState = 'anxious' | 'low' | 'neutral' | 'good' | 'locked_in';
export type SOSType = 'anxiety_spike' | 'about_to_react' | 'zero_motivation' | 'hard_conversation' | 'habit_urge' | 'overwhelmed';
export type SOSOutcome = 'started' | 'completed' | 'abandoned' | 'success';
export type MemoryType = 'goal' | 'struggle' | 'win' | 'pattern' | 'promise' | 'person';
export type MessageType = 'quick_reply' | 'comeback' | 'custom';
export type Q1Answer = 'yes_crushed_it' | 'partially' | 'no_didnt_happen';

export interface DailyCheckin { id: string; userId: string; date: string; morningState: MentalState; morningRexResponse: string; briefingViewedAt: string | null; }
export interface EveningDebrief { id: string; userId: string; date: string; q1Answer: Q1Answer; q1Detail: string; q2Obstacle: string; q3Note: string | null; rexVerdict: string; xpEarned: number; }
export interface SOSEvent { id: string; userId: string; type: SOSType; timestamp: string; durationSeconds: number; outcome: SOSOutcome; notes: string | null; }
export interface RexMemory { id: string; userId: string; memoryType: MemoryType; content: string; importanceScore: number; createdAt: string; lastReferencedAt: string; }
export interface AccountabilityPair { id: string; userId: string; partnerId: string; pillar: string; active: boolean; createdAt: string; }
export interface PartnerMessage { id: string; pairId: string; senderId: string; message: string; messageType: MessageType; createdAt: string; }
export interface WeeklyRexReport { id: string; userId: string; weekStart: string; numbersJson: WeeklyReportNumbers; patternAnalysis: string; verdictText: string; audioUrl: string | null; nextWeekFocusJson: NextWeekFocus; createdAt: string; }
export interface WeeklyReportNumbers { lessonsCompleted: number; challengesDone: number; challengesMissed: number; sosByType: Record<SOSType, number>; morningCheckinStreak: number; eveningDebriefRate: number; xpEarned: number; }
export interface NextWeekFocus { pillar: string; habit: string; challengeToDoDifferently: string; }
export interface MorningBriefingData { rexDailyTruth: string; todaysFocus: string; streakCount: number; heartsRemaining: number; leaguePosition: number; leaguePositionDelta: number; streakMilestone: number | null; partnerStatus: PartnerStatus | null; }
export interface PartnerStatus { partnerName: string; checkedIn: boolean; partnerStreak: number; }
export interface ChatMessage { id: string; role: 'user' | 'rex'; content: string; timestamp: string; }
export interface MemoryContext { memories: RexMemory[]; formattedForPrompt: string; }
export interface HardConvPrep { openingLine: string; thingsToAvoid: string[]; targetOutcome: string; }
export interface OverwhelmedResponse { topPriority: string; thingsToIgnore: string[]; resetSentence: string; }
export interface PartnerWeekStats { userId: string; name: string; challengesCompleted: number; currentStreak: number; sosEventsCount: number; }
export interface PartnerComparisonReport { weekStart: string; userStats: PartnerWeekStats; partnerStats: PartnerWeekStats; winnerId: string; notificationText: string; }
export interface ChatSession { sessionId: string; userId: string; messages: ChatMessage[]; startedAt: string; }
export interface DebriefFlowState { q1Answer: Q1Answer | null; q1Detail: string; q2Obstacle: string; q3Note: string; q2Insight: string | null; rexVerdict: string | null; }

// ============================================================
// Public Speaking Trainer — New Types
// ============================================================

export type SpeakingLevel = 1 | 2 | 3 | 4 | 5;

export interface FillerPosition {
  word: string;
  startTime: number;
  endTime: number;
  charOffset: number;
}

export interface SpeechSession {
  id: string;
  userId: string;
  sessionNumber: number;
  level: SpeakingLevel;
  topic: string;
  durationSeconds: number;
  audioUrl?: string;
  transcript: string;
  fillerWords: Record<string, number>;
  fillerPositions: FillerPosition[];
  fillersPerMinute: number;
  paceWpm: number;
  languageStrength: number;
  confidenceScore: number;
  structureScore: number;
  openingStrength: number;
  closingStrength: number;
  silenceGaps: number;
  anxiousPauses: number;
  purposefulPauses: number;
  weakLanguageExamples: string[];
  strongLanguageExamples: string[];
  biggestWin?: string;
  biggestFix?: string;
  openingAnalysis?: string;
  closingAnalysis?: string;
  comparedToLastSession?: string;
  rexVerdict?: string;
  rexAudioUrl?: string;
  tomorrowFocus?: string;
  createdAt: string;
}

export interface SpeechProgress {
  userId: string;
  totalSessions: number;
  currentLevel: SpeakingLevel;
  avgConfidenceLast7: number;
  avgFillersLast7: number;
  avgPaceLast7: number;
  sessionsThisWeek: number;
  personalBestConfidence: number;
  personalBestOpening: number;
  personalBestClosing: number;
  levelUnlockDates: Record<string, string>;
  milestonesTriggered: string[];
  updatedAt: string;
}

export interface MilestoneAlert {
  type: 'session_count' | 'confidence_threshold';
  message: string;
  hasAudio: boolean;
  audioUrl?: string;
}

export interface WeeklyChallenge {
  id: string;
  weekNumber: number;
  prompt: string;
  xpBonus: number;
}

export interface SpeechAnalysisResult {
  sessionId: string;
  confidenceScore: number;
  languageStrength: number;
  fillersPerMinute: number;
  fillerWords: Record<string, number>;
  fillerPositions: FillerPosition[];
  paceWpm: number;
  paceScore: number;
  structureScore: number;
  openingStrength: number;
  closingStrength: number;
  anxiousPauses: number;
  purposefulPauses: number;
  weakLanguageExamples: string[];
  strongLanguageExamples: string[];
  biggestWin: string;
  biggestFix: string;
  openingAnalysis: string;
  closingAnalysis: string;
  comparedToLastSession: string;
  rexVerdict: string;
  rexAudioUrl: string;
  tomorrowFocus: string;
  transcript: string;
  sessionNumber: number;
}

export const SPEAKING_LEVEL_CONFIG: Record<SpeakingLevel, {
  maxDurationSeconds: number;
  label: string;
  unlockSessions: number;
  unlockAvgConfidence: number;
}> = {
  1: { maxDurationSeconds: 30,  label: 'Beginner',     unlockSessions: 0,  unlockAvgConfidence: 0  },
  2: { maxDurationSeconds: 60,  label: 'Intermediate', unlockSessions: 5,  unlockAvgConfidence: 45 },
  3: { maxDurationSeconds: 120, label: 'Advanced',     unlockSessions: 15, unlockAvgConfidence: 58 },
  4: { maxDurationSeconds: 180, label: 'Expert',       unlockSessions: 30, unlockAvgConfidence: 70 },
  5: { maxDurationSeconds: 300, label: 'Master',       unlockSessions: 60, unlockAvgConfidence: 82 },
};

// ============================================================
// Legal Compliance — New Types
// ============================================================

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

export interface LegalDocumentVersion {
  id: string;
  document_type: string;
  version: string;
  effective_date: string;
  content: string;
  language: string;
  is_current: boolean;
  change_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrivacyPreferences {
  user_id: string;
  analytics_enabled: boolean;
  marketing_emails_enabled: boolean;
  data_sharing_consent: boolean;
  last_updated: string;
  created_at: string;
}
