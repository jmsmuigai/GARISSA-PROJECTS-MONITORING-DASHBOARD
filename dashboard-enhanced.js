// Enhanced Garissa County Dashboard with Full Features
// Language switching, interactive reports, feedback system, analytics

// Import translations
let currentLang = 'en';
let t = translations.en; // Current translations
let allProjects = [];
let filteredProjects = [];
let map = null;
let markers = [];
let charts = {};
let feedbackData = JSON.parse(localStorage.getItem('garissaFeedback') || '[]');
let currentReport = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEnhancedApp();
});

async function initializeEnhancedApp() {
    showLoading();
    initializeLanguageSwitcher();
    
    try {
        // Initialize map first
        initializeMap();
        
        // Load projects with timeout
        await Promise.race([
            loadProjectsFromGoogleSheets(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
        ]).catch(async (error) => {
            console.warn('Loading failed:', error);
            await loadFallbackData();
        });
        
        // Validate and fix data
        allProjects = allProjects.map(p => validateAndFixProject(p)).filter(p => p !== null);
        filteredProjects = [...allProjects];
        
        // Initialize UI
        initializeFilters();
        initializeTabs();
        initializeCharts();
        initializeFeedbackSystem();
        
        // Render
        renderProjects();
        updateStats();
        updateMapMarkers();
        updateCharts();
        setupEventListeners();
        
        console.log(`✅ Loaded ${allProjects.length} projects`);
        
    } catch (error) {
        console.error('Error:', error);
        await loadFallbackData();
        renderProjects();
        updateStats();
        updateMapMarkers();
        updateCharts();
    } finally {
        hideLoading();
        updateTranslations();
        setTimeout(() => {
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 500);
    }
}

// Language switcher
function initializeLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            switchLanguage(lang);
        });
    });
    
    // Check saved preference
    const savedLang = localStorage.getItem('garissaLang') || 'en';
    switchLanguage(savedLang);
}

function switchLanguage(lang) {
    currentLang = lang;
    t = translations[lang];
    localStorage.setItem('garissaLang', lang);
    
    // Update active button
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
    // Update all translatable elements
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.dataset.translate;
        if (t[key]) {
            if (el.tagName === 'INPUT' && el.type === 'text') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });
    
    // Update stats and other dynamic content
    updateStats();
}

// Enhanced map initialization
function initializeMap() {
    map = L.map('map', {
        center: [-0.4569, 39.6463],
        zoom: 9
    });
    
    // Satellite basemap
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 19
    });
    
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    });
    
    satelliteLayer.addTo(map);
    L.control.layers({ "Satellite": satelliteLayer, "Street": osmLayer }).addTo(map);
    
    // Center marker
    L.marker([-0.4569, 39.6463]).addTo(map)
        .bindPopup(t.welcomeMessage);
}

