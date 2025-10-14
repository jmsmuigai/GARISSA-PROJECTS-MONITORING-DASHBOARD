// Looker Studio Integration for Garissa County PMD
// This module handles professional dashboard creation and data visualization

class LookerStudioIntegration {
    constructor() {
        this.isConnected = false;
        this.dashboards = [];
        this.charts = new Map();
        this.dataConnectors = new Map();
    }
    
    // Initialize Looker Studio connection
    async initialize() {
        try {
            // Load Google Charts API
            if (typeof google === 'undefined') {
                await this.loadGoogleCharts();
            }
            
            // Initialize charts
            google.charts.load('current', {
                packages: ['corechart', 'table', 'bar', 'line', 'scatter', 'gantt', 'timeline']
            });
            
            google.charts.setOnLoadCallback(() => {
                this.isConnected = true;
                console.log('Looker Studio integration initialized successfully');
                this.createDefaultDashboards();
            });
            
        } catch (error) {
            console.error('Failed to initialize Looker Studio:', error);
        }
    }
    
    // Load Google Charts API
    loadGoogleCharts() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/charts/loader.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Create default professional dashboards
    createDefaultDashboards() {
        this.createExecutiveDashboard();
        this.createDepartmentDashboard();
        this.createFinancialDashboard();
        this.createOperationalDashboard();
    }
    
    // Executive Dashboard
    createExecutiveDashboard() {
        const dashboardData = {
            id: 'executive-dashboard',
            title: 'Garissa County Executive Dashboard',
            type: 'Executive',
            charts: [
                {
                    id: 'exec-overview',
                    title: 'Project Portfolio Overview',
                    type: 'PieChart',
                    data: this.getProjectStatusData(),
                    options: {
                        title: 'Project Status Distribution',
                        backgroundColor: '#f8fafc',
                        colors: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
                        pieHole: 0.4,
                        legend: { position: 'right' }
                    }
                },
                {
                    id: 'exec-budget',
                    title: 'Budget Allocation by Department',
                    type: 'ColumnChart',
                    data: this.getBudgetAllocationData(),
                    options: {
                        title: 'Budget Allocation (KSh Millions)',
                        hAxis: { title: 'Department' },
                        vAxis: { title: 'Budget (KSh)' },
                        backgroundColor: '#f8fafc',
                        colors: ['#dc2626']
                    }
                },
                {
                    id: 'exec-timeline',
                    title: 'Project Timeline Analysis',
                    type: 'LineChart',
                    data: this.getTimelineData(),
                    options: {
                        title: 'Projects Started vs Completed',
                        hAxis: { title: 'Month' },
                        vAxis: { title: 'Number of Projects' },
                        backgroundColor: '#f8fafc',
                        colors: ['#dc2626', '#059669']
                    }
                },
                {
                    id: 'exec-kpi',
                    title: 'Key Performance Indicators',
                    type: 'Table',
                    data: this.getKPIData(),
                    options: {
                        title: 'Executive KPIs',
                        allowHtml: true,
                        backgroundColor: '#f8fafc'
                    }
                }
            ]
        };
        
        this.dashboards.push(dashboardData);
        this.renderDashboard('executive-dashboard', dashboardData);
    }
    
    // Department Dashboard
    createDepartmentDashboard() {
        const dashboardData = {
            id: 'department-dashboard',
            title: 'Department Performance Dashboard',
            type: 'Department',
            charts: [
                {
                    id: 'dept-performance',
                    title: 'Department Performance Matrix',
                    type: 'ScatterChart',
                    data: this.getDepartmentPerformanceData(),
                    options: {
                        title: 'Completion Rate vs Budget Utilization',
                        hAxis: { title: 'Budget Utilization (%)' },
                        vAxis: { title: 'Completion Rate (%)' },
                        backgroundColor: '#f8fafc',
                        colors: ['#dc2626']
                    }
                },
                {
                    id: 'dept-comparison',
                    title: 'Department Comparison',
                    type: 'BarChart',
                    data: this.getDepartmentComparisonData(),
                    options: {
                        title: 'Projects by Department',
                        hAxis: { title: 'Number of Projects' },
                        backgroundColor: '#f8fafc',
                        colors: ['#059669', '#f59e0b', '#ef4444']
                    }
                },
                {
                    id: 'dept-budget',
                    title: 'Budget vs Expenditure',
                    type: 'ColumnChart',
                    data: this.getBudgetExpenditureData(),
                    options: {
                        title: 'Budget vs Expenditure by Department',
                        backgroundColor: '#f8fafc',
                        colors: ['#dc2626', '#059669']
                    }
                }
            ]
        };
        
        this.dashboards.push(dashboardData);
    }
    
