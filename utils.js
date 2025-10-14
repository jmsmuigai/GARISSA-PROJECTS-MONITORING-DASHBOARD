// Utility Functions for Garissa County PMD

// Custom alert function
function customAlert(message, title = 'Alert', type = 'info') {
    return new Promise((resolve) => {
        const modal = document.getElementById('alert-modal');
        const header = document.getElementById('alert-header');
        const titleEl = document.getElementById('alert-title');
        const messageEl = document.getElementById('alert-message');
        const okBtn = document.getElementById('alert-ok');

        titleEl.textContent = title;
        messageEl.textContent = message;

        // Reset header classes
        header.className = 'p-4 border-b rounded-t-lg';
        
        // Apply type-specific styling
        if (type === 'success') {
            header.classList.add('bg-green-100', 'text-green-800');
        } else if (type === 'error') {
            header.classList.add('bg-red-100', 'text-red-800');
        } else if (type === 'warning') {
            header.classList.add('bg-yellow-100', 'text-yellow-800');
        } else {
            header.classList.add('bg-blue-100', 'text-blue-800');
        }

        // Hide cancel button for alerts
        document.getElementById('alert-cancel').classList.add('hidden');

        modal.classList.remove('hidden');
        
        okBtn.onclick = () => {
            modal.classList.add('hidden');
            resolve(true);
        };
    });
}

// Custom confirm function
function customConfirm(message, title = 'Confirmation') {
    return new Promise((resolve) => {
        const modal = document.getElementById('alert-modal');
        const header = document.getElementById('alert-header');
        const titleEl = document.getElementById('alert-title');
        const messageEl = document.getElementById('alert-message');
        const okBtn = document.getElementById('alert-ok');
        const cancelBtn = document.getElementById('alert-cancel');

        titleEl.textContent = title;
        messageEl.textContent = message;

        header.className = 'p-4 border-b rounded-t-lg bg-yellow-100 text-yellow-800';
        cancelBtn.classList.remove('hidden');

        modal.classList.remove('hidden');

        okBtn.onclick = () => {
            modal.classList.add('hidden');
            resolve(true);
        };
        
        cancelBtn.onclick = () => {
            modal.classList.add('hidden');
            resolve(false);
        };
    });
}

// AI Report Generation
async function handleGenerateReport() {
    const userPrompt = document.getElementById('ai-prompt').value.trim();
    if (!userPrompt) {
        customAlert("Please enter a request for the AI.", "Input Required", "warning");
        return;
    }

    document.getElementById('ai-report-output').classList.remove('hidden');
    document.getElementById('ai-spinner').classList.remove('hidden');
    document.getElementById('ai-report-content').textContent = '';

    try {
        // Prepare project data summary
        const projectDataSummary = projectsCache.map(p => ({
            name: p.name,
            department: p.department,
            status: p.status,
            budget: p.budget,
            expenditure: p.expenditure,
            ward: p.ward,
            subCounty: p.subCounty,
            startDate: p.startDate,
            expectedCompletionDate: p.expectedCompletionDate,
            sourceOfFunds: p.sourceOfFunds
        }));

        // Create system prompt
        const systemPrompt = `You are an AI assistant for the Garissa County project monitoring dashboard. Your role is to analyze project data and provide clear, concise, and actionable insights for county officials. 

Key Information about Garissa County:
- Located in northeastern Kenya
- Has 11 sub-counties with various wards
- Focus areas include water, education, health, agriculture, and infrastructure
- Challenges include drought, infrastructure gaps, and economic development

Analyze the provided JSON data and answer the user's query. Format your response using markdown with clear headings, bullet points, and actionable recommendations.`;

        const fullPrompt = `Here is the current project data for Garissa County in JSON format: 

${JSON.stringify(projectDataSummary, null, 2)}

Based on this data, please respond to the following request: "${userPrompt}"

Provide specific, actionable insights that would help county officials make informed decisions. Include relevant statistics, trends, and recommendations.`;

        // Call Gemini API
        const reportText = await callGeminiAPI(systemPrompt, fullPrompt);
        
        document.getElementById('ai-report-content').innerHTML = formatMarkdown(reportText);
    } catch (error) {
        console.error("Error generating AI report:", error);
        document.getElementById('ai-report-content').textContent = 
            `Error: Could not generate report. ${error.message}\n\nPlease ensure you have configured the Gemini API key in the firebase-config.js file.`;
    } finally {
        document.getElementById('ai-spinner').classList.add('hidden');
    }
}

// Call Gemini API
async function callGeminiAPI(systemPrompt, userPrompt) {
    // IMPORTANT: Replace with your actual Gemini API key
    const apiKey = "YOUR_GEMINI_API_KEY"; // Get this from Google AI Studio
    
    if (apiKey === "YOUR_GEMINI_API_KEY") {
        throw new Error("Gemini API key not configured. Please add your API key to the firebase-config.js file.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ 
            parts: [{ text: userPrompt }] 
        }],
        systemInstruction: { 
            parts: [{ text: systemPrompt }] 
        },
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
        }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

