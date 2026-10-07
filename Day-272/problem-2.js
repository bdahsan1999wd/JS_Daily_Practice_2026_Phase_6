// PROBLEM–02: Type Alias & Union Type Engine


function createTypeAliasEngine(definitions) {
  // --- STEP 1: VALIDATE INPUT ---
  if (!Array.isArray(definitions) || definitions.length === 0) {
    return "Invalid Input";
  }

  const allowedKinds = [
    "alias",
    "union",
    "intersection",
    "literal",
  ];

  const primitiveTypes = [
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    "symbol",
    "bigint",
    "function",
    "object",
  ];

  const isValidTypeName = (type) => {
    return (
      typeof type === "string" &&
      (primitiveTypes.includes(type) ||
        definitions.some((item) => item.alias === type))
    );
  };

  // --- STEP 2: VALIDATE DEFINITIONS ---
  const aliasNames = new Set();

  for (const definition of definitions) {
    if (
      definition === null ||
      typeof definition !== "object" ||
      Array.isArray(definition)
    ) {
      return "Invalid Input";
    }

    const {
      alias,
      kind,
      base,
      members,
      literals,
    } = definition;

    if (
      typeof alias !== "string" ||
      alias.trim() === "" ||
      aliasNames.has(alias) ||
      !allowedKinds.includes(kind)
    ) {
      return "Invalid Input";
    }

    aliasNames.add(alias);

    if (kind === "alias") {
      if (typeof base !== "string" || base.trim() === "") {
        return "Invalid Input";
      }
    }

    if (
      kind === "union" ||
      kind === "intersection"
    ) {
      if (!Array.isArray(members) || members.length === 0) {
        return "Invalid Input";
      }
    }

    if (kind === "literal") {
      if (!Array.isArray(literals) || literals.length === 0) {
        return "Invalid Input";
      }
    }
  }

  const registry = new Map();

  definitions.forEach((definition) => {
    registry.set(definition.alias, {
      ...definition,
      usage: 0,
    });
  });

  // --- STEP 3: DETECT RUNTIME TYPE ---
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

  // --- STEP 4: CHECK BASE TYPE ---
  const checkBaseType = (base, value) => {
    if (base === "number") {
      return (
        typeof value === "number" &&
        Number.isFinite(value)
      );
    }

    if (base === "object") {
      return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      );
    }

    if (base === "array") {
      return Array.isArray(value);
    }

    return detectType(value) === base;
  };

  // --- STEP 5: CHECK ALIAS VALUE ---
  const satisfies = (alias, value, visited = new Set()) => {
    if (!registry.has(alias)) return false;

    if (visited.has(alias)) return false;

    visited.add(alias);

    const definition = registry.get(alias);

    if (definition.kind === "alias") {
      if (registry.has(definition.base)) {
        return satisfies(
          definition.base,
          value,
          visited
        );
      }

      return checkBaseType(definition.base, value);
    }

    if (definition.kind === "literal") {
      return definition.literals.some(
        (literal) =>
          Object.is(literal, value)
      );
    }

    if (definition.kind === "union") {
      return definition.members.some((member) => {
        if (registry.has(member)) {
          return satisfies(
            member,
            value,
            new Set(visited)
          );
        }

        return checkBaseType(member, value);
      });
    }

    if (definition.kind === "intersection") {
      return definition.members.every((member) => {
        if (registry.has(member)) {
          return satisfies(
            member,
            value,
            new Set(visited)
          );
        }

        return checkBaseType(member, value);
      });
    }

    return false;
  };

  // --- STEP 6: RESOLVE TYPE STRING ---
  const resolve = (alias, visited = new Set()) => {
    if (!registry.has(alias)) {
      return null;
    }

    if (visited.has(alias)) {
      return alias;
    }

    visited.add(alias);

    const definition = registry.get(alias);

    if (definition.kind === "alias") {
      if (registry.has(definition.base)) {
        return resolve(
          definition.base,
          visited
        );
      }

      return definition.base;
    }

    if (definition.kind === "literal") {
      return definition.literals
        .map((value) => {
          if (typeof value === "string") {
            return `'${value}'`;
          }

          if (value === null) return "null";

          return String(value);
        })
        .join(" | ");
    }

    if (definition.kind === "union") {
      return definition.members
        .map((member) =>
          registry.has(member)
            ? resolve(member, new Set(visited))
            : member
        )
        .join(" | ");
    }

    if (definition.kind === "intersection") {
      return definition.members
        .map((member) =>
          registry.has(member)
            ? resolve(member, new Set(visited))
            : member
        )
        .join(" & ");
    }

    return null;
  };

  // --- STEP 7: CHECK API ---
  const check = (alias, value) => {
    if (!registry.has(alias)) {
      return {
        valid: false,
        alias,
        value,
        reason: `Unknown alias: ${alias}`,
      };
    }

    const definition = registry.get(alias);

    definition.usage++;

    const valid = satisfies(alias, value);

    let reason = null;

    if (!valid) {
      if (definition.kind === "literal") {
        reason = `Value must be one of: ${definition.literals.join(
          ", "
        )}`;
      } else {
        reason = `Value does not satisfy type ${resolve(alias)}`;
      }
    }

    return {
      valid,
      alias,
      value,
      reason,
    };
  };

  // --- STEP 8: NARROW VALUE AGAINST ALIASES ---
  const narrow = (value, aliases) => {
    if (!Array.isArray(aliases)) {
      return [];
    }

    const matched = [];

    for (const alias of aliases) {
      if (!registry.has(alias)) continue;

      if (satisfies(alias, value)) {
        registry.get(alias).usage++;
        matched.push(alias);
      }
    }

    return matched;
  };

  // --- STEP 9: COMPOSE NEW ALIAS ---
  const compose = (name, kind, members) => {
    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      registry.has(name) ||
      !allowedKinds.includes(kind) ||
      !Array.isArray(members) ||
      members.length === 0
    ) {
      return "Invalid Input";
    }

    if (
      kind !== "union" &&
      kind !== "intersection"
    ) {
      return "Invalid Input";
    }

    const newDefinition = {
      alias: name,
      kind,
      base: "",
      members: [...members],
      literals: [],
      usage: 0,
    };

    registry.set(name, newDefinition);

    return {
      alias: name,
      kind,
      members: [...members],
    };
  };

  // --- STEP 10: GET REPORT ---
  const getReport = () => {
    const byKind = {
      alias: 0,
      union: 0,
      intersection: 0,
      literal: 0,
    };

    let mostUsed = null;
    let highestUsage = -1;

    for (const definition of registry.values()) {
      byKind[definition.kind]++;

      if (definition.usage >= highestUsage) {
        highestUsage = definition.usage;
        mostUsed = definition.alias;
      }
    }

    return {
      totalAliases: registry.size,
      byKind,
      mostUsed,
    };
  };

  // --- STEP 11: RETURN ENGINE API ---
  return {
    check,
    resolve,
    narrow,
    compose,
    getAliases: () => [...registry.keys()],
    getReport,
  };
}



