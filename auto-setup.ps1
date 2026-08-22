# Growthovo Auto-Setup Script for Windows
# Run this with: powershell -ExecutionPolicy Bypass -File auto-setup.ps1

Write-Host "`n🚀 Growthovo Auto-Setup`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if in correct directory
if (-not (Test-Path "ascevo/package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found ascevo project" -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "ascevo/node_modules")) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
    Set-Location ascevo
    npm install
    Set-Location ..
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if .env exists
if (Test-Path "ascevo/.env") {
    Write-Host "`n✅ .env file exists" -ForegroundColor Green
    $overwrite = Read-Host "Do you want to reconfigure it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Keeping existing configuration" -ForegroundColor Green
        Write-Host "`n✅ Setup complete! Run: cd ascevo; npm start`n" -ForegroundColor Cyan
        exit 0
    }
}

# Run interactive setup wizard
Write-Host "`n📝 Running interactive setup wizard...`n" -ForegroundColor Yellow
node setup-wizard.js

Write-Host "`n✅ Auto-setup complete!`n" -ForegroundColor Green
Write-Host "Next: Follow the steps shown above to setup your database." -ForegroundColor Cyan
Write-Host "`n"
