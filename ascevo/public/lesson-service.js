
const STORAGE_KEY = "growthovo_lessons";
const XP_KEY = "growthovo_xp";
const STREAK_KEY = "growthovo_streak";

function getLessonProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : {};
}

function saveLessonProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function updateLessonState(pillar, lessonId, updates) {
  const progress = getLessonProgress();
  if (!progress[pillar]) progress[pillar] = {};
  if (!progress[pillar][lessonId]) {
    progress[pillar][lessonId] = { completed: false, stars: 0, xpEarned: 0 };
  }
  progress[pillar][lessonId] = { ...progress[pillar][lessonId], ...updates };
  saveLessonProgress(progress);
}

function addXP(amount) {
  let currentXP = parseInt(localStorage.getItem(XP_KEY) || "0");
  currentXP += amount;
  localStorage.setItem(XP_KEY, currentXP.toString());
  return currentXP;
}

function getXP() {
  return parseInt(localStorage.getItem(XP_KEY) || "0");
}

function getLessonState(pillar, lessonId) {
  const progress = getLessonProgress();
  return progress[pillar]?.[lessonId] || { completed: false, stars: 0, xpEarned: 0 };
}

function isLessonUnlocked(pillar, lessonIndex) {
  if (lessonIndex === 0) return true;
  const progress = getLessonProgress();
  const pillarProgress = progress[pillar] || {};
  const lessons = allLessons[pillar] || [];
  const prevLesson = lessons[lessonIndex - 1];
  return prevLesson && pillarProgress[prevLesson.id]?.completed;
}

// Mark today as active for streak
function markActiveToday() {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('growthovo_last_active', today);
}
