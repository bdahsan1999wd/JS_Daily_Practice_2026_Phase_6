// PROBLEM–05: createTypeAssertionEngine()

// Logic: Simulates TypeScript type assertions and assertion functions.

function createTypeAssertionEngine(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---
    if (
        typeof config !== "object" ||
        config === null ||
        typeof config.strict !== "boolean" ||
        typeof config.logAssertions !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE ENGINE STATE ---
    const assertionLog = [];

    let totalAssertions = 0;
    let safeAssertions = 0;
    let unsafeAssertions = 0;
    let assertionFunctions = 0;
    let satisfiesCount = 0;

    // --- STEP 3: DETECT RUNTIME TYPE ---
    function getRuntimeType(value) {
        if (value === null) {
            return "null";
        }

        if (Array.isArray(value)) {
            return "array";
        }

        return typeof value;
    }

    // --- STEP 4: CHECK STRUCTURAL COMPATIBILITY ---
    function isCompatible(value, targetType) {
        const actualType =
            getRuntimeType(value);

        // Primitive types.
        if (
            ["string", "number", "boolean", "bigint", "symbol"]
                .includes(targetType)
        ) {
            return actualType === targetType;
        }

        // null / undefined.
        if (targetType === "null") {
            return value === null;
        }

        if (targetType === "undefined") {
            return value === undefined;
        }

        // Object-like type.
        if (
            targetType === "object" ||
            targetType === "Object"
        ) {
            return (
                typeof value === "object" &&
                value !== null
            );
        }

        // Array type.
        if (
            targetType === "array" ||
            targetType === "Array"
        ) {
            return Array.isArray(value);
        }

        // Unknown and any accept everything.
        if (
            targetType === "unknown" ||
            targetType === "any"
        ) {
            return true;
        }

        return false;
    }

    // --- STEP 5: RECORD ASSERTION ---
    function recordAssertion(record) {
        if (config.logAssertions) {
            assertionLog.push({
                ...record
            });
        }
    }

    // --- STEP 6: TYPE ASSERTION ---
    function as(value, targetType) {
        if (typeof targetType !== "string") {
            return "Invalid Input";
        }

        totalAssertions++;

        const actualType =
            getRuntimeType(value);

        const safe =
            isCompatible(value, targetType);

        if (safe) {
            safeAssertions++;

            const result = {
                asserted: value,
                type: targetType,
                safe: true,
                warning: null
            };

            recordAssertion({
                operation: "as",
                actualType,
                targetType,
                safe: true
            });

            return result;
        }

        unsafeAssertions++;

        const warning =
            `Unsafe Assertion: ${actualType} is not assignable to ${targetType}`;

        recordAssertion({
            operation: "as",
            actualType,
            targetType,
            safe: false,
            warning
        });

        // Strict mode prevents the unsafe assertion.
        if (config.strict) {
            return {
                asserted: null,
                type: targetType,
                safe: false,
                warning
            };
        }

        return {
            asserted: value,
            type: targetType,
            safe: false,
            warning
        };
    }

    // --- STEP 7: ASSERTION FUNCTION ---
    function assertIs(value, typeName, validator) {
        if (
            typeof typeName !== "string" ||
            typeof validator !== "function"
        ) {
            return "Invalid Input";
        }

        totalAssertions++;
        assertionFunctions++;

        let passed = false;

        try {
            passed = Boolean(
                validator(value)
            );
        } catch {
            passed = false;
        }

        if (!passed) {
            recordAssertion({
                operation: "assertIs",
                typeName,
                passed: false
            });

            return {
                passed: false,
                error:
                    `Assertion failed: value is not ${typeName}`
            };
        }

        safeAssertions++;

        recordAssertion({
            operation: "assertIs",
            typeName,
            passed: true
        });

        return {
            passed: true,
            assertedType: typeName
        };
    }

    // --- STEP 8: DOUBLE ASSERTION ---
    function doubleAssertion(
        value,
        intermediate,
        target
    ) {
        if (
            typeof intermediate !== "string" ||
            typeof target !== "string"
        ) {
            return "Invalid Input";
        }

        totalAssertions++;

        const original =
            getRuntimeType(value);

        let dangerLevel = "low";

        if (
            intermediate === "unknown" &&
            !isCompatible(value, target)
        ) {
            dangerLevel = "high";
        } else if (
            !isCompatible(value, target)
        ) {
            dangerLevel = "medium";
        }

        recordAssertion({
            operation: "doubleAssertion",
            original,
            intermediate,
            target,
            dangerLevel
        });

        return {
            original,
            intermediate,
            final: target,
            dangerLevel
        };
    }

    // --- STEP 9: INFER VALUE TYPE SHAPE ---
    function inferTypeShape(value) {
        if (value === null) {
            return "null";
        }

        if (Array.isArray(value)) {
            return "unknown[]";
        }

        if (typeof value !== "object") {
            return typeof value;
        }

        const properties = Object.entries(value)
            .map(
                ([key, item]) =>
                    `${key}: ${getRuntimeType(item)}`
            )
            .join("; ");

        return `{ ${properties} }`;
    }

    // --- STEP 10: SIMULATE SATISFIES ---
    function satisfies(value, typeName, shape) {
        if (
            typeof typeName !== "string" ||
            typeof shape !== "object" ||
            shape === null ||
            Array.isArray(shape)
        ) {
            return "Invalid Input";
        }

        totalAssertions++;
        satisfiesCount++;

        const errors = {};

        for (const [key, expectedType] of Object.entries(shape)) {
            const actualValue =
                value !== null &&
                    typeof value === "object"
                    ? value[key]
                    : undefined;

            const actualType =
                getRuntimeType(actualValue);

            if (
                typeof expectedType !== "string"
            ) {
                return "Invalid Input";
            }

            if (
                !isCompatible(
                    actualValue,
                    expectedType
                )
            ) {
                errors[key] =
                    `Expected ${expectedType}, got ${actualType}`;
            }
        }

        const passed =
            Object.keys(errors).length === 0;

        if (passed) {
            safeAssertions++;
        } else {
            unsafeAssertions++;
        }

        recordAssertion({
            operation: "satisfies",
            typeName,
            passed,
            errors: { ...errors }
        });

        return {
            satisfies: passed,
            inferredType:
                inferTypeShape(value),
            targetType: typeName,
            errors
        };
    }

    // --- STEP 11: GET ASSERTION LOG ---
    function getAssertionLog() {
        return assertionLog.map(
            record => ({ ...record })
        );
    }

    // --- STEP 12: GENERATE REPORT ---
    function getReport() {
        return {
            totalAssertions,
            safe: safeAssertions,
            unsafe: unsafeAssertions,
            assertionFunctions,
            satisfies: satisfiesCount
        };
    }

    // --- STEP 13: RETURN ENGINE API ---
    return {
        as,
        assertIs,
        doubleAssertion,
        satisfies,
        getAssertionLog,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const assertionEngine =
    createTypeAssertionEngine({
        strict: true,
        logAssertions: true
    });


console.log(
    assertionEngine.as(
        "hello",
        "string"
    )
);

console.log(
    assertionEngine.as(
        42,
        "string"
    )
);

console.log(
    assertionEngine.assertIs(
        {
            id: 1,
            name: "Rahim"
        },
        "User",
        value =>
            typeof value.id === "number" &&
            typeof value.name === "string"
    )
);

console.log(
    assertionEngine.assertIs(
        "notAUser",
        "User",
        value =>
            typeof value === "object" &&
            value !== null
    )
);

console.log(
    assertionEngine.doubleAssertion(
        "hello",
        "unknown",
        "number"
    )
);

console.log(
    assertionEngine.satisfies(
        {
            theme: "dark",
            fontSize: 14
        },
        "Config",
        {
            theme: "string",
            fontSize: "number"
        }
    )
);

console.log(
    assertionEngine.satisfies(
        {
            theme: 123,
            fontSize: 14
        },
        "Config",
        {
            theme: "string",
            fontSize: "number"
        }
    )
);

console.log(assertionEngine.getAssertionLog());

console.log(assertionEngine.getReport());