// PROBLEM–03: Tuple Type System Engine


function createTupleEngine(tupleSchemas) {
  // --- STEP 1: VALIDATE INPUT ---
  if (
    !Array.isArray(tupleSchemas) ||
    tupleSchemas.length === 0
  ) {
    return "Invalid Input";
  }

  const allowedTypes = [
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    "object",
    "function",
    "symbol",
    "bigint",
    "array",
  ];

  const schemas = new Map();

  // --- STEP 2: VALIDATE EACH SCHEMA ---
  for (const schema of tupleSchemas) {
    if (
      schema === null ||
      typeof schema !== "object" ||
      Array.isArray(schema)
    ) {
      return "Invalid Input";
    }

    const {
      name,
      types,
      labels,
      rest,
    } = schema;

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      schemas.has(name)
    ) {
      return "Invalid Input";
    }

    if (
      !Array.isArray(types) ||
      types.length === 0
    ) {
      return "Invalid Input";
    }

    if (
      types.some(
        (type) =>
          typeof type !== "string" ||
          !allowedTypes.includes(type)
      )
    ) {
      return "Invalid Input";
    }

    if (
      labels !== undefined &&
      (!Array.isArray(labels) ||
        labels.length !== types.length ||
        labels.some(
          (label) => typeof label !== "string"
        ))
    ) {
      return "Invalid Input";
    }

    if (
      rest !== null &&
      rest !== undefined &&
      (typeof rest !== "string" ||
        !allowedTypes.includes(rest))
    ) {
      return "Invalid Input";
    }

    schemas.set(name, {
      name,
      types: [...types],
      labels: labels ? [...labels] : [],
      rest: rest ?? null,
    });
  }

  // --- STEP 3: DETECT TYPE ---
  const detectType = (value) => {
    if (value === null) return "null";

    if (Array.isArray(value)) return "array";

    if (typeof value === "number") return "number";

    return typeof value;
  };

  // --- STEP 4: TYPE MATCHING ---
  const matchesType = (value, expectedType) => {
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

    return detectType(value) === expectedType;
  };

  // --- STEP 5: VALIDATE TUPLE ---
  const validate = (name, value) => {
    const schema = schemas.get(name);

    if (!schema) {
      return {
        valid: false,
        errors: [`Unknown tuple: ${name}`],
        namedElements: null,
      };
    }

    if (!Array.isArray(value)) {
      return {
        valid: false,
        errors: ["Tuple value must be an array"],
        namedElements: null,
      };
    }

    const errors = [];

    // --- STEP 6: CHECK LENGTH ---
    if (schema.rest === null) {
      if (value.length !== schema.types.length) {
        errors.push(
          `Tuple length mismatch: expected ${schema.types.length}, got ${value.length}`
        );
      }
    } else {
      if (value.length < schema.types.length) {
        errors.push(
          `Tuple requires at least ${schema.types.length} elements, got ${value.length}`
        );
      }
    }

    // --- STEP 7: CHECK FIXED POSITIONS ---
    for (
      let index = 0;
      index < schema.types.length;
      index++
    ) {
      if (index >= value.length) break;

      if (
        !matchesType(
          value[index],
          schema.types[index]
        )
      ) {
        const label = schema.labels[index];

        errors.push(
          `Position ${index}${label ? ` (${label})` : ""
          }: expected ${schema.types[index]}, got ${detectType(
            value[index]
          )}`
        );
      }
    }

    // --- STEP 8: CHECK REST ELEMENTS ---
    if (schema.rest !== null) {
      for (
        let index = schema.types.length;
        index < value.length;
        index++
      ) {
        if (
          !matchesType(value[index], schema.rest)
        ) {
          errors.push(
            `Rest position ${index}: expected ${schema.rest}, got ${detectType(
              value[index]
            )}`
          );
        }
      }
    }

    // --- STEP 9: CREATE NAMED ELEMENTS ---
    let namedElements = null;

    if (errors.length === 0 && schema.labels.length > 0) {
      namedElements = {};

      schema.labels.forEach((label, index) => {
        namedElements[label] = value[index];
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      namedElements,
    };
  };

  // --- STEP 10: CREATE VALIDATED TUPLE ---
  const create = (name, values) => {
    const result = validate(name, values);

    if (!result.valid) {
      return "Invalid Input";
    }

    return [...values];
  };

  // --- STEP 11: DESTRUCTURE TUPLE ---
  const destructure = (name, tuple) => {
    const result = validate(name, tuple);

    if (!result.valid) {
      return "Invalid Input";
    }

    return result.namedElements || {};
  };

  // --- STEP 12: SPREAD TUPLE ---
  const spread = (name, tuple, extras) => {
    const schema = schemas.get(name);

    if (
      !schema ||
      !Array.isArray(tuple) ||
      !Array.isArray(extras)
    ) {
      return "Invalid Input";
    }

    if (schema.rest === null) {
      return "Invalid Input";
    }

    const baseValidation = validate(name, tuple);

    if (!baseValidation.valid) {
      return "Invalid Input";
    }

    // Validate every extra element.
    for (const extra of extras) {
      if (!matchesType(extra, schema.rest)) {
        return "Invalid Input";
      }
    }

    return [...tuple, ...extras];
  };

  // --- STEP 13: COMPARE TUPLES ---
  const compare = (name, tuple1, tuple2) => {
    const first = validate(name, tuple1);
    const second = validate(name, tuple2);

    if (!first.valid || !second.valid) {
      return {
        equal: false,
        differences: ["Invalid tuple input"],
      };
    }

    const differences = [];
    const maxLength = Math.max(
      tuple1.length,
      tuple2.length
    );

    for (let index = 0; index < maxLength; index++) {
      if (!Object.is(tuple1[index], tuple2[index])) {
        differences.push({
          index,
          first: tuple1[index],
          second: tuple2[index],
        });
      }
    }

    return {
      equal: differences.length === 0,
      differences,
    };
  };

  // --- STEP 14: GET TUPLE INFO ---
  const getTupleInfo = (name) => {
    const schema = schemas.get(name);

    if (!schema) {
      return "Invalid Input";
    }

    let typeString = `[${schema.types.join(", ")}]`;

    if (schema.rest !== null) {
      typeString = `[${schema.types.join(
        ", "
      )}, ...${schema.rest}[]]`;
    }

    return {
      name: schema.name,
      typeString,
      labels: [...schema.labels],
      hasRest: schema.rest !== null,
    };
  };

  // --- STEP 15: GET REPORT ---
  const getReport = () => {
    const totalSchemas = schemas.size;

    const withRest = [...schemas.values()].filter(
      (schema) => schema.rest !== null
    ).length;

    const withLabels = [...schemas.values()].filter(
      (schema) => schema.labels.length > 0
    ).length;

    const totalLength = [...schemas.values()].reduce(
      (sum, schema) => sum + schema.types.length,
      0
    );

    return {
      totalSchemas,
      withRest,
      withLabels,
      avgLength: Number(
        (totalLength / totalSchemas).toFixed(2)
      ),
    };
  };

  // --- STEP 16: RETURN TUPLE API ---
  return {
    validate,
    create,
    destructure,
    spread,
    compare,
    getTupleInfo,
    getReport,
  };
}


// --- EXAMPLE USAGE ---
const tupleEngine = createTupleEngine([
  {
    name: "Point2D",
    types: ["number", "number"],
    labels: ["x", "y"],
    rest: null,
  },
  {
    name: "RGB",
    types: [
      "number",
      "number",
      "number",
    ],
    labels: ["r", "g", "b"],
    rest: null,
  },
  {
    name: "NameAgeTags",
    types: ["string", "number"],
    labels: ["name", "age"],
    rest: "string",
  },
]);


console.log(
  tupleEngine.validate(
    "Point2D",
    [10, 20]
  )
);

console.log(
  tupleEngine.validate(
    "RGB",
    [255, "128", 0]
  )
);

console.log(
  tupleEngine.create(
    "Point2D",
    [5, 15]
  )
);

console.log(
  tupleEngine.destructure(
    "RGB",
    [255, 128, 0]
  )
);

console.log(
  tupleEngine.spread(
    "NameAgeTags",
    ["Rahim", 25],
    ["js", "ts", "node"]
  )
);

console.log(
  tupleEngine.compare(
    "Point2D",
    [10, 20],
    [10, 30]
  )
);

console.log(
  tupleEngine.getTupleInfo(
    "NameAgeTags"
  )
);

console.log(tupleEngine.getReport());


// --- Invalid Input ---
console.log(createTupleEngine("invalid"));

console.log(
  tupleEngine.create(
    "Point2D",
    [10, "20"]
  )
);

console.log(
  tupleEngine.spread(
    "Point2D",
    [10, 20],
    ["extra"]
  )
);