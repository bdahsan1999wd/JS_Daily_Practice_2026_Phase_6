// PROBLEM–05: createCoverageAnalyzer()

// Logic: Simulates a code coverage analyzer by registering functions, tracking executed branches, calculating statement/branch/function/line coverage, finding uncovered code, checking thresholds, and generating an Istanbul-style coverage report.

function createCoverageAnalyzer(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---
    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        targetModule,
        thresholds
    } = config;

    if (
        typeof targetModule !== "string" ||
        targetModule.trim() === "" ||
        typeof thresholds !== "object" ||
        thresholds === null ||
        Array.isArray(thresholds)
    ) {
        return "Invalid Input";
    }

    const requiredMetrics = [
        "statements",
        "branches",
        "functions",
        "lines"
    ];

    for (const metric of requiredMetrics) {
        if (
            typeof thresholds[metric] !== "number" ||
            !Number.isFinite(thresholds[metric]) ||
            thresholds[metric] < 0 ||
            thresholds[metric] > 100
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 2: CREATE INTERNAL FUNCTION STORAGE ---
    const functions = new Map();

    // --- STEP 3: CALCULATE PERCENTAGE ---
    function calculatePercentage(covered, total) {
        if (total === 0) {
            return 100;
        }

        return Number(
            ((covered / total) * 100).toFixed(2)
        );
    }

    // --- STEP 4: REGISTER FUNCTION AND BRANCHES ---
    function registerFunction(fnName, branches) {
        if (
            typeof fnName !== "string" ||
            fnName.trim() === "" ||
            !Array.isArray(branches)
        ) {
            return "Invalid Input";
        }

        if (functions.has(fnName)) {
            return "Invalid Input";
        }

        const branchMap = new Map();

        for (const branch of branches) {
            if (
                typeof branch !== "object" ||
                branch === null ||
                typeof branch.id !== "string" ||
                branch.id.trim() === "" ||
                typeof branch.condition !== "string" ||
                ![
                    "if",
                    "else",
                    "switch",
                    "ternary"
                ].includes(branch.type)
            ) {
                return "Invalid Input";
            }

            if (branchMap.has(branch.id)) {
                return "Invalid Input";
            }

            branchMap.set(branch.id, {
                id: branch.id,
                condition: branch.condition,
                type: branch.type,
                executed: false
            });
        }

        functions.set(fnName, {
            name: fnName,
            branches: branchMap,
            executed: false
        });

        return true;
    }

    // --- STEP 5: RECORD EXECUTED BRANCHES ---
    function recordExecution(fnName, executedBranches) {
        if (
            typeof fnName !== "string" ||
            !Array.isArray(executedBranches) ||
            !functions.has(fnName)
        ) {
            return "Invalid Input";
        }

        const targetFunction = functions.get(fnName);

        for (const branchId of executedBranches) {
            if (
                typeof branchId !== "string" ||
                !targetFunction.branches.has(branchId)
            ) {
                return "Invalid Input";
            }
        }

        // --- STEP 5A: MARK FUNCTION AS EXECUTED ---
        targetFunction.executed = true;

        // --- STEP 5B: MARK EXECUTED BRANCHES ---
        for (const branchId of executedBranches) {
            targetFunction.branches.get(branchId).executed = true;
        }

        return true;
    }

    // --- STEP 6: GET FUNCTION-LEVEL COVERAGE ---
    function getCoverage(fnName) {
        if (
            typeof fnName !== "string" ||
            !functions.has(fnName)
        ) {
            return "Invalid Input";
        }

        const targetFunction = functions.get(fnName);

        const branchList = [
            ...targetFunction.branches.values()
        ];

        const totalBranches = branchList.length;

        const coveredBranches = branchList.filter(
            branch => branch.executed
        ).length;

        const uncoveredBranches = branchList
            .filter(branch => !branch.executed)
            .map(branch => branch.id);

        // Statements and lines are represented by function execution
        // in this simplified coverage engine.
        const functionCoverage =
            targetFunction.executed ? 100 : 0;

        const branchCoverage =
            calculatePercentage(
                coveredBranches,
                totalBranches
            );

        return {
            statements: functionCoverage,
            branches: branchCoverage,
            functions: functionCoverage,
            lines: functionCoverage,
            uncoveredBranches
        };
    }

    // --- STEP 7: CALCULATE TOTAL COVERAGE ---
    function getTotalCoverage() {
        let totalFunctions = functions.size;
        let coveredFunctions = 0;

        let totalBranches = 0;
        let coveredBranches = 0;

        for (const targetFunction of functions.values()) {
            if (targetFunction.executed) {
                coveredFunctions++;
            }

            for (const branch of targetFunction.branches.values()) {
                totalBranches++;

                if (branch.executed) {
                    coveredBranches++;
                }
            }
        }

        const functionCoverage =
            calculatePercentage(
                coveredFunctions,
                totalFunctions
            );

        const branchCoverage =
            calculatePercentage(
                coveredBranches,
                totalBranches
            );

        return {
            statements: functionCoverage,
            branches: branchCoverage,
            functions: functionCoverage,
            lines: functionCoverage,
            totalFunctions,
            coveredFunctions,
            totalBranches,
            coveredBranches
        };
    }

    // --- STEP 8: FIND ALL UNCOVERED CODE ---
    function findUncovered() {
        const uncoveredFunctions = [];
        const uncoveredBranches = [];

        for (const targetFunction of functions.values()) {
            if (!targetFunction.executed) {
                uncoveredFunctions.push(
                    targetFunction.name
                );
            }

            for (const branch of targetFunction.branches.values()) {
                if (!branch.executed) {
                    uncoveredBranches.push({
                        function: targetFunction.name,
                        id: branch.id,
                        condition: branch.condition,
                        type: branch.type
                    });
                }
            }
        }

        return {
            functions: uncoveredFunctions,
            branches: uncoveredBranches
        };
    }

    // --- STEP 9: GENERATE ISTANBUL-STYLE REPORT ---
    function generateReport() {
        const rows = [];

        rows.push(
            "File | % Stmts | % Branch | % Funcs | % Lines"
        );

        rows.push(
            "-------------------------------------------------------"
        );

        for (const fnName of functions.keys()) {
            const coverage = getCoverage(fnName);

            rows.push(
                `${fnName} | ` +
                `${coverage.statements.toFixed(2)} | ` +
                `${coverage.branches.toFixed(2)} | ` +
                `${coverage.functions.toFixed(2)} | ` +
                `${coverage.lines.toFixed(2)}`
            );
        }

        const total = getTotalCoverage();

        rows.push(
            "-------------------------------------------------------"
        );

        rows.push(
            `${targetModule} | ` +
            `${total.statements.toFixed(2)} | ` +
            `${total.branches.toFixed(2)} | ` +
            `${total.functions.toFixed(2)} | ` +
            `${total.lines.toFixed(2)}`
        );

        return rows.join("\n");
    }

    // --- STEP 10: CHECK COVERAGE THRESHOLDS ---
    function meetsThreshold() {
        const coverage = getTotalCoverage();

        const failures = [];

        for (const metric of requiredMetrics) {
            if (
                coverage[metric] <
                thresholds[metric]
            ) {
                failures.push({
                    metric,
                    actual: coverage[metric],
                    threshold: thresholds[metric]
                });
            }
        }

        return {
            meets: failures.length === 0,
            failures
        };
    }

    // --- STEP 11: GENERATE FINAL REPORT OBJECT ---
    function getReport() {
        const total = getTotalCoverage();

        return {
            module: targetModule,
            functions: total.totalFunctions,
            totalBranches: total.totalBranches,
            coveredBranches: total.coveredBranches,
            overallCoverage:
                `${total.branches.toFixed(2)}%`
        };
    }

    // --- STEP 12: RETURN PUBLIC API ---
    return {
        registerFunction,
        recordExecution,
        getCoverage,
        getTotalCoverage,
        findUncovered,
        generateReport,
        meetsThreshold,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const coverage = createCoverageAnalyzer({
    targetModule: "UserService",
    thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80
    }
});


coverage.registerFunction(
    "createUser",
    [
        {
            id: "b1",
            condition: "email exists",
            type: "if"
        },
        {
            id: "b2",
            condition: "email invalid",
            type: "else"
        },
        {
            id: "b3",
            condition: "password exists",
            type: "if"
        },
        {
            id: "b4",
            condition: "password invalid",
            type: "else"
        }
    ]
);

coverage.registerFunction(
    "deleteUser",
    [
        {
            id: "b5",
            condition: "user exists",
            type: "if"
        },
        {
            id: "b6",
            condition: "user missing",
            type: "else"
        }
    ]
);

coverage.recordExecution(
    "createUser",
    ["b1", "b3"]
);

coverage.recordExecution(
    "createUser",
    ["b1", "b4"]
);

console.log(
    coverage.getCoverage("createUser")
);

console.log(
    coverage.getCoverage("deleteUser")
);

console.log(
    coverage.getTotalCoverage()
);

console.log(
    coverage.findUncovered()
);

console.log(
    coverage.generateReport()
);

console.log(
    coverage.meetsThreshold()
);

console.log(
    coverage.getReport()
);