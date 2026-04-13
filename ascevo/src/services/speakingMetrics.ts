import { FillerPosition, SpeakingLevel, MilestoneAlert, SPEAKING_LEVEL_CONFIG } from '../types/index';

export interface WhisperWord {
  word: string;
  start: number;
  end: number;
}

export interface SilenceGap {
  start: number;
  end: number;
  duration: number;
  type: 'anxious' | 'purposeful';
}

// Filler word categories
const FILLER_CATEGORIES: Record<string, string[]> = {
  hesitation: ['um', 'uh', 'er', 'hmm'],
  social: ['like', 'you know', 'right', 'okay'],
  padding: ['basically', 'literally', 'actually', 'honestly'],
  connector: ['so', 'and so', 'but so', 'and then'],
};

// All multi-word fillers (sorted longest first for greedy matching)
const MULTI_WORD_FILLERS = Object.values(FILLER_CATEGORIES)
  .flat()
  .filter((f) => f.includes(' '))
  .sort((a, b) => b.split(' ').length - a.split(' ').length);

// All single-word fillers
const SINGLE_WORD_FILLERS = Object.values(FILLER_CATEGORIES)
  .flat()
  .filter((f) => !f.includes(' '));

/**
 * Pace score: 100 in [130, 160], linear decay outside, clamped [0, 100]
 * Reaches 0 at 220 WPM (above) or 70 WPM (below)
 */
export function calculatePaceScore(wpm: number): number {
  if (wpm >= 130 && wpm <= 160) return 100;
  if (wpm > 160) return Math.max(0, 100 - ((wpm - 160) / 60) * 100);
  return Math.max(0, 100 - ((130 - wpm) / 60) * 100);
}

/**
 * Filler-free rate: clamp(100 - fpm * 12.5, 0, 100)
 */
export function calculateFillerFreeRate(fillersPerMinute: number): number {
  return Math.max(0, Math.min(100, 100 - fillersPerMinute * 12.5));
}

/**
 * Language strength: clamp(50 - weakCount * 3 + strongCount * 3, 0, 100)
 */
export function calculateLanguageStrength(weakCount: number, strongCount: number): number {
  return Math.max(0, Math.min(100, 50 - weakCount * 3 + strongCount * 3));
}

/**
 * Silence gap score: clamp(100 - anxiousPauses * 10, 0, 100)
 */
export function calculateSilenceGapScore(anxiousPauses: number): number {
  return Math.max(0, Math.min(100, 100 - anxiousPauses * 10));
}

/**
 * Composite confidence score (weighted formula, rounded, clamped [0, 100])
 * Weights: language_strength 0.30, filler_free_rate 0.20, pace_score 0.15,
 *          opening_strength 0.15, closing_strength 0.10, structure_score 0.10
 */
