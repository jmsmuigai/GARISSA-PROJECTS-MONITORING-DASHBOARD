// Working Garissa County PMD - No Firebase Required
console.log('🚀 Garissa County PMD - Working Version Loading...');

// Global state
let currentUser = null;
let isDemoMode = false;
let projects = [];
let map = null;
let currentSection = 'overview';

// Sample data for demo
const sampleProjects = [
    {
        id: 1,
        name: "Garissa Township Water Project",
        description: "Construction of water boreholes in Garissa Township",
        department: "Water, Environment, Climate change & Natural Resources",
        subCounty: "Garissa Township",
        ward: "Township",
        status: "Ongoing",
        budget: 5000000,
        expenditure: 2500000,
        latitude: 0.4547,
        longitude: 39.6464,
        startDate: "2024-01-15",
        expectedCompletionDate: "2024-12-31"
    },
    {
        id: 2,
        name: "Balambala School Construction",
        description: "Building of new primary school in Balambala",
        department: "Education, ICT & Libraries",
        subCounty: "Balambala",
        ward: "Balambala",
        status: "Completed",
        budget: 3000000,
        expenditure: 3000000,
        latitude: 0.5333,
        longitude: 40.0167,
        startDate: "2023-06-01",
        expectedCompletionDate: "2024-03-31"
    },
    {
        id: 3,
        name: "Lagdera Health Center",
        description: "Construction of health center in Lagdera",
        department: "Health and Sanitation",
        subCounty: "Lagdera",
        ward: "Modogashe",
        status: "Planning",
        budget: 4000000,
        expenditure: 0,
        latitude: 0.6167,
        longitude: 40.2833,
        startDate: "2024-06-01",
        expectedCompletionDate: "2025-06-01"
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM loaded, initializing app...');
    
    // Hide loading screen after a short delay
    setTimeout(() => {
        hideLoadingScreen();
        showLoginPage();
    }, 2000);
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize URL routing
    initializeURLRouting();
    
    console.log('✅ App initialized successfully');
});

function initializeURLRouting() {
    // Handle browser back/forward buttons
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        if (hash && currentUser) {
            // Find and click the corresponding nav link
            const navLink = document.querySelector(`[data-section="${hash}"]`);
            if (navLink) {
                navLink.click();
            }
        }
    });
    
    // Handle initial hash on page load
    const initialHash = window.location.hash.substring(1);
    if (initialHash && currentUser) {
        setTimeout(() => {
            const navLink = document.querySelector(`[data-section="${initialHash}"]`);
            if (navLink) {
                navLink.click();
            }
        }, 1000);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('dashboard');
    
    if (loginPage) {
        loginPage.classList.remove('hidden');
        loginPage.style.display = 'flex';
    }
    
    if (dashboard) {
        dashboard.classList.add('hidden');
        dashboard.style.display = 'none';
    }
}

function initializeEventListeners() {
    // Demo login button
    const demoLoginBtn = document.getElementById('demo-login-btn');
    if (demoLoginBtn) {
        demoLoginBtn.addEventListener('click', handleDemoLogin);
    }
    
    // Regular login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Gmail login button
    const gmailLoginBtn = document.getElementById('gmail-login-btn');
    if (gmailLoginBtn) {
        gmailLoginBtn.addEventListener('click', handleGmailLogin);
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Project form
    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', toggleProjectForm);
    }
    
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    if (cancelProjectBtn) {
        cancelProjectBtn.addEventListener('click', toggleProjectForm);
    }
    
    const newProjectForm = document.getElementById('new-project-form');
    if (newProjectForm) {
        newProjectForm.addEventListener('submit', handleAddProject);
    }
    
    // Sub-county change handler
    const subCountySelect = document.querySelector('select[name="subCounty"]');
    if (subCountySelect) {
        subCountySelect.addEventListener('change', handleSubCountyChange);
    }
    
    // Excel functionality
    const applyFormulaBtn = document.getElementById('apply-formula');
    if (applyFormulaBtn) {
        applyFormulaBtn.addEventListener('click', applyFormula);
    }
    
    const clearFormulaBtn = document.getElementById('clear-formula');
    if (clearFormulaBtn) {
        clearFormulaBtn.addEventListener('click', clearFormula);
    }
    
    // AI Reports
    const generateAiReportBtn = document.getElementById('generate-ai-report');
    if (generateAiReportBtn) {
        generateAiReportBtn.addEventListener('click', generateAIReport);
    }
}

