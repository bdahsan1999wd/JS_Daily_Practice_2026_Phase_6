// PROBLEM–03: createStructuralTypeChecker()

// Logic: This function creates a TypeScript-style structural typing engine. It checks whether values satisfy required object shapes, detects missing properties and type mismatches, supports subtype checking, compatibility searching, assignability, type differences, and complexity reporting.

function createStructuralTypeChecker(types) {

    // --- STEP 1: VALIDATE MAIN INPUT ---
    if (!Array.isArray(types) || types.length === 0) {
        return "Invalid Input";
    }


    // --- STEP 2: VALIDATE TYPE DEFINITIONS ---
    const typeMap = new Map();

    for (const type of types) {

        if (
            !type ||
            typeof type !== "object" ||
            Array.isArray(type) ||
            typeof type.name !== "string" ||
            !type.shape ||
            typeof type.shape !== "object" ||
            Array.isArray(type.shape)
        ) {
            return "Invalid Input";
        }


        if (typeMap.has(type.name)) {
            return "Invalid Input";
        }


        // Every shape property must have a string type.
        for (const [property, propertyType] of Object.entries(type.shape)) {

            if (typeof propertyType !== "string") {
                return "Invalid Input";
            }
        }


        typeMap.set(type.name, type);
    }


    // --- STEP 3: CREATE VALUE TYPE CHECKER ---
    const matchesType = (value, expectedType) => {

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

        if (expectedType === "function") {
            return typeof value === "function";
        }

        if (expectedType === "array") {
            return Array.isArray(value);
        }

        if (expectedType === "object") {
            return value !== null &&
                typeof value === "object" &&
                !Array.isArray(value);
        }


        // Support nested structural type references.
        if (typeMap.has(expectedType)) {

            if (
                !value ||
                typeof value !== "object" ||
                Array.isArray(value)
            ) {
                return false;
            }

            const nestedShape =
                typeMap.get(expectedType).shape;

            return Object.entries(nestedShape)
                .every(([key, type]) =>
                    Object.prototype.hasOwnProperty.call(value, key) &&
                    matchesType(value[key], type)
                );
        }


        return true;
    };


    // --- STEP 4: CREATE SATISFIES METHOD ---
    const satisfies = (typeName, value) => {

        const type = typeMap.get(typeName);

        if (
            !type ||
            !value ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {
            return {
                compatible: false,
                missing: [],
                typeMismatches: [],
                extraProperties: []
            };
        }


        const shape = type.shape;

        const missing = [];
        const typeMismatches = [];
        const requiredProperties = Object.keys(shape);


        // Check required properties and their types.
        for (const property of requiredProperties) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    value,
                    property
                )
            ) {

                missing.push(property);
                continue;
            }


            if (!matchesType(value[property], shape[property])) {

                typeMismatches.push({
                    property,
                    expected: shape[property],
                    got: Array.isArray(value[property])
                        ? "array"
                        : typeof value[property]
                });
            }
        }


        // Extra properties are allowed in structural typing.
        const extraProperties =
            Object.keys(value)
                .filter(
                    key => !requiredProperties.includes(key)
                );


        return {
            compatible:
                missing.length === 0 &&
                typeMismatches.length === 0,

            missing,
            typeMismatches,
            extraProperties
        };
    };


    // --- STEP 5: CREATE SUBTYPE METHOD ---
    const isSubtype = (typeA, typeB) => {

        const a = typeMap.get(typeA);
        const b = typeMap.get(typeB);


        if (!a || !b) {
            return {
                isSubtype: false,
                reason: "Unknown type"
            };
        }


        const missing = Object.keys(b.shape)
            .filter(
                property =>
                    !Object.prototype.hasOwnProperty.call(
                        a.shape,
                        property
                    )
            );


        if (missing.length > 0) {

            return {
                isSubtype: false,
                reason: `${typeA} is missing: ${missing.join(", ")}`
            };
        }


        // Check common properties for type compatibility.
        for (const property of Object.keys(b.shape)) {

            if (a.shape[property] !== b.shape[property]) {

                return {
                    isSubtype: false,
                    reason:
                        `${typeA}.${property} is ${a.shape[property]}, ` +
                        `but ${typeB}.${property} requires ${b.shape[property]}`
                };
            }
        }


        return {
            isSubtype: true,
            reason: `${typeA} has all properties of ${typeB} plus more`
        };
    };


    // --- STEP 6: CREATE FIND COMPATIBLE METHOD ---
    const findCompatible = (value, typeNames) => {

        if (
            !Array.isArray(typeNames)
        ) {
            return "Invalid Input";
        }


        return typeNames.filter(typeName => {

            const result = satisfies(typeName, value);

            return result.compatible;
        });
    };


    // --- STEP 7: CREATE ASSIGNABLE METHOD ---
    const assignable = (sourceType, targetType) => {

        if (
            !typeMap.has(sourceType) ||
            !typeMap.has(targetType)
        ) {
            return {
                assignable: false,
                reason: "Unknown type"
            };
        }


        const result = isSubtype(sourceType, targetType);


        return {
            assignable: result.isSubtype,
            reason: result.reason
        };
    };


    // --- STEP 8: CREATE DIFF METHOD ---
    const diff = (typeA, typeB) => {

        const a = typeMap.get(typeA);
        const b = typeMap.get(typeB);


        if (!a || !b) {
            return "Invalid Input";
        }


        const aKeys = Object.keys(a.shape);
        const bKeys = Object.keys(b.shape);


        const onlyInA =
            aKeys.filter(key => !bKeys.includes(key));

        const onlyInB =
            bKeys.filter(key => !aKeys.includes(key));

        const inBoth =
            aKeys.filter(key => bKeys.includes(key));


        const typeDiffs = [];

        for (const key of inBoth) {

            if (a.shape[key] !== b.shape[key]) {

                typeDiffs.push({
                    property: key,
                    typeA: a.shape[key],
                    typeB: b.shape[key]
                });
            }
        }


        return {
            onlyInA,
            onlyInB,
            inBoth,
            typeDiffs
        };
    };


    // --- STEP 9: CREATE REPORT METHOD ---
    const getReport = () => {

        const propertyCounts = types.map(
            type => Object.keys(type.shape).length
        );


        const totalProperties =
            propertyCounts.reduce(
                (sum, count) => sum + count,
                0
            );


        const avgProperties =
            totalProperties / types.length;


        const mostComplex =
            types.reduce(
                (max, current) =>
                    Object.keys(current.shape).length >
                        Object.keys(max.shape).length
                        ? current
                        : max
            );


        return {
            totalTypes: types.length,
            avgProperties,
            mostComplex: mostComplex.name
        };
    };


    // --- STEP 10: RETURN STRUCTURAL TYPE API ---
    return {
        satisfies,
        isSubtype,
        findCompatible,
        assignable,
        diff,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const checker = createStructuralTypeChecker([
    {
        name: "Printable",
        shape: {
            print: "function"
        }
    },

    {
        name: "Serializable",
        shape: {
            serialize: "function",
            deserialize: "function"
        }
    },

    {
        name: "User",
        shape: {
            id: "number",
            name: "string",
            email: "string"
        }
    },

    {
        name: "AdminUser",
        shape: {
            id: "number",
            name: "string",
            email: "string",
            role: "string",
            permissions: "array"
        }
    }
]);


console.log(
    checker.satisfies(
        "User",
        {
            id: 1,
            name: "Rahim",
            email: "r@mail.com",
            role: "admin"
        }
    )
);


console.log(
    checker.satisfies(
        "User",
        {
            id: "one",
            name: "Rahim"
        }
    )
);


console.log(
    checker.isSubtype(
        "AdminUser",
        "User"
    )
);


console.log(
    checker.isSubtype(
        "User",
        "AdminUser"
    )
);


console.log(
    checker.findCompatible(
        {
            id: 1,
            name: "Rahim",
            email: "r@mail.com",
            role: "admin",
            permissions: ["read"]
        },
        [
            "User",
            "AdminUser",
            "Printable"
        ]
    )
);


console.log(
    checker.diff(
        "User",
        "AdminUser"
    )
);


console.log(checker.getReport());


// --- Invalid Input ---
console.log(createStructuralTypeChecker("invalid"));