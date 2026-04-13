#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Growthovo PWA for web...');

try {
  // Use expo export with web platform
  console.log('Running expo export for web...');
  execSync('npx expo export --platform web --output-dir web-build', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('✅ Build completed successfully!');
  console.log('Output directory: web-build');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
