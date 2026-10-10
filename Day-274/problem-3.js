// PROBLEM–03: Literal Type & Const Assertion Engine


function createLiteralTypeEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== "object" ||
        typeof config.strict !== "boolean" ||
        typeof config.allowWiden !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INTERNAL STORES ---
    const literals = new Map();
    const constObjects = new Map();

    // --- STEP 3: FORMAT LITERAL ---
    const formatLiteral = (value) => {
        if (typeof value === "string") {
            return `'${value}'`;
        }

        if (typeof value === "number") {
            return String(value);
        }

        if (typeof value === "boolean") {
            return String(value);
        }

        return String(value);
    };

    // --- STEP 4: GET BASE TYPE ---
    const getBaseType = (value) => {
        return typeof value;
    };

    // --- STEP 5: DEEPLY FREEZE OBJECT ---
    const deepFreeze = (value) => {
        if (
            value &&
            typeof value === "object" &&
            !Object.isFrozen(value)
        ) {
            Object.freeze(value);

            for (const child of Object.values(value)) {
                deepFreeze(child);
            }
        }

        return value;
    };

    // --- STEP 6: RETURN LITERAL ENGINE API ---
    return {

        defineLiteral(name, value) {
            if (
                typeof name !== "string" ||
                name.trim() === "" ||
                !["string", "number", "boolean"].includes(
                    typeof value
                )
            ) {
                return "Invalid Input";
            }

            if (literals.has(name)) {
                return "Invalid Input";
            }

            literals.set(name, {
                name,
                value,
                type: getBaseType(value)
            });

            return {
                name,
                literal: formatLiteral(value)
            };
        },

        // defineConst(name, obj)

        defineConst(name, obj) {
            if (
                typeof name !== "string" ||
                name.trim() === "" ||
                !obj ||
                typeof obj !== "object" ||
                Array.isArray(obj)
            ) {
                return "Invalid Input";
            }

            if (constObjects.has(name)) {
                return "Invalid Input";
            }

            const cloned = structuredClone(obj);
            deepFreeze(cloned);

            constObjects.set(name, cloned);

            return cloned;
        },

        // check(literalName, value)
        check(literalName, value) {
            const literal = literals.get(literalName);

            if (!literal) {
                return "Invalid Input";
            }

            const expected = formatLiteral(
                literal.value
            );

            const got = formatLiteral(value);

            const exactMatch =
                Object.is(literal.value, value);

            const widenedMatch =
                config.allowWiden &&
                typeof value === literal.type;

            const valid =
                config.strict
                    ? exactMatch
                    : exactMatch || widenedMatch;

            return {
                valid,
                expected,
                got,
                isWidened:
                    !exactMatch && widenedMatch
            };
        },

        // widen(literalName)
        widen(literalName) {
            const literal = literals.get(literalName);

            if (!literal) {
                return "Invalid Input";
            }

            return literal.type;
        },

        // narrow(baseType, literals[])
        narrow(baseType, literalValues) {
            if (
                typeof baseType !== "string" ||
                !Array.isArray(literalValues) ||
                literalValues.length === 0
            ) {
                return "Invalid Input";
            }

            const allowedBaseTypes = [
                "string",
                "number",
                "boolean"
            ];

            if (!allowedBaseTypes.includes(baseType)) {
                return "Invalid Input";
            }

            const valid = literalValues.every(
                (literal) => {
                    if (typeof literal !== "string") {
                        return false;
                    }

                    if (baseType === "string") {
                        return (
                            literal.startsWith("'") &&
                            literal.endsWith("'")
                        );
                    }

                    if (baseType === "number") {
                        return !Number.isNaN(
                            Number(literal)
                        );
                    }

                    return (
                        literal === "true" ||
                        literal === "false"
                    );
                }
            );

            if (!valid) {
                return "Invalid Input";
            }

            return [
                ...new Set(literalValues)
            ].join(" | ");
        },

        // exhaustiveCheck()
        exhaustiveCheck(
            unionName,
            members,
            handledValues
        ) {
            if (
                typeof unionName !== "string" ||
                !Array.isArray(members) ||
                !Array.isArray(handledValues) ||
                members.length === 0
            ) {
                return "Invalid Input";
            }

            if (
                members.some(
                    (member) => typeof member !== "string"
                ) ||
                handledValues.some(
                    (value) => typeof value !== "string"
                )
            ) {
                return "Invalid Input";
            }

            const unhandled = members.filter(
                (member) => !handledValues.includes(member)
            );

            return {
                exhaustive: unhandled.length === 0,
                unhandled
            };
        },

        // templateLiteral(template, unions[])
        templateLiteral(template, unions) {
            if (
                typeof template !== "string" ||
                !Array.isArray(unions) ||
                unions.length === 0
            ) {
                return "Invalid Input";
            }

            if (
                unions.some(
                    (union) =>
                        !Array.isArray(union) ||
                        union.length === 0 ||
                        union.some(
                            (item) =>
                                typeof item !== "string"
                        )
                )
            ) {
                return "Invalid Input";
            }

            // Cartesian product generator
            let combinations = [""];

            for (const union of unions) {
                const next = [];

                for (const prefix of combinations) {
                    for (const value of union) {
                        next.push(prefix + value);
                    }
                }

                combinations = next;
            }

            return combinations;
        },

        // getReport()
        getReport() {
            const literalValues = [
                ...literals.values()
            ];

            return {
                totalLiterals: literalValues.length,

                stringLiterals:
                    literalValues.filter(
                        (literal) =>
                            literal.type === "string"
                    ).length,

                numberLiterals:
                    literalValues.filter(
                        (literal) =>
                            literal.type === "number"
                    ).length,

                booleanLiterals:
                    literalValues.filter(
                        (literal) =>
                            literal.type === "boolean"
                    ).length,

                constObjects: constObjects.size
            };
        }
    };
}


// --- EXAMPLE USAGE ---
const literalEngine = createLiteralTypeEngine({
    strict: true,
    allowWiden: false
});

console.log(
    literalEngine.defineLiteral(
        "ActiveStatus",
        "active"
    )
);

console.log(
    literalEngine.defineLiteral(
        "MaxRetries",
        3
    )
);

console.log(
    literalEngine.defineConst(
        "Config",
        {
            theme: "dark",
            fontSize: 14,
            features: ["auth", "api"]
        }
    )
);

console.log(
    literalEngine.check(
        "ActiveStatus",
        "active"
    )
);

console.log(
    literalEngine.check(
        "ActiveStatus",
        "inactive"
    )
);

console.log(
    literalEngine.widen("ActiveStatus")
);

console.log(
    literalEngine.narrow(
        "string",
        ["'active'", "'inactive'", "'pending'"]
    )
);

console.log(
    literalEngine.exhaustiveCheck(
        "Status",
        ["active", "inactive", "pending"],
        ["active", "inactive"]
    )
);

console.log(
    literalEngine.templateLiteral(
        "${prefix}${suffix}",
        [
            ["get", "set"],
            ["Name", "Age"]
        ]
    )
);

console.log(literalEngine.getReport());


// --- Invalid Input ---
console.log(
    createLiteralTypeEngine({
        strict: true
    })
);

console.log(createLiteralTypeEngine("invalid"));