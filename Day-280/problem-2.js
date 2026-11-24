// PROBLEM–02: createBoundaryTester()

// Logic: This function creates a boundary-value testing engine. It automatically tests values below, at, and above configured boundaries, then organizes the results into equivalence classes.

function createBoundaryTester(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    // Ensure config contains a valid target function and boundary definitions.
    if (
        !config ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.targetFn !== "function" ||
        !Array.isArray(config.boundaries) ||
        config.boundaries.length === 0
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH BOUNDARY DEFINITION ---
    // Every boundary must contain valid parameter metadata,
    // numeric/null limits, and all required expected behaviors.
    const validBoundary = (boundary) => {
        if (
            !boundary ||
            typeof boundary !== "object" ||
            typeof boundary.param !== "string" ||
            !["number", "string", "array"].includes(boundary.type) ||
            !(
                typeof boundary.min === "number" ||
                boundary.min === null
            ) ||
            !(
                typeof boundary.max === "number" ||
                boundary.max === null
            ) ||
            !boundary.expectedBehavior ||
            typeof boundary.expectedBehavior !== "object"
        ) {
            return false;
        }

        const behaviors = [
            boundary.expectedBehavior.atMin,
            boundary.expectedBehavior.belowMin,
            boundary.expectedBehavior.atMax,
            boundary.expectedBehavior.aboveMax
        ];

        return behaviors.every((behavior) =>
            ["valid", "invalid", "throws"].includes(behavior)
        );
    };

    if (!config.boundaries.every(validBoundary)) {
        return "Invalid Input";
    }

    // --- STEP 3: INITIALIZE PRIVATE TEST STORAGE ---
    const results = [];

    // --- STEP 4: CREATE EXECUTION HELPER ---
    // Execute the target function and convert thrown exceptions into
    // the common "throws" behavior.
    const executeTarget = (value) => {
        try {
            return {
                behavior: "valid",
                output: config.targetFn(value),
                threw: false
            };
        } catch (error) {
            return {
                behavior: "throws",
                output: error,
                threw: true
            };
        }
    };

    // --- STEP 5: CREATE BEHAVIOR CLASSIFIER ---
    // Interpret the target function result.
    // "Invalid Input" is treated as an invalid result.
    const classifyResult = (execution) => {
        if (execution.threw) {
            return "throws";
        }

        if (execution.output === "Invalid Input") {
            return "invalid";
        }

        return "valid";
    };

    // --- STEP 6: DEFINE testBoundary METHOD ---
    // Test one value against an expected behavior.
    const testBoundary = (param, value, expectation) => {
        if (
            typeof param !== "string" ||
            !["valid", "invalid", "throws"].includes(expectation)
        ) {
            return "Invalid Input";
        }

        const execution = executeTarget(value);
        const actual = classifyResult(execution);

        const result = {
            param,
            value,
            expectation,
            actual:
                actual === "throws"
                    ? execution.output.message
                    : execution.output,
            passed: actual === expectation
        };

        results.push(result);

        return result;
    };

    // --- STEP 7: GENERATE NUMERIC BOUNDARY VALUES ---
    // Generate below-min, min, midpoint, max, and above-max values.
    const generateValues = (boundary) => {
        const values = [];

        if (boundary.min !== null) {
            values.push({
                value: boundary.min - 1,
                label: "belowMin",
                expectation: boundary.expectedBehavior.belowMin
            });

            values.push({
                value: boundary.min,
                label: "atMin",
                expectation: boundary.expectedBehavior.atMin
            });
        }

        if (boundary.min !== null && boundary.max !== null) {
            const midpoint =
                Math.floor((boundary.min + boundary.max) / 2);

            values.push({
                value: midpoint,
                label: "midpoint",
                expectation: "valid"
            });
        }

        if (boundary.max !== null) {
            values.push({
                value: boundary.max,
                label: "atMax",
                expectation: boundary.expectedBehavior.atMax
            });

            values.push({
                value: boundary.max + 1,
                label: "aboveMax",
                expectation: boundary.expectedBehavior.aboveMax
            });
        }

        return values;
    };

    // --- STEP 8: DEFINE runBoundaryTests METHOD ---
    // Automatically execute all generated boundary test cases.
    const runBoundaryTests = () => {
        results.length = 0;

        const boundaryResults = [];

        config.boundaries.forEach((boundary) => {
            const values = generateValues(boundary);

            values.forEach((item) => {
                const testResult = testBoundary(
                    boundary.param,
                    item.value,
                    item.expectation
                );

                boundaryResults.push({
                    param: boundary.param,
                    value: item.value,
                    label: item.label,
                    passed: testResult.passed
                });
            });
        });

        const passed = boundaryResults.filter(
            (item) => item.passed
        ).length;

        return {
            total: boundaryResults.length,
            passed,
            failed: boundaryResults.length - passed,
            boundaryResults
        };
    };

    // --- STEP 9: DEFINE findEdgeFailures METHOD ---
    // Return only the generated boundary tests that failed.
    const findEdgeFailures = () => {
        return results.filter((result) => !result.passed);
    };

    // --- STEP 10: DEFINE getEquivalenceClasses METHOD ---
    // Generate representative values for below-min, valid-range,
    // and above-max equivalence partitions.
    const getEquivalenceClasses = () => {
        const classes = {
            belowMin: [],
            validRange: [],
            aboveMax: []
        };

        config.boundaries.forEach((boundary) => {
            if (boundary.min !== null) {
                classes.belowMin.push(boundary.min - 1);
                classes.belowMin.push(boundary.min - 2);
                classes.belowMin.push(boundary.min - 3);
            }

            if (boundary.min !== null && boundary.max !== null) {
                classes.validRange.push(boundary.min);

                classes.validRange.push(
                    Math.floor((boundary.min + boundary.max) / 2)
                );

                classes.validRange.push(boundary.max);
            }

            if (boundary.max !== null) {
                classes.aboveMax.push(boundary.max + 1);
                classes.aboveMax.push(boundary.max + 2);
            }
        });

        return classes;
    };

    // --- STEP 11: DEFINE getReport METHOD ---
    const getReport = () => {
        const totalTests = results.length;
        const passed = results.filter(
            (result) => result.passed
        ).length;

        return {
            totalBoundaries: config.boundaries.length,
            totalTests,
            passRate:
                totalTests === 0
                    ? "0.00%"
                    : `${((passed / totalTests) * 100).toFixed(2)}%`,
            criticalFailures: findEdgeFailures().length
        };
    };

    // --- STEP 12: RETURN BOUNDARY TESTER API ---
    return {
        testBoundary,
        runBoundaryTests,
        findEdgeFailures,
        getEquivalenceClasses,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const tester = createBoundaryTester({
    targetFn: (age) => {
        if (typeof age !== "number") {
            return "Invalid Input";
        }

        if (age < 18) {
            return "Minor";
        }

        if (age > 120) {
            return "Invalid Input";
        }

        return "Adult";
    },

    boundaries: [
        {
            param: "age",
            type: "number",
            min: 18,
            max: 120,
            expectedBehavior: {
                atMin: "valid",
                belowMin: "valid",
                atMax: "valid",
                aboveMax: "invalid"
            }
        }
    ]
});

console.log(tester.testBoundary("age", 18, "valid"));
console.log(tester.testBoundary("age", 17, "valid"));
console.log(tester.testBoundary("age", 121, "invalid"));

console.log(tester.runBoundaryTests());

console.log(tester.getEquivalenceClasses());

console.log(tester.getReport());