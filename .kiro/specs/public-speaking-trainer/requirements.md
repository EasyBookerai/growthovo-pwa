# Requirements Document

## Introduction

The Public Speaking Trainer is a practice-based feature within the GROWTHOVO app that records users speaking on prompted topics, transcribes the audio via Whisper, analyzes the transcript with GPT-4o-mini, and returns 8 measurable confidence metrics with Rex's voice verdict. Every session is stored. Every metric is tracked over time. Users see a line going up — that line is proof they are improving. The feature is gated by subscription tier, integrates with the existing XP, streak, notification, and Rex memory systems, and uses the established Edge Function pattern for all AI calls.

## Glossary

- **Speech_Session**: A single recorded speaking attempt, including audio, transcript, all 8 metrics, and Rex's analysis.
- **Confidence_Score**: The composite 0–100 headline metric calculated from the other 7 metrics.
- **Language_Strength**: A 0–100 score measuring assertive vs. hedging language patterns in the transcript.
- **Filler_Word**: A spoken word or phrase that adds no meaning (um, uh, like, you know, basically, etc.).
- **Fillers_Per_Minute**: Total filler word count divided by session duration in minutes.
- **Pace_WPM**: Words per minute calculated from total word count and session duration.
- **Silence_Gap**: A pause between words longer than 1.5 seconds, classified as purposeful or anxious.
- **Structure_Score**: A 0–100 score measuring whether the speech has a clear opening, body, and close.
- **Opening_Strength**: A 0–100 score for the first 15 seconds of the speech.
- **Closing_Strength**: A 0–100 score for the last 15 seconds of the speech.
- **Rex**: The AI coach persona used throughout GROWTHOVO, delivering brutally honest, specific feedback.
- **Rex_Verdict**: A 2-sentence audio + text summary delivered by Rex after each session.
- **Speaking_Level**: One of 5 tiers (Beginner through Master) that gate topic difficulty and session duration.
- **Whisper**: OpenAI's whisper-1 transcription model, called via Supabase Edge Function.
- **Analyze_Speech**: The Supabase Edge Function that orchestrates Whisper transcription, GPT-4o-mini analysis, and TTS generation.
- **Speech_Progress**: The aggregate table tracking personal bests, level, and rolling averages per user.
- **Weekly_Challenge**: A special Monday-drop speaking challenge with bonus XP.
- **Filler_Heatmap**: The transcript display with every filler word highlighted in red.
- **Free_Tier**: Users with `subscriptionStatus = 'free'` or `'canceled'`.
- **Premium_Tier**: Users with `subscriptionStatus = 'active'` or `'trialing'`.

---

## Requirements

### Requirement 1: Audio Recording

**User Story:** As a user, I want to record myself speaking on a prompted topic, so that I can practice public speaking and receive measurable feedback.

#### Acceptance Criteria

1. WHEN a user starts a session, THE Speech_Session SHALL display the topic prompt and a countdown timer matching the level's maximum duration.
2. WHEN a user taps the record button, THE Recorder SHALL begin capturing audio using expo-av and display a live waveform animation.
3. WHILE recording is active, THE Recorder SHALL display elapsed time and remaining time in real time.
4. WHEN a user taps stop or the maximum duration is reached, THE Recorder SHALL stop capturing audio and save the audio file to Supabase Storage.
5. IF the recorded audio is shorter than 5 seconds, THEN THE Recorder SHALL reject the recording and display an error message prompting the user to try again.
6. IF microphone permission is denied, THEN THE Recorder SHALL display a permission error and a link to device settings.
7. THE Recorder SHALL support audio recording in the user's device language setting for Whisper's `language` parameter.

---

### Requirement 2: Whisper Transcription

**User Story:** As a user, I want my speech automatically transcribed with word-level timestamps, so that the system can calculate precise metrics.

#### Acceptance Criteria

1. WHEN audio recording is saved, THE Analyze_Speech Edge Function SHALL call the OpenAI Whisper API (`whisper-1`, `verbose_json`) with the audio file and the user's language code.
2. THE Analyze_Speech Edge Function SHALL extract from the Whisper response: `text` (full transcript), `words` array (each with `word`, `start`, `end`), and `duration`.
3. WHEN Whisper returns a response, THE Analyze_Speech Edge Function SHALL calculate total word count from the `words` array length.
4. WHEN Whisper returns a response, THE Analyze_Speech Edge Function SHALL identify all silence gaps where the interval between `words[i].end` and `words[i+1].start` exceeds 1.5 seconds.
5. IF the Whisper API call fails or times out, THEN THE Analyze_Speech Edge Function SHALL return an error response and THE App SHALL display a retry option to the user.
6. THE Analyze_Speech Edge Function SHALL log the Whisper cost (€0.006 per minute of audio) to the existing `ai_costs` table.

