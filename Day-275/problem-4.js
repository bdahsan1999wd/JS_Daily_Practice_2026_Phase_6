// PROBLEM–04: createGenericClassBuilder()

// Logic: This engine simulates generic classes such as Stack<T>, Queue<T>, Pair<T, U> and KeyValueStore<K, V>.It validates type consistency at runtime and tracks which generic classes have been built.

function createGenericClassBuilder(config) {

  // --- STEP 1: VALIDATE CONFIGURATION ---
  if (
    !config ||
    typeof config !== "object" ||
    typeof config.name !== "string" ||
    config.name.trim() === "" ||
    !Array.isArray(config.typeParams) ||
    config.typeParams.length === 0 ||
    config.typeParams.some(
      (param) =>
        typeof param !== "string" ||
        param.trim() === ""
    ) ||
    !config.constraints ||
    typeof config.constraints !== "object" ||
    Array.isArray(config.constraints)
  ) {
    return "Invalid Input";
  }

  // --- STEP 2: VALIDATE TYPE PARAMETER UNIQUENESS ---
  if (
    new Set(config.typeParams).size !==
    config.typeParams.length
  ) {
    return "Invalid Input";
  }

  // --- STEP 3: VALIDATE CONSTRAINTS ---
  const constraints = { ...config.constraints };

  for (const [param, constraint] of Object.entries(
    constraints
  )) {
    if (
      !config.typeParams.includes(param) ||
      typeof constraint !== "string" ||
      constraint.trim() === ""
    ) {
      return "Invalid Input";
    }
  }

  // --- STEP 4: STORE CONFIGURATION ---
  const typeParams = [...config.typeParams];

  // --- STEP 5: TRACK BUILT CLASSES ---
  const builtClasses = [];

  // --- STEP 6: GET RUNTIME TYPE ---
  function getType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";

    return typeof value;
  }

  // --- STEP 7: VALIDATE CONSTRAINT ---
  function satisfiesConstraint(
    value,
    constraint
  ) {
    if (!constraint) {
      return true;
    }

    // Primitive constraints.
    if (
      ["string", "number", "boolean", "function", "object"].includes(
        constraint
      )
    ) {
      return getType(value) === constraint;
    }

    // Length-based constraint.
    if (constraint.includes("length")) {
      return (
        value !== null &&
        value !== undefined &&
        typeof value.length === "number"
      );
    }

    // Object-like constraint.
    return true;
  }

  // --- STEP 8: GENERIC TYPE CONSISTENCY CHECKER ---
  function checkConsistency(
    expectedType,
    value
  ) {
    if (expectedType === null) {
      return {
        valid: true,
        type: getType(value),
      };
    }

    const actualType = getType(value);

    return {
      valid: actualType === expectedType,
      type: actualType,
    };
  }

  // --- STEP 9: BUILD STACK ---
  function buildStack() {
    const items = [];
    let elementType = null;

    if (!builtClasses.includes("Stack")) {
      builtClasses.push("Stack");
    }

    function push(item) {
      // Infer T from first inserted item.
      if (elementType === null) {
        const possibleConstraint =
          constraints.T;

        if (
          !satisfiesConstraint(
            item,
            possibleConstraint
          )
        ) {
          return `Type Error: Expected ${possibleConstraint}, got ${getType(
            item
          )}`;
        }

        elementType = getType(item);
      }

      const result = checkConsistency(
        elementType,
        item
      );

      if (!result.valid) {
        return `Type Error: Expected ${elementType}, got ${result.type}`;
      }

      items.push(item);

      return [...items];
    }

    function pop() {
      return items.length > 0
        ? items.pop()
        : null;
    }

    function peek() {
      return items.length > 0
        ? items[items.length - 1]
        : null;
    }

    function isEmpty() {
      return items.length === 0;
    }

    function getAll() {
      return [...items];
    }

    function getType() {
      return elementType || "never";
    }

    return {
      push,
      pop,
      peek,
      isEmpty,
      getAll,
      getType,
    };
  }

  // --- STEP 10: BUILD QUEUE ---
  function buildQueue() {
    const items = [];
    let elementType = null;

    if (!builtClasses.includes("Queue")) {
      builtClasses.push("Queue");
    }

    function enqueue(item) {
      if (elementType === null) {
        if (
          !satisfiesConstraint(
            item,
            constraints.T
          )
        ) {
          return `Type Error: Expected ${constraints.T}, got ${getType(
            item
          )}`;
        }

        elementType = getType(item);
      }

      const result = checkConsistency(
        elementType,
        item
      );

      if (!result.valid) {
        return `Type Error: Expected ${elementType}, got ${result.type}`;
      }

      items.push(item);

      return [...items];
    }

    function dequeue() {
      return items.length > 0
        ? items.shift()
        : null;
    }

    function front() {
      return items.length > 0
        ? items[0]
        : null;
    }

    function isEmpty() {
      return items.length === 0;
    }

    function size() {
      return items.length;
    }

    return {
      enqueue,
      dequeue,
      front,
      isEmpty,
      size,
    };
  }

  // --- STEP 11: BUILD PAIR ---
  function buildPair() {
    let first = null;
    let second = null;

    let firstType = null;
    let secondType = null;

    if (!builtClasses.includes("Pair")) {
      builtClasses.push("Pair");
    }

    function setFirst(value) {
      const expected =
        firstType || constraints.T || null;

      if (
        expected &&
        !satisfiesConstraint(value, expected)
      ) {
        return `Type Error: Expected ${expected}, got ${getType(
          value
        )}`;
      }

      if (firstType === null) {
        firstType = getType(value);
      }

      if (getType(value) !== firstType) {
        return `Type Error: Expected ${firstType}, got ${getType(
          value
        )}`;
      }

      first = value;

      return first;
    }

    function setSecond(value) {
      const expected =
        secondType || constraints.U || null;

      if (
        expected &&
        !satisfiesConstraint(value, expected)
      ) {
        return `Type Error: Expected ${expected}, got ${getType(
          value
        )}`;
      }

      if (secondType === null) {
        secondType = getType(value);
      }

      if (getType(value) !== secondType) {
        return `Type Error: Expected ${secondType}, got ${getType(
          value
        )}`;
      }

      second = value;

      return second;
    }

    function getFirst() {
      return first;
    }

    function getSecond() {
      return second;
    }

    function swap() {
      [first, second] = [second, first];
      [firstType, secondType] = [
        secondType,
        firstType,
      ];

      return [first, second];
    }

    function toTuple() {
      return [first, second];
    }

    return {
      setFirst,
      setSecond,
      getFirst,
      getSecond,
      swap,
      toTuple,
    };
  }

  // --- STEP 12: BUILD KEY-VALUE STORE ---
  function buildKeyValueStore() {
    const store = new Map();

    let keyType = null;
    let valueType = null;

    if (!builtClasses.includes("KeyValueStore")) {
      builtClasses.push("KeyValueStore");
    }

    function set(key, value) {
      const expectedKey =
        keyType || constraints.K || null;

      const expectedValue =
        valueType || constraints.V || null;

      if (
        expectedKey &&
        !satisfiesConstraint(
          key,
          expectedKey
        )
      ) {
        return `Type Error: Expected ${expectedKey}, got ${getType(
          key
        )}`;
      }

      if (
        expectedValue &&
        !satisfiesConstraint(
          value,
          expectedValue
        )
      ) {
        return `Type Error: Expected ${expectedValue}, got ${getType(
          value
        )}`;
      }

      if (keyType === null) {
        keyType = getType(key);
      }

      if (valueType === null) {
        valueType = getType(value);
      }

      if (getType(key) !== keyType) {
        return `Type Error: Expected ${keyType}, got ${getType(
          key
        )}`;
      }

      if (getType(value) !== valueType) {
        return `Type Error: Expected ${valueType}, got ${getType(
          value
        )}`;
      }

      store.set(key, value);

      return value;
    }

    function get(key) {
      return store.get(key);
    }

    function has(key) {
      return store.has(key);
    }

    function deleteKey(key) {
      return store.delete(key);
    }

    function entries() {
      return [...store.entries()];
    }

    function size() {
      return store.size;
    }

    return {
      set,
      get,
      has,
      delete: deleteKey,
      entries,
      size,
    };
  }

  // --- STEP 13: GENERATE REPORT ---
  function getReport() {
    return {
      builtClasses: [...builtClasses],
      typeParams: [...typeParams],
      constraints: { ...constraints },
    };
  }

  // --- STEP 14: RETURN CLASS BUILDER API ---
  return {
    buildStack,
    buildQueue,
    buildPair,
    buildKeyValueStore,
    getReport,
  };
}


// --- EXAMPLE USAGE ---
const builder = createGenericClassBuilder({
  name: "DataStructures",
  typeParams: ["T", "U"],
  constraints: {},
});


const stack = builder.buildStack();

console.log(stack.push(1));

console.log(stack.push(2));

console.log(stack.push("hello"));

console.log(stack.pop());

console.log(stack.peek());

console.log(stack.getType());

const pair = builder.buildPair();

console.log(pair.setFirst("Rahim"));

console.log(pair.setSecond(25));

console.log(pair.toTuple());

console.log(pair.swap());

console.log(pair.toTuple());

const store = builder.buildKeyValueStore();

console.log(store.set("name", "Rahim"));

console.log(store.set("age", 25));

console.log(store.get("name"));

console.log(store.entries());

console.log(builder.getReport());