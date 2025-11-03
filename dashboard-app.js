// Garissa County Projects Dashboard - Main Application
// Public dashboard without authentication - Optimized Version

// Global variables
let allProjects = [];
let filteredProjects = [];
let map = null;
let markers = [];
let charts = {};
let currentPage = 1;
const itemsPerPage = 20;

// Garissa County coordinates
const GARISSA_TOWN_CENTER = [-0.4569, 39.6463];
const GARISSA_COUNTY_BOUNDS = [
    [-0.8, 39.2], // Southwest
    [0.2, 40.2]   // Northeast
];

// Google Sheets Configuration
const GOOGLE_SHEETS_ID = '1-DNepBW2my39yooT_K6uTnRRIMJv0NtI';

// Sub-counties and wards in Garissa County
const SUB_COUNTIES = [
    'Garissa Township', 'Balambala', 'Lagdera', 'Dadaab', 'Fafi', 
    'Ijara', 'Hulugho', 'Sankuri', 'Masalani', 'Bura East', 'Bura West'
];

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
    
    try {
        // Initialize database
        if (typeof projectsDB !== 'undefined') {
            await projectsDB.init();
            console.log('✅ Database initialized');
        }
        
        // Check if projects exist in database
        if (typeof projectsDB !== 'undefined') {
            const dbProjects = await projectsDB.getAllProjects();
            if (dbProjects && dbProjects.length > 0) {
                console.log(`✅ Loaded ${dbProjects.length} projects from database`);
                allProjects = dbProjects;
                filteredProjects = [...allProjects];
            } else {
                // Load from Google Sheets if database is empty
                await loadProjectsFromGoogleSheets();
            }
        } else {
            // Fallback: load from Google Sheets
            await loadProjectsFromGoogleSheets();
        }
        
        // Initialize map FIRST with satellite basemap
        initializeMap();
        
        // Load projects from Google Sheets with extended timeout for 800 projects
        if (allProjects.length === 0) {
            await Promise.race([
                loadProjectsFromGoogleSheets(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000)) // 30 second timeout for 800 projects
            ]).catch(async (error) => {
                console.warn('Loading from Google Sheets failed or timed out:', error);
                await loadFallbackData();
            });
        }
        
        // Validate and fix project data
        allProjects = allProjects.map((project, index) => {
            const fixed = validateAndFixProject(project);
            if (!fixed.id) fixed.id = `project-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            return fixed;
        }).filter(p => p !== null);
        
        filteredProjects = [...allProjects];
        
        // Store in database after validation
        if (typeof projectsDB !== 'undefined' && allProjects.length > 0) {
            await projectsDB.storeProjects(allProjects);
        }
        
        // Initialize UI components
        initializeFilters();
        initializeTabs();
        initializeCharts();
        initializeProjectDetailModal();
        
        // Render initial views
        renderProjects();
        updateStats();
        updateMapMarkers();
        updateCharts();
        updateFeedbackCounts();
        
        // Setup event listeners
        setupEventListeners();
        
        // Update feedback counts
        updateFeedbackCounts();
        
        console.log(`✅ Successfully loaded ${allProjects.length} projects`);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        // Load fallback data on any error
        await loadFallbackData();
        renderProjects();
        updateStats();
        updateMapMarkers();
        updateCharts();
        showError('Loaded sample data. Please check Google Sheets connection.');
    } finally {
        hideLoading();
        // Re-initialize icons after dynamic content is loaded
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 500);
    }
}

// Load projects from Google Sheets - Enhanced to load ALL 800 projects
async function loadProjectsFromGoogleSheets() {
    const GOOGLE_SHEETS_ID = '1-DNepBW2my39yooT_K6uTnRRIMJv0NtI';
    
    // Try all possible sheet names from the actual spreadsheet
    const sheetNames = [
        'Summary List for Dashboard',
        'Project Stocktaking Template',
        'Projects',
        'Data',
        'Main',
        'Sheet1',
        'Sheet 1',
        'Garissa Projects',
        'All Projects'
    ];
    
    let allLoadedProjects = [];
    
    // Try each sheet name
    for (const sheetName of sheetNames) {
        try {
            const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
            console.log(`Trying to load from sheet: ${sheetName}`);
            
            const response = await fetch(csvUrl, { 
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Accept': 'text/csv'
                }
            });
            
            if (response.ok) {
                const csvText = await response.text();
                console.log(`Received ${csvText.length} characters from ${sheetName}`);
                
                if (csvText && csvText.trim().length > 50) {
                    const projects = parseCSVToProjects(csvText, sheetName);
                    console.log(`✅ Parsed ${projects.length} projects from ${sheetName}`);
                    
                    if (projects.length > 0) {
                        // Merge projects (avoid duplicates)
                        projects.forEach(newProject => {
                            const exists = allLoadedProjects.find(p => 
                                p.name === newProject.name && 
                                p.subcounty === newProject.subcounty &&
                                p.budget === newProject.budget
                            );
                            if (!exists) {
                                allLoadedProjects.push(newProject);
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.warn(`Error loading sheet ${sheetName}:`, error.message);
            continue;
        }
    }
    
    if (allLoadedProjects.length === 0) {
        throw new Error('No projects loaded from any sheet');
    }
    
    console.log(`✅ Total projects loaded: ${allLoadedProjects.length}`);
    
    // Enhance all projects with coordinates and IDs
    allProjects = allLoadedProjects.map((p, index) => {
        const enhanced = enhanceProjectWithCoordinates(p);
        if (!enhanced.id) enhanced.id = `project-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return enhanced;
    });
    
    // Store in database
    try {
        if (typeof projectsDB !== 'undefined') {
            await projectsDB.init();
            await projectsDB.storeProjects(allProjects);
            console.log(`✅ Stored ${allProjects.length} projects in database`);
        }
    } catch (dbError) {
        console.warn('Database storage failed, continuing with memory:', dbError);
    }
    
    return allProjects;
}

