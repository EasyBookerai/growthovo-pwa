const fs = require('fs');

// Read the SQL file
const sqlContent = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf-8');

// Extract all lesson entries with their challenge cards
// Split by INSERT INTO lessons to get each lesson block
const lessonBlocks = sqlContent.split(/INSERT INTO lessons \(id, unit_id, title, display_order, card_concept, card_example, card_mistake, card_science, card_challenge\) VALUES/);
const lessons = lessonBlocks.slice(1); // Skip the first empty split

console.log(`Found ${lessons.length} lesson blocks\n`);

// Criteria for actionable challenges:
// 1. Immediate trigger ("Right now", "Today", "Next time", "In your next")
// 2. Specific, concrete action with time constraint
// 3. Clear success metric
// 4. Reflection prompt ("Notice what happens", "Notice", "Pay attention")

const immediateTriggersRegex = /\b(Right now|Today|Next time|In your next|This week|Tomorrow|Before|After|When you)\b/i;
const timeConstraintRegex = /\b(\d+\s+(minute|second|hour|day|week)|under \d+|<\d+|less than \d+|for \d+)\b/i;
const reflectionPromptRegex = /\b(Notice|Pay attention|Observe|Watch|See what|Feel how|Track|Write down|Count)\b/i;

let totalLessons = 0;
let issuesFound = [];
let passedChallenges = [];

lessons.forEach((lesson, idx) => {
  // Each lesson block starts with the VALUES and contains all the data
  // Format: ('lesson_id','unit_id','title',display_order,'concept','example','mistake','science','challenge'),
  
  // Extract the data between parentheses
  const dataMatch = lesson.match(/\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,([\s\S]*?)\);/);
  
  if (!dataMatch) return;
  
  const lessonId = dataMatch[1];
  const unitId = dataMatch[2];
  const title = dataMatch[3];
  const displayOrder = dataMatch[4];
  const cardsData = dataMatch[5];
  
  // Extract the five cards (concept, example, mistake, science, challenge)
  // They're separated by ',' but cards can contain commas, so we need to be careful
  // Match quoted strings
  const cardMatches = cardsData.match(/'([^']|'')*'/g);
  
  if (!cardMatches || cardMatches.length < 5) {
    issuesFound.push({
      lessonId,
      title,
      issue: 'Unable to parse lesson cards',
      challengeCard: '(parsing error)'
    });
    totalLessons++;
    return;
  }
  
  // The challenge card is the last one (5th card)
  const challengeCard = cardMatches[4].replace(/^'|'$/g, '').replace(/''/g, "'").trim();
  
  if (!challengeCard || challengeCard.length < 10) {
    issuesFound.push({
      lessonId,
      title,
      issue: 'Missing or empty challenge card',
      challengeCard: challengeCard || '(empty)'
    });
    totalLessons++;
    return;
  }
  
  totalLessons++;
  
  // Check criteria
  const issues = [];
  
  // 1. Check for immediate trigger
  if (!immediateTriggersRegex.test(challengeCard)) {
    issues.push('Missing immediate trigger (e.g., "Right now", "Today", "Next time")');
  }
  
  // 2. Check for time constraint
  if (!timeConstraintRegex.test(challengeCard)) {
    issues.push('Missing specific time constraint');
  }
  
  // 3. Check for reflection prompt
  if (!reflectionPromptRegex.test(challengeCard)) {
    issues.push('Missing reflection prompt (e.g., "Notice what happens")');
  }
  
  // 4. Check if completable in <10 minutes (heuristic: check for long/complex instructions)
  if (challengeCard.length > 400) {
    issues.push('Challenge may be too long/complex (>400 chars)');
  }
  
  // 5. Check word count (design spec says 50-75 words)
  const wordCount = challengeCard.split(/\s+/).length;
  if (wordCount < 30) {
    issues.push(`Too short (${wordCount} words, target: 50-75)`);
  } else if (wordCount > 100) {
    issues.push(`Too long (${wordCount} words, target: 50-75)`);
  }
  
  if (issues.length > 0) {
    issuesFound.push({
      lessonId,
      title,
      issues,
      challengeCard,
      wordCount
    });
  } else {
    passedChallenges.push({
      lessonId,
      title,
      wordCount
    });
  }
});

// Generate report
console.log('='.repeat(80));
console.log('CHALLENGE ACTIONABILITY REVIEW REPORT');
console.log('='.repeat(80));
console.log(`\nTotal Lessons Reviewed: ${totalLessons}`);
console.log(`Challenges Passed: ${passedChallenges.length} (${Math.round(passedChallenges.length/totalLessons*100)}%)`);
console.log(`Challenges With Issues: ${issuesFound.length} (${Math.round(issuesFound.length/totalLessons*100)}%)`);

console.log('\n' + '='.repeat(80));
console.log('ISSUES BY CATEGORY');
console.log('='.repeat(80));

// Count issue types
const issueTypes = {};
issuesFound.forEach(item => {
  item.issues.forEach(issue => {
    issueTypes[issue] = (issueTypes[issue] || 0) + 1;
  });
});

Object.entries(issueTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([issue, count]) => {
    console.log(`\n${issue}: ${count} lessons`);
  });

console.log('\n' + '='.repeat(80));
console.log('DETAILED ISSUES');
console.log('='.repeat(80));

issuesFound.forEach((item, idx) => {
  console.log(`\n${idx + 1}. ${item.title}`);
  console.log(`   ID: ${item.lessonId}`);
  if (item.wordCount) {
    console.log(`   Word Count: ${item.wordCount}`);
  }
  console.log(`   Issues:`);
  item.issues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  console.log(`   Challenge Card:`);
  console.log(`   "${item.challengeCard.substring(0, 200)}${item.challengeCard.length > 200 ? '...' : '"}"`);
});

console.log('\n' + '='.repeat(80));
console.log('SUMMARY & RECOMMENDATIONS');
console.log('='.repeat(80));
console.log(`
FINDINGS:
- ${issuesFound.length} of ${totalLessons} challenges need attention
- Most common issues:
  ${Object.entries(issueTypes).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([issue, count]) => `  • ${issue} (${count} challenges)`).join('\n')}

RECOMMENDATIONS:
1. Add immediate triggers to challenges missing them
2. Include specific time constraints (e.g., "5 minutes", "today", "before bed")
3. Add reflection prompts (e.g., "Notice what happens when...", "Track how you feel...")
4. Ensure challenges are completable in under 10 minutes
5. Target 50-75 words per challenge card

NEXT STEPS:
1. Review flagged challenges manually
2. Update SQL file with improved challenge cards
3. Re-run this analysis to verify improvements
`);

// Save detailed report to file
const reportData = {
  summary: {
    totalLessons,
    passed: passedChallenges.length,
    needsWork: issuesFound.length,
    passRate: Math.round(passedChallenges.length/totalLessons*100)
  },
  issueTypes,
  issuesFound,
  passedChallenges
};

fs.writeFileSync(
  'challenge_actionability_report.json',
  JSON.stringify(reportData, null, 2)
);

console.log('\nDetailed report saved to: challenge_actionability_report.json');