---

### Requirement 3: Metric Calculation — Pace

**User Story:** As a user, I want to know my speaking pace in words per minute, so that I can identify if I speak too fast or too slow.

#### Acceptance Criteria

1. WHEN Whisper returns word timestamps, THE Analyze_Speech Edge Function SHALL calculate `pace_wpm` as `total_words ÷ (duration_seconds ÷ 60)`, rounded to the nearest integer.
2. THE Analyze_Speech Edge Function SHALL calculate `pace_score` as 100 when `pace_wpm` is between 130 and 160 inclusive.
3. WHEN `pace_wpm` exceeds 160, THE Analyze_Speech Edge Function SHALL calculate `pace_score` by reducing proportionally from 100, reaching 0 at 220 WPM.
4. WHEN `pace_wpm` is below 130, THE Analyze_Speech Edge Function SHALL calculate `pace_score` by reducing proportionally from 100, reaching 0 at 70 WPM.
5. THE Analyze_Speech Edge Function SHALL clamp `pace_score` to the range [0, 100].

---

### Requirement 4: Metric Calculation — Filler Words

**User Story:** As a user, I want to see exactly which filler words I use and how often, so that I can consciously reduce them.

#### Acceptance Criteria

1. WHEN Whisper returns the transcript, THE Analyze_Speech Edge Function SHALL scan the `words` array for all filler words across four categories: hesitation fillers (um, uh, er, hmm), social fillers (like, you know, right, okay), padding fillers (basically, literally, actually, honestly), and connector fillers (so, and so, but so, and then).
2. THE Analyze_Speech Edge Function SHALL store filler word counts as a JSON object keyed by filler word (e.g., `{"um": 3, "like": 7}`).
3. THE Analyze_Speech Edge Function SHALL calculate `fillers_per_minute` as `total_filler_count ÷ (duration_seconds ÷ 60)`, rounded to one decimal place.
4. THE Analyze_Speech Edge Function SHALL store the word-level position of each filler word to enable transcript highlighting.
5. THE Filler_Heatmap SHALL display the full transcript with every filler word highlighted in red.
6. WHEN a user taps a highlighted filler word in the Filler_Heatmap, THE App SHALL display the filler type and total count for that word.

---

### Requirement 5: Metric Calculation — Language Strength

**User Story:** As a user, I want to know how assertive my language is, so that I can replace hedging phrases with confident statements.

#### Acceptance Criteria

1. WHEN the transcript is available, THE Analyze_Speech Edge Function SHALL send it to GPT-4o-mini to identify weak language signals (hedging, apologetic, trailing, passive voice) and strong language signals (direct statements, active voice, concrete specifics, commanding openers).
2. THE Analyze_Speech Edge Function SHALL calculate `language_strength` starting from a base of 50, subtracting 3 points per weak language occurrence and adding 3 points per strong language occurrence.
3. THE Analyze_Speech Edge Function SHALL clamp `language_strength` to the range [0, 100].
4. THE Analyze_Speech Edge Function SHALL return `weak_language_examples` (up to 3 exact quotes from the transcript) and `strong_language_examples` (up to 3 exact quotes from the transcript).
5. THE Feedback_Screen SHALL display weak and strong language examples in two columns with exact quotes from the transcript.

---

### Requirement 6: Metric Calculation — Silence Gaps

**User Story:** As a user, I want to understand my pauses, so that I can distinguish purposeful pauses from anxious hesitations.

#### Acceptance Criteria

1. WHEN silence gaps are identified from word timestamps, THE Analyze_Speech Edge Function SHALL send gap positions and surrounding transcript context to GPT-4o-mini to classify each gap as purposeful or anxious.
2. THE Analyze_Speech Edge Function SHALL store `anxious_pauses` count and `purposeful_pauses` count separately.
3. THE Analyze_Speech Edge Function SHALL calculate a silence gap score as `100 - (anxious_pauses × 10)`, clamped to [0, 100].

---

### Requirement 7: Metric Calculation — Structure, Opening, and Closing

**User Story:** As a user, I want to know if my speech has a clear structure and strong opening and closing, so that I can build more compelling presentations.

#### Acceptance Criteria

