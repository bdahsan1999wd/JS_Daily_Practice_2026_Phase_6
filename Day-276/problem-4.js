// PROBLEM–04: createConditionalUtilityEngine()

// Logic:Simulates TypeScript conditional utility types includingNonNullable, Exclude, Extract, NoInfer, Uppercase, Lowercase, Capitalize, and Uncapitalize.


function createConditionalUtilityEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        config === null ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.strict !== "boolean" ||
        typeof config.distributive !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: REPORT ---
    const report = {
        totalOperations: 0,
        byUtility: {}
    };

    const track = (utilityName) => {
        report.totalOperations++;

        report.byUtility[utilityName] =
            (report.byUtility[utilityName] || 0) + 1;
    };

    // --- STEP 3: TYPE UNION PARSER ---
    const parseUnion = (typeString) => {
        if (typeof typeString !== "string") {
            return null;
        }

        const members = typeString
            .split("|")
            .map((item) => item.trim())
            .filter(Boolean);

        if (members.length === 0) {
            return null;
        }

        return members;
    };

    // --- STEP 4: REBUILD UNION ---
    const buildUnion = (members) => {
        if (members.length === 0) {
            return "never";
        }

        return [...new Set(members)].join(" | ");
    };

    // --- STEP 5: STRING LITERAL HELPER ---
    const transformLiteral = (literalType, transformer) => {
        if (typeof literalType !== "string") {
            return "Invalid Input";
        }

        const trimmed = literalType.trim();

        // Example: "'active'"
        if (
            trimmed.startsWith("'") &&
            trimmed.endsWith("'")
        ) {
            const content = trimmed.slice(1, -1);

            return `'${transformer(content)}'`;
        }

        // Example: `"active"`
        if (
            trimmed.startsWith('"') &&
            trimmed.endsWith('"')
        ) {
            const content = trimmed.slice(1, -1);

            return `"${transformer(content)}"`;
        }

        // Raw string
        return transformer(trimmed);
    };

    // --- STEP 6: RETURN API ---
    return {
        // NonNullable<T>
        NonNullable(type) {
            const members = parseUnion(type);

            if (!members) {
                return "Invalid Input";
            }

            const removed = members.filter(
                (member) =>
                    member === "null" ||
                    member === "undefined"
            );

            const remaining = members.filter(
                (member) =>
                    member !== "null" &&
                    member !== "undefined"
            );

            track("NonNullable");

            return {
                original: type,
                result: buildUnion(remaining),
                removed
            };
        },

        // Exclude<T, U>
        Exclude(type, excludeUnion) {
            const originalMembers = parseUnion(type);
            const excludedMembers = parseUnion(excludeUnion);

            if (
                !originalMembers ||
                !excludedMembers
            ) {
                return "Invalid Input";
            }

            const resultMembers = originalMembers.filter(
                (member) =>
                    !excludedMembers.includes(member)
            );

            track("Exclude");

            return {
                original: type,
                excluded: excludedMembers,
                result: buildUnion(resultMembers)
            };
        },

        // Extract<T, U>
        Extract(type, extractUnion) {
            const originalMembers = parseUnion(type);
            const extractedMembers = parseUnion(extractUnion);

            if (
                !originalMembers ||
                !extractedMembers
            ) {
                return "Invalid Input";
            }

            const resultMembers = originalMembers.filter(
                (member) =>
                    extractedMembers.includes(member)
            );

            track("Extract");

            return {
                original: type,
                extracted: resultMembers,
                result: buildUnion(resultMembers)
            };
        },

        // NoInfer<T>
        NoInfer(type) {
            if (
                typeof type !== "string" ||
                !type.trim()
            ) {
                return "Invalid Input";
            }

            track("NoInfer");

            return {
                type,
                inferBlocked: true
            };
        },

        // Uppercase<T>
        Uppercase(literalType) {
            const result = transformLiteral(
                literalType,
                (value) => value.toUpperCase()
            );

            if (result === "Invalid Input") {
                return result;
            }

            track("Uppercase");

            return result;
        },

        // Lowercase<T>
        Lowercase(literalType) {
            const result = transformLiteral(
                literalType,
                (value) => value.toLowerCase()
            );

            if (result === "Invalid Input") {
                return result;
            }

            track("Lowercase");

            return result;
        },

        // Capitalize<T>
        Capitalize(literalType) {
            const result = transformLiteral(
                literalType,
                (value) => {
                    if (value.length === 0) {
                        return value;
                    }

                    return (
                        value.charAt(0).toUpperCase() +
                        value.slice(1)
                    );
                }
            );

            if (result === "Invalid Input") {
                return result;
            }

            track("Capitalize");

            return result;
        },

        // Uncapitalize<T>
        Uncapitalize(literalType) {
            const result = transformLiteral(
                literalType,
                (value) => {
                    if (value.length === 0) {
                        return value;
                    }

                    return (
                        value.charAt(0).toLowerCase() +
                        value.slice(1)
                    );
                }
            );

            if (result === "Invalid Input") {
                return result;
            }

            track("Uncapitalize");

            return result;
        },

        // Report
        getReport() {
            return {
                totalOperations: report.totalOperations,
                byUtility: { ...report.byUtility }
            };
        }
    };
}


// --- EXAMPLE USAGE ---
const conditionalEngine =
    createConditionalUtilityEngine({
        strict: true,
        distributive: true
    });


console.log(
    conditionalEngine.NonNullable(
        "string | null | undefined"
    )
);

console.log(
    conditionalEngine.NonNullable(
        "number | null"
    )
);

console.log(
    conditionalEngine.Exclude(
        "string | number | boolean | null",
        "boolean | null"
    )
);

console.log(
    conditionalEngine.Extract(
        "string | number | boolean",
        "string | boolean"
    )
);


console.log(conditionalEngine.NoInfer("User"));

console.log(conditionalEngine.Uppercase("'active'"));

console.log(conditionalEngine.Lowercase("'PENDING'"));

console.log(conditionalEngine.Capitalize("'hello world'"));

console.log(conditionalEngine.Uncapitalize("'Hello world'"));

console.log(conditionalEngine.getReport());