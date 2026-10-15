// PROBLEM–01: createUnknownNeverEngine()

// Logic: Simulates TypeScript unknown and never behavior at runtime.


function createUnknownNeverEngine(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---
    if (
        typeof config !== "object" ||
        config === null ||
        typeof config.strict !== "boolean" ||
        typeof config.exhaustiveChecks !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE ENGINE STATE ---
    let totalUnknown = 0;
    let narrowedSuccessfully = 0;
    let neverAssertions = 0;
    let safeOps = 0;

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

    // --- STEP 4: APPLY KNOWN OPERATIONS ---
    function applyOperation(value, action) {
        switch (action) {
            case "toUpperCase":
                if (typeof value === "string") {
                    return value.toUpperCase();
                }
                return value;

            case "toLowerCase":
                if (typeof value === "string") {
                    return value.toLowerCase();
                }
                return value;

            case "length":
                if (
                    typeof value === "string" ||
                    Array.isArray(value)
                ) {
                    return value.length;
                }
                return value;

            case "toFixed":
                if (typeof value === "number") {
                    return value.toFixed(2);
                }
                return value;

            case "double":
                if (typeof value === "number") {
                    return value * 2;
                }
                return value;

            case "trim":
                if (typeof value === "string") {
                    return value.trim();
                }
                return value;

            default:
                return value;
        }
    }

    // --- STEP 5: PROCESS UNKNOWN VALUE ---
    function processUnknown(value, operations) {
        if (!Array.isArray(operations)) {
            return "Invalid Input";
        }

        totalUnknown++;

        // No operation means unknown value was never narrowed.
        if (operations.length === 0) {
            return {
                processed: null,
                narrowedAs: null,
                operationsApplied: [],
                error: "Type Error: Cannot use unknown without narrowing"
            };
        }

        let currentValue = value;
        let narrowedAs = null;
        const operationsApplied = [];

        for (const operation of operations) {
            // Validate operation structure.
            if (
                typeof operation !== "object" ||
                operation === null ||
                typeof operation.guard !== "string" ||
                typeof operation.type !== "string" ||
                typeof operation.action !== "string"
            ) {
                return "Invalid Input";
            }

            const actualType = getRuntimeType(currentValue);

            // Simulate typeof-based narrowing.
            if (
                operation.guard === "typeof" &&
                actualType === operation.type
            ) {
                narrowedAs = operation.type;

                currentValue = applyOperation(
                    currentValue,
                    operation.action
                );

                operationsApplied.push(operation.action);
                safeOps++;
            }
        }

        // If no valid narrowing happened, reject the operation.
        if (narrowedAs === null) {
            return {
                processed: null,
                narrowedAs: null,
                operationsApplied,
                error: "Type Error: Cannot use unknown without narrowing"
            };
        }

        narrowedSuccessfully++;

        return {
            processed: currentValue,
            narrowedAs,
            operationsApplied
        };
    }

    // --- STEP 6: SIMULATE NEVER ASSERTION ---
    function assertNever(value, context) {
        if (typeof context !== "string" || context.length === 0) {
            return "Invalid Input";
        }

        neverAssertions++;

        const actualType = getRuntimeType(value);

        // A real runtime value means the code is not unreachable.
        if (actualType !== "undefined") {
            return {
                isNever: false,
                value,
                context,
                message:
                    `Unreachable code: value should be never but got ${actualType}`
            };
        }

        return {
            isNever: true,
            value,
            context,
            message: "Value is never"
        };
    }

    // --- STEP 7: SAFE UNKNOWN OPERATION ---
    function safeOperation(value, fn, fallback) {
        if (typeof fn !== "function") {
            return "Invalid Input";
        }

        try {
            const result = fn(value);

            safeOps++;

            return {
                result,
                usedFallback: false,
                error: null
            };
        } catch (error) {
            return {
                result: fallback,
                usedFallback: true,
                error: error instanceof Error
                    ? error.message
                    : String(error)
            };
        }
    }

    // --- STEP 8: NARROW UNKNOWN VALUE ---
    function narrowUnknown(value) {
        totalUnknown++;

        const narrowedType = getRuntimeType(value);

        // null and undefined are not safely usable without
        // additional checks in strict unknown handling.
        const safe =
            value !== null &&
            value !== undefined;

        if (safe) {
            narrowedSuccessfully++;
        }

        return {
            originalType: "unknown",
            narrowedType,
            safe
        };
    }

    // --- STEP 9: SIMULATE NEVER UNION ---
    function neverUnion(types) {
        if (!Array.isArray(types) || types.length === 0) {
            return "Invalid Input";
        }

        if (!types.every(type => typeof type === "string")) {
            return "Invalid Input";
        }

        const isNever = types.includes("never");

        return {
            isNever,
            reason: isNever
                ? "never absorbs all types in intersection"
                : `No conflict between ${types.join(" and ")}`,
            types: [...types]
        };
    }

    // --- STEP 10: GENERATE REPORT ---
    function getReport() {
        return {
            totalUnknown,
            narrowedSuccessfully,
            neverAssertions,
            safeOps
        };
    }

    // --- STEP 11: RETURN ENGINE API ---

    return {
        processUnknown,
        assertNever,
        safeOperation,
        narrowUnknown,
        neverUnion,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const unknownEngine = createUnknownNeverEngine({
    strict: true,
    exhaustiveChecks: true
});


console.log(
    unknownEngine.processUnknown(
        "hello",
        [
            {
                guard: "typeof",
                type: "string",
                action: "toUpperCase"
            }
        ]
    )
);

console.log(unknownEngine.processUnknown(42, []));

console.log(unknownEngine.narrowUnknown("hello world"));

console.log(unknownEngine.narrowUnknown(null));

console.log(
    unknownEngine.assertNever(
        "unexpectedValue",
        "switch statement"
    )
);

console.log(unknownEngine.neverUnion(["string", "number"]));

console.log(
    unknownEngine.neverUnion([
        "string",
        "number",
        "never"
    ])
);

console.log(unknownEngine.getReport());