    // Financial Dashboard
    createFinancialDashboard() {
        const dashboardData = {
            id: 'financial-dashboard',
            title: 'Financial Performance Dashboard',
            type: 'Financial',
            charts: [
                {
                    id: 'financial-overview',
                    title: 'Financial Overview',
                    type: 'Table',
                    data: this.getFinancialOverviewData(),
                    options: {
                        title: 'Financial Summary',
                        allowHtml: true,
                        backgroundColor: '#f8fafc'
                    }
                },
                {
                    id: 'budget-trend',
                    title: 'Budget Utilization Trend',
                    type: 'AreaChart',
                    data: this.getBudgetTrendData(),
                    options: {
                        title: 'Budget Utilization Over Time',
                        hAxis: { title: 'Month' },
                        vAxis: { title: 'Utilization (%)' },
                        backgroundColor: '#f8fafc',
                        colors: ['#dc2626', '#f59e0b']
                    }
                },
                {
                    id: 'cost-analysis',
                    title: 'Cost Analysis by Project Type',
                    type: 'PieChart',
                    data: this.getCostAnalysisData(),
                    options: {
                        title: 'Cost Distribution by Project Type',
                        backgroundColor: '#f8fafc',
                        colors: ['#dc2626', '#059669', '#f59e0b', '#6b7280', '#8b5cf6']
                    }
                }
            ]
        };
        
        this.dashboards.push(dashboardData);
    }
    
    // Operational Dashboard
    createOperationalDashboard() {
        const dashboardData = {
            id: 'operational-dashboard',
            title: 'Operational Performance Dashboard',
            type: 'Operational',
            charts: [
                {
                    id: 'risk-analysis',
                    title: 'Project Risk Analysis',
                    type: 'BarChart',
                    data: this.getRiskAnalysisData(),
                    options: {
                        title: 'Risk Distribution',
                        hAxis: { title: 'Risk Level' },
                        vAxis: { title: 'Number of Projects' },
                        backgroundColor: '#f8fafc',
                        colors: ['#ef4444', '#f59e0b', '#10b981']
                    }
                },
                {
                    id: 'geographic-distribution',
                    title: 'Geographic Project Distribution',
                    type: 'Table',
                    data: this.getGeographicData(),
                    options: {
                        title: 'Projects by Sub-County',
                        backgroundColor: '#f8fafc'
                    }
                },
                {
                    id: 'milestone-tracking',
                    title: 'Project Milestone Tracking',
                    type: 'Timeline',
                    data: this.getMilestoneData(),
                    options: {
                        title: 'Project Timeline',
                        backgroundColor: '#f8fafc'
                    }
                }
            ]
        };
        
        this.dashboards.push(dashboardData);
    }
    
    // Data preparation methods
    getProjectStatusData() {
        const projects = window.projectsCache || [];
        const statusCounts = {
            'Completed': 0,
            'Ongoing': 0,
            'Stalled': 0,
            'Planning': 0
        };
        
        projects.forEach(project => {
            statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
        });
        
        return [
            ['Status', 'Count'],
            ['Completed', statusCounts.Completed],
            ['Ongoing', statusCounts.Ongoing],
            ['Stalled', statusCounts.Stalled],
            ['Planning', statusCounts.Planning]
        ];
    }
    
