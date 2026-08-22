const fs = require('fs');

const sql = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf-8');

// Split by lesson ID pattern to get individual lessons
// Each lesson starts with ('33333333-
const lessonMatches = sql.matchAll(/\('(33333333-[^']+)','([^']+)','([^']+)',(\d+),'((?:[^']|'')*?)','((?:[^']|'')*?)','((?:[^']|'')*?)','((?:[^']|'')*?)','((?:[^']|'')*?)'\)/g);

const lessons = [];
for (const match of lessonMatches) {
  lessons.push({
    id: match[1],
    unitId: match[2],
    title: match[3].replace(/''/g, "'"),
    displayOrder: match[4],
    concept: match[5].replace(/''/g, "'"),
    example: match[6].replace(/''/g, "'"),
    mistake: match[7].replace(/''/g, "'"),
    science: match[8].replace(/''/g, "'"),
    challenge: match[9].replace(/''/g, "'")
  });
}

console.log(`Extracted ${lessons.length} lessons`);

// Analyze challenges
const immediateTriggersRegex = /\b(Right now|Today|Next time|In your next|This week|Tomorrow|Before|After|When you)\b/i;
const timeConstraintRegex = /\b(\d+\s+(minute|second|hour|day|week)|under \d+|<\d+|less than \d+|for \d+)\b/i;
const reflectionPromptRegex = /\b(Notice|Pay attention|Observe|Watch|See what|Feel how|Track|Write down|Count|Record)\b/i;

let issuesFound = [];
let passedChallenges = [];

lessons.forEach(lesson => {
  const challenge = lesson.challenge.trim();
  
  if (!challenge || challenge.length < 10) {
    issuesFound.push({
      lessonId: lesson.id,
      title: lesson.title,
      issues: ['Missing or empty challenge card'],
      challengeCard: challenge || '(empty)',
      wordCount: 0
    });
    return;
  }
  
  const issues = [];
  const wordCount = challenge.split(/\s+/).length;
  
  // Check criteria
  if (!immediateTriggersRegex.test(challenge)) {
    issues.push('Missing immediate trigger (e.g., "Right now", "Today", "Next time")');
  }
  
  if (!timeConstraintRegex.test(challenge)) {
    issues.push('Missing specific time constraint');
  }
  
  if (!reflectionPromptRegex.test(challenge)) {
    issues.push('Missing reflection prompt (e.g., "Notice what happens")');
  }
  
  if (challenge.length > 400) {
    issues.push('Challenge may be too long/complex (>400 chars)');
  }
  
  if (wordCount < 30) {
    issues.push(`Too short (${wordCount} words, target: 50-75)`);
  } else if (wordCount > 100) {
    issues.push(`Too long (${wordCount} words, target: 50-75)`);
  }
  
  if (issues.length > 0) {
    issuesFound.push({
      lessonId: lesson.id,
      title: lesson.title,
      issues,
      challengeCard: challenge,
      wordCount
    });
  } else {
    passedChallenges.push({
      lessonId: lesson.id,
      title: lesson.title,
      wordCount
    });
  }
});

// Generate report
console.log('\n' + '='.repeat(80));
console.log('CHALLENGE ACTIONABILITY REVIEW REPORT');
console.log('='.repeat(80));
console.log(`\nTotal Lessons Reviewed: ${lessons.length}`);
console.log(`Challenges Passed All Criteria: ${passedChallenges.length} (${Math.round(passedChallenges.length/lessons.length*100)}%)`);
console.log(`Challenges With Issues: ${issuesFound.length} (${Math.round(issuesFound.length/lessons.length*100)}%)`);

console.log('\n' + '='.repeat(80));
console.log('ISSUES BY CATEGORY');
console.log('='.repeat(80));

const issueTypes = {};
issuesFound.forEach(item => {
  item.issues.forEach(issue => {
    issueTypes[issue] = (issueTypes[issue] || 0) + 1;
  });
});

Object.entries(issueTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([issue, count]) => {
    console.log(`  ${issue}: ${count} lessons`);
  });

console.log('\n' + '='.repeat(80));
console.log('SAMPLE ISSUES (First 10)');
console.log('='.repeat(80));

issuesFound.slice(0, 10).forEach((item, idx) => {
  console.log(`\n${idx + 1}. ${item.title}`);
  console.log(`   ID: ${item.lessonId}`);
  console.log(`   Word Count: ${item.wordCount}`);
  console.log(`   Issues: ${item.issues.join(', ')}`);
  const preview = item.challengeCard.substring(0, 150);
  console.log(`   Challenge: "${preview}${item.challengeCard.length > 150 ? '...' : ''}"`);
});

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

const topIssues = Object.entries(issueTypes).sort((a, b) => b[1] - a[1]).slice(0, 5);
console.log(`\nMost Common Issues:`);
topIssues.forEach(([issue, count]) => {
  const pct = Math.round(count/lessons.length*100);
  console.log(`  • ${issue}`);
  console.log(`    ${count} lessons (${pct}%)`);
});

// Save report
const reportData = {
  summary: {
    totalLessons: lessons.length,
    passed: passedChallenges.length,
    needsWork: issuesFound.length,
    passRate: Math.round(passedChallenges.length/lessons.length*100)
  },
  issueTypes,
  issuesFound,
  passedChallenges
};

fs.writeFileSync('challenge_actionability_full_report.json', JSON.stringify(reportData, null, 2));
console.log('\n✓ Full report saved to: challenge_actionability_full_report.json\n');
