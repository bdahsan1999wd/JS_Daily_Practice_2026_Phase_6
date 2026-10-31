
// PROBLEM–04: createEdgeCaseGenerator()

// Logic: Generates edge-case inputs, executes the target function, detects crashes, identifies invalid outputs, and creates a test report.

function createEdgeCaseGenerator(config) {

    // STEP 1: VALIDATE CONFIGURATION
    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        targetFn,
        paramTypes,
        includeNull,
        includeBoundary
    } = config;

    if (
        typeof targetFn !== "function" ||
        !Array.isArray(paramTypes) ||
        paramTypes.length === 0 ||
        typeof includeNull !== "boolean" ||
        typeof includeBoundary !== "boolean"
    ) {
        return "Invalid Input";
    }

    // STEP 2: DEFINE SUPPORTED TYPES
    const supportedTypes = [
        "number",
        "string",
        "array",
        "object",
        "boolean"
    ];

    if (
        paramTypes.some(
            type => !supportedTypes.includes(type)
        )
    ) {
        return "Invalid Input";
    }

    // STEP 3: GENERATE CASES BY TYPE
    function generateCasesByType(type) {
        switch (type) {
            case "number": {
                const cases = [
                    0,
                    -1,
                    1,
                    NaN,
                    Infinity,
                    -Infinity
                ];

                if (includeBoundary) {
                    cases.push(
                        Number.MAX_SAFE_INTEGER,
                        Number.MIN_SAFE_INTEGER
                    );
                }

                return cases;
            }

            case "string": {
                const cases = [
                    "",
                    " ",
                    "a",
                    "null",
                    "undefined",
                    "<script>",
                    "'; DROP TABLE"
                ];

                if (includeBoundary) {
                    cases.push("a".repeat(1000));
                }

                return cases;
            }

            case "array": {
                const cases = [
                    [],
                    [null],
                    [undefined]
                ];

                if (includeBoundary) {
                    cases.push(
                        Array(1000).fill(0)
                    );
                }

                return cases;
            }

            case "object": {
                const cases = [
                    {}
                ];

                if (includeBoundary) {
                    cases.push(
                        Object.create(null),
                        { ["__proto__"]: {} },
                        { [Symbol("key")]: "value" }
                    );
                }

                return cases;
            }

            case "boolean":
                return [
                    true,
                    false,
                    0,
                    1,
                    "true",
                    "false"
                ];

            default:
                return [];
        }
    }

    // STEP 4: GENERATE NULL AND UNDEFINED CASES
    function getNullCases() {
        return includeNull
            ? [null, undefined]
            : [];
    }

    // STEP 5: CREATE CARTESIAN PRODUCT
    function cartesianProduct(groups) {
        return groups.reduce(
            (accumulator, currentGroup) => {
                const combinations = [];

                for (const existing of accumulator) {
                    for (const current of currentGroup) {
                        combinations.push([
                            ...existing,
                            current
                        ]);
                    }
                }

                return combinations;
            },
            [[]]
        );
    }

    // STEP 6: GENERATE ALL TEST CASES
    function generate() {
        const groups = paramTypes.map(type => [
            ...generateCasesByType(type),
            ...getNullCases()
        ]);

        const cases = cartesianProduct(groups);

        return {
            cases,
            total: cases.length
        };
    }

    // STEP 7: EXECUTE TARGET FUNCTION
    function executeTarget(input) {
        return targetFn(...input);
    }

    // STEP 8: IDENTIFY CASE TYPE
    function getTypeLabel(input) {
        if (paramTypes.length > 1) {
            return paramTypes.join("+");
        }

        const value = input[0];

        if (value === null) {
            return "null";
        }

        if (value === undefined) {
            return "undefined";
        }

        if (Array.isArray(value)) {
            return "array";
        }

        return typeof value;
    }

    // STEP 9: RUN ALL TEST CASES
    function runAll() {
        const generated = generate();

        let passed = 0;
        let failed = 0;

        const errors = [];
        const crashedOn = [];

        for (const input of generated.cases) {
            try {
                executeTarget(input);
                passed++;
            } catch (error) {
                failed++;

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : String(error);

                errors.push({
                    input,
                    error: errorMessage
                });

                crashedOn.push(input);
            }
        }

        return {
            total: generated.total,
            passed,
            failed,
            errors,
            crashedOn
        };
    }

    // STEP 10: FIND CRASH INPUTS
    function findCrashInputs() {
        const generated = generate();
        const crashedInputs = [];

        for (const input of generated.cases) {
            try {
                executeTarget(input);
            } catch {
                crashedInputs.push(input);
            }
        }

        return crashedInputs;
    }

    // STEP 11: FIND INVALID OUTPUTS
    function findInvalidOutputs(validator) {
        if (typeof validator !== "function") {
            return "Invalid Input";
        }

        const generated = generate();
        const invalidInputs = [];

        for (const input of generated.cases) {
            try {
                const output = executeTarget(input);

                let valid;

                try {
                    valid = validator(output, input);
                } catch {
                    valid = false;
                }

                if (!valid) {
                    invalidInputs.push(input);
                }
            } catch {
                // Crashed inputs cannot produce valid outputs.
                invalidInputs.push(input);
            }
        }

        return invalidInputs;
    }

    // STEP 12: GENERATE EDGE-CASE REPORT
    function getReport() {
        const generated = generate();
        const execution = runAll();

        const byType = {};

        for (const input of generated.cases) {
            const typeLabel = getTypeLabel(input);

            byType[typeLabel] =
                (byType[typeLabel] || 0) + 1;
        }

        const passRate =
            execution.total === 0
                ? "0.00%"
                : `${(
                    (execution.passed / execution.total) *
                    100
                ).toFixed(2)}%`;

        return {
            totalCases: generated.total,
            byType,
            crashCount: execution.failed,
            passRate
        };
    }

    // STEP 13: RETURN PUBLIC API
    return {
        generate,
        runAll,
        findCrashInputs,
        findInvalidOutputs,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const edgeTester = createEdgeCaseGenerator({
    targetFn: value => value * 2,
    paramTypes: ["number"],
    includeNull: true,
    includeBoundary: true
});


if (edgeTester === "Invalid Input") {
    console.log(edgeTester);
} else {
    console.log("\n--- GENERATED CASES ---");
    console.dir(edgeTester.generate(), { depth: null });

    console.log("\n--- EXECUTION RESULTS ---");
    console.dir(edgeTester.runAll(), { depth: null });

    console.log("\n--- CRASH INPUTS ---");
    console.dir(edgeTester.findCrashInputs(), { depth: null });

    console.log("\n--- INVALID OUTPUTS ---");
    console.dir(
        edgeTester.findInvalidOutputs(
            output =>
                typeof output === "number" &&
                Number.isFinite(output)
        ),
        { depth: null }
    );

    console.log("\n--- EDGE-CASE REPORT ---");
    console.dir(edgeTester.getReport(), { depth: null });
}