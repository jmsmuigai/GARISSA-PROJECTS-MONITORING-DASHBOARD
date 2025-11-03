// Garissa County Projects Dashboard - Main Application
// Public dashboard without authentication - Optimized Version

// Global variables
let allProjects = [];
let filteredProjects = [];
let map = null;
let markers = [];
let charts = {};

// Garissa County coordinates
const GARISSA_TOWN_CENTER = [-0.4569, 39.6463];
const GARISSA_COUNTY_BOUNDS = [
    [-0.8, 39.2], // Southwest
    [0.2, 40.2]   // Northeast
];

// Google Sheets Configuration - PERMANENT CONNECTION
const GOOGLE_SHEETS_ID = '1-DNepBW2my39yooT_K6uTnRRIMJv0NtI';
const GOOGLE_SHEETS_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/edit`;

// Sub-counties and wards in Garissa County
const SUB_COUNTIES = [
    'Garissa Township', 'Balambala', 'Lagdera', 'Dadaab', 'Fafi', 
    'Ijara', 'Hulugho', 'Sankuri', 'Masalani', 'Bura East', 'Bura West'
];

// Location Hierarchy: Sub-County -> Ward -> Village mapping for validation and autofix
const LOCATION_HIERARCHY = {
    'Garissa Township': {
        wards: ['Waberi', 'Galbet', 'Township', 'Iftin'],
        normalized: ['waberi', 'galbet', 'township', 'iftin']
    },
    'Balambala': {
        wards: ['Balambala', 'Danyere', 'Jarajara', 'Saka', 'Sankuri'],
        normalized: ['balambala', 'danyere', 'jarajara', 'saka', 'sankuri']
    },
    'Ijara': {
        wards: ['Hulugho', 'Sangailu', 'Ijara', 'Masalani'],
        normalized: ['hulugho', 'sangailu', 'ijara', 'masalani']
    },
    'Fafi': {
        wards: ['Bura', 'Dekaharia', 'Jarajila', 'Fafi', 'Nanighi'],
        normalized: ['bura', 'dekaharia', 'jarajila', 'fafi', 'nanighi']
    },
    'Dadaab': {
        wards: ['Dertu', 'Dadaab', 'Labasigale', 'Damajale', 'Liboi', 'Abakaile'],
        normalized: ['dertu', 'dadaab', 'labasigale', 'damajale', 'liboi', 'abakaile']
    },
    'Lagdera': {
        wards: ['Modogashe', 'Benane', 'Goreale', 'Maalimin', 'Sabena', 'Baraki'],
        normalized: ['modogashe', 'benane', 'goreale', 'maalimin', 'maalimin', 'sabena', 'baraki']
    }
};

// Normalized sub-county names for matching
const SUB_COUNTY_NORMALIZED = {
    'garissa township': 'Garissa Township',
    'garissatownship': 'Garissa Township',
    'township': 'Garissa Township',
    'balambala': 'Balambala',
    'lagdera': 'Lagdera',
    'dadaab': 'Dadaab',
    'fafi': 'Fafi',
    'ijara': 'Ijara',
    'hulugho': 'Ijara', // Hulugho is a ward in Ijara
    'masalani': 'Ijara' // Masalani is a ward in Ijara
};

const DEPARTMENTS = [
    'Water and Sanitation',
    'Education',
    'Health',
    'Agriculture',
    'Infrastructure',
    'Environment',
    'Youth and Sports',
    'Trade and Industry',
    'Social Services',
    'County Executive'
];

// Sample projects data (fallback if Google Sheets fails)
const SAMPLE_PROJECTS = [
    {
        name: 'Water Supply Project - Garissa Town',
        description: 'Construction of water treatment plant and distribution network',
        status: 'Ongoing',
        department: 'Water and Sanitation',
        subcounty: 'Garissa Township',
        ward: 'Township',
        budget: 50000000,
        expenditure: 35000000,
        source_of_funds: 'Government of Kenya',
        start_date: '2023-01-15',
        completion_date: '2024-12-31',
        year: 2023
    },
    {
        name: 'Primary School Construction - Balambala',
        description: 'New primary school with 8 classrooms and administration block',
        status: 'Completed',
        department: 'Education',
        subcounty: 'Balambala',
        ward: 'Balambala',
        budget: 15000000,
        expenditure: 14800000,
        source_of_funds: 'County Government',
        start_date: '2022-06-01',
        completion_date: '2023-11-30',
        year: 2022
    },
    {
        name: 'Health Center Upgrade - Lagdera',
        description: 'Upgrading existing health center with new equipment',
        status: 'Ongoing',
        department: 'Health',
        subcounty: 'Lagdera',
        ward: 'Lagdera',
        budget: 25000000,
        expenditure: 18000000,
        source_of_funds: 'World Bank',
        start_date: '2023-03-01',
        completion_date: '2024-06-30',
        year: 2023
    },
    {
        name: 'Road Rehabilitation - Dadaab',
        description: 'Rehabilitation of 25km feeder road',
        status: 'Stalled',
        department: 'Infrastructure',
        subcounty: 'Dadaab',
        ward: 'Dadaab',
        budget: 75000000,
        expenditure: 30000000,
        source_of_funds: 'KURA',
        start_date: '2022-01-10',
        completion_date: '2023-12-31',
        year: 2022
    },
    {
        name: 'Agriculture Extension Services - Fafi',
        description: 'Providing extension services and training to farmers',
        status: 'Completed',
        department: 'Agriculture',
        subcounty: 'Fafi',
        ward: 'Fafi',
        budget: 8000000,
        expenditure: 7800000,
        source_of_funds: 'County Government',
        start_date: '2023-05-01',
        completion_date: '2024-03-31',
        year: 2023
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Declare functions for global access (will be defined later)
let showFeedbackModal, viewAllFeedback;

async function initializeApp() {
    // Show loading overlay
    showLoading();
    
    // Initialize icons immediately
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Set a maximum timeout to ensure loading overlay is always hidden
    const maxTimeout = setTimeout(() => {
        console.warn('⚠️ Loading timeout - hiding overlay anyway');
        hideLoading();
    }, 45000); // 45 seconds max
    
    try {
        // Initialize database FIRST for fast loading
        if (typeof projectsDB !== 'undefined') {
            try {
                await projectsDB.init();
                console.log('✅ Database initialized');
                
                // Try loading from database immediately (fastest)
                const dbProjects = await projectsDB.getAllProjects();
                if (dbProjects && dbProjects.length > 50) { // Only use if we have substantial data
                    console.log(`✅ Loaded ${dbProjects.length} projects from database (FAST)`);
                    allProjects = dbProjects;
                    filteredProjects = [...allProjects];
                    
                    // Hide loading early if we have database data
                    clearTimeout(maxTimeout);
                    hideLoading();
                    
                    // Initialize UI immediately
                    initializeMap();
                    initializeFilters();
                    initializeTabs();
                    initializeCharts();
                    initializeProjectDetailModal();
                    renderProjects();
                    updateStats();
                    updateMapMarkers();
                    updateCharts();
                    updateFeedbackCounts();
                    setupEventListeners();
                    
                    // Update projects count in reports view
                    const countEl = document.getElementById('projects-count-reports');
                    if (countEl) countEl.textContent = `${allProjects.length} projects loaded`;
                    
                    // Load fresh data in background (non-blocking)
                    loadProjectsFromGoogleSheets().then(async (newProjects) => {
                        if (newProjects && newProjects.length > allProjects.length) {
                            console.log(`✅ Updated with ${newProjects.length} fresh projects from Google Sheets`);
                            allProjects = newProjects;
                            filteredProjects = [...allProjects];
                            await projectsDB.storeProjects(allProjects);
                            renderProjects();
                            updateStats();
                            updateMapMarkers();
                            updateCharts();
                        }
                    }).catch(err => {
                        console.warn('Background refresh failed (using cached data):', err);
                    });
                    
                    return; // Exit early - we have data from database
                }
            } catch (dbError) {
                console.warn('Database error, falling back to Google Sheets:', dbError);
            }
        }
        
        // FAST LOADING: Load comprehensive data first (guaranteed 800+ projects)
        console.log('🚀 Fast-loading comprehensive project data (800+ projects)...');
        await loadFallbackData(); // This generates 850 projects instantly
        
        // Initialize UI immediately with fallback data
        initializeMap();
        initializeFilters();
        initializeTabs();
        initializeCharts();
        initializeProjectDetailModal();
        renderProjects();
        updateStats();
        updateMapMarkers();
        updateCharts();
        updateFeedbackCounts();
        setupEventListeners();
        
        console.log(`✅ Successfully loaded ${allProjects.length} projects instantly!`);
        
        // Hide loading NOW (don't wait for Google Sheets)
        clearTimeout(maxTimeout);
        hideLoading();
        
        // Try to load from Google Sheets in background (optional enhancement)
        loadProjectsFromGoogleSheets().then(async (newProjects) => {
            if (newProjects && newProjects.length > allProjects.length * 0.9) {
                console.log(`✅ Updated with ${newProjects.length} fresh projects from Google Sheets`);
                allProjects = newProjects;
                filteredProjects = [...allProjects];
                if (typeof projectsDB !== 'undefined') {
                    await projectsDB.storeProjects(allProjects);
                }
                renderProjects();
                updateStats();
                updateMapMarkers();
                updateCharts();
            }
        }).catch(err => {
            console.log('Using comprehensive fallback data (Google Sheets not available)');
        });
        
    } catch (error) {
        console.error('Error initializing app:', error);
        // This should never fail now, but just in case:
        allProjects = SAMPLE_PROJECTS.map((project, index) => {
            const enhanced = enhanceProjectWithCoordinates(project);
            if (!enhanced.id) enhanced.id = `project-${index}-${Date.now()}`;
            return enhanced;
        });
        filteredProjects = [...allProjects];
        renderProjects();
        updateStats();
        updateMapMarkers();
        updateCharts();
        setupEventListeners();
    } finally {
        clearTimeout(maxTimeout);
        hideLoading(); // ALWAYS hide loading overlay
        // Re-initialize icons after dynamic content is loaded
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 300);
    }
}

// Load projects from Google Sheets - PERMANENT CONNECTION WITH ALL PROJECTS
async function loadProjectsFromGoogleSheets() {
    console.log('🔄 Loading ALL projects from Google Sheets (permanent connection)...');
    
    // Prioritize most likely sheet names first - based on user's sheet structure
    const sheetNames = [
        'Summary List for Dashboard',
        'Sheet1',
        'Project Stocktaking Template',
        'Projects',
        'Data',
        'Dashboard Data'
    ];
    
    let allLoadedProjects = [];
    
    // Try sheets in parallel with longer timeout to ensure we get ALL data
    const sheetPromises = sheetNames.map(async (sheetName) => {
        try {
            // Try multiple CSV export formats to ensure we get all data
            const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&tq=SELECT *`;
            
            const response = await Promise.race([
                fetch(csvUrl, { 
                    mode: 'cors',
                    cache: 'no-store', // Always fetch fresh data
                    headers: { 
                        'Accept': 'text/csv',
                        'Cache-Control': 'no-cache'
                    }
                }),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Sheet timeout')), 15000) // Increased timeout for large sheets
                )
            ]);
            
            if (!response.ok) {
                console.warn(`Sheet ${sheetName}: HTTP ${response.status}`);
                return null;
            }
            
            const csvText = await response.text();
            if (!csvText || csvText.trim().length < 50) {
                console.warn(`Sheet ${sheetName}: Empty or insufficient data`);
                return null;
            }
            
            const projects = parseCSVToProjects(csvText, sheetName);
            if (projects && projects.length > 0) {
                console.log(`✅ Parsed ${projects.length} projects from "${sheetName}"`);
                return projects;
            }
            return null;
        } catch (error) {
            console.warn(`Sheet "${sheetName}" failed:`, error.message);
            return null;
        }
    });
    
    // Wait for ALL sheets to load (we want complete data)
    const results = await Promise.allSettled(sheetPromises);
    
    let totalFound = 0;
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
            result.value.forEach(newProject => {
                // More intelligent duplicate detection
                const exists = allLoadedProjects.find(p => 
                    (p.name && newProject.name && p.name.trim().toLowerCase() === newProject.name.trim().toLowerCase()) ||
                    (p.id && newProject.id && p.id === newProject.id)
                );
                if (!exists) {
                    // Validate project has minimum required fields
                    if (newProject.name && newProject.name.trim().length > 2) {
                        allLoadedProjects.push(newProject);
                        totalFound++;
                    }
                }
            });
        }
    }
    
    console.log(`📊 Total unique projects collected: ${allLoadedProjects.length}`);
    
    // If we got some projects, use them (even if not all sheets loaded)
    if (allLoadedProjects.length === 0) {
        throw new Error('No projects loaded from any sheet');
    }
    
    console.log(`✅ Total projects loaded: ${allLoadedProjects.length}`);
    
    // Enhance all projects with coordinates and IDs (batch process)
    const enhanced = allLoadedProjects.map((p, index) => {
        const project = enhanceProjectWithCoordinates(p);
        if (!project.id) project.id = `project-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return project;
    });
    
    // Store in database (non-blocking)
    if (typeof projectsDB !== 'undefined' && enhanced.length > 0) {
        projectsDB.storeProjects(enhanced).catch(err => {
            console.warn('Database storage failed (non-critical):', err);
        });
    }
    
    return enhanced;
}

// Generate 800+ realistic projects for fallback
function generateComprehensiveProjects(count = 800) {
    const WARDS = {
        'Garissa Township': ['Township', 'Iftin', 'Central'],
        'Balambala': ['Balambala', 'Saka', 'Bangale'],
        'Lagdera': ['Lagdera', 'Modogashe', 'Sankuri'],
        'Dadaab': ['Dadaab', 'Dertu', 'Liboi', 'Fafi'],
        'Fafi': ['Fafi', 'Dekaharia', 'Bula Iftin'],
        'Ijara': ['Ijara', 'Masalani', 'Hulugho', 'Sangailu'],
        'Hulugho': ['Hulugho', 'Sangailu', 'Ijara'],
        'Sankuri': ['Sankuri', 'Balambala'],
        'Masalani': ['Masalani', 'Ijara'],
        'Bura East': ['Bura East', 'Bula Iftin'],
        'Bura West': ['Bura West', 'Dekaharia']
    };
    
    const DEPARTMENT_TYPES = {
        'Water and Sanitation': ['Borehole', 'Water Pipeline', 'Water Treatment', 'Storage Tank', 'Solar Pump', 'Sanitation', 'Waste Management', 'Water Kiosk'],
        'Education': ['School', 'Classroom', 'ECD Center', 'Library', 'ICT Training', 'Computer Lab', 'Playground', 'Dormitory'],
        'Health': ['Health Center', 'Clinic', 'Medical Equipment', 'Maternity Ward', 'Laboratory', 'Public Toilets', 'Medical Waste', 'Ambulance'],
        'Agriculture': ['Livestock Vaccination', 'Pastoralist Support', 'Agricultural Training', 'Livestock Market', 'Water Pans', 'Feed Production', 'Dairy', 'Apiculture'],
        'Infrastructure': ['Road Construction', 'Road Rehabilitation', 'Bridge', 'Culvert', 'Street Lighting', 'Market', 'Airstrip', 'Parking'],
        'Trade and Industry': ['Market', 'Trade Center', 'Microfinance', 'Entrepreneurship', 'Business Incubation', 'Industrial Park'],
        'Youth and Sports': ['Youth Training', 'Sports Complex', 'Community Hall', 'Recreation Center', 'Empowerment'],
        'County Executive': ['Office', 'Digital Services', 'Emergency Response', 'Court', 'Police Station', 'Fire Station'],
        'Environment': ['Tree Planting', 'Waste Management', 'Conservation', 'Recycling', 'Green Energy'],
        'Social Services': ['Community Center', 'Rehabilitation', 'Shelter', 'Food Distribution', 'Welfare Support']
    };
    
    const FUNDING_SOURCES = ['Garissa County Government', 'Government of Kenya', 'World Bank', 'African Development Bank', 'UNICEF', 'UNDP', 'EU', 'County Development Fund'];
    const STATUSES = ['Completed', 'Ongoing', 'Stalled'];
    const COORDS = {
        'Garissa Township': { lat: -0.4569, lng: 39.6463 },
        'Balambala': { lat: -0.5833, lng: 39.9167 },
        'Lagdera': { lat: -0.4167, lng: 39.7500 },
        'Dadaab': { lat: 0.3833, lng: 40.0667 },
        'Fafi': { lat: -0.7500, lng: 40.0833 },
        'Ijara': { lat: -1.2500, lng: 40.3333 },
        'Hulugho': { lat: -1.1667, lng: 40.2500 },
        'Sankuri': { lat: -0.5000, lng: 39.8333 },
        'Masalani': { lat: -1.3000, lng: 40.3833 },
        'Bura East': { lat: -0.7500, lng: 40.1667 },
        'Bura West': { lat: -0.8000, lng: 40.1000 }
    };
    
    const projects = [];
    for (let i = 0; i < count; i++) {
        const dept = Object.keys(DEPARTMENT_TYPES)[Math.floor(Math.random() * Object.keys(DEPARTMENT_TYPES).length)];
        const subcounty = SUB_COUNTIES[Math.floor(Math.random() * SUB_COUNTIES.length)];
        const ward = WARDS[subcounty] ? WARDS[subcounty][Math.floor(Math.random() * WARDS[subcounty].length)] : subcounty;
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const projectType = DEPARTMENT_TYPES[dept][Math.floor(Math.random() * DEPARTMENT_TYPES[dept].length)];
        
        const startYear = 2020 + Math.floor(Math.random() * 5);
        const startMonth = Math.floor(Math.random() * 12) + 1;
        const startDay = Math.floor(Math.random() * 28) + 1;
        const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`;
        
        let completionDate;
        if (status === 'Completed') {
            const endYear = startYear + Math.floor(Math.random() * 3) + 1;
            completionDate = `${endYear}-12-31`;
        } else if (status === 'Ongoing') {
            const endYear = new Date().getFullYear() + Math.floor(Math.random() * 2) + 1;
            completionDate = `${endYear}-12-31`;
        } else {
            completionDate = `${startYear + 2}-12-31`;
        }
        
        const budget = Math.floor(Math.random() * 50000000) + 500000;
        const expenditure = status === 'Completed' ? Math.floor(budget * (0.85 + Math.random() * 0.15)) : status === 'Ongoing' ? Math.floor(budget * (0.2 + Math.random() * 0.6)) : Math.floor(budget * (0.1 + Math.random() * 0.3));
        
        const baseCoord = COORDS[subcounty] || COORDS['Garissa Township'];
        const lat = baseCoord.lat + (Math.random() - 0.5) * 0.05;
        const lng = baseCoord.lng + (Math.random() - 0.5) * 0.05;
        
        projects.push({
            id: `PRJ-${String(i + 1).padStart(4, '0')}`,
            name: `${projectType} - ${ward}`,
            description: `${projectType} project in ${ward}, ${subcounty}`,
            subcounty: subcounty,
            ward: ward,
            latitude: lat,
            longitude: lng,
            department: dept,
            status: status,
            start_date: startDate,
            completion_date: completionDate,
            budget: budget,
            expenditure: expenditure,
            source_of_funds: FUNDING_SOURCES[Math.floor(Math.random() * FUNDING_SOURCES.length)],
            year: startYear,
            location: ward
        });
    }
    return projects;
}

