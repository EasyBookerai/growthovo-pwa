#!/usr/bin/env node
/**
 * Analyze all 240 challenge cards from lessons_all_pillars.sql
 * Check for:
 * - Specificity (concrete actions vs vague goals)
 * - Time-bound nature (<10 minutes)
 * - Connection to lesson concept
 * - Clear success criteria
 */

const fs = require('fs');

function extractLessonsFromSQL(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // Match INSERT INTO lessons statements and extract challenge cards
  const lessons = [];
  
  // Split by lines and parse SQL INSERT statements
  const lines = content.split('\n');
  let currentLesson = null;
  let collectingChallenge = false;
  let challengeText = '';
  let parenDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a lesson INSERT line (starts with lesson data)
    if (line.match(/^\('33333333-/)) {
      // Parse the line to extract title and challenge
      // Format: ('id','unit_id','title',display_order,'concept','example','mistake','science','challenge')
      
      // Use a simple state machine to extract fields
      let inString = false;
      let field = '';
      let fields = [];
      let escapeNext = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (escapeNext) {
          field += char;
          escapeNext = false;
          continue;
        }
        
        if (char === "'" && line[j + 1] === "'") {
          field += "'";
          escapeNext = true;
          continue;
        }
        
        if (char === "'") {
          inString = !inString;
          if (!inString && field) {
            fields.push(field);
            field = '';
          }
          continue;
        }
        
        if (inString) {
          field += char;
        }
      }
      
      if (fields.length >= 7) {
        const title = fields[2];
        const challenge = fields[6];
        
        currentLesson = { title, challenge };
        lessons.push(currentLesson);
      }
    }
  }
  
  return lessons;
}

function analyzeChallenge(challengeText, title) {
  const issues = [];
  
  // Check 1: Length (should be 50-75 words per design doc)
  const wordCount = challengeText.split(/\s+/).length;
  if (wordCount < 30) {
    issues.push(`Too short (${wordCount} words) - may lack detail`);
  } else if (wordCount > 100) {
    issues.push(`Too long (${wordCount} words) - may be overwhelming`);
  }
  
  // Check 2: Immediacy triggers
  const immediacyTriggers = ['right now', 'today', 'next time', 'this week', 'before you', 'in your next', 'set a timer', 'tonight', 'tomorrow'];
  const hasImmediacyTrigger = immediacyTriggers.some(trigger => 
    challengeText.toLowerCase().includes(trigger)
  );
  if (!hasImmediacyTrigger) {
    issues.push('Missing immediacy trigger (right now, today, next time)');
  }
  
  // Check 3: Time-bound language
  const timeIndicators = ['minute', 'second', 'hour', 'day', 'week', 'tomorrow', 'tonight'];
  const hasTimebound = timeIndicators.some(indicator => 
    challengeText.toLowerCase().includes(indicator)
  );
  if (!hasTimebound) {
    issues.push('Not clearly time-bound');
  }
  
  // Check 4: Specific action verbs
  const actionVerbs = ['write', 'record', 'call', 'send', 'ask', 'do', 'try', 'practice', 'track', 'list', 'set', 'count', 'notice', 'say', 'tell', 'read', 'open', 'identify', 'pick', 'answer', 'take', 'go'];
  const hasActionVerb = actionVerbs.some(verb => 
    challengeText.toLowerCase().includes(verb)
  );
  if (!hasActionVerb) {
    issues.push('Lacks clear action verb');
  }
  
  // Check 5: Reflection prompt
  const reflectionPrompts = ['notice', 'observe', 'pay attention', 'watch', 'feel', 'see what happens'];
  const hasReflection = reflectionPrompts.some(prompt => 
    challengeText.toLowerCase().includes(prompt)
  );
  if (!hasReflection) {
    issues.push('Missing reflection prompt (notice, observe)');
  }
  
  // Check 6: Vague language to avoid
  const vagueWords = ['try to', 'work on', 'think about', 'consider', 'start thinking', 'be more'];
  const hasVague = vagueWords.some(vague => 
    challengeText.toLowerCase().includes(vague)
  );
  if (hasVague) {
    issues.push('Contains vague language (try to, work on, think about)');
  }
  
  // Check 7: Success metrics
  const hasMetric = /\d+|count|number|baseline|measure|how many/i.test(challengeText);
  
  return {
    title,
    wordCount,
    hasImmediacy: hasImmediacyTrigger,
    hasTimebound,
    hasActionVerb,
    hasReflection,
    hasVague,
    hasMetric,
    issues,
    challengePreview: challengeText.length > 200 ? challengeText.substring(0, 200) + '...' : challengeText
  };
}