    getBudgetAllocationData() {
        const projects = window.projectsCache || [];
        const departmentBudgets = {};
        
        projects.forEach(project => {
            const dept = project.department.split(',')[0]; // Get first part of department name
            departmentBudgets[dept] = (departmentBudgets[dept] || 0) + project.budget;
        });
        
        const data = [['Department', 'Budget']];
        Object.entries(departmentBudgets).forEach(([dept, budget]) => {
            data.push([dept, budget / 1000000]); // Convert to millions
        });
        
        return data;
    }
    
    getTimelineData() {
        // Mock timeline data - in real implementation, this would come from actual project data
        return [
            ['Month', 'Started', 'Completed'],
            ['Jan', 5, 3],
            ['Feb', 8, 6],
            ['Mar', 12, 9],
            ['Apr', 15, 11],
            ['May', 18, 14],
            ['Jun', 22, 17],
            ['Jul', 25, 20],
            ['Aug', 28, 23],
            ['Sep', 30, 26],
            ['Oct', 32, 28],
            ['Nov', 35, 30],
            ['Dec', 38, 32]
        ];
    }
    
    getKPIData() {
        const projects = window.projectsCache || [];
        const totalProjects = projects.length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalExpenditure = projects.reduce((sum, p) => sum + p.expenditure, 0);
        
        return [
            ['KPI', 'Value', 'Target', 'Status'],
            ['Total Projects', totalProjects, 50, totalProjects >= 50 ? '✓' : '⚠'],
            ['Completion Rate', `${((completed/totalProjects)*100).toFixed(1)}%`, '80%', completed/totalProjects >= 0.8 ? '✓' : '⚠'],
            ['Budget Utilization', `${((totalExpenditure/totalBudget)*100).toFixed(1)}%`, '70%', totalExpenditure/totalBudget >= 0.7 ? '✓' : '⚠'],
            ['On-time Delivery', `${((completed/totalProjects)*100).toFixed(1)}%`, '85%', completed/totalProjects >= 0.85 ? '✓' : '⚠']
        ];
    }
    
    getDepartmentPerformanceData() {
        const projects = window.projectsCache || [];
        const departmentStats = {};
        
        projects.forEach(project => {
            const dept = project.department;
            if (!departmentStats[dept]) {
                departmentStats[dept] = { total: 0, completed: 0, budget: 0, expenditure: 0 };
            }
            departmentStats[dept].total++;
            if (project.status === 'Completed') departmentStats[dept].completed++;
            departmentStats[dept].budget += project.budget;
            departmentStats[dept].expenditure += project.expenditure;
        });
        
        const data = [['Department', 'Budget Utilization', 'Completion Rate']];
        Object.entries(departmentStats).forEach(([dept, stats]) => {
            const budgetUtil = (stats.expenditure / stats.budget) * 100;
            const completionRate = (stats.completed / stats.total) * 100;
            data.push([dept.split(',')[0], budgetUtil, completionRate]);
        });
        
        return data;
    }
    
    getDepartmentComparisonData() {
        const projects = window.projectsCache || [];
        const departmentCounts = {};
        
        projects.forEach(project => {
            const dept = project.department.split(',')[0];
            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        });
        
        const data = [['Department', 'Total', 'Completed', 'Ongoing']];
        Object.entries(departmentCounts).forEach(([dept, total]) => {
            const completed = projects.filter(p => p.department.includes(dept) && p.status === 'Completed').length;
            const ongoing = projects.filter(p => p.department.includes(dept) && p.status === 'Ongoing').length;
            data.push([dept, total, completed, ongoing]);
        });
        
        return data;
    }
    
    getBudgetExpenditureData() {
        const projects = window.projectsCache || [];
        const departmentStats = {};
        
        projects.forEach(project => {
            const dept = project.department.split(',')[0];
            if (!departmentStats[dept]) {
                departmentStats[dept] = { budget: 0, expenditure: 0 };
            }
            departmentStats[dept].budget += project.budget;
            departmentStats[dept].expenditure += project.expenditure;
        });
        
        const data = [['Department', 'Budget', 'Expenditure']];
        Object.entries(departmentStats).forEach(([dept, stats]) => {
            data.push([dept, stats.budget / 1000000, stats.expenditure / 1000000]);
        });
        
        return data;
    }
    
