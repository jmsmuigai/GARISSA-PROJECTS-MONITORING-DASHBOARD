// Comprehensive Dummy Data for Garissa County PMD Demonstration
// This module provides realistic sample data for all system features

export const DUMMY_PROJECTS = [
    // Water and Sanitation Projects
    {
        id: "PRJ-WATER-001",
        name: "Borehole Construction - Bura East Ward",
        description: "Construction of deep borehole with solar-powered pump system to serve 500 households in Bura East ward. Includes water storage tank and distribution network.",
        subCounty: "Bura East",
        ward: "Bura East",
        location: { latitude: -0.7500, longitude: 40.1667 },
        department: "Water, Environment, Climate change & Natural Resources",
        status: "Ongoing",
        startDate: "2024-03-15",
        expectedCompletionDate: "2024-12-31",
        budget: 8500000,
        expenditure: 4250000,
        sourceOfFunds: "African Development Bank",
        createdAt: "2024-03-01T10:00:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-12-01T15:30:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-WATER-001",
        beneficiaryCount: 2500,
        progressPercentage: 65,
        riskLevel: "Medium",
        completionStatus: "On Track"
    },
    {
        id: "PRJ-WATER-002",
        name: "Water Pipeline Extension - Garissa Township",
        description: "Extension of existing water pipeline network to cover underserved areas in Garissa Township. Includes 15km of pipeline and 5 distribution points.",
        subCounty: "Garissa Township",
        ward: "Township",
        location: { latitude: -0.4569, longitude: 39.6463 },
        department: "Water, Environment, Climate change & Natural Resources",
        status: "Completed",
        startDate: "2023-09-01",
        expectedCompletionDate: "2024-06-30",
        budget: 12000000,
        expenditure: 11800000,
        sourceOfFunds: "World Bank",
        createdAt: "2023-08-15T09:00:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-06-30T16:45:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-WATER-002",
        beneficiaryCount: 8000,
        progressPercentage: 100,
        riskLevel: "Low",
        completionStatus: "Completed"
    },
    
    // Education Projects
    {
        id: "PRJ-EDU-001",
        name: "ECD Centers Construction - Dadaab",
        description: "Construction of 5 Early Childhood Development centers in Dadaab sub-county with modern facilities, playgrounds, and learning materials.",
        subCounty: "Dadaab",
        ward: "Dadaab",
        location: { latitude: 0.3833, longitude: 40.0667 },
        department: "Education, ICT & Libraries",
        status: "Ongoing",
        startDate: "2024-01-10",
        expectedCompletionDate: "2025-03-31",
        budget: 15000000,
        expenditure: 6750000,
        sourceOfFunds: "UNICEF",
        createdAt: "2023-12-20T11:00:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-12-01T14:20:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-EDU-001",
        beneficiaryCount: 800,
        progressPercentage: 45,
        riskLevel: "Low",
        completionStatus: "On Track"
    },
    {
        id: "PRJ-EDU-002",
        name: "ICT Training Center - Garissa Township",
        description: "Establishment of modern ICT training center with computer labs, internet connectivity, and digital literacy programs for youth and adults.",
        subCounty: "Garissa Township",
        ward: "Iftin",
        location: { latitude: -0.4569, longitude: 39.6463 },
        department: "Education, ICT & Libraries",
        status: "Planning",
        startDate: "2025-02-01",
        expectedCompletionDate: "2025-11-30",
        budget: 25000000,
        expenditure: 0,
        sourceOfFunds: "Kenya ICT Authority",
        createdAt: "2024-11-15T08:30:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-11-15T08:30:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-EDU-002",
        beneficiaryCount: 1200,
        progressPercentage: 0,
        riskLevel: "Low",
        completionStatus: "Planning"
    },
    
    // Health Projects
    {
        id: "PRJ-HEALTH-001",
        name: "Health Center Construction - Lagdera",
        description: "Construction of comprehensive health center with outpatient services, maternity wing, laboratory, and pharmacy in Lagdera sub-county.",
        subCounty: "Lagdera",
        ward: "Lagdera",
        location: { latitude: -0.4167, longitude: 39.7500 },
        department: "Health and Sanitation",
        status: "Ongoing",
        startDate: "2024-06-01",
        expectedCompletionDate: "2025-08-31",
        budget: 35000000,
        expenditure: 17500000,
        sourceOfFunds: "Ministry of Health",
        createdAt: "2024-05-15T12:00:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-12-01T13:15:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-HEALTH-001",
        beneficiaryCount: 15000,
        progressPercentage: 50,
        riskLevel: "Medium",
        completionStatus: "On Track"
    },
    {
        id: "PRJ-HEALTH-002",
        name: "Mobile Health Unit - Fafi",
        description: "Deployment of mobile health unit with medical equipment and trained staff to provide healthcare services to remote areas in Fafi sub-county.",
        subCounty: "Fafi",
        ward: "Fafi",
        location: { latitude: -0.7500, longitude: 40.0833 },
        department: "Health and Sanitation",
        status: "Stalled",
        startDate: "2024-02-01",
        expectedCompletionDate: "2024-08-31",
        budget: 8500000,
        expenditure: 3200000,
        sourceOfFunds: "County Development Fund",
        createdAt: "2024-01-20T10:30:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-10-15T11:45:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-HEALTH-002",
        beneficiaryCount: 5000,
        progressPercentage: 38,
        riskLevel: "High",
        completionStatus: "Delayed"
    },
    
    // Infrastructure Projects
    {
        id: "PRJ-INFRA-001",
        name: "Road Construction - Masalani to Hulugho",
        description: "Construction of 25km tarmac road connecting Masalani to Hulugho with drainage systems, road signs, and safety features.",
        subCounty: "Ijara",
        ward: "Masalani",
        location: { latitude: -1.3000, longitude: 40.3833 },
        department: "Roads, Transport, Housing & Public Works",
        status: "Ongoing",
        startDate: "2024-04-01",
        expectedCompletionDate: "2025-12-31",
        budget: 75000000,
        expenditure: 30000000,
        sourceOfFunds: "Kenya Roads Board",
        createdAt: "2024-03-15T09:15:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-12-01T16:00:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-INFRA-001",
        beneficiaryCount: 20000,
        progressPercentage: 40,
        riskLevel: "Medium",
        completionStatus: "On Track"
    },
    {
        id: "PRJ-INFRA-002",
        name: "Market Construction - Balambala",
        description: "Construction of modern market facility with 50 stalls, storage areas, parking, and sanitation facilities in Balambala town.",
        subCounty: "Balambala",
        ward: "Balambala",
        location: { latitude: -0.5833, longitude: 39.9167 },
        department: "Roads, Transport, Housing & Public Works",
        status: "Completed",
        startDate: "2023-11-01",
        expectedCompletionDate: "2024-07-31",
        budget: 18000000,
        expenditure: 17500000,
        sourceOfFunds: "County Development Fund",
        createdAt: "2023-10-20T14:30:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-07-31T17:30:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-INFRA-002",
        beneficiaryCount: 3000,
        progressPercentage: 100,
        riskLevel: "Low",
        completionStatus: "Completed"
    },
    
    // Agriculture Projects
    {
        id: "PRJ-AGRI-001",
        name: "Pastoralist Support Program - Ijara",
        description: "Comprehensive support program for pastoralist communities including water pans, livestock markets, and veterinary services.",
        subCounty: "Ijara",
        ward: "Ijara",
        location: { latitude: -1.2500, longitude: 40.3333 },
        department: "Agriculture, Livestock & Pastoral Economy",
        status: "Ongoing",
        startDate: "2024-01-15",
        expectedCompletionDate: "2025-06-30",
        budget: 28000000,
        expenditure: 16800000,
        sourceOfFunds: "FAO",
        createdAt: "2023-12-30T11:45:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-12-01T12:30:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-AGRI-001",
        beneficiaryCount: 12000,
        progressPercentage: 60,
        riskLevel: "Low",
        completionStatus: "On Track"
    },
    {
        id: "PRJ-AGRI-002",
        name: "Drought Resilience Initiative - Hulugho",
        description: "Implementation of drought resilience measures including water harvesting, drought-resistant crops, and livestock management training.",
        subCounty: "Hulugho",
        ward: "Hulugho",
        location: { latitude: -1.1667, longitude: 40.2500 },
        department: "Agriculture, Livestock & Pastoral Economy",
        status: "Stalled",
        startDate: "2024-03-01",
        expectedCompletionDate: "2024-11-30",
        budget: 12000000,
        expenditure: 4800000,
        sourceOfFunds: "County Development Fund",
        createdAt: "2024-02-15T13:20:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-09-20T10:15:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-AGRI-002",
        beneficiaryCount: 8000,
        progressPercentage: 40,
        riskLevel: "High",
        completionStatus: "Delayed"
    },
    
    // Youth and Sports Projects
    {
        id: "PRJ-YOUTH-001",
        name: "Youth Empowerment Center - Garissa Township",
        description: "Construction of multi-purpose youth center with sports facilities, training rooms, and entrepreneurship programs.",
        subCounty: "Garissa Township",
        ward: "Central",
        location: { latitude: -0.4569, longitude: 39.6463 },
        department: "Culture, Gender, PWDs, Social Services, Youth & Sports",
        status: "Planning",
        startDate: "2025-01-01",
        expectedCompletionDate: "2025-12-31",
        budget: 40000000,
        expenditure: 0,
        sourceOfFunds: "Sports Kenya",
        createdAt: "2024-10-30T15:00:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-10-30T15:00:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-YOUTH-001",
        beneficiaryCount: 5000,
        progressPercentage: 0,
        riskLevel: "Low",
        completionStatus: "Planning"
    },
    
    // Additional projects for comprehensive demonstration
    {
        id: "PRJ-ENV-001",
        name: "Environmental Conservation - Sankuri",
        description: "Tree planting initiative and environmental conservation program covering 100 hectares in Sankuri sub-county.",
        subCounty: "Sankuri",
        ward: "Sankuri",
        location: { latitude: -0.5000, longitude: 39.8333 },
        department: "Water, Environment, Climate change & Natural Resources",
        status: "Ongoing",
        startDate: "2024-05-01",
        expectedCompletionDate: "2025-04-30",
        budget: 8000000,
        expenditure: 3200000,
        sourceOfFunds: "Green Climate Fund",
        createdAt: "2024-04-15T12:30:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-12-01T11:00:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-ENV-001",
        beneficiaryCount: 6000,
        progressPercentage: 40,
        riskLevel: "Low",
        completionStatus: "On Track"
    },
    {
        id: "PRJ-TRADE-001",
        name: "Trade Development Center - Dadaab",
        description: "Establishment of trade development center with business incubation, market linkages, and financial services.",
        subCounty: "Dadaab",
        ward: "Liboi",
        location: { latitude: 0.3833, longitude: 40.0667 },
        department: "Trade, Investment & Enterprise Development",
        status: "Completed",
        startDate: "2023-08-01",
        expectedCompletionDate: "2024-05-31",
        budget: 22000000,
        expenditure: 21500000,
        sourceOfFunds: "World Bank",
        createdAt: "2023-07-20T14:15:00Z",
        createdBy: "jmsmuigai@gmail.com",
        lastUpdated: "2024-05-31T16:45:00Z",
        updatedBy: "jmsmuigai@gmail.com",
        projectId: "PRJ-TRADE-001",
        beneficiaryCount: 4000,
        progressPercentage: 100,
        riskLevel: "Low",
        completionStatus: "Completed"
    }
];

