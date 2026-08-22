#!/usr/bin/env node
/**
 * Simple extractor for challenge cards - reads SQL and extracts challenges
 */

const fs = require('fs');

function extractChallenges() {
  const content = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf-8');
  
  // Split into individual lessons using the pattern that each lesson starts with ('33333333-
  const lessonPattern = /\('33333333-[^']+','[^']+','([^']+)',\d+,\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)',\s*'((?:[^']|'')*)'\),?/g;
  
  const lessons = [];
  let match;
  
  while ((match = lessonPattern.exec(content)) !== null) {
    const title = match[1];
    const challenge = match[6].replace(/''/g, "'"); // Unescape SQL quotes
    
    lessons.push({ title, challenge });
  }
  
  return lessons;
}

console.log('Attempting to extract lessons...');
const lessons = extractChallenges();
console.log(`Found ${lessons.length} lessons`);

if (lessons.length > 0) {
  console.log('\nSample (first 3 challenges):');
  for (let i = 0; i < Math.min(3, lessons.length); i++) {
    console.log(`\n${i+1}. ${lessons[i].title}`);
    console.log(`   ${lessons[i].challenge.substring(0, 150)}...`);
  }
}