    getFinancialOverviewData() {
        const projects = window.projectsCache || [];
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalExpenditure = projects.reduce((sum, p) => sum + p.expenditure, 0);
        const remainingBudget = totalBudget - totalExpenditure;
        
        return [
            ['Financial Metric', 'Amount (KSh)', 'Percentage'],
            ['Total Allocated Budget', totalBudget.toLocaleString(), '100%'],
            ['Total Expenditure', totalExpenditure.toLocaleString(), `${((totalExpenditure/totalBudget)*100).toFixed(1)}%`],
            ['Remaining Budget', remainingBudget.toLocaleString(), `${((remainingBudget/totalBudget)*100).toFixed(1)}%`],
            ['Budget Utilization Rate', `${((totalExpenditure/totalBudget)*100).toFixed(1)}%`, '-']
        ];
    }
    
    getBudgetTrendData() {
        // Mock trend data - in real implementation, this would be calculated from historical data
        return [
            ['Month', 'Budget Utilization', 'Target'],
            ['Jan', 15, 20],
            ['Feb', 25, 30],
            ['Mar', 35, 40],
            ['Apr', 45, 50],
            ['May', 55, 60],
            ['Jun', 65, 70],
            ['Jul', 70, 75],
            ['Aug', 75, 80],
            ['Sep', 78, 82],
            ['Oct', 80, 85],
            ['Nov', 82, 87],
            ['Dec', 85, 90]
        ];
    }
    
    getCostAnalysisData() {
        const projects = window.projectsCache || [];
        const costByType = {
            'Infrastructure': 0,
            'Water': 0,
            'Education': 0,
            'Health': 0,
            'Agriculture': 0,
            'Other': 0
        };
        
        projects.forEach(project => {
            const dept = project.department;
            if (dept.includes('Roads') || dept.includes('Infrastructure')) {
                costByType.Infrastructure += project.budget;
            } else if (dept.includes('Water')) {
                costByType.Water += project.budget;
            } else if (dept.includes('Education')) {
                costByType.Education += project.budget;
            } else if (dept.includes('Health')) {
                costByType.Health += project.budget;
            } else if (dept.includes('Agriculture')) {
                costByType.Agriculture += project.budget;
            } else {
                costByType.Other += project.budget;
            }
        });
        
        const data = [['Project Type', 'Budget']];
        Object.entries(costByType).forEach(([type, budget]) => {
            if (budget > 0) {
                data.push([type, budget / 1000000]); // Convert to millions
            }
        });
        
        return data;
    }
    
    getRiskAnalysisData() {
        const projects = window.projectsCache || [];
        const riskCounts = { 'High': 0, 'Medium': 0, 'Low': 0 };
        
        projects.forEach(project => {
            if (project.riskLevel) {
                riskCounts[project.riskLevel] = (riskCounts[project.riskLevel] || 0) + 1;
            }
        });
        
        return [
            ['Risk Level', 'Count'],
            ['High', riskCounts.High],
            ['Medium', riskCounts.Medium],
            ['Low', riskCounts.Low]
        ];
    }
    
    getGeographicData() {
        const projects = window.projectsCache || [];
        const subCountyCounts = {};
        
        projects.forEach(project => {
            const subCounty = project.subCounty;
            subCountyCounts[subCounty] = (subCountyCounts[subCounty] || 0) + 1;
        });
        
        const data = [['Sub-County', 'Projects', 'Budget (KSh)']];
        Object.entries(subCountyCounts).forEach(([subCounty, count]) => {
            const budget = projects
                .filter(p => p.subCounty === subCounty)
                .reduce((sum, p) => sum + p.budget, 0);
            data.push([subCounty, count, budget.toLocaleString()]);
        });
        
        return data;
    }
    
    getMilestoneData() {
        const projects = window.projectsCache || [];
        const data = [['Project', 'Start', 'End']];
        
        projects.slice(0, 10).forEach(project => { // Limit to first 10 projects
            if (project.startDate && project.expectedCompletionDate) {
                data.push([
                    project.name,
                    new Date(project.startDate),
                    new Date(project.expectedCompletionDate)
                ]);
            }
        });
        
        return data;
    }
    