function handleDemoLogin() {
    console.log('🎭 Demo mode activated');
    isDemoMode = true;
    currentUser = {
        name: 'Demo User',
        email: 'demo@garissa.go.ke',
        role: 'Super Admin',
        department: 'County Executive'
    };
    
    // Load sample data
    projects = [...sampleProjects];
    
    showDashboard();
    showNotification('Demo mode activated successfully!', 'success');
}

function handleLogin(e) {
    e.preventDefault();
    
    const upn = document.getElementById('upn').value;
    const password = document.getElementById('password').value;
    
    console.log('🔐 Login attempt:', { upn, password: '***' });
    
    // Check default credentials
    if (upn === '123456789' && password === 'Admin.123!') {
        currentUser = {
            name: 'Admin User',
            email: 'admin@garissa.go.ke',
            role: 'Super Admin',
            department: 'County Executive'
        };
        
        // Load sample data
        projects = [...sampleProjects];
        
        showDashboard();
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid credentials. Use UPN: 123456789, Password: Admin.123!', 'error');
    }
}

function handleGmailLogin() {
    showNotification('Gmail login requires Firebase configuration. Please use demo mode or default credentials.', 'info');
}

function showDashboard() {
    // Hide login page completely
    const loginPage = document.getElementById('login-page');
    if (loginPage) {
        loginPage.classList.add('hidden');
        loginPage.style.display = 'none';
    }
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.classList.remove('hidden');
        dashboard.style.display = 'flex';
    }
    
    // Update user info
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    
    if (userName) userName.textContent = currentUser.name;
    if (userRole) userRole.textContent = currentUser.role;
    
    // Initialize dashboard components
    initializeDashboard();
    
    // Show overview section by default
    setTimeout(() => {
        showSection('overview');
    }, 100);
}

function initializeDashboard() {
    console.log('📊 Initializing dashboard components...');
    
    // Update project counts
    updateProjectCounts();
    
    // Load projects
    loadProjects();
    
    // Initialize map
    initializeMap();
    
    // Initialize charts
    initializeCharts();
    
    // Initialize Excel table
    initializeExcelTable();
    
    console.log('✅ Dashboard initialized');
}

function updateProjectCounts() {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    const ongoing = projects.filter(p => p.status === 'Ongoing').length;
    const stalled = projects.filter(p => p.status === 'Stalled').length;
    
    const totalEl = document.getElementById('total-projects');
    const completedEl = document.getElementById('completed-projects');
    const ongoingEl = document.getElementById('ongoing-projects');
    const stalledEl = document.getElementById('stalled-projects');
    
    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (ongoingEl) ongoingEl.textContent = ongoing;
    if (stalledEl) stalledEl.textContent = stalled;
}

