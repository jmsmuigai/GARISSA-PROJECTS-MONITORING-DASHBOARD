// Excel-like Calculation Engine for Garissa County PMD
// This module provides Excel-like formula calculation capabilities

class ExcelFormulaEngine {
    constructor() {
        this.formulas = {
            // Mathematical formulas
            'SUM': (...args) => args.reduce((a, b) => a + b, 0),
            'AVERAGE': (...args) => args.reduce((a, b) => a + b, 0) / args.length,
            'MAX': (...args) => Math.max(...args),
            'MIN': (...args) => Math.min(...args),
            'COUNT': (...args) => args.filter(arg => arg !== null && arg !== undefined).length,
            'COUNTIF': (range, criteria) => range.filter(item => this.evaluateCondition(item, criteria)).length,
            'SUMIF': (range, criteria, sumRange) => {
                return range.reduce((sum, item, index) => {
                    return this.evaluateCondition(item, criteria) ? sum + (sumRange[index] || 0) : sum;
                }, 0);
            },
            
            // Financial formulas
            'PERCENTAGE': (value, total) => (value / total) * 100,
            'COMPLETION_RATE': (completed, total) => (completed / total) * 100,
            'BUDGET_UTILIZATION': (expenditure, budget) => (expenditure / budget) * 100,
            'VARIANCE': (actual, planned) => actual - planned,
            'VARIANCE_PERCENTAGE': (actual, planned) => ((actual - planned) / planned) * 100,
            
            // Date formulas
            'DAYS_BETWEEN': (startDate, endDate) => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            },
            'IS_OVERDUE': (dueDate) => {
                const due = new Date(dueDate);
                const today = new Date();
                return today > due;
            },
            'DAYS_OVERDUE': (dueDate) => {
                const due = new Date(dueDate);
                const today = new Date();
                return Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)));
            },
            
            // Conditional formulas
            'IF': (condition, trueValue, falseValue) => condition ? trueValue : falseValue,
            'IFS': (...args) => {
                for (let i = 0; i < args.length - 1; i += 2) {
                    if (args[i]) return args[i + 1];
                }
                return args[args.length - 1];
            },
            'AND': (...args) => args.every(arg => arg),
            'OR': (...args) => args.some(arg => arg),
            
            // Text formulas
            'CONCATENATE': (...args) => args.join(''),
            'LEFT': (text, numChars) => text.substring(0, numChars),
            'RIGHT': (text, numChars) => text.substring(text.length - numChars),
            'MID': (text, startNum, numChars) => text.substring(startNum - 1, startNum - 1 + numChars),
            'UPPER': (text) => text.toUpperCase(),
            'LOWER': (text) => text.toLowerCase(),
            'PROPER': (text) => text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
            
            // Lookup formulas
            'VLOOKUP': (lookupValue, tableArray, colIndexNum, rangeLookup = true) => {
                for (let row of tableArray) {
                    if (rangeLookup ? row[0] === lookupValue : row[0].toString().includes(lookupValue)) {
                        return row[colIndexNum - 1];
                    }
                }
                return null;
            },
            'HLOOKUP': (lookupValue, tableArray, rowIndexNum, rangeLookup = true) => {
                const headerRow = tableArray[0];
                let colIndex = -1;
                for (let i = 0; i < headerRow.length; i++) {
                    if (rangeLookup ? headerRow[i] === lookupValue : headerRow[i].toString().includes(lookupValue)) {
                        colIndex = i;
                        break;
                    }
                }
                return colIndex !== -1 ? tableArray[rowIndexNum - 1][colIndex] : null;
            },
            
            // Statistical formulas
            'STDEV': (...args) => {
                const mean = this.formulas.AVERAGE(...args);
                const squaredDiffs = args.map(x => Math.pow(x - mean, 2));
                return Math.sqrt(this.formulas.AVERAGE(...squaredDiffs));
            },
            'CORREL': (array1, array2) => {
                const mean1 = this.formulas.AVERAGE(...array1);
                const mean2 = this.formulas.AVERAGE(...array2);
                const numerator = array1.reduce((sum, x, i) => sum + (x - mean1) * (array2[i] - mean2), 0);
                const denominator = Math.sqrt(
                    array1.reduce((sum, x) => sum + Math.pow(x - mean1, 2), 0) *
                    array2.reduce((sum, x) => sum + Math.pow(x - mean2, 2), 0)
                );
                return denominator === 0 ? 0 : numerator / denominator;
            }
        };
        
        this.variables = {};
        this.cache = new Map();
    }
    
    evaluateCondition(value, criteria) {
        if (typeof criteria === 'string') {
            if (criteria.startsWith('>=')) return value >= parseFloat(criteria.substring(2));
            if (criteria.startsWith('<=')) return value <= parseFloat(criteria.substring(2));
            if (criteria.startsWith('>')) return value > parseFloat(criteria.substring(1));
            if (criteria.startsWith('<')) return value < parseFloat(criteria.substring(1));
            if (criteria.startsWith('<>') || criteria.startsWith('!=')) return value != criteria.substring(2);
            return value.toString().toLowerCase().includes(criteria.toLowerCase());
        }
        return value === criteria;
    }
    
    parseFormula(formula) {
        // Remove leading = if present
        if (formula.startsWith('=')) {
            formula = formula.substring(1);
        }
        
        // Parse function calls
        const functionMatch = formula.match(/^([A-Z_]+)\((.*)\)$/);
        if (functionMatch) {
            const [, functionName, argsStr] = functionMatch;
            const args = this.parseArguments(argsStr);
            return this.executeFunction(functionName, args);
        }
        
        // Parse cell references (e.g., A1, B2:C10)
        if (/^[A-Z]+\d+$/.test(formula)) {
            return this.getCellValue(formula);
        }
        
        // Parse range references (e.g., A1:C10)
        if (/^[A-Z]+\d+:[A-Z]+\d+$/.test(formula)) {
            return this.getRangeValues(formula);
        }
        
        // Parse arithmetic expressions
        return this.evaluateArithmetic(formula);
    }
    
    parseArguments(argsStr) {
        const args = [];
        let currentArg = '';
        let parenCount = 0;
        let inQuotes = false;
        
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr[i];
            
            if (char === '"' && argsStr[i-1] !== '\\') {
                inQuotes = !inQuotes;
            } else if (!inQuotes) {
                if (char === '(') parenCount++;
                else if (char === ')') parenCount--;
                else if (char === ',' && parenCount === 0) {
                    args.push(this.parseArgument(currentArg.trim()));
                    currentArg = '';
                    continue;
                }
            }
            
            currentArg += char;
        }
        
        if (currentArg.trim()) {
            args.push(this.parseArgument(currentArg.trim()));
        }
        
        return args;
    }
    
    parseArgument(arg) {
        // Handle quoted strings
        if (arg.startsWith('"') && arg.endsWith('"')) {
            return arg.slice(1, -1);
        }
        
        // Handle numbers
        if (!isNaN(arg)) {
            return parseFloat(arg);
        }
        
        // Handle cell references
        if (/^[A-Z]+\d+$/.test(arg)) {
            return this.getCellValue(arg);
        }
        
        // Handle range references
        if (/^[A-Z]+\d+:[A-Z]+\d+$/.test(arg)) {
            return this.getRangeValues(arg);
        }
        
        // Handle boolean values
        if (arg.toLowerCase() === 'true') return true;
        if (arg.toLowerCase() === 'false') return false;
        
        return arg;
    }
    
    executeFunction(functionName, args) {
        if (this.formulas[functionName]) {
            return this.formulas[functionName](...args);
        }
        throw new Error(`Unknown function: ${functionName}`);
    }
    
    evaluateArithmetic(expression) {
        // Simple arithmetic evaluation (can be enhanced with proper parser)
        const tokens = expression.match(/(\d+\.?\d*|[+\-*/()]|[A-Z]+\d+)/g) || [];
        const stack = [];
        const output = [];
        
        for (let token of tokens) {
            if (!isNaN(token)) {
                output.push(parseFloat(token));
            } else if (token.match(/^[A-Z]+\d+$/)) {
                output.push(this.getCellValue(token));
            } else {
                // Handle operators
                while (stack.length > 0 && this.getPrecedence(stack[stack.length - 1]) >= this.getPrecedence(token)) {
                    output.push(stack.pop());
                }
                stack.push(token);
            }
        }
        
        while (stack.length > 0) {
            output.push(stack.pop());
        }
        
        return this.evaluatePostfix(output);
    }
    
    getPrecedence(operator) {
        switch (operator) {
            case '+':
            case '-':
                return 1;
            case '*':
            case '/':
                return 2;
            default:
                return 0;
        }
    }
    
    evaluatePostfix(tokens) {
        const stack = [];
        
        for (let token of tokens) {
            if (typeof token === 'number') {
                stack.push(token);
            } else {
                const b = stack.pop();
                const a = stack.pop();
                
                switch (token) {
                    case '+':
                        stack.push(a + b);
                        break;
                    case '-':
                        stack.push(a - b);
                        break;
                    case '*':
                        stack.push(a * b);
                        break;
                    case '/':
                        stack.push(a / b);
                        break;
                }
            }
        }
        
        return stack[0] || 0;
    }
    
    getCellValue(cellRef) {
        // This would be connected to the actual data grid
        return this.variables[cellRef] || 0;
    }
    
    getRangeValues(rangeRef) {
        // Parse range like A1:C10
        const [start, end] = rangeRef.split(':');
        const values = [];
        
        // This would be connected to the actual data grid
        // For now, return empty array
        return values;
    }
    
    setVariable(name, value) {
        this.variables[name] = value;
    }
    
    getVariable(name) {
        return this.variables[name];
    }
    
    clearCache() {
        this.cache.clear();
    }
}