export const DUMMY_USERS = [
    {
        id: "user-001",
        email: "jmsmuigai@gmail.com",
        upn: "123456789",
        role: "superadmin",
        department: "County Executive",
        createdAt: "2024-01-01T00:00:00Z",
        createdBy: "system"
    },
    {
        id: "user-002",
        email: "director.water@garissa.go.ke",
        upn: "234567890",
        role: "admin",
        department: "Water, Environment, Climate change & Natural Resources",
        createdAt: "2024-01-15T09:00:00Z",
        createdBy: "jmsmuigai@gmail.com"
    },
    {
        id: "user-003",
        email: "director.education@garissa.go.ke",
        upn: "345678901",
        role: "admin",
        department: "Education, ICT & Libraries",
        createdAt: "2024-01-15T09:15:00Z",
        createdBy: "jmsmuigai@gmail.com"
    },
    {
        id: "user-004",
        email: "director.health@garissa.go.ke",
        upn: "456789012",
        role: "admin",
        department: "Health and Sanitation",
        createdAt: "2024-01-15T09:30:00Z",
        createdBy: "jmsmuigai@gmail.com"
    },
    {
        id: "user-005",
        email: "director.infrastructure@garissa.go.ke",
        upn: "567890123",
        role: "admin",
        department: "Roads, Transport, Housing & Public Works",
        createdAt: "2024-01-15T09:45:00Z",
        createdBy: "jmsmuigai@gmail.com"
    }
];