function generateReport(lessons) {
  console.log('='.repeat(80));
  console.log('CHALLENGE CARD ACTIONABILITY REVIEW - ALL LESSONS');
  console.log('='.repeat(80));
  console.log();
  
  const stats = {
    hasImmediacy: 0,
    hasTimebound: 0,
    hasActionVerb: 0,
    hasReflection: 0,
    hasVague: 0,
    hasMetric: 0,
    wordCountOk: 0,
    noIssues: 0
  };
  
  const allIssues = [];
  
  for (const lesson of lessons) {
    const analysis = analyzeChallenge(lesson.challenge, lesson.title);
    
    if (analysis.hasImmediacy) stats.hasImmediacy++;
    if (analysis.hasTimebound) stats.hasTimebound++;
    if (analysis.hasActionVerb) stats.hasActionVerb++;
    if (analysis.hasReflection) stats.hasReflection++;
    if (analysis.hasVague) stats.hasVague++;
    if (analysis.hasMetric) stats.hasMetric++;
    if (analysis.wordCount >= 30 && analysis.wordCount <= 100) stats.wordCountOk++;
    if (analysis.issues.length === 0) stats.noIssues++;
    
    if (analysis.issues.length > 0) {
      allIssues.push(analysis);
    }
  }
  
  const total = lessons.length;
  
  console.log(`SUMMARY STATISTICS (${total} lessons analyzed)`);
  console.log('-'.repeat(80));
  console.log(`✓ Immediacy trigger present:    ${stats.hasImmediacy.toString().padStart(3)} / ${total} (${(stats.hasImmediacy/total*100).toFixed(1)}%)`);
  console.log(`✓ Time-bound language:          ${stats.hasTimebound.toString().padStart(3)} / ${total} (${(stats.hasTimebound/total*100).toFixed(1)}%)`);
  console.log(`✓ Clear action verb:            ${stats.hasActionVerb.toString().padStart(3)} / ${total} (${(stats.hasActionVerb/total*100).toFixed(1)}%)`);
  console.log(`✓ Reflection prompt:            ${stats.hasReflection.toString().padStart(3)} / ${total} (${(stats.hasReflection/total*100).toFixed(1)}%)`);
  console.log(`✓ Success metric/measurement:   ${stats.hasMetric.toString().padStart(3)} / ${total} (${(stats.hasMetric/total*100).toFixed(1)}%)`);
  console.log(`✓ Appropriate word count:       ${stats.wordCountOk.toString().padStart(3)} / ${total} (${(stats.wordCountOk/total*100).toFixed(1)}%)`);
  console.log(`✗ Contains vague language:      ${stats.hasVague.toString().padStart(3)} / ${total} (${(stats.hasVague/total*100).toFixed(1)}%)`);
  console.log(`✓ NO ISSUES FOUND:              ${stats.noIssues.toString().padStart(3)} / ${total} (${(stats.noIssues/total*100).toFixed(1)}%)`);
  console.log();
  
  if (allIssues.length > 0) {
    console.log(`CHALLENGES WITH ISSUES (${allIssues.length} lessons need attention)`);
    console.log('-'.repeat(80));
    
    const showCount = Math.min(25, allIssues.length);
    for (let i = 0; i < showCount; i++) {
      const issue = allIssues[i];
      console.log(`\n${i + 1}. ${issue.title}`);
      console.log(`   Word count: ${issue.wordCount}`);
      for (const iss of issue.issues) {
        console.log(`   ⚠ ${iss}`);
      }
      console.log(`   Challenge: ${issue.challengePreview}`);
    }
    
    if (allIssues.length > showCount) {
      console.log(`\n... and ${allIssues.length - showCount} more challenges with issues`);
    }
  } else {
    console.log('✓ ALL CHALLENGES PASS QUALITY CHECKS');
  }
  
  console.log();
  console.log('='.repeat(80));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(80));
  console.log();
  
  if (stats.hasImmediacy < total * 0.9) {
    console.log('• Add immediacy triggers (right now, today, next time) to more challenges');
  }
  
  if (stats.hasTimebound < total * 0.85) {
    console.log('• Make challenges more time-bound (<10 minutes ideal)');
  }
  
  if (stats.hasReflection < total * 0.85) {
    console.log('• Add reflection prompts (notice what happens, observe, pay attention)');
  }
  
  if (stats.hasVague > total * 0.1) {
    console.log('• Replace vague language (try to, work on) with specific actions');
  }
  
  if (stats.hasMetric < total * 0.5) {
    console.log('• Add clearer success criteria so users know when they\'ve completed the challenge');
  }
  
  if (stats.noIssues >= total * 0.8) {
    console.log('✓ Challenges are in excellent shape - most meet all quality criteria');
  } else if (stats.noIssues >= total * 0.6) {
    console.log('⚠ Most challenges are good, but some need attention');
  } else {
    console.log('⚠ Significant number of challenges need enhancement');
  }
  
  console.log();
  console.log('='.repeat(80));
  console.log('COMPLETION STATUS');
  console.log('='.repeat(80));
  console.log();
  console.log(`Overall Quality Score: ${(stats.noIssues/total*100).toFixed(1)}% of challenges have no issues`);
  console.log();
  
  // Return stats for summary
  return { total, stats, issuesCount: allIssues.length };
}