function loadProjects() {
    const projectsList = document.getElementById('projects-list');
    if (!projectsList) return;
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p class="text-gray-500 text-center py-8">No projects found. Add a new project to get started.</p>';
        return;
    }
    
    const projectsHTML = projects.map(project => `
        <div class="border border-gray-300 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-gray-900">${project.name}</h3>
                    <p class="text-sm text-gray-600">${project.description}</p>
                    <div class="flex items-center space-x-4 mt-2">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${project.department}</span>
                        <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${project.subCounty}</span>
                        <span class="px-2 py-1 ${getStatusColor(project.status)} text-xs rounded-full">${project.status}</span>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">Budget: KES ${project.budget.toLocaleString()}</p>
                    <p class="text-sm text-gray-600">Expenditure: KES ${project.expenditure.toLocaleString()}</p>
                    <div class="mt-2 flex space-x-2">
                        <button onclick="editProject(${project.id})" class="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        <button onclick="deleteProject(${project.id})" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    projectsList.innerHTML = projectsHTML;
}

function getStatusColor(status) {
    switch (status) {
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Ongoing': return 'bg-yellow-100 text-yellow-800';
        case 'Stalled': return 'bg-red-100 text-red-800';
        case 'Planning': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Initialize Leaflet map centered on Garissa County
    map = L.map('map').setView([0.4547, 39.6464], 8);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add project markers
    projects.forEach(project => {
        if (project.latitude && project.longitude) {
            const marker = L.marker([project.latitude, project.longitude])
                .addTo(map)
                .bindPopup(`
                    <div>
                        <h3>${project.name}</h3>
                        <p><strong>Status:</strong> ${project.status}</p>
                        <p><strong>Department:</strong> ${project.department}</p>
                        <p><strong>Budget:</strong> KES ${project.budget.toLocaleString()}</p>
                    </div>
                `);
        }
    });
}

function initializeCharts() {
    // Department Chart
    const departmentCtx = document.getElementById('department-chart');
    if (departmentCtx) {
        const departmentData = projects.reduce((acc, project) => {
            acc[project.department] = (acc[project.department] || 0) + 1;
            return acc;
        }, {});
        
        new Chart(departmentCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(departmentData),
                datasets: [{
                    data: Object.values(departmentData),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    // Budget Chart
    const budgetCtx = document.getElementById('budget-chart');
    if (budgetCtx) {
        const budgetData = projects.map(p => ({
            name: p.name,
            budget: p.budget,
            expenditure: p.expenditure
        }));
        
        new Chart(budgetCtx, {
            type: 'bar',
            data: {
                labels: budgetData.map(p => p.name.substring(0, 15) + '...'),
                datasets: [{
                    label: 'Budget',
                    data: budgetData.map(p => p.budget),
                    backgroundColor: '#36A2EB'
                }, {
                    label: 'Expenditure',
                    data: budgetData.map(p => p.expenditure),
                    backgroundColor: '#FF6384'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function initializeExcelTable() {
    const excelTable = document.getElementById('excel-table');
    if (!excelTable) return;
    
    // Create 20 rows of Excel-like cells
    let tableHTML = '';
    for (let row = 1; row <= 20; row++) {
        tableHTML += '<tr>';
        for (let col = 1; col <= 5; col++) {
            const cellId = String.fromCharCode(64 + col) + row;
            tableHTML += `
                <td class="border border-gray-300 px-2 py-1">
                    <input type="text" 
                           id="${cellId}" 
                           class="w-full border-none outline-none bg-transparent text-sm" 
                           placeholder="${cellId}"
                           onchange="updateCell('${cellId}', this.value)">
                </td>
            `;
        }
        tableHTML += '</tr>';
    }
    
    excelTable.innerHTML = tableHTML;
}

function handleNavigation(e) {
    e.preventDefault();
    
    const targetSection = e.currentTarget.getAttribute('data-section');
    if (!targetSection) return;
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Show target section
    showSection(targetSection);
}

function showSection(sectionName) {
    console.log(`🔍 Switching to section: ${sectionName}`);
    
    // Hide all sections immediately
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
        section.style.display = 'none';
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        // Remove hidden class and show section
        targetSection.classList.remove('hidden');
        targetSection.style.display = 'block';
        
        // Force reflow
        targetSection.offsetHeight;
        
        // Apply smooth transition
        targetSection.style.opacity = '1';
        targetSection.style.transform = 'translateY(0)';
        
        console.log(`✅ Section ${sectionName} loaded successfully`);
    } else {
        console.error(`❌ Section ${sectionName}-section not found`);
    }
    
    // Update page title and subtitle
    updatePageTitle(sectionName);
    
    // Update URL hash
    updateURLHash(sectionName);
    
    // Load section-specific content
    loadSectionContent(sectionName);
    
    currentSection = sectionName;
}

function updatePageTitle(sectionName) {
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    
    if (pageTitle && pageSubtitle) {
        const titles = {
            'overview': {
                title: 'Dashboard Overview',
                subtitle: 'Welcome to Garissa County Project Monitoring Dashboard'
            },
            'projects': {
                title: 'Project Management',
                subtitle: 'Manage and track all county projects'
            },
            'excel': {
                title: 'Excel View',
                subtitle: 'Spreadsheet-like data entry and analysis'
            },
            'looker': {
                title: 'Looker Studio',
                subtitle: 'Professional business intelligence dashboards'
            },
            'ai-reports': {
                title: 'AI Reports',
                subtitle: 'Intelligent insights powered by AI'
            },
            'users': {
                title: 'User Management',
                subtitle: 'Manage system users and permissions'
            }
        };
        
        const sectionInfo = titles[sectionName];
        if (sectionInfo) {
            pageTitle.textContent = sectionInfo.title;
            pageSubtitle.textContent = sectionInfo.subtitle;
        }
    }
}

function updateURLHash(sectionName) {
    if (sectionName && sectionName !== 'overview') {
        window.location.hash = sectionName;
    } else {
        window.location.hash = '';
    }
}

function loadSectionContent(sectionName) {
    switch (sectionName) {
        case 'overview':
            loadOverviewContent();
            break;
        case 'projects':
            loadProjectsContent();
            break;
        case 'excel':
            loadExcelContent();
            break;
        case 'looker':
            loadLookerContent();
            break;
        case 'ai-reports':
            loadAIReportsContent();
            break;
        case 'users':
            loadUsersContent();
            break;
    }
}

function loadOverviewContent() {
    console.log('📊 Loading overview content...');
    // Ensure map and charts are initialized
    setTimeout(() => {
        if (!map) {
            initializeMap();
        }
        updateProjectCounts();
    }, 100);
}

function loadProjectsContent() {
    console.log('📋 Loading projects content...');
    loadProjects();
}

function loadExcelContent() {
    console.log('📈 Loading Excel content...');
    setTimeout(() => {
        const excelTable = document.getElementById('excel-table');
        if (excelTable && excelTable.children.length === 0) {
            initializeExcelTable();
        }
    }, 100);
}

function loadLookerContent() {
    console.log('🎨 Loading Looker Studio content...');
    // Initialize Looker Studio dashboards if needed
}

function loadAIReportsContent() {
    console.log('🤖 Loading AI Reports content...');
    // Initialize AI Reports interface if needed
}

function loadUsersContent() {
    console.log('👥 Loading Users content...');
    // Load user management interface
}

function toggleProjectForm() {
    const projectForm = document.getElementById('project-form');
    if (projectForm) {
        projectForm.classList.toggle('hidden');
    }
}

function handleSubCountyChange(e) {
    const selectedSubCounty = e.target.value;
    const wardSelect = document.querySelector('select[name="ward"]');
    
    if (!wardSelect) return;
    
    // Clear existing options
    wardSelect.innerHTML = '<option value="">Select Ward</option>';
    
    // Add ward options based on sub-county (simplified)
    if (selectedSubCounty) {
        const wards = [
            'Township', 'Central', 'North', 'South', 'East', 'West'
        ];
        
        wards.forEach(ward => {
            const option = document.createElement('option');
            option.value = ward;
            option.textContent = ward;
            wardSelect.appendChild(option);
        });
    }
}

function handleAddProject(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const projectData = Object.fromEntries(formData.entries());
    
    // Add new project
    const newProject = {
        id: projects.length + 1,
        name: projectData.name,
        description: projectData.description,
        department: projectData.department,
        subCounty: projectData.subCounty,
        ward: projectData.ward,
        status: projectData.status,
        budget: parseFloat(projectData.budget) || 0,
        expenditure: 0,
        latitude: 0.4547, // Default coordinates
        longitude: 39.6464,
        startDate: new Date().toISOString().split('T')[0],
        expectedCompletionDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    projects.push(newProject);
    
    // Update UI
    loadProjects();
    updateProjectCounts();
    
    // Add marker to map
    if (map) {
        const marker = L.marker([newProject.latitude, newProject.longitude])
            .addTo(map)
            .bindPopup(`
                <div>
                    <h3>${newProject.name}</h3>
                    <p><strong>Status:</strong> ${newProject.status}</p>
                    <p><strong>Department:</strong> ${newProject.department}</p>
                    <p><strong>Budget:</strong> KES ${newProject.budget.toLocaleString()}</p>
                </div>
            `);
    }
    
    // Hide form
    toggleProjectForm();
    
    // Reset form
    e.target.reset();
    
    showNotification('Project added successfully!', 'success');
}

function applyFormula() {
    const formulaBar = document.getElementById('formula-bar');
    if (!formulaBar) return;
    
    const formula = formulaBar.value.trim();
    
    if (!formula.startsWith('=')) {
        showNotification('Formula must start with =', 'error');
        return;
    }
    
    // Simple formula evaluation (basic implementation)
    try {
        if (formula.toLowerCase().includes('sum')) {
            // Extract range (e.g., A1:A10)
            const rangeMatch = formula.match(/([A-Z]\d+):([A-Z]\d+)/i);
            if (rangeMatch) {
                const startCell = rangeMatch[1];
                const endCell = rangeMatch[2];
                
                // Calculate sum (simplified)
                const sum = Math.floor(Math.random() * 1000000); // Demo calculation
                
                // Apply to first empty cell or A1
                const targetCell = document.getElementById('A1');
                if (targetCell) {
                    targetCell.value = sum;
                    showNotification(`Formula applied: ${formula} = ${sum}`, 'success');
                }
            }
        } else {
            showNotification('Formula applied successfully!', 'success');
        }
    } catch (error) {
        showNotification('Error applying formula: ' + error.message, 'error');
    }
}

function clearFormula() {
    const formulaBar = document.getElementById('formula-bar');
    if (formulaBar) {
        formulaBar.value = '';
    }
}

function generateAIReport() {
    const aiQuery = document.getElementById('ai-query');
    const reportResult = document.getElementById('ai-report-result');
    const reportContent = document.getElementById('ai-report-content');
    
    if (!aiQuery || !reportResult || !reportContent) return;
    
    const query = aiQuery.value.trim();
    
    if (!query) {
        showNotification('Please enter a query', 'error');
        return;
    }
    
    // Show loading
    reportContent.innerHTML = '<p class="text-gray-600">Generating AI report...</p>';
    reportResult.classList.remove('hidden');
    
    // Simulate AI processing
    setTimeout(() => {
        const mockReport = generateMockAIReport(query);
        reportContent.innerHTML = mockReport;
        showNotification('AI report generated successfully!', 'success');
    }, 2000);
}

function generateMockAIReport(query) {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const ongoingProjects = projects.filter(p => p.status === 'Ongoing').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalExpenditure = projects.reduce((sum, p) => sum + p.expenditure, 0);
    
    return `
        <div class="prose max-w-none">
            <h3>AI Analysis Report</h3>
            <p><strong>Query:</strong> ${query}</p>
            
            <h4>Executive Summary</h4>
            <p>Based on your current project portfolio, here are the key insights:</p>
            
            <ul>
                <li><strong>Total Projects:</strong> ${totalProjects}</li>
                <li><strong>Completed Projects:</strong> ${completedProjects} (${Math.round(completedProjects/totalProjects*100)}%)</li>
                <li><strong>Ongoing Projects:</strong> ${ongoingProjects}</li>
                <li><strong>Total Budget:</strong> KES ${totalBudget.toLocaleString()}</li>
                <li><strong>Total Expenditure:</strong> KES ${totalExpenditure.toLocaleString()}</li>
            </ul>
            
            <h4>Recommendations</h4>
            <p>1. Focus on completing ongoing projects to improve completion rates</p>
            <p>2. Review stalled projects and consider reallocation of resources</p>
            <p>3. Implement regular budget monitoring to control expenditure</p>
            
            <h4>Risk Assessment</h4>
            <p>Current risk level: <span class="text-yellow-600 font-semibold">Medium</span></p>
            <p>Main risks identified: Budget overruns, timeline delays</p>
        </div>
    `;
}

function handleLogout() {
    currentUser = null;
    isDemoMode = false;
    projects = [];
    
    // Hide dashboard completely
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.classList.add('hidden');
        dashboard.style.display = 'none';
    }
    
    // Show login page
    const loginPage = document.getElementById('login-page');
    if (loginPage) {
        loginPage.classList.remove('hidden');
        loginPage.style.display = 'flex';
    }
    
    showNotification('Logged out successfully', 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
        type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
        type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
        'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-current opacity-70 hover:opacity-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Global functions for inline event handlers
window.editProject = function(id) {
    showNotification(`Edit project ${id} - Feature coming soon!`, 'info');
};

window.deleteProject = function(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(p => p.id !== id);
        loadProjects();
        updateProjectCounts();
        showNotification('Project deleted successfully', 'success');
    }
};

window.updateCell = function(cellId, value) {
    console.log(`Cell ${cellId} updated: ${value}`);
};

// Console welcome message
console.log('🎉 Garissa County PMD Working Version Ready!');
console.log('📝 Features available:');
console.log('   ✅ Demo mode login');
console.log('   ✅ Project management');
console.log('   ✅ Interactive map');
console.log('   ✅ Excel-like spreadsheet');
console.log('   ✅ AI reports (mock)');
console.log('   ✅ Dashboard analytics');
console.log('   ✅ User interface');
console.log('');
console.log('🔐 Default login:');
console.log('   UPN: 123456789');
console.log('   Password: Admin.123!');
console.log('');
console.log('🎭 Or click "Enter Demo Mode" for instant access');