// Load projects (reuse existing function)
async function loadProjectsFromGoogleSheets() {
    const GOOGLE_SHEETS_ID = '1-DNepBW2my39yooT_K6uTnRRIMJv0NtI';
    const methods = [
        async () => {
            const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:csv`;
            const response = await fetch(csvUrl, { mode: 'cors', cache: 'no-cache' });
            if (!response.ok) throw new Error('Failed');
            const csvText = await response.text();
            if (!csvText || csvText.trim().length < 10) throw new Error('Empty');
            return parseCSVToProjects(csvText);
        }
    ];
    
    for (const method of methods) {
        try {
            const projects = await method();
            if (projects && projects.length > 0) {
                allProjects = projects.map(p => enhanceProjectWithCoordinates(p));
                return;
            }
        } catch (error) {
            continue;
        }
    }
    throw new Error('All methods failed');
}

// Parse CSV (simplified version - reuse from main app)
function parseCSVToProjects(csvText) {
    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    
    const headers = parseCSVLine(lines[0]);
    const projects = [];
    
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = parseCSVLine(lines[i]);
            if (values.every(v => !v || v.trim() === '')) continue;
            
            const project = {};
            headers.forEach((h, idx) => {
                const key = normalizeHeaderKey(h);
                project[key] = values[idx]?.trim() || '';
            });
            
            project.name = (project.project_name || project.name || `Project ${i}`).trim();
            project.status = normalizeStatus(project.status || 'Ongoing');
            project.department = (project.department || 'County Executive').trim();
            project.subcounty = (project.subcounty || 'Garissa Township').trim();
            project.ward = (project.ward || '').trim();
            project.budget = parseFloat(project.budget || 0);
            project.expenditure = parseFloat(project.expenditure || 0);
            project.description = (project.description || '').trim();
            project.source_of_funds = (project.source_of_funds || '').trim();
            
            if (project.name && project.name !== `Project ${i}`) {
                projects.push(project);
            }
        } catch (e) {
            continue;
        }
    }
    
    return projects;
}

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i+1] === '"') {
                current += '"';
                i++;
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

function normalizeHeaderKey(header) {
    return header.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

function normalizeStatus(status) {
    const s = String(status).toLowerCase().trim();
    if (s.includes('complete') || s === 'done') return 'Completed';
    if (s.includes('ongoing') || s === 'active') return 'Ongoing';
    if (s.includes('stall') || s === 'delayed') return 'Stalled';
    return 'Ongoing';
}

function validateAndFixProject(project) {
    if (!project.name || project.name.trim() === '') {
        project.name = `Project ${Date.now()}`;
    }
    project.status = normalizeStatus(project.status || 'Ongoing');
    project.budget = Math.abs(parseFloat(project.budget) || 0);
    project.expenditure = Math.abs(parseFloat(project.expenditure) || 0);
    if (project.expenditure > project.budget * 1.5) {
        project.expenditure = project.budget * 0.9;
    }
    project.department = project.department || 'County Executive';
    project.subcounty = project.subcounty || 'Garissa Township';
    
    if (!project.latitude || !project.longitude) {
        const coords = geocodeLocation(project);
        project.latitude = coords.lat;
        project.longitude = coords.lng;
    }
    
    project.isGarissaTown = isGarissaTownLocation(project);
    return project;
}

function enhanceProjectWithCoordinates(project) {
    if (project.latitude && project.longitude) {
        return { ...project, isGarissaTown: isGarissaTownLocation(project) };
    }
    const coords = geocodeLocation(project);
    project.latitude = coords.lat;
    project.longitude = coords.lng;
    project.isGarissaTown = isGarissaTownLocation(project);
    return project;
}

function geocodeLocation(project) {
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
    
    const sub = (project.subcounty || '').toLowerCase();
    let coords = { lat: -0.4569, lng: 39.6463 };
    
    for (const [key, val] of Object.entries(subcountyCoords)) {
        if (sub.includes(key)) {
            coords = { ...val };
            coords.lat += (Math.random() - 0.5) * 0.05;
            coords.lng += (Math.random() - 0.5) * 0.05;
            break;
        }
    }
    
    return coords;
}

function isGarissaTownLocation(project) {
    const sub = (project.subcounty || '').toLowerCase();
    const ward = (project.ward || '').toLowerCase();
    return sub.includes('garissa') || sub.includes('township') || 
           ward.includes('garissa') || ward.includes('town');
}

// Sample data fallback
async function loadFallbackData() {
    const sample = [
        { name: 'Water Supply - Garissa Town', status: 'Ongoing', department: 'Water and Sanitation', subcounty: 'Garissa Township', ward: 'Township', budget: 50000000, expenditure: 35000000, description: 'Water treatment plant', source_of_funds: 'Government' },
        { name: 'Primary School - Balambala', status: 'Completed', department: 'Education', subcounty: 'Balambala', ward: 'Balambala', budget: 15000000, expenditure: 14800000, description: 'New primary school', source_of_funds: 'County' },
        { name: 'Health Center - Lagdera', status: 'Ongoing', department: 'Health', subcounty: 'Lagdera', ward: 'Lagdera', budget: 25000000, expenditure: 18000000, description: 'Health center upgrade', source_of_funds: 'World Bank' },
        { name: 'Road Rehabilitation - Dadaab', status: 'Stalled', department: 'Infrastructure', subcounty: 'Dadaab', ward: 'Dadaab', budget: 75000000, expenditure: 30000000, description: 'Road rehabilitation', source_of_funds: 'KURA' },
        { name: 'Agriculture Extension - Fafi', status: 'Completed', department: 'Agriculture', subcounty: 'Fafi', ward: 'Fafi', budget: 8000000, expenditure: 7800000, description: 'Extension services', source_of_funds: 'County' }
    ];
    
    allProjects = sample.map(p => enhanceProjectWithCoordinates(p));
}

// Continue with rest of functions...
// This is getting long, let me continue in the next file update

