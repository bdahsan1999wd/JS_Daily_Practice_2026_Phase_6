// PROBLEM–02: createAssertionLibrary()

// Logic: Creates a reusable assertion library with equality, type, comparison, string, array, object, negation, custom matcher, batch assertion, and statistics support.

function createAssertionLibrary(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---
    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        strict,
        verbose,
        customMatchers
    } = config;

    if (
        typeof strict !== "boolean" ||
        typeof verbose !== "boolean" ||
        !Array.isArray(customMatchers)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: CREATE INTERNAL STORAGE ---
    const matchers = new Map();

    let totalAssertions = 0;
    let passedAssertions = 0;
    let failedAssertions = 0;

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

    // --- STEP 4: FORMAT VALUES FOR ERROR MESSAGES ---
    function formatValue(value) {
        if (typeof value === "string") {
            return `"${value}"`;
        }

        if (value === null) {
            return "null";
        }

        if (value === undefined) {
            return "undefined";
        }

        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }

    // --- STEP 5: CREATE ASSERTION RESULT ---
    function executeAssertion(condition, message, negate) {
        totalAssertions++;

        const finalCondition = negate
            ? !condition
            : condition;

        if (finalCondition) {
            passedAssertions++;

            return {
                passed: true,
                message: "Assertion passed"
            };
        }

        failedAssertions++;

        return {
            passed: false,
            message: negate
                ? `Expected value not to satisfy: ${message}`
                : message
        };
    }

    // --- STEP 6: ADD INITIAL CUSTOM MATCHERS ---
    for (const matcher of customMatchers) {
        if (
            typeof matcher !== "object" ||
            matcher === null ||
            typeof matcher.name !== "string" ||
            matcher.name.trim() === "" ||
            typeof matcher.fn !== "function" ||
            typeof matcher.errorMessage !== "string"
        ) {
            return "Invalid Input";
        }

        matchers.set(matcher.name, {
            fn: matcher.fn,
            errorMessage: matcher.errorMessage
        });
    }

    // --- STEP 7: CREATE ASSERTION CHAIN ---
    function assert(value) {
        let negate = false;

        const assertion = {
            // --- EQUALITY ASSERTIONS ---
            equals(expected) {
                return executeAssertion(
                    strict
                        ? value === expected
                        : value == expected,
                    `Expected ${formatValue(value)} to equal ${formatValue(expected)}`,
                    negate
                );
            },

            notEquals(expected) {
                return executeAssertion(
                    strict
                        ? value !== expected
                        : value != expected,
                    `Expected ${formatValue(value)} not to equal ${formatValue(expected)}`,
                    negate
                );
            },

            strictEquals(expected) {
                return executeAssertion(
                    value === expected,
                    `Expected ${formatValue(value)} to strictly equal ${formatValue(expected)}`,
                    negate
                );
            },

            // --- TYPE ASSERTIONS ---
            isString() {
                return executeAssertion(
                    typeof value === "string",
                    `Expected value to be a string`,
                    negate
                );
            },

            isNumber() {
                return executeAssertion(
                    typeof value === "number" &&
                    !Number.isNaN(value),
                    `Expected value to be a number`,
                    negate
                );
            },

            isBoolean() {
                return executeAssertion(
                    typeof value === "boolean",
                    `Expected value to be a boolean`,
                    negate
                );
            },

            isArray() {
                return executeAssertion(
                    Array.isArray(value),
                    `Expected value to be an array`,
                    negate
                );
            },

            isObject() {
                return executeAssertion(
                    typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value),
                    `Expected value to be an object`,
                    negate
                );
            },

            isFunction() {
                return executeAssertion(
                    typeof value === "function",
                    `Expected value to be a function`,
                    negate
                );
            },

            isNull() {
                return executeAssertion(
                    value === null,
                    `Expected value to be null`,
                    negate
                );
            },

            isUndefined() {
                return executeAssertion(
                    value === undefined,
                    `Expected value to be undefined`,
                    negate
                );
            },

            // --- COMPARISON ASSERTIONS ---
            greaterThan(expected) {
                return executeAssertion(
                    value > expected,
                    `Expected ${formatValue(value)} to be greater than ${formatValue(expected)}`,
                    negate
                );
            },

            lessThan(expected) {
                return executeAssertion(
                    value < expected,
                    `Expected ${formatValue(value)} to be less than ${formatValue(expected)}`,
                    negate
                );
            },

            between(min, max) {
                return executeAssertion(
                    value >= min && value <= max,
                    `Expected ${formatValue(value)} to be between ${min} and ${max}`,
                    negate
                );
            },

            // --- STRING ASSERTIONS ---
            includes(search) {
                return executeAssertion(
                    typeof value === "string" &&
                    value.includes(search),
                    `Expected ${formatValue(value)} to include ${formatValue(search)}`,
                    negate
                );
            },

            startsWith(search) {
                return executeAssertion(
                    typeof value === "string" &&
                    value.startsWith(search),
                    `Expected ${formatValue(value)} to start with ${formatValue(search)}`,
                    negate
                );
            },

            endsWith(search) {
                return executeAssertion(
                    typeof value === "string" &&
                    value.endsWith(search),
                    `Expected ${formatValue(value)} to end with ${formatValue(search)}`,
                    negate
                );
            },

            matches(regex) {
                return executeAssertion(
                    regex instanceof RegExp &&
                    typeof value === "string" &&
                    regex.test(value),
                    `Expected ${formatValue(value)} to match ${regex}`,
                    negate
                );
            },

            // --- ARRAY ASSERTIONS ---
            contains(item) {
                return executeAssertion(
                    Array.isArray(value) &&
                    value.includes(item),
                    `Expected array to contain ${formatValue(item)}`,
                    negate
                );
            },

            hasLength(length) {
                return executeAssertion(
                    value !== null &&
                    value !== undefined &&
                    value.length === length,
                    `Expected value to have length ${length}`,
                    negate
                );
            },

            isEmpty() {
                return executeAssertion(
                    (
                        Array.isArray(value) ||
                        typeof value === "string"
                    ) &&
                    value.length === 0,
                    `Expected value to be empty`,
                    negate
                );
            },

            containsAll(items) {
                const condition =
                    Array.isArray(value) &&
                    Array.isArray(items) &&
                    items.every(item => value.includes(item));

                return executeAssertion(
                    condition,
                    `Expected array to contain all specified items`,
                    negate
                );
            },

            // --- OBJECT ASSERTIONS ---
            hasKey(key) {
                return executeAssertion(
                    value !== null &&
                    typeof value === "object" &&
                    Object.prototype.hasOwnProperty.call(value, key),
                    `Expected object to have key ${key}`,
                    negate
                );
            },

            hasKeys(keys) {
                const condition =
                    value !== null &&
                    typeof value === "object" &&
                    Array.isArray(keys) &&
                    keys.every(key =>
                        Object.prototype.hasOwnProperty.call(value, key)
                    );

                return executeAssertion(
                    condition,
                    `Expected object to contain all specified keys`,
                    negate
                );
            },

            deepEquals(expected) {
                return executeAssertion(
                    deepEqual(value, expected),
                    "Expected values to be deeply equal",
                    negate
                );
            }
        };

        // --- STEP 8: ADD CUSTOM MATCHERS TO THE CHAIN ---
        for (const [name, matcher] of matchers) {
            assertion[name] = function (...args) {
                let result;

                try {
                    result = matcher.fn(value, ...args);
                } catch {
                    result = false;
                }

                return executeAssertion(
                    Boolean(result),
                    matcher.errorMessage,
                    negate
                );
            };
        }

        // --- STEP 9: ADD NEGATION SUPPORT ---
        Object.defineProperty(assertion, "not", {
            get() {
                negate = !negate;
                return assertion;
            }
        });

        return assertion;
    }

    // --- STEP 10: ADD CUSTOM MATCHER AT RUNTIME ---
    function addMatcher(name, fn, errorMessage) {
        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            typeof fn !== "function" ||
            typeof errorMessage !== "string"
        ) {
            return "Invalid Input";
        }

        matchers.set(name, {
            fn,
            errorMessage
        });

        return true;
    }

    // --- STEP 11: RUN BATCH ASSERTIONS ---
    function batch(assertions) {
        if (!Array.isArray(assertions)) {
            return "Invalid Input";
        }

        const results = [];

        for (const item of assertions) {
            if (
                typeof item !== "object" ||
                item === null ||
                !("value" in item) ||
                typeof item.assertion !== "string"
            ) {
                return "Invalid Input";
            }

            const method = assert(item.value);

            if (typeof method[item.assertion] !== "function") {
                results.push({
                    passed: false,
                    message: `Unknown assertion: ${item.assertion}`
                });

                continue;
            }

            const args = Array.isArray(item.args)
                ? item.args
                : [];

            results.push(
                method[item.assertion](...args)
            );
        }

        return {
            passed: results.filter(result => result.passed).length,
            failed: results.filter(result => !result.passed).length,
            results
        };
    }

    // --- STEP 12: RETURN ASSERTION STATISTICS ---
    function getStats() {
        return {
            totalAssertions,
            passed: passedAssertions,
            failed: failedAssertions,
            customMatchers: matchers.size
        };
    }

    // --- STEP 13: RETURN PUBLIC API ---
    return {
        assert,
        addMatcher,
        batch,
        getStats
    };
}


// --- EXAMPLE USAGE ---
const assertionLibrary = createAssertionLibrary({
    strict: true,
    verbose: true,
    customMatchers: []
});


console.log(
    assertionLibrary
        .assert(10)
        .greaterThan(5)
);

console.log(
    assertionLibrary
        .assert("JavaScript")
        .includes("Script")
);

console.log(
    assertionLibrary
        .assert([1, 2, 3])
        .contains(2)
);

console.log(
    assertionLibrary
        .assert(5)
        .greaterThan(10)
);

console.log(
    assertionLibrary.batch([
        {
            value: 10,
            assertion: "isNumber"
        },
        {
            value: "JavaScript",
            assertion: "isString"
        }
    ])
);

console.log(assertionLibrary.getStats());