// Load fallback sample data
async function loadFallbackData() {
    console.log('Loading fallback sample data...');
    allProjects = SAMPLE_PROJECTS.map((project, index) => {
        const enhanced = enhanceProjectWithCoordinates(project);
        if (!enhanced.id) enhanced.id = `project-${index}-${Date.now()}`;
        return enhanced;
    });
    filteredProjects = [...allProjects];
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
            project.name = (
                project.project_name || 
                project.name || 
                project.title || 
                project.project_title ||
                project.project ||
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
            
            // Normalize all fields
            project.description = (project.description || project.project_description || project.details || project.remarks || project.notes || '').trim();
            project.status = normalizeStatus(project.status || project.project_status || project.state || project.current_status || project.project_status_2 || 'Ongoing');
            project.department = (project.department || project.implementing_department || project.dept || project.implementing_agency || project.agency || 'County Executive').trim();
            project.subcounty = (project.subcounty || project.sub_county || project.sub_county_name || project.subcounty_name || project.location_subcounty || '').trim();
            project.ward = (project.ward || project.ward_name || project.ward_location || project.location_ward || '').trim();
            
            // Parse budget (handle various formats)
            const budgetStr = project.budget || project.total_budget || project.budget_amount || project.approved_budget || project.contract_amount || '0';
            project.budget = parseBudget(budgetStr);
            
            // Parse expenditure
            const expStr = project.expenditure || project.amount_spent || project.expenses || project.expenditure_to_date || project.actual_expenditure || '0';
            project.expenditure = parseBudget(expStr);
            
            project.source_of_funds = (project.source_of_funds || project.funding_source || project.funder || project.donor || project.sponsor || '').trim();
            project.start_date = (project.start_date || project.start_date_2 || project.commencement_date || project.start || project.date_started || '').trim();
            project.completion_date = (project.completion_date || project.end_date || project.expected_completion || project.finish_date || project.end || project.date_completed || '').trim();
            project.location = (project.location || project.project_location || project.site || project.physical_location || project.address || '').trim();
            
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

// Normalize status values
function normalizeStatus(status) {
    if (!status) return 'Ongoing';
    const statusLower = String(status).toLowerCase().trim();
    if (statusLower.includes('complete') || statusLower === 'done' || statusLower === 'finished') return 'Completed';
    if (statusLower.includes('ongoing') || statusLower === 'in progress' || statusLower === 'active') return 'Ongoing';
    if (statusLower.includes('stall') || statusLower === 'delayed' || statusLower === 'on hold') return 'Stalled';
    return 'Ongoing';
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
        // Ensure List View shows all projects
        renderProjects();
        console.log(`✅ List View: Displaying ${filteredProjects.length} projects`);
    } else if (tabName === 'analytics') {
        updateCharts();
    } else if (tabName === 'reports') {
        // Reports tab is ready
        initializeReportViewing();
    }
}

// Pagination state
let currentPage = 1;
const projectsPerPage = 50; // Show 50 projects per page for better performance

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
                    legend: { position: 'bottom' }
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
                    legend: { display: false }
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
                    legend: { position: 'bottom' }
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
                    legend: { display: false }
                }
            }
        });
    }
}

