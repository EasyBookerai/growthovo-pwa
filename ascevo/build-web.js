#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Building Growthovo PWA for web...');

const outputDir = path.join(__dirname, 'web-build');
const publicDir = path.join(__dirname, 'public');

// Recursive copy function
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`Source directory ${src} does not exist, skipping...`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${entry.name}`);
    }
  }
}

try {
  // Clean previous build
  if (fs.existsSync(outputDir)) {
    console.log('Cleaning previous build...');
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Copy public files
  console.log('Copying static files...');
  copyRecursive(publicDir, outputDir);

  // Create a simple success marker
  fs.writeFileSync(
    path.join(outputDir, '.build-complete'), 
    JSON.stringify({
      timestamp: new Date().toISOString(),
      buildType: 'static-html-with-navigation',
      note: 'Static HTML build with working navigation'
    }, null, 2)
  );
  
  console.log('\n✅ Build completed successfully!');
  console.log('Output directory: web-build');
  console.log('Files:', fs.readdirSync(outputDir));
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}


