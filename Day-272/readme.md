# 🎓 JS DAILY PRACTICE – DAY-272

📅 **Goal:** TypeScript Type System Basics Engine
🎯 **Focus:** Type Annotations • Primitive Types • Arrays • Tuples • Type Aliases • Union • Literal Types • Type Inference

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔬 Type Annotation Validator Engine

⚠️ **Function Name:** `createTypeValidator()`

| Input      | `schema` (array of objects) |
| :--------- | :-------------------------- |
| **Output** | object (validator API)      |

**Rules:**

Each schema entry:

- `name` (string) — variable name
- `expectedType` → `"string"` | `"number"` | `"boolean"` | `"null"` | `"undefined"` | `"array"` | `"object"` | `"function"` | `"tuple"`
- `tupleTypes` (array) — only for `"tuple"` type, e.g., `["string", "number", "boolean"]`
- `arrayItemType` (string) — only for `"array"` type, e.g., `"number"`
- `nullable` (boolean) — whether `null` is also acceptable
- `optional` (boolean) — whether `undefined` is also acceptable

**Type Checking Rules:**

- `"number"` → must be finite number (NaN, Infinity fail)
- `"array"` → must be Array, all items match `arrayItemType`
- `"tuple"` → must be Array, exact length, each position matches `tupleTypes`
- `"object"` → must be plain object (not array, not null)

**Validator API (returned object):**

- `validate(data)` → validates `{ name: value }` object against schema
  - Returns `{ valid, errors: { name: [messages] }, passedCount, failedCount }`
- `validateSingle(name, value)` → validates one field
  - Returns `{ valid, type: detectedType, expectedType, errors }`
- `infer(value)` → infers TypeScript-style type string from a value:
  - `42` → `"number"`, `"hello"` → `"string"`, `[1,2,3]` → `"number[]"`, `[1,"a",true]` → `"[number, string, boolean]"`
- `getSchema()` → returns current schema
- `getReport()` → returns `{ totalFields, nullable: count, optional: count, tupleFields, arrayFields }`

