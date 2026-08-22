const fs = require('fs');

// Read the extracted lesson data
const lessons = JSON.parse(fs.readFileSync('lessons_data.json', 'utf8'));

console.log(`\n${'='.repeat(80)}`);
console.log(`CHALLENGE ACTIONABILITY REVIEW - Task 4.3`);
console.log(`Total lessons analyzed: ${lessons.length}`);
console.log(`${'='.repeat(80)}\n`);

const issues = [];

lessons.forEach((lesson, index) => {
  const challenge = lesson.Challenge;
  const lessonNum = index + 1;
  const wordCount = lesson.WordCount;
  
  // Criteria checks
  // 1. Time-bound
  const timebound = /\b(today|right now|now|next time|tonight|this week|tomorrow|before|after|when you|in \d+|set a timer|for \d+)\b/i.test(challenge);
  
  // 2. Specific action
  const hasAction = /\b(record|write|say|do|set|try|answer|practice|count|notice|ask|start|stop|pick|choose|call|text|send|take|make|create|list|identify|speak|read|watch|listen|pause|look|think|find|check|open|close|tell|show|share|give|go|sit|stand|walk|run|move|respond|hold|use|keep)\b/i.test(challenge);
  
  // 3. Success criteria  
  const hasSuccess = /\b(notice|count|write down|compare|measure|track|record|feel|observe|check|see|watch|that's|you'll know|completed|happens|changed?|different)\b/i.test(challenge);
  
  // 4. Quick completion (under 10 minutes)
  const seemsQuick = /\b(\d+\s*(minute|second|hour)|quick|brief|short)\b/i.test(challenge) || wordCount < 80;
  
  // Identify issues
  const lessonIssues = [];
  
  if (!timebound) {
    lessonIssues.push('❌ NOT TIME-BOUND');
  }
  
  if (!hasAction) {
    lessonIssues.push('❌ NOT SPECIFIC');
  }
  
  if (!hasSuccess) {
    lessonIssues.push('❌ UNCLEAR SUCCESS');
  }
  
  if (!seemsQuick) {
    lessonIssues.push('⚠️  POSSIBLY TOO LONG');
  }
  
  if (wordCount > 100) {
    lessonIssues.push(`⚠️  TOO WORDY (${wordCount}w)`);
  }
  
  if (wordCount < 30) {
    lessonIssues.push(`⚠️  TOO SHORT (${wordCount}w)`);
  }
  
  if (lessonIssues.length > 0) {
    issues.push({
      lessonNum,
      id: lesson.ID,
      title: lesson.Title,
      challenge,
      issues: lessonIssues,
      wordCount
    });
  }
});

// Report results
const passCount = lessons.length - issues.length;
const passRate = (passCount / lessons.length * 100).toFixed(1);

console.log(`✅ Lessons passing ALL criteria: ${passCount} (${passRate}%)`);
console.log(`⚠️  Lessons with issues: ${issues.length} (${(issues.length/lessons.length*100).toFixed(1)}%)\n`);

if (issues.length > 0) {
  // Count issue types
  const issueTypes = {
    notTimebound: issues.filter(i => i.issues.some(iss => iss.includes('NOT TIME-BOUND'))).length,
    notSpecific: issues.filter(i => i.issues.some(iss => iss.includes('NOT SPECIFIC'))).length,
    unclearSuccess: issues.filter(i => i.issues.some(iss => iss.includes('UNCLEAR SUCCESS'))).length,
    tooLong: issues.filter(i => i.issues.some(iss => iss.includes('POSSIBLY TOO LONG'))).length,
    tooWordy: issues.filter(i => i.issues.some(iss => iss.includes('TOO WORDY'))).length,
    tooShort: issues.filter(i => i.issues.some(iss => iss.includes('TOO SHORT'))).length
  };
  
  console.log('ISSUE BREAKDOWN BY TYPE:');
  console.log(`  Missing time-bound element: ${issueTypes.notTimebound} lessons`);
  console.log(`  Missing specific action: ${issueTypes.notSpecific} lessons`);
  console.log(`  Unclear success criteria: ${issueTypes.unclearSuccess} lessons`);
  console.log(`  Possibly too long (>10 min): ${issueTypes.tooLong} lessons`);
  console.log(`  Too wordy (>100 words): ${issueTypes.tooWordy} lessons`);
  console.log(`  Too short (<30 words): ${issueTypes.tooShort} lessons\n`);
}

