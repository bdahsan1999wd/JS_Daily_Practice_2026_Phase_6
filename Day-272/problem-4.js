// PROBLEM–04: Type Inference Engine


function createTypeInferenceEngine(config) {

  // --- STEP 1: VALIDATE CONFIG ---
  if (
    config === null ||
    typeof config !== "object" ||
    Array.isArray(config)
  ) {
    return "Invalid Input";
  }

  const {
    strict,
    inferArrays,
  } = config;

  if (
    typeof strict !== "boolean" ||
    typeof inferArrays !== "boolean"
  ) {
    return "Invalid Input";
  }

  // --- STEP 2: TRACK INFERENCE HISTORY ---
  const history = [];

  // --- STEP 3: BASIC TYPE DETECTOR ---
  const basicType = (value) => {
    if (value === null) {
      return strict ? "null" : "any";
    }

    if (value === undefined) {
      return strict ? "undefined" : "any";
    }

    if (Array.isArray(value)) {
      return "array";
    }

    if (typeof value === "number") {
      return Number.isFinite(value)
        ? "number"
        : "number";
    }

    if (typeof value === "function") {
      return "() => unknown";
    }

    return typeof value;
  };

  // --- STEP 4: INFER ARRAY ---
  const inferArray = (value) => {
    if (value.length === 0) {
      return "never[]";
    }

    const types = value.map((item) =>
      inferInternal(item)
    );

    const uniqueTypes = [...new Set(types)];

    // Same types → normal array.
    if (uniqueTypes.length === 1) {
      return `${uniqueTypes[0]}[]`;
    }

    // Mixed types → tuple style.
    return `[${types.join(", ")}]`;
  };

  // --- STEP 5: INFER OBJECT ---
  const inferObject = (value) => {
    const properties = Object.entries(value).map(
      ([key, item]) =>
        `${key}: ${inferInternal(item)}`
    );

    return `{ ${properties.join("; ")} }`;
  };

  // --- STEP 6: INTERNAL INFERENCE ---
  const inferInternal = (value) => {
    if (value === null) {
      return strict ? "null" : "any";
    }

    if (value === undefined) {
      return strict ? "undefined" : "any";
    }

    if (Array.isArray(value)) {
      if (!inferArrays) {
        return "unknown[]";
      }

      return inferArray(value);
    }

    if (
      typeof value === "object" &&
      value !== null
    ) {
      return inferObject(value);
    }

    return basicType(value);
  };

  // --- STEP 7: PUBLIC INFER ---
  const infer = (value) => {
    const type = inferInternal(value);

    history.push(type);

    return type;
  };

  // --- STEP 8: INFER ALL ---
  const inferAll = (values) => {
    if (!Array.isArray(values)) {
      return "Invalid Input";
    }

    const types = values.map((value) =>
      infer(value)
    );

    const uniqueTypes = [...new Set(types)];

    let commonType = null;

    if (
      uniqueTypes.length === 1 &&
      uniqueTypes[0] !== "any"
    ) {
      commonType = uniqueTypes[0];
    }

    const unionType =
      uniqueTypes.length === 0
        ? "never"
        : uniqueTypes.join(" | ");

    return {
      types: uniqueTypes,
      commonType,
      unionType,
    };
  };

  // --- STEP 9: PARSE UNION ---
  const splitUnion = (type) => {
    if (typeof type !== "string") {
      return [];
    }

    return type
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  // --- STEP 10: ASSIGNABILITY ---
  const isAssignable = (
    sourceType,
    targetType
  ) => {
    if (
      typeof sourceType !== "string" ||
      typeof targetType !== "string"
    ) {
      return false;
    }

    // any accepts everything.
    if (
      sourceType === "any" ||
      targetType === "any"
    ) {
      return true;
    }

    // Exact match.
    if (sourceType === targetType) {
      return true;
    }

    // Source union must have every member
    // accepted by target.
    const sourceMembers = splitUnion(sourceType);

    if (sourceMembers.length > 1) {
      return sourceMembers.every((member) =>
        isAssignable(member, targetType)
      );
    }

    // Target union.
    const targetMembers = splitUnion(targetType);

    if (targetMembers.length > 1) {
      return targetMembers.some((member) =>
        isAssignable(sourceType, member)
      );
    }

    // never is assignable to everything.
    if (sourceType === "never") {
      return true;
    }

    // Literal widening.
    if (
      /^['"].*['"]$/.test(sourceType) &&
      targetType === "string"
    ) {
      return true;
    }

    if (
      /^-?\d+(\.\d+)?$/.test(sourceType) &&
      targetType === "number"
    ) {
      return true;
    }

    if (
      (sourceType === "true" ||
        sourceType === "false") &&
      targetType === "boolean"
    ) {
      return true;
    }

    return false;
  };

  // --- STEP 11: WIDEN LITERAL ---
  const widen = (type) => {
    if (typeof type !== "string") {
      return "Invalid Input";
    }

    if (
      /^['"].*['"]$/.test(type)
    ) {
      return "string";
    }

    if (
      /^-?\d+(\.\d+)?$/.test(type)
    ) {
      return "number";
    }

    if (
      type === "true" ||
      type === "false"
    ) {
      return "boolean";
    }

    return type;
  };

  // --- STEP 12: TYPE NARROWING ---
  const narrow = (value, typeGuard) => {
    if (
      typeof typeGuard !== "string" ||
      typeGuard.trim() === ""
    ) {
      return "Invalid Input";
    }

    const guard = typeGuard.trim();

    // typeof guard.
    if (guard.startsWith("typeof ")) {
      const expected = guard
        .slice(7)
        .trim();

      const actual =
        value === null
          ? "object"
          : typeof value;

      return actual === expected
        ? {
          value,
          narrowedType: expected,
        }
        : {
          value,
          narrowedType: "never",
        };
    }

    // instanceof guard.
    if (
      guard.startsWith("instanceof ")
    ) {
      const className = guard
        .slice(11)
        .trim();

      if (!className) {
        return "Invalid Input";
      }

      // Since arbitrary ClassName cannot be resolved
      // safely, return the simulated narrowed type.
      return {
        value,
        narrowedType: className,
      };
    }

    // "in key" guard.
    if (guard.startsWith("in ")) {
      const key = guard.slice(3).trim();

      if (!key) {
        return "Invalid Input";
      }

      const exists =
        value !== null &&
        value !== undefined &&
        (typeof value === "object" ||
          typeof value === "function") &&
        key in value;

      return {
        value,
        narrowedType: exists
          ? `object with ${key}`
          : "never",
      };
    }

    // Truthiness guard.
    if (guard === "truthiness") {
      return {
        value,
        narrowedType: value
          ? basicType(value)
          : "never",
      };
    }

    return "Invalid Input";
  };

  // --- STEP 13: GET REPORT ---
  const getReport = () => {
    const frequency = {};

    for (const type of history) {
      frequency[type] =
        (frequency[type] || 0) + 1;
    }

    let mostCommonType = null;
    let highestCount = 0;

    for (const [type, count] of Object.entries(
      frequency
    )) {
      if (count > highestCount) {
        highestCount = count;
        mostCommonType = type;
      }
    }

    return {
      totalInferred: history.length,
      uniqueTypes: new Set(history).size,
      mostCommonType,
    };
  };

  // --- STEP 14: RETURN INFERENCE API ---
  return {
    infer,
    inferAll,
    isAssignable,
    widen,
    narrow,
    getReport,
  };
}


// --- EXAMPLE USAGE ---
const inferenceEngine =
  createTypeInferenceEngine({
    strict: true,
    inferArrays: true,
  });


console.log(inferenceEngine.infer(42));
console.log(inferenceEngine.infer("hello"));
console.log(inferenceEngine.infer([1, 2, 3]));

console.log(
  inferenceEngine.infer([
    1,
    "two",
    true,
  ])
);

console.log(
  inferenceEngine.infer({
    name: "Rahim",
    age: 25,
    active: true,
  })
);

console.log(inferenceEngine.infer(null));
console.log(inferenceEngine.infer(undefined));

console.log(
  inferenceEngine.inferAll([
    1,
    "hello",
    2,
    "world",
  ])
);

console.log(
  inferenceEngine.isAssignable(
    "string",
    "string | number"
  )
);

console.log(
  inferenceEngine.isAssignable(
    "number",
    "string"
  )
);

console.log(inferenceEngine.widen("'active'"));
console.log(inferenceEngine.widen("42"));

console.log(
  inferenceEngine.narrow(
    "hello",
    "typeof string"
  )
);

console.log(
  inferenceEngine.narrow(
    {
      name: "Rahim",
    },
    "in name"
  )
);

console.log(
  inferenceEngine.narrow(
    25,
    "truthiness"
  )
);

console.log(inferenceEngine.getReport());


// --- Invalid Input ---
console.log(
  createTypeInferenceEngine({
    strict: "true",
    inferArrays: true,
  })
);

console.log(inferenceEngine.inferAll("invalid"));

console.log(
  inferenceEngine.narrow(
    42,
    "invalid guard"
  )
);