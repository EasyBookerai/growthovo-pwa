#!/usr/bin/env node
/**
 * Extract all science cards from lessons SQL file for verification.
 */
const fs = require('fs');
const path = require('path');

function extractScienceCards(sqlFilePath) {
  const content = fs.readFileSync(sqlFilePath, 'utf-8');
  
  // Split by INSERT INTO lessons statements
  const insertPattern = /INSERT INTO lessons \(id, unit_id, title, display_order, card_concept, card_example, card_mistake, card_science, card_challenge\) VALUES\s*\n([\s\S]*?)(?=\n\n--|$)/g;
  
  const lessons = [];
  let match;
  
  while ((match = insertPattern.exec(content)) !== null) {
    const valuesBlock = match[1];
    
    // Extract each lesson entry (may be multiple in one INSERT statement)
    const lessonPattern = /\('(33333333-[^']+)','([^']+)','([^']+)',(\d+),\s*\n'([^']*(?:''[^']*)*)',\s*\n'([^']*(?:''[^']*)*)',\s*\n'([^']*(?:''[^']*)*)',\s*\n'([^']*(?:''[^']*)*)',\s*\n'([^']*(?:''[^']*)*?)'\)/g;
    
    let lessonMatch;
    while ((lessonMatch = lessonPattern.exec(valuesBlock)) !== null) {
      const lessonId = lessonMatch[1];
      const unitId = lessonMatch[2];
      const title = lessonMatch[3];
      const scienceCard = lessonMatch[8].replace(/''/g, "'"); // Unescape single quotes
      
      lessons.push({
        id: lessonId,
        unit_id: unitId,
        title,
        science_card: scienceCard
      });
    }
  }
  
  return lessons;
}

function extractPillarName(lessonId) {
  // Format: 33333333-PP00-00UU-0000-00000000000L
  const pillarCode = lessonId.substring(9, 11);
  const pillarMap = {
    '01': 'Mind',
    '02': 'Fitness',
    '03': 'Communication',
    '04': 'Money',
    '05': 'Career',
    '06': 'Relationships'
  };
  return pillarMap[pillarCode] || 'Unknown';
}

function main() {
  const sqlFile = 'ascevo/supabase/lessons_all_pillars.sql';
  const lessons = extractScienceCards(sqlFile);
  
  console.log(`Extracted ${lessons.length} lessons with science cards\n`);
  
  // Group by pillar
  const byPillar = {};
  lessons.forEach(lesson => {
    const pillar = extractPillarName(lesson.id);
    if (!byPillar[pillar]) {
      byPillar[pillar] = [];
    }
    byPillar[pillar].push(lesson);
  });
  
  // Write to markdown file for review
  let markdown = '# Science Cards Extraction for Verification\n\n';
  markdown += `Total lessons: ${lessons.length}\n\n`;
  
  Object.keys(byPillar).sort().forEach(pillar => {
    markdown += `\n## ${pillar} Pillar (${byPillar[pillar].length} lessons)\n\n`;
    byPillar[pillar].forEach((lesson, i) => {
      markdown += `### ${i + 1}. ${lesson.title}\n\n`;
      markdown += `**Lesson ID:** \`${lesson.id}\`\n\n`;
      markdown += `**Science Card:**\n${lesson.science_card}\n\n`;
      markdown += '**Verification Status:** [ ] Not checked\n\n';
      markdown += '**Issues Found:** None\n\n';
      markdown += '**Research Verification:**\n';
      markdown += '- Institution/Researcher mentioned: \n';
      markdown += '- Finding/Study: \n';
      markdown += '- Mechanism explained: \n';
      markdown += '- Accuracy: \n\n';
      markdown += '---\n\n';
    });
  });
  
  const outputPath = '.kiro/specs/lesson-content-enhancement/science_cards_extraction.md';
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(`Science cards written to: ${outputPath}`);
  
  // Save JSON for programmatic access
  const jsonPath = '.kiro/specs/lesson-content-enhancement/science_cards.json';
  fs.writeFileSync(jsonPath, JSON.stringify(lessons, null, 2), 'utf-8');
  console.log(`JSON data written to: ${jsonPath}`);
}

main();
