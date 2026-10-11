// PROBLEM–02: createGenericRepository()

// Logic: This engine simulates a generic Repository<T>. It validates entities against a schema, automatically generates IDs, supports CRUD operations, filtering and pagination.

function createGenericRepository(config) {

  // --- STEP 1: VALIDATE CONFIGURATION ---
  if (
    !config ||
    typeof config !== "object" ||
    typeof config.entityName !== "string" ||
    config.entityName.trim() === "" ||
    typeof config.idField !== "string" ||
    config.idField.trim() === "" ||
    !["number", "string", "uuid"].includes(
      config.idType
    ) ||
    !config.schema ||
    typeof config.schema !== "object" ||
    Array.isArray(config.schema)
  ) {
    return "Invalid Input";
  }

  // --- STEP 2: VALIDATE SCHEMA ---
  const schemaEntries = Object.entries(
    config.schema
  );

  if (
    schemaEntries.length === 0 ||
    schemaEntries.some(
      ([field, type]) =>
        typeof field !== "string" ||
        field.trim() === "" ||
        typeof type !== "string" ||
        type.trim() === ""
    )
  ) {
    return "Invalid Input";
  }

  // --- STEP 3: STORE CONFIGURATION ---
  const entityName = config.entityName;
  const idField = config.idField;
  const idType = config.idType;
  const schema = { ...config.schema };

  // --- STEP 4: INTERNAL STORAGE ---
  const entities = new Map();

  let numericId = 1;

  // --- STEP 5: GET RUNTIME TYPE ---
  function getType(value) {
    if (value === null) return "null";

    if (Array.isArray(value)) {
      return "array";
    }

    return typeof value;
  }

  // --- STEP 6: GENERATE UUID ---
  function generateUUID() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      (char) => {
        const random =
          Math.random() * 16 | 0;

        const value =
          char === "x"
            ? random
            : (random & 0x3) | 0x8;

        return value.toString(16);
      }
    );
  }

  // --- STEP 7: GENERATE ID ---
  function generateId() {
    if (idType === "number") {
      return numericId++;
    }

    if (idType === "string") {
      return String(numericId++);
    }

    return generateUUID();
  }

  // --- STEP 8: VALIDATE ENTITY ---
  function validateEntity(data, partial = false) {
    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return {
        valid: false,
        errors: {
          _root: "Entity must be an object",
        },
      };
    }

    const errors = {};

    Object.entries(schema).forEach(
      ([field, expectedType]) => {
        // During create(), every schema field is required.
        if (!partial && !(field in data)) {
          errors[field] = "Required field missing";
          return;
        }

        // During update(), missing fields are allowed.
        if (partial && !(field in data)) {
          return;
        }

        if (
          getType(data[field]) !== expectedType
        ) {
          errors[field] =
            `Expected ${expectedType}, got ${getType(
              data[field]
            )}`;
        }
      }
    );

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // --- STEP 9: CREATE ENTITY ---
  function create(data) {
    const validation = validateEntity(
      data,
      false
    );

    if (!validation.valid) {
      return {
        entity: null,
        id: null,
        errors: validation.errors,
      };
    }

    const id = generateId();

    const entity = {
      [idField]: id,
      ...data,
    };

    entities.set(id, entity);

    return {
      entity: { ...entity },
      id,
    };
  }

  // --- STEP 10: FIND BY ID ---
  function findById(id) {
    if (!entities.has(id)) {
      return null;
    }

    return {
      ...entities.get(id),
    };
  }

  // --- STEP 11: FILTER MATCHING ---
  function matchesFilter(entity, filter) {
    if (filter === null) {
      return true;
    }

    if (
      !filter ||
      typeof filter !== "object" ||
      typeof filter.field !== "string" ||
      !["=", ">", "<", "contains"].includes(
        filter.operator
      )
    ) {
      return false;
    }

    const actual = entity[filter.field];
    const expected = filter.value;

    switch (filter.operator) {
      case "=":
        return actual === expected;

      case ">":
        return actual > expected;

      case "<":
        return actual < expected;

      case "contains":
        return (
          typeof actual === "string" &&
          actual.includes(String(expected))
        );

      default:
        return false;
    }
  }

  // --- STEP 12: FIND ALL ---
  function findAll(filter = null) {
    if (
      filter !== null &&
      (!filter || typeof filter !== "object")
    ) {
      return "Invalid Input";
    }

    return [...entities.values()]
      .filter((entity) =>
        matchesFilter(entity, filter)
      )
      .map((entity) => ({ ...entity }));
  }

  // --- STEP 13: UPDATE ENTITY ---
  function update(id, partial) {
    if (
      !entities.has(id) ||
      !partial ||
      typeof partial !== "object" ||
      Array.isArray(partial)
    ) {
      return {
        updated: false,
        entity: null,
      };
    }

    // ID field must never be changed.
    if (idField in partial) {
      return {
        updated: false,
        entity: { ...entities.get(id) },
      };
    }

    const validation = validateEntity(
      partial,
      true
    );

    if (!validation.valid) {
      return {
        updated: false,
        entity: { ...entities.get(id) },
        errors: validation.errors,
      };
    }

    const updatedEntity = {
      ...entities.get(id),
      ...partial,
    };

    entities.set(id, updatedEntity);

    return {
      updated: true,
      entity: { ...updatedEntity },
    };
  }

  // --- STEP 14: DELETE ENTITY ---
  function deleteEntity(id) {
    const deleted = entities.delete(id);

    return {
      deleted,
      id,
    };
  }

  // --- STEP 15: COUNT ---
  function count(filter = null) {
    return findAll(filter).length;
  }

  // --- STEP 16: PAGINATE ---
  function paginate(
    page,
    pageSize,
    filter = null
  ) {
    if (
      !Number.isInteger(page) ||
      !Number.isInteger(pageSize) ||
      page < 1 ||
      pageSize < 1
    ) {
      return "Invalid Input";
    }

    const filtered = findAll(filter);

    if (typeof filtered === "string") {
      return "Invalid Input";
    }

    const total = filtered.length;

    const totalPages =
      Math.ceil(total / pageSize);

    const start =
      (page - 1) * pageSize;

    const data = filtered.slice(
      start,
      start + pageSize
    );

    return {
      data,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  // --- STEP 17: GET REPOSITORY STATS ---
  function getStats() {
    return {
      entityName,
      total: entities.size,
      idType,
      schemaFields: Object.keys(schema),
    };
  }

  // --- STEP 18: RETURN REPOSITORY API ---
  return {
    create,
    findById,
    findAll,
    update,
    delete: deleteEntity,
    count,
    paginate,
    getStats,
  };
}


// --- EXAMPLE USAGE ---
const userRepo = createGenericRepository({
  entityName: "User",
  idField: "id",
  idType: "number",
  schema: {
    name: "string",
    email: "string",
    age: "number",
    active: "boolean",
  },
});


console.log(
  userRepo.create({
    name: "Rahim",
    email: "rahim@mail.com",
    age: 25,
    active: true,
  })
);

console.log(
  userRepo.create({
    name: "Karim",
    email: "karim@mail.com",
    age: 30,
    active: false,
  })
);

console.log(userRepo.findById(1));

console.log(
  userRepo.findAll({
    field: "active",
    operator: "=",
    value: true,
  })
);

console.log(
  userRepo.update(1, {
    age: 26,
  })
);

console.log(userRepo.paginate(1, 1, null));

console.log(userRepo.getStats());