export const DUMMY_ANALYTICS = {
    countyStatistics: {
        totalProjects: DUMMY_PROJECTS.length,
        completedProjects: DUMMY_PROJECTS.filter(p => p.status === 'Completed').length,
        ongoingProjects: DUMMY_PROJECTS.filter(p => p.status === 'Ongoing').length,
        stalledProjects: DUMMY_PROJECTS.filter(p => p.status === 'Stalled').length,
        planningProjects: DUMMY_PROJECTS.filter(p => p.status === 'Planning').length,
        totalBudget: DUMMY_PROJECTS.reduce((sum, p) => sum + p.budget, 0),
        totalExpenditure: DUMMY_PROJECTS.reduce((sum, p) => sum + p.expenditure, 0),
        averageProjectBudget: 0,
        completionRate: 0,
        budgetUtilization: 0
    },
    
    departmentPerformance: [
        {
            department: "Water, Environment, Climate change & Natural Resources",
            totalProjects: 3,
            completedProjects: 1,
            ongoingProjects: 2,
            totalBudget: 28500000,
            totalExpenditure: 16900000,
            completionRate: 33.3,
            budgetUtilization: 59.3,
            performance: "Good"
        },
        {
            department: "Education, ICT & Libraries",
            totalProjects: 2,
            completedProjects: 0,
            ongoingProjects: 1,
            planningProjects: 1,
            totalBudget: 40000000,
            totalExpenditure: 6750000,
            completionRate: 0,
            budgetUtilization: 16.9,
            performance: "Needs Improvement"
        },
        {
            department: "Health and Sanitation",
            totalProjects: 2,
            completedProjects: 0,
            ongoingProjects: 1,
            stalledProjects: 1,
            totalBudget: 43500000,
            totalExpenditure: 20700000,
            completionRate: 0,
            budgetUtilization: 47.6,
            performance: "Average"
        },
        {
            department: "Roads, Transport, Housing & Public Works",
            totalProjects: 2,
            completedProjects: 1,
            ongoingProjects: 1,
            totalBudget: 93000000,
            totalExpenditure: 47500000,
            completionRate: 50,
            budgetUtilization: 51.1,
            performance: "Good"
        },
        {
            department: "Agriculture, Livestock & Pastoral Economy",
            totalProjects: 2,
            completedProjects: 0,
            ongoingProjects: 1,
            stalledProjects: 1,
            totalBudget: 40000000,
            totalExpenditure: 21600000,
            completionRate: 0,
            budgetUtilization: 54,
            performance: "Average"
        }
    ],
    
    subCountyDistribution: [
        { subCounty: "Garissa Township", projectCount: 4, totalBudget: 65000000 },
        { subCounty: "Dadaab", projectCount: 2, totalBudget: 37000000 },
        { subCounty: "Bura East", projectCount: 1, totalBudget: 8500000 },
        { subCounty: "Lagdera", projectCount: 1, totalBudget: 35000000 },
        { subCounty: "Fafi", projectCount: 1, totalBudget: 8500000 },
        { subCounty: "Ijara", projectCount: 2, totalBudget: 43000000 },
        { subCounty: "Hulugho", projectCount: 1, totalBudget: 12000000 },
        { subCounty: "Balambala", projectCount: 1, totalBudget: 18000000 },
        { subCounty: "Sankuri", projectCount: 1, totalBudget: 8000000 }
    ],
    
    riskAnalysis: {
        highRisk: DUMMY_PROJECTS.filter(p => p.riskLevel === 'High').length,
        mediumRisk: DUMMY_PROJECTS.filter(p => p.riskLevel === 'Medium').length,
        lowRisk: DUMMY_PROJECTS.filter(p => p.riskLevel === 'Low').length,
        riskFactors: [
            { factor: "Budget Overrun", count: 3, percentage: 25 },
            { factor: "Timeline Delay", count: 2, percentage: 16.7 },
            { factor: "Resource Constraints", count: 4, percentage: 33.3 },
            { factor: "Weather Conditions", count: 2, percentage: 16.7 },
            { factor: "Contractor Issues", count: 1, percentage: 8.3 }
        ]
    }
};

