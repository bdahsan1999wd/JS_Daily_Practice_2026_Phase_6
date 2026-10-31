// PROBLEM–01: createTestRunner()

// Logic: Creates a lightweight test runner that supports test registration, assertions, skipped tests, test execution, failure control, timeout simulation, and test reporting.

function createTestRunner(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---
    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        suiteName,
        stopOnFail,
        timeout
    } = config;

    if (
        typeof suiteName !== "string" ||
        suiteName.trim() === "" ||
        typeof stopOnFail !== "boolean" ||
        typeof timeout !== "number" ||
        !Number.isFinite(timeout) ||
        timeout < 0
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: CREATE INTERNAL TEST STORAGE ---
    const tests = [];

    // --- STEP 3: DEEP EQUALITY HELPER ---
    function deepEqual(a, b) {
        if (a === b) {
            return true;
        }

        if (
            typeof a !== "object" ||
            typeof b !== "object" ||
            a === null ||
            b === null
        ) {
            return false;
        }

        if (Array.isArray(a) !== Array.isArray(b)) {
            return false;
        }

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) {
            return false;
        }

        for (const key of keysA) {
            if (!Object.prototype.hasOwnProperty.call(b, key)) {
                return false;
            }

            if (!deepEqual(a[key], b[key])) {
                return false;
            }
        }

        return true;
    }

    // --- STEP 4: CREATE ASSERTION ENGINE ---
    function createExpect(value) {
        let negate = false;

        function createAssertion(condition, message) {
            const finalCondition = negate ? !condition : condition;

            if (!finalCondition) {
                throw new Error(
                    negate
                        ? `Expected value not to satisfy: ${message}`
                        : message
                );
            }

            negate = false;

            return assertion;
        }

        const assertion = {
            toBe(expected) {
                return createAssertion(
                    value === expected,
                    `Expected ${String(value)} to be ${String(expected)}`
                );
            },

            toEqual(expected) {
                return createAssertion(
                    deepEqual(value, expected),
                    "Expected values to be deeply equal"
                );
            },

            toBeTruthy() {
                return createAssertion(
                    Boolean(value),
                    `Expected ${String(value)} to be truthy`
                );
            },

            toBeFalsy() {
                return createAssertion(
                    !value,
                    `Expected ${String(value)} to be falsy`
                );
            },

            toBeNull() {
                return createAssertion(
                    value === null,
                    "Expected value to be null"
                );
            },

            toBeUndefined() {
                return createAssertion(
                    value === undefined,
                    "Expected value to be undefined"
                );
            },

            toThrow() {
                let didThrow = false;

                if (typeof value === "function") {
                    try {
                        value();
                    } catch {
                        didThrow = true;
                    }
                }

                return createAssertion(
                    didThrow,
                    "Expected function to throw"
                );
            },

            toContain(item) {
                let contains = false;

                if (typeof value === "string") {
                    contains = value.includes(item);
                } else if (Array.isArray(value)) {
                    contains = value.includes(item);
                }

                return createAssertion(
                    contains,
                    `Expected value to contain ${String(item)}`
                );
            },

            toHaveLength(length) {
                const hasLength =
                    value !== null &&
                    value !== undefined &&
                    typeof value.length === "number" &&
                    value.length === length;

                return createAssertion(
                    hasLength,
                    `Expected value to have length ${length}`
                );
            }
        };

        Object.defineProperty(assertion, "not", {
            get() {
                negate = true;
                return assertion;
            }
        });

        return assertion;
    }

    // --- STEP 5: DESCRIBE ---
    function describe(name, fn) {
        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        const previousSuite = describe.currentSuite;

        describe.currentSuite = name;

        try {
            fn();
        } finally {
            describe.currentSuite = previousSuite;
        }
    }

    describe.currentSuite = suiteName;

    // --- STEP 6: REGISTER A TEST ---
    function it(testName, fn) {
        if (
            typeof testName !== "string" ||
            testName.trim() === "" ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        tests.push({
            name: testName,
            fn,
            suite: describe.currentSuite || suiteName,
            skipped: false,
            only: false
        });

        return tests.length;
    }

    // --- STEP 7: REGISTER A SKIPPED TEST ---
    function skip(testName, fn) {
        if (
            typeof testName !== "string" ||
            testName.trim() === "" ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        tests.push({
            name: testName,
            fn,
            suite: describe.currentSuite || suiteName,
            skipped: true,
            only: false
        });

        return tests.length;
    }

    // --- STEP 8: RUN ALL REGISTERED TESTS ---
    function run() {
        const results = [];

        let passed = 0;
        let failed = 0;
        let skipped = 0;
        let duration = 0;

        let shouldStop = false;

        for (const test of tests) {
            // --- STEP 8A: HANDLE EXPLICITLY SKIPPED TESTS ---
            if (test.skipped) {
                skipped++;

                results.push({
                    name: test.name,
                    status: "skipped",
                    duration: 0
                });

                continue;
            }

            // --- STEP 8B: HANDLE STOP-ON-FAIL BEHAVIOR ---
            if (shouldStop) {
                skipped++;

                results.push({
                    name: test.name,
                    status: "skipped",
                    duration: 0
                });

                continue;
            }

            // --- STEP 8C: SIMULATE TEST EXECUTION TIME ---
            const operationCount = 1;

            if (operationCount > timeout && timeout > 0) {
                failed++;

                results.push({
                    name: test.name,
                    status: "failed",
                    error: "Test timeout",
                    duration: timeout
                });

                duration += timeout;

                if (stopOnFail) {
                    shouldStop = true;
                }

                continue;
            }

            // --- STEP 8D: EXECUTE TEST FUNCTION ---
            const start = duration;

            try {
                const expect = createExpect;

                test.fn(expect);

                passed++;

                results.push({
                    name: test.name,
                    status: "passed",
                    duration: operationCount
                });
            } catch (error) {
                failed++;

                results.push({
                    name: test.name,
                    status: "failed",
                    error: error instanceof Error
                        ? error.message
                        : String(error),
                    duration: operationCount
                });

                if (stopOnFail) {
                    shouldStop = true;
                }
            }

            duration = start + operationCount;
        }

        return {
            passed,
            failed,
            skipped,
            total: tests.length,
            duration,
            results
        };
    }

    // --- STEP 9: GENERATE TEST REPORT ---
    function getReport() {
        const execution = run();

        const executed =
            execution.passed +
            execution.failed +
            execution.skipped;

        const passRate =
            executed === 0
                ? "0.00%"
                : `${(
                    (execution.passed / executed) *
                    100
                ).toFixed(2)}%`;

        return {
            suiteName,
            passed: execution.passed,
            failed: execution.failed,
            skipped: execution.skipped,
            passRate
        };
    }

    // --- STEP 10: RETURN TEST RUNNER API ---
    return {
        describe,
        it,
        skip,
        expect: createExpect,
        run,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const runner = createTestRunner({
    suiteName: "Math Utils",
    stopOnFail: false,
    timeout: 10
});


runner.describe("addition", () => {
    runner.it("should add two numbers", (expect) => {
        expect(2 + 3).toBe(5);
    });

    runner.it("should return wrong result", (expect) => {
        expect(2 + 2).toBe(5);
    });
});

runner.it("should validate truthy value", (expect) => {
    expect("JavaScript").toBeTruthy();
});

runner.skip("future test", (expect) => {
    expect(true).toBe(true);
});


console.log(runner.run());
console.log(runner.getReport());