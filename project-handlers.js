// Project Management Handlers for Garissa County PMD

// Show project form modal
function handleShowProjectModal(project = null) {
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    const formContent = document.getElementById('project-form-content');
    
    form.reset();
    document.getElementById('project-id').value = '';
    
    // Generate form HTML
    formContent.innerHTML = generateProjectFormHTML(project);
    
    // Set form values if editing
    if (project) {
        document.getElementById('project-modal-title').innerHTML = `
            <div class="flex items-center">
                <img src="Garissa_logo.png" alt="Logo" class="w-8 h-8 rounded-full mr-3 border-2 border-white">
                <span>Edit Project</span>
            </div>
        `;
        populateProjectForm(project);
    } else {
        document.getElementById('project-modal-title').innerHTML = `
            <div class="flex items-center">
                <img src="Garissa_logo.png" alt="Logo" class="w-8 h-8 rounded-full mr-3 border-2 border-white">
                <span>Add New Project</span>
            </div>
        `;
    }
    
    // Add event listeners for dynamic fields
    setupProjectFormEventListeners();
    
    modal.classList.remove('hidden');
}

// Generate project form HTML
function generateProjectFormHTML(project = null) {
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <!-- Project Details -->
            <div class="md:col-span-2 font-bold text-lg text-red-800 border-b pb-2 mb-2">1. Project Details</div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Project Name/Title *</label>
                <input type="text" id="project-name" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Project Description *</label>
                <textarea id="project-description" rows="3" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required></textarea>
            </div>
            
            <!-- Location Details -->
            <div class="md:col-span-2 font-bold text-lg text-red-800 border-b pb-2 mb-2 mt-4">2. Location</div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Sub-County *</label>
                <select id="project-subcounty" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                    <option value="">Select Sub-County</option>
                    ${GARISSA_DATA.subcounties.map(sc => `<option value="${sc}">${sc}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Ward *</label>
                <select id="project-ward" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                    <option value="">Select Ward</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Latitude *</label>
                <input type="number" step="any" id="project-lat" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Longitude *</label>
                <input type="number" step="any" id="project-lon" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
            </div>

            <!-- Implementation Details -->
            <div class="md:col-span-2 font-bold text-lg text-red-800 border-b pb-2 mb-2 mt-4">3. Implementation</div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Department *</label>
                <select id="project-department" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                    <option value="">Select Department</option>
                    ${DEPARTMENTS.map(dept => `<option value="${dept}">${dept}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Current Status *</label>
                <select id="project-status" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
                    ${PROJECT_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" id="project-start-date" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Expected Completion Date</label>
                <input type="date" id="project-completion-date" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500">
            </div>

            <!-- Financial Information -->
            <div class="md:col-span-2 font-bold text-lg text-red-800 border-b pb-2 mb-2 mt-4">4. Financials</div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Approved Budget (KSh) *</label>
                <input type="number" id="project-budget" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" required>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Expenditure to Date (KSh)</label>
                <input type="number" id="project-expenditure" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500">
            </div>
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Source of Funds</label>
                <input type="text" id="project-source-funds" class="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500" value="Garissa County Government">
            </div>
        </div>
        <div class="p-6 bg-gray-50 mt-6 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" id="cancel-project-form" class="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" class="btn-primary font-bold py-2 px-4 rounded-lg">Save Project</button>
        </div>
    `;
}

// Populate project form with existing data
function populateProjectForm(project) {
    document.getElementById('project-id').value = project.id;
    document.getElementById('project-name').value = project.name || '';
    document.getElementById('project-description').value = project.description || '';
    document.getElementById('project-subcounty').value = project.subCounty || '';
    document.getElementById('project-ward').value = project.ward || '';
    document.getElementById('project-lat').value = project.location?.latitude || '';
    document.getElementById('project-lon').value = project.location?.longitude || '';
    document.getElementById('project-department').value = project.department || '';
    document.getElementById('project-status').value = project.status || 'Planning';
    document.getElementById('project-start-date').value = project.startDate || '';
    document.getElementById('project-completion-date').value = project.expectedCompletionDate || '';
    document.getElementById('project-budget').value = project.budget || '';
    document.getElementById('project-expenditure').value = project.expenditure || '';
    document.getElementById('project-source-funds').value = project.sourceOfFunds || 'Garissa County Government';
}

// Setup project form event listeners
function setupProjectFormEventListeners() {
    // Sub-county change handler
    const subcountySelect = document.getElementById('project-subcounty');
    const wardSelect = document.getElementById('project-ward');
    
    subcountySelect.addEventListener('change', function() {
        const selectedSubcounty = this.value;
        wardSelect.innerHTML = '<option value="">Select Ward</option>';
        
        if (selectedSubcounty && GARISSA_DATA.wards[selectedSubcounty]) {
            GARISSA_DATA.wards[selectedSubcounty].forEach(ward => {
                const option = document.createElement('option');
                option.value = ward;
                option.textContent = ward;
                wardSelect.appendChild(option);
            });
            
            // Auto-fill coordinates
            if (GARISSA_DATA.coordinates[selectedSubcounty]) {
                const coords = GARISSA_DATA.coordinates[selectedSubcounty];
                document.getElementById('project-lat').value = coords.lat;
                document.getElementById('project-lon').value = coords.lng;
            }
        }
    });
    
    // Ward change handler
    wardSelect.addEventListener('change', function() {
        const selectedWard = this.value;
        const selectedSubcounty = subcountySelect.value;
        
        if (selectedWard && selectedSubcounty) {
            const coords = utils.getWardCoordinates(selectedSubcounty, selectedWard);
            document.getElementById('project-lat').value = coords.lat;
            document.getElementById('project-lon').value = coords.lng;
        }
    });
}

// Handle project form submission
async function handleProjectFormSubmit(e) {
    e.preventDefault();
    const projectId = document.getElementById('project-id').value;
    
    const projectData = {
        name: document.getElementById('project-name').value.trim(),
        description: document.getElementById('project-description').value.trim(),
        subCounty: document.getElementById('project-subcounty').value,
        ward: document.getElementById('project-ward').value,
        location: new GeoPoint(
            parseFloat(document.getElementById('project-lat').value) || 0,
            parseFloat(document.getElementById('project-lon').value) || 0
        ),
        department: document.getElementById('project-department').value,
        status: document.getElementById('project-status').value,
        startDate: document.getElementById('project-start-date').value,
        expectedCompletionDate: document.getElementById('project-completion-date').value,
        budget: parseFloat(document.getElementById('project-budget').value) || 0,
        expenditure: parseFloat(document.getElementById('project-expenditure').value) || 0,
        sourceOfFunds: document.getElementById('project-source-funds').value.trim(),
        lastUpdated: new Date().toISOString(),
        updatedBy: userData.email
    };

    // Validate required fields
    if (!projectData.name || !projectData.description || !projectData.ward || !projectData.department) {
        customAlert("Please fill in all required fields.", "Validation Error", "error");
        return;
    }

    try {
        if (projectId) {
            await updateDoc(doc(db, "projects", projectId), projectData);
            customAlert("Project updated successfully!", "Success", "success");
        } else {
            projectData.projectId = utils.generateProjectId();
            projectData.createdAt = new Date().toISOString();
            projectData.createdBy = userData.email;
            await addDoc(collection(db, "projects"), projectData);
            customAlert("Project added successfully!", "Success", "success");
        }
        document.getElementById('project-modal').classList.add('hidden');
    } catch (error) {
        console.error("Error saving project: ", error);
        customAlert("Error saving project. Please try again.", "Error", "error");
    }
}

// Handle edit project
async function handleEditProject(e) {
    const projectId = e.currentTarget.dataset.id;
    const project = projectsCache.find(p => p.id === projectId);
    if (project) {
        handleShowProjectModal(project);
    }
}

// Handle delete project
async function handleDeleteProject(e) {
    const projectId = e.currentTarget.dataset.id;
    const project = projectsCache.find(p => p.id === projectId);
    
    if (!project) return;
    
    const confirmed = await customConfirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
        "Delete Project"
    );
    
    if (confirmed) {
        try {
            await deleteDoc(doc(db, "projects", projectId));
            customAlert("Project deleted successfully.", "Success", "success");
        } catch (error) {
            console.error("Error deleting project: ", error);
            customAlert("Error deleting project.", "Error", "error");
        }
    }
}

// Handle CSV upload
function handleCsvUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const csv = event.target.result;
            const projects = parseCSV(csv);
            
            if (projects.length === 0) {
                customAlert("No valid projects found in CSV file.", "Upload Error", "error");
                return;
            }
            
            const confirmed = await customConfirm(
                `Found ${projects.length} projects in the CSV. Do you want to upload them?`,
                "Confirm Upload"
            );
            
            if (confirmed) {
                await uploadProjectsBatch(projects);
            }
        } catch (error) {
            console.error("Error processing CSV:", error);
            customAlert("Error processing CSV file. Please check the format.", "Upload Error", "error");
        }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset input
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const projects = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length !== headers.length) continue;
        
        const project = {};
        headers.forEach((header, index) => {
            project[header] = values[index] || '';
        });
        
        // Validate required fields
        if (project.ProjectName && project.Department && project.Ward) {
            projects.push(project);
        }
    }
    
    return projects;
}

// Upload projects in batch
async function uploadProjectsBatch(projects) {
    try {
        const batch = writeBatch(db);
        const uploadCount = Math.min(projects.length, 500); // Firestore batch limit
        
        for (let i = 0; i < uploadCount; i++) {
            const project = projects[i];
            const newProjectRef = doc(collection(db, "projects"));
            
            const projectData = {
                name: project.ProjectName || 'Untitled Project',
                description: project.ProjectDescription || '',
                subCounty: project.SubCounty || '',
                ward: project.Ward || '',
                location: new GeoPoint(
                    parseFloat(project.Latitude) || -0.4569,
                    parseFloat(project.Longitude) || 39.6463
                ),
                department: project.Department || '',
                status: project.Status || 'Planning',
                startDate: project.StartDate || '',
                expectedCompletionDate: project.ExpectedCompletionDate || '',
                budget: parseFloat(project.Budget) || 0,
                expenditure: parseFloat(project.Expenditure) || 0,
                sourceOfFunds: project.SourceOfFunds || 'Garissa County Government',
                createdAt: new Date().toISOString(),
                createdBy: userData.email,
                lastUpdated: new Date().toISOString(),
                updatedBy: userData.email,
                projectId: utils.generateProjectId()
            };
            
            batch.set(newProjectRef, projectData);
        }
        
        await batch.commit();
        customAlert(`${uploadCount} projects uploaded successfully!`, "Upload Complete", "success");
        
        // Upload remaining projects if any
        if (projects.length > uploadCount) {
            const remainingProjects = projects.slice(uploadCount);
            setTimeout(() => uploadProjectsBatch(remainingProjects), 1000);
        }
    } catch (error) {
        console.error("Error uploading projects:", error);
        customAlert("Error uploading projects. Please try again.", "Upload Error", "error");
    }
}

// Apply filters to projects table
function applyFilters() {
    const searchTerm = document.getElementById('project-search').value.toLowerCase();
    const department = document.getElementById('department-filter').value;
    const status = document.getElementById('status-filter').value;

    const filteredProjects = projectsCache.filter(p => {
        const matchesSearch = !searchTerm || 
            p.name.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm) ||
            p.ward.toLowerCase().includes(searchTerm);
        const matchesDept = !department || p.department === department;
        const matchesStatus = !status || p.status === status;
        return matchesSearch && matchesDept && matchesStatus;
    });
    
    renderProjectsTable(filteredProjects);
}
