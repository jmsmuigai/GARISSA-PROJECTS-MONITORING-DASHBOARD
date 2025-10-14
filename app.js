// Garissa County Project Monitoring Dashboard - Main Application
import { 
    app, auth, db, googleProvider, 
    GARISSA_DATA, DEPARTMENTS, PROJECT_STATUS, DEFAULT_ADMIN, utils 
} from './firebase-config.js';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';

import {
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
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Global Variables
let currentUser = null;
let userData = null;
let projectsUnsubscribe = () => {};
let usersUnsubscribe = () => {};
let projectsCache = [];
let map;
let departmentChart;
let budgetChart;
let timelineChart;
let projectMarkers = [];

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const loginPage = document.getElementById('login-page');
const appContainer = document.getElementById('app');

// Initialize Application
function main() {
    lucide.createIcons();
    
    // Set up authentication state listener
    onAuthStateChanged(auth, async (user) => {
        // Cleanup previous listeners
        projectsUnsubscribe();
        usersUnsubscribe();

        if (user) {
            currentUser = user;
            await loadUserData(user);
        } else {
            currentUser = null;
            userData = null;
            showLogin();
        }
    });
}

// Load user data from Firestore
async function loadUserData(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            userData = userDocSnap.data();
            showApp();
            initializeDashboard();
        } else {
            // Create user document for new users
            await createUserDocument(user);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showLogin("Error: Unable to load user data. Please try again.");
    }
}

// Create user document for new users
async function createUserDocument(user) {
    try {
        const userData = {
            email: user.email,
            upn: user.displayName || '000000000',
            role: user.email === 'jmsmuigai@gmail.com' ? 'superadmin' : 'admin',
            department: 'County Executive',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        await setDoc(doc(db, "users", user.uid), userData);
        
        // Reload user data
        await loadUserData(user);
    } catch (error) {
        console.error("Error creating user document:", error);
        showLogin("Error: Unable to create user profile. Please contact administrator.");
    }
}

// Show main application
function showApp() {
    loadingScreen.classList.add('hidden');
    loginPage.classList.add('hidden');
    appContainer.classList.remove('hidden');
    appContainer.classList.add('flex');
    setupUI();
}

// Show login page
function showLogin(errorMessage = "") {
    loadingScreen.classList.add('hidden');
    appContainer.classList.add('hidden');
    appContainer.classList.remove('flex');
    loginPage.classList.remove('hidden');
    
    if (errorMessage) {
        document.getElementById('login-error').textContent = errorMessage;
    }
}

// Setup UI based on user role
function setupUI() {
    // Display user info
    document.getElementById('user-name-display').textContent = userData.email;
    document.getElementById('user-email-display').textContent = `UPN: ${userData.upn}`;
    document.getElementById('user-role-display').textContent = `Role: ${userData.role}`;

    // Populate department dropdowns
    populateDepartmentDropdowns();

    // Show/hide UI elements based on role
    const userManagementNav = document.getElementById('nav-users');
    if (userData.role === 'superadmin') {
        userManagementNav.classList.remove('hidden');
    } else {
        userManagementNav.classList.add('hidden');
    }
    
    // Set initial view
    navigateTo('dashboard');
}

// Populate department dropdowns
function populateDepartmentDropdowns() {
    const departmentDropdowns = document.querySelectorAll('#department-filter, #project-department, #user-form-department');
    
    departmentDropdowns.forEach(dropdown => {
        dropdown.innerHTML = dropdown.id === 'department-filter' ? '<option value="">All Departments</option>' : '';
        
        DEPARTMENTS.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            dropdown.appendChild(option);
        });
    });
}

// Initialize dashboard
function initializeDashboard() {
    setupMap();
    setupCharts();
    setupProjectListeners();
    setupUserListeners();
}

// Setup interactive map
function setupMap() {
    if (!map) {
        map = L.map('map').setView([-0.4569, 39.6463], 8); // Centered on Garissa County
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Add Garissa County boundary markers
        addCountyBoundaries();
    }
}

// Add county boundaries and ward markers
function addCountyBoundaries() {
    Object.entries(GARISSA_DATA.coordinates).forEach(([subcounty, coords]) => {
        const marker = L.marker([coords.lat, coords.lng]).addTo(map);
        marker.bindPopup(`<b>${subcounty}</b><br>Sub-County`);
    });
}

// Setup charts
function setupCharts() {
    // Department chart will be initialized when data is loaded
    // Budget and timeline charts will be set up in analytics view
}

// Setup project data listeners
function setupProjectListeners() {
    let projectsQuery;
    
    if (userData.role === 'superadmin') {
        projectsQuery = query(collection(db, "projects"), orderBy("lastUpdated", "desc"));
    } else {
        projectsQuery = query(
            collection(db, "projects"), 
            where("department", "==", userData.department),
            orderBy("lastUpdated", "desc")
        );
    }

    projectsUnsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
        projectsCache = [];
        querySnapshot.forEach((doc) => {
            projectsCache.push({ id: doc.id, ...doc.data() });
        });
        
        updateDashboard(projectsCache);
        renderProjectsTable(projectsCache);
    });
}

// Setup user data listeners (superadmin only)
function setupUserListeners() {
    if (userData.role === 'superadmin') {
        const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
        
        usersUnsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });
        renderUsersTable(users);
    });
}

