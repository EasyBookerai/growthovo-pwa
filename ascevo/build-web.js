#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Growthovo PWA for web...');

try {
  // Use webpack directly via expo CLI
  console.log('Running webpack build via expo...');
  execSync('EXPO_USE_STATIC=true npx expo export:web --output-dir web-build', {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Build completed successfully!');
  console.log('Output directory: web-build');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