// Update charts
function updateCharts() {
    // Status chart
    if (charts.status) {
        const statusCounts = {
            'Completed': filteredProjects.filter(p => p.status === 'Completed').length,
            'Ongoing': filteredProjects.filter(p => p.status === 'Ongoing').length,
            'Stalled': filteredProjects.filter(p => p.status === 'Stalled').length
        };
        
        charts.status.data = {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }]
        };
        charts.status.update();
    }
    
    // Department chart
    if (charts.department) {
        const deptCounts = {};
        filteredProjects.forEach(p => {
            const dept = p.department || 'Unknown';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
        
        charts.department.data = {
            labels: Object.keys(deptCounts),
            datasets: [{
                label: 'Projects',
                data: Object.values(deptCounts),
                backgroundColor: '#dc2626'
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
        
        filteredProjects.forEach(p => {
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
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        };
        charts.budget.update();
    }
    
    // Subcounty chart
    if (charts.subcounty) {
        const subcountyCounts = {};
        filteredProjects.forEach(p => {
            const sub = p.subcounty || 'Unknown';
            subcountyCounts[sub] = (subcountyCounts[sub] || 0) + 1;
        });
        
        charts.subcounty.data = {
            labels: Object.keys(subcountyCounts),
            datasets: [{
                label: 'Projects',
                data: Object.values(subcountyCounts),
                backgroundColor: '#059669'
            }]
        };
        charts.subcounty.update();
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

// Report viewing panel (instead of download)
function initializeReportViewing() {
    // Report cards - show in panel instead of downloading
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', () => {
            const reportType = card.dataset.report;
            showReportInPanel(reportType);
        });
    });
    
    // Close report modal
    const closeReport = document.getElementById('close-report');
    if (closeReport) closeReport.addEventListener('click', () => {
        document.getElementById('report-modal').classList.add('hidden');
    });
}

function showReportInPanel(reportType) {
    let projects = [];
    
    switch(reportType) {
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
    
    // Update report count
    document.getElementById('report-count').textContent = projects.length;
    
    // Generate report table
    const reportContent = document.getElementById('report-content');
    reportContent.innerHTML = `
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenditure</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${projects.map(p => `
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${escapeHtml(p.name)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span class="filter-badge status-${p.status.toLowerCase()}">${p.status}</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(p.department || 'N/A')}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${escapeHtml(p.subcounty || 'N/A')}${p.ward ? ` - ${escapeHtml(p.ward)}` : ''}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(p.budget || 0)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(p.expenditure || 0)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // Show modal
    document.getElementById('report-modal').classList.remove('hidden');
}

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
    if (exportExcel) exportExcel.addEventListener('click', exportToExcel);
    
    const exportPdf = document.getElementById('export-pdf');
    if (exportPdf) exportPdf.addEventListener('click', exportToPDF);
    
    const generateMapReport = document.getElementById('generate-map-report');
    if (generateMapReport) generateMapReport.addEventListener('click', generateMapReport);
    
    // View all feedback button (if exists)
    const viewAllFeedbackBtn = document.getElementById('view-all-feedback-btn');
    if (viewAllFeedbackBtn) {
        viewAllFeedbackBtn.addEventListener('click', viewAllFeedback);
    }
}

// Export to Excel
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Excel export library not loaded. Please refresh the page.');
        return;
    }
    
    const data = filteredProjects.map(p => ({
        'Project Name': p.name,
        'Description': p.description,
        'Status': p.status,
        'Department': p.department,
        'Sub-County': p.subcounty,
        'Ward': p.ward,
        'Budget (KSh)': p.budget,
        'Expenditure (KSh)': p.expenditure,
        'Source of Funds': p.source_of_funds,
        'Start Date': p.start_date,
        'Completion Date': p.completion_date,
        'Location': p.location
    }));
    
    try {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        XLSX.writeFile(wb, `garissa-projects-${new Date().toISOString().split('T')[0]}.xlsx`);
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
    if (overlay) overlay.classList.add('hidden');
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
