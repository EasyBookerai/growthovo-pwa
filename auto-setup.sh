#!/bin/bash

# Growthovo Auto-Setup Script for Mac/Linux
# Run this with: bash auto-setup.sh

echo ""
echo "🚀 Growthovo Auto-Setup"
echo ""

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js installed: $NODE_VERSION"

# Check if in correct directory
if [ ! -f "ascevo/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Found ascevo project"

# Check if node_modules exists
if [ ! -d "ascevo/node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    cd ascevo
    npm install
    cd ..
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env exists
if [ -f "ascevo/.env" ]; then
    echo ""
    echo "✅ .env file exists"
    read -p "Do you want to reconfigure it? (y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Keeping existing configuration"
        echo ""
        echo "✅ Setup complete! Run: cd ascevo && npm start"
        echo ""
        exit 0
    fi
fi

# Run interactive setup wizard
echo ""
echo "📝 Running interactive setup wizard..."
echo ""
node setup-wizard.js

echo ""
echo "✅ Auto-setup complete!"
echo ""
echo "Next: Follow the steps shown above to setup your database."
echo ""
