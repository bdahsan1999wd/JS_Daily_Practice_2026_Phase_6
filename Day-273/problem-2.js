// PROBLEM–02: createIndexSignatureEngine()

// Logic: This function creates an index-signature based object engine. It validates dynamic objects, creates objects from key-value pairs, merges objects using different strategies, filters and transforms entries, converts objects into sorted typed arrays, and generates reports.


function createIndexSignatureEngine(schemas) {

    // --- STEP 1: VALIDATE MAIN INPUT ---
    if (!Array.isArray(schemas) || schemas.length === 0) {
        return "Invalid Input";
    }


    // --- STEP 2: VALIDATE SCHEMA DEFINITIONS ---
    const schemaMap = new Map();

    for (const schema of schemas) {

        if (
            !schema ||
            typeof schema !== "object" ||
            Array.isArray(schema) ||
            typeof schema.name !== "string" ||
            !["string", "number"].includes(schema.keyType) ||
            typeof schema.valueType !== "string" ||
            !Array.isArray(schema.requiredKeys) ||
            !Array.isArray(schema.forbiddenKeys)
        ) {
            return "Invalid Input";
        }


        // Validate required keys.
        if (
            schema.requiredKeys.some(
                key => typeof key !== "string"
            )
        ) {
            return "Invalid Input";
        }


        // Validate forbidden keys.
        if (
            schema.forbiddenKeys.some(
                key => typeof key !== "string"
            )
        ) {
            return "Invalid Input";
        }


        // Prevent duplicate schema names.
        if (schemaMap.has(schema.name)) {
            return "Invalid Input";
        }

        schemaMap.set(schema.name, schema);
    }


    // --- STEP 3: CREATE VALUE TYPE CHECKER ---
    const checkValueType = (value, expectedType) => {

        if (expectedType === "any") {
            return true;
        }

        if (expectedType === "string") {
            return typeof value === "string";
        }

        if (expectedType === "number") {
            return typeof value === "number" && !Number.isNaN(value);
        }

        if (expectedType === "boolean") {
            return typeof value === "boolean";
        }

        if (expectedType === "object") {
            return value !== null && typeof value === "object";
        }

        if (expectedType === "array") {
            return Array.isArray(value);
        }

        if (expectedType === "function") {
            return typeof value === "function";
        }

        return true;
    };


    // --- STEP 4: CREATE KEY TYPE CHECKER ---
    const checkKeyType = (key, keyType) => {

        if (keyType === "string") {
            return typeof key === "string";
        }

        if (keyType === "number") {
            return !Number.isNaN(Number(key));
        }

        return false;
    };


    // --- STEP 5: CREATE VALIDATE METHOD ---
    const validate = (schemaName, obj) => {

        const schema = schemaMap.get(schemaName);

        if (
            !schema ||
            !obj ||
            typeof obj !== "object" ||
            Array.isArray(obj)
        ) {
            return {
                valid: false,
                errors: [],
                keyCount: 0,
                valueTypes: null
            };
        }


        const errors = [];
        const valueTypes = {};
        const keys = Object.keys(obj);


        // Validate required keys.
        for (const requiredKey of schema.requiredKeys) {

            if (!Object.prototype.hasOwnProperty.call(obj, requiredKey)) {

                errors.push(
                    `Required key missing: ${requiredKey}`
                );
            }
        }


        // Validate every object entry.
        for (const key of keys) {

            // Check forbidden keys.
            if (schema.forbiddenKeys.includes(key)) {

                errors.push(
                    `Forbidden key present: ${key}`
                );
            }


            // Check key type.
            if (!checkKeyType(key, schema.keyType)) {

                errors.push(
                    `Key '${key}' must be ${schema.keyType}`
                );
            }


            // Check value type.
            const actualType =
                Array.isArray(obj[key])
                    ? "array"
                    : typeof obj[key];

            valueTypes[key] = actualType;


            if (!checkValueType(obj[key], schema.valueType)) {

                errors.push(
                    `Value at '${key}' must be ${schema.valueType}, got ${actualType}`
                );
            }
        }


        return {
            valid: errors.length === 0,
            errors,
            keyCount: keys.length,
            valueTypes:
                errors.length === 0
                    ? valueTypes
                    : null
        };
    };


    // --- STEP 6: CREATE OBJECT FROM ENTRIES ---
    const create = (schemaName, entries) => {

        const schema = schemaMap.get(schemaName);

        if (
            !schema ||
            !Array.isArray(entries)
        ) {
            return "Invalid Input";
        }


        const result = {};


        for (const entry of entries) {

            if (
                !Array.isArray(entry) ||
                entry.length !== 2
            ) {
                return "Invalid Input";
            }

            const [key, value] = entry;

            if (
                !checkKeyType(key, schema.keyType) ||
                !checkValueType(value, schema.valueType)
            ) {
                return "Invalid Input";
            }

            if (schema.forbiddenKeys.includes(String(key))) {
                return "Invalid Input";
            }

            result[key] = value;
        }


        // Check required keys after creation.
        for (const requiredKey of schema.requiredKeys) {

            if (!Object.prototype.hasOwnProperty.call(result, requiredKey)) {
                return "Invalid Input";
            }
        }

        return result;
    };


    // --- STEP 7: CREATE MERGE METHOD ---
    const merge = (obj1, obj2, strategy) => {

        if (
            !obj1 ||
            typeof obj1 !== "object" ||
            !obj2 ||
            typeof obj2 !== "object" ||
            Array.isArray(obj1) ||
            Array.isArray(obj2) ||
            !["overwrite", "keep", "error"].includes(strategy)
        ) {
            return "Invalid Input";
        }


        const result = {
            ...obj1
        };


        for (const [key, value] of Object.entries(obj2)) {

            if (Object.prototype.hasOwnProperty.call(result, key)) {

                if (strategy === "overwrite") {
                    result[key] = value;
                }

                else if (strategy === "keep") {
                    continue;
                }

                else if (strategy === "error") {
                    return "Invalid Input";
                }

            } else {

                result[key] = value;
            }
        }

        return result;
    };


    // --- STEP 8: CREATE FILTER METHOD ---
    const filter = (obj, fn) => {

        if (
            !obj ||
            typeof obj !== "object" ||
            Array.isArray(obj) ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }


        const result = {};

        for (const [key, value] of Object.entries(obj)) {

            if (fn(key, value)) {
                result[key] = value;
            }
        }

        return result;
    };


    // --- STEP 9: CREATE TRANSFORM METHOD ---
    const transform = (obj, fn) => {

        if (
            !obj ||
            typeof obj !== "object" ||
            Array.isArray(obj) ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }


        const result = {};

        for (const [key, value] of Object.entries(obj)) {

            result[key] = fn(key, value);
        }

        return result;
    };


    // --- STEP 10: CREATE TYPED ARRAY METHOD ---
    const toTypedArray = obj => {

        if (
            !obj ||
            typeof obj !== "object" ||
            Array.isArray(obj)
        ) {
            return "Invalid Input";
        }


        return Object.entries(obj)
            .sort(([keyA], [keyB]) =>
                keyA.localeCompare(keyB)
            )
            .map(([key, value]) => ({
                key,
                value
            }));
    };


    // --- STEP 11: CREATE REPORT METHOD ---
    const getReport = () => {

        return {
            totalSchemas: schemas.length,

            stringKeyed:
                schemas.filter(
                    schema => schema.keyType === "string"
                ).length,

            numberKeyed:
                schemas.filter(
                    schema => schema.keyType === "number"
                ).length
        };
    };


    // --- STEP 12: RETURN INDEX ENGINE API ---
    return {
        validate,
        create,
        merge,
        filter,
        transform,
        toTypedArray,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const indexEngine = createIndexSignatureEngine([
    {
        name: "StringMap",
        keyType: "string",
        valueType: "string",
        requiredKeys: ["name"],
        forbiddenKeys: ["__proto__"]
    },

    {
        name: "ScoreBoard",
        keyType: "string",
        valueType: "number",
        requiredKeys: [],
        forbiddenKeys: []
    }
]);


console.log(
    indexEngine.validate(
        "StringMap",
        {
            name: "Rahim",
            city: "Dhaka"
        }
    )
);


console.log(
    indexEngine.validate(
        "StringMap",
        {
            city: "Dhaka",
            count: 5
        }
    )
);


console.log(
    indexEngine.merge(
        { a: 10, b: 20 },
        { b: 99, c: 30 },
        "overwrite"
    )
);


console.log(
    indexEngine.merge(
        { a: 10, b: 20 },
        { b: 99, c: 30 },
        "keep"
    )
);


console.log(
    indexEngine.transform(
        {
            alice: 80,
            bob: 60,
            carol: 95
        },
        (key, value) => value * 1.1
    )
);


console.log(indexEngine.getReport());


// --- Invalid Input ---
console.log(createIndexSignatureEngine("invalid"));