export function calculateConfidenceScore(components: {
  languageStrength: number;
  fillerFreeRate: number;
  paceScore: number;
  openingStrength: number;
  closingStrength: number;
  structureScore: number;
}): number {
  const raw =
    components.languageStrength * 0.30 +
    components.fillerFreeRate   * 0.20 +
    components.paceScore        * 0.15 +
    components.openingStrength  * 0.15 +
    components.closingStrength  * 0.10 +
    components.structureScore   * 0.10;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Color for confidence score:
 *   red   (0–40)
 *   orange(40–60)
 *   yellow(60–75)
 *   green (75–90)
 *   gold  (90–100)
 */
export function getConfidenceColor(score: number): string {
  if (score < 40) return '#EF4444'; // red
  if (score < 60) return '#F97316'; // orange
  if (score < 75) return '#EAB308'; // yellow
  if (score < 90) return '#22C55E'; // green
  return '#F59E0B';                 // gold
}

/**
 * Status label: STRONG(>=75), GOOD(>=55), NEEDS WORK(>=35), WEAK(<35)
 */
export function getMetricStatus(score: number): 'STRONG' | 'GOOD' | 'NEEDS WORK' | 'WEAK' {
  if (score >= 75) return 'STRONG';
  if (score >= 55) return 'GOOD';
  if (score >= 35) return 'NEEDS WORK';
  return 'WEAK';
}

/**
 * Detect filler words from a words array (case-insensitive).
 * Handles multi-word fillers by checking consecutive words.
 * Returns filler word counts and positions (with charOffset into transcript).
 */
export function detectFillers(words: WhisperWord[]): {
  fillerWords: Record<string, number>;
  fillerPositions: FillerPosition[];
} {
  const fillerWords: Record<string, number> = {};
  const fillerPositions: FillerPosition[] = [];

  // Build transcript text for charOffset calculation
  const transcriptText = words.map((w) => w.word).join(' ');

  // Track which word indices have been consumed by a multi-word filler
  const consumed = new Set<number>();

  for (let i = 0; i < words.length; i++) {
    if (consumed.has(i)) continue;

    let matched = false;

    // Try multi-word fillers first (greedy, longest first)
    for (const filler of MULTI_WORD_FILLERS) {
      const parts = filler.split(' ');
      if (i + parts.length > words.length) continue;

      const windowWords = words.slice(i, i + parts.length).map((w) => w.word.toLowerCase());
      if (windowWords.join(' ') === filler) {
        // Calculate charOffset: sum of lengths of preceding words + spaces
        const charOffset = words
          .slice(0, i)
          .reduce((acc, w) => acc + w.word.length + 1, 0);

        fillerWords[filler] = (fillerWords[filler] ?? 0) + 1;
        fillerPositions.push({
          word: filler,
          startTime: words[i].start,
          endTime: words[i + parts.length - 1].end,
          charOffset,
        });

        for (let k = i; k < i + parts.length; k++) consumed.add(k);
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // Try single-word fillers
    const wordLower = words[i].word.toLowerCase();
    if (SINGLE_WORD_FILLERS.includes(wordLower)) {
      const charOffset = words
        .slice(0, i)
        .reduce((acc, w) => acc + w.word.length + 1, 0);

      fillerWords[wordLower] = (fillerWords[wordLower] ?? 0) + 1;
      fillerPositions.push({
        word: wordLower,
        startTime: words[i].start,
        endTime: words[i].end,
        charOffset,
      });
      consumed.add(i);
    }
  }

  return { fillerWords, fillerPositions };
}

/**
 * Detect silence gaps where the interval between words[i].end and words[i+1].start > threshold.
 * Default threshold: 1.5 seconds.
 * Classification: gaps > 2.5s are 'purposeful', <= 2.5s are 'anxious'.
 */
export function detectSilenceGaps(words: WhisperWord[], threshold = 1.5): SilenceGap[] {
  const gaps: SilenceGap[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const gapStart = words[i].end;
    const gapEnd = words[i + 1].start;
    const duration = gapEnd - gapStart;

    if (duration > threshold) {
      gaps.push({
        start: gapStart,
        end: gapEnd,
        duration,
        type: duration > 2.5 ? 'purposeful' : 'anxious',
      });
    }
  }

  return gaps;
}

/**
 * Extract words from the first `seconds` seconds of speech.
 * Default: 15 seconds.
 */
export function extractOpeningWords(words: WhisperWord[], seconds = 15): WhisperWord[] {
  return words.filter((w) => w.start < seconds);
}

/**
 * Extract words from the last `seconds` seconds of speech.
 * Default: 15 seconds.
 */
export function extractClosingWords(words: WhisperWord[], duration: number, seconds = 15): WhisperWord[] {
  const cutoff = duration - seconds;
  return words.filter((w) => w.start >= cutoff);
}

/**
 * Check if a new speaking level should be unlocked.
 * Returns the new level if unlocked, or currentLevel if not.
 * Checks from highest to lowest so the highest eligible level is returned.
 */
export function checkLevelUnlock(
  totalSessions: number,
  avgConfidenceLast7: number,
  currentLevel: SpeakingLevel
): SpeakingLevel {
  const levels: SpeakingLevel[] = [5, 4, 3, 2];
  for (const level of levels) {
    const config = SPEAKING_LEVEL_CONFIG[level];
    if (
      totalSessions >= config.unlockSessions &&
      avgConfidenceLast7 >= config.unlockAvgConfidence &&
      currentLevel < level
    ) {
      return level;
    }
  }
  return currentLevel;
}

/**
 * Check which milestones should be triggered.
 * Returns array of MilestoneAlert for newly triggered milestones.
 * Milestone keys: 'session_1', 'session_5', 'session_10', 'session_25', 'session_50', 'session_100',
 *                 'confidence_50', 'confidence_75', 'confidence_90'
 */
export function checkMilestones(
  sessionNumber: number,
  confidenceScore: number,
  previousBest: number,
  milestonesTriggered: string[]
): MilestoneAlert[] {
  const alerts: MilestoneAlert[] = [];
  const triggered = new Set(milestonesTriggered);

  // Session count milestones
  const sessionMilestones: Array<{ key: string; count: number; message: string; hasAudio: boolean }> = [
    { key: 'session_1',   count: 1,   message: 'First session done. The bar is set.',                    hasAudio: false },
    { key: 'session_5',   count: 5,   message: '5 sessions. Most people quit after 2.',                  hasAudio: false },
    { key: 'session_10',  count: 10,  message: '10 sessions. Your confidence score is improving.',       hasAudio: false },
    { key: 'session_25',  count: 25,  message: "25 sessions. That's real practice.",                     hasAudio: false },
    { key: 'session_50',  count: 50,  message: '',                                                       hasAudio: true  },
    { key: 'session_100', count: 100, message: '',                                                       hasAudio: true  },
  ];

  for (const milestone of sessionMilestones) {
    if (sessionNumber >= milestone.count && !triggered.has(milestone.key)) {
      alerts.push({
        type: 'session_count',
        message: milestone.message,
        hasAudio: milestone.hasAudio,
      });
    }
  }

  // Confidence threshold milestones (only trigger if previousBest < threshold AND current >= threshold)
  const confidenceMilestones: Array<{ key: string; threshold: number; message: string }> = [
    { key: 'confidence_50', threshold: 50, message: 'You crossed 50. Halfway to elite.' },
    { key: 'confidence_75', threshold: 75, message: '75 is where people start noticing a difference in you. Keep going.' },
    { key: 'confidence_90', threshold: 90, message: "90. Rex doesn't say this often: impressive." },
  ];

  for (const milestone of confidenceMilestones) {
    if (
      previousBest < milestone.threshold &&
      confidenceScore >= milestone.threshold &&
      !triggered.has(milestone.key)
    ) {
      alerts.push({
        type: 'confidence_threshold',
        message: milestone.message,
        hasAudio: false,
      });
    }
  }

  return alerts;
}