| Challenge 📢 | Return validator API. If schema invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const validator = createTypeValidator([`
  `{ name: "id", expectedType: "number", nullable: false, optional: false },`
  `{ name: "name", expectedType: "string", nullable: false, optional: false },`
  `{ name: "tags", expectedType: "array", arrayItemType: "string", nullable: false, optional: true },`
  `{ name: "coords", expectedType: "tuple", tupleTypes: ["number", "number"], nullable: false, optional: false }`
  `])`
- `validator.validate({ id: 1, name: "Rahim", tags: ["js", "ts"], coords: [23.8, 90.4] })` ➔
  `{ valid: true, errors: {}, passedCount: 4, failedCount: 0 }`
- `validator.validate({ id: "one", name: "Rahim", tags: [1, 2], coords: [23.8, 90.4, 0] })` ➔
  `{ valid: false, errors: { id: ["Expected number, got string"], tags: ["Array items must be string, got number at index 0"], coords: ["Tuple length mismatch: expected 2, got 3"] }, passedCount: 1, failedCount: 3 }`
- `validator.infer([1, "hello", true])` ➔ `"[number, string, boolean]"`
- `validator.infer([1, 2, 3])` ➔ `"number[]"`
- `validator.getReport()` ➔ `{ totalFields: 4, nullable: 0, optional: 1, tupleFields: 1, arrayFields: 1 }`

---

## 🧩 PROBLEM–02: 🏷️ Type Alias & Union Type Engine

⚠️ **Function Name:** `createTypeAliasEngine()`

| Input      | `definitions` (array of objects) |
| :--------- | :------------------------------- |
| **Output** | object (alias engine API)        |

**Rules:**

Each definition object:

- `alias` (string) — type alias name (e.g., `"UserId"`, `"Status"`)
- `kind` → `"alias"` | `"union"` | `"intersection"` | `"literal"`
- `base` (string) — base type for `"alias"` (e.g., `"string"`)
- `members` (array) — for `"union"` or `"intersection"`: list of type names or literal values
- `literals` (array) — for `"literal"`: allowed exact values

**Type Alias Engine API (returned object):**

- `check(alias, value)` → checks if value satisfies the type alias
  - Returns `{ valid, alias, value, reason }`
- `resolve(alias)` → returns full type definition string:
  - `"UserId"` → `"string"`
  - `"Status"` → `"'active' | 'inactive' | 'pending'"`
  - `"AdminUser"` → `"User & Admin"`
- `narrow(value, aliases[])` → returns which alias the value satisfies
- `compose(name, kind, members[])` → creates new type alias dynamically
- `getAliases()` → returns all registered type alias names
- `getReport()` → returns `{ totalAliases, byKind, mostUsed }`

| Challenge 📢 | Return alias engine API. If definitions invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------ |

**Sample Input & Output:**

- `const engine = createTypeAliasEngine([`
  `{ alias: "UserId", kind: "alias", base: "string", members: [], literals: [] },`
  `{ alias: "Status", kind: "literal", base: "string", members: [], literals: ["active", "inactive", "pending"] },`
  `{ alias: "StringOrNumber", kind: "union", base: "", members: ["string", "number"], literals: [] },`
  `{ alias: "NumericId", kind: "alias", base: "number", members: [], literals: [] }`
  `])`
- `engine.check("UserId", "U001")` ➔ `{ valid: true, alias: "UserId", value: "U001", reason: null }`
- `engine.check("Status", "deleted")` ➔ `{ valid: false, alias: "Status", value: "deleted", reason: "Value must be one of: active, inactive, pending" }`
- `engine.check("StringOrNumber", 42)` ➔ `{ valid: true, alias: "StringOrNumber", value: 42, reason: null }`
- `engine.resolve("Status")` ➔ `"'active' | 'inactive' | 'pending'"`
- `engine.resolve("StringOrNumber")` ➔ `"string | number"`
- `engine.narrow("hello", ["UserId", "NumericId", "StringOrNumber"])` ➔ `["UserId", "StringOrNumber"]`
- `engine.getReport()` ➔ `{ totalAliases: 4, byKind: { alias: 2, literal: 1, union: 1 }, mostUsed: "StringOrNumber" }`

---

## 🧩 PROBLEM–03: 📐 Tuple Type System Engine

⚠️ **Function Name:** `createTupleEngine()`

| Input      | `tupleSchemas` (array of objects) |
| :--------- | :-------------------------------- |
| **Output** | object (tuple API)                |

**Rules:**

Each tuple schema:

- `name` (string) — tuple name (e.g., `"Point2D"`, `"RGB"`, `"NameAge"`)
- `types` (array of strings) — type at each position
- `labels` (array of strings) — optional label for each position
- `rest` (string or `null`) — rest element type for trailing elements (e.g., `"string"`)

**Tuple Engine API (returned object):**

- `validate(name, value)` → validates array against tuple schema
  - Returns `{ valid, errors, namedElements }`
  - `namedElements` → `{ label: value }` using `labels`
- `create(name, values[])` → creates validated tuple
  - Returns validated tuple array or `"Invalid Input"`
- `destructure(name, tuple)` → returns `{ label: value }` object
- `spread(name, tuple, extras[])` → extends tuple with rest elements (if `rest` defined)
- `compare(name, tuple1, tuple2)` → returns `{ equal, differences }`
- `getTupleInfo(name)` → returns schema info with TypeScript-style type string
- `getReport()` → returns `{ totalSchemas, withRest, withLabels, avgLength }`

| Challenge 📢 | Return tuple API. If schemas invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createTupleEngine([`
  `{ name: "Point2D", types: ["number", "number"], labels: ["x", "y"], rest: null },`
  `{ name: "RGB", types: ["number", "number", "number"], labels: ["r", "g", "b"], rest: null },`
  `{ name: "NameAgeTags", types: ["string", "number"], labels: ["name", "age"], rest: "string" }`
  `])`
- `engine.validate("Point2D", [10, 20])` ➔ `{ valid: true, errors: [], namedElements: { x: 10, y: 20 } }`
- `engine.validate("RGB", [255, "128", 0])` ➔ `{ valid: false, errors: ["Position 1 (g): expected number, got string"], namedElements: null }`
- `engine.create("Point2D", [5, 15])` ➔ `[5, 15]`
- `engine.destructure("RGB", [255, 128, 0])` ➔ `{ r: 255, g: 128, b: 0 }`
- `engine.spread("NameAgeTags", ["Rahim", 25], ["js", "ts", "node"])` ➔ `["Rahim", 25, "js", "ts", "node"]`
- `engine.getTupleInfo("NameAgeTags")` ➔ `{ name: "NameAgeTags", typeString: "[string, number, ...string[]]", labels: ["name", "age"], hasRest: true }`
- `engine.getReport()` ➔ `{ totalSchemas: 3, withRest: 1, withLabels: 3, avgLength: 2.67 }`

---

## 🧩 PROBLEM–04: 🔄 Type Inference Engine

