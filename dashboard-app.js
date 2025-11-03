// Garissa County Projects Dashboard - Main Application
// Public dashboard without authentication

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
const GOOGLE_SHEETS_API_KEY = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Public API key for read-only access

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

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Show loading overlay
    showLoading();
    
    // Initialize icons
    lucide.createIcons();
    
    try {
        // Load projects from Google Sheets
        await loadProjectsFromGoogleSheets();
        
        // Initialize UI components
        initializeMap();
        initializeFilters();
        initializeTabs();
        initializeCharts();
        
        // Render initial views
        renderProjects();
        updateStats();
        updateCharts();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load projects. Please refresh the page.');
    } finally {
        hideLoading();
        // Re-initialize icons after dynamic content is loaded
        setTimeout(() => lucide.createIcons(), 500);
    }
}

// Load projects from Google Sheets
async function loadProjectsFromGoogleSheets() {
    try {
        // Method 1: Try using CSV export (works for public sheets)
        const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`;
        
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch Google Sheets data');
        }
        
        const csvText = await response.text();
        allProjects = parseCSVToProjects(csvText);
        
        // If we got projects, enhance them with coordinates
        allProjects = allProjects.map(project => {
            return enhanceProjectWithCoordinates(project);
        });
        
        filteredProjects = [...allProjects];
        
        console.log(`Loaded ${allProjects.length} projects from Google Sheets`);
        
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
        // Fallback: Load from local Excel file or use sample data
        await loadProjectsFromLocalFile();
    }
}

// Parse CSV text to project objects
function parseCSVToProjects(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    // Parse header
    const headers = parseCSVLine(lines[0]);
    const projects = [];
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;
        
        const project = {};
        headers.forEach((header, index) => {
            const key = header.toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
            project[key] = values[index]?.trim() || '';
        });
        
        // Normalize project data
        project.name = project.project_name || project.name || `Project ${i}`;
        project.description = project.description || project.project_description || '';
        project.status = normalizeStatus(project.status || project.project_status || 'Ongoing');
        project.department = project.department || project.implementing_department || '';
        project.subcounty = project.subcounty || project.sub_county || project.subcounty || '';
        project.ward = project.ward || '';
        project.budget = parseFloat(project.budget || project.total_budget || 0);
        project.expenditure = parseFloat(project.expenditure || project.amount_spent || 0);
        project.source_of_funds = project.source_of_funds || project.funding_source || '';
        project.start_date = project.start_date || project.start_date || '';
        project.completion_date = project.completion_date || project.end_date || project.expected_completion || '';
        project.location = project.location || project.project_location || '';
        
        // Determine year from start date or completion date
        const dateStr = project.start_date || project.completion_date || '';
        if (dateStr) {
            const yearMatch = dateStr.match(/(\d{4})/);
            project.year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
        } else {
            project.year = new Date().getFullYear();
        }
        
        projects.push(project);
    }
    
    return projects;
}

// Parse CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
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
    const statusLower = status.toLowerCase().trim();
    if (statusLower.includes('complete') || statusLower === 'completed') return 'Completed';
    if (statusLower.includes('ongoing') || statusLower === 'in progress') return 'Ongoing';
    if (statusLower.includes('stall') || statusLower === 'delayed') return 'Stalled';
    return 'Ongoing';
}

// Enhance project with coordinates
function enhanceProjectWithCoordinates(project) {
    // Try to extract location information
    let lat = null;
    let lng = null;
    
    // Check if coordinates are already in the data
    if (project.latitude && project.longitude) {
        lat = parseFloat(project.latitude);
        lng = parseFloat(project.longitude);
    } else if (project.coordinates) {
        // Parse coordinates string
        const coordMatch = project.coordinates.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
        if (coordMatch) {
            lat = parseFloat(coordMatch[1]);
            lng = parseFloat(coordMatch[2]);
        }
    }
    
    // If no coordinates, use geocoding based on location data
    if (!lat || !lng) {
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
    
    // If we have subcounty/ward, use approximate coordinates
    const subcounty = project.subcounty || '';
    const ward = project.ward || '';
    const location = project.location || '';
    
    // Check if it's Garissa Town
    if (isGarissaTownLocation(project)) {
        // Use slightly varied coordinates within Garissa Town
        lat = GARISSA_TOWN_CENTER[0] + (Math.random() - 0.5) * 0.05;
        lng = GARISSA_TOWN_CENTER[1] + (Math.random() - 0.5) * 0.05;
    } else if (subcounty || ward || location) {
        // Generate approximate coordinates based on location name
        // Using hash-based deterministic randomness
        const locationStr = `${subcounty}${ward}${location}`;
        const hash = locationStr.split('').reduce((acc, char) => {
            return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        
        // Spread projects across county bounds
        lat = GARISSA_COUNTY_BOUNDS[0][0] + 
              (Math.abs(hash % 100) / 100) * 
              (GARISSA_COUNTY_BOUNDS[1][0] - GARISSA_COUNTY_BOUNDS[0][0]);
        lng = GARISSA_COUNTY_BOUNDS[0][1] + 
              (Math.abs(hash % 100) / 100) * 
              (GARISSA_COUNTY_BOUNDS[1][1] - GARISSA_COUNTY_BOUNDS[0][1]);
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

// Initialize map
function initializeMap() {
    map = L.map('map').setView(GARISSA_TOWN_CENTER, 9);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Add county boundary marker
    L.marker(GARISSA_TOWN_CENTER).addTo(map)
        .bindPopup('<b>Garissa Town</b><br>County Headquarters');
    
    updateMapMarkers();
}

// Update map markers
function updateMapMarkers() {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    filteredProjects.forEach(project => {
        if (!project.latitude || !project.longitude) return;
        
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
            size = 25;
        }
        
        // Create custom icon
        const iconHtml = `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ${project.isGarissaTown ? 'animation: pulse 2s infinite;' : ''}
        "></div>`;
        
        const customIcon = L.divIcon({
            className: project.isGarissaTown ? 'garissa-town-marker' : '',
            html: iconHtml,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
        });
        
        const marker = L.marker([project.latitude, project.longitude], { icon: customIcon })
            .addTo(map)
            .bindPopup(createPopupContent(project));
        
        markers.push(marker);
    });
    
    // Fit map to show all markers
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
}