// Garissa County specific calculation functions
class GarissaCalculations {
    constructor() {
        this.excelEngine = new ExcelFormulaEngine();
        this.initializeCountySpecificFormulas();
    }
    
    initializeCountySpecificFormulas() {
        // Add Garissa County specific formulas
        this.excelEngine.formulas = {
            ...this.excelEngine.formulas,
            
            // Project-specific calculations
            'PROJECT_PROGRESS': (expenditure, budget) => {
                return budget > 0 ? (expenditure / budget) * 100 : 0;
            },
            
            'BUDGET_VARIANCE': (actual, planned) => {
                return actual - planned;
            },
            
            'COMPLETION_STATUS': (startDate, endDate, currentDate = new Date()) => {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const current = new Date(currentDate);
                
                if (current < start) return 'Not Started';
                if (current > end) return 'Overdue';
                
                const totalDays = (end - start) / (1000 * 60 * 60 * 24);
                const elapsedDays = (current - start) / (1000 * 60 * 60 * 24);
                const progress = (elapsedDays / totalDays) * 100;
                
                if (progress < 25) return 'Early Stage';
                if (progress < 50) return 'In Progress';
                if (progress < 75) return 'Advanced';
                return 'Near Completion';
            },
            
            'RISK_ASSESSMENT': (budget, expenditure, completionDate) => {
                const budgetUtilization = (expenditure / budget) * 100;
                const daysOverdue = this.excelEngine.formulas.DAYS_OVERDUE(completionDate);
                
                if (budgetUtilization > 90 && daysOverdue > 30) return 'High Risk';
                if (budgetUtilization > 75 || daysOverdue > 15) return 'Medium Risk';
                if (budgetUtilization > 50 || daysOverdue > 0) return 'Low Risk';
                return 'On Track';
            },
            
            'DEPARTMENT_PERFORMANCE': (projects, completed, budget, expenditure) => {
                const completionRate = (completed / projects) * 100;
                const budgetEfficiency = budget > 0 ? (expenditure / budget) * 100 : 0;
                
                if (completionRate >= 80 && budgetEfficiency <= 100) return 'Excellent';
                if (completionRate >= 60 && budgetEfficiency <= 110) return 'Good';
                if (completionRate >= 40 && budgetEfficiency <= 120) return 'Average';
                return 'Needs Improvement';
            },
            
            // Ward and sub-county calculations
            'WARD_PROJECT_COUNT': (ward, projects) => {
                return projects.filter(p => p.ward === ward).length;
            },
            
            'SUBCOUNTY_BUDGET_ALLOCATION': (subcounty, projects) => {
                return projects
                    .filter(p => p.subCounty === subcounty)
                    .reduce((sum, p) => sum + p.budget, 0);
            },
            
            // Financial calculations
            'BUDGET_UTILIZATION_RATE': (expenditure, budget) => {
                return budget > 0 ? (expenditure / budget) * 100 : 0;
            },
            
            'COST_PER_BENEFICIARY': (totalCost, beneficiaryCount) => {
                return beneficiaryCount > 0 ? totalCost / beneficiaryCount : 0;
            },
            
            'RETURN_ON_INVESTMENT': (benefits, costs) => {
                return costs > 0 ? ((benefits - costs) / costs) * 100 : 0;
            }
        };
    }
    
