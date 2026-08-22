const fs = require('fs');

// Read the SQL file
const sqlContent = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf8');

// Extract all lessons with their challenge cards
const lessonRegex = /INSERT INTO lessons \(id, unit_id, title, display_order, card_concept, card_example, card_mistake, card_science, card_challenge\) VALUES\s*\n\('([^']+)','([^']+)','([^']+)',(\d+),\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)',\s*'((?:[^']|'')+)'\)/gs;

const lessons = [];
let match;

while ((match = lessonRegex.exec(sqlContent)) !== null) {
  const [_, id, unit_id, title, display_order, concept, example, mistake, science, challenge] = match;
  lessons.push({
    id,
    title,
    challenge: challenge.replace(/''/g, "'") // Unescape single quotes
  });
}

console.log(`\n========================================`);
console.log(`CHALLENGE ACTIONABILITY REVIEW`);
console.log(`Total lessons analyzed: ${lessons.length}`);
console.log(`========================================\n`);

// Criteria to check
const issues = [];

lessons.forEach((lesson, index) => {
  const challenge = lesson.challenge;
  const lessonNum = index + 1;
  
  // Check 1: Time-bound (should mention "today", "right now", "next time", specific duration)
  const timeIndicators = /\b(today|right now|now|next time|tonight|this week|tomorrow|in \d+ (minute|second|hour|day)s?|set a timer|for \d+)\b/i;
  const hasTimebound = timeIndicators.test(challenge);
  
  // Check 2: Specific action (should have clear verb and action)
  const actionVerbs = /\b(record|write|say|do|set|try|answer|practice|count|notice|ask|start|stop|pick|choose|call|text|send|take|make|create|list|identify|speak|read|watch|listen)\b/i;
  const hasSpecificAction = actionVerbs.test(challenge);
  
  // Check 3: Length check (should be 50-75 words ideally)
  const wordCount = challenge.split(/\s+/).length;
  const isAppropriateLength = wordCount >= 30 && wordCount <= 100;
  
  // Check 4: Success criteria (should include clear outcome or "notice")
  const successIndicators = /\b(notice|count|write down|compare|measure|track|record|feel|observe|check|see if|that's|you'll know)\b/i;
  const hasSuccessCriteria = successIndicators.test(challenge);
  
  // Check 5: Under 10 minutes (explicit or implicit)
  const quicklyCompletable = /\b(5 minute|10 minute|2 minute|3 minute|one minute|60 second|30 second|quick|brief|short)\b/i;
  const seemsQuick = quicklyCompletable.test(challenge) || wordCount < 80;
  
  // Identify issues
  const lessonIssues = [];
  
  if (!hasTimebound) {
    lessonIssues.push('❌ NOT TIME-BOUND: Missing immediate trigger (today, right now, next time, specific duration)');
  }
  
  if (!hasSpecificAction) {
    lessonIssues.push('❌ NOT SPECIFIC: Missing clear action verb or specific task');
  }
  
  if (!hasSuccessCriteria) {
    lessonIssues.push('❌ UNCLEAR SUCCESS: Missing clear outcome or "notice what happens" prompt');
  }
  
  if (!seemsQuick) {
    lessonIssues.push('⚠️  POSSIBLY TOO LONG: Challenge may take >10 minutes');
  }
  
  if (wordCount > 100) {
    lessonIssues.push(`⚠️  TOO WORDY: ${wordCount} words (should be 50-75)`);
  }
  
  if (wordCount < 30) {
    lessonIssues.push(`⚠️  TOO SHORT: ${wordCount} words (should be 50-75)`);
  }
  
  if (lessonIssues.length > 0) {
    issues.push({
      lessonNum,
      id: lesson.id,
      title: lesson.title,
      challenge,
      issues: lessonIssues,
      wordCount
    });
  }
});

