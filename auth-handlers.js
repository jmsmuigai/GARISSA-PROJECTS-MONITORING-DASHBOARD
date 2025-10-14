// Authentication Handlers for Garissa County PMD

// Login handlers
async function handleGmailLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Update user profile
        await updateProfile(user, {
            displayName: user.email.split('@')[0]
        });
        
        customAlert(`Welcome, ${user.displayName}!`, "Login Successful", "success");
    } catch (error) {
        console.error("Gmail login failed:", error);
        customAlert("Gmail login failed. Please try again.", "Login Error", "error");
    }
}

async function handleUPNLogin(e) {
    e.preventDefault();
    const upn = document.getElementById('upn').value;
    const password = document.getElementById('upn-password').value;
    const errorEl = document.getElementById('login-error');
    
    errorEl.textContent = '';
    
    // Validate UPN format
    if (!utils.validateUPN(upn)) {
        errorEl.textContent = 'UPN must be exactly 9 digits';
        return;
    }
    
    // For demo purposes, check against default admin
    if (upn === DEFAULT_ADMIN.upn && password === DEFAULT_ADMIN.password) {
        // Create a demo user session
        const demoUser = {
            uid: 'demo-admin',
            email: DEFAULT_ADMIN.email,
            displayName: DEFAULT_ADMIN.upn
        };
        
        // Simulate successful login
        currentUser = demoUser;
        userData = {
            email: DEFAULT_ADMIN.email,
            upn: DEFAULT_ADMIN.upn,
            role: DEFAULT_ADMIN.role,
            department: DEFAULT_ADMIN.department
        };
        
        showApp();
        initializeDashboard();
        customAlert("Welcome, Administrator!", "Login Successful", "success");
        return;
    }
    
    try {
        // Try to find user by UPN in Firestore
        const usersQuery = query(collection(db, "users"), where("upn", "==", upn));
        const querySnapshot = await getDocs(usersQuery);
        
        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userDocData = userDoc.data();
            
            // For demo, accept any password for existing UPNs
            // In production, you'd hash and verify the password
            currentUser = {
                uid: userDoc.id,
                email: userDocData.email,
                displayName: upn
            };
            userData = userDocData;
            
            showApp();
            initializeDashboard();
            customAlert(`Welcome back, ${userDocData.email}!`, "Login Successful", "success");
        } else {
            errorEl.textContent = 'Invalid UPN or password';
        }
    } catch (error) {
        console.error("UPN login failed:", error);
        errorEl.textContent = 'Login failed. Please try again.';
    }
}

async function handleLogout() {
    try {
        if (currentUser && currentUser.uid !== 'demo-admin') {
            await signOut(auth);
        } else {
            // Handle demo logout
            currentUser = null;
            userData = null;
            showLogin();
        }
        customAlert("Logged out successfully", "Logout", "success");
    } catch (error) {
        console.error("Logout failed:", error);
        customAlert("Logout failed. Please try again.", "Error", "error");
    }
}

// Tab switching for login forms
function switchLoginTab(tabName) {
    const gmailTab = document.getElementById('gmail-tab');
    const upnTab = document.getElementById('upn-tab');
    const gmailForm = document.getElementById('gmail-login-form');
    const upnForm = document.getElementById('upn-login-form');
    
    if (tabName === 'gmail') {
        gmailTab.classList.add('bg-white', 'text-red-800', 'shadow-sm');
        gmailTab.classList.remove('text-gray-600');
        upnTab.classList.remove('bg-white', 'text-red-800', 'shadow-sm');
        upnTab.classList.add('text-gray-600');
        gmailForm.classList.remove('hidden');
        upnForm.classList.add('hidden');
    } else {
        upnTab.classList.add('bg-white', 'text-red-800', 'shadow-sm');
        upnTab.classList.remove('text-gray-600');
        gmailTab.classList.remove('bg-white', 'text-red-800', 'shadow-sm');
        gmailTab.classList.add('text-gray-600');
        upnForm.classList.remove('hidden');
        gmailForm.classList.add('hidden');
    }
}

// Navigation handlers
function navigateTo(viewName) {
    // Hide all views
    document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    
    // Show selected view
    document.getElementById(`view-${viewName}`).classList.remove('hidden');
    document.getElementById(`nav-${viewName}`).classList.add('active');
    
    // Initialize specific view if needed
    if (viewName === 'analytics') {
        initializeAnalyticsView();
    }
}

// Initialize analytics view
function initializeAnalyticsView() {
    if (projectsCache.length === 0) return;
    
    updateBudgetChart(projectsCache);
    updateTimelineChart(projectsCache);
}

// Update budget analysis chart
function updateBudgetChart(projects) {
    const budgetData = projects.reduce((acc, project) => {
        const status = project.status || 'Unknown';
        if (!acc[status]) {
            acc[status] = { budget: 0, expenditure: 0, count: 0 };
        }
        acc[status].budget += project.budget || 0;
        acc[status].expenditure += project.expenditure || 0;
        acc[status].count += 1;
        return acc;
    }, {});
    
    const chartCanvas = document.getElementById('budget-chart');
    if (budgetChart) {
        budgetChart.destroy();
    }
    
    budgetChart = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(budgetData),
            datasets: [{
                label: 'Budget Distribution',
                data: Object.values(budgetData).map(d => d.budget),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(107, 114, 128, 0.6)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(107, 114, 128, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Budget Distribution by Status'
                }
            }
        }
    });
}

// Update timeline analysis chart
function updateTimelineChart(projects) {
    const timelineData = projects.reduce((acc, project) => {
        if (project.startDate) {
            const year = new Date(project.startDate).getFullYear();
            if (!acc[year]) {
                acc[year] = 0;
            }
            acc[year]++;
        }
        return acc;
    }, {});
    
    const chartCanvas = document.getElementById('timeline-chart');
    if (timelineChart) {
        timelineChart.destroy();
    }
    
    timelineChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: Object.keys(timelineData).sort(),
            datasets: [{
                label: 'Projects Started',
                data: Object.keys(timelineData).sort().map(year => timelineData[year]),
                borderColor: 'rgba(220, 38, 38, 1)',
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Project Timeline Analysis'
                }
            }
        }
    });
}