// --- EXAMPLE USAGE ---
const aliasEngine = createTypeAliasEngine([
  {
    alias: "UserId",
    kind: "alias",
    base: "string",
    members: [],
    literals: [],
  },
  {
    alias: "Status",
    kind: "literal",
    base: "string",
    members: [],
    literals: [
      "active",
      "inactive",
      "pending",
    ],
  },
  {
    alias: "StringOrNumber",
    kind: "union",
    base: "",
    members: ["string", "number"],
    literals: [],
  },
  {
    alias: "NumericId",
    kind: "alias",
    base: "number",
    members: [],
    literals: [],
  },
]);


console.log(
  aliasEngine.check(
    "UserId",
    "U001"
  )
);

console.log(
  aliasEngine.check(
    "Status",
    "deleted"
  )
);

console.log(
  aliasEngine.check(
    "StringOrNumber",
    42
  )
);


console.log(aliasEngine.resolve("Status"));

console.log(
  aliasEngine.resolve(
    "StringOrNumber"
  )
);

console.log(
  aliasEngine.narrow(
    "hello",
    [
      "UserId",
      "NumericId",
      "StringOrNumber",
    ]
  )
);

console.log(aliasEngine.getAliases());

console.log(aliasEngine.getReport());

console.log(
  aliasEngine.compose(
    "BooleanOrString",
    "union",
    ["boolean", "string"]
  )
);

console.log(
  aliasEngine.check(
    "BooleanOrString",
    true
  )
);


// --- Invalid Input ---
console.log(createTypeAliasEngine("invalid"));

console.log(
  aliasEngine.check(
    "UnknownAlias",
    123
  )
);