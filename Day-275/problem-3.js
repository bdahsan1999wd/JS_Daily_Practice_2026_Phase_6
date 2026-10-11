// PROBLEM–03: createConstraintEngine()

// Logic: This engine simulates TypeScript generic constraints, keyof, conditional types and mapped types.
// It also provides a constrained identity function and keeps track of successful and failed constraint checks.


function createConstraintEngine(constraints) {

  // --- STEP 1: VALIDATE INPUT ---
  if (
    !Array.isArray(constraints) ||
    constraints.length === 0
  ) {
    return "Invalid Input";
  }

  // --- STEP 2: VALIDATE CONSTRAINT DEFINITIONS ---
  const validConstraints = constraints.every(
    (constraint) => {
      return (
        constraint &&
        typeof constraint === "object" &&
        typeof constraint.name === "string" &&
        constraint.name.trim() !== "" &&
        ["extends", "keyof", "conditional", "mapped"].includes(
          constraint.kind
        ) &&
        typeof constraint.base === "string" &&
        constraint.base.trim() !== "" &&
        (constraint.condition === null ||
          typeof constraint.condition === "string") &&
        Array.isArray(constraint.properties) &&
        constraint.properties.every(
          (property) =>
            typeof property === "string"
        )
      );
    }
  );

  if (!validConstraints) {
    return "Invalid Input";
  }

  // --- STEP 3: PREVENT DUPLICATE CONSTRAINT NAMES ---
  const names = constraints.map(
    (constraint) => constraint.name
  );

  if (new Set(names).size !== names.length) {
    return "Invalid Input";
  }

  // --- STEP 4: STORE CONSTRAINTS ---
  const constraintMap = new Map();

  constraints.forEach((constraint) => {
    constraintMap.set(constraint.name, {
      ...constraint,
      properties: [...constraint.properties],
    });
  });

  // --- STEP 5: REPORT STATE ---
  let validChecks = 0;
  let invalidChecks = 0;

  // --- STEP 6: RUNTIME TYPE HELPER ---
  function getType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";

    return typeof value;
  }

  // --- STEP 7: CHECK EXTENDS CONSTRAINT ---
  function checkExtends(value, constraintName) {
    const constraint =
      constraintMap.get(constraintName);

    if (!constraint) {
      invalidChecks++;

      return {
        valid: false,
        reason: `Unknown constraint: ${constraintName}`,
      };
    }

    let valid = false;
    let reason = "";

    // `{ length: number }`
    if (
      constraint.base.includes("length")
    ) {
      valid =
        value !== null &&
        value !== undefined &&
        typeof value.length === "number";

      reason = valid
        ? `${getType(value)} has .length property`
        : `${getType(value)} does not have .length property`;
    }

    // `{ toString: function }`
    else if (
      constraint.base.includes("toString")
    ) {
      valid =
        value !== null &&
        value !== undefined &&
        typeof value.toString === "function";

      reason = valid
        ? `${getType(value)} has .toString property`
        : `${getType(value)} does not have .toString property`;
    }

    // Simple primitive constraint.
    else if (
      ["string", "number", "boolean", "object"].includes(
        constraint.base
      )
    ) {
      valid = getType(value) === constraint.base;

      reason = valid
        ? `${getType(value)} satisfies ${constraint.base}`
        : `${getType(value)} does not satisfy ${constraint.base}`;
    }

    else {
      valid = false;
      reason = `Unsupported constraint: ${constraint.base}`;
    }

    if (valid) {
      validChecks++;
    } else {
      invalidChecks++;
    }

    return {
      valid,
      reason,
    };
  }

  // --- STEP 8: SIMULATE keyof ---
  function keyof(typeName, obj) {
    if (
      typeof typeName !== "string" ||
      typeName.trim() === "" ||
      !obj ||
      typeof obj !== "object" ||
      Array.isArray(obj)
    ) {
      return "Invalid Input";
    }

    const keys = Object.keys(obj);

    return {
      keys,
      typeString: `keyof ${typeName} = ${keys
        .map((key) => `'${key}'`)
        .join(" | ")}`,
    };
  }

  // --- STEP 9: SIMULATE CONDITIONAL TYPE ---
  function conditionalType(
    value,
    condition,
    trueType,
    falseType
  ) {
    if (
      typeof condition !== "string" ||
      typeof trueType !== "string" ||
      typeof falseType !== "string"
    ) {
      return "Invalid Input";
    }

    let conditionMet = false;

    // Example: "extends string"
    const extendsMatch =
      condition.match(
        /^extends\s+(.+)$/
      );

    if (extendsMatch) {
      const expectedType =
        extendsMatch[1].trim();

      conditionMet =
        getType(value) === expectedType;
    }

    return {
      resolvedType: conditionMet
        ? trueType
        : falseType,
      conditionMet,
    };
  }

  // --- STEP 10: SIMULATE MAPPED TYPES ---
  function mappedType(obj, transform) {
    if (
      !obj ||
      typeof obj !== "object" ||
      Array.isArray(obj) ||
      ![
        "optional",
        "readonly",
        "nullable",
        "array",
      ].includes(transform)
    ) {
      return "Invalid Input";
    }

    const mappedType = {};
    const typeParts = [];

    Object.entries(obj).forEach(
      ([key, type]) => {
        let mappedValue = type;
        let propertyName = key;

        switch (transform) {
          case "optional":
            mappedValue = `${type}?`;
            propertyName = key;
            typeParts.push(
              `${key}?: ${type}`
            );
            break;

          case "readonly":
            mappedValue = `readonly ${type}`;
            typeParts.push(
              `readonly ${key}: ${type}`
            );
            break;

          case "nullable":
            mappedValue = `${type} | null`;
            typeParts.push(
              `${key}: ${type} | null`
            );
            break;

          case "array":
            mappedValue = `${type}[]`;
            typeParts.push(
              `${key}: ${type}[]`
            );
            break;
        }

        mappedType[key] = mappedValue;
      }
    );

    return {
      mappedType,
      typeString: `{ ${typeParts.join("; ")} }`,
    };
  }

  // --- STEP 11: CONSTRAINED IDENTITY ---
  function constrainedIdentity(
    value,
    constraintName
  ) {
    const result = checkExtends(
      value,
      constraintName
    );

    if (!result.valid) {
      return {
        value: null,
        valid: false,
        constraintApplied: constraintName,
        error: result.reason,
      };
    }

    return {
      value,
      valid: true,
      constraintApplied: constraintName,
    };
  }

  // --- STEP 12: GENERATE REPORT ---
  function getReport() {
    const byKind = {};

    constraints.forEach((constraint) => {
      byKind[constraint.kind] =
        (byKind[constraint.kind] || 0) + 1;
    });

    return {
      totalConstraints: constraints.length,
      byKind,
      validChecks,
      invalidChecks,
    };
  }

  // --- STEP 13: RETURN ENGINE API ---
  return {
    checkExtends,
    keyof,
    conditionalType,
    mappedType,
    constrainedIdentity,
    getReport,
  };
}


// --- EXAMPLE USAGE ---
const constraintEngine =
  createConstraintEngine([
    {
      name: "Lengthwise",
      kind: "extends",
      base: "{ length: number }",
      condition: null,
      properties: [],
    },
    {
      name: "Stringable",
      kind: "extends",
      base: "{ toString: function }",
      condition: null,
      properties: [],
    },
  ]);


console.log(
  constraintEngine.checkExtends(
    "hello",
    "Lengthwise"
  )
);

console.log(
  constraintEngine.checkExtends(
    42,
    "Lengthwise"
  )
);

console.log(
  constraintEngine.keyof("User", {
    id: 1,
    name: "Rahim",
    email: "r@mail.com",
  })
);

console.log(
  constraintEngine.conditionalType(
    "hello",
    "extends string",
    "StringType",
    "OtherType"
  )
);

console.log(
  constraintEngine.conditionalType(
    42,
    "extends string",
    "StringType",
    "OtherType"
  )
);

console.log(
  constraintEngine.mappedType(
    {
      name: "string",
      age: "number",
      active: "boolean",
    },
    "optional"
  )
);

console.log(
  constraintEngine.mappedType(
    {
      name: "string",
      age: "number",
    },
    "nullable"
  )
);

console.log(constraintEngine.getReport());