    // Calculate project KPIs
    calculateProjectKPIs(project) {
        const kpis = {
            progress: this.excelEngine.formulas.PROJECT_PROGRESS(project.expenditure, project.budget),
            budgetVariance: this.excelEngine.formulas.BUDGET_VARIANCE(project.expenditure, project.budget),
            completionStatus: this.excelEngine.formulas.COMPLETION_STATUS(
                project.startDate, 
                project.expectedCompletionDate
            ),
            riskLevel: this.excelEngine.formulas.RISK_ASSESSMENT(
                project.budget, 
                project.expenditure, 
                project.expectedCompletionDate
            ),
            budgetUtilization: this.excelEngine.formulas.BUDGET_UTILIZATION_RATE(
                project.expenditure, 
                project.budget
            )
        };
        
        return kpis;
    }
    
    // Calculate department performance
    calculateDepartmentPerformance(department, projects) {
        const deptProjects = projects.filter(p => p.department === department);
        const completed = deptProjects.filter(p => p.status === 'Completed').length;
        const totalBudget = deptProjects.reduce((sum, p) => sum + p.budget, 0);
        const totalExpenditure = deptProjects.reduce((sum, p) => sum + p.expenditure, 0);
        
        return {
            totalProjects: deptProjects.length,
            completedProjects: completed,
            completionRate: this.excelEngine.formulas.PERCENTAGE(completed, deptProjects.length),
            totalBudget,
            totalExpenditure,
            budgetUtilization: this.excelEngine.formulas.BUDGET_UTILIZATION_RATE(totalExpenditure, totalBudget),
            performance: this.excelEngine.formulas.DEPARTMENT_PERFORMANCE(
                deptProjects.length, 
                completed, 
                totalBudget, 
                totalExpenditure
            )
        };
    }
    