// Create popup content for map markers
function createPopupContent(project) {
    const statusClass = `status-${project.status.toLowerCase()}`;
    const budget = formatCurrency(project.budget || 0);
    
    return `
        <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">${project.name}</h3>
            <div class="${statusClass} filter-badge" style="margin-bottom: 8px;">
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
            ${project.description ? `<p style="font-size: 0.75rem; color: #6b7280; margin-top: 8px;">${project.description.substring(0, 100)}...</p>` : ''}
        </div>
    `;
}

// Initialize filters
function initializeFilters() {
    // Populate filter dropdowns
    populateFilterDropdowns();
    
    // Setup filter event listeners
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('status-filter').addEventListener('change', applyFilters);
    document.getElementById('subcounty-filter').addEventListener('change', applyFilters);
    document.getElementById('ward-filter').addEventListener('change', applyFilters);
    document.getElementById('department-filter').addEventListener('change', applyFilters);
    document.getElementById('budget-filter').addEventListener('change', applyFilters);
    document.getElementById('year-filter').addEventListener('change', applyFilters);
    document.getElementById('funding-filter').addEventListener('change', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
}

// Populate filter dropdowns
function populateFilterDropdowns() {
    // Get unique values from projects
    const subcounties = [...new Set(allProjects.map(p => p.subcounty).filter(Boolean))].sort();
    const wards = [...new Set(allProjects.map(p => p.ward).filter(Boolean))].sort();
    const departments = [...new Set(allProjects.map(p => p.department).filter(Boolean))].sort();
    const fundingSources = [...new Set(allProjects.map(p => p.source_of_funds).filter(Boolean))].filter(Boolean).sort();
    const years = [...new Set(allProjects.map(p => p.year).filter(Boolean))].sort((a, b) => b - a);
    
    // Populate subcounties
    const subcountySelect = document.getElementById('subcounty-filter');
    subcounties.forEach(subcounty => {
        const option = document.createElement('option');
        option.value = subcounty;
        option.textContent = subcounty;
        subcountySelect.appendChild(option);
    });
    
    // Populate wards
    const wardSelect = document.getElementById('ward-filter');
    wards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward;
        option.textContent = ward;
        wardSelect.appendChild(option);
    });
    
    // Populate departments
    const deptSelect = document.getElementById('department-filter');
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptSelect.appendChild(option);
    });
    
    // Populate funding sources
    const fundingSelect = document.getElementById('funding-filter');
    fundingSources.forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        fundingSelect.appendChild(option);
    });
    
    // Populate years
    const yearSelect = document.getElementById('year-filter');
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const status = document.getElementById('status-filter').value;
    const subcounty = document.getElementById('subcounty-filter').value;
    const ward = document.getElementById('ward-filter').value;
    const department = document.getElementById('department-filter').value;
    const budgetRange = document.getElementById('budget-filter').value;
    const year = document.getElementById('year-filter').value;
    const funding = document.getElementById('funding-filter').value;
    
    filteredProjects = allProjects.filter(project => {
        // Search filter
        if (search) {
            const searchable = `${project.name} ${project.description} ${project.location} ${project.subcounty} ${project.ward}`.toLowerCase();
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
            const [min, max] = budgetRange.split('-').map(v => parseInt(v));
            const budget = project.budget || 0;
            if (budget < min || (max && budget > max)) return false;
        }
        
        // Year filter
        if (year && project.year !== parseInt(year)) return false;
        
        // Funding source filter
        if (funding && project.source_of_funds !== funding) return false;
        
        return true;
    });
    
    // Update active filters display
    updateActiveFilters(search, status, subcounty, ward, department, budgetRange, year, funding);
    
    // Update views
    renderProjects();
    updateMapMarkers();
    updateStats();
    updateCharts();
}