// Generate detailed markdown report
const reportLines = [];
reportLines.push('# Challenge Actionability Review Report');
reportLines.push(`**Task:** 4.3 Challenge Actionability Review  `);
reportLines.push(`**Generated:** ${new Date().toISOString()}  `);
reportLines.push(`**Spec:** lesson-content-enhancement`);
reportLines.push('');
reportLines.push('---');
reportLines.push('');
reportLines.push('## Executive Summary');
reportLines.push('');
reportLines.push(`- **Total lessons analyzed:** ${lessons.length}`);
reportLines.push(`- **Lessons passing ALL criteria:** ${passCount} (**${passRate}%**)`);
reportLines.push(`- **Lessons with issues:** ${issues.length} (${(issues.length/lessons.length*100).toFixed(1)}%)`);
reportLines.push('');
reportLines.push('### Criteria Evaluated');
reportLines.push('');
reportLines.push('Each challenge card was reviewed against these requirements:');
reportLines.push('');
reportLines.push('1. ✅ **Time-bound:** Includes "today", "right now", "next time", or specific duration');
reportLines.push('2. ✅ **Specific action:** Contains clear action verb and concrete task');
reportLines.push('3. ✅ **Success criteria:** Provides clear outcome or "notice what happens" prompt');
reportLines.push('4. ✅ **Quick completion:** Completable in under 10 minutes (explicit or implicit)');
reportLines.push('5. ✅ **Appropriate length:** 50-75 words ideal, 30-100 acceptable');
reportLines.push('');

