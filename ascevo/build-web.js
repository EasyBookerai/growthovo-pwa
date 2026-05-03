#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Growthovo PWA for web with Expo...');

const outputDir = path.join(__dirname, 'web-build');
const distDir = path.join(__dirname, 'dist');

try {
  // Clean previous builds
  if (fs.existsSync(outputDir)) {
    console.log('Cleaning previous web-build...');
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  if (fs.existsSync(distDir)) {
    console.log('Cleaning previous dist...');
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  // Export with Expo (creates dist folder)
  console.log('Exporting React Native Web bundle with Expo...');
  execSync('npx expo export --platform web --output-dir dist', {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Move dist to web-build for Vercel
  if (fs.existsSync(distDir)) {
    console.log('Moving dist to web-build...');
    fs.renameSync(distDir, outputDir);
  }

  // Verify build output
  if (!fs.existsSync(outputDir)) {
    throw new Error('Build output directory not created');
  }

  const files = fs.readdirSync(outputDir);
  console.log(`\n✅ Build completed successfully!`);
  console.log(`Output directory: web-build`);
  console.log(`Files generated: ${files.length}`);
  
  // Create success marker
  fs.writeFileSync(
    path.join(outputDir, '.build-complete'), 
    JSON.stringify({
      timestamp: new Date().toISOString(),
      files: files.length,
      buildType: 'expo-export-web'
    }, null, 2)
  );
  
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Ensure Expo is installed: npm install expo');
  console.error('2. Check that all dependencies are installed: npm install --legacy-peer-deps');
  console.error('3. Verify app.json web configuration');
  console.error('\nFull error:');
  console.error(error.stack);
  process.exit(1);
}

