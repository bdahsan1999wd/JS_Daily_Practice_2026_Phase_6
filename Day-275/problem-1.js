// PROBLEM–01: createGenericFunctionEngine()
// Logic: This engine simulates TypeScript generic functions. It automatically infers runtime types from values and arrays, supports tuples, zip, map transformations and keeps usage statistics.

function createGenericFunctionEngine(config) {

  // --- STEP 1: VALIDATE INPUT ---
  if (
    !config ||
    typeof config !== "object" ||
    typeof config.strict !== "boolean" ||
    typeof config.inferTypes !== "boolean"
  ) {
    return "Invalid Input";
  }

  // --- STEP 2: STORE CONFIGURATION ---
  const settings = {
    strict: config.strict,
    inferTypes: config.inferTypes,
  };

  // --- STEP 3: INITIALIZE REPORT DATA ---
  let totalCalls = 0;
  let typeInferences = 0;

  const byFunction = {};

  // --- STEP 4: GET RUNTIME TYPE ---
  function getType(value) {
    if (value === null) return "null";

    if (Array.isArray(value)) {
      return "array";
    }

    return typeof value;
  }

  // --- STEP 5: REGISTER FUNCTION CALL ---
  function trackCall(functionName, inferred = true) {
    totalCalls++;

    byFunction[functionName] =
      (byFunction[functionName] || 0) + 1;

    if (settings.inferTypes && inferred) {
      typeInferences++;
    }
  }

  // --- STEP 6: GENERIC IDENTITY FUNCTION ---
  function identity(value) {
    trackCall("identity");

    return {
      value,
      inferredType: getType(value),
    };
  }

  // --- STEP 7: GENERIC FIRST FUNCTION ---
  function first(arr) {
    if (!Array.isArray(arr)) {
      return "Invalid Input";
    }

    trackCall("first");

    if (arr.length === 0) {
      return {
        value: null,
        inferredType: "never",
      };
    }

    return {
      value: arr[0],
      inferredType: getType(arr[0]),
    };
  }

  // --- STEP 8: GENERIC LAST FUNCTION ---
  function last(arr) {
    if (!Array.isArray(arr)) {
      return "Invalid Input";
    }

    trackCall("last");

    if (arr.length === 0) {
      return {
        value: null,
        inferredType: "never",
      };
    }

    const lastValue = arr[arr.length - 1];

    return {
      value: lastValue,
      inferredType: getType(lastValue),
    };
  }

  // --- STEP 9: GENERIC PAIR FUNCTION ---
  function pair(firstValue, secondValue) {
    trackCall("pair");

    return {
      pair: [firstValue, secondValue],
      types: [
        getType(firstValue),
        getType(secondValue),
      ],
    };
  }

  // --- STEP 10: GENERIC SWAP FUNCTION ---
  function swap(tuple) {
    if (
      !Array.isArray(tuple) ||
      tuple.length !== 2
    ) {
      return "Invalid Input";
    }

    trackCall("swap");

    return {
      pair: [tuple[1], tuple[0]],
      types: [
        getType(tuple[1]),
        getType(tuple[0]),
      ],
    };
  }

  // --- STEP 11: GENERIC ZIP FUNCTION ---
  function zip(arr1, arr2) {
    if (
      !Array.isArray(arr1) ||
      !Array.isArray(arr2)
    ) {
      return "Invalid Input";
    }

    trackCall("zip");

    const length = Math.min(
      arr1.length,
      arr2.length
    );

    const zipped = [];

    for (let i = 0; i < length; i++) {
      zipped.push([arr1[i], arr2[i]]);
    }

    const firstType =
      arr1.length > 0
        ? getType(arr1[0])
        : "never";

    const secondType =
      arr2.length > 0
        ? getType(arr2[0])
        : "never";

    return {
      zipped,
      types: [firstType, secondType],
    };
  }

  // --- STEP 12: GENERIC MAP FUNCTION ---
  function map(arr, fn) {
    if (
      !Array.isArray(arr) ||
      typeof fn !== "function"
    ) {
      return "Invalid Input";
    }

    trackCall("map");

    const result = arr.map(fn);

    const inputType =
      arr.length > 0
        ? getType(arr[0])
        : "never";

    const outputType =
      result.length > 0
        ? getType(result[0])
        : "never";

    return {
      result,
      inputType,
      outputType,
    };
  }

  // --- STEP 13: GENERATE REPORT ---
  function getReport() {
    return {
      totalCalls,
      byFunction: { ...byFunction },
      typeInferences,
    };
  }

  // --- STEP 14: RETURN ENGINE API ---
  return {
    identity,
    first,
    last,
    pair,
    swap,
    zip,
    map,
    getReport,
  };
}


// --- EXAMPLE USAGE ---
const genericFunctionEngine =
  createGenericFunctionEngine({
    strict: true,
    inferTypes: true,
  });


console.log(genericFunctionEngine.identity("hello"));

console.log(genericFunctionEngine.identity(42));

console.log(genericFunctionEngine.first([1, 2, 3]));

console.log(genericFunctionEngine.first([]));

console.log(genericFunctionEngine.pair("Rahim", 25));

console.log(genericFunctionEngine.swap(["hello", 42]));

console.log(
  genericFunctionEngine.zip(
    [1, 2, 3],
    ["a", "b", "c"]
  )
);

console.log(
  genericFunctionEngine.map(
    [1, 2, 3],
    (x) => x.toString()
  )
);

console.log(genericFunctionEngine.getReport());