// Enhanced Garissa County PMD with Excel-like Functionality
import { 
    app, auth, db, googleProvider, 
    GARISSA_DATA, DEPARTMENTS, PROJECT_STATUS, DEFAULT_ADMIN, utils 
} from './firebase-config.js';
import { ExcelFormulaEngine, GarissaCalculations } from './excel-engine.js';
import { DUMMY_PROJECTS, DUMMY_USERS, DUMMY_ANALYTICS, DUMMY_EXCEL_DATA } from './dummy-data.js';
import LookerStudioIntegration from './looker-integration.js';

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
let excelEngine = new GarissaCalculations();
let lookerStudio = new LookerStudioIntegration();
let lookerStudioConnected = false;

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const loginPage = document.getElementById('login-page');
const appContainer = document.getElementById('app');

// Initialize Enhanced Application
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
    
    // Initialize Looker Studio connection
    initializeLookerStudio();
}

// Initialize Looker Studio Integration
function initializeLookerStudio() {
    // Check if Looker Studio is available
    if (typeof gapi !== 'undefined' && gapi.analytics) {
        lookerStudioConnected = true;
        console.log('Looker Studio connected successfully');
    } else {
        console.log('Looker Studio will be initialized when needed');
    }
}

// Load user data from Firestore
async function loadUserData(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            userData = userDocSnap.data();
            showApp();
            initializeEnhancedDashboard();
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
    setupEnhancedUI();
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

// Setup Enhanced UI
function setupEnhancedUI() {
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
    
    // Add Excel-like features
    setupExcelFeatures();
    
    // Set initial view
    navigateTo('dashboard');
}

// Setup Excel-like Features
function setupExcelFeatures() {
    // Add formula bar
    addFormulaBar();
    
    // Add spreadsheet view
    addSpreadsheetView();
    
    // Add calculation engine
    setupCalculationEngine();
    
    // Add Looker Studio integration
    setupLookerStudioIntegration();
}

// Add Formula Bar
function addFormulaBar() {
    const formulaBarHTML = `
        <div id="formula-bar" class="bg-gray-100 border-b p-2 hidden">
            <div class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-600">Formula:</span>
                <input type="text" id="formula-input" class="flex-1 px-3 py-1 border rounded text-sm font-mono" placeholder="Enter formula (e.g., =SUM(A1:A10))">
                <button id="execute-formula" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Execute
                </button>
                <button id="clear-formula" class="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                    Clear
                </button>
            </div>
        </div>
    `;
    
    document.querySelector('main').insertAdjacentHTML('afterbegin', formulaBarHTML);
    
    // Add event listeners
    document.getElementById('execute-formula').addEventListener('click', executeFormula);
    document.getElementById('clear-formula').addEventListener('click', clearFormula);
}

// Execute Formula
function executeFormula() {
    const formula = document.getElementById('formula-input').value;
    if (!formula) return;
    
    try {
        const result = excelEngine.excelEngine.parseFormula(formula);
        customAlert(`Formula Result: ${result}`, "Formula Execution", "success");
    } catch (error) {
        customAlert(`Formula Error: ${error.message}`, "Formula Error", "error");
    }
}

// Clear Formula
function clearFormula() {
    document.getElementById('formula-input').value = '';
}

// Add Spreadsheet View
function addSpreadsheetView() {
    const spreadsheetHTML = `
        <div id="spreadsheet-view" class="page-view hidden">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <img src="Garissa_logo.png" alt="County Logo" class="w-12 h-12 rounded-full mr-4 border-2 border-red-800">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800">Excel-Style Data View</h2>
                        <p class="text-gray-600">Spreadsheet interface with formulas and calculations</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button id="export-to-excel" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <i data-lucide="download" class="w-4 h-4 mr-2 inline"></i>Export to Excel
                    </button>
                    <button id="import-from-excel" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i data-lucide="upload" class="w-4 h-4 mr-2 inline"></i>Import from Excel
                    </button>
                    <button id="connect-looker" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                        <i data-lucide="bar-chart-3" class="w-4 h-4 mr-2 inline"></i>Connect Looker Studio
                    </button>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="overflow-x-auto">
                    <table id="spreadsheet-table" class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="w-16 p-2 border-r border-b bg-gray-100"></th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">A</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">B</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">C</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">D</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">E</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">F</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">G</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">H</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">I</th>
                                <th class="w-32 p-2 border-r border-b bg-gray-100">J</th>
                            </tr>
                        </thead>
                        <tbody id="spreadsheet-body">
                            <!-- Dynamic rows will be added here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="mt-4 flex space-x-4">
                <button id="add-row" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    Add Row
                </button>
                <button id="add-column" class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    Add Column
                </button>
                <button id="calculate-all" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Calculate All Formulas
                </button>
            </div>
        </div>
    `;
    
    // Add to main content area
    const mainContent = document.querySelector('main .p-6');
    mainContent.insertAdjacentHTML('beforeend', spreadsheetHTML);
    
    // Initialize spreadsheet
    initializeSpreadsheet();
}

// Initialize Spreadsheet
function initializeSpreadsheet() {
    const tbody = document.getElementById('spreadsheet-body');
    
    // Create 50 rows
    for (let row = 1; row <= 50; row++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="w-16 p-2 border-r border-b bg-gray-50 text-center font-medium">${row}</td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="A${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="B${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="C${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="D${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="E${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="F${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="G${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="H${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="I${row}"></td>
            <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="J${row}"></td>
        `;
        tbody.appendChild(tr);
    }
    
    // Add event listeners
    setupSpreadsheetEventListeners();
}

// Setup Spreadsheet Event Listeners
function setupSpreadsheetEventListeners() {
    // Cell input listeners
    document.querySelectorAll('#spreadsheet-table input').forEach(input => {
        input.addEventListener('focus', function() {
            const cellRef = this.dataset.cell;
            document.getElementById('formula-input').value = cellRef;
            showFormulaBar();
        });
        
        input.addEventListener('blur', function() {
            const cellRef = this.dataset.cell;
            const value = this.value;
            
            if (value.startsWith('=')) {
                try {
                    const result = excelEngine.excelEngine.parseFormula(value);
                    this.value = result;
                    excelEngine.excelEngine.setVariable(cellRef, result);
                } catch (error) {
                    console.error('Formula error:', error);
                }
            } else {
                excelEngine.excelEngine.setVariable(cellRef, value);
            }
        });
    });
    
    // Button listeners
    document.getElementById('add-row').addEventListener('click', addSpreadsheetRow);
    document.getElementById('add-column').addEventListener('click', addSpreadsheetColumn);
    document.getElementById('calculate-all').addEventListener('click', calculateAllFormulas);
    document.getElementById('export-to-excel').addEventListener('click', exportToExcel);
    document.getElementById('import-from-excel').addEventListener('click', importFromExcel);
    document.getElementById('connect-looker').addEventListener('click', connectLookerStudio);
}

// Show Formula Bar
function showFormulaBar() {
    document.getElementById('formula-bar').classList.remove('hidden');
}

// Add Spreadsheet Row
function addSpreadsheetRow() {
    const tbody = document.getElementById('spreadsheet-body');
    const currentRows = tbody.children.length;
    const newRow = currentRows + 1;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="w-16 p-2 border-r border-b bg-gray-50 text-center font-medium">${newRow}</td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="A${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="B${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="C${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="D${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="E${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="F${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="G${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="H${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="I${newRow}"></td>
        <td class="w-32 p-1 border-r border-b"><input type="text" class="w-full border-0 focus:ring-0 p-1 text-sm" data-cell="J${newRow}"></td>
    `;
    tbody.appendChild(tr);
    
    // Re-setup event listeners for new inputs
    setupSpreadsheetEventListeners();
}

// Add Spreadsheet Column
function addSpreadsheetColumn() {
    // Implementation for adding columns
    customAlert("Column addition feature will be implemented in the next version", "Feature Coming Soon", "info");
}

// Calculate All Formulas
function calculateAllFormulas() {
    document.querySelectorAll('#spreadsheet-table input').forEach(input => {
        if (input.value.startsWith('=')) {
            try {
                const result = excelEngine.excelEngine.parseFormula(input.value);
                input.value = result;
            } catch (error) {
                console.error('Formula calculation error:', error);
            }
        }
    });
    customAlert("All formulas have been calculated!", "Calculation Complete", "success");
}

// Export to Excel
function exportToExcel() {
    const data = [];
    document.querySelectorAll('#spreadsheet-table input').forEach(input => {
        const cellRef = input.dataset.cell;
        const value = input.value;
        if (value) {
            data.push({ cell: cellRef, value: value });
        }
    });
    
    // Convert to CSV format
    let csvContent = "Cell,Value\n";
    data.forEach(row => {
        csvContent += `${row.cell},${row.value}\n`;
    });
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'garissa-county-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    customAlert("Data exported successfully!", "Export Complete", "success");
}

// Import from Excel
function importFromExcel() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const csv = e.target.result;
                parseAndImportCSV(csv);
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Parse and Import CSV
function parseAndImportCSV(csv) {
    const lines = csv.split('\n');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header
        const [cell, value] = lines[i].split(',');
        if (cell && value) {
            data.push({ cell: cell.trim(), value: value.trim() });
        }
    }
    
    // Populate spreadsheet
    data.forEach(item => {
        const input = document.querySelector(`input[data-cell="${item.cell}"]`);
        if (input) {
            input.value = item.value;
            excelEngine.excelEngine.setVariable(item.cell, item.value);
        }
    });
    
    customAlert(`${data.length} cells imported successfully!`, "Import Complete", "success");
}

// Connect to Looker Studio
function connectLookerStudio() {
    if (lookerStudioConnected) {
        customAlert("Looker Studio is already connected!", "Connection Status", "success");
        return;
    }
    
    // Initialize Looker Studio connection
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/charts/loader.js';
    script.onload = function() {
        google.charts.load('current', {packages: ['corechart', 'table']});
        google.charts.setOnLoadCallback(function() {
            lookerStudioConnected = true;
            customAlert("Looker Studio connected successfully! You can now create professional dashboards.", "Connection Success", "success");
            createLookerStudioDashboard();
        });
    };
    document.head.appendChild(script);
}

// Create Looker Studio Dashboard
function createLookerStudioDashboard() {
    const dashboardHTML = `
        <div id="looker-dashboard" class="page-view hidden">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center">
                    <img src="Garissa_logo.png" alt="County Logo" class="w-12 h-12 rounded-full mr-4 border-2 border-red-800">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800">Professional Dashboard</h2>
                        <p class="text-gray-600">Looker Studio integrated analytics and reporting</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button id="refresh-dashboard" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i data-lucide="refresh-cw" class="w-4 h-4 mr-2 inline"></i>Refresh
                    </button>
                    <button id="export-dashboard" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <i data-lucide="download" class="w-4 h-4 mr-2 inline"></i>Export
                    </button>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-semibold mb-4">Project Performance Overview</h3>
                    <div id="performance-chart"></div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-semibold mb-4">Budget Analysis</h3>
                    <div id="budget-chart-looker"></div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-semibold mb-4">Department Comparison</h3>
                    <div id="department-chart-looker"></div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-semibold mb-4">Timeline Analysis</h3>
                    <div id="timeline-chart-looker"></div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-semibold mb-4">Risk Assessment</h3>
                    <div id="risk-chart-looker"></div>
                </div>
            </div>
        </div>
    `;
    
    const mainContent = document.querySelector('main .p-6');
    mainContent.insertAdjacentHTML('beforeend', dashboardHTML);
    
    // Initialize Looker Studio charts
    initializeLookerCharts();
}

// Initialize Looker Studio Charts
function initializeLookerCharts() {
    if (!lookerStudioConnected) return;
    
    // Performance Chart
    const performanceData = google.visualization.arrayToDataTable([
        ['Status', 'Count'],
        ['Completed', projectsCache.filter(p => p.status === 'Completed').length],
        ['Ongoing', projectsCache.filter(p => p.status === 'Ongoing').length],
        ['Stalled', projectsCache.filter(p => p.status === 'Stalled').length],
        ['Planning', projectsCache.filter(p => p.status === 'Planning').length]
    ]);
    
    const performanceChart = new google.visualization.PieChart(document.getElementById('performance-chart'));
    performanceChart.draw(performanceData, {
        title: 'Project Status Distribution',
        backgroundColor: '#f8fafc',
        colors: ['#10b981', '#f59e0b', '#ef4444', '#6b7280']
    });
    
    // Budget Chart
    const budgetData = google.visualization.arrayToDataTable([
        ['Department', 'Budget', 'Expenditure'],
        ...DEPARTMENTS.map(dept => {
            const deptProjects = projectsCache.filter(p => p.department === dept);
            const budget = deptProjects.reduce((sum, p) => sum + p.budget, 0);
            const expenditure = deptProjects.reduce((sum, p) => sum + p.expenditure, 0);
            return [dept.split(',')[0], budget, expenditure];
        })
    ]);
    
    const budgetChart = new google.visualization.ColumnChart(document.getElementById('budget-chart-looker'));
    budgetChart.draw(budgetData, {
        title: 'Budget vs Expenditure by Department',
        hAxis: { title: 'Department' },
        vAxis: { title: 'Amount (KSh)' },
        backgroundColor: '#f8fafc'
    });
    
    // Department Chart
    const departmentData = google.visualization.arrayToDataTable([
        ['Department', 'Projects'],
        ...DEPARTMENTS.map(dept => {
            const count = projectsCache.filter(p => p.department === dept).length;
            return [dept.split(',')[0], count];
        })
    ]);
    
    const departmentChart = new google.visualization.BarChart(document.getElementById('department-chart-looker'));
    departmentChart.draw(departmentData, {
        title: 'Projects by Department',
        hAxis: { title: 'Number of Projects' },
        backgroundColor: '#f8fafc'
    });
    
    // Timeline Chart
    const timelineData = google.visualization.arrayToDataTable([
        ['Month', 'Projects Started', 'Projects Completed'],
        ['Jan', 5, 3],
        ['Feb', 8, 6],
        ['Mar', 12, 9],
        ['Apr', 15, 11],
        ['May', 18, 14],
        ['Jun', 22, 17]
    ]);
    
    const timelineChart = new google.visualization.LineChart(document.getElementById('timeline-chart-looker'));
    timelineChart.draw(timelineData, {
        title: 'Project Timeline',
        hAxis: { title: 'Month' },
        vAxis: { title: 'Number of Projects' },
        backgroundColor: '#f8fafc'
    });
    
    // Risk Chart
    const riskData = google.visualization.arrayToDataTable([
        ['Risk Level', 'Count'],
        ['Low Risk', projectsCache.filter(p => excelEngine.calculateProjectKPIs(p).riskLevel === 'Low Risk').length],
        ['Medium Risk', projectsCache.filter(p => excelEngine.calculateProjectKPIs(p).riskLevel === 'Medium Risk').length],
        ['High Risk', projectsCache.filter(p => excelEngine.calculateProjectKPIs(p).riskLevel === 'High Risk').length]
    ]);
    
    const riskChart = new google.visualization.PieChart(document.getElementById('risk-chart-looker'));
    riskChart.draw(riskData, {
        title: 'Project Risk Distribution',
        backgroundColor: '#f8fafc',
        colors: ['#10b981', '#f59e0b', '#ef4444']
    });
}

// Setup Calculation Engine
function setupCalculationEngine() {
    // Populate with sample data for demonstration
    populateSampleData();
}

// Populate Sample Data
function populateSampleData() {
    // Add sample formulas and data to demonstrate Excel-like functionality
    const sampleData = [
        { cell: 'A1', value: 'Project Name' },
        { cell: 'B1', value: 'Budget' },
        { cell: 'C1', value: 'Expenditure' },
        { cell: 'D1', value: 'Progress %' },
        { cell: 'E1', value: 'Status' },
        { cell: 'A2', value: 'Water Project 1' },
        { cell: 'B2', value: '1000000' },
        { cell: 'C2', value: '750000' },
        { cell: 'D2', value: '=PERCENTAGE(C2,B2)' },
        { cell: 'E2', value: 'Ongoing' },
        { cell: 'A3', value: 'Education Project 1' },
        { cell: 'B3', value: '2000000' },
        { cell: 'C3', value: '1800000' },
        { cell: 'D3', value: '=PERCENTAGE(C3,B3)' },
        { cell: 'E3', value: 'Completed' },
        { cell: 'A4', value: 'Health Project 1' },
        { cell: 'B4', value: '1500000' },
        { cell: 'C4', value: '500000' },
        { cell: 'D4', value: '=PERCENTAGE(C4,B4)' },
        { cell: 'E4', value: 'Planning' },
        { cell: 'B6', value: 'Total Budget:' },
        { cell: 'C6', value: '=SUM(B2:B4)' },
        { cell: 'B7', value: 'Total Expenditure:' },
        { cell: 'C7', value: '=SUM(C2:C4)' },
        { cell: 'B8', value: 'Average Progress:' },
        { cell: 'C8', value: '=AVERAGE(D2:D4)' }
    ];
    
    // Populate spreadsheet with sample data
    setTimeout(() => {
        sampleData.forEach(item => {
            const input = document.querySelector(`input[data-cell="${item.cell}"]`);
            if (input) {
                input.value = item.value;
                if (item.value.startsWith('=')) {
                    try {
                        const result = excelEngine.excelEngine.parseFormula(item.value);
                        input.value = result;
                    } catch (error) {
                        console.error('Formula error:', error);
                    }
                }
                excelEngine.excelEngine.setVariable(item.cell, input.value);
            }
        });
    }, 1000);
}

// Initialize Enhanced Dashboard
function initializeEnhancedDashboard() {
    setupMap();
    setupCharts();
    setupProjectListeners();
    setupUserListeners();
    
    // Add Excel view to navigation
    addExcelNavigation();
}

// Add Excel Navigation
function addExcelNavigation() {
    const nav = document.querySelector('.sidebar nav');
    const excelNavHTML = `
        <a href="#" id="nav-excel" class="sidebar-link flex items-center py-2.5 px-4 rounded-lg">
            <i data-lucide="table" class="w-5 h-5 mr-3"></i> Excel View
        </a>
        <a href="#" id="nav-looker" class="sidebar-link flex items-center py-2.5 px-4 rounded-lg">
            <i data-lucide="bar-chart-3" class="w-5 h-5 mr-3"></i> Looker Studio
        </a>
    `;
    nav.insertAdjacentHTML('beforeend', excelNavHTML);
    
    // Add event listeners
    document.getElementById('nav-excel').addEventListener('click', () => navigateTo('excel'));
    document.getElementById('nav-looker').addEventListener('click', () => navigateTo('looker'));
}

// Enhanced Navigation
function navigateTo(viewName) {
    // Hide all views
    document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    
    // Show selected view
    const viewElement = document.getElementById(`view-${viewName}`);
    if (viewElement) {
        viewElement.classList.remove('hidden');
    }
    
    // Handle special views
    if (viewName === 'excel') {
        document.getElementById('spreadsheet-view').classList.remove('hidden');
        showFormulaBar();
    } else if (viewName === 'looker') {
        if (lookerStudioConnected) {
            document.getElementById('looker-dashboard').classList.remove('hidden');
            initializeLookerCharts();
        } else {
            connectLookerStudio();
        }
    }
    
    // Update navigation
    const navElement = document.getElementById(`nav-${viewName}`);
    if (navElement) {
        navElement.classList.add('active');
    }
}

// Rest of the functions from the original app.js...
// (setupMap, setupCharts, setupProjectListeners, etc. - same as before)

// Initialize application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    main();
});