// Update active filters display
function updateActiveFilters(search, status, subcounty, ward, department, budgetRange, year, funding) {
    const container = document.getElementById('active-filters');
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
            badge.className = 'filter-badge bg-blue-100 text-blue-800';
            badge.textContent = `${filter.label}: ${filter.value}`;
            container.appendChild(badge);
        }
    });
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('subcounty-filter').value = '';
    document.getElementById('ward-filter').value = '';
    document.getElementById('department-filter').value = '';
    document.getElementById('budget-filter').value = '';
    document.getElementById('year-filter').value = '';
    document.getElementById('funding-filter').value = '';
    
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
    activeButton.classList.add('active', 'border-red-600', 'text-red-600');
    activeButton.classList.remove('border-transparent', 'text-gray-500');
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Initialize tab-specific content
    if (tabName === 'analytics') {
        updateCharts();
    }
}

// Render projects list
function renderProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';
    
    if (filteredProjects.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i data-lucide="folder-x" class="w-16 h-16 mx-auto text-gray-400 mb-4"></i>
                <p class="text-gray-600 text-lg">No projects found matching your filters.</p>
                <p class="text-gray-500 text-sm mt-2">Try adjusting your search criteria.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    // Group projects by status
    const grouped = {
        'Completed': filteredProjects.filter(p => p.status === 'Completed'),
        'Ongoing': filteredProjects.filter(p => p.status === 'Ongoing'),
        'Stalled': filteredProjects.filter(p => p.status === 'Stalled')
    };
    
    // Render each group
    Object.entries(grouped).forEach(([status, projects]) => {
        if (projects.length === 0) return;
        
        const statusClass = `status-${status.toLowerCase()}`;
        const statusColor = status === 'Completed' ? 'green' : status === 'Ongoing' ? 'yellow' : 'red';
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'mb-8';
        groupDiv.innerHTML = `
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span class="filter-badge ${statusClass} mr-2">${status}</span>
                <span class="text-gray-600">(${projects.length} projects)</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${projects.map(project => createProjectCard(project)).join('')}
            </div>
        `;
        container.appendChild(groupDiv);
    });
    
    lucide.createIcons();
}