// Format markdown text for display
function formatMarkdown(text) {
    return text
        .replace(/### (.*)/g, '<h3 class="text-lg font-bold text-gray-800 mt-4 mb-2">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h2>')
        .replace(/# (.*)/g, '<h1 class="text-2xl font-bold text-gray-800 mt-6 mb-4">$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-800">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        .replace(/^- (.*)/gm, '<li class="ml-4 mb-1">• $1</li>')
        .replace(/\n\n/g, '</p><p class="mb-3">')
        .replace(/^(?!<[h|l])/gm, '<p class="mb-3">')
        .replace(/(<li.*<\/li>)/g, '<ul class="list-disc ml-6 mb-3">$1</ul>')
        .replace(/(<ul.*<\/ul>)/g, '$1');
}

// User Management Functions
function handleShowUserModal() {
    const modal = document.getElementById('user-modal');
    document.getElementById('user-form').reset();
    modal.classList.remove('hidden');
}

async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('user-form-email').value.trim();
    const password = document.getElementById('user-form-password').value;
    const department = document.getElementById('user-form-department').value;
    const role = document.getElementById('user-form-role').value;
    
    if (!utils.validateEmail(email)) {
        customAlert("Please enter a valid email address.", "Validation Error", "error");
        return;
    }
    
    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user document in Firestore
        const userData = {
            email: email,
            department: department,
            role: role,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.email
        };
        
        await setDoc(doc(db, "users", user.uid), userData);
        
        customAlert(`User ${email} created successfully!`, "Success", "success");
        document.getElementById('user-modal').classList.add('hidden');
        
        // Sign out the new user immediately
        await signOut(auth);
        
    } catch (error) {
        console.error("Error creating user:", error);
        
        if (error.code === 'auth/email-already-in-use') {
            customAlert("This email address is already in use.", "Error", "error");
        } else {
            customAlert("Error creating user. Please try again.", "Error", "error");
        }
    }
}

async function handleDeleteUser(e) {
    const userId = e.currentTarget.dataset.id;
    const user = usersCache?.find(u => u.id === userId);
    
    if (!user) return;
    
    const confirmed = await customConfirm(
        `Are you sure you want to delete user "${user.email}"? This action cannot be undone.`,
        "Delete User"
    );
    
    if (confirmed) {
        try {
            await deleteDoc(doc(db, "users", userId));
            customAlert("User deleted successfully.", "Success", "success");
        } catch (error) {
            console.error("Error deleting user:", error);
            customAlert("Error deleting user.", "Error", "error");
        }
    }
}

// Render users table
function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'table-row';
        tr.innerHTML = `
            <td class="p-4">
                <div class="font-semibold text-gray-900">${user.email}</div>
                <div class="text-sm text-gray-500">UPN: ${user.upn || 'N/A'}</div>
            </td>
            <td class="p-4 text-sm text-gray-600">${user.department}</td>
            <td class="p-4 text-sm text-gray-600">
                <span class="px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                    ${user.role}
                </span>
            </td>
            <td class="p-4">
                ${user.email !== 'jmsmuigai@gmail.com' && user.email !== currentUser?.email ? 
                    `<button class="delete-user-btn text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" data-id="${user.id}" title="Delete User">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>`
                    : '<span class="text-gray-400 text-sm">Protected</span>'
                }
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    lucide.createIcons();
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteUser);
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Login form handlers
    document.getElementById('google-signin-btn').addEventListener('click', handleGmailLogin);
    document.getElementById('upn-login-form').addEventListener('submit', handleUPNLogin);
    document.getElementById('gmail-tab').addEventListener('click', () => switchLoginTab('gmail'));
    document.getElementById('upn-tab').addEventListener('click', () => switchLoginTab('upn'));
    
    // Navigation
    document.getElementById('nav-dashboard').addEventListener('click', () => navigateTo('dashboard'));
    document.getElementById('nav-projects').addEventListener('click', () => navigateTo('projects'));
    document.getElementById('nav-users').addEventListener('click', () => navigateTo('users'));
    document.getElementById('nav-reports').addEventListener('click', () => navigateTo('reports'));
    document.getElementById('nav-analytics').addEventListener('click', () => navigateTo('analytics'));
    
    // Logout
    document.getElementById('logout-button').addEventListener('click', handleLogout);
    
    // Project management
    document.getElementById('add-project-btn').addEventListener('click', () => handleShowProjectModal());
    document.getElementById('cancel-project-form').addEventListener('click', () => {
        document.getElementById('project-modal').classList.add('hidden');
    });
    document.getElementById('project-form').addEventListener('submit', handleProjectFormSubmit);
    
    // User management
    document.getElementById('add-user-btn').addEventListener('click', handleShowUserModal);
    document.getElementById('cancel-user-form').addEventListener('click', () => {
        document.getElementById('user-modal').classList.add('hidden');
    });
    document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
    
    // Filters and search
    document.getElementById('project-search').addEventListener('keyup', applyFilters);
    document.getElementById('department-filter').addEventListener('change', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    
    // CSV upload
    document.getElementById('csv-upload-input').addEventListener('change', handleCsvUpload);
    
    // AI reports
    document.getElementById('generate-report-btn').addEventListener('click', handleGenerateReport);
    
    // Alert modal
    document.getElementById('alert-ok').addEventListener('click', () => {
        document.getElementById('alert-modal').classList.add('hidden');
    });
}

// Initialize application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    main();
});
