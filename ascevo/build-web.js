#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Growthovo PWA for web...');

const outputDir = path.join(__dirname, 'web-build');

try {
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Copy public files
  console.log('Copying static files...');
  const publicDir = path.join(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    execSync(`xcopy "${publicDir}" "${outputDir}" /E /I /Y`, { stdio: 'inherit' });
  }

  // Create a simple success marker
  fs.writeFileSync(path.join(outputDir, '.build-complete'), 'Build completed at ' + new Date().toISOString());
  
  console.log('✅ Build completed successfully!');
  console.log('Output directory: web-build');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
