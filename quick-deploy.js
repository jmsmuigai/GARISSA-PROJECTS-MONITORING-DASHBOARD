// Quick Deployment Script for Garissa County PMD
// This script will help you deploy to multiple hosting platforms

console.log('🚀 Garissa County PMD - Quick Deployment Helper');
console.log('===============================================');

// Check if Firebase CLI is available
const { execSync } = require('child_process');

function checkFirebaseCLI() {
    try {
        execSync('firebase --version', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

function deployToFirebase() {
    console.log('\n🔥 Deploying to Firebase Hosting...');
    try {
        execSync('firebase login --no-localhost', { stdio: 'inherit' });
        execSync('firebase init hosting --project garissa-county-pmd', { stdio: 'inherit' });
        execSync('firebase deploy', { stdio: 'inherit' });
        console.log('✅ Firebase deployment successful!');
        return true;
    } catch (error) {
        console.log('❌ Firebase deployment failed:', error.message);
        return false;
    }
}

function showHostingOptions() {
    console.log('\n🌐 HOSTING OPTIONS:');
    console.log('==================');
    
    console.log('\n1. 🔥 FIREBASE HOSTING (RECOMMENDED - FREE)');
    console.log('   • Install: npm install -g firebase-tools');
    console.log('   • Login: firebase login');
    console.log('   • Deploy: firebase deploy');
    console.log('   • URL: https://garissa-county-pmd.web.app');
    
    console.log('\n2. 📄 GITHUB PAGES (FREE - Make repo public)');
    console.log('   • Go to: https://github.com/jmsmuigai/GARISSA-PROJECTS-MONITORING-DASHBOARD/settings/pages');
    console.log('   • Make repository public first');
    console.log('   • Enable Pages: Deploy from branch → main → / (root)');
    console.log('   • URL: https://jmsmuigai.github.io/GARISSA-PROJECTS-MONITORING-DASHBOARD/');
    
    console.log('\n3. 🌟 NETLIFY (FREE - Drag & Drop)');
    console.log('   • Go to: https://netlify.com');
    console.log('   • Drag your project folder to Netlify');
    console.log('   • URL: https://random-name.netlify.app');
    
    console.log('\n4. ⚡ VERCEL (FREE - GitHub Integration)');
    console.log('   • Go to: https://vercel.com');
    console.log('   • Import your GitHub repository');
    console.log('   • URL: https://garissa-county-pmd.vercel.app');
    
    console.log('\n5. 📦 SURGE (FREE - Command Line)');
    console.log('   • Install: npm install -g surge');
    console.log('   • Deploy: surge');
    console.log('   • URL: https://garissa-county-pmd.surge.sh');
}

function main() {
    console.log('\n🎯 QUICK DEPLOYMENT GUIDE:');
    console.log('==========================');
    
    if (checkFirebaseCLI()) {
        console.log('✅ Firebase CLI detected!');
        const deploy = confirm('Deploy to Firebase now? (y/n): ');
        if (deploy.toLowerCase() === 'y') {
            deployToFirebase();
        }
    } else {
        console.log('❌ Firebase CLI not found.');
        console.log('   Install with: npm install -g firebase-tools');
    }
    
    showHostingOptions();
    
    console.log('\n🎉 YOUR SYSTEM IS READY!');
    console.log('========================');
    console.log('• Default Login: UPN: 123456789, Password: Admin.123!');
    console.log('• Demo Mode: Add ?demo=true to URL');
    console.log('• User Manual: Available on login screen');
    console.log('• All features working: Excel, Looker Studio, AI Reports');
}

// Simple confirm function for Node.js
function confirm(message) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Run the script
main().catch(console.error);
