// Firebase Setup Script for Garissa County PMD
// This script helps initialize the Firebase project with default data

// Default admin user data
const defaultAdminUser = {
    email: "jmsmuigai@gmail.com",
    upn: "123456789",
    role: "superadmin",
    department: "County Executive",
    createdAt: new Date().toISOString()
};

// Sample projects data for initial setup
const sampleProjects = [
    {
        name: "Construction of New Borehole in Bura East",
        description: "Drilling and equipping of a new borehole with solar pump and water kiosk to serve 500 households",
        subCounty: "Bura East",
        ward: "Bura East",
        location: { latitude: -0.7500, longitude: 40.1667 },
        department: "Water, Environment, Climate change & Natural Resources",
        status: "Ongoing",
        startDate: "2024-05-10",
        expectedCompletionDate: "2025-02-28",
        budget: 5500000,
        expenditure: 1200000,
        sourceOfFunds: "Garissa County Government",
        createdAt: new Date().toISOString(),
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: new Date().toISOString(),
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-BOREHOLE-001"
    },
    {
        name: "Supply of ECDE Furniture to Dadaab Centers",
        description: "Provision of desks, chairs, and learning materials to 5 ECDE centers",
        subCounty: "Dadaab",
        ward: "Dadaab",
        location: { latitude: 0.3833, longitude: 40.0667 },
        department: "Education, ICT & Libraries",
        status: "Completed",
        startDate: "2024-01-15",
        expectedCompletionDate: "2024-04-30",
        budget: 2300000,
        expenditure: 2300000,
        sourceOfFunds: "World Bank",
        createdAt: new Date().toISOString(),
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: new Date().toISOString(),
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-EDUCATION-002"
    },
    {
        name: "Youth Empowerment Training Program",
        description: "Training program on entrepreneurship and digital skills for 100 youths",
        subCounty: "Garissa Township",
        ward: "Township",
        location: { latitude: -0.4569, longitude: 39.6463 },
        department: "Culture, Gender, PWDs, Social Services, Youth & Sports",
        status: "Stalled",
        startDate: "2023-11-01",
        expectedCompletionDate: "2024-03-31",
        budget: 1500000,
        expenditure: 750000,
        sourceOfFunds: "Garissa County Government",
        createdAt: new Date().toISOString(),
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: new Date().toISOString(),
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-YOUTH-003"
    }
];

// Setup instructions
console.log(`
🚀 Garissa County PMD Firebase Setup Instructions

1. FIREBASE PROJECT SETUP:
   - Go to https://console.firebase.google.com
   - Create new project: "garissa-county-pmd"
   - Enable Authentication (Email/Password + Google)
   - Create Firestore database
   - Get your Firebase config

2. UPDATE FIREBASE CONFIG:
   - Open firebase-config.js
   - Replace placeholder values with your actual config
   - Get your Gemini API key from https://makersuite.google.com/app/apikey
   - Update the apiKey variable

3. DEPLOY TO FIREBASE HOSTING:
   - Install Firebase CLI: npm install -g firebase-tools
   - Login: firebase login
   - Initialize: firebase init hosting
   - Deploy: firebase deploy

4. CREATE ADMIN USER:
   - Go to Firebase Console > Authentication
   - Add user: jmsmuigai@gmail.com
   - Set password: Admin.123!
   - Go to Firestore > users collection
   - Create document with ID matching the user's UID
   - Add the defaultAdminUser data

5. SECURITY RULES:
   - Go to Firestore > Rules
   - Replace with the rules from SYSTEM_DOCUMENTATION.md
   - Publish the rules

6. INITIAL DATA:
   - Optionally add sample projects from this script
   - Use the CSV template for bulk uploads

7. TEST THE SYSTEM:
   - Login with: UPN: 123456789, Password: Admin.123!
   - Or use Gmail: jmsmuigai@gmail.com
   - Verify all features work correctly

📚 Documentation:
   - README.md: Quick start guide
   - USER_MANUAL.md: Detailed user guide
   - SYSTEM_DOCUMENTATION.md: Technical documentation
   - DEPLOYMENT.md: Deployment instructions

🔧 Support:
   - Email: jmsmuigai@gmail.com
   - GitHub: Create issues for bugs/features

✅ Your Garissa County PMD is ready for deployment!
`);

// Export data for manual setup
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        defaultAdminUser,
        sampleProjects
    };
}
