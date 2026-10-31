// PROBLEM–03: createTestSuite()

// Logic: Creates a test suite with lifecycle hooks, normal tests, parametrized tests, exclusive tests, skipped tests, categories, tags, filtered execution, and summary reporting.

function createTestSuite(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---
    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        name,
        beforeEach,
        afterEach,
        beforeAll,
        afterAll
    } = config;

    if (
        typeof name !== "string" ||
        name.trim() === ""
    ) {
        return "Invalid Input";
    }

    if (
        beforeEach !== null &&
        beforeEach !== undefined &&
        typeof beforeEach !== "function"
    ) {
        return "Invalid Input";
    }

    if (
        afterEach !== null &&
        afterEach !== undefined &&
        typeof afterEach !== "function"
    ) {
        return "Invalid Input";
    }

    if (
        beforeAll !== null &&
        beforeAll !== undefined &&
        typeof beforeAll !== "function"
    ) {
        return "Invalid Input";
    }

    if (
        afterAll !== null &&
        afterAll !== undefined &&
        typeof afterAll !== "function"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: CREATE INTERNAL STORAGE ---
    const tests = [];

    const lifecycle = {
        beforeEach: 0,
        afterEach: 0,
        beforeAll: 0,
        afterAll: 0
    };

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

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) {
            return false;
        }

        return keysA.every(key =>
            Object.prototype.hasOwnProperty.call(b, key) &&
            deepEqual(a[key], b[key])
        );
    }

    // --- STEP 4: CREATE BASIC EXPECT ENGINE ---
    function createExpect(value) {
        const assertion = {
            toBe(expected) {
                if (value !== expected) {
                    throw new Error(
                        `Expected ${String(value)} to be ${String(expected)}`
                    );
                }

                return assertion;
            },

            hasKey(key) {
                if (
                    value === null ||
                    typeof value !== "object" ||
                    !Object.prototype.hasOwnProperty.call(value, key)
                ) {
                    throw new Error(
                        `Expected object to have key ${key}`
                    );
                }

                return assertion;
            },

            matches(regex) {
                if (
                    !(regex instanceof RegExp) ||
                    typeof value !== "string" ||
                    !regex.test(value)
                ) {
                    throw new Error(
                        `Expected value to match ${regex}`
                    );
                }

                return assertion;
            },

            toEqual(expected) {
                if (!deepEqual(value, expected)) {
                    throw new Error(
                        "Expected values to be deeply equal"
                    );
                }

                return assertion;
            }
        };

        return assertion;
    }

    // --- STEP 5: ADD NORMAL TEST ---
    function addTest(testName, fn, category) {
        if (
            typeof testName !== "string" ||
            testName.trim() === "" ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        if (
            category !== undefined &&
            category !== null &&
            typeof category !== "string"
        ) {
            return "Invalid Input";
        }

        tests.push({
            name: testName,
            fn,
            category: category || null,
            tags: [],
            skipped: false,
            only: false
        });

        return tests.length;
    }

    // --- STEP 6: ADD PARAMETRIZED TESTS ---
    function addParametrized(testName, fn, cases) {
        if (
            typeof testName !== "string" ||
            testName.trim() === "" ||
            typeof fn !== "function" ||
            !Array.isArray(cases)
        ) {
            return "Invalid Input";
        }

        for (let index = 0; index < cases.length; index++) {
            const currentCase = cases[index];

            if (
                typeof currentCase !== "object" ||
                currentCase === null ||
                !("input" in currentCase) ||
                !("expected" in currentCase)
            ) {
                return "Invalid Input";
            }

            tests.push({
                name: `${testName} [case ${index + 1}]`,
                fn: expect =>
                    fn(expect, {
                        input: currentCase.input,
                        expected: currentCase.expected
                    }),
                category: null,
                tags: [],
                skipped: false,
                only: false
            });
        }

        return tests.length;
    }

    // --- STEP 7: ADD EXCLUSIVE TEST ---
    function only(testName, fn) {
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
            category: null,
            tags: [],
            skipped: false,
            only: true
        });

        return tests.length;
    }

    // --- STEP 8: ADD SKIPPED TEST ---
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
            category: null,
            tags: [],
            skipped: true,
            only: false
        });

        return tests.length;
    }

    // --- STEP 9: ADD TAGS TO A TEST ---
    function tag(testName, ...tags) {
        if (
            typeof testName !== "string" ||
            testName.trim() === "" ||
            tags.length === 0
        ) {
            return "Invalid Input";
        }

        const targetTests = tests.filter(
            test => test.name === testName
        );

        if (targetTests.length === 0) {
            return "Invalid Input";
        }

        if (
            tags.some(
                currentTag =>
                    typeof currentTag !== "string" ||
                    currentTag.trim() === ""
            )
        ) {
            return "Invalid Input";
        }

        for (const test of targetTests) {
            for (const currentTag of tags) {
                if (!test.tags.includes(currentTag)) {
                    test.tags.push(currentTag);
                }
            }
        }

        return true;
    }

    // --- STEP 10: EXECUTE SELECTED TESTS ---
    function executeTests(selectedTests) {
        const results = [];

        let passed = 0;
        let failed = 0;
        let skipped = 0;

        for (const test of selectedTests) {
            // --- STEP 10A: HANDLE SKIPPED TEST ---
            if (test.skipped) {
                skipped++;

                results.push({
                    name: test.name,
                    status: "skipped"
                });

                continue;
            }

            let testFailed = false;
            let errorMessage = null;

            // --- STEP 10B: RUN BEFORE EACH HOOK ---
            if (typeof beforeEach === "function") {
                lifecycle.beforeEach++;

                try {
                    beforeEach();
                } catch (error) {
                    testFailed = true;
                    errorMessage =
                        error instanceof Error
                            ? error.message
                            : String(error);
                }
            }

            // --- STEP 10C: RUN TEST FUNCTION ---
            if (!testFailed) {
                try {
                    test.fn(createExpect);
                } catch (error) {
                    testFailed = true;
                    errorMessage =
                        error instanceof Error
                            ? error.message
                            : String(error);
                }
            }

            // --- STEP 10D: RUN AFTER EACH HOOK ---
            if (typeof afterEach === "function") {
                lifecycle.afterEach++;

                try {
                    afterEach();
                } catch (error) {
                    if (!testFailed) {
                        testFailed = true;
                        errorMessage =
                            error instanceof Error
                                ? error.message
                                : String(error);
                    }
                }
            }

            // --- STEP 10E: STORE TEST RESULT ---
            if (testFailed) {
                failed++;

                results.push({
                    name: test.name,
                    status: "failed",
                    error: errorMessage
                });
            } else {
                passed++;

                results.push({
                    name: test.name,
                    status: "passed"
                });
            }
        }

        return {
            total: selectedTests.length,
            passed,
            failed,
            skipped,
            results
        };
    }

    // --- STEP 11: RUN CATEGORY ---
    function runCategory(category) {
        if (
            typeof category !== "string" ||
            category.trim() === ""
        ) {
            return "Invalid Input";
        }

        const selectedTests = tests.filter(
            test => test.category === category
        );

        return executeTests(selectedTests);
    }

    // --- STEP 12: RUN TESTS BY TAG ---
    function runByTag(tagName) {
        if (
            typeof tagName !== "string" ||
            tagName.trim() === ""
        ) {
            return "Invalid Input";
        }

        const selectedTests = tests.filter(
            test => test.tags.includes(tagName)
        );

        return executeTests(selectedTests);
    }

    // --- STEP 13: RUN COMPLETE TEST SUITE ---
    function run() {
        // --- STEP 13A: RUN BEFORE ALL ---
        if (typeof beforeAll === "function") {
            lifecycle.beforeAll++;
            beforeAll();
        }

        // --- STEP 13B: CHECK EXCLUSIVE TESTS ---
        const exclusiveTests = tests.filter(
            test => test.only
        );

        const selectedTests =
            exclusiveTests.length > 0
                ? tests.filter(
                    test =>
                        test.only ||
                        test.skipped
                )
                : tests;

        // --- STEP 13C: EXECUTE TESTS ---
        const execution = executeTests(selectedTests);

        // --- STEP 13D: RUN AFTER ALL ---
        if (typeof afterAll === "function") {
            lifecycle.afterAll++;
            afterAll();
        }

        return {
            total: execution.total,
            passed: execution.passed,
            failed: execution.failed,
            skipped: execution.skipped,
            lifecycle: {
                ...lifecycle
            },
            results: execution.results
        };
    }

    // --- STEP 14: GENERATE SUITE SUMMARY ---
    function getSummary() {
        const categories = [];
        const tags = [];

        const byCategory = {};

        for (const test of tests) {
            // --- STEP 14A: COLLECT CATEGORIES ---
            if (
                test.category &&
                !categories.includes(test.category)
            ) {
                categories.push(test.category);
            }

            // --- STEP 14B: COLLECT TAGS ---
            for (const currentTag of test.tags) {
                if (!tags.includes(currentTag)) {
                    tags.push(currentTag);
                }
            }

            // --- STEP 14C: COUNT TESTS BY CATEGORY ---
            const categoryName =
                test.category || "uncategorized";

            byCategory[categoryName] =
                (byCategory[categoryName] || 0) + 1;
        }

        return {
            name,
            categories,
            tags,
            testCount: tests.length,
            byCategory
        };
    }

    // --- STEP 15: RETURN PUBLIC API ---
    return {
        addTest,
        addParametrized,
        only,
        skip,
        tag,
        runCategory,
        runByTag,
        run,
        getSummary
    };
}


// --- EXAMPLE USAGE ---
const userSuite = createTestSuite({
    name: "User Service Tests",

    beforeEach() {
        console.log("Before Each");
    },

    afterEach() {
        console.log("After Each");
    },

    beforeAll() {
        console.log("Before All");
    },

    afterAll() {
        console.log("After All");
    }
});


userSuite.addTest(
    "creates user",
    expect => {
        expect({
            id: 1,
            name: "Ashik"
        }).hasKey("id");
    },
    "user"
);

userSuite.addTest(
    "validates email",
    expect => {
        expect("ashik@example.com")
            .matches(/@example\.com$/);
    },
    "validation"
);

userSuite.addParametrized(
    "addition",
    (expect, { input, expected }) => {
        expect(input[0] + input[1]).toBe(expected);
    },
    [
        { input: [1, 2], expected: 3 },
        { input: [5, 5], expected: 10 },
        { input: [10, 20], expected: 30 }
    ]
);

userSuite.tag(
    "creates user",
    "smoke",
    "regression"
);


console.log(userSuite.run());
console.log(userSuite.getSummary());