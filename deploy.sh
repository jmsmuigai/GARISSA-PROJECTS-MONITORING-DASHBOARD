#!/bin/bash

# Garissa County PMD Deployment Script
# This script sets up the GitHub repository and deploys the application

echo "🚀 Setting up Garissa County Project Monitoring Dashboard..."

# Create GitHub repository
echo "📦 Creating GitHub repository..."

# Initialize git repository
git init
git add .
git commit -m "Initial commit: Garissa County PMD v1.0.0"

# Set up remote repository (you'll need to create this manually on GitHub first)
echo "⚠️  Please create a new repository on GitHub named 'garissa-county-pmd'"
echo "Then run: git remote add origin https://github.com/YOUR_USERNAME/garissa-county-pmd.git"
echo "And: git push -u origin main"

# Create package.json for Firebase deployment
cat > package.json << EOF
{
  "name": "garissa-county-pmd",
  "version": "1.0.0",
  "description": "Garissa County Project Monitoring Dashboard",
  "main": "index.html",
  "scripts": {
    "start": "python3 -m http.server 8000",
    "deploy": "firebase deploy",
    "build": "echo 'No build process needed for static files'"
  },
  "keywords": [
    "garissa",
    "county",
    "dashboard",
    "project-monitoring",
    "kenya",
    "firebase",
    "gis"
  ],
  "author": "James Mukoma <jmsmuigai@gmail.com>",
  "license": "MIT",
  "devDependencies": {
    "firebase-tools": "^12.0.0"
  }
}
EOF

# Create firebase.json for hosting
cat > firebase.json << EOF
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "deploy.sh",
      "*.md"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
EOF

# Create .gitignore
cat > .gitignore << EOF
# Firebase
.firebase/
firebase-debug.log
firebase-debug.*.log

# Node modules
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
EOF

# Create deployment instructions
cat > DEPLOYMENT.md << EOF
# Deployment Instructions

## Prerequisites
1. Node.js and npm installed
2. Firebase CLI installed: \`npm install -g firebase-tools\`
3. Git installed

## Setup Steps

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project named "garissa-county-pmd"
3. Enable Authentication (Email/Password and Google)
4. Create Firestore database
5. Get your Firebase config and update \`firebase-config.js\`

### 2. Gemini AI Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Get your Gemini API key
3. Update \`firebase-config.js\` with your API key

### 3. GitHub Repository
1. Create new repository on GitHub
2. Push your code:
   \`\`\`bash
   git remote add origin https://github.com/YOUR_USERNAME/garissa-county-pmd.git
   git push -u origin main
   \`\`\`

### 4. Firebase Hosting Deployment
\`\`\`bash
firebase login
firebase init hosting
firebase deploy
\`\`\`

### 5. First Admin User Setup
1. Deploy the application
2. Use default credentials:
   - UPN: 123456789
   - Password: Admin.123!
3. Create additional users through the admin panel

## Custom Domain (Optional)
1. Go to Firebase Console > Hosting
2. Add custom domain
3. Update DNS records as instructed

## SSL Certificate
Firebase automatically provides SSL certificates for all domains.

## Environment Variables
No environment variables needed - all configuration is in the client-side files.

## Monitoring
- Firebase Console provides usage analytics
- Firestore usage monitoring
- Authentication logs
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create Firebase project and update firebase-config.js"
echo "2. Get Gemini API key and update firebase-config.js"
echo "3. Create GitHub repository and push code"
echo "4. Run 'firebase deploy' to deploy to hosting"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
echo "📖 See README.md for usage guide"
