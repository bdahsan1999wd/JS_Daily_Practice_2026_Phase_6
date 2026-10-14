// PROBLEM–05: createUtilityComposer()

// Logic: Composes multiple TypeScript utility types together and tracks the resulting type shape, type string, derivation lineage, DTO patterns, comparisons, validation, and composition statistics.

function createUtilityComposer(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        config === null ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        config.types === null ||
        typeof config.types !== "object" ||
        Array.isArray(config.types) ||
        typeof config.strict !== "boolean" ||
        typeof config.trackLineage !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: HELPER FUNCTIONS ---
    const isPlainObject = (value) => {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    };

    const cloneProperties = (properties) => {
        const result = {};

        for (const [key, config] of Object.entries(properties)) {
            result[key] = {
                ...config
            };
        }

        return result;
    };

    const formatKeys = (keys) => {
        return keys
            .map((key) => `'${key}'`)
            .join(" | ");
    };

    // --- STEP 3: VALIDATE BASE TYPES ---
    const baseTypes = {};

    for (const [typeName, properties] of Object.entries(
        config.types
    )) {
        if (
            typeof typeName !== "string" ||
            !isPlainObject(properties)
        ) {
            return "Invalid Input";
        }

        for (const [propertyName, property] of Object.entries(
            properties
        )) {
            if (
                !isPlainObject(property) ||
                typeof property.type !== "string" ||
                typeof property.optional !== "boolean" ||
                typeof property.readonly !== "boolean"
            ) {
                return "Invalid Input";
            }
        }

        baseTypes[typeName] = cloneProperties(properties);
    }

    // --- STEP 4: REPORT ---
    const report = {
        totalCompositions: 0,
        typeLineage: {},
        mostComposed: null
    };

    const trackComposition = (baseType, lineage) => {
        report.totalCompositions++;

        report.typeLineage[baseType] =
            (report.typeLineage[baseType] || 0) + 1;

        let maxCount = 0;
        let maxType = null;

        for (const [typeName, count] of Object.entries(
            report.typeLineage
        )) {
            if (count > maxCount) {
                maxCount = count;
                maxType = typeName;
            }
        }

        report.mostComposed = maxType;
    };

    // --- STEP 5: APPLY SINGLE UTILITY ---
    const applyUtility = (
        current,
        utilityName,
        args
    ) => {
        const properties = cloneProperties(
            current.properties
        );

        // Partial<T>
        if (utilityName === "Partial") {
            for (const key of Object.keys(properties)) {
                properties[key].optional = true;
            }

            return {
                properties,
                typeString: `Partial<${current.typeString}>`
            };
        }

        // Required<T>
        if (utilityName === "Required") {
            for (const key of Object.keys(properties)) {
                properties[key].optional = false;
            }

            return {
                properties,
                typeString: `Required<${current.typeString}>`
            };
        }

        // Readonly<T>
        if (utilityName === "Readonly") {
            for (const key of Object.keys(properties)) {
                properties[key].readonly = true;
            }

            return {
                properties,
                typeString: `Readonly<${current.typeString}>`
            };
        }

        // Pick<T, K>
        if (utilityName === "Pick") {
            const keys = args;

            if (
                !Array.isArray(keys) ||
                keys.length === 0
            ) {
                return null;
            }

            const selected = {};

            for (const key of keys) {
                if (
                    typeof key !== "string" ||
                    !Object.prototype.hasOwnProperty.call(
                        properties,
                        key
                    )
                ) {
                    return null;
                }

                selected[key] = {
                    ...properties[key]
                };
            }

            const keyString = formatKeys(keys);

            return {
                properties: selected,
                typeString:
                    `Pick<${current.typeString}, ${keyString}>`
            };
        }

        // Omit<T, K>
        if (utilityName === "Omit") {
            const keys = args;

            if (
                !Array.isArray(keys) ||
                keys.length === 0
            ) {
                return null;
            }

            const selected = {};

            for (const key of Object.keys(properties)) {
                if (!keys.includes(key)) {
                    selected[key] = {
                        ...properties[key]
                    };
                }
            }

            const keyString = formatKeys(keys);

            return {
                properties: selected,
                typeString:
                    `Omit<${current.typeString}, ${keyString}>`
            };
        }

        return null;
    };

    // --- STEP 6: VALIDATE COMPOSED VALUE ---
    const validateComposedValue = (
        composedType,
        value
    ) => {
        if (
            !isPlainObject(composedType) ||
            !isPlainObject(composedType.properties) ||
            !isPlainObject(value)
        ) {
            return "Invalid Input";
        }

        const errors = {};

        for (const [key, property] of Object.entries(
            composedType.properties
        )) {
            const exists =
                Object.prototype.hasOwnProperty.call(
                    value,
                    key
                );

            if (!property.optional && !exists) {
                errors[key] = "Required property missing";
                continue;
            }

            if (!exists) {
                continue;
            }

            let actualType;

            if (value[key] === null) {
                actualType = "null";
            } else if (Array.isArray(value[key])) {
                actualType = "array";
            } else {
                actualType = typeof value[key];
            }

            if (actualType !== property.type) {
                errors[key] =
                    `Expected ${property.type}, got ${actualType}`;
            }
        }

        if (config.strict) {
            for (const key of Object.keys(value)) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        composedType.properties,
                        key
                    )
                ) {
                    errors[key] = "Unexpected property";
                }
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    };

    // --- STEP 7: RETURN COMPOSER API ---
    return {
        // Apply multiple utilities
        apply(typeName, ...utilities) {
            // --- VALIDATE BASE TYPE ---
            if (
                typeof typeName !== "string" ||
                !baseTypes[typeName]
            ) {
                return "Invalid Input";
            }

            let current = {
                properties:
                    cloneProperties(baseTypes[typeName]),
                typeString: typeName
            };

            const lineage = [typeName];

            // --- APPLY EACH UTILITY IN ORDER ---
            for (const utility of utilities) {
                let utilityName;
                let args = [];

                // "Partial"
                if (typeof utility === "string") {
                    utilityName = utility;
                }

                // ["Pick", ["id", "name"]]
                else if (Array.isArray(utility)) {
                    utilityName = utility[0];
                    args = utility[1];
                }

                else {
                    return "Invalid Input";
                }

                if (
                    typeof utilityName !== "string" ||
                    ![
                        "Partial",
                        "Required",
                        "Readonly",
                        "Pick",
                        "Omit"
                    ].includes(utilityName)
                ) {
                    return "Invalid Input";
                }

                const next = applyUtility(
                    current,
                    utilityName,
                    args
                );

                if (!next) {
                    return "Invalid Input";
                }

                current = next;

                lineage.push(current.typeString);
            }

            trackComposition(
                typeName,
                lineage
            );

            return {
                resultType: current.properties,
                lineage: config.trackLineage
                    ? lineage
                    : [],
                typeString: current.typeString
            };
        },

        // Partial<Omit<T, "id" | "createdAt">>
        createUpdateDTO(typeName) {
            if (
                typeof typeName !== "string" ||
                !baseTypes[typeName]
            ) {
                return "Invalid Input";
            }

            const result = this.apply(
                typeName,
                ["Omit", ["id", "createdAt"]],
                "Partial"
            );

            if (result === "Invalid Input") {
                return result;
            }

            return {
                typeString: result.typeString,
                properties: result.resultType
            };
        },

        // Omit<T, omitFields>
        createCreateDTO(typeName, omitFields) {
            if (
                typeof typeName !== "string" ||
                !baseTypes[typeName] ||
                !Array.isArray(omitFields)
            ) {
                return "Invalid Input";
            }

            const result = this.apply(
                typeName,
                ["Omit", omitFields]
            );

            if (result === "Invalid Input") {
                return result;
            }

            return {
                typeString: result.typeString,
                properties: result.resultType
            };
        },

        // Readonly<Pick<T, includeFields>>
        createResponseType(
            typeName,
            includeFields
        ) {
            if (
                typeof typeName !== "string" ||
                !baseTypes[typeName] ||
                !Array.isArray(includeFields)
            ) {
                return "Invalid Input";
            }

            const result = this.apply(
                typeName,
                ["Pick", includeFields],
                "Readonly"
            );

            if (result === "Invalid Input") {
                return result;
            }

            return {
                typeString: result.typeString,
                properties: result.resultType
            };
        },

        // Compare two types
        diff(typeA, typeB) {
            if (
                !isPlainObject(typeA) ||
                !isPlainObject(typeB)
            ) {
                return "Invalid Input";
            }

            const added = [];
            const removed = [];
            const changed = [];

            const propsA = typeA.properties || {};
            const propsB = typeB.properties || {};

            for (const key of Object.keys(propsB)) {
                if (!Object.prototype.hasOwnProperty.call(propsA, key)) {
                    added.push(key);
                    continue;
                }

                if (
                    JSON.stringify(propsA[key]) !==
                    JSON.stringify(propsB[key])
                ) {
                    changed.push(key);
                }
            }

            for (const key of Object.keys(propsA)) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        propsB,
                        key
                    )
                ) {
                    removed.push(key);
                }
            }

            return {
                added,
                removed,
                changed
            };
        },

        // Validate value
        validate(composedType, value) {
            return validateComposedValue(
                composedType,
                value
            );
        },

        // Generate common variations
        generateAll(typeName) {
            if (
                typeof typeName !== "string" ||
                !baseTypes[typeName]
            ) {
                return "Invalid Input";
            }

            return {
                Partial: `Partial<${typeName}>`,
                Required: `Required<${typeName}>`,
                Readonly: `Readonly<${typeName}>`,
                WithoutId: `Omit<${typeName}, 'id'>`
            };
        },

        // Report
        getReport() {
            return {
                totalCompositions:
                    report.totalCompositions,

                typeLineage: {
                    ...report.typeLineage
                },

                mostComposed:
                    report.mostComposed
            };
        }
    };
}


// --- EXAMPLE USAGE ---
const composer = createUtilityComposer({
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
                optional: false,
                readonly: false
            },

            createdAt: {
                type: "string",
                optional: false,
                readonly: true
            },

            role: {
                type: "string",
                optional: true,
                readonly: false
            }
        }
    },

    strict: true,
    trackLineage: true
});


console.log(
    composer.apply(
        "User",
        "Partial",
        ["Pick", ["id", "name", "email"]],
        "Readonly"
    )
);

console.log(composer.createUpdateDTO("User"));

console.log(
    composer.createCreateDTO(
        "User",
        ["id", "createdAt"]
    )
);

console.log(
    composer.createResponseType(
        "User",
        ["id", "name", "email"]
    )
);

console.log(composer.generateAll("User"));

const composed = composer.apply(
    "User",
    ["Pick", ["id", "name", "email"]],
    "Readonly"
);

console.log(
    composer.validate(
        {
            properties: composed.resultType
        },
        {
            id: 1,
            name: "Rahim",
            email: "rahim@example.com"
        }
    )
);

console.log(composer.getReport());