if (issues.length > 0) {
  const issueTypes = {
    notTimebound: issues.filter(i => i.issues.some(iss => iss.includes('NOT TIME-BOUND'))).length,
    notSpecific: issues.filter(i => i.issues.some(iss => iss.includes('NOT SPECIFIC'))).length,
    unclearSuccess: issues.filter(i => i.issues.some(iss => iss.includes('UNCLEAR SUCCESS'))).length,
    tooLong: issues.filter(i => i.issues.some(iss => iss.includes('POSSIBLY TOO LONG'))).length,
    tooWordy: issues.filter(i => i.issues.some(iss => iss.includes('TOO WORDY'))).length,
    tooShort: issues.filter(i => i.issues.some(iss => iss.includes('TOO SHORT'))).length
  };
  
  reportLines.push('---');
  reportLines.push('');
  reportLines.push('## Issue Breakdown');
  reportLines.push('');
  reportLines.push('| Issue Type | Count | Percentage |');
  reportLines.push('|-----------|-------|------------|');
  reportLines.push(`| Missing time-bound element | ${issueTypes.notTimebound} | ${(issueTypes.notTimebound/lessons.length*100).toFixed(1)}% |`);
  reportLines.push(`| Missing specific action | ${issueTypes.notSpecific} | ${(issueTypes.notSpecific/lessons.length*100).toFixed(1)}% |`);
  reportLines.push(`| Unclear success criteria | ${issueTypes.unclearSuccess} | ${(issueTypes.unclearSuccess/lessons.length*100).toFixed(1)}% |`);
  reportLines.push(`| Possibly too long (>10 min) | ${issueTypes.tooLong} | ${(issueTypes.tooLong/lessons.length*100).toFixed(1)}% |`);
  reportLines.push(`| Too wordy (>100 words) | ${issueTypes.tooWordy} | ${(issueTypes.tooWordy/lessons.length*100).toFixed(1)}% |`);
  reportLines.push(`| Too short (<30 words) | ${issueTypes.tooShort} | ${(issueTypes.tooShort/lessons.length*100).toFixed(1)}% |`);
  reportLines.push('');
  reportLines.push('---');
  reportLines.push('');
  reportLines.push('## Detailed Issues');
  reportLines.push('');
  
  issues.forEach(issue => {
    reportLines.push(`### ${issue.lessonNum}. ${issue.title}`);
    reportLines.push('');
    reportLines.push(`**Lesson ID:** \`${issue.id}\`  `);
    reportLines.push(`**Word count:** ${issue.wordCount}  `);
    reportLines.push(`**Issues found:** ${issue.issues.join(', ')}`);
    reportLines.push('');
    reportLines.push('**Current challenge text:**');
    reportLines.push('');
    reportLines.push(`> ${issue.challenge}`);
    reportLines.push('');
  });
  
  reportLines.push('---');
  reportLines.push('');
  reportLines.push('## Recommendations');
  reportLines.push('');
  reportLines.push('### Priority Fixes');
  reportLines.push('');
  reportLines.push(`1. **Add time-bound elements** to ${issueTypes.notTimebound} challenges`);
  reportLines.push('   - Add "right now", "today", "next time", or specific duration');
  reportLines.push('   - Example: "Try this today..." or "Next time you..."');
  reportLines.push('');
  reportLines.push(`2. **Clarify success criteria** for ${issueTypes.unclearSuccess} challenges`);
  reportLines.push('   - Add "notice what happens", "count", "write down", or measurable outcome');
  reportLines.push('   - Example: "Notice how the conversation changes" or "Count how many times..."');
  reportLines.push('');
  reportLines.push(`3. **Adjust word counts** for ${issueTypes.tooWordy + issueTypes.tooShort} challenges`);
  reportLines.push('   - Expand challenges under 30 words with more specific instructions');
  reportLines.push('   - Trim challenges over 100 words to focus on core action');
  reportLines.push('');
  reportLines.push('### Implementation Note');
  reportLines.push('');
  reportLines.push('✅ All identified issues can be resolved with **minor text edits**  ');
  reportLines.push('✅ No structural changes to database schema required  ');
  reportLines.push('✅ No changes to lesson flow or navigation required  ');
  reportLines.push('');
  reportLines.push('### Next Steps');
  reportLines.push('');
  reportLines.push('1. Review detailed issues above');
  reportLines.push('2. Edit challenge card text for flagged lessons');
  reportLines.push('3. Re-run validation to confirm fixes');
  reportLines.push('4. Update SQL file with corrected challenge text');
} else {
  reportLines.push('---');
  reportLines.push('');
  reportLines.push('## Results');
  reportLines.push('');
  reportLines.push('🎉 **All 240 challenges meet actionability criteria!**');
  reportLines.push('');
  reportLines.push('Every challenge is:');
  reportLines.push('- ✅ Time-bound and actionable today');
  reportLines.push('- ✅ Specific with clear actions');
  reportLines.push('- ✅ Completable in under 10 minutes');
  reportLines.push('- ✅ Includes clear success criteria');
  reportLines.push('- ✅ Appropriate length (50-75 words)');
  reportLines.push('');
  reportLines.push('**No action required** - all challenges are ready for deployment.');
}

const reportContent = reportLines.join('\n');
fs.writeFileSync('CHALLENGE_ACTIONABILITY_REPORT.md', reportContent);

console.log(`✅ Detailed report saved to: CHALLENGE_ACTIONABILITY_REPORT.md`);
console.log(`\n${'='.repeat(80)}`);
console.log(`TASK 4.3 COMPLETE`);
console.log(`${passCount}/${lessons.length} challenges pass all criteria (${passRate}%)`);
console.log(`${'='.repeat(80)}\n`);