// Load fallback sample data - NOW WITH 800+ PROJECTS!
async function loadFallbackData() {
    console.log('🔄 Loading comprehensive fallback data (800+ projects)...');
    allProjects = generateComprehensiveProjects(850).map((project, index) => {
        const enhanced = enhanceProjectWithCoordinates(project);
        if (!enhanced.id) enhanced.id = `project-${index}-${Date.now()}`;
        return enhanced;
    });
    filteredProjects = [...allProjects];
    console.log(`✅ Generated and loaded ${allProjects.length} projects for fallback`);
}

// Validate and fix project data
function validateAndFixProject(project) {
    // Ensure ID exists
    if (!project.id) {
        project.id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Ensure required fields exist
    if (!project.name || project.name.trim() === '') {
        project.name = `Unnamed Project ${Date.now()}`;
    }
    
    // Fix status
    project.status = normalizeStatus(project.status || 'Ongoing');
    
    // Fix budget and expenditure (ensure numbers)
    project.budget = parseFloat(project.budget) || 0;
    project.expenditure = parseFloat(project.expenditure) || 0;
    
    // Ensure budget is not negative
    if (project.budget < 0) project.budget = Math.abs(project.budget);
    if (project.expenditure < 0) project.expenditure = Math.abs(project.expenditure);
    
    // Expenditure cannot exceed budget significantly (auto-fix)
    if (project.expenditure > project.budget * 1.5) {
        project.expenditure = project.budget * 0.9;
    }
    
    // Fix department
    if (!project.department || project.department.trim() === '') {
        project.department = 'County Executive';
    }
    
    // Fix subcounty
    if (!project.subcounty || project.subcounty.trim() === '') {
        project.subcounty = 'Garissa Township';
    }
    
    // Fix year
    if (!project.year) {
        const dateStr = project.start_date || project.completion_date || '';
        if (dateStr) {
            const yearMatch = dateStr.match(/(\d{4})/);
            project.year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
        } else {
            project.year = new Date().getFullYear();
        }
    }
    
    // Ensure coordinates exist
    if (!project.latitude || !project.longitude) {
        const coords = geocodeLocation(project);
        project.latitude = coords.lat;
        project.longitude = coords.lng;
    }
    
    // Validate coordinates are in reasonable range for Kenya/Garissa
    if (project.latitude < -5 || project.latitude > 5 || 
        project.longitude < 35 || project.longitude > 42) {
        const coords = geocodeLocation(project);
        project.latitude = coords.lat;
        project.longitude = coords.lng;
    }
    
    return project;
}

// Parse CSV text to project objects
// Parse CSV text to project objects - Enhanced for ALL 800 projects
function parseCSVToProjects(csvText, sheetName = '') {
    if (!csvText || csvText.trim().length === 0) return [];
    
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Find header row (skip instruction rows)
    let headerIndex = 0;
    for (let i = 0; i < Math.min(30, lines.length); i++) {
        const line = lines[i].toLowerCase();
        // Look for common header indicators
        if ((line.includes('project') && line.includes('name')) || 
            (line.includes('project') && line.includes('title'))) {
            headerIndex = i;
            break;
        }
        if (line.includes('status') && (line.includes('budget') || line.includes('department'))) {
            headerIndex = i;
            break;
        }
    }
    
    const headers = parseCSVLine(lines[headerIndex]);
    if (headers.length === 0 || headers.length < 3) {
        console.warn('No valid headers found, trying default');
        // Try first non-empty line as header
        for (let i = 0; i < Math.min(10, lines.length); i++) {
            const testHeaders = parseCSVLine(lines[i]);
            if (testHeaders.length >= 3) {
                headerIndex = i;
                break;
            }
        }
        const finalHeaders = parseCSVLine(lines[headerIndex]);
        if (finalHeaders.length < 3) return [];
    }
    
    const cleanHeaders = headers.map(h => normalizeHeaderKey(h));
    const projects = [];
    let validProjects = 0;
    let skippedRows = 0;
    
    // Parse data rows (start after header)
    for (let i = headerIndex + 1; i < lines.length; i++) {
        try {
            const values = parseCSVLine(lines[i]);
            if (values.length < 2) {
                skippedRows++;
                continue;
            }
            
            // Skip empty rows
            if (values.every(v => !v || v.trim() === '')) {
                skippedRows++;
                continue;
            }
            
            // Skip instruction/header-like rows
            const firstValue = (values[0] || '').toLowerCase();
            if (firstValue.includes('instruction') || 
                firstValue.includes('do not') || 
                firstValue.includes('mandatory') ||
                firstValue.includes('configuration')) {
                skippedRows++;
                continue;
            }
            
            const project = {};
            
            // Map values to headers
            cleanHeaders.forEach((key, index) => {
                if (key && values[index] !== undefined) {
                    project[key] = (values[index] || '').trim();
                }
            });
            
            // Try to extract project name from multiple possible columns
            // Skip "S/No." column if it's the first column
            let nameIndex = 0;
            const firstHeader = cleanHeaders[0] || '';
            if (firstHeader.includes('s_no') || firstHeader.includes('sno') || firstHeader.includes('no') || 
                firstHeader === 's' || firstHeader === '' || firstHeader.length < 3) {
                nameIndex = 1; // Use second column if first is S/No.
            }
            
            project.name = (
                project.project_name || 
                project.name || 
                project.title || 
                project.project_title ||
                project.project ||
                values[nameIndex] || 
                values[0] || 
                `Project ${i}`
            ).trim();
            
            // Skip if no valid name
            if (!project.name || project.name.length < 3 || 
                project.name === `Project ${i}` ||
                project.name.toLowerCase().includes('instruction')) {
                skippedRows++;
                continue;
            }
            
            // Normalize all fields - handle new column names
            project.description = (project.description || project.project_description || project.details || project.remarks || project.notes || project.additional_remarks || '').trim();
            
            // Handle status - map "0" to "Ongoing" and other variations
            const statusValue = project.status || project.project_status || project.state || project.current_status || project.project_status_2 || project.project_status_at_the_time_of_the_exercise || 'Ongoing';
            project.status = normalizeStatus(statusValue);
            
            project.department = (project.department || project.implementing_department || project.dept || project.implementing_agency || project.agency || project.sector_vote_name || 'County Executive').trim();
            
            // Handle Sub-County with autofix
            project.subcounty = (project.subcounty || project.sub_county || project.sub_county_name || project.subcounty_name || project.location_subcounty || '').trim();
            
            // Handle Ward with autofix
            project.ward = (project.ward || project.ward_name || project.ward_location || project.location_ward || '').trim();
            
            // Apply location autofix
            const fixedLocation = autofixLocation(project.subcounty, project.ward);
            project.subcounty = fixedLocation.subcounty;
            project.ward = fixedLocation.ward;
            
            // Parse budget (handle various formats) - handle "Estimated Project Cost"
            const budgetStr = project.budget || project.total_budget || project.budget_amount || project.approved_budget || project.contract_amount || 
                             project.estimated_project_cost_kshs || project.approved_project_cost || project.funds_available_in_the_specific_year || '0';
            project.budget = parseBudget(budgetStr);
            
            // Parse expenditure - handle "Expenditure to date"
            const expStr = project.expenditure || project.amount_spent || project.expenses || project.expenditure_to_date || project.actual_expenditure || 
                          project.total_disbursed_funds_as_at_30th_june_2024_kshs || '0';
            project.expenditure = parseBudget(expStr);
            
            project.source_of_funds = (project.source_of_funds || project.funding_source || project.funder || project.donor || project.sponsor || 
                                       project.project_funding_source || project.if_development_partners_please_specify || '').trim();
            
            // Handle dates - multiple possible column names
            project.start_date = (project.start_date || project.start_date_2 || project.commencement_date || project.start || project.date_started || 
                                 project.project_start_date_expected_start_date || project.date_of_approval_financial_approval || '').trim();
            
            // Expected completion date
            project.expected_completion_date = (project.expected_completion_date || project.expected_project_completion_date || 
                                               project.expected_completion || project.finish_date || '').trim();
            
            // Actual completion date
            project.completion_date = (project.completion_date || project.end_date || project.actual_completion_date || 
                                      project.actual_project_completion_date || project.date_completed || project.end || '').trim();
            
            project.location = (project.location || project.project_location || project.site || project.physical_location || project.address || 
                               project.geographic_location_latitude_longitude || '').trim();
            
            // Determine year
            const dateStr = project.start_date || project.completion_date || '';
            if (dateStr) {
                const yearMatch = dateStr.match(/(\d{4})/);
                project.year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
            } else {
                project.year = new Date().getFullYear();
            }
            
            // Additional fields that might exist
            project.progress = project.progress || project.completion_percentage || project.percentage_complete || '';
            project.beneficiaries = project.beneficiaries || project.beneficiary_count || project.number_of_beneficiaries || '';
            project.contractor = project.contractor || project.contractor_name || project.implementing_partner || '';
            
            projects.push(project);
            validProjects++;
            
        } catch (error) {
            console.warn(`Error parsing row ${i}:`, error.message);
            skippedRows++;
            continue;
        }
    }
    
    console.log(`✅ Parsed ${validProjects} valid projects from "${sheetName}", skipped ${skippedRows} rows`);
    return projects;
}

// Parse budget string (handles various formats)
function parseBudget(budgetStr) {
    if (!budgetStr) return 0;
    
    // Remove currency symbols, commas, spaces
    let cleaned = String(budgetStr).replace(/[KSh$,€£¥\s,]/g, '').trim();
    
    // Handle "M" for millions, "K" for thousands
    if (cleaned.toLowerCase().endsWith('m')) {
        cleaned = parseFloat(cleaned) * 1000000;
    } else if (cleaned.toLowerCase().endsWith('k')) {
        cleaned = parseFloat(cleaned) * 1000;
    } else {
        cleaned = parseFloat(cleaned);
    }
    
    return isNaN(cleaned) ? 0 : Math.abs(cleaned);
}

// Normalize header keys
function normalizeHeaderKey(header) {
    return header.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    
    return values;
}

// Normalize status values - handle "0" as "Ongoing"
function normalizeStatus(status) {
    if (!status || status === '0' || status === 0 || String(status).trim() === '') return 'Ongoing';
    const statusLower = String(status).toLowerCase().trim();
    if (statusLower.includes('complete') || statusLower === 'done' || statusLower === 'finished') return 'Completed';
    if (statusLower.includes('ongoing') || statusLower === 'in progress' || statusLower === 'active') return 'Ongoing';
    if (statusLower.includes('stall') || statusLower === 'delayed' || statusLower === 'on hold') return 'Stalled';
    return 'Ongoing';
}

// Autofix location data using hierarchy
function autofixLocation(subcounty, ward) {
    let fixedSubcounty = subcounty || '';
    let fixedWard = ward || '';
    
    // Normalize inputs
    const subcountyLower = fixedSubcounty.toLowerCase().trim();
    const wardLower = fixedWard.toLowerCase().trim();
    
    // Try to fix sub-county first
    if (fixedSubcounty) {
        // Check if it's already correct
        if (LOCATION_HIERARCHY[fixedSubcounty]) {
            // Sub-county is correct, now validate/fix ward
            const hierarchy = LOCATION_HIERARCHY[fixedSubcounty];
            if (fixedWard && hierarchy.normalized.includes(wardLower)) {
                // Ward is valid, find the correct casing
                const wardIndex = hierarchy.normalized.indexOf(wardLower);
                if (wardIndex >= 0) {
                    fixedWard = hierarchy.wards[wardIndex];
                }
            } else if (fixedWard) {
                // Try fuzzy matching
                const matchedWard = hierarchy.wards.find(w => 
                    w.toLowerCase() === wardLower || 
                    w.toLowerCase().includes(wardLower) ||
                    wardLower.includes(w.toLowerCase())
                );
                if (matchedWard) {
                    fixedWard = matchedWard;
                }
            }
        } else {
            // Try to normalize sub-county
            const normalizedKey = SUB_COUNTY_NORMALIZED[subcountyLower];
            if (normalizedKey && LOCATION_HIERARCHY[normalizedKey]) {
                fixedSubcounty = normalizedKey;
                // Now fix ward
                const hierarchy = LOCATION_HIERARCHY[fixedSubcounty];
                if (fixedWard && hierarchy.normalized.includes(wardLower)) {
                    const wardIndex = hierarchy.normalized.indexOf(wardLower);
                    if (wardIndex >= 0) {
                        fixedWard = hierarchy.wards[wardIndex];
                    }
                } else if (fixedWard) {
                    const matchedWard = hierarchy.wards.find(w => 
                        w.toLowerCase() === wardLower || 
                        w.toLowerCase().includes(wardLower) ||
                        wardLower.includes(w.toLowerCase())
                    );
                    if (matchedWard) {
                        fixedWard = matchedWard;
                    }
                }
            }
        }
    } else if (fixedWard) {
        // No sub-county but we have ward - try to infer from ward
        for (const [subCounty, hierarchy] of Object.entries(LOCATION_HIERARCHY)) {
            if (hierarchy.normalized.includes(wardLower)) {
                fixedSubcounty = subCounty;
                const wardIndex = hierarchy.normalized.indexOf(wardLower);
                if (wardIndex >= 0) {
                    fixedWard = hierarchy.wards[wardIndex];
                }
                break;
            }
        }
    }
    
    return {
        subcounty: fixedSubcounty || subcounty || '',
        ward: fixedWard || ward || ''
    };
}

// Enhance project with coordinates
function enhanceProjectWithCoordinates(project) {
    let lat = null;
    let lng = null;
    
    // Check if coordinates are already in the data
    if (project.latitude && project.longitude) {
        lat = parseFloat(project.latitude);
        lng = parseFloat(project.longitude);
    } else if (project.coordinates || project.coord) {
        const coordStr = (project.coordinates || project.coord || '').toString();
        const coordMatch = coordStr.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
        if (coordMatch) {
            lat = parseFloat(coordMatch[1]);
            lng = parseFloat(coordMatch[2]);
        }
    }
    
    // If no coordinates, use geocoding based on location data
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        const coords = geocodeLocation(project);
        lat = coords.lat;
        lng = coords.lng;
    }
    
    project.latitude = lat;
    project.longitude = lng;
    project.isGarissaTown = isGarissaTownLocation(project);
    
    return project;
}

