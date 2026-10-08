// PROBLEM–01: createInterfaceEngine()

// Logic: This function creates a TypeScript-like interface definition engine. It validates interface definitions, supports interface inheritance, validates objects against flattened interface properties, generatesTypeScript interface strings, merges interfaces, and produces reports.


function createInterfaceEngine(interfaces) {

    // --- STEP 1: VALIDATE MAIN INPUT ---
    // The input must be a non-empty array.
    if (!Array.isArray(interfaces) || interfaces.length === 0) {
        return "Invalid Input";
    }


    // --- STEP 2: VALIDATE EACH INTERFACE ---
    // Every interface must contain:
    // name, extends, properties, indexSignature, and methods.
    for (const item of interfaces) {

        if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item) ||
            typeof item.name !== "string" ||
            !Array.isArray(item.extends) ||
            !Array.isArray(item.properties) ||
            !(item.indexSignature === null ||
                (typeof item.indexSignature === "object" &&
                    typeof item.indexSignature.keyType === "string" &&
                    ["string", "number"].includes(item.indexSignature.keyType) &&
                    typeof item.indexSignature.valueType === "string")) ||
            !Array.isArray(item.methods)
        ) {
            return "Invalid Input";
        }


        // --- STEP 2A: VALIDATE EXTENDS ---
        for (const parent of item.extends) {
            if (typeof parent !== "string" || parent.trim() === "") {
                return "Invalid Input";
            }
        }


        // --- STEP 2B: VALIDATE PROPERTIES ---
        for (const property of item.properties) {

            if (
                !property ||
                typeof property !== "object" ||
                typeof property.name !== "string" ||
                typeof property.type !== "string" ||
                typeof property.optional !== "boolean" ||
                typeof property.readonly !== "boolean"
            ) {
                return "Invalid Input";
            }
        }


        // --- STEP 2C: VALIDATE METHODS ---
        for (const method of item.methods) {

            if (
                !method ||
                typeof method !== "object" ||
                typeof method.name !== "string" ||
                !Array.isArray(method.params) ||
                typeof method.returnType !== "string" ||
                typeof method.optional !== "boolean"
            ) {
                return "Invalid Input";
            }


            // Validate method parameters.
            for (const param of method.params) {

                if (
                    !param ||
                    typeof param !== "object" ||
                    typeof param.name !== "string" ||
                    typeof param.type !== "string"
                ) {
                    return "Invalid Input";
                }
            }
        }
    }


    // --- STEP 3: CHECK DUPLICATE INTERFACE NAMES ---
    // Interface names must be unique.
    const interfaceMap = new Map();

    for (const item of interfaces) {

        if (interfaceMap.has(item.name)) {
            return "Invalid Input";
        }

        interfaceMap.set(item.name, item);
    }


    // --- STEP 4: VALIDATE PARENT INTERFACES ---
    // Every extended interface must exist.
    for (const item of interfaces) {

        for (const parentName of item.extends) {

            if (!interfaceMap.has(parentName)) {
                return "Invalid Input";
            }
        }
    }


    // --- STEP 5: CREATE FLATTENED PROPERTY ENGINE ---
    // Recursively collect all inherited properties.
    const getFlattened = (interfaceName, visited = new Set()) => {

        if (!interfaceMap.has(interfaceName)) {
            return null;
        }

        if (visited.has(interfaceName)) {
            return [];
        }

        visited.add(interfaceName);

        const current = interfaceMap.get(interfaceName);
        const result = [];

        // First collect parent properties.
        for (const parentName of current.extends) {

            const parentProperties = getFlattened(parentName, visited);

            if (parentProperties) {
                result.push(...parentProperties);
            }
        }


        // Then add current interface properties.
        for (const property of current.properties) {

            const existingIndex = result.findIndex(
                item => item.name === property.name
            );

            const formattedProperty = {
                name: property.name,
                type: property.type,
                readonly: property.readonly,
                optional: property.optional,
                from: interfaceName
            };

            // Child property overrides inherited property.
            if (existingIndex !== -1) {
                result[existingIndex] = formattedProperty;
            } else {
                result.push(formattedProperty);
            }
        }

        return result;
    };


    // --- STEP 6: CREATE VALUE TYPE CHECKER ---
    // Checks JavaScript values against TypeScript-like type strings.
    const checkType = (value, expectedType) => {

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

        if (expectedType === "object") {
            return value !== null && typeof value === "object";
        }

        if (expectedType === "array" || expectedType === "any[]") {
            return Array.isArray(value);
        }

        if (expectedType.endsWith("[]")) {
            if (!Array.isArray(value)) {
                return false;
            }

            const itemType = expectedType.slice(0, -2);

            return value.every(item => checkType(item, itemType));
        }

        // If the type is another interface,
        // validate the object structurally against that interface.
        if (interfaceMap.has(expectedType)) {

            if (!value || typeof value !== "object") {
                return false;
            }

            const properties = getFlattened(expectedType);

            return properties.every(property => {

                if (!(property.name in value)) {
                    return property.optional;
                }

                return checkType(value[property.name], property.type);
            });
        }

        return true;
    };


    // --- STEP 7: CREATE VALIDATE METHOD ---
    // Checks whether a value satisfies an interface.
    const validate = (interfaceName, value) => {

        if (
            typeof interfaceName !== "string" ||
            !interfaceMap.has(interfaceName) ||
            !value ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {
            return {
                valid: false,
                errors: {},
                missingRequired: [],
                extraProperties: []
            };
        }


        const properties = getFlattened(interfaceName);

        const errors = {};
        const missingRequired = [];
        const definedNames = new Set();


        // Validate required and optional properties.
        for (const property of properties) {

            definedNames.add(property.name);

            if (!(property.name in value)) {

                if (!property.optional) {

                    missingRequired.push(property.name);

                    errors[property.name] =
                        property.readonly
                            ? "Required readonly property missing"
                            : "Required property missing";
                }

                continue;
            }


            if (!checkType(value[property.name], property.type)) {

                errors[property.name] =
                    `Expected ${property.type}`;
            }
        }


        // Detect extra properties.
        const extraProperties = Object.keys(value)
            .filter(key => !definedNames.has(key));


        return {
            valid:
                Object.keys(errors).length === 0 &&
                missingRequired.length === 0,

            errors,
            missingRequired,
            extraProperties
        };
    };


    // --- STEP 8: CREATE EXTEND METHOD ---
    // Creates a new interface by extending parent interfaces.
    const extend = (childName, parentNames) => {

        if (
            typeof childName !== "string" ||
            !Array.isArray(parentNames) ||
            parentNames.some(name => !interfaceMap.has(name))
        ) {
            return "Invalid Input";
        }

        if (interfaceMap.has(childName)) {
            return "Invalid Input";
        }

        const newInterface = {
            name: childName,
            extends: [...parentNames],
            properties: [],
            indexSignature: null,
            methods: []
        };

        interfaceMap.set(childName, newInterface);
        interfaces.push(newInterface);

        return newInterface;
    };


    // --- STEP 9: CREATE MERGE METHOD ---
    // Merges two interfaces as an intersection-like structure.
    const merge = (name, interface1, interface2) => {

        if (
            typeof name !== "string" ||
            !interfaceMap.has(interface1) ||
            !interfaceMap.has(interface2)
        ) {
            return "Invalid Input";
        }

        const properties = [
            ...getFlattened(interface1),
            ...getFlattened(interface2)
        ];

        const uniqueProperties = [];

        for (const property of properties) {

            const existing = uniqueProperties.find(
                item => item.name === property.name
            );

            if (!existing) {
                uniqueProperties.push({ ...property });
            }
        }

        return {
            name,
            properties: uniqueProperties
        };
    };


    // --- STEP 10: CREATE GENERATE METHOD ---
    // Generates a TypeScript interface declaration.
    const generate = (interfaceName) => {

        if (!interfaceMap.has(interfaceName)) {
            return "Invalid Input";
        }

        const current = interfaceMap.get(interfaceName);

        const extendsPart =
            current.extends.length > 0
                ? ` extends ${current.extends.join(", ")}`
                : "";


        const lines = [
            `interface ${interfaceName}${extendsPart} {`
        ];


        // Generate properties.
        for (const property of current.properties) {

            const readonlyPart =
                property.readonly ? "readonly " : "";

            const optionalPart =
                property.optional ? "?" : "";

            lines.push(
                `  ${readonlyPart}${property.name}${optionalPart}: ${property.type};`
            );
        }


        // Generate methods.
        for (const method of current.methods) {

            const optionalPart =
                method.optional ? "?" : "";

            const params = method.params
                .map(param => `${param.name}: ${param.type}`)
                .join(", ");

            lines.push(
                `  ${method.name}${optionalPart}(${params}): ${method.returnType};`
            );
        }


        // Generate closing bracket.
        lines.push("}");

        return lines.join("\n");
    };


    // --- STEP 11: CREATE REPORT METHOD ---
    // Returns statistics about registered interfaces.
    const getReport = () => {

        return {
            totalInterfaces: interfaces.length,

            withExtends:
                interfaces.filter(item => item.extends.length > 0).length,

            withIndex:
                interfaces.filter(item => item.indexSignature !== null).length,

            withMethods:
                interfaces.filter(item => item.methods.length > 0).length
        };
    };


    // --- STEP 12: RETURN INTERFACE ENGINE API ---
    return {
        validate,
        extend,
        merge,
        generate,
        getFlattened: interfaceName => getFlattened(interfaceName),
        getReport
    };
}


// --- EXAMPLE USAGE ---
const interfaceEngine = createInterfaceEngine([
    {
        name: "Entity",
        extends: [],
        properties: [
            {
                name: "id",
                type: "number",
                optional: false,
                readonly: true
            }
        ],
        indexSignature: null,
        methods: []
    },

    {
        name: "User",
        extends: ["Entity"],
        properties: [
            {
                name: "name",
                type: "string",
                optional: false,
                readonly: false
            },
            {
                name: "email",
                type: "string",
                optional: true,
                readonly: false
            },
            {
                name: "age",
                type: "number",
                optional: false,
                readonly: false
            }
        ],
        indexSignature: null,
        methods: [
            {
                name: "greet",
                params: [],
                returnType: "string",
                optional: false
            }
        ]
    }
]);


console.log(
    interfaceEngine.validate(
        "User",
        {
            id: 1,
            name: "Rahim",
            age: 25
        }
    )
);

console.log(
    interfaceEngine.validate(
        "User",
        {
            name: "Rahim"
        }
    )
);

console.log(interfaceEngine.generate("User"));
console.log(interfaceEngine.getFlattened("User"));
console.log(interfaceEngine.getReport());

// --- Invalid Input ---
console.log(createInterfaceEngine("invalid"));