1. WHEN the transcript is available, THE Analyze_Speech Edge Function SHALL send the full transcript with duration to GPT-4o-mini to evaluate structure: opening hook (first 10% of speech, 0–33 points), body with clear points (middle 70%, 0–34 points), and strong close (last 20%, 0–33 points).
2. THE Analyze_Speech Edge Function SHALL extract the first 15 seconds of words (using timestamps) and send them to GPT-4o-mini to score `opening_strength` (0–100) based on confidence, hook quality, and clarity of point.
3. THE Analyze_Speech Edge Function SHALL extract the last 15 seconds of words (using timestamps) and send them to GPT-4o-mini to score `closing_strength` (0–100) based on landing strength, statement finality, and audience clarity.
4. THE Analyze_Speech Edge Function SHALL return `opening_analysis` and `closing_analysis` as single-sentence text descriptions.

---

### Requirement 8: Confidence Score Composite

**User Story:** As a user, I want a single headline confidence score, so that I can track my overall improvement at a glance.

#### Acceptance Criteria

1. WHEN all component metrics are calculated, THE Analyze_Speech Edge Function SHALL calculate `confidence_score` using the formula: `(language_strength × 0.30) + (filler_free_rate × 0.20) + (pace_score × 0.15) + (opening_strength × 0.15) + (closing_strength × 0.10) + (structure_score × 0.10)`.
2. THE Analyze_Speech Edge Function SHALL calculate `filler_free_rate` as `max(0, 100 - (fillers_per_minute × 12.5))`, clamped to [0, 100].
3. THE Analyze_Speech Edge Function SHALL clamp `confidence_score` to the range [0, 100] and round to the nearest integer.
4. THE Feedback_Screen SHALL display `confidence_score` as a large animated counter counting up to the score value.
5. THE Feedback_Screen SHALL color the confidence score: red (0–40), orange (40–60), yellow (60–75), green (75–90), gold (90–100).
6. THE Feedback_Screen SHALL display the trend vs. the user's previous session confidence score.

---

### Requirement 9: Rex Analysis and Voice Verdict

**User Story:** As a user, I want to hear Rex's honest verdict on my session, so that I receive specific, actionable coaching feedback.

#### Acceptance Criteria

1. WHEN all metrics are calculated, THE Analyze_Speech Edge Function SHALL call GPT-4o-mini with the transcript, word timestamps, duration, level, topic, session number, last 3 sessions summary, and user's known struggles from `rexMemoryService`.
2. THE Analyze_Speech Edge Function SHALL use the Rex system prompt: "You are Rex, brutally honest AI coach in GROWTHOVO. Analyze speech transcripts with precision. Return ONLY valid JSON. No explanation. No markdown. Be specific — reference actual words from the transcript. Never be generic."
3. THE Analyze_Speech Edge Function SHALL request GPT-4o-mini to return JSON containing: `language_strength`, `filler_free_rate`, `structure_score`, `opening_strength`, `closing_strength`, `silence_gap_score`, `weak_language_examples`, `strong_language_examples`, `biggest_win`, `biggest_fix`, `opening_analysis`, `closing_analysis`, `compared_to_last_session`, `rex_verdict` (2 sentences max), and `tomorrow_focus`.
4. THE Analyze_Speech Edge Function SHALL use max_tokens: 600 and temperature: 0.2 for the GPT-4o-mini analysis call.
5. WHEN GPT-4o-mini returns the analysis, THE Analyze_Speech Edge Function SHALL call the OpenAI TTS API (`tts-1-hd`, voice: `onyx`) with the `rex_verdict` text (max 200 characters).
6. THE Analyze_Speech Edge Function SHALL store the TTS audio file in Supabase Storage and save the URL as `rex_audio_url`.
7. WHEN the Feedback_Screen loads, THE App SHALL auto-play the Rex verdict audio immediately.
8. THE Feedback_Screen SHALL display the `rex_verdict` text simultaneously with audio playback.
9. THE Analyze_Speech Edge Function SHALL cache GPT-4o-mini analysis results by transcript hash to reduce costs (expected 25% cache hit rate).
10. THE Analyze_Speech Edge Function SHALL cache TTS audio by verdict text hash (expected 30% cache hit rate).
11. THE Analyze_Speech Edge Function SHALL log all AI costs (GPT-4o-mini ~€0.003, TTS ~€0.003) to the existing `ai_costs` table.

---

### Requirement 10: Feedback Screen Display

**User Story:** As a user, I want to see a comprehensive breakdown of my session results, so that I understand exactly what to improve.

#### Acceptance Criteria

