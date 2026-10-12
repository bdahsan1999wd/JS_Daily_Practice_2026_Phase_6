// PROBLEM–01: createUtilityTypeSimulator()

// Logic: Simulates TypeScript utility types such as Partial, Required, Readonly, Pick, Omit, and Record at runtime.

function createUtilityTypeSimulator(types) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(types)) {
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

    const getRuntimeType = (value) => {
        if (value === null) return "null";
        if (Array.isArray(value)) return "array";

        return typeof value;
    };

    const cloneProperties = (properties) => {
        const result = {};

        for (const [key, config] of Object.entries(properties)) {
            result[key] = { ...config };
        }

        return result;
    };

    const formatKeys = (keys) => {
        return keys.map((key) => `'${key}'`).join(" | ");
    };

    // --- STEP 3: VALIDATE TYPE DEFINITIONS ---
    const typeMap = {};

    for (const typeDef of types) {
        if (
            !isPlainObject(typeDef) ||
            typeof typeDef.name !== "string" ||
            !typeDef.name.trim() ||
            !isPlainObject(typeDef.properties)
        ) {
            return "Invalid Input";
        }

        if (typeMap[typeDef.name]) {
            return "Invalid Input";
        }

        for (const [propName, prop] of Object.entries(typeDef.properties)) {
            if (
                !isPlainObject(prop) ||
                typeof prop.type !== "string" ||
                typeof prop.optional !== "boolean" ||
                typeof prop.readonly !== "boolean"
            ) {
                return "Invalid Input";
            }
        }

        typeMap[typeDef.name] = {
            name: typeDef.name,
            properties: cloneProperties(typeDef.properties)
        };
    }

    // --- STEP 4: REPORT TRACKING ---
    const report = {
        totalTypes: types.length,
        utilityApplications: 0,
        byUtility: {}
    };

    const trackUtility = (utilityName) => {
        report.utilityApplications++;

        report.byUtility[utilityName] =
            (report.byUtility[utilityName] || 0) + 1;
    };

    // --- STEP 5: TYPE LOOKUP ---
    const getType = (typeName) => {
        if (typeof typeName !== "string" || !typeMap[typeName]) {
            return null;
        }

        return typeMap[typeName];
    };

    // --- STEP 6: BUILD UTILITY RESULT ---
    const buildUtilityResult = (
        utilityName,
        typeName,
        properties,
        transform
    ) => {
        const original = getType(typeName);

        if (!original) {
            return "Invalid Input";
        }

        const finalProperties = {};

        for (const [key, config] of Object.entries(properties)) {
            finalProperties[key] = transform
                ? transform(config)
                : { ...config };
        }

        trackUtility(utilityName);

        return {
            name: `${utilityName}<${typeName}>`,
            properties: finalProperties,
            typeString: `${utilityName}<${typeName}>`
        };
    };

    // --- STEP 7: VALIDATE VALUE AGAINST A TYPE RESULT ---
    const validateValue = (utilityResult, value) => {
        if (
            !isPlainObject(utilityResult) ||
            !isPlainObject(utilityResult.properties) ||
            !isPlainObject(value)
        ) {
            return "Invalid Input";
        }

        const errors = {};

        for (const [propName, config] of Object.entries(
            utilityResult.properties
        )) {
            const exists = Object.prototype.hasOwnProperty.call(
                value,
                propName
            );

            // Required property missing
            if (!config.optional && !exists) {
                errors[propName] = "Required property missing";
                continue;
            }

            // Optional property can be omitted
            if (!exists) {
                continue;
            }

            const actualType = getRuntimeType(value[propName]);

            // Basic type comparison
            if (actualType !== config.type) {
                errors[propName] =
                    `Expected ${config.type}, got ${actualType}`;
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    };

    // --- STEP 8: RETURN UTILITY API ---
    return {
        // Partial<T>
        Partial(typeName) {
            const type = getType(typeName);

            if (!type) {
                return "Invalid Input";
            }

            const properties = {};

            for (const [key, config] of Object.entries(type.properties)) {
                properties[key] = {
                    type: config.type,
                    optional: true
                };
            }

            trackUtility("Partial");

            return {
                name: `Partial<${typeName}>`,
                properties,
                typeString: `Partial<${typeName}>`
            };
        },

        // Required<T>
        Required(typeName) {
            const type = getType(typeName);

            if (!type) {
                return "Invalid Input";
            }

            const properties = {};

            for (const [key, config] of Object.entries(type.properties)) {
                properties[key] = {
                    type: config.type,
                    optional: false
                };
            }

            trackUtility("Required");

            return {
                name: `Required<${typeName}>`,
                properties,
                typeString: `Required<${typeName}>`
            };
        },

        // Readonly<T>
        Readonly(typeName) {
            const type = getType(typeName);

            if (!type) {
                return "Invalid Input";
            }

            const properties = {};

            for (const [key, config] of Object.entries(type.properties)) {
                properties[key] = {
                    type: config.type,
                    optional: config.optional,
                    readonly: true
                };
            }

            trackUtility("Readonly");

            return {
                name: `Readonly<${typeName}>`,
                properties,
                typeString: `Readonly<${typeName}>`
            };
        },

        // Pick<T, K>
        Pick(typeName, keys) {
            const type = getType(typeName);

            if (!type || !Array.isArray(keys) || keys.length === 0) {
                return "Invalid Input";
            }

            const properties = {};

            for (const key of keys) {
                if (
                    typeof key !== "string" ||
                    !Object.prototype.hasOwnProperty.call(
                        type.properties,
                        key
                    )
                ) {
                    return "Invalid Input";
                }

                properties[key] = {
                    ...type.properties[key]
                };
            }

            const keyString = formatKeys(keys);

            trackUtility("Pick");

            return {
                name: `Pick<${typeName}, ${keyString}>`,
                properties,
                typeString: `Pick<${typeName}, ${keyString}>`
            };
        },

        // Omit<T, K>
        Omit(typeName, keys) {
            const type = getType(typeName);

            if (!type || !Array.isArray(keys) || keys.length === 0) {
                return "Invalid Input";
            }

            const properties = {};

            for (const key of Object.keys(type.properties)) {
                if (!keys.includes(key)) {
                    properties[key] = {
                        ...type.properties[key]
                    };
                }
            }

            const keyString = formatKeys(keys);

            trackUtility("Omit");

            return {
                name: `Omit<${typeName}, ${keyString}>`,
                properties,
                typeString: `Omit<${typeName}, ${keyString}>`
            };
        },

        // Record<K, V>
        Record(keyType, valueType) {
            if (
                typeof keyType !== "string" ||
                typeof valueType !== "string" ||
                !keyType.trim() ||
                !valueType.trim()
            ) {
                return "Invalid Input";
            }

            trackUtility("Record");

            return {
                name: `Record<${keyType}, ${valueType}>`,
                keyType,
                valueType,
                typeString: `Record<${keyType}, ${valueType}>`
            };
        },

        // Validate utility result
        validate(utilityResult, value) {
            return validateValue(utilityResult, value);
        },

        // Report
        getReport() {
            return {
                totalTypes: report.totalTypes,
                utilityApplications: report.utilityApplications,
                byUtility: { ...report.byUtility }
            };
        }
    };
}


// --- EXAMPLE USAGE ---
const sim = createUtilityTypeSimulator([
    {
        name: "User",
        properties: {
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
            },
            age: {
                type: "number",
                optional: false,
                readonly: false
            }
        }
    }
]);


console.log(sim.Partial("User"));

console.log(sim.Required("User"));

console.log(
    sim.Pick("User", ["id", "name"])
);

console.log(
    sim.Omit("User", ["email", "age"])
);

console.log(
    sim.Record("string", "number")
);

const pickedUser = sim.Pick("User", ["id", "name"]);

console.log(
    sim.validate(
        pickedUser,
        {
            id: 1,
            name: "Rahim"
        }
    )
);

console.log(sim.getReport());