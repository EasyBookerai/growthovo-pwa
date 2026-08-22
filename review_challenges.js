const fs = require('fs');

// Read the SQL file
const sql = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf-8');

// Extract challenge cards using a simple approach
// Look for the pattern: card_challenge) VALUES followed by lesson data
const lines = sql.split('\n');

let totalLessons = 0;
let issuesFound = [];
let passedChallenges = [];

// Find all INSERT INTO lessons lines and extract data
let currentLesson = null;
let capturingLesson = false;
let lessonData = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('INSERT INTO lessons') && line.includes('card_challenge') && line.includes('VALUES')) {
    capturingLesson = true;
    lessonData = '';
    continue;
  }
  
  if (capturingLesson) {
    lessonData += line + '\n';
    
    // Check if we've reached the end of this INSERT statement
    if (line.includes(');') || (line.includes('),') && lines[i + 1] && !lines[i + 1].trim().startsWith('('))) {
      // Process the captured lesson data
      processLessonData(lessonData);
      capturingLesson = false;
      lessonData = '';
    }
  }
}

function processLessonData(data) {
  // Split by '),(' to get individual lessons
  const lessons = data.split(/\),\s*\(/);
  
  lessons.forEach(lesson => {
    // Clean up the lesson string
    lesson = lesson.replace(/^\(/, '').replace(/\);?\s*$/, '');
    
    // Extract the fields - we need lesson_id, title, and challenge (5 cards total)
    // Format: 'id','unit_id','title',order,'concept','example','mistake','science','challenge'
    
    // Find all quoted strings
    const quotes = [];
    let inQuote = false;
    let currentQuote = '';
    let i = 0;
    
    while (i < lesson.length) {
      if (lesson[i] === "'" && lesson[i - 1] !== '\\') {
        if (!inQuote) {
          inQuote = true;
          currentQuote = '';
        } else {
          // Check if it's an escaped quote
          if (lesson[i + 1] === "'") {
            currentQuote += "'";
            i++; // Skip next quote
          } else {
            inQuote = false;
            quotes.push(currentQuote);
            currentQuote = '';
          }
        }
      } else if (inQuote) {
        currentQuote += lesson[i];
      }
      i++;
    }
    
    if (quotes.length < 8) {
      return; // Not enough data
    }
    
    const lessonId = quotes[0];
    const title = quotes[2];
    const challengeCard = quotes[7]; // 8th quoted string (0-indexed)
    
    if (!lessonId || !lessonId.startsWith('33333333')) {
      return; // Not a lesson ID
    }
    
    totalLessons++;
    
    if (!challengeCard || challengeCard.length < 10) {
      issuesFound.push({
        lessonId,
        title,
        issues: ['Missing or empty challenge card'],
        challengeCard: challengeCard || '(empty)',
        wordCount: 0
      });
      return;
    }
    
    // Check actionability criteria
    const issues = [];
    
    // 1. Immediate trigger
    const hasTrigger = /\b(Right now|Today|Next time|In your next|This week|Tomorrow|Before|After|When you)\b/i.test(challengeCard);
    if (!hasTrigger) {
      issues.push('Missing immediate trigger (e.g., "Right now", "Today", "Next time")');
    }
    
    // 2. Time constraint
    const hasTimeConstraint = /\b(\d+\s+(minute|second|hour|day|week)|under \d+|<\d+|less than \d+|for \d+)\b/i.test(challengeCard);
    if (!hasTimeConstraint) {
      issues.push('Missing specific time constraint');
    }
    
    // 3. Reflection prompt
    const hasReflection = /\b(Notice|Pay attention|Observe|Watch|See what|Feel how|Track|Write down|Count|Record)\b/i.test(challengeCard);
    if (!hasReflection) {
      issues.push('Missing reflection prompt (e.g., "Notice what happens")');
    }
    
    // 4. Length check
    if (challengeCard.length > 400) {
      issues.push('Challenge may be too long/complex (>400 chars)');
    }
    
    // 5. Word count
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
}

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
console.log('DETAILED ISSUES (First 20)');
console.log('='.repeat(80));

issuesFound.slice(0, 20).forEach((item, idx) => {
  console.log(`\n${idx + 1}. ${item.title}`);
  console.log(`   ID: ${item.lessonId}`);
  console.log(`   Word Count: ${item.wordCount}`);
  console.log(`   Issues:`);
  item.issues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  const preview = item.challengeCard.substring(0, 200);
  console.log(`   Challenge Card: "${preview}${item.challengeCard.length > 200 ? '...' : ''}"`);
});

console.log('\n' + '='.repeat(80));
console.log('SUMMARY & RECOMMENDATIONS');
console.log('='.repeat(80));

const topIssues = Object.entries(issueTypes).sort((a, b) => b[1] - a[1]).slice(0, 3);
console.log(`
FINDINGS:
- ${issuesFound.length} of ${totalLessons} challenges need attention
- Most common issues:`);
topIssues.forEach(([issue, count]) => {
  console.log(`  • ${issue} (${count} challenges)`);
});

console.log(`
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

// Save detailed report
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

fs.writeFileSync('challenge_actionability_report.json', JSON.stringify(reportData, null, 2));
console.log('\nDetailed report saved to: challenge_actionability_report.json');