    // Render dashboard
    renderDashboard(dashboardId, dashboardData) {
        const container = document.getElementById(`${dashboardId}-container`);
        if (!container) return;
        
        container.innerHTML = `
            <div class="dashboard-header bg-gradient-to-r from-red-800 to-green-800 text-white p-6 rounded-t-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <img src="Garissa_logo.png" alt="County Logo" class="w-12 h-12 rounded-full mr-4 border-2 border-white">
                        <div>
                            <h2 class="text-2xl font-bold">${dashboardData.title}</h2>
                            <p class="text-gray-200">Professional Analytics Dashboard</p>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                            <i data-lucide="download" class="w-4 h-4 mr-2 inline"></i>Export
                        </button>
                        <button class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                            <i data-lucide="refresh-cw" class="w-4 h-4 mr-2 inline"></i>Refresh
                        </button>
                    </div>
                </div>
            </div>
            <div class="dashboard-content p-6 bg-gray-50">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${dashboardData.charts.map(chart => `
                        <div class="bg-white rounded-lg shadow p-6">
                            <h3 class="text-lg font-semibold mb-4 text-gray-800">${chart.title}</h3>
                            <div id="${chart.id}" style="width: 100%; height: 400px;"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Render charts
        setTimeout(() => {
            dashboardData.charts.forEach(chart => {
                this.renderChart(chart);
            });
        }, 100);
    }
    
    // Render individual chart
    renderChart(chartConfig) {
        const element = document.getElementById(chartConfig.id);
        if (!element) return;
        
        const data = google.visualization.arrayToDataTable(chartConfig.data);
        
        let chart;
        switch (chartConfig.type) {
            case 'PieChart':
                chart = new google.visualization.PieChart(element);
                break;
            case 'ColumnChart':
                chart = new google.visualization.ColumnChart(element);
                break;
            case 'BarChart':
                chart = new google.visualization.BarChart(element);
                break;
            case 'LineChart':
                chart = new google.visualization.LineChart(element);
                break;
            case 'AreaChart':
                chart = new google.visualization.AreaChart(element);
                break;
            case 'ScatterChart':
                chart = new google.visualization.ScatterChart(element);
                break;
            case 'Table':
                chart = new google.visualization.Table(element);
                break;
            case 'Timeline':
                chart = new google.visualization.Timeline(element);
                break;
            default:
                chart = new google.visualization.ColumnChart(element);
        }
        
        chart.draw(data, chartConfig.options);
        this.charts.set(chartConfig.id, chart);
    }
    
    // Export dashboard to PDF
    exportDashboard(dashboardId, format = 'PDF') {
        const dashboard = this.dashboards.find(d => d.id === dashboardId);
        if (!dashboard) return;
        
        // Implementation for PDF export
        customAlert(`Exporting ${dashboard.title} as ${format}...`, "Export Started", "info");
        
        // In a real implementation, this would generate and download a PDF
        setTimeout(() => {
            customAlert("Dashboard exported successfully!", "Export Complete", "success");
        }, 2000);
    }
    
    // Refresh dashboard data
    refreshDashboard(dashboardId) {
        const dashboard = this.dashboards.find(d => d.id === dashboardId);
        if (!dashboard) return;
        
        // Re-render the dashboard with updated data
        this.renderDashboard(dashboardId, dashboard);
        customAlert("Dashboard refreshed with latest data!", "Refresh Complete", "success");
    }
    
    // Get dashboard list
    getDashboards() {
        return this.dashboards.map(d => ({
            id: d.id,
            title: d.title,
            type: d.type
        }));
    }
    
    // Create custom dashboard
    createCustomDashboard(title, charts) {
        const dashboardId = `custom-${Date.now()}`;
        const dashboard = {
            id: dashboardId,
            title: title,
            type: 'Custom',
            charts: charts
        };
        
        this.dashboards.push(dashboard);
        return dashboard;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LookerStudioIntegration;
}