1. WHILE the Analyze_Speech Edge Function is processing, THE App SHALL display a loading state with the text "Rex is listening..." and a waveform animation.
2. THE Feedback_Screen SHALL display 8 metric cards, each showing: metric name, score or value, trend arrow vs. session average, and a one-word status (STRONG / GOOD / NEEDS WORK / WEAK).
3. THE Feedback_Screen SHALL animate metric cards in one by one with a 150ms delay between each card using react-native-reanimated.
4. THE Feedback_Screen SHALL display the Filler_Heatmap with the full transcript and all filler words highlighted in red.
5. THE Feedback_Screen SHALL display the Language Analysis section with up to 3 strong language quotes (green) and up to 3 weak language quotes (red).
6. THE Feedback_Screen SHALL display Opening_Strength and Closing_Strength as two side-by-side score cards with one-sentence analysis each.
7. THE Feedback_Screen SHALL display "The One Fix" as a large prominent card showing `tomorrow_focus` — one specific improvement for the next session.
8. THE Feedback_Screen SHALL display a "Go again — apply the fix" button that starts a new session on the same topic.
9. WHEN a user taps "Go again", THE App SHALL show a side-by-side score comparison after the retry session completes.

---

### Requirement 11: Session Storage

**User Story:** As a user, I want all my session data stored permanently, so that I can review past sessions and track my progress over time.

#### Acceptance Criteria

1. WHEN a session analysis is complete, THE Analyze_Speech Edge Function SHALL insert a row into `speech_sessions` with all 8 metric values, transcript, filler JSON, Rex verdict, Rex audio URL, and all analysis fields.
2. THE Analyze_Speech Edge Function SHALL increment `speech_progress.total_sessions` and update rolling averages (`avg_confidence_last_7`, `avg_fillers_last_7`, `avg_pace_last_7`) using the last 7 sessions.
3. THE Analyze_Speech Edge Function SHALL update `speech_progress.personal_best_confidence`, `personal_best_opening`, and `personal_best_closing` if the current session exceeds the stored personal best.
4. THE App SHALL display a scrollable session history list where each row shows: date, topic, level, confidence score, and trend indicator.
5. WHEN a user taps a session history row, THE App SHALL display the full analysis from that session.

---

### Requirement 12: Progress Dashboard

**User Story:** As a user, I want to see my progress over time through charts, so that I can see the line going up and stay motivated.

#### Acceptance Criteria

1. THE Progress_Dashboard SHALL display a line chart of `confidence_score` over all sessions, colored green if trending up and red if trending down.
2. THE Progress_Dashboard SHALL display a line chart of `fillers_per_minute` over all sessions, with the target zone (under 3/min) highlighted.
3. THE Progress_Dashboard SHALL display a line chart of `pace_wpm` over all sessions, with the optimal range (130–160 WPM) highlighted.
4. THE Progress_Dashboard SHALL display a radar (spider) chart showing all 8 metrics for: current session, personal best session, and first session — three lines on the same chart.
5. THE Progress_Dashboard SHALL display a bar chart of weekly session count.
6. THE Progress_Dashboard SHALL display a Personal Bests table showing: best confidence score, lowest fillers/min, best opening score, and best closing score.
7. THE Progress_Dashboard SHALL be accessible from the user's profile screen.

---

### Requirement 13: Level Progression

**User Story:** As a user, I want to unlock harder speaking levels as I improve, so that I am always challenged at the right difficulty.

#### Acceptance Criteria

1. THE App SHALL provide 5 speaking levels: Level 1 (Beginner, 30s, personal/safe topics), Level 2 (Intermediate, 60s, opinions/mild pressure), Level 3 (Advanced, 2 min, structured argument), Level 4 (Expert, 3 min, real-world/high-pressure), Level 5 (Master, 5 min, full presentations/investor pitches/TED-style).
2. THE App SHALL unlock Level 1 by default for all users.
3. WHEN a user completes 5 sessions with an average confidence score above 45, THE App SHALL unlock Level 2.
4. WHEN a user completes 15 sessions with an average confidence score above 58, THE App SHALL unlock Level 3.
5. WHEN a user completes 30 sessions with an average confidence score above 70, THE App SHALL unlock Level 4.
6. WHEN a user completes 60 sessions with an average confidence score above 82, THE App SHALL unlock Level 5.
7. WHEN a level is unlocked, THE App SHALL play a Rex voice message (tts-1-hd, onyx) celebrating the unlock with specific journey data (sessions completed, average score).
8. THE App SHALL store level unlock dates in `speech_progress.level_unlock_dates`.

---

### Requirement 14: Milestone Alerts

**User Story:** As a user, I want to receive milestone alerts at key session counts and confidence thresholds, so that I feel recognized for my progress.

#### Acceptance Criteria