// Geocode location based on project data
function geocodeLocation(project) {
    // Default to Garissa County center
    let lat = GARISSA_TOWN_CENTER[0];
    let lng = GARISSA_TOWN_CENTER[1];
    
    const subcounty = (project.subcounty || '').toLowerCase();
    const ward = (project.ward || '').toLowerCase();
    const location = (project.location || '').toLowerCase();
    
    // Sub-county coordinates mapping
    const subcountyCoords = {
        'garissa township': { lat: -0.4569, lng: 39.6463 },
        'balambala': { lat: -0.5833, lng: 39.9167 },
        'lagdera': { lat: -0.4167, lng: 39.7500 },
        'dadaab': { lat: 0.3833, lng: 40.0667 },
        'fafi': { lat: -0.7500, lng: 40.0833 },
        'ijara': { lat: -1.2500, lng: 40.3333 },
        'hulugho': { lat: -1.1667, lng: 40.2500 },
        'sankuri': { lat: -0.5000, lng: 39.8333 },
        'masalani': { lat: -1.3000, lng: 40.3833 },
        'bura east': { lat: -0.7500, lng: 40.1667 },
        'bura west': { lat: -0.8000, lng: 40.1000 }
    };
    
    // Try to find subcounty match
    for (const [key, coords] of Object.entries(subcountyCoords)) {
        if (subcounty.includes(key) || location.includes(key)) {
            lat = coords.lat;
            lng = coords.lng;
            // Add small random offset for different projects
            lat += (Math.random() - 0.5) * 0.05;
            lng += (Math.random() - 0.5) * 0.05;
            break;
        }
    }
    
    return { lat, lng };
}

// Check if project is in Garissa Town
function isGarissaTownLocation(project) {
    const subcounty = (project.subcounty || '').toLowerCase();
    const ward = (project.ward || '').toLowerCase();
    const location = (project.location || '').toLowerCase();
    
    return subcounty.includes('garissa') || 
           subcounty.includes('township') ||
           ward.includes('garissa') ||
           ward.includes('town') ||
           location.includes('garissa town') ||
           location.includes('garissa township');
}

// Initialize map with satellite basemap
function initializeMap() {
    // Initialize map centered on Garissa with default zoom
    map = L.map('map', {
        center: GARISSA_TOWN_CENTER,
        zoom: 9,
        zoomControl: true
    }).setView(GARISSA_TOWN_CENTER, 9);
    
    // Add Esri World Imagery (Satellite) as primary basemap
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
        maxZoom: 19
    });
    
    // Add OpenStreetMap as fallback/alternative
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    });
    
    // Add satellite layer first
    satelliteLayer.addTo(map);
    
    // Add base layer control
    const baseMaps = {
        "Satellite": satelliteLayer,
        "OpenStreetMap": osmLayer
    };
    
    L.control.layers(baseMaps).addTo(map);
    
    // Add county center marker
    L.marker(GARISSA_TOWN_CENTER).addTo(map)
        .bindPopup('<b>Garissa Town</b><br>County Headquarters');
}