// Create project card
function createProjectCard(project) {
    const statusClass = `status-${project.status.toLowerCase()}`;
    const budget = formatCurrency(project.budget || 0);
    
    return `
        <div class="project-card bg-white rounded-lg shadow-md p-6 border-l-4 ${
            project.status === 'Completed' ? 'border-green-500' :
            project.status === 'Ongoing' ? 'border-yellow-500' : 'border-red-500'
        }">
            <div class="flex items-start justify-between mb-3">
                <h4 class="font-bold text-gray-800 text-lg flex-1">${project.name}</h4>
                ${project.isGarissaTown ? '<span class="text-purple-600 text-xs font-semibold ml-2">📍 Town</span>' : ''}
            </div>
            <div class="${statusClass} filter-badge mb-3">${project.status}</div>
            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${project.description || 'No description available'}</p>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">Department:</span>
                    <span class="font-medium text-gray-800">${project.department || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Location:</span>
                    <span class="font-medium text-gray-800">${project.subcounty || 'N/A'}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Budget:</span>
                    <span class="font-medium text-gray-800">${budget}</span>
                </div>
            </div>
        </div>
    `;
}

// Update statistics
function updateStats() {
    document.getElementById('total-projects').textContent = filteredProjects.length;
    document.getElementById('completed-projects').textContent = 
        filteredProjects.filter(p => p.status === 'Completed').length;
    document.getElementById('ongoing-projects').textContent = 
        filteredProjects.filter(p => p.status === 'Ongoing').length;
    document.getElementById('stalled-projects').textContent = 
        filteredProjects.filter(p => p.status === 'Stalled').length;
}

// Initialize charts
function initializeCharts() {
    // Status chart
    const statusCtx = document.getElementById('status-chart');
    if (statusCtx) {
        charts.status = new Chart(statusCtx, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    // Department chart
    const deptCtx = document.getElementById('department-chart');
    if (deptCtx) {
        charts.department = new Chart(deptCtx, {
            type: 'bar',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
            options: { responsive: true, maintainAspectRatio: true, indexAxis: 'y' }
        });
    }
    
    // Budget chart
    const budgetCtx = document.getElementById('budget-chart');
    if (budgetCtx) {
        charts.budget = new Chart(budgetCtx, {
            type: 'pie',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    // Subcounty chart
    const subcountyCtx = document.getElementById('subcounty-chart');
    if (subcountyCtx) {
        charts.subcounty = new Chart(subcountyCtx, {
            type: 'bar',
            data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
            options: { responsive: true, maintainAspectRatio: true }
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

// Setup event listeners
function setupEventListeners() {
    // Export buttons
    document.getElementById('export-excel').addEventListener('click', exportToExcel);
    document.getElementById('export-pdf').addEventListener('click', exportToPDF);
    document.getElementById('generate-map-report').addEventListener('click', generateMapReport);
    
    // Report cards
    document.querySelectorAll('.report-card').forEach(card => {
        card.addEventListener('click', () => {
            const reportType = card.dataset.report;
            generateReport(reportType);
        });
    });
}

// Export to Excel
function exportToExcel() {
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
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');
    XLSX.writeFile(wb, `garissa-projects-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export to PDF (simple text version)
function exportToPDF() {
    // For a full PDF export, you'd need a library like jsPDF
    // For now, we'll create a simple text report
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
    exportToExcel(); // Use Excel export for now
}

// Generate specific report
function generateReport(type) {
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
    
    // Create report data
    const data = projects.map(p => ({
        'Project Name': p.name,
        'Status': p.status,
        'Department': p.department,
        'Location': `${p.subcounty || ''} ${p.ward || ''}`,
        'Budget': p.budget,
        'Expenditure': p.expenditure
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${type}-report`);
    XLSX.writeFile(wb, `garissa-${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Load projects from local file (fallback)
async function loadProjectsFromLocalFile() {
    // This would load from a local JSON or CSV file
    // For now, return empty array
    allProjects = [];
    filteredProjects = [];
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0
    }).format(amount);
}

function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function showError(message) {
    alert(message); // In production, use a better error display
}