1. WHEN a user completes session 1, THE App SHALL display the message: "First session done. The bar is set."
2. WHEN a user completes session 5, THE App SHALL display the message: "5 sessions. Most people quit after 2."
3. WHEN a user completes session 10, THE App SHALL display the message: "10 sessions. Your confidence score is [X] vs [Y] when you started."
4. WHEN a user completes session 25, THE App SHALL display the message: "25 sessions. You've spoken for [total minutes] minutes. That's real practice."
5. WHEN a user completes session 50, THE App SHALL play a Rex voice message reviewing the user's full journey.
6. WHEN a user completes session 100, THE App SHALL award a profile badge and display a shareable card.
7. WHEN a user's confidence score reaches 50 for the first time, THE App SHALL display: "You crossed 50. Halfway to elite."
8. WHEN a user's confidence score reaches 75 for the first time, THE App SHALL display: "75 is where people start noticing a difference in you. Keep going."
9. WHEN a user's confidence score reaches 90 for the first time, THE App SHALL display: "90. Rex doesn't say this often: impressive."
10. THE App SHALL track which milestones have been triggered to prevent duplicate alerts.

---

### Requirement 15: Weekly Speaking Challenge

**User Story:** As a user, I want a weekly speaking challenge every Monday, so that I have a structured goal that pushes me beyond my comfort zone.

#### Acceptance Criteria

1. WHEN a new week begins (Monday), THE App SHALL make a weekly speaking challenge available in the morning briefing.
2. THE Weekly_Challenge SHALL be harder than a standard session for the user's current level.
3. THE App SHALL provide at least 5 weeks of pre-defined challenge prompts, escalating in difficulty.
4. WHEN a user completes the Weekly_Challenge, THE App SHALL award 100 XP bonus using the existing `progressService.awardXP` function.
5. WHEN a user completes the Weekly_Challenge, THE App SHALL display a Rex reaction specific to the challenge.
6. THE Weekly_Challenge SHALL be available to Premium_Tier users only.

---

### Requirement 16: Subscription Tier Gating

**User Story:** As a user on the free tier, I want to see what the feature offers, so that I understand the value of upgrading to premium.

#### Acceptance Criteria

1. THE Free_Tier SHALL allow a maximum of 1 speech session per day.
2. THE Free_Tier SHALL provide Whisper transcription, filler word count, and pace calculation only.
3. THE Free_Tier SHALL display blurred metric cards for GPT-4o-mini analysis results with an "Unlock with Premium" overlay.
4. THE Free_Tier SHALL NOT provide Rex voice verdict, progress charts, level progression, or weekly challenges.
5. THE Premium_Tier SHALL provide unlimited sessions per day.
6. THE Premium_Tier SHALL provide all 8 metrics with full GPT-4o-mini analysis, Rex voice verdict, all progress charts, level progression, and weekly challenges.
7. WHEN a Free_Tier user attempts to access a premium feature, THE App SHALL navigate to the existing PaywallScreen.

---

### Requirement 17: XP and Streak Integration

**User Story:** As a user, I want completing speaking sessions to count toward my XP and streak, so that the feature integrates with my overall GROWTHOVO progress.

#### Acceptance Criteria

1. WHEN a user completes a speech session, THE App SHALL award XP using the existing `progressService.awardXP` function with source `'speaking_session'`.
2. THE App SHALL award 30 XP for a standard session completion.
3. THE App SHALL award 100 XP for completing the Weekly_Challenge.
4. WHEN a user completes a speech session, THE App SHALL update the streak using the existing `streakService`.
5. THE Analyze_Speech Edge Function SHALL store a memory in `rexMemoryService` summarizing the session's biggest win and biggest fix for future Rex context.

---

### Requirement 18: Cost Controls and Caching

**User Story:** As a system operator, I want AI costs to be controlled and tracked, so that the feature remains economically viable.

#### Acceptance Criteria

1. THE Analyze_Speech Edge Function SHALL cache GPT-4o-mini analysis results keyed by SHA-256 hash of the transcript text.
2. THE Analyze_Speech Edge Function SHALL cache TTS audio keyed by SHA-256 hash of the `rex_verdict` text.
3. WHEN a cached result is available, THE Analyze_Speech Edge Function SHALL return the cached result without calling the OpenAI API.
4. THE Analyze_Speech Edge Function SHALL log every AI API call cost to the existing `ai_costs` table using the existing `increment_ai_costs` RPC.
5. THE Analyze_Speech Edge Function SHALL log every AI API call to the existing `ai_usage` table using the existing `increment_ai_usage` RPC.
6. THE Free_Tier SHALL NOT trigger GPT-4o-mini or TTS API calls.
7. THE total estimated cost per Premium session SHALL be approximately €0.012 (Whisper €0.006 + GPT-4o-mini €0.003 + TTS €0.003).
