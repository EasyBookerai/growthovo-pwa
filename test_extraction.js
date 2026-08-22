const fs = require('fs');

// Test extraction logic
const content = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf-8');

// Try simple regex approach that accounts for multi-line
const lessons = [];
let currentBuffer = '';
let inInsert = false;

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('INSERT INTO lessons')) {
    inInsert = true;
    continue;
  }
  
  if (inInsert) {
    currentBuffer += line + '\n';
    
    // Check if we've completed a lesson (ends with '), or ');)
    if (line.trim().endsWith('),') || line.trim().endsWith(');')) {
      // Extract from this buffer
      const match = currentBuffer.match(/\('33333333-[^']+','[^']+','([^']+)',\d+,/);
      if (match) {
        const title = match[1];
        
        // Extract challenge (5th field, ends with '),)
        // Split by '), to find each lesson
        const singleLesson = currentBuffer.split(/'\),/)[0];
        
        // Count the single-quoted strings - the 5th one is the challenge
        const quotes = singleLesson.match(/'((?:[^']|'')*)'/g);
        if (quotes && quotes.length >= 7) {
          const challengeQuoted = quotes[6]; // 0-indexed, so 6 is the 7th (challenge)
          const challenge = challengeQuoted
            .substring(1, challengeQuoted.length - 1) // Remove outer quotes
            .replace(/''/g, "'"); // Unescape
          
          lessons.push({ title, challenge: challenge.trim() });
        }
      }
      
      // Reset for next lesson
      if (line.trim().endsWith(');')) {
        inInsert = false;
      }
      currentBuffer = '';
    }
  }
}

console.log(`Extracted ${lessons.length} lessons`);

if (lessons.length > 0) {
  console.log('\nFirst 5 challenges:\n');
  for (let i = 0; i < Math.min(5, lessons.length); i++) {
    console.log(`${i+1}. ${lessons[i].title}`);
    console.log(`   Length: ${lessons[i].challenge.length} chars`);
    console.log(`   Preview: ${lessons[i].challenge.substring(0, 100)}...`);
    console.log();
  }
}