// Update dashboard with project data
function updateDashboard(projects) {
    // Update stats cards
    document.getElementById('total-projects-stat').textContent = projects.length;
    document.getElementById('completed-projects-stat').textContent = projects.filter(p => p.status === 'Completed').length;
    document.getElementById('ongoing-projects-stat').textContent = projects.filter(p => p.status === 'Ongoing').length;
    document.getElementById('stalled-projects-stat').textContent = projects.filter(p => p.status === 'Stalled').length;

    // Update department chart
    updateDepartmentChart(projects);
    
    // Update map markers
    updateMapMarkers(projects);
}

// Update department chart
function updateDepartmentChart(projects) {
    const departmentCounts = DEPARTMENTS.reduce((acc, dept) => {
        acc[dept] = 0;
        return acc;
    }, {});
    
    projects.forEach(p => {
        if (departmentCounts.hasOwnProperty(p.department)) {
            departmentCounts[p.department]++;
        }
    });

    const chartCanvas = document.getElementById('department-chart');
    if (departmentChart) {
        departmentChart.destroy();
    }
    
    departmentChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: Object.keys(departmentCounts),
            datasets: [{
                label: 'Number of Projects',
                data: Object.values(departmentCounts),
                backgroundColor: [
                    'rgba(220, 38, 38, 0.6)',
                    'rgba(5, 150, 105, 0.6)',
                    'rgba(251, 191, 36, 0.6)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(236, 72, 153, 0.6)',
                    'rgba(14, 165, 233, 0.6)',
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(249, 115, 22, 0.6)',
                    'rgba(168, 85, 247, 0.6)'
                ],
                borderColor: [
                    'rgba(220, 38, 38, 1)',
                    'rgba(5, 150, 105, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(14, 165, 233, 1)',
                    'rgba(34, 197, 94, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(168, 85, 247, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Projects by Department'
                }
            }
        }
    });
}

// Update map markers
function updateMapMarkers(projects) {
    // Clear existing markers
    projectMarkers.forEach(marker => marker.remove());
    projectMarkers = [];
    
    // Add new markers
    projects.forEach(project => {
        if (project.location && project.location.latitude && project.location.longitude) {
            const marker = L.marker([project.location.latitude, project.location.longitude]).addTo(map);
            
            // Color code markers by status
            let markerColor = '#3b82f6'; // Default blue
            switch (project.status) {
                case 'Completed':
                    markerColor = '#10b981'; // Green
                    break;
                case 'Ongoing':
                    markerColor = '#f59e0b'; // Yellow
                    break;
                case 'Stalled':
                    markerColor = '#ef4444'; // Red
                    break;
            }
            
            // Create custom icon
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            marker.setIcon(customIcon);
            
            // Create popup content
            const popupContent = `
                <div class="popup-content">
                    <h3 class="font-bold text-gray-800">${project.name}</h3>
                    <p class="text-sm text-gray-600">${project.description.substring(0, 100)}...</p>
                    <div class="mt-2">
                        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(project.status)}">
                            ${project.status}
                        </span>
                    </div>
                    <div class="mt-2 text-sm">
                        <p><strong>Department:</strong> ${project.department}</p>
                        <p><strong>Ward:</strong> ${project.ward}</p>
                        <p><strong>Budget:</strong> ${utils.formatCurrency(project.budget)}</p>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            projectMarkers.push(marker);
        }
    });
}

// Get status CSS class
function getStatusClass(status) {
    switch (status) {
        case 'Completed':
            return 'bg-green-100 text-green-800';
        case 'Ongoing':
            return 'bg-yellow-100 text-yellow-800';
        case 'Stalled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Render projects table
function renderProjectsTable(projects) {
    const tbody = document.getElementById('projects-table-body');
    tbody.innerHTML = '';
    
    if (projects.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center p-8 text-gray-500">
                    <div class="flex flex-col items-center">
                        <i data-lucide="folder-x" class="w-12 h-12 mb-2"></i>
                        <p>No projects found</p>
                        <p class="text-sm">Add your first project to get started</p>
                    </div>
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }
    
    projects.forEach(project => {
        const tr = document.createElement('tr');
        tr.className = 'table-row';
        tr.innerHTML = `
            <td class="p-4">
                <div class="font-semibold text-gray-900">${project.name}</div>
                <div class="text-sm text-gray-500">${project.description.substring(0, 60)}...</div>
            </td>
            <td class="p-4 text-sm text-gray-600">${project.department}</td>
            <td class="p-4 text-sm text-gray-600">${project.ward || 'N/A'}</td>
            <td class="p-4 text-sm text-gray-600">${utils.formatCurrency(project.budget || 0)}</td>
            <td class="p-4">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(project.status)}">
                    ${project.status}
                </span>
            </td>
            <td class="p-4">
                <div class="flex space-x-2">
                    <button class="edit-project-btn text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" data-id="${project.id}" title="Edit Project">
                        <i data-lucide="edit" class="w-4 h-4"></i>
                    </button>
                    <button class="delete-project-btn text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" data-id="${project.id}" title="Delete Project">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    lucide.createIcons();
    
    // Add event listeners for new buttons
    document.querySelectorAll('.edit-project-btn').forEach(btn => {
        btn.addEventListener('click', handleEditProject);
    });
    document.querySelectorAll('.delete-project-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteProject);
    });
}
}
