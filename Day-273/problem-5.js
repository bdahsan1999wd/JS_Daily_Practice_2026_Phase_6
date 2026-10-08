// PROBLEM–05: createObjectTypeRegistry()

// Logic: This function creates an object-type registry engine. It registers reusable object shapes, validates and creates typed objects, supports default values, optional automatic type coercion, simulated casting errors, pick/omit/partial/required utilities, and reporting.

function createObjectTypeRegistry(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    if (
        !config ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.strict !== "boolean" ||
        typeof config.allowExtraProperties !== "boolean" ||
        typeof config.autoCoerce !== "boolean"
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE PRIVATE TYPE REGISTRY ---
    // Map keeps all registered object types private.
    const registry = new Map();


    // --- STEP 3: CREATE VALUE TYPE CHECKER ---
    const checkType = (value, expectedType) => {

        if (expectedType === "any") {
            return true;
        }

        if (expectedType === "string") {
            return typeof value === "string";
        }

        if (expectedType === "number") {
            return typeof value === "number" &&
                !Number.isNaN(value);
        }

        if (expectedType === "boolean") {
            return typeof value === "boolean";
        }

        if (expectedType === "array") {
            return Array.isArray(value);
        }

        if (expectedType === "object") {
            return value !== null &&
                typeof value === "object" &&
                !Array.isArray(value);
        }

        if (expectedType === "function") {
            return typeof value === "function";
        }

        return true;
    };


    // --- STEP 4: CREATE COERCION ENGINE ---
    // Attempts to convert values into the expected type.
    const coerceValue = (value, expectedType) => {

        if (expectedType === "number") {

            if (
                typeof value === "string" &&
                value.trim() !== ""
            ) {

                const numberValue = Number(value);

                if (!Number.isNaN(numberValue)) {
                    return {
                        success: true,
                        value: numberValue
                    };
                }
            }
        }


        if (expectedType === "string") {

            if (
                typeof value === "number" ||
                typeof value === "boolean"
            ) {

                return {
                    success: true,
                    value: String(value)
                };
            }
        }


        if (expectedType === "boolean") {

            if (value === "true") {

                return {
                    success: true,
                    value: true
                };
            }

            if (value === "false") {

                return {
                    success: true,
                    value: false
                };
            }
        }


        return {
            success: false,
            value
        };
    };


    // --- STEP 5: CREATE REGISTER METHOD ---
    const register = (name, shape) => {

        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            !shape ||
            typeof shape !== "object" ||
            Array.isArray(shape)
        ) {
            return "Invalid Input";
        }


        // Validate every field definition.
        for (const [property, definition] of Object.entries(shape)) {

            if (
                !definition ||
                typeof definition !== "object" ||
                typeof definition.type !== "string" ||
                typeof definition.optional !== "boolean" ||
                typeof definition.readonly !== "boolean"
            ) {
                return "Invalid Input";
            }


            // Default is optional in a definition.
            if (
                Object.prototype.hasOwnProperty.call(
                    definition,
                    "default"
                ) === false
            ) {
                definition.default = null;
            }
        }


        registry.set(
            name,
            JSON.parse(JSON.stringify(shape))
        );


        return {
            name,
            shape: registry.get(name)
        };
    };


    // --- STEP 6: CREATE OBJECT CREATION ENGINE ---
    const create = (typeName, data) => {

        const shape = registry.get(typeName);


        if (
            !shape ||
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return {
                object: null,
                warnings: ["Invalid type or data"],
                coerced: []
            };
        }


        const result = {};
        const warnings = [];
        const coerced = [];


        // --- STEP 6A: PROCESS DEFINED FIELDS ---
        for (const [property, definition] of Object.entries(shape)) {

            const hasValue =
                Object.prototype.hasOwnProperty.call(
                    data,
                    property
                );


            // Use provided value.
            if (hasValue) {

                let value = data[property];


                // Try automatic coercion.
                if (
                    config.autoCoerce &&
                    !checkType(value, definition.type)
                ) {

                    const conversion =
                        coerceValue(
                            value,
                            definition.type
                        );


                    if (conversion.success) {

                        value = conversion.value;

                        coerced.push(property);
                    }
                }


                // Validate after coercion.
                if (!checkType(value, definition.type)) {

                    warnings.push(
                        `Invalid type for ${property}`
                    );

                    continue;
                }


                result[property] = value;

                continue;
            }


            // --- STEP 6B: APPLY DEFAULT VALUE ---
            if (
                definition.default !== null &&
                definition.default !== undefined
            ) {

                result[property] =
                    definition.default;

                continue;
            }


            // --- STEP 6C: HANDLE REQUIRED FIELD ---
            if (!definition.optional) {

                warnings.push(
                    `Required field missing: ${property}`
                );
            }
        }


        // --- STEP 6D: HANDLE EXTRA PROPERTIES ---
        const extraProperties =
            Object.keys(data)
                .filter(
                    property =>
                        !Object.prototype.hasOwnProperty.call(
                            shape,
                            property
                        )
                );


        if (
            !config.allowExtraProperties &&
            extraProperties.length > 0
        ) {

            for (const property of extraProperties) {

                warnings.push(
                    `Extra property not allowed: ${property}`
                );
            }
        }


        // Add extra properties when allowed.
        if (config.allowExtraProperties) {

            for (const property of extraProperties) {
                result[property] = data[property];
            }
        }


        // Strict mode converts missing required fields into failure.
        const hasRequiredErrors =
            warnings.some(
                warning =>
                    warning.startsWith(
                        "Required field missing"
                    )
            );


        if (config.strict && hasRequiredErrors) {

            return {
                object: null,
                warnings,
                coerced
            };
        }


        return {
            object: result,
            warnings,
            coerced
        };
    };


    // --- STEP 7: CREATE CAST METHOD ---
    // Cast behaves like create but returns a simulated error object
    // when the input violates the registered type definition.
    const cast = (typeName, data) => {

        const shape = registry.get(typeName);


        if (!shape) {
            return {
                error: true,
                violations: [
                    {
                        field: typeName,
                        issue: "Unknown type"
                    }
                ]
            };
        }


        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            return {
                error: true,
                violations: [
                    {
                        field: "data",
                        issue: "Invalid data object"
                    }
                ]
            };
        }


        const violations = [];


        for (const [property, definition] of Object.entries(shape)) {

            const exists =
                Object.prototype.hasOwnProperty.call(
                    data,
                    property
                );


            if (!exists) {

                if (!definition.optional &&
                    definition.default === null
                ) {

                    violations.push({
                        field: property,
                        issue: "Required field missing"
                    });
                }

                continue;
            }


            let value = data[property];


            if (
                config.autoCoerce &&
                !checkType(value, definition.type)
            ) {

                const conversion =
                    coerceValue(
                        value,
                        definition.type
                    );


                if (conversion.success) {
                    value = conversion.value;
                }
            }


            if (!checkType(value, definition.type)) {

                violations.push({
                    field: property,
                    issue:
                        `Expected ${definition.type}`
                });
            }
        }


        if (
            !config.allowExtraProperties
        ) {

            for (const property of Object.keys(data)) {

                if (
                    !Object.prototype.hasOwnProperty.call(
                        shape,
                        property
                    )
                ) {

                    violations.push({
                        field: property,
                        issue: "Extra property not allowed"
                    });
                }
            }
        }


        if (violations.length > 0) {

            return {
                error: true,
                violations
            };
        }


        const created = create(typeName, data);

        return created.object;
    };


    // --- STEP 8: CREATE PICK METHOD ---
    // Creates a new type containing only selected fields.
    const pick = (typeName, keys) => {

        const shape = registry.get(typeName);


        if (
            !shape ||
            !Array.isArray(keys)
        ) {
            return "Invalid Input";
        }


        const newShape = {};


        for (const key of keys) {

            if (
                Object.prototype.hasOwnProperty.call(
                    shape,
                    key
                )
            ) {

                newShape[key] = {
                    type: shape[key].type,
                    readonly: shape[key].readonly
                };
            }
        }


        return {
            name: `${typeName}_Pick`,
            shape: newShape
        };
    };


    // --- STEP 9: CREATE OMIT METHOD ---
    // Creates a new type without selected fields.
    const omit = (typeName, keys) => {

        const shape = registry.get(typeName);


        if (
            !shape ||
            !Array.isArray(keys)
        ) {
            return "Invalid Input";
        }


        const newShape = {};


        for (const [property, definition] of Object.entries(shape)) {

            if (!keys.includes(property)) {

                newShape[property] = {
                    type: definition.type,
                    optional: definition.optional,
                    readonly: definition.readonly,
                    default: definition.default
                };
            }
        }


        return {
            name: `${typeName}_Omit`,
            shape: newShape
        };
    };


    // --- STEP 10: CREATE PARTIAL METHOD ---
    // Makes every property optional.
    const partial = typeName => {

        const shape = registry.get(typeName);


        if (!shape) {
            return "Invalid Input";
        }


        const newShape = {};


        for (const [property, definition] of Object.entries(shape)) {

            newShape[property] = {
                type: definition.type,
                optional: true
            };
        }


        return {
            name: `${typeName}_Partial`,
            shape: newShape
        };
    };


    // --- STEP 11: CREATE REQUIRED METHOD ---
    // Makes every property required.
    const required = typeName => {

        const shape = registry.get(typeName);


        if (!shape) {
            return "Invalid Input";
        }


        const newShape = {};


        for (const [property, definition] of Object.entries(shape)) {

            newShape[property] = {
                type: definition.type,
                optional: false,
                readonly: definition.readonly
            };
        }


        return {
            name: `${typeName}_Required`,
            shape: newShape
        };
    };


    // --- STEP 12: CREATE GETTYPE METHOD ---
    // Returns a registered type definition.
    const getType = typeName => {

        if (!registry.has(typeName)) {
            return "Invalid Input";
        }


        return registry.get(typeName);
    };


    // --- STEP 13: CREATE REPORT METHOD ---
    const getReport = () => {

        let withDefaults = 0;


        for (const shape of registry.values()) {

            for (const definition of Object.values(shape)) {

                if (
                    definition.default !== null &&
                    definition.default !== undefined
                ) {
                    withDefaults++;
                }
            }
        }


        return {
            totalTypes: registry.size,
            withDefaults,
            strictMode: config.strict,
            coercionEnabled: config.autoCoerce
        };
    };


    // --- STEP 14: RETURN OBJECT TYPE REGISTRY API ---
    return {
        register,
        create,
        cast,
        pick,
        omit,
        partial,
        required,
        getType,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const registry = createObjectTypeRegistry({
    strict: true,
    allowExtraProperties: false,
    autoCoerce: true
});


registry.register("Product", {

    id: {
        type: "number",
        optional: false,
        readonly: true,
        default: null
    },

    name: {
        type: "string",
        optional: false,
        readonly: false,
        default: null
    },

    price: {
        type: "number",
        optional: false,
        readonly: false,
        default: null
    },

    stock: {
        type: "number",
        optional: true,
        readonly: false,
        default: 0
    },

    category: {
        type: "string",
        optional: true,
        readonly: false,
        default: "general"
    }
});


console.log(
    registry.create(
        "Product",
        {
            id: 1,
            name: "Laptop",
            price: "50000"
        }
    )
);


console.log(
    registry.cast(
        "Product",
        {
            name: "Mouse"
        }
    )
);


console.log(
    registry.pick(
        "Product",
        [
            "id",
            "name",
            "price"
        ]
    )
);


console.log(
    registry.omit(
        "Product",
        ["stock"]
    )
);

console.log(registry.partial("Product"));
console.log(registry.required("Product"));
console.log(registry.getType("Product"));
console.log(registry.getReport());


// --- Invalid Input ---
console.log(createObjectTypeRegistry("invalid"));