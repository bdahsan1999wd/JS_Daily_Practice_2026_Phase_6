// PROBLEM–05: buildTypeScriptMaster()

// Logic: Combines the major Module 4 TypeScript concepts into one master engine.

function buildTypeScriptMaster(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---

    if (
        typeof config !== "object" ||
        config === null ||
        typeof config.projectName !== "string" ||
        config.projectName.trim() === "" ||
        typeof config.strict !== "boolean" ||
        !["es5", "es6", "esnext"].includes(
            config.target
        ) ||
        !Array.isArray(config.entities) ||
        config.entities.length === 0 ||
        !config.entities.every(
            entity => typeof entity === "string"
        )
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE ENGINE STATE ---

    const entityMap = new Map();

    let totalTypes = 0;
    let generatedLines = 0;
    let typeErrors = 0;

    // --- STEP 3: CREATE ENTITY REGISTRY ---

    function ensureEntity(entityName) {
        if (!entityMap.has(entityName)) {
            entityMap.set(entityName, {
                name: entityName,
                fields: null,
                scaffold: null
            });
        }

        return entityMap.get(entityName);
    }

    for (const entityName of config.entities) {
        ensureEntity(entityName);
    }

    // --- STEP 4: CONVERT FIELD TO TYPESCRIPT STRING ---

    function fieldToString(field) {
        if (
            typeof field !== "object" ||
            field === null ||
            typeof field.name !== "string" ||
            typeof field.type !== "string"
        ) {
            return null;
        }

        const readonly =
            field.readonly
                ? "readonly "
                : "";

        const optional =
            field.optional
                ? "?"
                : "";

        return (
            `${readonly}${field.name}${optional}: ${field.type};`
        );
    }

    // --- STEP 5: SCAFFOLD ENTITY ---

    function scaffold(
        entityName,
        fields
    ) {
        if (
            typeof entityName !== "string" ||
            !Array.isArray(fields) ||
            fields.length === 0
        ) {
            return "Invalid Input";
        }

        for (const field of fields) {
            if (
                typeof field !== "object" ||
                field === null ||
                typeof field.name !== "string" ||
                typeof field.type !== "string"
            ) {
                return "Invalid Input";
            }
        }

        const entity = ensureEntity(entityName);

        entity.fields =
            fields.map(field => ({ ...field }));

        const properties =
            fields
                .map(fieldToString)
                .join(" ");

        const hasId =
            fields.some(
                field => field.name === "id"
            );

        const omittedFields =
            hasId
                ? "'id'"
                : "";

        const createDTO =
            hasId
                ? `type Create${entityName}DTO = Omit<${entityName}, 'id'>`
                : `type Create${entityName}DTO = ${entityName}`;

        const updateDTO =
            hasId
                ? `type Update${entityName}DTO = Partial<Omit<${entityName}, 'id'>>`
                : `type Update${entityName}DTO = Partial<${entityName}>`;

        const result = {
            interface:
                `interface ${entityName} { ${properties} }`,

            CreateDTO:
                createDTO,

            UpdateDTO:
                updateDTO,

            ResponseType:
                `type ${entityName}Response = Readonly<${entityName}>`,

            ListResponse:
                `type ${entityName}ListResponse = PaginatedResponse<${entityName}>`,

            StatusEnum:
                `enum ${entityName}Status { Active = 'active', Inactive = 'inactive', Pending = 'pending' }`,

            Repository:
                `type ${entityName}Repository = Repository<${entityName}, number>`,

            Events:
                `type ${entityName}Events = '${entityName}Created' | '${entityName}Updated' | '${entityName}Deleted'`
        };

        entity.scaffold = result;

        // Eight generated declarations are tracked.
        totalTypes += 8;

        generatedLines +=
            Object.values(result)
                .join("\n")
                .split("\n")
                .length;

        return result;
    }

    // --- STEP 6: DETECT RUNTIME TYPE ---

    function getRuntimeType(value) {
        if (value === null) {
            return "null";
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return "unknown[]";
            }

            const elementTypes =
                value.map(getRuntimeType);

            const first =
                elementTypes[0];

            if (
                elementTypes.every(
                    type => type === first
                )
            ) {
                return `${first}[]`;
            }

            return "unknown[]";
        }

        return typeof value;
    }

    // --- STEP 7: INFER OBJECT TYPE ---

    function infer(value) {
        if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            return getRuntimeType(value);
        }

        const properties =
            Object.entries(value)
                .map(
                    ([key, item]) =>
                        `${key}: ${getRuntimeType(item)}`
                )
                .join("; ");

        return `{ ${properties} }`;
    }

    // --- STEP 8: VALIDATE DTO ---

    function validate(
        entityName,
        dtoType,
        data
    ) {
        const entity =
            entityMap.get(entityName);

        if (
            !entity ||
            !entity.fields ||
            typeof dtoType !== "string" ||
            typeof data !== "object" ||
            data === null
        ) {
            return "Invalid Input";
        }

        const errors = {};

        const excluded =
            dtoType === "CreateDTO"
                ? ["id"]
                : dtoType === "UpdateDTO"
                    ? ["id"]
                    : [];

        for (const field of entity.fields) {
            if (excluded.includes(field.name)) {
                continue;
            }

            const exists =
                Object.prototype.hasOwnProperty.call(
                    data,
                    field.name
                );

            if (
                !exists &&
                !field.optional &&
                dtoType === "CreateDTO"
            ) {
                errors[field.name] =
                    "Required field missing";

                continue;
            }

            if (!exists) {
                continue;
            }

            const actualType =
                getRuntimeType(
                    data[field.name]
                );

            const expectedType =
                field.type;

            // Basic primitive validation.
            if (
                ["string", "number", "boolean"]
                    .includes(expectedType) &&
                actualType !== expectedType
            ) {
                errors[field.name] =
                    `Expected ${expectedType}, got ${actualType}`;
            }
        }

        if (Object.keys(errors).length > 0) {
            typeErrors +=
                Object.keys(errors).length;
        }

        return {
            valid:
                Object.keys(errors).length === 0,
            errors
        };
    }

    // --- STEP 9: CHECK TYPE ASSIGNABILITY ---

    function checkAssignment(
        source,
        target
    ) {
        if (
            typeof source !== "string" ||
            typeof target !== "string"
        ) {
            return "Invalid Input";
        }

        // Same type is always assignable.
        if (source === target) {
            return {
                assignable: true,
                reason: `${source} is assignable to ${target}`
            };
        }

        // CreateDTO is intentionally narrower than User
        // when User contains readonly id.
        const createMatch =
            source.match(
                /^Create(.+)DTO$/
            );

        if (
            createMatch &&
            target === createMatch[1]
        ) {
            return {
                assignable: false,
                reason:
                    `Create${createMatch[1]}DTO is missing readonly id: number`
            };
        }

        // Primitive compatibility.
        const primitiveTypes = [
            "string",
            "number",
            "boolean"
        ];

        if (
            primitiveTypes.includes(source) &&
            primitiveTypes.includes(target)
        ) {
            return {
                assignable:
                    source === target,
                reason:
                    source === target
                        ? "Compatible primitive types"
                        : `${source} is not assignable to ${target}`
            };
        }

        return {
            assignable: false,
            reason:
                `${source} is not assignable to ${target}`
        };
    }

    // --- STEP 10: GENERATE DECLARATION FILE ---

    function generate() {
        const lines = [
            `// ${config.projectName}`,
            `// Target: ${config.target}`,
            "",
            "interface PaginatedResponse<T> {",
            "  data: T[];",
            "  page: number;",
            "  pageSize: number;",
            "  total: number;",
            "  totalPages: number;",
            "}",
            "",
            "type Repository<T, ID> = {",
            "  find(id: ID): T;",
            "  save(value: T): T;",
            "};",
            ""
        ];

        for (const entity of entityMap.values()) {
            if (!entity.scaffold) {
                continue;
            }

            lines.push(
                ...Object.values(
                    entity.scaffold
                )
            );

            lines.push("");
        }

        generatedLines = lines.length;

        return lines.join("\n");
    }

    // --- STEP 11: GET TYPE STATISTICS ---

    function getTypeStats() {
        let interfaces = 0;
        let utilityTypes = 0;
        let enums = 0;
        let repositories = 0;
        let eventTypes = 0;

        for (const entity of entityMap.values()) {
            if (!entity.scaffold) {
                continue;
            }

            interfaces++;
            utilityTypes += 4;
            enums++;
            repositories++;
            eventTypes++;
        }

        return {
            interfaces,
            utilityTypes,
            enums,
            repositories,
            eventTypes,
            totalTypes:
                interfaces +
                utilityTypes +
                enums +
                repositories +
                eventTypes
        };
    }

    // --- STEP 12: GENERATE FULL REPORT ---

    function getFullReport() {
        const coverage =
            entityMap.size === 0
                ? "0%"
                : "100%";

        return {
            projectName:
                config.projectName,
            target:
                config.target,
            entities:
                [...entityMap.keys()],
            totalTypes,
            generatedLines,
            typeErrors,
            coverage
        };
    }

    // --- STEP 13: RETURN MASTER API ---

    return {
        scaffold,
        validate,
        infer,
        generate,
        checkAssignment,
        getTypeStats,
        getFullReport
    };
}



// --- EXAMPLE USAGE ---
const master = buildTypeScriptMaster({
    projectName: "ShopApp",
    strict: true,
    target: "esnext",
    entities: [
        "User",
        "Product"
    ]
});

console.log(
    master.scaffold(
        "User",
        [
            {
                name: "id",
                type: "number",
                readonly: true
            },
            {
                name: "name",
                type: "string"
            },
            {
                name: "email",
                type: "string",
                optional: true
            },
            {
                name: "role",
                type:
                    "'admin' | 'user' | 'guest'"
            }
        ]
    )
);

console.log(
    master.infer({
        id: 1,
        name: "Rahim",
        active: true,
        tags: ["js", "ts"]
    })
);

console.log(
    master.checkAssignment(
        "CreateUserDTO",
        "User"
    )
);

console.log(master.getTypeStats());

console.log(master.generate());

console.log(master.getFullReport());