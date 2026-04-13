#!/usr/bin/env node

/**
 * Growthovo Setup Verification Script
 * 
 * This script checks if all prerequisites are met for running integration tests.
 * Run with: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Growthovo Setup Verification\n');
console.log('=' .repeat(50));

let allChecksPass = true;

// Check 1: .env file exists
console.log('\n📄 Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  
  // Read and check for required variables
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const missingVars = requiredVars.filter(v => !envContent.includes(v));
  if (missingVars.length === 0) {
    console.log('✅ All required environment variables are present');
  } else {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    allChecksPass = false;
  }
} else {
  console.log('❌ .env file not found');
  console.log('   Create .env file from .env.example');
  allChecksPass = false;
}

// Check 2: node_modules exists
console.log('\n📦 Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ node_modules found');
  
  // Check for key dependencies
  const keyDeps = [
    '@supabase/supabase-js',
    'zustand',
    'react-native',
    'expo',
    'jest',
    'fast-check',
  ];
  
  const missingDeps = keyDeps.filter(dep => 
    !fs.existsSync(path.join(nodeModulesPath, dep))
  );
  
  if (missingDeps.length === 0) {
    console.log('✅ All key dependencies are installed');
  } else {
    console.log('⚠️  Some dependencies may be missing:', missingDeps.join(', '));
    console.log('   Run: npm install');
  }
} else {
  console.log('❌ node_modules not found');
  console.log('   Run: npm install');
  allChecksPass = false;
}

// Check 3: Supabase files exist
console.log('\n🗄️  Checking Supabase files...');
const supabaseFiles = [
  'supabase/schema.sql',
  'supabase/rls.sql',
  'supabase/seed.sql',
];

supabaseFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} not found`);
    allChecksPass = false;
  }
});

// Check 4: Test files exist
console.log('\n🧪 Checking test files...');
const testFiles = [
  'src/__tests__/integration.test.ts',
  'INTEGRATION_TEST_GUIDE.md',
];

testFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} not found`);
    allChecksPass = false;
  }
});

// Check 5: Core service files exist
console.log('\n⚙️  Checking core services...');
const serviceFiles = [
  'src/services/supabaseClient.ts',
  'src/services/authService.ts',
  'src/services/lessonService.ts',
  'src/services/progressService.ts',
  'src/services/streakService.ts',
  'src/services/heartService.ts',
  'src/services/challengeService.ts',
  'src/services/leagueService.ts',
  'src/services/squadService.ts',
  'src/services/notificationService.ts',
];

const missingServices = serviceFiles.filter(file => 
  !fs.existsSync(path.join(__dirname, file))
);

if (missingServices.length === 0) {
  console.log('✅ All core services are present');
} else {
  console.log('❌ Missing services:', missingServices.join(', '));
  allChecksPass = false;
}

// Check 6: Screen files exist
console.log('\n📱 Checking screen components...');
const screenFiles = [
  'src/screens/auth/SignInScreen.tsx',
  'src/screens/auth/SignUpScreen.tsx',
  'src/screens/onboarding/OnboardingScreen.tsx',
  'src/screens/home/HomeScreen.tsx',
  'src/screens/pillars/PillarsMapScreen.tsx',
  'src/screens/league/LeagueScreen.tsx',
  'src/screens/squad/SquadScreen.tsx',
  'src/screens/profile/ProfileScreen.tsx',
  'src/screens/settings/SettingsScreen.tsx',
  'src/screens/checkin/CheckInScreen.tsx',
  'src/screens/paywall/PaywallScreen.tsx',
];

const missingScreens = screenFiles.filter(file => 
  !fs.existsSync(path.join(__dirname, file))
);

if (missingScreens.length === 0) {
  console.log('✅ All screen components are present');
} else {
  console.log('⚠️  Missing screens:', missingScreens.join(', '));
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary\n');

if (allChecksPass) {
  console.log('✅ All critical checks passed!');
  console.log('\n📝 Next steps:');
  console.log('   1. Ensure Supabase project is set up');
  console.log('   2. Deploy schema.sql, rls.sql, and seed.sql to Supabase');
  console.log('   3. Deploy Edge Functions (rex-chat, stripe-webhook)');
  console.log('   4. Run tests: npm test');
  console.log('   5. Follow INTEGRATION_TEST_GUIDE.md for manual testing');
} else {
  console.log('❌ Some checks failed. Please address the issues above.');
  console.log('\n📝 Common fixes:');
  console.log('   • Create .env file from .env.example');
  console.log('   • Run: npm install');
  console.log('   • Ensure all Supabase SQL files are present');
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 For detailed testing instructions, see:');
console.log('   • INTEGRATION_TEST_GUIDE.md (manual testing)');
console.log('   • TASK_21_COMPLETION_REPORT.md (overview)');
console.log('   • src/__tests__/integration.test.ts (automated tests)\n');

process.exit(allChecksPass ? 0 : 1);
