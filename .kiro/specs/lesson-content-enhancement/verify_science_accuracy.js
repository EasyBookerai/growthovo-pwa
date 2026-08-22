#!/usr/bin/env node
/**
 * Analyze science cards for accuracy and rigor.
 * Identifies cards with specific citations vs vague claims.
 */
const fs = require('fs');

function analyzeScienceCard(card) {
  const issues = [];
  const strengths = [];
  
  // Check for specific research institutions
  const institutions = [
    'Harvard', 'Stanford', 'MIT', 'Yale', 'Cambridge', 'Oxford',
    'Princeton', 'Berkeley', 'Chicago', 'Columbia', 'University',
    'Institute', 'College', 'Academy', 'Lab', 'Laboratory'
  ];
  
  const hasInstitution = institutions.some(inst => 
    card.includes(inst)
  );
  
  // Check for researcher names (capitalized words that might be names)
  const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
  const potentialNames = card.match(namePattern) || [];
  const hasResearcher = potentialNames.length > 0;
  
  // Check for specific numbers/percentages
  const numberPattern = /\d+%|\d+x|\d+\.\d+|\d+ percent/g;
  const numbers = card.match(numberPattern) || [];
  const hasSpecificNumbers = numbers.length > 0;
  
  // Check for vague phrases that signal weak claims
  const vagueLanguage = [
    'research shows',
    'studies show',
    'research suggests',
    'studies suggest',
    'research indicates',
    'studies indicate',
    'research on',
    'studies on'
  ];
  
  const hasVagueLanguage = vagueLanguage.some(phrase =>
    card.toLowerCase().includes(phrase)
  );
  
  // Check for mechanism explanation keywords
  const mechanismKeywords = [
    'mechanism', 'because', 'when', 'activates', 'triggers',
    'produces', 'releases', 'increases', 'decreases', 'affects',
    'cortisol', 'dopamine', 'serotonin', 'amygdala', 'prefrontal',
    'neural', 'brain', 'cognitive', 'psychological'
  ];
  
  const hasMechanism = mechanismKeywords.some(keyword =>
    card.toLowerCase().includes(keyword)
  );
  
  // Scoring
  let score = 0;
  let category = '';
  
  if (hasInstitution) {
    strengths.push('Mentions specific institution');
    score += 2;
  } else {
    issues.push('No specific research institution mentioned');
  }
  
  if (hasResearcher) {
    strengths.push(`Mentions potential researcher name(s): ${potentialNames.join(', ')}`);
    score += 2;
  } else {
    issues.push('No specific researcher name mentioned');
  }
  
  if (hasSpecificNumbers) {
    strengths.push(`Includes specific data: ${numbers.join(', ')}`);
    score += 1;
  } else {
    issues.push('No specific numbers or percentages cited');
  }
  
  if (hasMechanism) {
    strengths.push('Explains mechanism or "how it works"');
    score += 1;
  } else {
    issues.push('Does not explain mechanism');
  }
  
  if (hasVagueLanguage && !hasInstitution && !hasResearcher) {
    issues.push('Uses vague "research shows" without specific citation');
    score -= 1;
  }
  
  // Categorize
  if (score >= 4) {
    category = 'STRONG - Specific citation';
  } else if (score >= 2) {
    category = 'MODERATE - Some specificity';
  } else {
    category = 'WEAK - Vague or unverifiable';
  }
  
  return {
    score,
    category,
    strengths,
    issues,
    hasInstitution,
    hasResearcher,
    hasSpecificNumbers,
    hasMechanism
  };
}

function main() {
  const jsonPath = '.kiro/specs/lesson-content-enhancement/science_cards.json';
  const lessons = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  
  console.log(`Analyzing ${lessons.length} science cards...\n`);
  
  const analyzed = lessons.map(lesson => {
    const analysis = analyzeScienceCard(lesson.science_card);
    return {
      ...lesson,
      analysis
    };
  });
  
  // Group by category
  const byCategory = {
    strong: analyzed.filter(l => l.analysis.category.startsWith('STRONG')),
    moderate: analyzed.filter(l => l.analysis.category.startsWith('MODERATE')),
    weak: analyzed.filter(l => l.analysis.category.startsWith('WEAK'))
  };
  
  console.log('=== SUMMARY ===');
  console.log(`Strong citations: ${byCategory.strong.length}`);
  console.log(`Moderate citations: ${byCategory.moderate.length}`);
  console.log(`Weak/vague citations: ${byCategory.weak.length}`);
  console.log('');
  
  // Write detailed report
  let report = '# Science Card Accuracy Verification Report\n\n';
  report += `**Total Lessons Analyzed:** ${lessons.length}\n\n`;
  report += `**Strong Citations (specific institution/researcher):** ${byCategory.strong.length}\n`;
  report += `**Moderate Citations (some specificity):** ${byCategory.moderate.length}\n`;
  report += `**Weak Citations (vague/unverifiable):** ${byCategory.weak.length}\n\n`;
  
  report += '## Summary of Issues\n\n';
  
  // Count specific issues
  const allIssues = analyzed.flatMap(l => l.analysis.issues);
  const issueCounts = {};
  allIssues.forEach(issue => {
    issueCounts[issue] = (issueCounts[issue] || 0) + 1;
  });
  
  Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([issue, count]) => {
      report += `- ${issue}: ${count} lessons\n`;
    });
  
  report += '\n---\n\n';
  
  // Detailed breakdown
  ['weak', 'moderate', 'strong'].forEach(category => {
    const lessons = byCategory[category];
    if (lessons.length === 0) return;
    
    report += `## ${category.toUpperCase()} CITATIONS (${lessons.length} lessons)\n\n`;
    
    lessons.forEach((lesson, i) => {
      report += `### ${i + 1}. ${lesson.title}\n\n`;
      report += `**Category:** ${lesson.analysis.category}\n`;
      report += `**Score:** ${lesson.analysis.score}/6\n\n`;
      
      if (lesson.analysis.strengths.length > 0) {
        report += '**Strengths:**\n';
        lesson.analysis.strengths.forEach(s => report += `- ${s}\n`);
        report += '\n';
      }
      
      if (lesson.analysis.issues.length > 0) {
        report += '**Issues:**\n';
        lesson.analysis.issues.forEach(i => report += `- ${i}\n`);
        report += '\n';
      }
      
      report += `**Science Card Content:**\n> ${lesson.science_card}\n\n`;
      report += '---\n\n';
    });
  });
  
  const reportPath = '.kiro/specs/lesson-content-enhancement/SCIENCE_ACCURACY_REPORT.md';
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`Detailed report written to: ${reportPath}`);
  
  // Save analyzed data
  const analyzedPath = '.kiro/specs/lesson-content-enhancement/science_cards_analyzed.json';
  fs.writeFileSync(analyzedPath, JSON.stringify(analyzed, null, 2), 'utf-8');
  console.log(`Analyzed data written to: ${analyzedPath}`);
}

main();
