// PROBLEM–05: createRegressionTestEngine()

// Logic: This function creates a regression-testing engine that stores baseline snapshots, compares future outputs, tracks known bugs, verifies bug fixes, and generates regression reports.

function createRegressionTestEngine(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    // Ensure all required configuration values have the correct types
    // and snapshotMode contains one of the supported modes.
    if (
        !config ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.moduleName !== "string" ||
        config.moduleName.trim() === "" ||
        !["create", "compare"].includes(config.snapshotMode) ||
        typeof config.tolerance !== "number" ||
        !Number.isFinite(config.tolerance) ||
        config.tolerance < 0
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STORAGE ---
    // Store snapshots and known bugs privately.
    const snapshots = new Map();
    const knownBugs = new Map();

    // --- STEP 3: CREATE DEEP EQUALITY HELPER ---
    // Compare primitive values, arrays, and objects recursively.
    const deepEqual = (expected, actual) => {
        if (
            typeof expected === "number" &&
            typeof actual === "number"
        ) {
            return Math.abs(expected - actual) <= config.tolerance;
        }

        if (Object.is(expected, actual)) {
            return true;
        }

        if (
            expected === null ||
            actual === null ||
            typeof expected !== "object" ||
            typeof actual !== "object"
        ) {
            return false;
        }

        if (Array.isArray(expected) !== Array.isArray(actual)) {
            return false;
        }

        if (Array.isArray(expected)) {
            if (expected.length !== actual.length) {
                return false;
            }

            return expected.every((value, index) =>
                deepEqual(value, actual[index])
            );
        }

        const expectedKeys = Object.keys(expected);
        const actualKeys = Object.keys(actual);

        if (expectedKeys.length !== actualKeys.length) {
            return false;
        }

        return expectedKeys.every(
            (key) =>
                Object.prototype.hasOwnProperty.call(actual, key) &&
                deepEqual(expected[key], actual[key])
        );
    };

    // --- STEP 4: CREATE SNAPSHOT CLONER ---
    // Clone objects and arrays so later mutations do not alter
    // the stored baseline snapshot.
    const cloneValue = (value) => {
        if (value === null || typeof value !== "object") {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map(cloneValue);
        }

        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                cloneValue(item)
            ])
        );
    };

    // --- STEP 5: DEFINE diffReport METHOD ---
    // Produce a detailed difference report between expected and actual values.
    const diffReport = (expected, actual) => {
        const changes = [];
        const addedKeys = [];
        const removedKeys = [];
        const modifiedKeys = [];

        if (
            expected &&
            actual &&
            typeof expected === "object" &&
            typeof actual === "object" &&
            !Array.isArray(expected) &&
            !Array.isArray(actual)
        ) {
            const expectedKeys = Object.keys(expected);
            const actualKeys = Object.keys(actual);

            actualKeys.forEach((key) => {
                if (!expectedKeys.includes(key)) {
                    addedKeys.push(key);

                    changes.push({
                        key,
                        type: "added",
                        actual: actual[key]
                    });
                }
            });

            expectedKeys.forEach((key) => {
                if (!actualKeys.includes(key)) {
                    removedKeys.push(key);

                    changes.push({
                        key,
                        type: "removed",
                        expected: expected[key]
                    });
                } else if (!deepEqual(expected[key], actual[key])) {
                    modifiedKeys.push(key);

                    changes.push({
                        key,
                        type: "modified",
                        expected: expected[key],
                        actual: actual[key]
                    });
                }
            });
        } else if (!deepEqual(expected, actual)) {
            changes.push({
                type: "value",
                expected,
                actual
            });
        }

        return {
            changes,
            addedKeys,
            removedKeys,
            modifiedKeys
        };
    };

    // --- STEP 6: DEFINE snapshot METHOD ---
    // Capture the current function output as a baseline snapshot.
    const snapshot = (testName, fn, input) => {
        if (
            typeof testName !== "string" ||
            testName.trim() === "" ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        try {
            const output = fn(input);

            const record = {
                name: testName,
                input: cloneValue(input),
                output: cloneValue(output)
            };

            snapshots.set(testName, {
                ...record,
                fn
            });

            return {
                name: testName,
                input: record.input,
                output: record.output,
                captured: true
            };
        } catch {
            return {
                name: testName,
                input: cloneValue(input),
                output: undefined,
                captured: false
            };
        }
    };

    // --- STEP 7: DEFINE compare METHOD ---
    // Execute the current function and compare its output against
    // the stored baseline snapshot.
    const compare = (testName, fn, input) => {
        if (
            typeof testName !== "string" ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        const stored = snapshots.get(testName);

        if (!stored) {
            return {
                name: testName,
                passed: false,
                expected: undefined,
                actual: undefined,
                diff: {
                    changes: [],
                    addedKeys: [],
                    removedKeys: [],
                    modifiedKeys: []
                }
            };
        }

        let actual;

        try {
            actual = fn(input);
        } catch (error) {
            return {
                name: testName,
                passed: false,
                expected: cloneValue(stored.output),
                actual: {
                    error: error.message
                },
                diff: diffReport(
                    stored.output,
                    {
                        error: error.message
                    }
                )
            };
        }

        const expected = cloneValue(stored.output);
        const passed = deepEqual(expected, actual);

        return {
            name: testName,
            passed,
            expected,
            actual: cloneValue(actual),
            diff: passed
                ? null
                : diffReport(expected, actual)
        };
    };

    // --- STEP 8: DEFINE addKnownBug METHOD ---
    // Store a known failing case together with its previous broken output.
    const addKnownBug = (
        bugId,
        description,
        input,
        brokenOutput
    ) => {
        if (
            typeof bugId !== "string" ||
            bugId.trim() === "" ||
            typeof description !== "string"
        ) {
            return "Invalid Input";
        }

        knownBugs.set(bugId, {
            bugId,
            description,
            input: cloneValue(input),
            brokenOutput: cloneValue(brokenOutput),
            fixed: false
        });

        return {
            bugId,
            description,
            stored: true
        };
    };

    // --- STEP 9: DEFINE verifyBugFixed METHOD ---
    // Re-run a known bug input and determine whether its output
    // differs from the previously recorded broken output.
    const verifyBugFixed = (bugId, fn) => {
        if (
            typeof bugId !== "string" ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        const bug = knownBugs.get(bugId);

        if (!bug) {
            return {
                bugId,
                fixed: false,
                previousOutput: undefined,
                currentOutput: undefined
            };
        }

        let currentOutput;

        try {
            currentOutput = fn(bug.input);
        } catch (error) {
            currentOutput = {
                error: error.message
            };
        }

        const fixed = !deepEqual(
            bug.brokenOutput,
            currentOutput
        );

        bug.fixed = fixed;
        bug.currentOutput = cloneValue(currentOutput);

        return {
            bugId,
            fixed,
            previousOutput: cloneValue(bug.brokenOutput),
            currentOutput: cloneValue(currentOutput)
        };
    };

    // --- STEP 10: DEFINE runRegressionSuite METHOD ---
    // Compare every stored snapshot and verify every known bug.
    const runRegressionSuite = () => {
        const results = [];
        let passed = 0;
        let failed = 0;
        let newRegressions = 0;
        let fixedBugs = 0;

        snapshots.forEach((stored) => {
            const result = compare(
                stored.name,
                stored.fn,
                stored.input
            );

            results.push(result);

            if (result.passed) {
                passed++;
            } else {
                failed++;
                newRegressions++;
            }
        });

        knownBugs.forEach((bug) => {
            const result = verifyBugFixed(
                bug.bugId,
                (input) => bug.currentFn
                    ? bug.currentFn(input)
                    : bug.brokenOutput
            );

            if (result.fixed) {
                fixedBugs++;
            }
        });

        return {
            total: results.length,
            passed,
            failed,
            newRegressions,
            fixedBugs,
            results
        };
    };

    // --- STEP 11: DEFINE getReport METHOD ---
    // Return a compact regression-testing summary.
    const getReport = () => {
        let regressionCount = 0;
        let fixedBugCount = 0;

        snapshots.forEach((stored) => {
            const result = compare(
                stored.name,
                stored.fn,
                stored.input
            );

            if (!result.passed) {
                regressionCount++;
            }
        });

        knownBugs.forEach((bug) => {
            if (bug.fixed) {
                fixedBugCount++;
            }
        });

        return {
            moduleName: config.moduleName,
            totalSnapshots: snapshots.size,
            regressions: regressionCount,
            knownBugs: knownBugs.size,
            fixedBugs: fixedBugCount
        };
    };

    // --- STEP 12: RETURN REGRESSION TEST ENGINE API ---
    return {
        snapshot,
        compare,
        addKnownBug,
        verifyBugFixed,
        runRegressionSuite,
        diffReport,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const engine = createRegressionTestEngine({
    moduleName: "UserService",
    snapshotMode: "create",
    tolerance: 0
});

console.log(
    engine.snapshot(
        "createUser returns correct shape",
        (input) => ({
            id: 1,
            ...input,
            createdAt: "2024-01-01"
        }),
        {
            name: "Rahim",
            email: "r@mail.com"
        }
    )
);

console.log(
    engine.addKnownBug(
        "BUG-001",
        "Email not trimmed",
        {
            email: "  rahim@mail.com  "
        },
        {
            email: "  rahim@mail.com  "
        }
    )
);

console.log(
    engine.verifyBugFixed(
        "BUG-001",
        (input) => ({
            email: input.email.trim()
        })
    )
);

console.log(
    engine.compare(
        "createUser returns correct shape",
        (input) => ({
            id: 1,
            ...input,
            createdAt: "2024-01-01"
        }),
        {
            name: "Rahim",
            email: "r@mail.com"
        }
    )
);

console.log(engine.getReport());