    // Calculate county-wide statistics
    calculateCountyStatistics(projects) {
        const totalProjects = projects.length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const ongoing = projects.filter(p => p.status === 'Ongoing').length;
        const stalled = projects.filter(p => p.status === 'Stalled').length;
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalExpenditure = projects.reduce((sum, p) => sum + p.expenditure, 0);
        
        return {
            totalProjects,
            completed,
            ongoing,
            stalled,
            completionRate: this.excelEngine.formulas.PERCENTAGE(completed, totalProjects),
            totalBudget,
            totalExpenditure,
            budgetUtilization: this.excelEngine.formulas.BUDGET_UTILIZATION_RATE(totalExpenditure, totalBudget),
            averageProjectBudget: totalBudget / totalProjects,
            averageProjectDuration: this.calculateAverageDuration(projects)
        };
    }
    
    calculateAverageDuration(projects) {
        const durations = projects
            .filter(p => p.startDate && p.expectedCompletionDate)
            .map(p => this.excelEngine.formulas.DAYS_BETWEEN(p.startDate, p.expectedCompletionDate));
        
        return durations.length > 0 ? this.excelEngine.formulas.AVERAGE(...durations) : 0;
    }
    
    // Generate Excel-like formulas for reports
    generateReportFormulas(projects) {
        const formulas = {
            // Summary formulas
            'Total Projects': `=COUNT(A:A)`,
            'Completed Projects': `=COUNTIF(C:C,"Completed")`,
            'Total Budget': `=SUM(E:E)`,
            'Total Expenditure': `=SUM(F:F)`,
            'Completion Rate': `=PERCENTAGE(COUNTIF(C:C,"Completed"),COUNT(A:A))`,
            'Budget Utilization': `=BUDGET_UTILIZATION(SUM(F:F),SUM(E:E))`,
            
            // Department-wise formulas
            'Dept Performance': `=DEPARTMENT_PERFORMANCE(COUNTIF(B:B,"Department Name"),COUNTIF(C:C,"Completed"),SUMIF(B:B,"Department Name",E:E),SUMIF(B:B,"Department Name",F:F))`,
            
            // Risk assessment formulas
            'High Risk Projects': `=COUNTIF(G:G,"High Risk")`,
            'Overdue Projects': `=COUNTIF(H:H,"Overdue")`,
            'Budget Overrun': `=COUNTIF(I:I,">100")`
        };
        
        return formulas;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ExcelFormulaEngine, GarissaCalculations };
}
