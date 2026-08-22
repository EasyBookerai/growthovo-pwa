const fs = require('fs');

// Read the main SQL file
const mainFile = fs.readFileSync('ascevo/supabase/lessons_all_pillars.sql', 'utf8');

// Extract full examples with names, ages, and context
const examplePattern = /'([A-Z][a-z]+), (\d{2}),([^']+)'/g;
const examples = [];
let match;

while ((match = examplePattern.exec(mainFile)) !== null) {
  const name = match[1];
  const age = match[2];
  const context = match[3].substring(0, 200); // First 200 chars of the example
  
  examples.push({ name, age, context });
}

console.log('=== GENDER ROLE ANALYSIS ===\n');

// Likely female names (cultural analysis)
const femaleNames = ['Sofia', 'Lily', 'Ava', 'Emma', 'Zara', 'Priya', 'Mia', 'Aisha', 'Chloe', 'Grace', 'Lena', 'Ella', 'Maya', 'Elena', 'Sophia', 'Nia'];
const maleNames = ['Marcus', 'Noah', 'Jake', 'James', 'Ryan', 'Tom', 'Daniel', 'Ben', 'Leo', 'Liam', 'Ethan', 'Kai', 'Aiden', 'Chris', 'Luca'];
const ambiguousNames = ['Alex', 'Jordan', 'Riley', 'Taylor'];

// Analyze contexts for each gender
const femaleContexts = examples.filter(e => femaleNames.includes(e.name));
const maleContexts = examples.filter(e => maleNames.includes(e.name));

console.log(`Female-coded names: ${femaleContexts.length} examples`);
console.log(`Male-coded names: ${maleContexts.length} examples`);
console.log(`Gender balance: ${(femaleContexts.length / (femaleContexts.length + maleContexts.length) * 100).toFixed(1)}% female\n`);

// Check for stereotypical patterns
console.log('=== CHECKING FOR STEREOTYPES ===\n');

// Female vulnerability stereotype check
const femaleEmotionalWords = femaleContexts.filter(e => 
  /anxious|nervous|worried|scared|afraid|emotional|crying|cried/.test(e.context.toLowerCase())
);

const maleEmotionalWords = maleContexts.filter(e => 
  /anxious|nervous|worried|scared|afraid|emotional|crying|cried/.test(e.context.toLowerCase())
);

console.log(`Female examples with emotional vulnerability: ${femaleEmotionalWords.length} (${(femaleEmotionalWords.length/femaleContexts.length*100).toFixed(1)}%)`);
console.log(`Male examples with emotional vulnerability: ${maleEmotionalWords.length} (${(maleEmotionalWords.length/maleContexts.length*100).toFixed(1)}%)\n`);

// Leadership/assertiveness check
const femaleLeadership = femaleContexts.filter(e => 
  /manager|boss|lead|promoted|presentation|pitch|interview|CEO|director|team lead/.test(e.context.toLowerCase())
);

const maleLeadership = maleContexts.filter(e => 
  /manager|boss|lead|promoted|presentation|pitch|interview|CEO|director|team lead/.test(e.context.toLowerCase())
);

console.log(`Female examples in professional/leadership contexts: ${femaleLeadership.length} (${(femaleLeadership.length/femaleContexts.length*100).toFixed(1)}%)`);
console.log(`Male examples in professional/leadership contexts: ${maleLeadership.length} (${(maleLeadership.length/maleContexts.length*100).toFixed(1)}%)\n`);

// Technical/STEM check
const femaleTech = femaleContexts.filter(e => 
  /code|coding|programming|developer|engineer|tech|software|startup|bug|algorithm/.test(e.context.toLowerCase())
);

const maleTech = maleContexts.filter(e => 
  /code|coding|programming|developer|engineer|tech|software|startup|bug|algorithm/.test(e.context.toLowerCase())
);

console.log(`Female examples in technical contexts: ${femaleTech.length}`);
console.log(`Male examples in technical contexts: ${maleTech.length}\n`);

console.log('=== RELATIONSHIP & FAMILY ASSUMPTIONS ===\n');

// Check for heteronormative language
const relationshipMentions = mainFile.match(/\b(boyfriend|girlfriend|husband|wife|dating|romantic)\b/gi);
console.log('Heteronormative relationship terms found:', relationshipMentions ? relationshipMentions.length : 0);

if (relationshipMentions) {
  console.log('Examples:', relationshipMentions.slice(0, 10));
}

// Check for family assumptions
const familyAssumptions = mainFile.match(/\b(mother|father|parent|mom|dad|family)\b/gi);
console.log('\nFamily structure mentions:', familyAssumptions ? familyAssumptions.length : 0);

console.log('\n=== ABILITY & ACCESSIBILITY ===\n');

// Check for ableist language
const ableistPatterns = [
  /\b(crazy|insane|psycho|lame|dumb|stupid|idiot|moron)\b/gi,
  /\b(blind to|deaf to|crippled by)\b/gi,
];

ableistPatterns.forEach((pattern, idx) => {
  const matches = mainFile.match(pattern);
  if (matches) {
    console.log(`Potentially ableist pattern ${idx + 1}:`, matches);
  }
});

console.log('\n=== COMPLETED ===');
