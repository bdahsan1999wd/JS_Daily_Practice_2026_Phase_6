// PROBLEM–01: Type Annotation Validator Engine

function createTypeValidator(schema) {

  // --- STEP 1: VALIDATE SCHEMA ---
  if (!Array.isArray(schema) || schema.length === 0) {
    return "Invalid Input";
  }

  const allowedTypes = [
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    "array",
    "object",
    "function",
    "tuple",
  ];

  const isPlainObject = (value) => {
    return (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype
    );
  };

  // --- STEP 2: VALIDATE EACH SCHEMA ENTRY ---
  for (const entry of schema) {
    if (!isPlainObject(entry)) {
      return "Invalid Input";
    }

    const {
      name,
      expectedType,
      tupleTypes,
      arrayItemType,
      nullable,
      optional,
    } = entry;

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      !allowedTypes.includes(expectedType)
    ) {
      return "Invalid Input";
    }

    if (typeof nullable !== "boolean" || typeof optional !== "boolean") {
      return "Invalid Input";
    }

    // Validate array item type.
    if (expectedType === "array") {
      if (
        typeof arrayItemType !== "string" ||
        !allowedTypes.includes(arrayItemType) ||
        arrayItemType === "array" ||
        arrayItemType === "tuple"
      ) {
        return "Invalid Input";
      }
    }

    // Validate tuple types.
    if (expectedType === "tuple") {
      if (
        !Array.isArray(tupleTypes) ||
        tupleTypes.length === 0 ||
        tupleTypes.some(
          (type) =>
            typeof type !== "string" || !allowedTypes.includes(type)
        )
      ) {
        return "Invalid Input";
      }
    }
  }

  // --- STEP 3: DETECT TYPE ---
  const detectType = (value) => {
    if (value === null) return "null";

    if (value === undefined) return "undefined";

    if (Array.isArray(value)) return "array";

    if (typeof value === "number") {
      return "number";
    }

    return typeof value;
  };

  // --- STEP 4: CHECK A VALUE AGAINST EXPECTED TYPE ---
  const matchesType = (value, expectedType, extra = {}) => {
    const detectedType = detectType(value);

    if (expectedType === "number") {
      return typeof value === "number" && Number.isFinite(value);
    }

    if (expectedType === "array") {
      if (!Array.isArray(value)) return false;

      if (!extra.arrayItemType) return true;

      return value.every((item) =>
        matchesType(item, extra.arrayItemType)
      );
    }

    if (expectedType === "tuple") {
      if (!Array.isArray(value)) return false;

      if (!Array.isArray(extra.tupleTypes)) return false;

      if (value.length !== extra.tupleTypes.length) {
        return false;
      }

      return value.every((item, index) =>
        matchesType(item, extra.tupleTypes[index])
      );
    }

    if (expectedType === "object") {
      return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.getPrototypeOf(value) === Object.prototype
      );
    }

    if (expectedType === "null") {
      return value === null;
    }

    if (expectedType === "undefined") {
      return value === undefined;
    }

    return detectedType === expectedType;
  };

  // --- STEP 5: VALIDATE SINGLE FIELD ---
  const validateSingle = (name, value) => {
    if (typeof name !== "string") {
      return {
        valid: false,
        type: detectType(value),
        expectedType: null,
        errors: ["Invalid field name"],
      };
    }

    const field = schema.find((item) => item.name === name);

    if (!field) {
      return {
        valid: false,
        type: detectType(value),
        expectedType: null,
        errors: [`Unknown field: ${name}`],
      };
    }

    const detectedType = detectType(value);
    const errors = [];

    // --- STEP 6: HANDLE NULLABLE ---
    if (value === null && field.nullable === true) {
      return {
        valid: true,
        type: detectedType,
        expectedType: field.expectedType,
        errors: [],
      };
    }

    // --- STEP 7: HANDLE OPTIONAL ---
    if (value === undefined && field.optional === true) {
      return {
        valid: true,
        type: detectedType,
        expectedType: field.expectedType,
        errors: [],
      };
    }

    // --- STEP 8: REQUIRED NULL / UNDEFINED ---
    if (value === null && field.nullable === false) {
      errors.push(
        `Expected ${field.expectedType}, got null`
      );

      return {
        valid: false,
        type: detectedType,
        expectedType: field.expectedType,
        errors,
      };
    }

    if (value === undefined && field.optional === false) {
      errors.push(
        `Expected ${field.expectedType}, got undefined`
      );

      return {
        valid: false,
        type: detectedType,
        expectedType: field.expectedType,
        errors,
      };
    }

    // --- STEP 9: CHECK BASIC TYPE ---
    if (
      !matchesType(value, field.expectedType, {
        arrayItemType: field.arrayItemType,
        tupleTypes: field.tupleTypes,
      })
    ) {
      if (field.expectedType === "array") {
        if (!Array.isArray(value)) {
          errors.push(
            `Expected array, got ${detectedType}`
          );
        } else if (field.arrayItemType) {
          const badIndex = value.findIndex(
            (item) =>
              !matchesType(item, field.arrayItemType)
          );

          if (badIndex !== -1) {
            errors.push(
              `Array items must be ${field.arrayItemType}, got ${detectType(
                value[badIndex]
              )} at index ${badIndex}`
            );
          }
        }
      } else if (field.expectedType === "tuple") {
        if (!Array.isArray(value)) {
          errors.push(
            `Expected tuple, got ${detectedType}`
          );
        } else if (
          value.length !== field.tupleTypes.length
        ) {
          errors.push(
            `Tuple length mismatch: expected ${field.tupleTypes.length}, got ${value.length}`
          );
        } else {
          const badIndex = value.findIndex(
            (item, index) =>
              !matchesType(item, field.tupleTypes[index])
          );

          if (badIndex !== -1) {
            errors.push(
              `Tuple position ${badIndex}: expected ${field.tupleTypes[badIndex]}, got ${detectType(
                value[badIndex]
              )}`
            );
          }
        }
      } else {
        errors.push(
          `Expected ${field.expectedType}, got ${detectedType}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      type: detectedType,
      expectedType: field.expectedType,
      errors,
    };
  };

  // --- STEP 10: INFER TYPESCRIPT STYLE TYPE ---
  const infer = (value) => {
    if (value === null) return "null";

    if (value === undefined) return "undefined";

    if (typeof value === "number") {
      return Number.isFinite(value) ? "number" : "number";
    }

    if (typeof value === "string") return "string";

    if (typeof value === "boolean") return "boolean";

    if (typeof value === "function") return "function";

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "never[]";
      }

      const types = value.map((item) => infer(item));

      const uniqueTypes = [...new Set(types)];

      // Same type → array type.
      if (uniqueTypes.length === 1) {
        return `${uniqueTypes[0]}[]`;
      }

      // Mixed types → tuple style.
      return `[${types.join(", ")}]`;
    }

    if (
      typeof value === "object" &&
      value !== null
    ) {
      const properties = Object.entries(value).map(
        ([key, item]) => `${key}: ${infer(item)}`
      );

      return `{ ${properties.join("; ")} }`;
    }

    return typeof value;
  };

  // --- STEP 11: MAIN VALIDATION ---
  const validate = (data) => {
    if (
      data === null ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return {
        valid: false,
        errors: {
          _root: ["Expected object"],
        },
        passedCount: 0,
        failedCount: schema.length,
      };
    }

    const errors = {};
    let passedCount = 0;
    let failedCount = 0;

    for (const field of schema) {
      const result = validateSingle(
        field.name,
        data[field.name]
      );

      // Missing optional field is valid.
      if (
        !(field.name in data) &&
        field.optional === true
      ) {
        passedCount++;
        continue;
      }

      if (result.valid) {
        passedCount++;
      } else {
        failedCount++;
        errors[field.name] = result.errors;
      }
    }

    return {
      valid: failedCount === 0,
      errors,
      passedCount,
      failedCount,
    };
  };

  // --- STEP 12: GET REPORT ---
  const getReport = () => {
    return {
      totalFields: schema.length,
      nullable: schema.filter(
        (item) => item.nullable === true
      ).length,
      optional: schema.filter(
        (item) => item.optional === true
      ).length,
      tupleFields: schema.filter(
        (item) => item.expectedType === "tuple"
      ).length,
      arrayFields: schema.filter(
        (item) => item.expectedType === "array"
      ).length,
    };
  };

  // --- STEP 13: RETURN VALIDATOR API ---
  return {
    validate,
    validateSingle,
    infer,
    getSchema: () => [...schema],
    getReport,
  };
}


// --- EXAMPLE USAGE ---
const validator = createTypeValidator([
  {
    name: "id",
    expectedType: "number",
    nullable: false,
    optional: false,
  },
  {
    name: "name",
    expectedType: "string",
    nullable: false,
    optional: false,
  },
  {
    name: "tags",
    expectedType: "array",
    arrayItemType: "string",
    nullable: false,
    optional: true,
  },
  {
    name: "coords",
    expectedType: "tuple",
    tupleTypes: ["number", "number"],
    nullable: false,
    optional: false,
  },
]);



console.log(
  validator.validate({
    id: 1,
    name: "Rahim",
    tags: ["js", "ts"],
    coords: [23.8, 90.4],
  })
);

console.log(
  validator.validate({
    id: "one",
    name: "Rahim",
    tags: [1, 2],
    coords: [23.8, 90.4, 0],
  })
);

console.log(validator.infer([1, "hello", true]));
console.log(validator.infer([1, 2, 3]));
console.log(validator.getSchema());
console.log(validator.getReport());


// --- Invalid Input ---
console.log(createTypeValidator("invalid"));
console.log(validator.validate("invalid"));