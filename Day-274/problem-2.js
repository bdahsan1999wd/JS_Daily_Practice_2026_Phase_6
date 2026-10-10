// PROBLEM–02: Intersection Type Builder Engine


function createIntersectionEngine(types) {

    // --- STEP 1: VALIDATE MAIN INPUT ---
    if (!Array.isArray(types) || types.length === 0) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE TYPE DEFINITIONS ---
    for (const type of types) {
        if (
            !type ||
            typeof type !== "object" ||
            typeof type.name !== "string" ||
            type.name.trim() === "" ||
            !type.properties ||
            typeof type.properties !== "object" ||
            Array.isArray(type.properties)
        ) {
            return "Invalid Input";
        }

        for (const [property, definition] of Object.entries(
            type.properties
        )) {
            if (
                !definition ||
                typeof definition !== "object" ||
                typeof definition.type !== "string" ||
                typeof definition.optional !== "boolean" ||
                typeof definition.readonly !== "boolean"
            ) {
                return "Invalid Input";
            }

            if (property.trim() === "") {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 3: CREATE TYPE STORE ---
    const typeMap = new Map();

    for (const type of types) {
        if (typeMap.has(type.name)) {
            return "Invalid Input";
        }

        typeMap.set(type.name, {
            name: type.name,
            properties: structuredClone(type.properties)
        });
    }

    // --- STEP 4: INTERSECTION STORE ---
    const intersectionMap = new Map();

    // --- STEP 5: HELPER FOR PROPERTY TYPE ---
    const sameType = (typeA, typeB) => {
        return typeA === typeB;
    };

    // --- STEP 6: HELPER TO VALIDATE RUNTIME VALUE ---
    const matchesRuntimeType = (value, expectedType) => {
        if (expectedType === "null") {
            return value === null;
        }

        if (expectedType === "function") {
            return typeof value === "function";
        }

        if (expectedType === "object") {
            return (
                value !== null &&
                typeof value === "object"
            );
        }

        return typeof value === expectedType;
    };

    // --- STEP 7: GET TYPE PROPERTY ERROR ---
    const validateType = (typeName, value) => {
        const type = typeMap.get(typeName);

        if (!type) {
            return {
                valid: false,
                errors: {
                    type: `Unknown type: ${typeName}`
                }
            };
        }

        const errors = {};

        if (
            value === null ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {
            return {
                valid: false,
                errors: {
                    value: "Expected an object"
                }
            };
        }

        for (const [property, definition] of Object.entries(
            type.properties
        )) {
            const exists = Object.prototype.hasOwnProperty.call(
                value,
                property
            );

            // Required property missing
            if (!exists && !definition.optional) {
                errors[property] = "Required property missing";
                continue;
            }

            // Optional property may be absent
            if (!exists) {
                continue;
            }

            if (
                !matchesRuntimeType(
                    value[property],
                    definition.type
                )
            ) {
                errors[property] =
                    `Expected ${definition.type}`;
            }
        }

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    };

    // --- STEP 8: RETURN INTERSECTION ENGINE API ---
    return {

        // intersect(typeName, typeNames[])
        intersect(typeName, typeNames) {
            if (
                typeof typeName !== "string" ||
                !Array.isArray(typeNames) ||
                typeNames.length === 0 ||
                typeNames.some(
                    (name) => typeof name !== "string"
                )
            ) {
                return "Invalid Input";
            }

            if (intersectionMap.has(typeName)) {
                return intersectionMap.get(typeName);
            }

            const selectedTypes = typeNames.map((name) =>
                typeMap.get(name)
            );

            if (selectedTypes.some((type) => !type)) {
                return "Invalid Input";
            }

            const mergedProperties = {};
            const conflicts = [];

            // Merge every property from every type.
            for (const type of selectedTypes) {
                for (const [property, definition] of Object.entries(
                    type.properties
                )) {
                    if (!mergedProperties[property]) {
                        mergedProperties[property] = {
                            type: definition.type,
                            optional: definition.optional,
                            readonly: definition.readonly
                        };
                        continue;
                    }

                    const existing = mergedProperties[property];

                    // Conflicting property types => never
                    if (
                        !sameType(
                            existing.type,
                            definition.type
                        )
                    ) {
                        const alreadyReported =
                            conflicts.some(
                                (conflict) =>
                                    conflict.property ===
                                    property &&
                                    conflict.typeA ===
                                    existing.type &&
                                    conflict.typeB ===
                                    definition.type
                            );

                        if (!alreadyReported) {
                            conflicts.push({
                                property,
                                typeA: existing.type,
                                typeB: definition.type
                            });
                        }
                    }

                    // Required if required in ANY member.
                    existing.optional =
                        existing.optional &&
                        definition.optional;

                    // readonly if readonly in ANY member.
                    existing.readonly =
                        existing.readonly ||
                        definition.readonly;
                }
            }

            // Match the sample's compact property format.
            const propertyOutput = {};

            for (const [property, definition] of Object.entries(
                mergedProperties
            )) {
                propertyOutput[property] = definition.type;
            }

            const result = {
                name: typeName,
                properties: propertyOutput,
                conflicts,
                typeString: typeNames.join(" & ")
            };

            // Keep full metadata internally for validation.
            intersectionMap.set(typeName, {
                ...result,
                _definitions: mergedProperties,
                _typeNames: [...typeNames]
            });

            return {
                name: result.name,
                properties: result.properties,
                conflicts: result.conflicts,
                typeString: result.typeString
            };
        },

        // validate(intersectionName, value)
        validate(intersectionName, value) {
            const intersection =
                intersectionMap.get(intersectionName);

            if (!intersection) {
                return "Invalid Input";
            }

            const errors = {};
            const satisfiedTypes = [];
            const failedTypes = [];

            for (const typeName of intersection._typeNames) {
                const result = validateType(typeName, value);

                if (result.valid) {
                    satisfiedTypes.push(typeName);
                } else {
                    failedTypes.push(typeName);

                    Object.assign(
                        errors,
                        result.errors
                    );
                }
            }

            return {
                valid: failedTypes.length === 0,
                errors,
                satisfiedTypes,
                failedTypes
            };
        },

        // hasConflict(typeA, typeB)
        hasConflict(typeA, typeB) {
            const first = typeMap.get(typeA);
            const second = typeMap.get(typeB);

            if (!first || !second) {
                return "Invalid Input";
            }

            const conflicts = [];

            for (const [property, definitionA] of Object.entries(
                first.properties
            )) {
                const definitionB =
                    second.properties[property];

                if (
                    definitionB &&
                    definitionA.type !== definitionB.type
                ) {
                    conflicts.push({
                        property,
                        typeA: definitionA.type,
                        typeB: definitionB.type
                    });
                }
            }

            return {
                hasConflict: conflicts.length > 0,
                conflicts
            };
        },

        // simplify(intersectionName)
        simplify(intersectionName) {
            const intersection =
                intersectionMap.get(intersectionName);

            if (!intersection) {
                return "Invalid Input";
            }

            if (intersection.conflicts.length > 0) {
                return "never";
            }

            return intersection._typeNames.join(" & ");
        },

        // generate(intersectionName)
        generate(intersectionName) {
            const intersection =
                intersectionMap.get(intersectionName);

            if (!intersection) {
                return "Invalid Input";
            }

            return intersection.typeString;
        },

        // getReport()
        getReport() {
            let conflicts = 0;
            let neverTypes = 0;

            for (const intersection of intersectionMap.values()) {
                conflicts += intersection.conflicts.length;

                if (intersection.conflicts.length > 0) {
                    neverTypes++;
                }
            }

            return {
                totalTypes: types.length,
                intersections: intersectionMap.size,
                neverTypes,
                conflicts
            };
        }
    };
}


// --- EXAMPLE USAGE ---
const intersectionEngine = createIntersectionEngine([
    {
        name: "Flyable",
        properties: {
            fly: {
                type: "function",
                optional: false,
                readonly: false
            },
            altitude: {
                type: "number",
                optional: false,
                readonly: false
            }
        }
    },
    {
        name: "Swimmable",
        properties: {
            swim: {
                type: "function",
                optional: false,
                readonly: false
            },
            depth: {
                type: "number",
                optional: false,
                readonly: false
            }
        }
    },
    {
        name: "Named",
        properties: {
            name: {
                type: "string",
                optional: false,
                readonly: false
            }
        }
    },
    {
        name: "Conflicting",
        properties: {
            name: {
                type: "number",
                optional: false,
                readonly: false
            }
        }
    }
]);


console.log(
    intersectionEngine.intersect(
        "FlyingSwimmer",
        ["Flyable", "Swimmable", "Named"]
    )
);

console.log(
    intersectionEngine.hasConflict(
        "Named",
        "Conflicting"
    )
);

console.log(
    intersectionEngine.validate(
        "FlyingSwimmer",
        {
            fly: () => { },
            altitude: 1000,
            swim: () => { },
            depth: 50,
            name: "Duck"
        }
    )
);

console.log(intersectionEngine.generate("FlyingSwimmer"));
console.log(intersectionEngine.simplify("FlyingSwimmer"));
console.log(intersectionEngine.getReport());


// --- Invalid Input ---
console.log(createIntersectionEngine([]));
console.log(createIntersectionEngine("invalid"));