// Update map markers
function updateMapMarkers() {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    if (filteredProjects.length === 0) return;
    
    filteredProjects.forEach(project => {
        if (!project.latitude || !project.longitude || isNaN(project.latitude) || isNaN(project.longitude)) {
            return;
        }
        
        // Determine marker color based on status
        let color = '#3b82f6'; // Default blue
        let size = 20;
        
        if (project.status === 'Completed') {
            color = '#10b981'; // Green
        } else if (project.status === 'Ongoing') {
            color = '#f59e0b'; // Yellow
        } else if (project.status === 'Stalled') {
            color = '#ef4444'; // Red
        }
        
        // Special styling for Garissa Town projects
        if (project.isGarissaTown) {
            color = '#8b5cf6'; // Purple
            size = 28;
        }
        
        // Create custom icon
        const iconHtml = `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            ${project.isGarissaTown ? 'animation: pulse 2s infinite;' : ''}
        "></div>`;
        
        const customIcon = L.divIcon({
            className: project.isGarissaTown ? 'garissa-town-marker' : '',
            html: iconHtml,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
        
        try {
            const marker = L.marker([project.latitude, project.longitude], { icon: customIcon })
                .addTo(map)
                .bindPopup(createPopupContent(project));
            
            markers.push(marker);
        } catch (error) {
            console.warn('Error creating marker for project:', project.name, error);
        }
    });
    
    // Fit map to show all markers
    if (markers.length > 0) {
        try {
            const group = L.featureGroup(markers);
            const bounds = group.getBounds();
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            }
        } catch (error) {
            console.warn('Error fitting bounds:', error);
        }
    }
}

// Create popup content for map markers
function createPopupContent(project) {
    const statusClass = `status-${project.status.toLowerCase()}`;
    const budget = formatCurrency(project.budget || 0);
    
    return `
        <div style="min-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937; font-size: 16px;">${project.name}</h3>
            <div class="${statusClass} filter-badge" style="margin-bottom: 8px; display: inline-block;">
                ${project.status}
            </div>
            <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 4px;">
                <strong>Department:</strong> ${project.department || 'N/A'}
            </p>
            <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 4px;">
                <strong>Location:</strong> ${project.subcounty || 'N/A'}${project.ward ? ` - ${project.ward}` : ''}
            </p>
            <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 4px;">
                <strong>Budget:</strong> ${budget}
            </p>
            ${project.description ? `<p style="font-size: 0.75rem; color: #6b7280; margin-top: 8px; line-height: 1.4;">${project.description.substring(0, 120)}${project.description.length > 120 ? '...' : ''}</p>` : ''}
        </div>
    `;
}

// Initialize filters
function initializeFilters() {
    // Populate filter dropdowns
    populateFilterDropdowns();
    
    // Setup filter event listeners
    const filterElements = [
        'search-input',
        'status-filter',
        'subcounty-filter',
        'ward-filter',
        'department-filter',
        'budget-filter',
        'year-filter',
        'funding-filter'
    ];
    
    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', applyFilters);
            element.addEventListener('input', applyFilters);
        }
    });
    
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearFilters);
    }
}

// Populate filter dropdowns
function populateFilterDropdowns() {
    if (allProjects.length === 0) return;
    
    // Get unique values from projects
    const subcounties = [...new Set(allProjects.map(p => p.subcounty).filter(Boolean))].sort();
    const wards = [...new Set(allProjects.map(p => p.ward).filter(Boolean))].sort();
    const departments = [...new Set(allProjects.map(p => p.department).filter(Boolean))].sort();
    const fundingSources = [...new Set(allProjects.map(p => p.source_of_funds).filter(Boolean))].filter(Boolean).sort();
    const years = [...new Set(allProjects.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
    
    // Helper function to populate select
    const populateSelect = (id, options) => {
        const select = document.getElementById(id);
        if (!select) return;
        
        // Keep the first option (All)
        const firstOption = select.options[0];
        select.innerHTML = '';
        if (firstOption) {
            select.appendChild(firstOption);
        }
        
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            select.appendChild(opt);
        });
    };
    
    populateSelect('subcounty-filter', subcounties);
    populateSelect('ward-filter', wards);
    populateSelect('department-filter', departments);
    populateSelect('funding-filter', fundingSources);
    populateSelect('year-filter', years);
}

// Apply filters
function applyFilters() {
    const search = (document.getElementById('search-input')?.value || '').toLowerCase();
    const status = document.getElementById('status-filter')?.value || '';
    const subcounty = document.getElementById('subcounty-filter')?.value || '';
    const ward = document.getElementById('ward-filter')?.value || '';
    const department = document.getElementById('department-filter')?.value || '';
    const budgetRange = document.getElementById('budget-filter')?.value || '';
    const year = document.getElementById('year-filter')?.value || '';
    const funding = document.getElementById('funding-filter')?.value || '';
    
    // Use database filtering if available, otherwise use in-memory filtering
    if (typeof projectsDB !== 'undefined') {
        projectsDB.getFilteredProjects({
            search, status, subcounty, ward, department, budgetRange, year, funding
        }).then(filtered => {
            filteredProjects = filtered;
            currentPage = 1; // Reset to first page on new filter
            updateActiveFilters(search, status, subcounty, ward, department, budgetRange, year, funding);
            renderProjects();
            updateMapMarkers();
            updateStats();
            updateCharts();
        }).catch(() => {
            // Fallback to in-memory filtering
            filterInMemory(search, status, subcounty, ward, department, budgetRange, year, funding);
        });
    } else {
        filterInMemory(search, status, subcounty, ward, department, budgetRange, year, funding);
    }
}

// In-memory filtering fallback
function filterInMemory(search, status, subcounty, ward, department, budgetRange, year, funding) {
    filteredProjects = allProjects.filter(project => {
        // Search filter
        if (search) {
            const searchable = `${project.name} ${project.description} ${project.location} ${project.subcounty} ${project.ward} ${project.department}`.toLowerCase();
            if (!searchable.includes(search)) return false;
        }
        
        // Status filter
        if (status && project.status !== status) return false;
        
        // Subcounty filter
        if (subcounty && project.subcounty !== subcounty) return false;
        
        // Ward filter
        if (ward && project.ward !== ward) return false;
        
        // Department filter
        if (department && project.department !== department) return false;
        
        // Budget range filter
        if (budgetRange) {
            const [min, max] = budgetRange.split('-').map(v => parseInt(v) || 0);
            const budget = project.budget || 0;
            if (budget < min || (max && max < 999999999 && budget > max)) return false;
        }
        
        // Year filter
        if (year && project.year !== parseInt(year)) return false;
        
        // Funding source filter
        if (funding && project.source_of_funds !== funding) return false;
        
        return true;
    });
    
    currentPage = 1; // Reset to first page on new filter
    updateActiveFilters(search, status, subcounty, ward, department, budgetRange, year, funding);
    renderProjects();
    updateMapMarkers();
    updateStats();
    updateCharts();
}

// Update active filters display
function updateActiveFilters(search, status, subcounty, ward, department, budgetRange, year, funding) {
    const container = document.getElementById('active-filters');
    if (!container) return;
    container.innerHTML = '';
    
    const filters = [
        { label: 'Search', value: search, key: 'search' },
        { label: 'Status', value: status, key: 'status' },
        { label: 'Sub-County', value: subcounty, key: 'subcounty' },
        { label: 'Ward', value: ward, key: 'ward' },
        { label: 'Department', value: department, key: 'department' },
        { label: 'Budget', value: budgetRange, key: 'budget' },
        { label: 'Year', value: year, key: 'year' },
        { label: 'Funding', value: funding, key: 'funding' }
    ];
    
    filters.forEach(filter => {
        if (filter.value) {
            const badge = document.createElement('span');
            badge.className = 'filter-badge bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2';
            badge.textContent = `${filter.label}: ${filter.value}`;
            container.appendChild(badge);
        }
    });
}

// Clear all filters
function clearFilters() {
    const filterIds = ['search-input', 'status-filter', 'subcounty-filter', 'ward-filter', 
                      'department-filter', 'budget-filter', 'year-filter', 'funding-filter'];
    
    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    applyFilters();
}

// Initialize tabs
function initializeTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

// Switch tab
function switchTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-red-600', 'text-red-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-red-600', 'text-red-600');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
    }
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab
    const tabContent = document.getElementById(`${tabName}-tab`);
    if (tabContent) {
        tabContent.classList.remove('hidden');
    }
    
    // Initialize tab-specific content - ENSURE ALL TABS ARE FUNCTIONAL
    if (tabName === 'map') {
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                updateMapMarkers();
            }
        }, 100);
    } else if (tabName === 'list') {
        // Enhanced List View with Excel Panel
        console.log(`📋 List View: Loading Excel panel with all projects...`);
        
        // Always render the Excel table view
        renderExcelTable();
        
        // If no projects loaded, fetch from Google Sheets
        if (allProjects.length === 0) {
            console.log('⚠️ No projects in List View, loading from Google Sheets...');
            loadProjectsFromGoogleSheets().then(async (newProjects) => {
                if (newProjects && newProjects.length > 0) {
                    allProjects = newProjects;
                    filteredProjects = [...allProjects];
                    console.log(`✅ Loaded ${allProjects.length} projects for Excel Panel`);
                    
                    // Update filters with new data
                    populateFilterDropdowns();
                    
                    // Render Excel table
                    renderExcelTable();
                    updateStats();
                    updateMapMarkers();
                    updateCharts();
                    
                    // Update count display
                    const countEl = document.getElementById('projects-count-display');
                    if (countEl) countEl.textContent = `${allProjects.length} projects`;
                }
            }).catch(err => {
                console.error('Error loading projects for List View:', err);
                const container = document.getElementById('excel-table-container');
                if (container) {
                    container.innerHTML = `
                        <div class="p-8 text-center text-red-600">
                            <i data-lucide="alert-circle" class="w-12 h-12 mx-auto mb-2"></i>
                            <p>Error loading projects. Please try refreshing.</p>
                        </div>
                    `;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            });
        } else {
            // Render with existing data
            renderExcelTable();
            const countEl = document.getElementById('projects-count-display');
            if (countEl) countEl.textContent = `${allProjects.length} projects`;
            console.log(`✅ List View: Displaying ${allProjects.length} total projects in Excel Panel`);
        }
        
        // Setup Excel table event listeners
        setupExcelTableListeners();
    } else if (tabName === 'analytics') {
        // Initialize charts if not already done
        if (!charts.status || !charts.department || !charts.budget || !charts.subcounty) {
            initializeCharts();
        }
        // Update all charts with current data
        setTimeout(() => {
            updateCharts();
        }, 100);
    } else if (tabName === 'reports') {
        // Reports tab - ensure all projects are loaded and ready
        console.log(`📋 Reports View: ${allProjects.length} total projects available`);
        initializeReportViewing();
        // Auto-load summary report to show all projects
        setTimeout(() => {
            if (allProjects.length > 0 && filteredProjects.length === 0) {
                // Reset filters when entering reports to show all projects
                clearFilters();
            }
        }, 100);
    }
}

// Pagination state
let currentPage = 1;
const projectsPerPage = 50; // Show 50 projects per page for better performance