// Report results
if (issues.length === 0) {
  console.log('✅ ALL CHALLENGES PASS ACTIONABILITY CRITERIA!\n');
} else {
  console.log(`⚠️  FOUND ${issues.length} CHALLENGES WITH POTENTIAL ISSUES:\n`);
  
  issues.forEach(issue => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Lesson #${issue.lessonNum}: ${issue.title}`);
    console.log(`ID: ${issue.id}`);
    console.log(`Word count: ${issue.wordCount}`);
    console.log(`\nISSUES:`);
    issue.issues.forEach(i => console.log(`  ${i}`));
    console.log(`\nCHALLENGE TEXT:`);
    console.log(`"${issue.challenge}"`);
  });
  
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`SUMMARY`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Total lessons: ${lessons.length}`);
  console.log(`Lessons with issues: ${issues.length}`);
  console.log(`Pass rate: ${((lessons.length - issues.length) / lessons.length * 100).toFixed(1)}%`);
  
  // Count issue types
  const issueTypes = {
    notTimebound: 0,
    notSpecific: 0,
    unclearSuccess: 0,
    tooLong: 0,
    tooWordy: 0,
    tooShort: 0
  };
  
  issues.forEach(issue => {
    issue.issues.forEach(i => {
      if (i.includes('NOT TIME-BOUND')) issueTypes.notTimebound++;
      if (i.includes('NOT SPECIFIC')) issueTypes.notSpecific++;
      if (i.includes('UNCLEAR SUCCESS')) issueTypes.unclearSuccess++;
      if (i.includes('POSSIBLY TOO LONG')) issueTypes.tooLong++;
      if (i.includes('TOO WORDY')) issueTypes.tooWordy++;
      if (i.includes('TOO SHORT')) issueTypes.tooShort++;
    });
  });
  
  console.log(`\nISSUE BREAKDOWN:`);
  console.log(`  Missing time-bound element: ${issueTypes.notTimebound}`);
  console.log(`  Missing specific action: ${issueTypes.notSpecific}`);
  console.log(`  Unclear success criteria: ${issueTypes.unclearSuccess}`);
  console.log(`  Possibly too long (>10 min): ${issueTypes.tooLong}`);
  console.log(`  Too wordy (>100 words): ${issueTypes.tooWordy}`);
  console.log(`  Too short (<30 words): ${issueTypes.tooShort}`);
}

// Generate detailed report file
const reportContent = `# Challenge Actionability Review Report
Generated: ${new Date().toISOString()}

## Summary
- **Total lessons analyzed:** ${lessons.length}
- **Lessons with issues:** ${issues.length}
- **Pass rate:** ${((lessons.length - issues.length) / lessons.length * 100).toFixed(1)}%

## Criteria Checked
1. ✅ **Time-bound:** Challenge mentions "today", "right now", "next time", or specific duration
2. ✅ **Specific action:** Clear verb and concrete task
3. ✅ **Success criteria:** Clear outcome or "notice what happens" prompt
4. ✅ **Quick (<10 min):** Explicitly or implicitly completable in under 10 minutes
5. ✅ **Appropriate length:** 50-75 words (30-100 acceptable)

## Issues Found

${issues.length === 0 ? '🎉 No issues found! All challenges meet actionability criteria.' : ''}

${issues.map(issue => `
### Lesson #${issue.lessonNum}: ${issue.title}
**ID:** ${issue.id}  
**Word count:** ${issue.wordCount}

**Issues:**
${issue.issues.map(i => `- ${i}`).join('\n')}

**Challenge text:**
> ${issue.challenge}

---
`).join('\n')}

## Recommendations

${issues.length > 0 ? `
Based on the analysis, here are the main improvement areas:

1. **Time-bound elements:** ${issues.filter(i => i.issues.some(iss => iss.includes('NOT TIME-BOUND'))).length} challenges need explicit timing (add "right now", "today", "next time", or duration)
2. **Specific actions:** ${issues.filter(i => i.issues.some(iss => iss.includes('NOT SPECIFIC'))).length} challenges need clearer action verbs
3. **Success criteria:** ${issues.filter(i => i.issues.some(iss => iss.includes('UNCLEAR SUCCESS'))).length} challenges need clearer "notice what happens" or measurable outcome
4. **Length issues:** ${issues.filter(i => i.issues.some(iss => iss.includes('WORDY') || iss.includes('SHORT'))).length} challenges need word count adjustment

All issues are fixable with minor edits to improve clarity and actionability.
` : 'All challenges meet the quality standards. No immediate action required.'}
`;

fs.writeFileSync('CHALLENGE_ACTIONABILITY_REPORT.md', reportContent);
console.log(`\n\n📄 Detailed report saved to: CHALLENGE_ACTIONABILITY_REPORT.md`);
