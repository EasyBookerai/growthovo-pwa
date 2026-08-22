const fs = require('fs');

// Read the SQL files
const mainFile = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf8');
const fitnessFile = fs.readFileSync('.kiro/specs/lesson-content-enhancement/fitness_pillar.sql', 'utf8');

const allContent = mainFile + '\n' + fitnessFile;

// Extract character names (pattern: 'Name, Age,)
const namePattern = /'([A-Z][a-z]+), (\d{2}),/g;
const names = [];
let match;

while ((match = namePattern.exec(allContent)) !== null) {
  names.push({ name: match[1], age: match[2] });
}

// Count unique names
const uniqueNames = [...new Set(names.map(n => n.name))];

console.log('=== CHARACTER NAME DIVERSITY ANALYSIS ===\n');
console.log(`Total character examples found: ${names.length}`);
console.log(`Unique names: ${uniqueNames.length}\n`);

// Count frequency
const nameCounts = {};
names.forEach(n => {
  nameCounts[n.name] = (nameCounts[n.name] || 0) + 1;
});

console.log('Name frequency:');
Object.entries(nameCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([name, count]) => {
    console.log(`  ${name}: ${count}`);
  });

console.log('\n=== BODY IMAGE & FITNESS LANGUAGE CHECK ===\n');

// Check for problematic body image language
const problematicPatterns = [
  /\b(fat|skinny|thin|obese)\b/gi,
  /\b(lose weight|weight loss|diet|dieting)\b/gi,
  /\b(beach body|summer body|bikini body)\b/gi,
  /\b(attractive|unattractive|ugly|beautiful body)\b/gi,
  /\b(perfect body|ideal body|body goals)\b/gi,
];

const fitnessContent = fitnessFile;
console.log('Checking Fitness pillar for body image language...\n');

problematicPatterns.forEach((pattern, idx) => {
  const matches = fitnessContent.match(pattern);
  if (matches) {
    console.log(`Pattern ${idx + 1} matches:`, matches);
  }
});

console.log('\n=== GENDER/SEXUALITY/ABILITY ASSUMPTIONS CHECK ===\n');

// Check for gendered assumptions
const genderedPatterns = [
  /\b(boyfriend|girlfriend|husband|wife)\b/gi,
  /\b(he should|she should|men should|women should)\b/gi,
  /\b(boys|girls) (are|do|don't)\b/gi,
];

console.log('Checking for gendered assumptions...\n');
genderedPatterns.forEach((pattern, idx) => {
  const matches = allContent.match(pattern);
  if (matches) {
    console.log(`Gendered pattern ${idx + 1}:`, matches.slice(0, 10));
  }
});

console.log('\n=== CONTEXT & BACKGROUND DIVERSITY CHECK ===\n');

// Check for diverse contexts
const contexts = [
  /\b(student|university|college|class|seminar)\b/gi,
  /\b(work|job|career|office|professional)\b/gi,
  /\b(family|parent|mother|father|sibling)\b/gi,
  /\b(friend|friendship|social)\b/gi,
];

contexts.forEach((pattern, idx) => {
  const matches = allContent.match(pattern);
  if (matches) {
    console.log(`Context ${idx + 1}: ${matches.length} references`);
  }
});

console.log('\n=== COMPLETED ===');
