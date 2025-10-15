#!/bin/bash

# Simple Deployment Script for Garissa County PMD
# NO Java required - Pure web application
# Works with Python (already on Mac) or any web server

echo "🚀 Garissa County PMD - Simple Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}This is a JavaScript (not Java) web application${NC}"
echo -e "${BLUE}No Java installation required!${NC}"
echo ""

# Check for Python (comes with Mac)
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✓ Python3 detected${NC}"
    HAS_PYTHON=true
else
    echo -e "${YELLOW}⚠ Python3 not found${NC}"
    HAS_PYTHON=false
fi

# Check for Git
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓ Git detected${NC}"
    HAS_GIT=true
else
    echo -e "${YELLOW}⚠ Git not found${NC}"
    HAS_GIT=false
fi

echo ""
echo "==================================="
echo "DEPLOYMENT OPTIONS (Choose One):"
echo "==================================="
echo ""

echo "📦 OPTION 1: LOCAL TESTING (Instant)"
echo "────────────────────────────────────"
echo "Run this command to test locally:"
if [ "$HAS_PYTHON" = true ]; then
    echo -e "${GREEN}python3 -m http.server 8000${NC}"
    echo "Then open: http://localhost:8000"
else
    echo "Install Python3 first or use option 2"
fi
echo ""

echo "🌐 OPTION 2: GITHUB PAGES (Recommended - FREE)"
echo "────────────────────────────────────────────"
echo "Steps:"
echo "1. Make sure you're logged into GitHub"
echo "2. Go to your repository settings:"
echo "   https://github.com/jmsmuigai/GARISSA-PROJECTS-MONITORING-DASHBOARD/settings/pages"
echo "3. Under 'Source', select: main branch"
echo "4. Click 'Save'"
echo "5. Your site will be live at:"
echo "   https://jmsmuigai.github.io/GARISSA-PROJECTS-MONITORING-DASHBOARD/"
echo ""

echo "🔥 OPTION 3: NETLIFY DROP (Easiest - FREE)"
echo "─────────────────────────────────────────"
echo "1. Go to: https://app.netlify.com/drop"
echo "2. Drag this entire Dashboard folder"
echo "3. Done! You'll get a URL instantly"
echo ""

echo "⚡ OPTION 4: VERCEL (Fast - FREE)"
echo "──────────────────────────────────"
echo "1. Go to: https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Click Deploy"
echo ""

echo "==================================="
echo "QUICK START:"
echo "==================================="
echo ""

# Offer to start local server
if [ "$HAS_PYTHON" = true ]; then
    echo "Would you like to start local testing now? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo ""
        echo -e "${GREEN}Starting local server...${NC}"
        echo "Open your browser to: http://localhost:8000"
        echo "Press Ctrl+C to stop the server"
        echo ""
        echo "Default login:"
        echo "  UPN: 123456789"
        echo "  Password: Admin.123!"
        echo ""
        cd "$(dirname "$0")"
        python3 -m http.server 8000
    fi
fi

echo ""
echo "==================================="
echo "CONFIGURATION NEEDED:"
echo "==================================="
echo ""
echo "Before deploying to production, update:"
echo "1. firebase-config.js - Add your Firebase credentials"
echo "2. utils.js - Add your Gemini API key"
echo ""
echo "Get Firebase config: https://console.firebase.google.com"
echo "Get Gemini API key: https://makersuite.google.com/app/apikey"
echo ""

echo "==================================="
echo "IMPORTANT NOTES:"
echo "==================================="
echo ""
echo "✓ This is a JavaScript application (NOT Java)"
echo "✓ No Java installation required"
echo "✓ Works in any modern web browser"
echo "✓ Can be hosted on any static file server"
echo "✓ All processing happens in the browser"
echo ""

echo -e "${GREEN}Ready to deploy! Choose your preferred option above.${NC}"

