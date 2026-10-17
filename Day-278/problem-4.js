// PROBLEM–04: buildTypeTransformer()

// Logic: Simulates TypeScript utility, conditional, mapped, and generic transformations.

function buildTypeTransformer(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---

    if (
        typeof config !== "object" ||
        config === null ||
        typeof config.types !== "object" ||
        config.types === null ||
        Array.isArray(config.types) ||
        typeof config.strict !== "boolean" ||
        typeof config.trackHistory !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE REGISTERED TYPES ---

    for (const [name, properties] of Object.entries(
        config.types
    )) {
        if (
            typeof properties !== "object" ||
            properties === null ||
            Array.isArray(properties)
        ) {
            return "Invalid Input";
        }

        for (const property of Object.values(properties)) {
            if (
                typeof property !== "object" ||
                property === null ||
                typeof property.type !== "string" ||
                typeof property.optional !== "boolean" ||
                typeof property.readonly !== "boolean"
            ) {
                return "Invalid Input";
            }
        }
    }

    const types = {};

    for (const [name, properties] of Object.entries(
        config.types
    )) {
        types[name] = {};

        for (const [key, value] of Object.entries(
            properties
        )) {
            types[name][key] = { ...value };
        }
    }

    // --- STEP 3: INITIALIZE HISTORY ---

    const history = [];

    let totalTransforms = 0;
    let chainedOps = 0;
    let generatedVariants = 0;

    // --- STEP 4: CLONE PROPERTIES ---

    function cloneProperties(properties) {
        const result = {};

        for (const [key, value] of Object.entries(
            properties
        )) {
            result[key] = { ...value };
        }

        return result;
    }

    // --- STEP 5: APPLY SINGLE TRANSFORMATION ---

    function applyOperation(
        properties,
        operation,
        argument
    ) {
        const result =
            cloneProperties(properties);

        switch (operation) {
            case "Partial":
                for (const property of Object.values(result)) {
                    property.optional = true;
                }

                return result;

            case "Required":
                for (const property of Object.values(result)) {
                    property.optional = false;
                }

                return result;

            case "Readonly":
                for (const property of Object.values(result)) {
                    property.readonly = true;
                }

                return result;

            case "Pick": {
                if (!Array.isArray(argument)) {
                    return null;
                }

                const picked = {};

                for (const key of argument) {
                    if (
                        Object.prototype.hasOwnProperty.call(
                            result,
                            key
                        )
                    ) {
                        picked[key] = result[key];
                    }
                }

                return picked;
            }

            case "Omit": {
                if (!Array.isArray(argument)) {
                    return null;
                }

                for (const key of argument) {
                    delete result[key];
                }

                return result;
            }

            case "Nullable":
                for (const property of Object.values(result)) {
                    property.type += " | null";
                }

                return result;

            case "Array":
                for (const property of Object.values(result)) {
                    property.type =
                        `${property.type}[]`;
                }

                return result;

            case "Promise":
                for (const property of Object.values(result)) {
                    property.type =
                        `Promise<${property.type}>`;
                }

                return result;

            case "Record":
                return {
                    __record__: true,
                    keyType:
                        typeof argument === "string"
                            ? argument
                            : "string",
                    valueType: "T"
                };

            default:
                return null;
        }
    }

    // --- STEP 6: BUILD TYPE STRING ---

    function propertiesToString(
        properties
    ) {
        return Object.entries(properties)
            .map(
                ([key, property]) => {
                    const readonly =
                        property.readonly
                            ? "readonly "
                            : "";

                    const optional =
                        property.optional
                            ? "?"
                            : "";

                    return (
                        `${readonly}${key}${optional}: ${property.type}`
                    );
                }
            )
            .join("; ");
    }

    // --- STEP 7: TRANSFORM TYPE ---

    function transform(
        typeName,
        ...operations
    ) {
        if (
            typeof typeName !== "string" ||
            !types[typeName] ||
            operations.length === 0
        ) {
            return "Invalid Input";
        }

        let current =
            cloneProperties(types[typeName]);

        let typeString = typeName;

        const lineage = [typeName];

        for (const operationEntry of operations) {
            let operation;
            let argument;

            if (typeof operationEntry === "string") {
                operation = operationEntry;
            } else if (
                Array.isArray(operationEntry)
            ) {
                operation = operationEntry[0];
                argument = operationEntry[1];
            } else {
                return "Invalid Input";
            }

            const transformed =
                applyOperation(
                    current,
                    operation,
                    argument
                );

            if (transformed === null) {
                return "Invalid Input";
            }

            current = transformed;

            if (operation === "Omit") {
                typeString =
                    `Omit<${typeString}, '${argument.join(
                        "' | '"
                    )}'>`;
            } else if (operation === "Pick") {
                typeString =
                    `Pick<${typeString}, '${argument.join(
                        "' | '"
                    )}'>`;
            } else {
                typeString =
                    `${operation}<${typeString}>`;
            }

            lineage.push(typeString);
            chainedOps++;
        }

        totalTransforms++;

        if (config.trackHistory) {
            history.push({
                typeName,
                operations: [...operations],
                lineage: [...lineage]
            });
        }

        return {
            result: current,
            typeString,
            lineage
        };
    }

    // --- STEP 8: INFER FROM TYPE STRING ---

    function inferFrom(
        typeString,
        pattern
    ) {
        if (
            typeof typeString !== "string" ||
            typeof pattern !== "string"
        ) {
            return "Invalid Input";
        }

        let inferred = null;

        switch (pattern) {
            case "Promise":
                inferred =
                    typeString.match(
                        /^Promise<(.+)>$/
                    )?.[1] || null;
                break;

            case "Array":
                inferred =
                    typeString.match(
                        /^Array<(.+)>$/
                    )?.[1] ||
                    typeString.match(
                        /^(.+)\[\]$/
                    )?.[1] ||
                    null;
                break;

            case "ReturnType":
                inferred =
                    typeString.match(
                        /=>\s*(.+)$/
                    )?.[1] || null;
                break;

            case "Parameters":
                inferred =
                    typeString.match(
                        /^\((.*)\)\s*=>/
                    )?.[1] || null;
                break;

            default:
                return "Invalid Input";
        }

        return {
            inferred,
            pattern,
            original: typeString
        };
    }

    // --- STEP 9: COMPOSE TYPES ---

    function compose(
        name,
        typeA,
        operator,
        typeB
    ) {
        if (
            typeof name !== "string" ||
            typeof typeA !== "string" ||
            typeof typeB !== "string" ||
            !["union", "intersection", "exclude", "extract"]
                .includes(operator)
        ) {
            return "Invalid Input";
        }

        let result;

        switch (operator) {
            case "union":
                result = `${typeA} | ${typeB}`;
                break;

            case "intersection":
                result = `${typeA} & ${typeB}`;
                break;

            case "exclude":
                result =
                    `Exclude<${typeA}, ${typeB}>`;
                break;

            case "extract":
                result =
                    `Extract<${typeA}, ${typeB}>`;
                break;
        }

        totalTransforms++;

        return {
            result,
            typeString: result,
            lineage: [typeA, typeB]
        };
    }

    // --- STEP 10: GENERATE COMMON VARIANTS ---

    function generateVariants(typeName) {
        if (
            typeof typeName !== "string" ||
            !types[typeName]
        ) {
            return "Invalid Input";
        }

        generatedVariants += 7;

        return {
            Partial:
                `Partial<${typeName}>`,
            Required:
                `Required<${typeName}>`,
            Readonly:
                `Readonly<${typeName}>`,
            Nullable:
                `${typeName} | null`,
            Array:
                `${typeName}[]`,
            Promise:
                `Promise<${typeName}>`,
            Record:
                `Record<string, ${typeName}>`
        };
    }

    // --- STEP 11: VALIDATE TRANSFORMED RESULT ---

    function validate(
        transformResult,
        value
    ) {
        if (
            typeof transformResult !== "object" ||
            transformResult === null ||
            typeof value !== "object" ||
            value === null
        ) {
            return "Invalid Input";
        }

        const properties =
            transformResult.result;

        if (
            typeof properties !== "object" ||
            properties === null ||
            properties.__record__
        ) {
            return {
                valid: true,
                errors: {}
            };
        }

        const errors = {};

        for (const [key, property] of Object.entries(
            properties
        )) {
            if (
                !property.optional &&
                !Object.prototype.hasOwnProperty.call(
                    value,
                    key
                )
            ) {
                errors[key] =
                    "Required field missing";
            }
        }

        return {
            valid:
                Object.keys(errors).length === 0,
            errors
        };
    }

    // --- STEP 12: GET HISTORY ---

    function getHistory() {
        return history.map(
            entry => ({
                ...entry,
                operations: [...entry.operations],
                lineage: [...entry.lineage]
            })
        );
    }

    // --- STEP 13: GENERATE REPORT ---

    function getReport() {
        return {
            totalTransforms,
            chainedOps,
            generatedVariants
        };
    }

    // --- STEP 14: RETURN TRANSFORMER API ---

    return {
        transform,
        inferFrom,
        compose,
        generateVariants,
        validate,
        getHistory,
        getReport
    };
}



// --- EXAMPLE USAGE ---
const transformer = buildTypeTransformer({
    types: {
        User: {
            id: {
                type: "number",
                optional: false,
                readonly: true
            },
            name: {
                type: "string",
                optional: false,
                readonly: false
            },
            email: {
                type: "string",
                optional: true,
                readonly: false
            }
        }
    },
    strict: true,
    trackHistory: true
});


console.log(
    transformer.transform(
        "User",
        "Partial",
        ["Omit", ["id"]],
        "Readonly"
    )
);

console.log(
    transformer.compose(
        "AdminOrUser",
        "User",
        "union",
        "Admin"
    )
);

console.log(transformer.generateVariants("User"));

console.log(transformer.getHistory());

console.log(transformer.getReport());