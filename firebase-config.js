// Firebase Configuration for Garissa County PMD
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    deleteUser,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    writeBatch,
    GeoPoint,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Configuration
// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
    // These are placeholder values - you need to replace them with your actual Firebase project config
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // Replace with your API key
    authDomain: "garissa-pmd-xxxxx.firebaseapp.com", // Replace with your auth domain
    projectId: "garissa-pmd-xxxxx", // Replace with your project ID
    storageBucket: "garissa-pmd-xxxxx.appspot.com", // Replace with your storage bucket
    messagingSenderId: "123456789012", // Replace with your messaging sender ID
    appId: "1:123456789012:web:abcdef1234567890" // Replace with your app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Garissa County Data
export const GARISSA_DATA = {
    subcounties: [
        "Garissa Township",
        "Balambala",
        "Lagdera", 
        "Dadaab",
        "Fafi",
        "Ijara",
        "Hulugho",
        "Sankuri",
        "Masalani",
        "Bura East",
        "Bura West"
    ],
    
    wards: {
        "Garissa Township": ["Township", "Iftin", "Central"],
        "Balambala": ["Balambala", "Saka", "Sankuri"],
        "Lagdera": ["Lagdera", "Danaba", "Modogashe"],
        "Dadaab": ["Dadaab", "Dertu", "Liboi"],
        "Fafi": ["Fafi", "Bura", "Dekaharia"],
        "Ijara": ["Ijara", "Masalani", "Sangole"],
        "Hulugho": ["Hulugho", "Sangailu", "Ijara"],
        "Sankuri": ["Sankuri", "Modogashe", "Danaba"],
        "Masalani": ["Masalani", "Sangole", "Ijara"],
        "Bura East": ["Bura East", "Dekaharia", "Bura"],
        "Bura West": ["Bura West", "Fafi", "Dekaharia"]
    },
    
    coordinates: {
        "Garissa Township": { lat: -0.4569, lng: 39.6463 },
        "Balambala": { lat: -0.5833, lng: 39.9167 },
        "Lagdera": { lat: -0.4167, lng: 39.7500 },
        "Dadaab": { lat: 0.3833, lng: 40.0667 },
        "Fafi": { lat: -0.7500, lng: 40.0833 },
        "Ijara": { lat: -1.2500, lng: 40.3333 },
        "Hulugho": { lat: -1.1667, lng: 40.2500 },
        "Sankuri": { lat: -0.5000, lng: 39.8333 },
        "Masalani": { lat: -1.3000, lng: 40.3833 },
        "Bura East": { lat: -0.7500, lng: 40.1667 },
        "Bura West": { lat: -0.8000, lng: 40.1000 }
    }
};

// Garissa County Departments
export const DEPARTMENTS = [
    "Education, ICT & Libraries",
    "Culture, Gender, PWDs, Social Services, Youth & Sports", 
    "Finance, Revenue and Economic Planning",
    "Agriculture, Livestock & Pastoral Economy",
    "Water, Environment, Climate change & Natural Resources",
    "County Affairs, Public Service & Administration",
    "Trade, Investment & Enterprise Development",
    "Roads, Transport, Housing & Public Works",
    "Lands, Physical Planning & Urban Development",
    "Health and Sanitation"
];

// Project Status Options
export const PROJECT_STATUS = [
    "Planning",
    "Ongoing", 
    "Completed",
    "Stalled",
    "Suspended",
    "Cancelled"
];

// Default Admin Credentials
export const DEFAULT_ADMIN = {
    upn: "123456789",
    email: "admin@garissa.go.ke",
    password: "Admin.123!",
    role: "superadmin",
    department: "County Executive"
};

// Utility Functions
export const utils = {
    // Format currency in Kenyan Shillings
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
        }).format(amount);
    },
    
    // Format date for display
    formatDate: (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Generate project ID
    generateProjectId: () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `PRJ-${timestamp}-${random}`.toUpperCase();
    },
    
    // Validate UPN format
    validateUPN: (upn) => {
        return /^[0-9]{9}$/.test(upn);
    },
    
    // Validate email format
    validateEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Get ward coordinates (approximate)
    getWardCoordinates: (subcounty, ward) => {
        const baseCoords = GARISSA_DATA.coordinates[subcounty];
        if (!baseCoords) return { lat: -0.4569, lng: 39.6463 }; // Default to Garissa Township
        
        // Add small random offset for different wards
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;
        
        return {
            lat: baseCoords.lat + latOffset,
            lng: baseCoords.lng + lngOffset
        };
    }
};

// Export Firebase instances
export { app, auth, db, googleProvider };

