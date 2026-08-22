#!/usr/bin/env node

/**
 * Growthovo Setup Verification
 * Checks if everything is configured correctly
 */

const fs = require('fs');
const path = require('path');

const CHECK = '✅';
const CROSS = '❌';
const WARN = '⚠️';

console.log('\n🔍 Growthovo Setup Verification\n');

let allGood = true;
let criticalIssues = [];
let warnings = [];

// Check 1: Node.js version
console.log('Checking Node.js...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`${CHECK} Node.js ${nodeVersion} (✓ compatible)`);
} else {
  console.log(`${CROSS} Node.js ${nodeVersion} (need 18+)`);
  criticalIssues.push('Upgrade Node.js to version 18 or higher');
  allGood = false;
}

// Check 2: Project structure
console.log('\nChecking project structure...');
const requiredDirs = [
  'ascevo',
  'ascevo/src',
  'ascevo/supabase',
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`${CHECK} ${dir}/`);
  } else {
    console.log(`${CROSS} ${dir}/ (missing)`);
    criticalIssues.push(`Directory missing: ${dir}`);
    allGood = false;
  }
});

// Check 3: Dependencies installed
console.log('\nChecking dependencies...');
if (fs.existsSync('ascevo/node_modules')) {
  console.log(`${CHECK} node_modules installed`);
  
  // Check package.json
  const packageJsonPath = path.join('ascevo', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
    console.log(`   ${depCount} dependencies + ${devDepCount} dev dependencies`);
  }
} else {
  console.log(`${CROSS} node_modules not installed`);
  criticalIssues.push('Run: cd ascevo && npm install');
  allGood = false;
}

// Check 4: Environment file
console.log('\nChecking environment configuration...');
const envPath = path.join('ascevo', '.env');
if (fs.existsSync(envPath)) {
  console.log(`${CHECK} .env file exists`);
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for placeholder values
  if (envContent.includes('YOUR_SUPABASE_URL_HERE')) {
    console.log(`${WARN} .env has placeholder values (not configured yet)`);
    warnings.push('Run: node setup-wizard.js to configure .env');
  } else {
    // Check for required variables
    const hasUrl = envContent.includes('EXPO_PUBLIC_SUPABASE_URL=') && 
                   !envContent.includes('EXPO_PUBLIC_SUPABASE_URL=\n') &&
                   !envContent.includes('EXPO_PUBLIC_SUPABASE_URL=#');
    const hasKey = envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY=') &&
                   !envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY=\n') &&
                   !envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY=#');
    
    if (hasUrl && hasKey) {
      console.log(`${CHECK} Supabase credentials configured`);
    } else {
      console.log(`${WARN} Supabase credentials incomplete`);
      warnings.push('Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env');
    }
    
    // Check OpenAI (optional)
    if (envContent.includes('OPENAI_API_KEY=sk-')) {
      console.log(`${CHECK} OpenAI API key configured (Rex AI enabled)`);
    } else {
      console.log(`${WARN} OpenAI API key not set (Rex will use fallbacks)`);
    }
  }
} else {
  console.log(`${CROSS} .env file missing`);
  criticalIssues.push('Run: node setup-wizard.js to create .env');
  allGood = false;
}

// Check 5: Database SQL files
console.log('\nChecking database setup files...');
const sqlFiles = [
  'ascevo/supabase/schema.sql',
  'ascevo/supabase/seed.sql',
  'ascevo/supabase/migrations/003_mascot_evolution_system.sql',
];

sqlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`${CHECK} ${path.basename(file)} (${sizeMB} MB)`);
  } else {
    console.log(`${CROSS} ${path.basename(file)} (missing)`);
    warnings.push(`SQL file missing: ${file}`);
  }
});

// Check 6: Combined SQL file (from wizard)
const combinedSqlPath = 'ascevo/setup-database.sql';
if (fs.existsSync(combinedSqlPath)) {
  console.log(`${CHECK} setup-database.sql (combined file ready)`);
} else {
  console.log(`${WARN} setup-database.sql not generated yet`);
  console.log(`   Run setup-wizard.js to create this file`);
}

// Check 7: Key source files
console.log('\nChecking key source files...');
const sourceFiles = [
  'ascevo/App.tsx',
  'ascevo/src/services/supabaseClient.ts',
  'ascevo/src/context/AppContext.tsx',
];

sourceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`${CHECK} ${file}`);
  } else {
    console.log(`${CROSS} ${file} (missing)`);
    criticalIssues.push(`Source file missing: ${file}`);
    allGood = false;
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('SUMMARY');
console.log('='.repeat(60));

if (criticalIssues.length === 0 && warnings.length === 0) {
  console.log(`\n${CHECK} All checks passed! Your setup looks good.\n`);
  console.log('Next steps:');
  console.log('1. If you haven\'t: Create Supabase project');
  console.log('2. If you haven\'t: Run "node setup-wizard.js"');
  console.log('3. Copy ascevo/setup-database.sql to Supabase SQL Editor');
  console.log('4. Run: cd ascevo && npm start');
  console.log('5. Press "w" to open in browser\n');
} else {
  if (criticalIssues.length > 0) {
    console.log(`\n${CROSS} Critical Issues (${criticalIssues.length}):\n`);
    criticalIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n${WARN} Warnings (${warnings.length}):\n`);
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}`);
    });
  }
  
  console.log('\nRecommended action:');
  if (criticalIssues.length > 0) {
    console.log('→ Fix critical issues above first');
  } else {
    console.log('→ Run: node setup-wizard.js');
  }
  console.log('');
}

// Exit code
process.exit(allGood && criticalIssues.length === 0 ? 0 : 1);
