// Lightweight Database for Garissa County Projects
// Uses IndexedDB for efficient storage and retrieval of 800+ projects

class ProjectsDatabase {
    constructor() {
        this.dbName = 'GarissaProjectsDB';
        this.version = 1;
        this.storeName = 'projects';
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ Database initialized');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: false });
                    objectStore.createIndex('name', 'name', { unique: false });
                    objectStore.createIndex('status', 'status', { unique: false });
                    objectStore.createIndex('department', 'department', { unique: false });
                    objectStore.createIndex('subcounty', 'subcounty', { unique: false });
                    objectStore.createIndex('ward', 'ward', { unique: false });
                    objectStore.createIndex('year', 'year', { unique: false });
                    console.log('✅ Database schema created');
                }
            };
        });
    }

    // Store all projects
    async storeProjects(projects) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Clear existing data
            store.clear();

            // Add all projects
            let completed = 0;
            let errors = 0;

            projects.forEach((project, index) => {
                if (!project.id) {
                    project.id = `project-${Date.now()}-${index}`;
                }

                const request = store.add(project);
                request.onsuccess = () => {
                    completed++;
                    if (completed + errors === projects.length) {
                        console.log(`✅ Stored ${completed} projects in database`);
                        resolve(completed);
                    }
                };
                request.onerror = () => {
                    errors++;
                    if (completed + errors === projects.length) {
                        console.log(`⚠️ Stored ${completed} projects, ${errors} errors`);
                        resolve(completed);
                    }
                };
            });
        });
    }

    // Get all projects
    async getAllProjects() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                console.log(`✅ Retrieved ${request.result.length} projects from database`);
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get projects by filter
    async getFilteredProjects(filters) {
        const allProjects = await this.getAllProjects();
        return this.applyFilters(allProjects, filters);
    }

    // Apply filters to projects
    applyFilters(projects, filters) {
        return projects.filter(project => {
            // Search filter
            if (filters.search) {
                const searchable = `${project.name} ${project.description} ${project.location} ${project.subcounty} ${project.ward} ${project.department}`.toLowerCase();
                if (!searchable.includes(filters.search.toLowerCase())) return false;
            }

            // Status filter
            if (filters.status && project.status !== filters.status) return false;

            // Subcounty filter
            if (filters.subcounty && project.subcounty !== filters.subcounty) return false;

            // Ward filter
            if (filters.ward && project.ward !== filters.ward) return false;

            // Department filter
            if (filters.department && project.department !== filters.department) return false;

            // Budget range filter
            if (filters.budgetRange) {
                const [min, max] = filters.budgetRange.split('-').map(v => parseInt(v) || 0);
                const budget = project.budget || 0;
                if (budget < min || (max && max < 999999999 && budget > max)) return false;
            }

            // Year filter
            if (filters.year && project.year !== parseInt(filters.year)) return false;

            // Funding source filter
            if (filters.funding && project.source_of_funds !== filters.funding) return false;

            return true;
        });
    }

    // Get project by ID
    async getProjectById(id) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get statistics
    async getStatistics() {
        const projects = await this.getAllProjects();
        return {
            total: projects.length,
            completed: projects.filter(p => p.status === 'Completed').length,
            ongoing: projects.filter(p => p.status === 'Ongoing').length,
            stalled: projects.filter(p => p.status === 'Stalled').length
        };
    }

    // Clear database
    async clear() {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('✅ Database cleared');
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Export singleton instance
const projectsDB = new ProjectsDatabase();

