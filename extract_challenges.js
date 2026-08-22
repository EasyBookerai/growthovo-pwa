const fs = require('fs');

// Read the SQL file
const sql = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf8');

// Regular expression to match challenge card content (last field before closing paren)
// Pattern: card_challenge) VALUES ... 'challenge text'),
const lessonPattern = /INSERT INTO lessons.*?VALUES\s+(.*?)(?=\n\nINSERT|\n\n--|\Z)/gs;

const challenges = [];
let lessonCount = 0;

// Find all lesson blocks
const lessonBlocks = sql.match(lessonPattern);

if (lessonBlocks) {
  lessonBlocks.forEach(block => {
    // Match individual lesson entries within each block
    // Each lesson has 5 card fields, challenge is the last one
    const singleLessonPattern = /\('([^']+)','[^']+','([^']+)',\d+,\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)'\)/g;
    
    let match;
    while ((match = singleLessonPattern.exec(block)) !== null) {
      lessonCount++;
      const lessonId = match[1];
      const title = match[2];
      const challengeText = match[7].replace(/''/g, "'"); // Unescape single quotes
      
      challenges.push({
        number: lessonCount,
        id: lessonId,
        title: title,
        challenge: challengeText
      });
    }
  });
}

console.log(`\nExtracted ${challenges.length} challenges from SQL file\n`);
console.log('='.repeat(80));
console.log('CHALLENGE QUALITY ANALYSIS - Task 4.3');
console.log('='.repeat(80));
console.log('\nCriteria:');
console.log('✓ Specific and time-bound');
console.log('✓ Completable in <10 minutes');
console.log('✓ Clear success criteria / reflection prompt');
console.log('✓ Direct connection to lesson concept');
console.log('\n' + '='.repeat(80) + '\n');

// Analyze each challenge
const analyzed = challenges.map(c => {
  const issues = [];
  const challenge = c.challenge.toLowerCase();
  const wordCount = c.challenge.split(/\s+/).length;
  
  // Check 1: Time-bound
  const timeIndicators = ['right now', 'today', 'tomorrow', 'this week', 'next time', 'tonight',
    'in the next', 'before', 'after', 'when you', 'for 5 minutes', 'for 10 minutes',
    'within', 'days', 'seconds', 'minutes', 'hours'];
  const hasTimeBound = timeIndicators.some(ind => challenge.includes(ind));
  
  if (!hasTimeBound) {
    issues.push('⚠️ NO TIME-BOUND ELEMENT - Missing "right now", "today", or specific timeframe');
  }
  
  // Check 2: Specific action verbs
  const actionVerbs = ['write', 'record', 'set', 'do', 'try', 'say', 'ask', 'tell', 'make',
    'take', 'notice', 'count', 'find', 'choose', 'pick', 'create', 'start', 'read', 'listen'];
  const hasAction = actionVerbs.some(verb => challenge.slice(0, 100).includes(verb));
  
  if (!hasAction) {
    issues.push('⚠️ WEAK ACTION - No clear imperative verb in opening');
  }
  
  // Check 3: Success criteria
  const successIndicators = ['notice', 'write down', 'count', 'measure', 'track', 'compare',
    'see if', 'check', 'watch', 'observe', 'record', 'did you', 'do you feel'];
  const hasSuccessCriteria = successIndicators.some(ind => challenge.includes(ind));
  
  if (!hasSuccessCriteria) {
    issues.push('⚠️ UNCLEAR SUCCESS CRITERIA - No "notice", measurement, or reflection prompt');
  }
  
  // Check 4: Length
  if (wordCount > 100) {
    issues.push(`⚠️ TOO LONG - ${wordCount} words (target: 50-75, max: 100)`);
  } else if (wordCount < 30) {
    issues.push(`⚠️ TOO SHORT - ${wordCount} words (target: 50-75)`);
  }
  
  // Check 5: Complexity
  const complexityFlags = ['research', 'study', 'read a book', 'complete course', 'master',
    'learn to', 'become', 'develop over', 'practice for weeks'];
  const seemsComplex = complexityFlags.some(flag => challenge.includes(flag));
  
  if (seemsComplex) {
    issues.push('⚠️ POSSIBLY TOO COMPLEX - May take >10 minutes');
  }
  
  // Check 6: Vague language
  const vaguePhrases = ['try to', 'think about', 'consider', 'reflect on', 'be more', 'work on'];
  const isVague = vaguePhrases.some(phrase => challenge.slice(0, 50).includes(phrase));
  
  if (isVague) {
    issues.push('⚠️ VAGUE ACTION - Opens with "try to", "think about", or similar weak phrasing');
  }
  
  return {
    ...c,
    wordCount,
    issues,
    qualityScore: 6 - issues.length
  };
});

// Separate high quality vs needs improvement
const highQuality = analyzed.filter(a => a.qualityScore >= 5);
const needsImprovement = analyzed.filter(a => a.qualityScore < 5);

console.log(`SUMMARY:`);
console.log(`  Total Challenges: ${analyzed.length}`);
console.log(`  High Quality (score 5-6): ${highQuality.length} (${(highQuality.length/analyzed.length*100).toFixed(1)}%)`);
console.log(`  Needs Improvement (score <5): ${needsImprovement.length} (${(needsImprovement.length/analyzed.length*100).toFixed(1)}%)`);
console.log('\n' + '='.repeat(80) + '\n');

if (needsImprovement.length > 0) {
  console.log(`CHALLENGES NEEDING IMPROVEMENT (${needsImprovement.length} total):\n`);
  needsImprovement.forEach(a => {
    console.log(`Lesson #${a.number}: ${a.title}`);
    console.log(`  Quality Score: ${a.qualityScore}/6`);
    console.log(`  Word Count: ${a.wordCount}`);
    a.issues.forEach(issue => console.log(`  ${issue}`));
    const preview = a.challenge.length > 150 ? a.challenge.slice(0, 150) + '...' : a.challenge;
    console.log(`  Challenge: ${preview}`);
    console.log('');
  });
} else {
  console.log('✓ ALL CHALLENGES MEET QUALITY CRITERIA!\n');
}

// Save detailed report
fs.writeFileSync('challenge_analysis_report.json', JSON.stringify({
  total: analyzed.length,
  highQuality: highQuality.length,
  needsImprovement: needsImprovement.length,
  challenges: analyzed
}, null, 2));

console.log('='.repeat(80));
console.log('Detailed report saved to: challenge_analysis_report.json');
console.log('='.repeat(80));