⚠️ **Function Name:** `createTypeInferenceEngine()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (inference API) |

**Rules:**

`config` object:

- `strict` (boolean) — if true, `null` and `undefined` are separate types
- `inferArrays` (boolean) — if true, infer array element types

**Type Inference Engine API (returned object):**

- `infer(value)` → infers TypeScript type string:
  - Primitives: `"string"`, `"number"`, `"boolean"`, `"null"`, `"undefined"`, `"symbol"`
  - Arrays: `"string[]"`, `"number[]"`, `"(string | number)[]"`, `"never[]"` (empty)
  - Tuples: `"[string, number, boolean]"` (mixed arrays inferred as tuple)
  - Objects: `"{ key: type; key2: type2 }"` (shallow)
  - Functions: `"() => unknown"`
  - `null` → `"null"` (strict) or `"any"` (non-strict)
- `inferAll(values[])` → infers and finds common/union type across values
  - Returns `{ types, commonType, unionType }`
- `isAssignable(sourceType, targetType)` → checks if source is assignable to target
  - e.g., `"string"` assignable to `"string | number"` → true
  - `"number"` assignable to `"string"` → false
- `widen(type)` → widens literal to base type:
  - `"'active'"` → `"string"`, `"42"` → `"number"`
- `narrow(value, typeGuard)` → simulates type narrowing:
  - `typeGuard` → `"typeof string"` | `"instanceof ClassName"` | `"in key"` | `"truthiness"`
- `getReport()` → returns `{ totalInferred, uniqueTypes, mostCommonType }`

| Challenge 📢 | Return inference API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createTypeInferenceEngine({ strict: true, inferArrays: true })`
- `engine.infer(42)` ➔ `"number"`
- `engine.infer("hello")` ➔ `"string"`
- `engine.infer([1, 2, 3])` ➔ `"number[]"`
- `engine.infer([1, "two", true])` ➔ `"[number, string, boolean]"`
- `engine.infer({ name: "Rahim", age: 25, active: true })` ➔ `"{ name: string; age: number; active: boolean }"`
- `engine.infer(null)` ➔ `"null"` _(strict mode)_
- `engine.inferAll([1, "hello", 2, "world"])` ➔ `{ types: ["number", "string"], commonType: null, unionType: "number | string" }`
- `engine.isAssignable("string", "string | number")` ➔ `true`
- `engine.isAssignable("number", "string")` ➔ `false`
- `engine.widen("'active'")` ➔ `"string"`
- `engine.getReport()` ➔ `{ totalInferred: 7, uniqueTypes: 5, mostCommonType: "number" }`

---

## 🧩 PROBLEM–05: 🏗️ TypeScript Type Definition Builder

⚠️ **Function Name:** `createTypeDefinitionBuilder()`

| Input      | `config` (object)           |
| :--------- | :-------------------------- |
| **Output** | object (definition builder) |

**Rules:**

`config` object:

- `moduleName` (string) — module name for generated types
- `strict` (boolean) — enable strict null checks
- `exportAll` (boolean) — whether all types are exported

**Type Definition Builder API (returned object):**

- `defineType(name, properties)` → creates type alias definition
  - `properties`: array of `{ name, type, optional, readonly }`
- `defineInterface(name, properties, extends[])` → creates interface
- `defineEnum(name, members)` → creates enum:
  - `members`: array of `{ key, value }` (value can be string or number)
- `defineUnion(name, types[])` → creates union type
- `generate()` → generates TypeScript declaration string
- `validate(typeName, value)` → validates value against defined type
- `getDefinitions()` → returns all type definitions
- `getReport()` → returns `{ types, interfaces, enums, unions, totalDefinitions }`

| Challenge 📢 | Return builder API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const builder = createTypeDefinitionBuilder({ moduleName: "AppTypes", strict: true, exportAll: true })`
- `builder.defineEnum("Status", [{ key: "Active", value: "active" }, { key: "Inactive", value: "inactive" }, { key: "Pending", value: "pending" }])`
- `builder.defineInterface("User", [`
  `{ name: "id", type: "number", optional: false, readonly: true },`
  `{ name: "name", type: "string", optional: false, readonly: false },`
  `{ name: "email", type: "string", optional: true, readonly: false },`
  `{ name: "status", type: "Status", optional: false, readonly: false }`
  `], [])`
- `builder.defineUnion("StringOrNumber", ["string", "number"])`
- `builder.generate()` ➔
  `"export enum Status { Active = 'active', Inactive = 'inactive', Pending = 'pending' }\n\nexport interface User { readonly id: number; name: string; email?: string; status: Status; }\n\nexport type StringOrNumber = string | number;"`
- `builder.validate("User", { id: 1, name: "Rahim", status: "active" })` ➔ `{ valid: true, errors: {} }`
- `builder.validate("User", { id: "one", name: "Rahim", status: "deleted" })` ➔
  `{ valid: false, errors: { id: "Expected number, got string", status: "Invalid Status value: deleted" } }`
- `builder.getReport()` ➔ `{ types: 0, interfaces: 1, enums: 1, unions: 1, totalDefinitions: 3 }`

---