export const DUMMY_EXCEL_DATA = [
    // Header row
    { cell: 'A1', value: 'Project ID' },
    { cell: 'B1', value: 'Project Name' },
    { cell: 'C1', value: 'Department' },
    { cell: 'D1', value: 'Sub-County' },
    { cell: 'E1', value: 'Ward' },
    { cell: 'F1', value: 'Budget (KSh)' },
    { cell: 'G1', value: 'Expenditure (KSh)' },
    { cell: 'H1', value: 'Progress %' },
    { cell: 'I1', value: 'Status' },
    { cell: 'J1', value: 'Risk Level' },
    
    // Data rows
    { cell: 'A2', value: 'PRJ-WATER-001' },
    { cell: 'B2', value: 'Borehole Construction - Bura East Ward' },
    { cell: 'C2', value: 'Water, Environment, Climate change & Natural Resources' },
    { cell: 'D2', value: 'Bura East' },
    { cell: 'E2', value: 'Bura East' },
    { cell: 'F2', value: '8500000' },
    { cell: 'G2', value: '4250000' },
    { cell: 'H2', value: '=PERCENTAGE(G2,F2)' },
    { cell: 'I2', value: 'Ongoing' },
    { cell: 'J2', value: 'Medium' },
    
    { cell: 'A3', value: 'PRJ-WATER-002' },
    { cell: 'B3', value: 'Water Pipeline Extension - Garissa Township' },
    { cell: 'C3', value: 'Water, Environment, Climate change & Natural Resources' },
    { cell: 'D3', value: 'Garissa Township' },
    { cell: 'E3', value: 'Township' },
    { cell: 'F3', value: '12000000' },
    { cell: 'G3', value: '11800000' },
    { cell: 'H3', value: '=PERCENTAGE(G3,F3)' },
    { cell: 'I3', value: 'Completed' },
    { cell: 'J3', value: 'Low' },
    
    { cell: 'A4', value: 'PRJ-EDU-001' },
    { cell: 'B4', value: 'ECD Centers Construction - Dadaab' },
    { cell: 'C4', value: 'Education, ICT & Libraries' },
    { cell: 'D4', value: 'Dadaab' },
    { cell: 'E4', value: 'Dadaab' },
    { cell: 'F4', value: '15000000' },
    { cell: 'G4', value: '6750000' },
    { cell: 'H4', value: '=PERCENTAGE(G4,F4)' },
    { cell: 'I4', value: 'Ongoing' },
    { cell: 'J4', value: 'Low' },
    
    // Summary rows
    { cell: 'F6', value: 'Total Budget:' },
    { cell: 'G6', value: '=SUM(F2:F4)' },
    { cell: 'F7', value: 'Total Expenditure:' },
    { cell: 'G7', value: '=SUM(G2:G4)' },
    { cell: 'F8', value: 'Average Progress:' },
    { cell: 'G8', value: '=AVERAGE(H2:H4)' },
    { cell: 'F9', value: 'Completed Projects:' },
    { cell: 'G9', value: '=COUNTIF(I:I,"Completed")' },
    { cell: 'F10', value: 'High Risk Projects:' },
    { cell: 'G10', value: '=COUNTIF(J:J,"High")' }
];

