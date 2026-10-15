// PROBLEM–03: createConditionalTypeEngine()

// Logic: Simulates TypeScript conditional types and infer behavior.

function createConditionalTypeEngine(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---
    if (
        typeof config !== "object" ||
        config === null ||
        typeof config.distributive !== "boolean" ||
        typeof config.strict !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE REPORT STATE ---
    let totalEvaluations = 0;

    const inferPatterns = {
        ReturnType: 0,
        ArrayElement: 0,
        PromiseValue: 0,
        FirstParam: 0
    };

    let distributedUnions = 0;

    // --- STEP 3: CHECK SIMPLE TYPE EXTENSION ---
    function matchesCondition(type, condition) {
        const normalizedCondition =
            condition.trim();

        const match =
            normalizedCondition.match(/^extends\s+(.+)$/);

        if (!match) {
            return false;
        }

        const targetType = match[1].trim();

        return (
            type.trim() === targetType ||
            targetType === "unknown" ||
            targetType === "any"
        );
    }

    // --- STEP 4: EVALUATE CONDITIONAL TYPE ---
    function evaluate(
        type,
        condition,
        trueType,
        falseType
    ) {
        if (
            typeof type !== "string" ||
            typeof condition !== "string" ||
            typeof trueType !== "string" ||
            typeof falseType !== "string"
        ) {
            return "Invalid Input";
        }

        totalEvaluations++;

        // Handle distributive union.
        if (
            config.distributive &&
            type.includes("|")
        ) {
            const unionMembers = type
                .split("|")
                .map(item => item.trim())
                .filter(Boolean);

            const distributedResults =
                unionMembers.map(member =>
                    matchesCondition(
                        member,
                        condition
                    )
                        ? trueType
                        : falseType
                );

            distributedUnions++;

            return {
                input: type,
                condition,
                result: distributedResults.join(" | "),
                distributed: true
            };
        }

        const result =
            matchesCondition(type, condition)
                ? trueType
                : falseType;

        return {
            input: type,
            condition,
            result,
            distributed: false
        };
    }

    // --- STEP 5: SIMULATE INFER ---
    function infer(type, pattern) {
        if (
            typeof type !== "string" ||
            typeof pattern !== "string" ||
            !Object.prototype.hasOwnProperty.call(
                inferPatterns,
                pattern
            )
        ) {
            return "Invalid Input";
        }

        let inferred = null;

        switch (pattern) {
            case "ReturnType": {
                const match = type.match(
                    /^\s*\([^)]*\)\s*=>\s*(.+)\s*$/
                );

                if (match) {
                    inferred = match[1].trim();
                }

                break;
            }

            case "ArrayElement": {
                const match = type.match(
                    /^(.+)\[\]$/
                );

                if (match) {
                    inferred = match[1].trim();
                }

                break;
            }

            case "PromiseValue": {
                const match = type.match(
                    /^Promise<(.+)>$/
                );

                if (match) {
                    inferred = match[1].trim();
                }

                break;
            }

            case "FirstParam": {
                const match = type.match(
                    /^\s*\(([^)]*)\)\s*=>/
                );

                if (match) {
                    const params = match[1]
                        .split(",")
                        .map(param => param.trim())
                        .filter(Boolean);

                    if (params.length > 0) {
                        const firstParam = params[0];

                        const separatorIndex =
                            firstParam.indexOf(":");

                        if (separatorIndex !== -1) {
                            inferred =
                                firstParam
                                    .slice(separatorIndex + 1)
                                    .trim();
                        }
                    }
                }

                break;
            }
        }

        inferPatterns[pattern]++;

        return {
            original: type,
            inferred,
            pattern
        };
    }

    // --- STEP 6: FLATTEN NESTED ARRAYS ---
    function flatten(type) {
        if (typeof type !== "string") {
            return "Invalid Input";
        }

        // Remove one array nesting level.
        if (type.endsWith("[][]")) {
            return type.slice(0, -2);
        }

        return type;
    }

    // --- STEP 7: DEEP READONLY TRANSFORMATION ---
    function deepReadonly(typeShape) {
        if (
            typeof typeShape !== "object" ||
            typeShape === null ||
            Array.isArray(typeShape)
        ) {
            return "Invalid Input";
        }

        function transform(value) {
            if (
                typeof value !== "object" ||
                value === null ||
                Array.isArray(value)
            ) {
                return value;
            }

            const result = {};

            for (const [key, value] of Object.entries(value)) {
                result[`readonly ${key}`] =
                    typeof value === "object" &&
                        value !== null &&
                        !Array.isArray(value)
                        ? transform(value)
                        : value;
            }

            return result;
        }

        return transform(typeShape);
    }

    // --- STEP 8: UNPACK ONE TYPE LEVEL ---
    function unpack(type) {
        if (typeof type !== "string") {
            return "Invalid Input";
        }

        const promiseMatch =
            type.match(/^Promise<(.+)>$/);

        if (promiseMatch) {
            return promiseMatch[1].trim();
        }

        const arrayMatch =
            type.match(/^(.+)\[\]$/);

        if (arrayMatch) {
            return arrayMatch[1].trim();
        }

        return type;
    }

    // --- STEP 9: CHECK NEVER TYPE ---
    function isNever(type) {
        if (typeof type !== "string") {
            return false;
        }

        return type.trim() === "never";
    }

    // --- STEP 10: GENERATE REPORT ---
    function getReport() {
        return {
            totalEvaluations,
            inferPatterns: {
                ...inferPatterns
            },
            distributedUnions
        };
    }

    // --- STEP 11: RETURN ENGINE API ---
    return {
        evaluate,
        infer,
        flatten,
        deepReadonly,
        unpack,
        isNever,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const conditionalEngine =
    createConditionalTypeEngine({
        distributive: true,
        strict: true
    });



console.log(
    conditionalEngine.evaluate(
        "string",
        "extends string",
        "Yes",
        "No"
    )
);

console.log(
    conditionalEngine.evaluate(
        "string | number",
        "extends string",
        "Yes",
        "No"
    )
);

console.log(
    conditionalEngine.infer(
        "() => string",
        "ReturnType"
    )
);

console.log(
    conditionalEngine.infer(
        "string[]",
        "ArrayElement"
    )
);

console.log(
    conditionalEngine.infer(
        "Promise<number>",
        "PromiseValue"
    )
);

console.log(
    conditionalEngine.infer(
        "(a: string, b: number) => void",
        "FirstParam"
    )
);

console.log(conditionalEngine.flatten("string[][]"));

console.log(conditionalEngine.unpack("Promise<User>"));

console.log(conditionalEngine.unpack("number[]"));

console.log(conditionalEngine.getReport());