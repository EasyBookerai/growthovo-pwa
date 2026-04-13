#!/bin/bash

# ============================================================================
# GROWTHOVO Security Check Script
# ============================================================================
# Run this before pushing to GitHub to verify no secrets are exposed
# Usage: ./scripts/security-check.sh
# ============================================================================

set -e

echo "🔒 GROWTHOVO Security Check"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Function to print error
error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

echo "1. Checking for .env files..."
if git ls-files | grep -E "^\.env$|^\.env\.local$|^\.env\.production$" > /dev/null 2>&1; then
    error "Found .env files in repository!"
    git ls-files | grep -E "^\.env"
else
    success "No .env files found"
fi
echo ""

echo "2. Checking for hardcoded API keys..."
if git grep -E "(sk_live_|sk_test_|pk_live_|pk_test_|whsec_)" -- "*.ts" "*.tsx" "*.js" "*.jsx" > /dev/null 2>&1; then
    error "Found potential Stripe secrets in code!"
    git grep -n -E "(sk_live_|sk_test_|pk_live_|pk_test_|whsec_)" -- "*.ts" "*.tsx" "*.js" "*.jsx"
else
    success "No Stripe secrets found"
fi
echo ""

echo "3. Checking for JWT tokens..."
if git grep -E "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+" -- "*.ts" "*.tsx" "*.js" "*.jsx" > /dev/null 2>&1; then
    error "Found potential JWT tokens in code!"
    git grep -n -E "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" -- "*.ts" "*.tsx" "*.js" "*.jsx"
else
    success "No JWT tokens found"
fi
echo ""

echo "4. Checking for OpenAI API keys..."
if git grep -E "sk-proj-[A-Za-z0-9]{48,}" -- "*.ts" "*.tsx" "*.js" "*.jsx" > /dev/null 2>&1; then
    error "Found potential OpenAI API keys in code!"
    git grep -n -E "sk-proj-" -- "*.ts" "*.tsx" "*.js" "*.jsx"
else
    success "No OpenAI API keys found"
fi
echo ""

echo "5. Checking for database credentials..."
if git grep -E "(postgres|mongodb|mysql|redis)://[^:]+:[^@]+@" -- "*.ts" "*.tsx" "*.js" "*.jsx" > /dev/null 2>&1; then
    error "Found database URLs with credentials!"
    git grep -n -E "(postgres|mongodb|mysql|redis)://" -- "*.ts" "*.tsx" "*.js" "*.jsx"
else
    success "No database credentials found"
fi
echo ""

echo "6. Checking for private keys..."
if git ls-files | grep -E "\.(pem|key|p12|pfx|jks|keystore)$" > /dev/null 2>&1; then
    error "Found private key files in repository!"
    git ls-files | grep -E "\.(pem|key|p12|pfx|jks|keystore)$"
else
    success "No private key files found"
fi
echo ""

echo "7. Verifying .gitignore..."
if [ ! -f "ascevo/.gitignore" ]; then
    error ".gitignore file not found!"
elif ! grep -q "^\.env$" ascevo/.gitignore; then
    error ".gitignore missing .env exclusion!"
elif ! grep -q "^\*\.secret$" ascevo/.gitignore; then
    error ".gitignore missing *.secret exclusion!"
else
    success ".gitignore properly configured"
fi
echo ""

echo "8. Checking for test output files..."
if git ls-files | grep -E "test_output.*\.txt$|test-out.*\.txt$" > /dev/null 2>&1; then
    warning "Found test output files (should be in .gitignore)"
    git ls-files | grep -E "test_output.*\.txt$|test-out.*\.txt$"
else
    success "No test output files found"
fi
echo ""

echo "9. Checking git history for secrets..."
if git log --all --full-history -- "*.env" | grep -q "commit"; then
    warning "Found .env files in git history (may need cleanup)"
    echo "   Run: git log --all --full-history -- '*.env'"
else
    success "No .env files in git history"
fi
echo ""

echo "============================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Security check passed!${NC}"
    echo -e "${GREEN}Repository is safe to push to GitHub${NC}"
    exit 0
else
    echo -e "${RED}❌ Security check failed with $ERRORS error(s)${NC}"
    echo -e "${RED}Fix the issues above before pushing to GitHub${NC}"
    exit 1
fi
