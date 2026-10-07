// PROBLEM–05: TypeScript Type Definition Builder


function createTypeDefinitionBuilder(config) {

  // --- STEP 1: VALIDATE CONFIG ---
  if (
    config === null ||
    typeof config !== "object" ||
    Array.isArray(config)
  ) {
    return "Invalid Input";
  }

  const {
    moduleName,
    strict,
    exportAll,
  } = config;

  if (
    typeof moduleName !== "string" ||
    moduleName.trim() === "" ||
    typeof strict !== "boolean" ||
    typeof exportAll !== "boolean"
  ) {
    return "Invalid Input";
  }

  // --- STEP 2: STORAGE ---
  const definitions = [];

  // --- STEP 3: ALLOWED PROPERTY TYPES ---
  const primitiveTypes = [
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    "object",
    "function",
    "symbol",
    "bigint",
    "any",
    "unknown",
  ];

  // --- STEP 4: VALIDATE PROPERTY ---
  const validateProperty = (property) => {
    if (
      property === null ||
      typeof property !== "object" ||
      Array.isArray(property)
    ) {
      return false;
    }

    const {
      name,
      type,
      optional,
      readonly,
    } = property;

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      typeof type !== "string" ||
      type.trim() === "" ||
      typeof optional !== "boolean" ||
      typeof readonly !== "boolean"
    ) {
      return false;
    }

    return true;
  };

  // --- STEP 5: DEFINE TYPE ---
  const defineType = (
    name,
    properties
  ) => {
    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !Array.isArray(properties) ||
      properties.length === 0 ||
      definitions.some(
        (definition) =>
          definition.name === name
      )
    ) {
      return "Invalid Input";
    }

    if (
      properties.some(
        (property) =>
          !validateProperty(property)
      )
    ) {
      return "Invalid Input";
    }

    definitions.push({
      kind: "type",
      name,
      properties: properties.map(
        (property) => ({ ...property })
      ),
    });

    return {
      name,
      kind: "type",
    };
  };

  // --- STEP 6: DEFINE INTERFACE ---
  const defineInterface = (
    name,
    properties,
    extendsList = []
  ) => {
    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !Array.isArray(properties) ||
      properties.length === 0 ||
      !Array.isArray(extendsList) ||
      extendsList.some(
        (item) => typeof item !== "string"
      ) ||
      definitions.some(
        (definition) =>
          definition.name === name
      )
    ) {
      return "Invalid Input";
    }

    if (
      properties.some(
        (property) =>
          !validateProperty(property)
      )
    ) {
      return "Invalid Input";
    }

    definitions.push({
      kind: "interface",
      name,
      properties: properties.map(
        (property) => ({ ...property })
      ),
      extends: [...extendsList],
    });

    return {
      name,
      kind: "interface",
    };
  };

  // --- STEP 7: DEFINE ENUM ---
  const defineEnum = (
    name,
    members
  ) => {
    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !Array.isArray(members) ||
      members.length === 0 ||
      definitions.some(
        (definition) =>
          definition.name === name
      )
    ) {
      return "Invalid Input";
    }

    const keys = new Set();

    for (const member of members) {
      if (
        member === null ||
        typeof member !== "object" ||
        Array.isArray(member) ||
        typeof member.key !== "string" ||
        member.key.trim() === "" ||
        !(
          typeof member.value === "string" ||
          typeof member.value === "number"
        ) ||
        keys.has(member.key)
      ) {
        return "Invalid Input";
      }

      keys.add(member.key);
    }

    definitions.push({
      kind: "enum",
      name,
      members: members.map(
        (member) => ({ ...member })
      ),
    });

    return {
      name,
      kind: "enum",
    };
  };

  // --- STEP 8: DEFINE UNION ---
  const defineUnion = (
    name,
    types
  ) => {
    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !Array.isArray(types) ||
      types.length === 0 ||
      types.some(
        (type) =>
          typeof type !== "string" ||
          type.trim() === ""
      ) ||
      definitions.some(
        (definition) =>
          definition.name === name
      )
    ) {
      return "Invalid Input";
    }

    definitions.push({
      kind: "union",
      name,
      types: [...types],
    });

    return {
      name,
      kind: "union",
    };
  };

  // --- STEP 9: FORMAT ENUM VALUE ---
  const formatEnumValue = (value) => {
    if (typeof value === "string") {
      return `'${value}'`;
    }

    return String(value);
  };

  // --- STEP 10: FORMAT PROPERTY ---
  const formatProperty = (property) => {
    const readonlyPrefix =
      property.readonly
        ? "readonly "
        : "";

    const optionalSuffix =
      property.optional
        ? "?"
        : "";

    return `${readonlyPrefix}${property.name}${optionalSuffix}: ${property.type};`;
  };

  // --- STEP 11: GENERATE TYPE SCRIPT ---
  const generate = () => {
    const output = [];

    for (const definition of definitions) {
      const prefix = exportAll
        ? "export "
        : "";

      if (definition.kind === "type") {
        const properties =
          definition.properties
            .map(formatProperty)
            .join(" ");

        output.push(
          `${prefix}type ${definition.name} = { ${properties} };`
        );
      }

      if (
        definition.kind === "interface"
      ) {
        const extendsPart =
          definition.extends.length > 0
            ? ` extends ${definition.extends.join(
              ", "
            )}`
            : "";

        const properties =
          definition.properties
            .map(formatProperty)
            .join(" ");

        output.push(
          `${prefix}interface ${definition.name}${extendsPart} { ${properties} }`
        );
      }

      if (definition.kind === "enum") {
        const members =
          definition.members
            .map(
              (member) =>
                `${member.key} = ${formatEnumValue(
                  member.value
                )}`
            )
            .join(", ");

        output.push(
          `${prefix}enum ${definition.name} { ${members} }`
        );
      }

      if (definition.kind === "union") {
        output.push(
          `${prefix}type ${definition.name} = ${definition.types.join(
            " | "
          )};`
        );
      }
    }

    return output.join("\n\n");
  };

  // --- STEP 12: RUNTIME TYPE DETECTION ---
  const detectType = (value) => {
    if (value === null) return "null";

    if (Array.isArray(value)) return "array";

    if (typeof value === "number") {
      return Number.isFinite(value)
        ? "number"
        : "number";
    }

    return typeof value;
  };

  // --- STEP 13: CHECK PRIMITIVE TYPE ---
  const matchesType = (
    value,
    expectedType
  ) => {
    if (expectedType === "any") {
      return true;
    }

    if (expectedType === "unknown") {
      return true;
    }

    if (expectedType === "number") {
      return (
        typeof value === "number" &&
        Number.isFinite(value)
      );
    }

    if (expectedType === "object") {
      return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      );
    }

    if (expectedType === "array") {
      return Array.isArray(value);
    }

    if (expectedType === "null") {
      return value === null;
    }

    if (expectedType === "undefined") {
      return value === undefined;
    }

    return detectType(value) === expectedType;
  };

  // --- STEP 14: RESOLVE DEFINITION ---
  const findDefinition = (name) => {
    return definitions.find(
      (definition) =>
        definition.name === name
    );
  };

  // --- STEP 15: VALIDATE AGAINST DEFINITION ---
  const validateDefinition = (
    definition,
    value
  ) => {
    const errors = {};

    // --- TYPE ALIAS ---
    if (definition.kind === "type") {
      if (
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        return {
          valid: false,
          errors: {
            _root: [
              "Expected object",
            ],
          },
        };
      }

      for (const property of definition.properties) {
        const exists =
          property.name in value;

        if (!exists) {
          if (property.optional) {
            continue;
          }

          errors[property.name] =
            `Missing required property: ${property.name}`;

          continue;
        }

        if (
          !matchesType(
            value[property.name],
            property.type
          )
        ) {
          errors[property.name] =
            `Expected ${property.type}, got ${detectType(
              value[property.name]
            )}`;
        }
      }
    }

    // --- INTERFACE ---
    if (
      definition.kind === "interface"
    ) {
      if (
        value === null ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        return {
          valid: false,
          errors: {
            _root: [
              "Expected object",
            ],
          },
        };
      }

      // Validate inherited interfaces.
      for (const parentName of definition.extends) {
        const parent = findDefinition(
          parentName
        );

        if (parent) {
          const parentResult =
            validateDefinition(
              parent,
              value
            );

          Object.assign(
            errors,
            parentResult.errors
          );
        }
      }

      for (const property of definition.properties) {
        const exists =
          property.name in value;

        if (!exists) {
          if (property.optional) {
            continue;
          }

          errors[property.name] =
            `Missing required property: ${property.name}`;

          continue;
        }

        // Enum type validation.
        const referencedDefinition =
          findDefinition(property.type);

        if (
          referencedDefinition &&
          referencedDefinition.kind === "enum"
        ) {
          const validEnumValue =
            referencedDefinition.members.some(
              (member) =>
                Object.is(
                  member.value,
                  value[property.name]
                )
            );

          if (!validEnumValue) {
            errors[property.name] =
              `Invalid ${property.type} value: ${value[property.name]}`;
          }

          continue;
        }

        // Union type validation.
        if (
          referencedDefinition &&
          referencedDefinition.kind ===
          "union"
        ) {
          const validUnion =
            referencedDefinition.types.some(
              (type) =>
                matchesType(
                  value[property.name],
                  type
                )
            );

          if (!validUnion) {
            errors[property.name] =
              `Expected ${referencedDefinition.types.join(
                " | "
              )}, got ${detectType(
                value[property.name]
              )}`;
          }

          continue;
        }

        if (
          !matchesType(
            value[property.name],
            property.type
          )
        ) {
          errors[property.name] =
            `Expected ${property.type}, got ${detectType(
              value[property.name]
            )}`;
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  };

  // --- STEP 16: VALIDATE PUBLIC API ---
  const validate = (
    typeName,
    value
  ) => {
    const definition =
      findDefinition(typeName);

    if (!definition) {
      return {
        valid: false,
        errors: {
          _root: [
            `Unknown type: ${typeName}`,
          ],
        },
      };
    }

    return validateDefinition(
      definition,
      value
    );
  };

  // --- STEP 17: GET DEFINITIONS ---
  const getDefinitions = () => {
    return definitions.map(
      (definition) => ({
        ...definition,
        ...(definition.properties
          ? {
            properties:
              definition.properties.map(
                (property) => ({
                  ...property,
                })
              ),
          }
          : {}),
        ...(definition.members
          ? {
            members:
              definition.members.map(
                (member) => ({
                  ...member,
                })
              ),
          }
          : {}),
        ...(definition.types
          ? {
            types: [
              ...definition.types,
            ],
          }
          : {}),
        ...(definition.extends
          ? {
            extends: [
              ...definition.extends,
            ],
          }
          : {}),
      })
    );
  };

  // --- STEP 18: GET REPORT ---
  const getReport = () => {
    return {
      types: definitions.filter(
        (definition) =>
          definition.kind === "type"
      ).length,

      interfaces: definitions.filter(
        (definition) =>
          definition.kind === "interface"
      ).length,

      enums: definitions.filter(
        (definition) =>
          definition.kind === "enum"
      ).length,

      unions: definitions.filter(
        (definition) =>
          definition.kind === "union"
      ).length,

      totalDefinitions:
        definitions.length,
    };
  };

  // --- STEP 19: RETURN BUILDER API ---
  return {
    defineType,
    defineInterface,
    defineEnum,
    defineUnion,
    generate,
    validate,
    getDefinitions,
    getReport,
  };
}


// --- Example Usage ---
const builder =
  createTypeDefinitionBuilder({
    moduleName: "AppTypes",
    strict: true,
    exportAll: true,
  });


builder.defineEnum(
  "Status",
  [
    {
      key: "Active",
      value: "active",
    },
    {
      key: "Inactive",
      value: "inactive",
    },
    {
      key: "Pending",
      value: "pending",
    },
  ]
);

builder.defineInterface(
  "User",
  [
    {
      name: "id",
      type: "number",
      optional: false,
      readonly: true,
    },
    {
      name: "name",
      type: "string",
      optional: false,
      readonly: false,
    },
    {
      name: "email",
      type: "string",
      optional: true,
      readonly: false,
    },
    {
      name: "status",
      type: "Status",
      optional: false,
      readonly: false,
    },
  ],
  []
);

builder.defineUnion(
  "StringOrNumber",
  [
    "string",
    "number",
  ]
);


console.log(builder.generate());

console.log(
  builder.validate(
    "User",
    {
      id: 1,
      name: "Rahim",
      status: "active",
    }
  )
);

console.log(
  builder.validate(
    "User",
    {
      id: "one",
      name: "Rahim",
      status: "deleted",
    }
  )
);

console.log(builder.getDefinitions());
console.log(builder.getReport());


// --- Additional Type Example ---
builder.defineType(
  "Product",
  [
    {
      name: "id",
      type: "number",
      optional: false,
      readonly: true,
    },
    {
      name: "title",
      type: "string",
      optional: false,
      readonly: false,
    },
    {
      name: "price",
      type: "number",
      optional: false,
      readonly: false,
    },
    {
      name: "description",
      type: "string",
      optional: true,
      readonly: false,
    },
  ]
);

console.log(builder.generate());

console.log(
  builder.validate(
    "Product",
    {
      id: 101,
      title: "Keyboard",
      price: 2500,
    }
  )
);


// --- Invalid Input ---
console.log(
  createTypeDefinitionBuilder({
    moduleName: "AppTypes",
    strict: "true",
    exportAll: true,
  })
);

console.log(
  builder.validate(
    "UnknownType",
    {}
  )
);