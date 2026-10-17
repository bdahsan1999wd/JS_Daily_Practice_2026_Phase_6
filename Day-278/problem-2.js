// PROBLEM–02: buildAPITypeSystem()

// Logic: Builds a simulated TypeScript API type system with DTO generation and validation.

function buildAPITypeSystem(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---

    if (
        typeof config !== "object" ||
        config === null ||
        typeof config.apiName !== "string" ||
        config.apiName.trim() === "" ||
        typeof config.version !== "string" ||
        config.version.trim() === "" ||
        typeof config.strict !== "boolean" ||
        !Array.isArray(config.entities) ||
        config.entities.length === 0
    ) {
        return "Invalid Input";
    }

    const entities = new Map();

    // --- STEP 2: VALIDATE ENTITY DEFINITIONS ---

    for (const entity of config.entities) {
        if (
            typeof entity !== "object" ||
            entity === null ||
            typeof entity.name !== "string" ||
            entity.name.trim() === "" ||
            !Array.isArray(entity.properties)
        ) {
            return "Invalid Input";
        }

        for (const property of entity.properties) {
            if (
                typeof property !== "object" ||
                property === null ||
                typeof property.name !== "string" ||
                typeof property.type !== "string" ||
                typeof property.optional !== "boolean" ||
                typeof property.readonly !== "boolean"
            ) {
                return "Invalid Input";
            }
        }

        entities.set(entity.name, {
            name: entity.name,
            properties: entity.properties.map(
                property => ({ ...property })
            )
        });
    }

    // --- STEP 3: BUILD PROPERTY STRING ---

    function propertyToString(property) {
        const readonlyPrefix =
            property.readonly
                ? "readonly "
                : "";

        const optionalSuffix =
            property.optional
                ? "?"
                : "";

        return (
            readonlyPrefix +
            property.name +
            optionalSuffix +
            ": " +
            property.type +
            ";"
        );
    }

    // --- STEP 4: GENERATE ENTITY TYPES ---

    function getEntityTypes(entityName) {
        const entity = entities.get(entityName);

        if (!entity) {
            return "Invalid Input";
        }

        const properties =
            entity.properties
                .map(propertyToString)
                .join(" ");

        return {
            Base:
                `interface ${entity.name} { ${properties} }`,

            CreateDTO:
                `type Create${entity.name}DTO = Omit<${entity.name}, 'id' | 'createdAt'>`,

            UpdateDTO:
                `type Update${entity.name}DTO = Partial<Omit<${entity.name}, 'id'>>`,

            ResponseType:
                `type ${entity.name}Response = Readonly<${entity.name}>`,

            ListResponse:
                `type ${entity.name}ListResponse = PaginatedResponse<${entity.name}>`
        };
    }

    // --- STEP 5: CHECK RUNTIME TYPE ---

    function getRuntimeType(value) {
        if (value === null) {
            return "null";
        }

        if (Array.isArray(value)) {
            return "array";
        }

        return typeof value;
    }

    // --- STEP 6: VALIDATE REQUEST DATA ---

    function validateRequest(
        entityName,
        dtoType,
        data
    ) {
        const entity = entities.get(entityName);

        if (
            !entity ||
            typeof dtoType !== "string" ||
            typeof data !== "object" ||
            data === null ||
            Array.isArray(data)
        ) {
            return "Invalid Input";
        }

        const errors = {};

        const excluded =
            dtoType === "CreateDTO"
                ? ["id", "createdAt"]
                : dtoType === "UpdateDTO"
                    ? ["id"]
                    : [];

        for (const property of entity.properties) {
            if (excluded.includes(property.name)) {
                continue;
            }

            const exists =
                Object.prototype.hasOwnProperty.call(
                    data,
                    property.name
                );

            if (
                !exists &&
                dtoType === "CreateDTO" &&
                !property.optional
            ) {
                errors[property.name] =
                    "Required field missing";

                continue;
            }

            if (!exists) {
                continue;
            }

            const actualType =
                getRuntimeType(data[property.name]);

            if (
                actualType !== property.type &&
                !(
                    property.type.endsWith("[]") &&
                    actualType === "array"
                )
            ) {
                errors[property.name] =
                    `Expected ${property.type}, got ${actualType}`;
            }
        }

        return {
            valid:
                Object.keys(errors).length === 0,
            errors
        };
    }

    // --- STEP 7: SIMULATE API OPERATION ---

    function simulate(
        entityName,
        operation,
        data
    ) {
        const entity = entities.get(entityName);

        if (
            !entity ||
            !["create", "update", "list", "get"]
                .includes(operation)
        ) {
            return "Invalid Input";
        }

        const timestamp = 1704067200;

        if (operation === "create") {
            const response = {
                id: 1,
                ...data,
                createdAt: "2024-01-01"
            };

            return {
                data: response,
                status: 201,
                message: "Created",
                timestamp
            };
        }

        if (operation === "update") {
            return {
                data: {
                    ...data
                },
                status: 200,
                message: "Updated",
                timestamp
            };
        }

        if (operation === "get") {
            return {
                data: {
                    ...data
                },
                status: 200,
                message: "Fetched",
                timestamp
            };
        }

        // List operation.
        const records =
            Array.isArray(data)
                ? data
                : [data];

        return {
            data: records,
            status: 200,
            message: "Listed",
            timestamp
        };
    }

    // --- STEP 8: GENERATE COMPLETE DECLARATIONS ---

    function generateDeclarations() {
        const lines = [
            `// ${config.apiName} ${config.version}`,
            "",
            "interface ApiResponse<T> {",
            "  data: T;",
            "  status: number;",
            "  message: string;",
            "  timestamp: number;",
            "}",
            "",
            "interface PaginatedResponse<T> {",
            "  data: T[];",
            "  page: number;",
            "  pageSize: number;",
            "  total: number;",
            "  totalPages: number;",
            "}",
            "",
            "interface ApiError {",
            "  code: string;",
            "  message: string;",
            "  details?: unknown;",
            "}",
            ""
        ];

        for (const entity of entities.values()) {
            const types =
                getEntityTypes(entity.name);

            lines.push(types.Base);
            lines.push(types.CreateDTO);
            lines.push(types.UpdateDTO);
            lines.push(types.ResponseType);
            lines.push(types.ListResponse);
            lines.push("");
        }

        return lines.join("\n");
    }

    // --- STEP 9: GENERATE REPORT ---

    function getReport() {
        return {
            apiName: config.apiName,
            version: config.version,
            totalEntities: entities.size,
            totalGeneratedTypes:
                entities.size * 5 + 2
        };
    }

    // --- STEP 10: RETURN API ---

    return {
        getEntityTypes,
        validateRequest,
        generateDeclarations,
        simulate,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const api = buildAPITypeSystem({
    apiName: "ShopAPI",
    version: "v1",
    strict: true,

    entities: [
        {
            name: "Product",
            properties: [
                {
                    name: "id",
                    type: "number",
                    optional: false,
                    readonly: true
                },
                {
                    name: "name",
                    type: "string",
                    optional: false,
                    readonly: false
                },
                {
                    name: "price",
                    type: "number",
                    optional: false,
                    readonly: false
                },
                {
                    name: "stock",
                    type: "number",
                    optional: true,
                    readonly: false
                },
                {
                    name: "createdAt",
                    type: "string",
                    optional: false,
                    readonly: true
                }
            ]
        }
    ]
});


console.log(api.getEntityTypes("Product"));

console.log(
    api.validateRequest(
        "Product",
        "CreateDTO",
        {
            name: "Laptop",
            price: 50000,
            stock: 10
        }
    )
);

console.log(
    api.simulate(
        "Product",
        "create",
        {
            name: "Laptop",
            price: 50000
        }
    )
);

console.log(api.generateDeclarations());

console.log(api.getReport());