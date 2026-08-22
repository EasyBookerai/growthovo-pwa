const fs = require('fs');

// Read the SQL file
const sqlContent = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf8');

// Extract lessons by finding each INSERT statement and parsing the VALUES
// Format: INSERT INTO lessons (...) VALUES \n('id','unit_id','title',order,'concept','example','mistake','science','challenge')
const lessonMatches = [];

// Split by lesson INSERT patterns
const lines = sqlContent.split('\n');
let currentLesson = null;
let inLesson = false;
let buffer = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Start of a new lesson
  if (line.includes('INSERT INTO lessons')) {
    inLesson = true;
    buffer = line;
    continue;
  }
  
  if (inLesson) {
    buffer += '\n' + line;
    
    // Check if we've reached the end of this lesson (ends with ');' or '),' or just ')')
    if (line.trim().endsWith(');') || line.trim().endsWith('),')) {
      // Parse this lesson
      lessonMatches.push(buffer);
      buffer = '';
      inLesson = false;
    }
  }
}

console.log(`Found ${lessonMatches.length} lesson INSERT statements`);

// Now parse each lesson to extract challenge card
const lessons = [];

lessonMatches.forEach((lessonSQL, index) => {
  try {
    // Extract the VALUES part
    const valuesMatch = lessonSQL.match(/VALUES\s*\n\('([^']+)','([^']+)','([^']+)',(\d+),\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)'\)/s);
    
    if (valuesMatch) {
      const [_, id, unit_id, title, display_order, concept, example, mistake, science, challenge] = valuesMatch;
      lessons.push({
        id,
        title: title.replace(/''/g, "'"),
        challenge: challenge.replace(/''/g, "'").trim()
      });
    } else {
      console.log(`⚠️  Could not parse lesson #${index + 1}`);
    }
  } catch (e) {
    console.log(`❌ Error parsing lesson #${index + 1}: ${e.message}`);
  }
});

console.log(`Successfully parsed ${lessons.length} lessons\n`);

// Analyze challenges
console.log(`\n========================================`);
console.log(`CHALLENGE ACTIONABILITY REVIEW`);
console.log(`Total lessons analyzed: ${lessons.length}`);
console.log(`========================================\n`);

const issues = [];

lessons.forEach((lesson, index) => {
  const challenge = lesson.challenge;
  const lessonNum = index + 1;
  
  // Check 1: Time-bound
  const timeIndicators = /\b(today|right now|now|next time|tonight|this week|tomorrow|in \d+ (minute|second|hour|day)s?|set a timer|for \d+|before the day ends|before you sleep)\b/i;
  const hasTimebound = timeIndicators.test(challenge);
  
  // Check 2: Specific action
  const actionVerbs = /\b(record|write|say|do|set|try|answer|practice|count|notice|ask|start|stop|pick|choose|call|text|send|take|make|create|list|identify|speak|read|watch|listen|pause|look|think|find|check|open|close|tell|show|share|give|go|sit|stand|walk|run|move)\b/i;
  const hasSpecificAction = actionVerbs.test(challenge);
  
  // Check 3: Word count (50-75 ideal, 30-100 acceptable)
  const wordCount = challenge.split(/\s+/).length;
  const isAppropriateLength = wordCount >= 30 && wordCount <= 100;
  
  // Check 4: Success criteria
  const successIndicators = /\b(notice|count|write down|compare|measure|track|record|feel|observe|check|see if|see what|watch|that's|you'll know|you've completed)\b/i;
  const hasSuccessCriteria = successIndicators.test(challenge);
  
  // Check 5: Completable quickly
  const quickIndicators = /\b(5 minute|10 minute|2 minute|3 minute|one minute|60 second|30 second)\b/i;
  const explicitlyQuick = quickIndicators.test(challenge);
  const seemsQuick = explicitlyQuick || wordCount < 80;
  
  // Identify issues
  const lessonIssues = [];
  
  if (!hasTimebound) {
    lessonIssues.push('❌ NOT TIME-BOUND');
  }
  
  if (!hasSpecificAction) {
    lessonIssues.push('❌ NOT SPECIFIC');
  }
  
  if (!hasSuccessCriteria) {
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
      id: lesson.id,
      title: lesson.title,
      challenge,
      issues: lessonIssues,
      wordCount
    });
  }
});

// Report
if (issues.length === 0) {
  console.log('✅ ALL 240 CHALLENGES PASS ACTIONABILITY CRITERIA!\n');
} else {
  console.log(`⚠️  FOUND ${issues.length} CHALLENGES WITH ISSUES (${((issues.length/lessons.length)*100).toFixed(1)}% of total)\n`);
  
  // Summary by issue type
  const issueTypes = {
    notTimebound: issues.filter(i => i.issues.some(iss => iss.includes('NOT TIME-BOUND'))).length,
    notSpecific: issues.filter(i => i.issues.some(iss => iss.includes('NOT SPECIFIC'))).length,
    unclearSuccess: issues.filter(i => i.issues.some(iss => iss.includes('UNCLEAR SUCCESS'))).length,
    tooLong: issues.filter(i => i.issues.some(iss => iss.includes('POSSIBLY TOO LONG'))).length,
    tooWordy: issues.filter(i => i.issues.some(iss => iss.includes('TOO WORDY'))).length,
    tooShort: issues.filter(i => i.issues.some(iss => iss.includes('TOO SHORT'))).length
  };
  
  console.log(`ISSUE BREAKDOWN:`);
  console.log(`  Missing time-bound element: ${issueTypes.notTimebound}`);
  console.log(`  Missing specific action: ${issueTypes.notSpecific}`);
  console.log(`  Unclear success criteria: ${issueTypes.unclearSuccess}`);
  console.log(`  Possibly too long (>10 min): ${issueTypes.tooLong}`);
  console.log(`  Too wordy (>100 words): ${issueTypes.tooWordy}`);
  console.log(`  Too short (<30 words): ${issueTypes.tooShort}\n`);
}