function main() {
  try {
    const lessons = extractLessonsFromSQL('ascevo/supabase/lessons_all_pillars.sql');
    console.log(`Extracted ${lessons.length} lessons from SQL file\n`);
    
    const results = generateReport(lessons);
    
    // Write detailed results to file
    const reportPath = '.kiro/specs/lesson-content-enhancement/CHALLENGE_REVIEW_REPORT.md';
    const reportContent = `# Challenge Card Actionability Review

**Date**: ${new Date().toISOString().split('T')[0]}
**Total Lessons Analyzed**: ${results.total}

## Summary

- **Challenges with no issues**: ${results.stats.noIssues} / ${results.total} (${(results.stats.noIssues/results.total*100).toFixed(1)}%)
- **Challenges needing attention**: ${results.issuesCount}

## Quality Metrics

| Metric | Count | Percentage |
|--------|-------|------------|
| Immediacy trigger present | ${results.stats.hasImmediacy} | ${(results.stats.hasImmediacy/results.total*100).toFixed(1)}% |
| Time-bound language | ${results.stats.hasTimebound} | ${(results.stats.hasTimebound/results.total*100).toFixed(1)}% |
| Clear action verb | ${results.stats.hasActionVerb} | ${(results.stats.hasActionVerb/results.total*100).toFixed(1)}% |
| Reflection prompt | ${results.stats.hasReflection} | ${(results.stats.hasReflection/results.total*100).toFixed(1)}% |
| Success metric/measurement | ${results.stats.hasMetric} | ${(results.stats.hasMetric/results.total*100).toFixed(1)}% |
| Appropriate word count (30-100) | ${results.stats.wordCountOk} | ${(results.stats.wordCountOk/results.total*100).toFixed(1)}% |

## Status

${results.stats.noIssues >= results.total * 0.8 ? '✅ **PASS** - Challenges are in excellent shape' : 
  results.stats.noIssues >= results.total * 0.6 ? '⚠️ **NEEDS ATTENTION** - Most challenges are good, but some need work' :
  '❌ **NEEDS WORK** - Significant number of challenges need enhancement'}

## Next Steps

${results.issuesCount > 0 ? `Review the ${results.issuesCount} challenges flagged in the analysis output.` : 'All challenges meet quality criteria.'}
`;
    
    fs.writeFileSync(reportPath, reportContent);
    console.log(`\nDetailed report written to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