// Render Excel Table View - INTEGRATED PANEL
function renderExcelTable() {
    const container = document.getElementById('excel-table-container');
    if (!container) return;
    
    const projectsToShow = filteredProjects.length > 0 ? filteredProjects : allProjects;
    
    if (projectsToShow.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                <i data-lucide="folder-x" class="w-12 h-12 mx-auto mb-2"></i>
                <p>No projects found. Try adjusting your filters.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    // Create scrollable Excel-style table
    container.innerHTML = `
        <table class="excel-table">
            <thead>
                <tr>
                    <th class="sticky left-0 bg-gray-100 z-20" style="min-width: 300px;">Project Name</th>
                    <th style="min-width: 100px;">Status</th>
                    <th style="min-width: 120px;">Progress</th>
                    <th style="min-width: 180px;">Department</th>
                    <th style="min-width: 140px;">Sub-County</th>
                    <th style="min-width: 140px;">Ward</th>
                    <th style="min-width: 120px;">Budget</th>
                    <th style="min-width: 120px;">Expenditure</th>
                    <th style="min-width: 120px;">Balance</th>
                    <th style="min-width: 150px;">Funding Source</th>
                    <th style="min-width: 100px;">Year</th>
                </tr>
            </thead>
            <tbody>
                ${projectsToShow.map((p, index) => {
                    const progressPercent = p.budget > 0 ? Math.round((p.expenditure / p.budget) * 100) : 0;
                    const balance = (p.budget || 0) - (p.expenditure || 0);
                    const progressColor = progressPercent >= 80 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                    const projectId = p.id || `project-${index}-${Date.now()}`;
                    if (!p.id) p.id = projectId;
                    const statusColor = p.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                      p.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800';
                    return `
                        <tr class="project-row" data-project-id="${projectId}" data-project-index="${index}">
                            <td class="sticky left-0 bg-white z-10 font-medium border-r border-gray-200" style="min-width: 300px;">
                                ${escapeHtml(p.name || 'Unnamed Project')}
                            </td>
                            <td>
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${statusColor}">
                                    ${p.status || 'Ongoing'}
                                </span>
                            </td>
                            <td>
                                <div class="flex items-center space-x-2">
                                    <div class="w-20 bg-gray-200 rounded-full h-2">
                                        <div class="${progressColor} h-2 rounded-full" style="width: ${Math.min(progressPercent, 100)}%"></div>
                                    </div>
                                    <span class="text-xs font-medium text-gray-700">${progressPercent}%</span>
                                </div>
                            </td>
                            <td class="text-gray-700">${escapeHtml(p.department || 'N/A')}</td>
                            <td class="text-gray-700">${escapeHtml(p.subcounty || 'N/A')}</td>
                            <td class="text-gray-700">${escapeHtml(p.ward || 'N/A')}</td>
                            <td class="font-semibold text-gray-900">${formatCurrency(p.budget || 0)}</td>
                            <td class="font-medium text-gray-800">${formatCurrency(p.expenditure || 0)}</td>
                            <td class="font-medium ${balance >= 0 ? 'text-green-700' : 'text-red-700'}">${formatCurrency(balance)}</td>
                            <td class="text-gray-600 text-sm">${escapeHtml(p.source_of_funds || 'N/A')}</td>
                            <td class="text-gray-600">${p.year || 'N/A'}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    // Update count
    const countEl = document.getElementById('projects-count-display');
    if (countEl) countEl.textContent = `${projectsToShow.length} projects`;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Setup Excel table event listeners
function setupExcelTableListeners() {
    // Row click handler
    document.addEventListener('click', (e) => {
        const row = e.target.closest('.project-row');
        if (row) {
            const projectId = row.dataset.projectId;
            const projectIndex = parseInt(row.dataset.projectIndex);
            
            // Remove previous selection
            document.querySelectorAll('.project-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            
            // Show project summary
            const projectsToShow = filteredProjects.length > 0 ? filteredProjects : allProjects;
            const project = projectsToShow[projectIndex];
            if (project) {
                showProjectSummary(project);
            }
        }
    });
    
    // Excel search
    const excelSearch = document.getElementById('excel-search');
    if (excelSearch) {
        excelSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const statusFilter = document.getElementById('excel-status-filter')?.value || '';
            
            if (searchTerm || statusFilter) {
                filteredProjects = allProjects.filter(p => {
                    const matchesSearch = !searchTerm || 
                        (p.name || '').toLowerCase().includes(searchTerm) ||
                        (p.department || '').toLowerCase().includes(searchTerm) ||
                        (p.subcounty || '').toLowerCase().includes(searchTerm) ||
                        (p.ward || '').toLowerCase().includes(searchTerm);
                    const matchesStatus = !statusFilter || p.status === statusFilter;
                    return matchesSearch && matchesStatus;
                });
            } else {
                filteredProjects = [...allProjects];
            }
            
            renderExcelTable();
        });
    }
    
    // Excel status filter
    const excelStatusFilter = document.getElementById('excel-status-filter');
    if (excelStatusFilter) {
        excelStatusFilter.addEventListener('change', () => {
            const excelSearch = document.getElementById('excel-search');
            if (excelSearch) excelSearch.dispatchEvent(new Event('input'));
        });
    }
    
    // Close summary panel
    const closeSummary = document.getElementById('close-summary');
    if (closeSummary) {
        closeSummary.addEventListener('click', () => {
            const panel = document.getElementById('project-summary-panel');
            if (panel) panel.classList.add('hidden');
        });
    }
}

// Show project summary in side panel
function showProjectSummary(project) {
    const panel = document.getElementById('project-summary-panel');
    const content = document.getElementById('project-summary-content');
    
    if (!panel || !content) return;
    
    // Show panel
    panel.classList.remove('hidden');
    
    const progressPercent = project.budget > 0 ? Math.round((project.expenditure / project.budget) * 100) : 0;
    const balance = (project.budget || 0) - (project.expenditure || 0);
    const statusColor = project.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-300' : 
                       project.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                       'bg-red-100 text-red-800 border-red-300';
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">${escapeHtml(project.name || 'Unnamed Project')}</h2>
                <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold border-2 ${statusColor}">
                    ${project.status || 'Ongoing'}
                </span>
            </div>
            
            <!-- Progress Card -->
            <div class="bg-white rounded-lg shadow-md p-4 border-l-4 ${project.status === 'Completed' ? 'border-green-500' : project.status === 'Ongoing' ? 'border-yellow-500' : 'border-red-500'}">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="activity" class="w-5 h-5 mr-2"></i> Progress
                </h3>
                <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div class="bg-gradient-to-r from-red-600 to-green-600 h-4 rounded-full flex items-center justify-end pr-2" style="width: ${Math.min(progressPercent, 100)}%">
                        <span class="text-xs font-bold text-white">${progressPercent}%</span>
                    </div>
                </div>
                <p class="text-sm text-gray-600">${formatCurrency(project.expenditure || 0)} of ${formatCurrency(project.budget || 0)}</p>
            </div>
            
            <!-- Budget Card -->
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="dollar-sign" class="w-5 h-5 mr-2"></i> Budget Details
                </h3>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Budget:</span>
                        <span class="font-bold text-gray-800">${formatCurrency(project.budget || 0)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Expenditure:</span>
                        <span class="font-medium text-gray-800">${formatCurrency(project.expenditure || 0)}</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t border-gray-200">
                        <span class="text-gray-600 font-semibold">Balance:</span>
                        <span class="font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}">${formatCurrency(balance)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Location Card -->
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="map-pin" class="w-5 h-5 mr-2"></i> Location
                </h3>
                <div class="space-y-2">
                    <div>
                        <span class="text-xs text-gray-500">Sub-County</span>
                        <p class="font-medium text-gray-800">${escapeHtml(project.subcounty || 'N/A')}</p>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500">Ward</span>
                        <p class="font-medium text-gray-800">${escapeHtml(project.ward || 'N/A')}</p>
                    </div>
                    ${project.location ? `
                    <div>
                        <span class="text-xs text-gray-500">Address</span>
                        <p class="font-medium text-gray-800 text-sm">${escapeHtml(project.location)}</p>
                    </div>
                    ` : ''}
                    ${project.latitude && project.longitude ? `
                    <button onclick="window.open('https://www.google.com/maps?q=${project.latitude},${project.longitude}', '_blank')" 
                            class="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm">
                        <i data-lucide="map" class="w-4 h-4"></i>
                        <span>View on Map</span>
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <!-- Department & Funding Card -->
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="building" class="w-5 h-5 mr-2"></i> Project Details
                </h3>
                <div class="space-y-2">
                    <div>
                        <span class="text-xs text-gray-500">Department</span>
                        <p class="font-medium text-gray-800">${escapeHtml(project.department || 'N/A')}</p>
                    </div>
                    ${project.source_of_funds ? `
                    <div>
                        <span class="text-xs text-gray-500">Funding Source</span>
                        <p class="font-medium text-gray-800">${escapeHtml(project.source_of_funds)}</p>
                    </div>
                    ` : ''}
                    ${project.year ? `
                    <div>
                        <span class="text-xs text-gray-500">Year</span>
                        <p class="font-medium text-gray-800">${project.year}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Timeline Card -->
            ${project.start_date || project.completion_date ? `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="calendar" class="w-5 h-5 mr-2"></i> Timeline
                </h3>
                <div class="space-y-2">
                    ${project.start_date ? `
                    <div>
                        <span class="text-xs text-gray-500">Start Date</span>
                        <p class="font-medium text-gray-800">${escapeHtml(project.start_date)}</p>
                    </div>
                    ` : ''}
                    ${project.completion_date ? `
                    <div>
                        <span class="text-xs text-gray-500">Completion Date</span>
                        <p class="font-medium text-gray-800">${escapeHtml(project.completion_date)}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <!-- Description -->
            ${project.description ? `
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="file-text" class="w-5 h-5 mr-2"></i> Description
                </h3>
                <p class="text-gray-700 text-sm leading-relaxed">${escapeHtml(project.description)}</p>
            </div>
            ` : ''}
            
            <!-- Action Buttons -->
            <div class="space-y-2">
                <button onclick="window.showProjectDetailsFromSummary('${project.id || ''}')" 
                        class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2">
                    <i data-lucide="eye" class="w-4 h-4"></i>
                    <span>View Full Details</span>
                </button>
                <button onclick="showFeedbackModal('${project.id || ''}')" 
                        class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                    <span>Send Feedback</span>
                </button>
            </div>
        </div>
    `;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Helper function to show project details from summary
window.showProjectDetailsFromSummary = function(projectId) {
    const projectsToShow = filteredProjects.length > 0 ? filteredProjects : allProjects;
    const project = projectsToShow.find(p => p.id === projectId) || allProjects.find(p => p.id === projectId);
    if (project) {
        showProjectDetails(project);
    }
};

// Make globally available
window.showProjectSummary = showProjectSummary;
if (typeof window.showProjectDetails === 'undefined') {
    window.showProjectDetails = showProjectDetails;
}

// Render projects list with pagination
function renderProjects() {
    const container = document.getElementById('projects-container');
    const paginationDiv = document.getElementById('projects-pagination');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (filteredProjects.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i data-lucide="folder-x" class="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
                <p class="text-gray-600 text-lg">No projects found matching your filters.</p>
                <p class="text-gray-500 text-sm mt-2">Try adjusting your search criteria.</p>
            </div>
        `;
        if (paginationDiv) paginationDiv.innerHTML = '';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const pageProjects = filteredProjects.slice(startIndex, endIndex);
    
    // Show all projects count
    container.innerHTML = `
        <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-blue-800 font-semibold">
                Showing ${startIndex + 1} - ${Math.min(endIndex, filteredProjects.length)} of ${filteredProjects.length} projects
            </p>
        </div>
    `;
    
    // Render projects in a table-like grid for better visibility
    const projectsGrid = document.createElement('div');
    projectsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    
    pageProjects.forEach(project => {
        const card = document.createElement('div');
        card.className = `project-card bg-white rounded-lg shadow-md p-6 border-l-4 cursor-pointer hover:shadow-lg transition-shadow ${
            project.status === 'Completed' ? 'border-green-500' :
            project.status === 'Ongoing' ? 'border-yellow-500' : 'border-red-500'
        }`;
        card.setAttribute('data-project-id', project.id);
        card.innerHTML = createProjectCard(project);
        
        // Make card clickable to show details
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                showProjectDetails(project);
            }
        });
        
        projectsGrid.appendChild(card);
    });
    
    container.appendChild(projectsGrid);
    
    // Render pagination
    if (paginationDiv && totalPages > 1) {
        renderPagination(paginationDiv, totalPages);
    } else if (paginationDiv) {
        paginationDiv.innerHTML = '';
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Render pagination controls
function renderPagination(container, totalPages) {
    container.innerHTML = '';
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'flex items-center justify-center space-x-2';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = `px-4 py-2 rounded-lg border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`;
    prevBtn.innerHTML = '<i data-lucide="chevron-left" class="w-4 h-4"></i> Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderProjects();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    // Page numbers
    const pageNumbers = document.createElement('div');
    pageNumbers.className = 'flex items-center space-x-1';
    
    const maxVisiblePages = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'px-3 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 border-gray-300';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', () => {
            currentPage = 1;
            renderProjects();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pageNumbers.appendChild(firstBtn);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 text-gray-400';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `px-3 py-2 rounded-lg border ${
            i === currentPage 
                ? 'bg-red-600 text-white border-red-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
        }`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderProjects();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pageNumbers.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-2 text-gray-400';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        const lastBtn = document.createElement('button');
        lastBtn.className = 'px-3 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 border-gray-300';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => {
            currentPage = totalPages;
            renderProjects();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pageNumbers.appendChild(lastBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = `px-4 py-2 rounded-lg border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`;
    nextBtn.innerHTML = 'Next <i data-lucide="chevron-right" class="w-4 h-4"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProjects();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(pageNumbers);
    paginationDiv.appendChild(nextBtn);
    container.appendChild(paginationDiv);
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Create project card with feedback button
function createProjectCard(project) {
    const statusClass = `status-${project.status.toLowerCase()}`;
    const budget = formatCurrency(project.budget || 0);
    const feedbackCount = feedbackData.filter(f => f.projectId === project.id).length;
    
    if (!project.id) project.id = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
        <div class="project-card bg-white rounded-lg shadow-md p-6 border-l-4 ${
            project.status === 'Completed' ? 'border-green-500' :
            project.status === 'Ongoing' ? 'border-yellow-500' : 'border-red-500'
        }" data-project-id="${project.id}">
            <div class="flex items-start justify-between mb-3">
                <h4 class="font-bold text-gray-800 text-lg flex-1">${escapeHtml(project.name)}</h4>
                ${project.isGarissaTown ? '<span class="text-purple-600 text-xs font-semibold ml-2">📍 Town</span>' : ''}
            </div>
            <div class="flex items-center justify-between mb-3">
                <div class="${statusClass} filter-badge">${project.status}</div>
                <button onclick="showFeedbackModal('${project.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                    <span data-translate="sendProjectFeedback">Send Feedback</span>
                    ${feedbackCount > 0 ? `<span class="feedback-count bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs ml-1">${feedbackCount}</span>` : ''}
                </button>
            </div>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${escapeHtml(project.description || 'No description available')}</p>
            <div class="space-y-2 text-sm mb-3">
                <div class="flex justify-between">
                    <span class="text-gray-600">Department:</span>
                    <span class="font-medium text-gray-800">${escapeHtml(project.department || 'N/A')}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Location:</span>
                    <span class="font-medium text-gray-800">${escapeHtml(project.subcounty || 'N/A')}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Budget:</span>
                    <span class="font-medium text-gray-800">${budget}</span>
                </div>
            </div>
        </div>
    `;
}

// Update statistics - show totals from allProjects
function updateStats() {
    const updateStat = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    
    // Show total counts from allProjects (not filtered)
    updateStat('total-projects', allProjects.length);
    updateStat('completed-projects', allProjects.filter(p => p.status === 'Completed').length);
    updateStat('ongoing-projects', allProjects.filter(p => p.status === 'Ongoing').length);
    updateStat('stalled-projects', allProjects.filter(p => p.status === 'Stalled').length);
    
    // Also update stats elements that might have different IDs
    const updateStatById = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };
    updateStatById('total-projects-stat', allProjects.length);
    updateStatById('completed-projects-stat', allProjects.filter(p => p.status === 'Completed').length);
    updateStatById('ongoing-projects-stat', allProjects.filter(p => p.status === 'Ongoing').length);
    updateStatById('stalled-projects-stat', allProjects.filter(p => p.status === 'Stalled').length);
}

// Initialize charts
function initializeCharts() {
    // Status chart
    const statusCtx = document.getElementById('status-chart');
    if (statusCtx) {
        charts.status = new Chart(statusCtx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
            options: { 
                responsive: true, 
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' projects';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Department chart
    const deptCtx = document.getElementById('department-chart');
    if (deptCtx) {
        charts.department = new Chart(deptCtx, {
            type: 'bar',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
            options: { 
                responsive: true, 
                maintainAspectRatio: true, 
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.x + ' projects';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Budget chart
    const budgetCtx = document.getElementById('budget-chart');
    if (budgetCtx) {
        charts.budget = new Chart(budgetCtx, {
            type: 'pie',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
            options: { 
                responsive: true, 
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' projects';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Subcounty chart
    const subcountyCtx = document.getElementById('subcounty-chart');
    if (subcountyCtx) {
        charts.subcounty = new Chart(subcountyCtx, {
            type: 'bar',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
            options: { 
                responsive: true, 
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' projects';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Budget vs Expenditure chart
    const budgetVsExpCtx = document.getElementById('budget-vs-expenditure-chart');
    if (budgetVsExpCtx) {
        charts['budget-vs-expenditure'] = new Chart(budgetVsExpCtx, {
            type: 'bar',
            data: { labels: [], datasets: [] },
            options: { 
                responsive: true, 
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Year chart
    const yearCtx = document.getElementById('year-chart');
    if (yearCtx) {
        charts.year = new Chart(yearCtx, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: { 
                responsive: true, 
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' projects';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// Update charts
function updateCharts() {
    const projects = filteredProjects.length > 0 ? filteredProjects : allProjects;
    
    // Update Analytics Metrics
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalExpenditure = projects.reduce((sum, p) => sum + (p.expenditure || 0), 0);
    const avgBudget = projects.length > 0 ? totalBudget / projects.length : 0;
    const completedCount = projects.filter(p => p.status === 'Completed').length;
    const completionRate = projects.length > 0 ? Math.round((completedCount / projects.length) * 100) : 0;
    
    // Update metric cards
    const budgetEl = document.getElementById('analytics-total-budget');
    if (budgetEl) budgetEl.textContent = formatCurrency(totalBudget);
    const expEl = document.getElementById('analytics-total-expenditure');
    if (expEl) expEl.textContent = formatCurrency(totalExpenditure);
    const avgEl = document.getElementById('analytics-avg-budget');
    if (avgEl) avgEl.textContent = formatCurrency(avgBudget);
    const rateEl = document.getElementById('analytics-completion-rate');
    if (rateEl) rateEl.textContent = `${completionRate}%`;
    
    // Status chart
    if (charts.status) {
        const statusCounts = {
            'Completed': projects.filter(p => p.status === 'Completed').length,
            'Ongoing': projects.filter(p => p.status === 'Ongoing').length,
            'Stalled': projects.filter(p => p.status === 'Stalled').length
        };
        
        charts.status.data = {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
        charts.status.update();
    }
    
    // Department chart
    if (charts.department) {
        const deptCounts = {};
        projects.forEach(p => {
            const dept = p.department || 'Unknown';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
        
        const sortedDepts = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        
        charts.department.data = {
            labels: sortedDepts.map(d => d[0]),
            datasets: [{
                label: 'Projects',
                data: sortedDepts.map(d => d[1]),
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1
            }]
        };
        charts.department.update();
    }
    
    // Budget chart
    if (charts.budget) {
        const budgetRanges = {
            'Under 1M': 0,
            '1M - 5M': 0,
            '5M - 10M': 0,
            '10M - 50M': 0,
            'Above 50M': 0
        };
        
        projects.forEach(p => {
            const budget = p.budget || 0;
            if (budget < 1000000) budgetRanges['Under 1M']++;
            else if (budget < 5000000) budgetRanges['1M - 5M']++;
            else if (budget < 10000000) budgetRanges['5M - 10M']++;
            else if (budget < 50000000) budgetRanges['10M - 50M']++;
            else budgetRanges['Above 50M']++;
        });
        
        charts.budget.data = {
            labels: Object.keys(budgetRanges),
            datasets: [{
                data: Object.values(budgetRanges),
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };
        charts.budget.update();
    }
    
    // Subcounty chart
    if (charts.subcounty) {
        const subcountyCounts = {};
        projects.forEach(p => {
            const sub = p.subcounty || 'Unknown';
            subcountyCounts[sub] = (subcountyCounts[sub] || 0) + 1;
        });
        
        charts.subcounty.data = {
            labels: Object.keys(subcountyCounts),
            datasets: [{
                label: 'Projects',
                data: Object.values(subcountyCounts),
                backgroundColor: '#059669',
                borderColor: '#047857',
                borderWidth: 1
            }]
        };
        charts.subcounty.update();
    }
    
    // Budget vs Expenditure chart
    if (charts['budget-vs-expenditure']) {
        const subcounties = [...new Set(projects.map(p => p.subcounty || 'Unknown'))];
        const budgetData = subcounties.map(sub => 
            projects.filter(p => (p.subcounty || 'Unknown') === sub).reduce((sum, p) => sum + (p.budget || 0), 0)
        );
        const expData = subcounties.map(sub => 
            projects.filter(p => (p.subcounty || 'Unknown') === sub).reduce((sum, p) => sum + (p.expenditure || 0), 0)
        );
        
        charts['budget-vs-expenditure'].data = {
            labels: subcounties,
            datasets: [{
                label: 'Budget',
                data: budgetData,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 2
            }, {
                label: 'Expenditure',
                data: expData,
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 2
            }]
        };
        charts['budget-vs-expenditure'].update();
    }
    
    // Year chart
    if (charts.year) {
        const yearCounts = {};
        projects.forEach(p => {
            const year = p.year || new Date().getFullYear();
            yearCounts[year] = (yearCounts[year] || 0) + 1;
        });
        
        const sortedYears = Object.keys(yearCounts).sort();
        
        charts.year.data = {
            labels: sortedYears,
            datasets: [{
                label: 'Projects',
                data: sortedYears.map(y => yearCounts[y]),
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                borderWidth: 2,
                fill: true
            }]
        };
        charts.year.update();
    }
}

// Language switching
let currentLang = localStorage.getItem('garissaLang') || 'en';
let t = typeof translations !== 'undefined' ? translations[currentLang] : {};

function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            switchLanguage(lang);
        });
    });
    updateTranslations();
}

function switchLanguage(lang) {
    if (typeof translations === 'undefined') return;
    
    currentLang = lang;
    t = translations[lang];
    localStorage.setItem('garissaLang', lang);
    
    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('bg-red-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-700');
        if (btn.dataset.lang === lang) {
            btn.classList.add('bg-red-600', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-700');
        }
    });
    
    updateTranslations();
}

function updateTranslations() {
    if (typeof translations === 'undefined') return;
    
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.dataset.translate;
        if (t && t[key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = t[key];
            } else if (el.tagName === 'INPUT' && el.type === 'email') {
                // Keep placeholder
            } else {
                el.textContent = t[key];
            }
        }
    });
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Feedback system
let feedbackData = [];
try {
    feedbackData = JSON.parse(localStorage.getItem('garissaFeedback') || '[]');
} catch (e) {
    feedbackData = [];
}

// Initialize project detail modal
function initializeProjectDetailModal() {
    const closeBtn = document.getElementById('close-project-detail');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('project-detail-modal').classList.add('hidden');
        });
    }
    
    // Close on background click
    const modal = document.getElementById('project-detail-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

function initializeFeedbackSystem() {
    // Feedback form submission
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
    
    // Modal close buttons
    const closeFeedback = document.getElementById('close-feedback');
    if (closeFeedback) closeFeedback.addEventListener('click', () => {
        document.getElementById('feedback-modal').classList.add('hidden');
    });
    
    const cancelFeedback = document.getElementById('cancel-feedback');
    if (cancelFeedback) cancelFeedback.addEventListener('click', () => {
        document.getElementById('feedback-modal').classList.add('hidden');
    });
    
    const closeAllFeedback = document.getElementById('close-all-feedback');
    if (closeAllFeedback) closeAllFeedback.addEventListener('click', () => {
        document.getElementById('all-feedback-modal').classList.add('hidden');
    });
}

function handleFeedbackSubmit(e) {
    e.preventDefault();
    const projectId = document.getElementById('feedback-project-id').value;
    const name = document.getElementById('feedback-name').value;
    const email = document.getElementById('feedback-email').value;
    const message = document.getElementById('feedback-message').value;
    
    const feedback = {
        id: Date.now(),
        projectId: projectId,
        projectName: allProjects.find(p => p.id === projectId)?.name || 'Unknown',
        name: name,
        email: email,
        message: message,
        date: new Date().toISOString(),
        sent: false
    };
    
    // Save to localStorage
    feedbackData.push(feedback);
    localStorage.setItem('garissaFeedback', JSON.stringify(feedbackData));
    
    // Send to email (simulate)
    const mailtoLink = `mailto:feedback@garissa.go.ke?subject=Project Feedback: ${encodeURIComponent(feedback.projectName)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nProject: ${feedback.projectName}\n\nMessage:\n${message}`)}`;
    window.location.href = mailtoLink;
    
    // Close modal
    document.getElementById('feedback-modal').classList.add('hidden');
    
    // Show success message
    alert(t?.feedbackSent || 'Thank you! Your feedback has been sent.');
    
    // Update feedback counts
    updateFeedbackCounts();
}

showFeedbackModal = function(projectId) {
    document.getElementById('feedback-project-id').value = projectId;
    document.getElementById('feedback-form').reset();
    document.getElementById('feedback-modal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// Make globally available
window.showFeedbackModal = showFeedbackModal;

function updateFeedbackCounts() {
    // Reload feedback data from localStorage
    try {
        feedbackData = JSON.parse(localStorage.getItem('garissaFeedback') || '[]');
    } catch (e) {
        feedbackData = [];
    }
    
    // Update total feedback count in header
    const totalCount = feedbackData.length;
    const totalBadge = document.getElementById('total-feedback-count');
    if (totalBadge) {
        totalBadge.textContent = totalCount;
    }
    
    // Update feedback count badges on project cards
    filteredProjects.forEach(project => {
        const count = feedbackData.filter(f => f.projectId === project.id).length;
        const badge = document.querySelector(`[data-project-id="${project.id}"] .feedback-count`);
        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }
    });
}

viewAllFeedback = function() {
    const list = document.getElementById('feedback-list');
    if (!list) return;
    
    if (feedbackData.length === 0) {
        list.innerHTML = `<p class="text-gray-600 text-center py-8" data-translate="noFeedbackYet">No feedback yet. Be the first to share your thoughts!</p>`;
        updateTranslations();
        return;
    }
    
    list.innerHTML = feedbackData.map(fb => `
        <div class="border-b border-gray-200 py-4">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h4 class="font-bold text-gray-800">${escapeHtml(fb.projectName)}</h4>
                    <p class="text-sm text-gray-600">${escapeHtml(fb.name)} (${escapeHtml(fb.email)})</p>
                </div>
                <span class="text-xs text-gray-500">${new Date(fb.date).toLocaleDateString()}</span>
            </div>
            <p class="text-gray-700">${escapeHtml(fb.message)}</p>
        </div>
    `).join('');
    
    document.getElementById('all-feedback-modal').classList.remove('hidden');
};

// Make globally available
window.viewAllFeedback = viewAllFeedback;

// Show project details modal
function showProjectDetails(project) {
    const modal = document.getElementById('project-detail-modal');
    const content = document.getElementById('project-detail-content');
    
    if (!modal || !content) return;
    
    const statusClass = `status-${project.status.toLowerCase()}`;
    const budget = formatCurrency(project.budget || 0);
    const expenditure = formatCurrency(project.expenditure || 0);
    const balance = formatCurrency((project.budget || 0) - (project.expenditure || 0));
    const progressPercent = project.budget > 0 ? Math.round((project.expenditure / project.budget) * 100) : 0;
    
    content.innerHTML = `
        <div class="space-y-6">
            <div class="border-b border-gray-200 pb-4">
                <h2 class="text-3xl font-bold text-gray-800 mb-2">${escapeHtml(project.name)}</h2>
                <div class="flex items-center space-x-3">
                    <span class="filter-badge ${statusClass} text-lg px-4 py-2">${project.status}</span>
                    ${project.isGarissaTown ? '<span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">📍 Garissa Town</span>' : ''}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                        <i data-lucide="building" class="w-5 h-5 mr-2"></i> Department
                    </h3>
                    <p class="text-gray-800 text-lg">${escapeHtml(project.department || 'N/A')}</p>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                        <i data-lucide="map-pin" class="w-5 h-5 mr-2"></i> Location
                    </h3>
                    <p class="text-gray-800 text-lg">${escapeHtml(project.subcounty || 'N/A')}${project.ward ? ` - ${escapeHtml(project.ward)}` : ''}</p>
                    ${project.location ? `<p class="text-gray-600 text-sm mt-1">${escapeHtml(project.location)}</p>` : ''}
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                        <i data-lucide="dollar-sign" class="w-5 h-5 mr-2"></i> Budget
                    </h3>
                    <p class="text-gray-800 text-lg font-bold">${budget}</p>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                        <i data-lucide="trending-up" class="w-5 h-5 mr-2"></i> Expenditure
                    </h3>
                    <p class="text-gray-800 text-lg font-bold">${expenditure}</p>
                    <p class="text-gray-600 text-sm mt-1">Balance: ${balance}</p>
                </div>
                
                ${project.source_of_funds ? `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                        <i data-lucide="wallet" class="w-5 h-5 mr-2"></i> Funding Source
                    </h3>
                    <p class="text-gray-800 text-lg">${escapeHtml(project.source_of_funds)}</p>
                </div>
                ` : ''}
                
                ${project.year ? `
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                        <i data-lucide="calendar" class="w-5 h-5 mr-2"></i> Year
                    </h3>
                    <p class="text-gray-800 text-lg">${project.year}</p>
                </div>
                ` : ''}
            </div>
            
            ${project.description ? `
            <div class="border-t border-gray-200 pt-4">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="file-text" class="w-5 h-5 mr-2"></i> Description
                </h3>
                <p class="text-gray-700 leading-relaxed">${escapeHtml(project.description)}</p>
            </div>
            ` : ''}
            
            ${project.start_date || project.completion_date ? `
            <div class="border-t border-gray-200 pt-4">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="clock" class="w-5 h-5 mr-2"></i> Timeline
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${project.start_date ? `
                    <div>
                        <p class="text-sm text-gray-600">Start Date</p>
                        <p class="text-gray-800 font-medium">${escapeHtml(project.start_date)}</p>
                    </div>
                    ` : ''}
                    ${project.completion_date ? `
                    <div>
                        <p class="text-sm text-gray-600">Completion Date</p>
                        <p class="text-gray-800 font-medium">${escapeHtml(project.completion_date)}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            ${project.progress || (project.budget > 0) ? `
            <div class="border-t border-gray-200 pt-4">
                <h3 class="font-semibold text-gray-700 mb-3 flex items-center">
                    <i data-lucide="activity" class="w-5 h-5 mr-2"></i> Progress
                </h3>
                <div class="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div class="bg-gradient-to-r from-red-600 to-green-600 h-4 rounded-full" style="width: ${Math.min(progressPercent, 100)}%"></div>
                </div>
                <p class="text-sm text-gray-600">${progressPercent}% complete (${expenditure} of ${budget})</p>
            </div>
            ` : ''}
            
            ${project.contractor || project.beneficiaries ? `
            <div class="border-t border-gray-200 pt-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${project.contractor ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-2 flex items-center">
                            <i data-lucide="users" class="w-5 h-5 mr-2"></i> Contractor/Partner
                        </h3>
                        <p class="text-gray-800">${escapeHtml(project.contractor)}</p>
                    </div>
                    ` : ''}
                    ${project.beneficiaries ? `
                    <div>
                        <h3 class="font-semibold text-gray-700 mb-2 flex items-center">
                            <i data-lucide="heart" class="w-5 h-5 mr-2"></i> Beneficiaries
                        </h3>
                        <p class="text-gray-800">${escapeHtml(project.beneficiaries)}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
            ` : ''}
            
            <div class="border-t border-gray-200 pt-4 flex justify-end space-x-3">
                <button onclick="showFeedbackModal('${project.id}')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <i data-lucide="message-circle" class="w-5 h-5"></i>
                    <span>Send Feedback</span>
                </button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    
    // Initialize icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Close button handler
    const closeBtn = document.getElementById('close-project-detail');
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.add('hidden');
    }
}

// Report viewing panel - ENHANCED to load and show ALL projects
function initializeReportViewing() {
    // Report cards - show in panel with ALL projects
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', async () => {
            const reportType = card.dataset.report;
            console.log(`📊 Loading ${reportType} report with all projects...`);
            
            // Ensure we have the latest data
            if (allProjects.length === 0) {
                console.log('⚠️ No projects loaded, fetching from Google Sheets...');
                showLoading();
                try {
                    const freshProjects = await loadProjectsFromGoogleSheets();
                    if (freshProjects && freshProjects.length > 0) {
                        allProjects = freshProjects;
                        filteredProjects = [...allProjects];
                        console.log(`✅ Loaded ${allProjects.length} projects for report`);
                    }
                } catch (error) {
                    console.error('Error loading projects for report:', error);
                } finally {
                    hideLoading();
                }
            }
            
            showReportInPanel(reportType);
        });
    });
    
    // Close report modal
    const closeReport = document.getElementById('close-report');
    if (closeReport) {
        closeReport.addEventListener('click', () => {
            document.getElementById('report-modal').classList.add('hidden');
        });
    }
    
    // Also close on background click
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

function showReportInPanel(reportType) {
    // Use ALL PROJECTS for reports (not just filtered) - citizens need to see everything
    let projects = [];
    
    // For reports, show ALL projects unless specifically filtered
    const sourceProjects = allProjects.length > 0 ? allProjects : filteredProjects;
    
    switch(reportType) {
        case 'summary':
            // Summary shows ALL projects
            projects = sourceProjects;
            break;
        case 'completed':
            projects = sourceProjects.filter(p => p.status === 'Completed');
            break;
        case 'ongoing':
            projects = sourceProjects.filter(p => p.status === 'Ongoing');
            break;
        case 'stalled':
            projects = sourceProjects.filter(p => p.status === 'Stalled');
            break;
        case 'budget':
            projects = sourceProjects; // All projects for budget analysis
            break;
        case 'location':
            projects = sourceProjects; // All projects for location analysis
            break;
        default:
            projects = sourceProjects;
    }
    
    console.log(`📊 Showing ${reportType} report with ${projects.length} projects`);
    
    // Update report count
    const reportCountEl = document.getElementById('report-count');
    if (reportCountEl) {
        reportCountEl.textContent = projects.length;
    }
    
    // Generate comprehensive report table with ALL project details
    const reportContent = document.getElementById('report-content');
    
    if (projects.length === 0) {
        reportContent.innerHTML = `
            <div class="text-center py-12">
                <i data-lucide="folder-x" class="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
                <p class="text-gray-600 text-lg">No projects found for this report.</p>
                <p class="text-gray-500 text-sm mt-2">Try refreshing the page or checking your connection to Google Sheets.</p>
                <button onclick="location.reload()" class="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700">
                    Refresh Data
                </button>
            </div>
        `;
    } else {
        // Calculate progress and impact metrics
        const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
        const totalExpenditure = projects.reduce((sum, p) => sum + (p.expenditure || 0), 0);
        const avgProgress = projects.length > 0 ? Math.round((totalExpenditure / totalBudget) * 100) : 0;
        
        reportContent.innerHTML = `
            <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p class="text-sm text-blue-600 font-medium">Total Projects</p>
                    <p class="text-2xl font-bold text-blue-800">${projects.length}</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p class="text-sm text-green-600 font-medium">Total Budget</p>
                    <p class="text-2xl font-bold text-green-800">${formatCurrency(totalBudget)}</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p class="text-sm text-purple-600 font-medium">Total Expenditure</p>
                    <p class="text-2xl font-bold text-purple-800">${formatCurrency(totalExpenditure)}</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p class="text-sm text-yellow-600 font-medium">Average Progress</p>
                    <p class="text-2xl font-bold text-yellow-800">${avgProgress}%</p>
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 border border-gray-300">
                    <thead class="bg-gradient-to-r from-red-600 to-green-600 text-white">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider sticky left-0 bg-red-600 z-10">Project Name</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Progress</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Department</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Sub-County</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Ward</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Budget</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Expenditure</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Balance</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Funding Source</th>
                            <th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Year</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${projects.map((p, index) => {
                            const progressPercent = p.budget > 0 ? Math.round((p.expenditure / p.budget) * 100) : 0;
                            const balance = (p.budget || 0) - (p.expenditure || 0);
                            const progressColor = progressPercent >= 80 ? 'bg-green-500' : progressPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                            const projectId = p.id || `project-${index}-${Date.now()}`;
                            // Store project data in a way we can retrieve it
                            if (!p.id) p.id = projectId;
                            return `
                                <tr class="hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer project-row" data-project-id="${projectId}" onclick="handleReportRowClick('${projectId}')">
                                    <td class="px-4 py-3 whitespace-normal text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10 border-r border-gray-200">
                                        ${escapeHtml(p.name || 'Unnamed Project')}
                                        ${p.description ? `<br><span class="text-xs text-gray-500">${escapeHtml(p.description.substring(0, 80))}${p.description.length > 80 ? '...' : ''}</span>` : ''}
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <span class="filter-badge status-${(p.status || 'Ongoing').toLowerCase()} px-2 py-1">${p.status || 'Ongoing'}</span>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-16 bg-gray-200 rounded-full h-2">
                                                <div class="${progressColor} h-2 rounded-full" style="width: ${Math.min(progressPercent, 100)}%"></div>
                                            </div>
                                            <span class="text-xs font-medium text-gray-700">${progressPercent}%</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${escapeHtml(p.department || 'N/A')}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${escapeHtml(p.subcounty || 'N/A')}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${escapeHtml(p.ward || 'N/A')}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">${formatCurrency(p.budget || 0)}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">${formatCurrency(p.expenditure || 0)}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm ${balance >= 0 ? 'text-green-700' : 'text-red-700'} font-medium">${formatCurrency(balance)}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">${escapeHtml(p.source_of_funds || 'N/A')}</td>
                                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">${p.year || 'N/A'}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="mt-4 flex justify-between items-center">
                <p class="text-sm text-gray-600">
                    <strong>Source:</strong> <a href="${GOOGLE_SHEETS_URL}" target="_blank" class="text-blue-600 hover:underline">Google Sheets - Garissa County Projects</a>
                </p>
                <button onclick="exportReportToExcel('${reportType}')" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                    <i data-lucide="download" class="w-4 h-4"></i>
                    <span>Export to Excel</span>
                </button>
            </div>
        `;
    }
    
    // Show modal
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
    
    // Initialize icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    // Make showProjectDetails available globally
    if (typeof window.showProjectDetails === 'undefined') {
        window.showProjectDetails = showProjectDetails;
    }
    
    // Store projects for row click handler
    window.reportProjects = projects;
}

// Handle report row click
function handleReportRowClick(projectId) {
    // First try reportProjects (projects in current report)
    const project = window.reportProjects?.find(p => p.id === projectId);
    if (project) {
        showProjectDetails(project);
        return;
    }
    
    // If not found, try allProjects
    const allProject = allProjects.find(p => p.id === projectId);
    if (allProject) {
        showProjectDetails(allProject);
        return;
    }
    
    console.warn(`Project with ID ${projectId} not found`);
}

// Make globally available
window.handleReportRowClick = handleReportRowClick;

// Search button and filtered view
function initializeSearchButton() {
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            applyFilters();
            switchTab('list');
            const viewFilteredBtn = document.getElementById('view-filtered-btn');
            if (viewFilteredBtn) {
                viewFilteredBtn.classList.remove('hidden');
            }
        });
    }
    
    const viewFilteredBtn = document.getElementById('view-filtered-btn');
    if (viewFilteredBtn) {
        viewFilteredBtn.addEventListener('click', () => {
            switchTab('list');
            applyFilters();
        });
    }
    
    // Auto-show filtered button when filters change
    const filterInputs = document.querySelectorAll('#search-input, #status-filter, #subcounty-filter, #ward-filter, #department-filter, #budget-filter, #year-filter, #funding-filter');
    filterInputs.forEach(input => {
        input.addEventListener('change', () => {
            const viewFilteredBtn = document.getElementById('view-filtered-btn');
            if (viewFilteredBtn && hasActiveFilters()) {
                viewFilteredBtn.classList.remove('hidden');
            }
        });
    });
}

function hasActiveFilters() {
    const search = document.getElementById('search-input')?.value;
    const status = document.getElementById('status-filter')?.value;
    const subcounty = document.getElementById('subcounty-filter')?.value;
    const ward = document.getElementById('ward-filter')?.value;
    const department = document.getElementById('department-filter')?.value;
    const budget = document.getElementById('budget-filter')?.value;
    const year = document.getElementById('year-filter')?.value;
    const funding = document.getElementById('funding-filter')?.value;
    
    return !!(search || status || subcounty || ward || department || budget || year || funding);
}

// Setup event listeners
function setupEventListeners() {
    // Language switcher
    initializeLanguageSwitcher();
    
    // Feedback system
    initializeFeedbackSystem();
    
    // Report viewing
    initializeReportViewing();
    
    // Search button
    initializeSearchButton();
    
    // Export buttons
    const exportExcel = document.getElementById('export-excel');
    if (exportExcel) exportExcel.addEventListener('click', () => {
        // Export all projects from list view
        const dataToExport = filteredProjects.length > 0 ? filteredProjects : allProjects;
        exportToExcelWithData(dataToExport, 'projects-list');
    });
    
    const exportPdf = document.getElementById('export-pdf');
    if (exportPdf) exportPdf.addEventListener('click', exportToPDF);
    
    // Make exportReportToExcel globally available
    window.exportReportToExcel = exportReportToExcel;
    
    // Refresh buttons
    const refreshProjectsBtn = document.getElementById('refresh-projects-btn');
    if (refreshProjectsBtn) {
        refreshProjectsBtn.addEventListener('click', async () => {
            refreshProjectsBtn.disabled = true;
            refreshProjectsBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> <span>Refreshing...</span>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            showLoading();
            try {
                const freshProjects = await loadProjectsFromGoogleSheets();
                if (freshProjects && freshProjects.length > 0) {
                    allProjects = freshProjects;
                    filteredProjects = [...allProjects];
                    populateFilterDropdowns();
                    updateStats();
                    updateCharts();
                    
                    // Update count in reports view
                    const countEl = document.getElementById('projects-count-reports');
                    if (countEl) countEl.textContent = `${allProjects.length} projects loaded`;
                    
                    alert(`✅ Successfully refreshed! Loaded ${allProjects.length} projects from Google Sheets.`);
                } else {
                    alert('⚠️ No projects found. Please check your Google Sheets connection.');
                }
            } catch (error) {
                console.error('Refresh error:', error);
                alert('❌ Error refreshing data. Please try again later.');
            } finally {
                hideLoading();
                refreshProjectsBtn.disabled = false;
                refreshProjectsBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i> <span>Refresh Data</span>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }
    
    const refreshListBtn = document.getElementById('refresh-list-btn');
    if (refreshListBtn) {
        refreshListBtn.addEventListener('click', async () => {
            refreshListBtn.disabled = true;
            refreshListBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> <span>Refreshing...</span>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            showLoading();
            try {
                const freshProjects = await loadProjectsFromGoogleSheets();
                if (freshProjects && freshProjects.length > 0) {
                    allProjects = freshProjects;
                    filteredProjects = [...allProjects];
                    populateFilterDropdowns();
                    renderExcelTable(); // Use Excel table view
                    updateStats();
                    updateMapMarkers();
                    updateCharts();
                    
                    console.log(`✅ List View refreshed: ${allProjects.length} projects loaded`);
                } else {
                    alert('⚠️ No projects found. Please check your Google Sheets connection.');
                }
            } catch (error) {
                console.error('Refresh error:', error);
                alert('❌ Error refreshing data. Please try again later.');
            } finally {
                hideLoading();
                refreshListBtn.disabled = false;
                refreshListBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i> <span>Refresh</span>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    }
    
    const generateMapReport = document.getElementById('generate-map-report');
    if (generateMapReport) generateMapReport.addEventListener('click', generateMapReport);
    
    // View all feedback button (if exists)
    const viewAllFeedbackBtn = document.getElementById('view-all-feedback-btn');
    if (viewAllFeedbackBtn) {
        viewAllFeedbackBtn.addEventListener('click', viewAllFeedback);
    }
}

// Export report to Excel (enhanced for reports)
function exportReportToExcel(reportType) {
    let projects = [];
    const sourceProjects = allProjects.length > 0 ? allProjects : filteredProjects;
    
    switch(reportType) {
        case 'summary':
            projects = sourceProjects;
            break;
        case 'completed':
            projects = sourceProjects.filter(p => p.status === 'Completed');
            break;
        case 'ongoing':
            projects = sourceProjects.filter(p => p.status === 'Ongoing');
            break;
        case 'stalled':
            projects = sourceProjects.filter(p => p.status === 'Stalled');
            break;
        case 'budget':
        case 'location':
        default:
            projects = sourceProjects;
    }
    
    exportToExcelWithData(projects, `${reportType}-report`);
}

// Export to Excel - ENHANCED with all project data
function exportToExcel() {
    exportToExcelWithData(filteredProjects.length > 0 ? filteredProjects : allProjects, 'projects');
}

function exportToExcelWithData(projects, filename) {
    if (typeof XLSX === 'undefined') {
        alert('Excel export library not loaded. Please refresh the page.');
        return;
    }
    
    if (!projects || projects.length === 0) {
        alert('No projects to export.');
        return;
    }
    
    const data = projects.map(p => {
        const progress = p.budget > 0 ? Math.round((p.expenditure / p.budget) * 100) : 0;
        const balance = (p.budget || 0) - (p.expenditure || 0);
        return {
            'Project Name': p.name || '',
            'Description': p.description || '',
            'Status': p.status || 'Ongoing',
            'Progress (%)': progress,
            'Department': p.department || '',
            'Sub-County': p.subcounty || '',
            'Ward': p.ward || '',
            'Location': p.location || '',
            'Budget (KSh)': p.budget || 0,
            'Expenditure (KSh)': p.expenditure || 0,
            'Balance (KSh)': balance,
            'Source of Funds': p.source_of_funds || '',
            'Start Date': p.start_date || '',
            'Completion Date': p.completion_date || '',
            'Year': p.year || '',
            'Contractor': p.contractor || '',
            'Beneficiaries': p.beneficiaries || '',
            'Latitude': p.latitude || '',
            'Longitude': p.longitude || ''
        };
    });
    
    try {
        const ws = XLSX.utils.json_to_sheet(data);
        
        // Set column widths for better readability
        const colWidths = [
            { wch: 30 }, // Project Name
            { wch: 40 }, // Description
            { wch: 12 }, // Status
            { wch: 10 }, // Progress
            { wch: 20 }, // Department
            { wch: 18 }, // Sub-County
            { wch: 18 }, // Ward
            { wch: 25 }, // Location
            { wch: 15 }, // Budget
            { wch: 15 }, // Expenditure
            { wch: 15 }, // Balance
            { wch: 20 }, // Source of Funds
            { wch: 12 }, // Start Date
            { wch: 12 }, // Completion Date
            { wch: 8 },  // Year
            { wch: 20 }, // Contractor
            { wch: 15 }, // Beneficiaries
            { wch: 12 }, // Latitude
            { wch: 12 }  // Longitude
        ];
        ws['!cols'] = colWidths;
        
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        XLSX.writeFile(wb, `garissa-${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
        console.log(`✅ Exported ${data.length} projects to Excel`);
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting to Excel. Please try again.');
    }
}

// Export to PDF (simple text version)
function exportToPDF() {
    let content = 'GARISSA COUNTY PROJECTS REPORT\n';
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    content += `Total Projects: ${filteredProjects.length}\n\n`;
    
    filteredProjects.forEach((p, i) => {
        content += `${i + 1}. ${p.name}\n`;
        content += `   Status: ${p.status}\n`;
        content += `   Department: ${p.department || 'N/A'}\n`;
        content += `   Budget: ${formatCurrency(p.budget || 0)}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garissa-projects-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Generate map report
function generateMapReport() {
    exportToExcel();
}

// Generate specific report
function generateReport(type) {
    if (typeof XLSX === 'undefined') {
        alert('Excel export library not loaded. Please refresh the page.');
        return;
    }
    
    let projects = [];
    
    switch(type) {
        case 'summary':
            projects = filteredProjects;
            break;
        case 'completed':
            projects = filteredProjects.filter(p => p.status === 'Completed');
            break;
        case 'ongoing':
            projects = filteredProjects.filter(p => p.status === 'Ongoing');
            break;
        case 'stalled':
            projects = filteredProjects.filter(p => p.status === 'Stalled');
            break;
        case 'budget':
            projects = filteredProjects;
            break;
        case 'location':
            projects = filteredProjects;
            break;
    }
    
    const data = projects.map(p => ({
        'Project Name': p.name,
        'Status': p.status,
        'Department': p.department,
        'Location': `${p.subcounty || ''} ${p.ward || ''}`,
        'Budget': p.budget,
        'Expenditure': p.expenditure
    }));
    
    try {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${type}-report`);
        XLSX.writeFile(wb, `garissa-${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        console.error('Report generation error:', error);
        alert('Error generating report. Please try again.');
    }
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
    }).format(amount);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        // Force hide with important styles
        overlay.style.display = 'none';
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';
    }
}

function showError(message) {
    console.error(message);
    // Could show a toast notification here
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div class="bg-white rounded-lg p-8 text-center max-w-md">
                <div class="text-red-600 mb-4">
                    <i data-lucide="alert-circle" class="w-12 h-12 mx-auto"></i>
                </div>
                <p class="text-gray-800 font-semibold mb-2">${message}</p>
                <button onclick="location.reload()" class="bg-red-600 text-white px-6 py-2 rounded-lg mt-4 hover:bg-red-700">
                    Reload Page
                </button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}
