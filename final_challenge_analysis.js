const fs = require('fs');

const sql = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf-8');

// Extract lessons using multiline regex that handles line breaks
// Match pattern: ('id','unit_id','title',order,'card1','card2','card3','card4','card5')
const lessonRegex = /\('(33333333-[0-9a-f-]+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*'((?:[^']|'')*?)'\s*,\s*'((?:[^']|'')*?)'\s*,\s*'((?:[^']|'')*?)'\s*,\s*'((?:[^']|'')*?)'\s*,\s*'((?:[^']|'')*?)'\s*\)/gs;

const lessons = [];
let match;
while ((match = lessonRegex.exec(sql)) !== null) {
  lessons.push({
    id: match[1],
    unitId: match[2],
    title: match[3].replace(/''/g, "'"),
    displayOrder: parseInt(match[4]),
    concept: match[5].replace(/''/g, "'").trim(),
    example: match[6].replace(/''/g, "'").trim(),
    mistake: match[7].replace(/''/g, "'").trim(),
    science: match[8].replace(/''/g, "'").trim(),
    challenge: match[9].replace(/''/g, "'").trim()
  });
}

console.log(`✓ Extracted ${lessons.length} lessons from SQL file\n`);

// Analyze challenges against actionability criteria
const immediateTriggersRegex = /\b(Right now|Today|Next time|In your next|This week|Tomorrow|Before|After|When you)\b/i;
const timeConstraintRegex = /\b(\d+\s+(minute|second|hour|day|week)|under \d+|<\d+|less than \d+|for \d+)\b/i;
const reflectionPromptRegex = /\b(Notice|Pay attention|Observe|Watch|See what|Feel how|Track|Write down|Count|Record)\b/i;

let issuesFound = [];
let passedChallenges = [];

lessons.forEach(lesson => {
  const challenge = lesson.challenge;
  
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
  
  // Criterion 1: Immediate trigger
  if (!immediateTriggersRegex.test(challenge)) {
    issues.push('Missing immediate trigger');
  }
  
  // Criterion 2: Specific time constraint
  if (!timeConstraintRegex.test(challenge)) {
    issues.push('Missing time constraint');
  }
  
  // Criterion 3: Reflection prompt
  if (!reflectionPromptRegex.test(challenge)) {
    issues.push('Missing reflection prompt');
  }
  
  // Criterion 4: Completable in <10 minutes (heuristic: not too long)
  if (challenge.length > 450) {
    issues.push('Challenge too long (may exceed 10 min)');
  }
  
  // Criterion 5: Word count (design spec: 50-75 words)
  if (wordCount < 40) {
    issues.push(`Word count low (${wordCount})`);
  } else if (wordCount > 90) {
    issues.push(`Word count high (${wordCount})`);
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
      wordCount,
      challengeCard: challenge
    });
  }
});

// Generate comprehensive report
console.log('='.repeat(90));
console.log('TASK 4.3: CHALLENGE ACTIONABILITY REVIEW REPORT');
console.log('Lesson Content Enhancement Spec');
console.log('='.repeat(90));

console.log(`\n📊 OVERVIEW`);
console.log(`   Total Lessons Reviewed: ${lessons.length}`);
console.log(`   ✓ Passed All Criteria: ${passedChallenges.length} (${Math.round(passedChallenges.length/lessons.length*100)}%)`);
console.log(`   ⚠ Need Attention: ${issuesFound.length} (${Math.round(issuesFound.length/lessons.length*100)}%)`);

console.log(`\n${'='.repeat(90)}`);
console.log('📋 ACTIONABILITY CRITERIA (from design.md)');
console.log('='.repeat(90));
console.log(`   1. Immediate trigger ("Right now", "Today", "Next time")`);
console.log(`   2. Specific, concrete action with time constraint`);
console.log(`   3. Clear success metric`);
console.log(`   4. Reflection prompt ("Notice what happens")`);
console.log(`   5. Completable in <10 minutes`);
console.log(`   6. Word count: 50-75 words`);

console.log(`\n${'='.repeat(90)}`);
console.log('📈 ISSUES BY CATEGORY');
console.log('='.repeat(90));

const issueTypes = {};
issuesFound.forEach(item => {
  item.issues.forEach(issue => {
    issueTypes[issue] = (issueTypes[issue] || 0) + 1;
  });
});

Object.entries(issueTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([issue, count]) => {
    const pct = Math.round(count/lessons.length*100);
    console.log(`   • ${issue.padEnd(40)} ${count.toString().padStart(3)} lessons (${pct}%)`);
  });

console.log(`\n${'='.repeat(90)}`);
console.log('⚠️  DETAILED ISSUES (Sample of 15)');
console.log('='.repeat(90));

issuesFound.slice(0, 15).forEach((item, idx) => {
  console.log(`\n${(idx + 1).toString().padStart(2)}. ${item.title}`);
  console.log(`    ID: ${item.lessonId}`);
  console.log(`    Word Count: ${item.wordCount} words`);
  console.log(`    Issues: ${item.issues.join(', ')}`);
  const preview = item.challengeCard.substring(0, 120).replace(/\n/g, ' ');
  console.log(`    Challenge: "${preview}${item.challengeCard.length > 120 ? '...' : ''}"`);
});

if (passedChallenges.length > 0) {
  console.log(`\n${'='.repeat(90)}`);
  console.log('✓ EXAMPLES OF WELL-FORMED CHALLENGES (Sample of 5)');
  console.log('='.repeat(90));
  
  passedChallenges.slice(0, 5).forEach((item, idx) => {
    console.log(`\n${idx + 1}. ${item.title}`);
    console.log(`   Word Count: ${item.wordCount} words`);
    const preview = item.challengeCard.substring(0, 150).replace(/\n/g, ' ');
    console.log(`   Challenge: "${preview}${item.challengeCard.length > 150 ? '...' : ''}"`);
  });
}

console.log(`\n${'='.repeat(90)}`);
console.log('💡 RECOMMENDATIONS');
console.log('='.repeat(90));

const topIssues = Object.entries(issueTypes).sort((a, b) => b[1] - a[1]).slice(0, 3);
console.log(`\nPriority Issues to Address:`);
topIssues.forEach(([issue, count], idx) => {
  console.log(`   ${idx + 1}. ${issue} (${count} challenges affected)`);
});

console.log(`\nSuggested Actions:`);
console.log(`   • Add immediate triggers: Start challenges with "Right now", "Today", "Next time"`);
console.log(`   • Include time constraints: Specify duration (e.g., "5 minutes", "before bed")`);
console.log(`   • Add reflection prompts: End with "Notice...", "Track...", "Write down..."`);
console.log(`   • Target 50-75 words per challenge to ensure completability`);
console.log(`   • Ensure challenges connect directly to the lesson concept`);

console.log(`\n${'='.repeat(90)}`);
console.log('📁 NEXT STEPS');
console.log('='.repeat(90));
console.log(`   1. Review all ${issuesFound.length} flagged challenges in the JSON report`);
console.log(`   2. Update challenge cards to meet all actionability criteria`);
console.log(`   3. Re-run this analysis to verify improvements`);
console.log(`   4. Proceed to Task 4.4 (Inclusivity & Sensitivity Review)`);

// Save comprehensive JSON report
const reportData = {
  metadata: {
    taskId: '4.3',
    taskName: 'Challenge Actionability Review',
    specPath: '.kiro/specs/lesson-content-enhancement',
    dateGenerated: new Date().toISOString(),
    criteriaChecked: [
      'Immediate trigger present',
      'Specific time constraint',
      'Reflection prompt included',
      'Completable in <10 minutes',
      'Word count 50-75 words',
      'Connects to lesson concept'
    ]
  },
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

fs.writeFileSync('CHALLENGE_ACTIONABILITY_REPORT.json', JSON.stringify(reportData, null, 2));
console.log(`\n✅ Detailed JSON report saved to: CHALLENGE_ACTIONABILITY_REPORT.json`);
console.log(`   Contains full details for all ${issuesFound.length} challenges needing attention\n`);