export const DUMMY_REPORTS = [
    {
        id: "RPT-001",
        title: "Quarterly Project Performance Report",
        type: "Performance",
        generatedDate: "2024-12-01T10:00:00Z",
        generatedBy: "jmsmuigai@gmail.com",
        summary: "Overall project performance shows 75% completion rate with 8 projects completed, 6 ongoing, and 2 stalled.",
        keyFindings: [
            "Water projects show excellent progress with 80% completion rate",
            "Health projects face resource constraints affecting timeline",
            "Infrastructure projects are on track with good budget utilization",
            "Youth projects require additional funding for implementation"
        ],
        recommendations: [
            "Increase monitoring frequency for stalled projects",
            "Allocate additional resources to health sector projects",
            "Establish risk mitigation strategies for high-risk projects",
            "Improve stakeholder engagement for youth programs"
        ]
    },
    {
        id: "RPT-002",
        title: "Budget Utilization Analysis",
        type: "Financial",
        generatedDate: "2024-11-30T14:30:00Z",
        generatedBy: "jmsmuigai@gmail.com",
        summary: "Total budget utilization stands at 58% with KSh 156.7M expended out of KSh 270M allocated.",
        keyFindings: [
            "Water department shows highest budget utilization at 75%",
            "Education projects require additional funding allocation",
            "Infrastructure projects maintain good cost control",
            "Agriculture projects show delayed expenditure patterns"
        ],
        recommendations: [
            "Review and reallocate underutilized budgets",
            "Implement quarterly budget reviews",
            "Establish cost control mechanisms",
            "Monitor expenditure patterns for early intervention"
        ]
    }
];

// Calculate derived statistics
DUMMY_ANALYTICS.countyStatistics.averageProjectBudget = 
    DUMMY_ANALYTICS.countyStatistics.totalBudget / DUMMY_ANALYTICS.countyStatistics.totalProjects;

DUMMY_ANALYTICS.countyStatistics.completionRate = 
    (DUMMY_ANALYTICS.countyStatistics.completedProjects / DUMMY_ANALYTICS.countyStatistics.totalProjects) * 100;

DUMMY_ANALYTICS.countyStatistics.budgetUtilization = 
    (DUMMY_ANALYTICS.countyStatistics.totalExpenditure / DUMMY_ANALYTICS.countyStatistics.totalBudget) * 100;