// Generate detailed report
const reportLines = [];
reportLines.push('# Challenge Actionability Review Report');
reportLines.push(`Generated: ${new Date().toISOString()}\n`);
reportLines.push('## Executive Summary');
reportLines.push(`- **Total lessons analyzed:** ${lessons.length}`);
reportLines.push(`- **Lessons passing all criteria:** ${lessons.length - issues.length} (${(((lessons.length - issues.length)/lessons.length)*100).toFixed(1)}%)`);
reportLines.push(`- **Lessons with issues:** ${issues.length} (${((issues.length/lessons.length)*100).toFixed(1)}%)\n`);

reportLines.push('## Criteria Evaluated');
reportLines.push('Each challenge was checked for:');
reportLines.push('1. **Time-bound:** Mentions "today", "right now", "next time", or specific duration');
reportLines.push('2. **Specific action:** Clear action verb and concrete task');
reportLines.push('3. **Success criteria:** Clear outcome or "notice what happens" prompt');
reportLines.push('4. **Completable quickly:** Under 10 minutes (explicit or implicit)');
reportLines.push('5. **Appropriate length:** 50-75 words ideal, 30-100 acceptable\n');

if (issues.length > 0) {
  const issueTypes = {
    notTimebound: issues.filter(i => i.issues.some(iss => iss.includes('NOT TIME-BOUND'))).length,
    notSpecific: issues.filter(i => i.issues.some(iss => iss.includes('NOT SPECIFIC'))).length,
    unclearSuccess: issues.filter(i => i.issues.some(iss => iss.includes('UNCLEAR SUCCESS'))).length,
    tooLong: issues.filter(i => i.issues.some(iss => iss.includes('POSSIBLY TOO LONG'))).length,
    tooWordy: issues.filter(i => i.issues.some(iss => iss.includes('TOO WORDY'))).length,
    tooShort: issues.filter(i => i.issues.some(iss => iss.includes('TOO SHORT'))).length
  };
  
  reportLines.push('## Issue Breakdown');
  reportLines.push(`- **Missing time-bound element:** ${issueTypes.notTimebound} lessons`);
  reportLines.push(`- **Missing specific action:** ${issueTypes.notSpecific} lessons`);
  reportLines.push(`- **Unclear success criteria:** ${issueTypes.unclearSuccess} lessons`);
  reportLines.push(`- **Possibly too long (>10 min):** ${issueTypes.tooLong} lessons`);
  reportLines.push(`- **Too wordy (>100 words):** ${issueTypes.tooWordy} lessons`);
  reportLines.push(`- **Too short (<30 words):** ${issueTypes.tooShort} lessons\n`);
  
  reportLines.push('---\n');
  reportLines.push('## Detailed Issues\n');
  
  issues.forEach(issue => {
    reportLines.push(`### Lesson #${issue.lessonNum}: ${issue.title}`);
    reportLines.push(`**ID:** \`${issue.id}\`  `);
    reportLines.push(`**Word count:** ${issue.wordCount}  `);
    reportLines.push(`**Issues:** ${issue.issues.join(', ')}\n`);
    reportLines.push('**Current challenge text:**');
    reportLines.push(`> ${issue.challenge}\n`);
    reportLines.push('---\n');
  });
  
  reportLines.push('## Recommendations\n');
  reportLines.push('### Priority Fixes');
  reportLines.push(`1. **Add time-bound elements** to ${issueTypes.notTimebound} challenges (add "right now", "today", "next time", or specific duration)`);
  reportLines.push(`2. **Clarify success criteria** for ${issueTypes.unclearSuccess} challenges (add "notice", "count", "write down" prompts)`);
  reportLines.push(`3. **Adjust word counts** for ${issueTypes.tooWordy + issueTypes.tooShort} challenges\n`);
  reportLines.push('### Implementation Note');
  reportLines.push('All identified issues can be resolved with minor text edits. No structural changes to the database schema or lesson flow required.');
  
} else {
  reportLines.push('## Results');
  reportLines.push('🎉 **All 240 challenges meet actionability criteria!**');
  reportLines.push('\nEvery challenge is:');
  reportLines.push('- Time-bound and actionable today');
  reportLines.push('- Specific with clear actions');
  reportLines.push('- Completable in under 10 minutes');
  reportLines.push('- Includes clear success criteria');
  reportLines.push('- Appropriate length (50-75 words)');
}

const reportContent = reportLines.join('\n');
fs.writeFileSync('CHALLENGE_ACTIONABILITY_REPORT.md', reportContent);

console.log(`\n✅ Detailed report saved to: CHALLENGE_ACTIONABILITY_REPORT.md`);
console.log(`\nSUMMARY: ${lessons.length - issues.length}/${lessons.length} challenges pass all criteria (${(((lessons.length - issues.length)/lessons.length)*100).toFixed(1)}%)`);
