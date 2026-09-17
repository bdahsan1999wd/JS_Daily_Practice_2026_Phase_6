// 🧩 PROBLEM–03: buildEmployeeHierarchy()

// Logic: This function builds an employee management system with
// polymorphic salary calculation (Employee -> Manager/Engineer/Intern).
// Each subclass overrides calculateSalary() with role-specific logic.


function buildEmployeeHierarchy(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.companyName !== 'string' ||
        typeof config.taxRate !== 'number' ||
        typeof config.bonusRules !== 'object' ||
        config.bonusRules === null
    ) {
        return "Invalid Input";
    }
    if (!["manager", "engineer", "intern"].every(k => k in config.bonusRules)) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE EMPLOYEE BASE CLASS ---
    class Employee {
        constructor(id, name, baseSalary, department) {
            this.id = id;
            this.name = name;
            this.baseSalary = baseSalary;
            this.department = department;
        }

        calculateSalary() {
            return this.baseSalary;
        }

        calculateTax() {
            return this.calculateSalary() * config.taxRate / 100;
        }

        getNetSalary() {
            return this.calculateSalary() - this.calculateTax();
        }

        getInfo() {
            return `ID: ${this.id}, Name: ${this.name}, Dept: ${this.department}`;
        }

        toString() {
            return `[Employee: ${this.id}]`;
        }
    }

    // --- STEP 3: DEFINE MANAGER CLASS ---
    class Manager extends Employee {
        constructor(id, name, baseSalary, department, teamSize) {
            super(id, name, baseSalary, department);
            this.teamSize = teamSize;
        }

        calculateSalary() {
            const bonus = this.baseSalary * config.bonusRules.manager / 100;
            const teamBonus = this.teamSize * 500;
            return this.baseSalary + bonus + teamBonus;
        }

        getInfo() {
            return `${super.getInfo()}, Team: ${this.teamSize}`;
        }
    }

    // --- STEP 4: DEFINE ENGINEER CLASS ---
    class Engineer extends Employee {
        constructor(id, name, baseSalary, department, techStack) {
            super(id, name, baseSalary, department);
            this.techStack = techStack || [];
        }

        calculateSalary() {
            const bonus = this.baseSalary * config.bonusRules.engineer / 100;
            const techBonus = this.techStack.length * 1000;
            return this.baseSalary + bonus + techBonus;
        }

        getInfo() {
            return `${super.getInfo()}, Stack: ${this.techStack.join(", ")}`;
        }
    }

    // --- STEP 5: DEFINE INTERN CLASS ---
    class Intern extends Employee {
        constructor(id, name, baseSalary, department, durationMonths) {
            super(id, name, baseSalary, department);
            this.durationMonths = durationMonths;
        }

        calculateSalary() {
            const prorated = this.baseSalary * (this.durationMonths / 12);
            const bonus = this.baseSalary * config.bonusRules.intern / 100;
            return prorated + bonus;
        }

        getInfo() {
            return `${super.getInfo()}, Duration: ${this.durationMonths} months`;
        }
    }

    // --- STEP 6: INITIALIZE HR STATE ---
    const employees = new Map(); // id -> Employee

    // --- STEP 6: DEFINE HR API ---
    function hire(type, ...args) {
        if (typeof type !== 'string') return "Invalid Input";

        let employee;
        switch (type) {
            case "manager":
                if (args.length !== 5) return "Invalid Arguments";
                employee = new Manager(...args);
                break;
            case "engineer":
                if (args.length !== 5) return "Invalid Arguments";
                employee = new Engineer(...args);
                break;
            case "intern":
                if (args.length !== 5) return "Invalid Arguments";
                employee = new Intern(...args);
                break;
            default:
                return "Invalid Employee Type";
        }

        employees.set(employee.id, employee);
        return employee;
    }

    function getEmployee(id) {
        return employees.get(id) || null;
    }

    function getPayroll() {
        const payroll = [];
        for (const emp of employees.values()) {
            const gross = emp.calculateSalary();
            const tax = emp.calculateTax();
            const net = emp.getNetSalary();
            payroll.push({
                id: emp.id,
                name: emp.name,
                type: emp.constructor.name,
                grossSalary: gross,
                tax: Math.round(tax),
                netSalary: Math.round(net)
            });
        }
        return payroll;
    }

    function getTotalPayrollCost() {
        let total = 0;
        for (const emp of employees.values()) {
            total += emp.calculateSalary();
        }
        return total;
    }

    function getDepartmentReport() {
        const report = {};
        for (const emp of employees.values()) {
            const salary = emp.calculateSalary();
            if (!report[emp.department]) {
                report[emp.department] = { count: 0, totalSalary: 0 };
            }
            report[emp.department].count++;
            report[emp.department].totalSalary += salary;
        }
        // Round total salaries
        for (const dept of Object.keys(report)) {
            report[dept].totalSalary = Math.round(report[dept].totalSalary);
        }
        return report;
    }

    // --- STEP 7: RETURN API ---
    return {
        hire,
        getEmployee,
        getPayroll,
        getTotalPayrollCost,
        getDepartmentReport
    };
}


// --- EXAMPLE USAGE ---
const hr = buildEmployeeHierarchy({ companyName: "TechCorp", taxRate: 10, bonusRules: { manager: 20, engineer: 15, intern: 5 } });

hr.hire("manager", "M001", "Rahim", 80000, "Engineering", 5);
hr.hire("engineer", "E001", "Karim", 60000, "Engineering", ["JS", "React", "Node"]);
hr.hire("intern", "I001", "Jamal", 15000, "Design", 6);

console.log(hr.getEmployee("M001").calculateSalary());
console.log(hr.getEmployee("E001").getNetSalary());
console.log(hr.getDepartmentReport());

// --- Invalid Input ---
console.log(buildEmployeeHierarchy("invalid"));