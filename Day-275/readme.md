# 🎓 JS DAILY PRACTICE – DAY-275

📅 **Goal:** TypeScript Generics & Generic Programming Engine
🎯 **Focus:** Generic Functions • Generic Interfaces • Generic Classes • Generic Constraints • keyof • typeof • Conditional Types

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🧰 Generic Function Engine

⚠️ **Function Name:** `createGenericFunctionEngine()`

| Input      | `config` (object)           |
| :--------- | :-------------------------- |
| **Output** | object (generic fn API)     |

**Rules:**

`config` object:

- `strict` (boolean) — strict type checking
- `inferTypes` (boolean) — auto-infer type parameters from arguments

**Generic Function Engine API (returned object):**

- `identity(value)` → returns value as-is, infers type `T`
  - Returns `{ value, inferredType }`
- `first(arr)` → returns first element of array, infers `T` from `T[]`
  - Returns `{ value, inferredType }` or `{ value: null, inferredType: "never" }` if empty
- `last(arr)` → returns last element
- `pair(first, second)` → creates tuple `[T, U]` from two different types
  - Returns `{ pair, types: [typeT, typeU] }`
- `swap(pair)` → swaps tuple `[T, U]` → `[U, T]`
- `zip(arr1, arr2)` → zips two arrays into `[T, U][]`
  - Returns `{ zipped, types }`
- `map(arr, fn)` → maps `T[]` → `U[]`, tracks type transformation
  - Returns `{ result, inputType, outputType }`
- `getReport()` → returns `{ totalCalls, byFunction, typeInferences }`

| Challenge 📢 | Return generic fn API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createGenericFunctionEngine({ strict: true, inferTypes: true })`
- `engine.identity("hello")` ➔ `{ value: "hello", inferredType: "string" }`
- `engine.identity(42)` ➔ `{ value: 42, inferredType: "number" }`
- `engine.first([1, 2, 3])` ➔ `{ value: 1, inferredType: "number" }`
- `engine.first([])` ➔ `{ value: null, inferredType: "never" }`
- `engine.pair("Rahim", 25)` ➔ `{ pair: ["Rahim", 25], types: ["string", "number"] }`
- `engine.swap(["hello", 42])` ➔ `{ pair: [42, "hello"], types: ["number", "string"] }`
- `engine.zip([1, 2, 3], ["a", "b", "c"])` ➔ `{ zipped: [[1, "a"], [2, "b"], [3, "c"]], types: ["number", "string"] }`
- `engine.map([1, 2, 3], x => x.toString())` ➔ `{ result: ["1", "2", "3"], inputType: "number", outputType: "string" }`
- `engine.getReport()` ➔ `{ totalCalls: 8, byFunction: { identity: 2, first: 2, pair: 1, swap: 1, zip: 1, map: 1 }, typeInferences: 8 }`

---

## 🧩 PROBLEM–02: 🏗️ Generic Interface & Repository Engine

⚠️ **Function Name:** `createGenericRepository()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (repository API)    |

**Rules:**

`config` object:

- `entityName` (string) — e.g., `"User"`, `"Product"`
- `idField` (string) — name of the ID field (e.g., `"id"`)
- `idType` → `"number"` | `"string"` | `"uuid"`
- `schema` (object) — `{ fieldName: type }` for validation

**Generic Repository `Repository<T>` API (returned object):**

- `create(data)` → validates against schema, auto-generates ID, stores entity
  - Returns `{ entity, id }`
- `findById(id)` → returns entity or `null`
- `findAll(filter)` → returns all entities matching filter criteria
  - `filter`: `{ field, operator, value }` — `operator` → `"="` | `">"` | `"<"` | `"contains"`
- `update(id, partial)` → updates specific fields, validates types
  - Returns `{ updated, entity }`
- `delete(id)` → removes entity → returns `{ deleted, id }`
- `count(filter)` → returns count matching filter
- `paginate(page, pageSize, filter)` → returns `{ data, page, pageSize, total, totalPages }`
- `getStats()` → returns `{ entityName, total, idType, schemaFields }`

| Challenge 📢 | Return repository API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------- |

**Sample Input & Output:**

- `const userRepo = createGenericRepository({ entityName: "User", idField: "id", idType: "number", schema: { name: "string", email: "string", age: "number", active: "boolean" } })`
- `userRepo.create({ name: "Rahim", email: "rahim@mail.com", age: 25, active: true })` ➔
  `{ entity: { id: 1, name: "Rahim", email: "rahim@mail.com", age: 25, active: true }, id: 1 }`
- `userRepo.create({ name: "Karim", email: "karim@mail.com", age: 30, active: false })` ➔
  `{ entity: { id: 2, name: "Karim", email: "karim@mail.com", age: 30, active: false }, id: 2 }`
- `userRepo.findById(1)` ➔ `{ id: 1, name: "Rahim", email: "rahim@mail.com", age: 25, active: true }`
- `userRepo.findAll({ field: "active", operator: "=", value: true })` ➔ `[{ id: 1, name: "Rahim", ... }]`
- `userRepo.update(1, { age: 26 })` ➔ `{ updated: true, entity: { id: 1, name: "Rahim", email: "rahim@mail.com", age: 26, active: true } }`
- `userRepo.paginate(1, 1, null)` ➔ `{ data: [{ id: 1, ... }], page: 1, pageSize: 1, total: 2, totalPages: 2 }`
- `userRepo.getStats()` ➔ `{ entityName: "User", total: 2, idType: "number", schemaFields: ["name", "email", "age", "active"] }`

---

## 🧩 PROBLEM–03: 🔒 Generic Constraint Engine

⚠️ **Function Name:** `createConstraintEngine()`

| Input      | `constraints` (array of objects) |
| :--------- | :------------------------------- |
| **Output** | object (constraint API)          |

**Rules:**

Each constraint object:

- `name` (string) — constraint name
- `kind` → `"extends"` | `"keyof"` | `"conditional"` | `"mapped"`
- `base` (string) — base type being constrained
- `condition` (string or `null`) — condition for conditional types
- `properties` (array of strings) — for `"keyof"` constraints

**Constraint Engine API (returned object):**

- `checkExtends(value, constraintName)` → checks if value satisfies `T extends Constraint`
  - Returns `{ valid, reason }`
- `keyof(typeName, obj)` → simulates `keyof T` — returns all valid keys of object type
  - Returns `{ keys, typeString }`
- `conditionalType(value, condition, trueType, falseType)` → simulates `T extends U ? X : Y`
  - Returns `{ resolvedType, conditionMet }`
- `mappedType(obj, transform)` → simulates mapped type `{ [K in keyof T]: NewType }`
  - `transform` → `"optional"` | `"readonly"` | `"nullable"` | `"array"`
  - Returns `{ mappedType, typeString }`
- `constrainedIdentity(value, constraintName)` → like identity but enforces constraint
  - Returns `{ value, valid, constraintApplied }` or error if constraint fails
- `getReport()` → returns `{ totalConstraints, byKind, validChecks, invalidChecks }`

| Challenge 📢 | Return constraint engine API. If constraints invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createConstraintEngine([`
  `{ name: "Lengthwise", kind: "extends", base: "{ length: number }", condition: null, properties: [] },`
  `{ name: "Stringable", kind: "extends", base: "{ toString: function }", condition: null, properties: [] }`
  `])`
- `engine.checkExtends("hello", "Lengthwise")` ➔ `{ valid: true, reason: "string has .length property" }`
- `engine.checkExtends(42, "Lengthwise")` ➔ `{ valid: false, reason: "number does not have .length property" }`
- `engine.keyof("User", { id: 1, name: "Rahim", email: "r@mail.com" })` ➔
  `{ keys: ["id", "name", "email"], typeString: "keyof User = 'id' | 'name' | 'email'" }`
- `engine.conditionalType("hello", "extends string", "StringType", "OtherType")` ➔
  `{ resolvedType: "StringType", conditionMet: true }`
- `engine.conditionalType(42, "extends string", "StringType", "OtherType")` ➔
  `{ resolvedType: "OtherType", conditionMet: false }`
- `engine.mappedType({ name: "string", age: "number", active: "boolean" }, "optional")` ➔
  `{ mappedType: { name: "string?", age: "number?", active: "boolean?" }, typeString: "{ name?: string; age?: number; active?: boolean }" }`
- `engine.mappedType({ name: "string", age: "number" }, "nullable")` ➔
  `{ mappedType: { name: "string | null", age: "number | null" }, typeString: "{ name: string | null; age: number | null }" }`
- `engine.getReport()` ➔ `{ totalConstraints: 2, byKind: { extends: 2 }, validChecks: 3, invalidChecks: 1 }`

---

## 🧩 PROBLEM–04: 🏭 Generic Class Builder Engine

⚠️ **Function Name:** `createGenericClassBuilder()`

| Input      | `config` (object)           |
| :--------- | :-------------------------- |
| **Output** | object (class builder API)  |

**Rules:**

`config` object:

- `name` (string) — class name
- `typeParams` (array of strings) — type parameter names (e.g., `["T", "U"]`)
- `constraints` (object) — `{ T: "string", U: "number" }` — constraints per type param

**Generic Class Builder API (returned object):**

- `buildStack()` → creates generic `Stack<T>` class instance:
  - `push(item)` → adds to stack, validates type consistency
  - `pop()` → removes and returns top item
  - `peek()` → returns top without removing
  - `isEmpty()` → returns boolean
  - `getAll()` → returns all items
  - `getType()` → returns inferred element type
- `buildQueue()` → creates generic `Queue<T>` class instance:
  - `enqueue(item)`, `dequeue()`, `front()`, `isEmpty()`, `size()`
- `buildPair()` → creates generic `Pair<T, U>` class instance:
  - `setFirst(val)`, `setSecond(val)`, `getFirst()`, `getSecond()`, `swap()`, `toTuple()`
- `buildKeyValueStore()` → creates generic `KeyValueStore<K, V>` class instance:
  - `set(key, value)`, `get(key)`, `has(key)`, `delete(key)`, `entries()`, `size()`
- `getReport()` → returns `{ builtClasses, typeParams, constraints }`

| Challenge 📢 | Return class builder API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------- |

**Sample Input & Output:**

- `const builder = createGenericClassBuilder({ name: "DataStructures", typeParams: ["T", "U"], constraints: {} })`
- `const stack = builder.buildStack()`
- `stack.push(1)` ➔ `[1]`
- `stack.push(2)` ➔ `[1, 2]`
- `stack.push("hello")` ➔ `"Type Error: Expected number, got string"` *(type consistency)*
- `stack.pop()` ➔ `2`
- `stack.peek()` ➔ `1`
- `stack.getType()` ➔ `"number"`
- `const pair = builder.buildPair()`
- `pair.setFirst("Rahim")`
- `pair.setSecond(25)`
- `pair.toTuple()` ➔ `["Rahim", 25]`
- `pair.swap()`
- `pair.toTuple()` ➔ `[25, "Rahim"]`
- `const store = builder.buildKeyValueStore()`
- `store.set("name", "Rahim")`
- `store.set("age", 25)`
- `store.get("name")` ➔ `"Rahim"`
- `store.entries()` ➔ `[["name", "Rahim"], ["age", 25]]`
- `builder.getReport()` ➔ `{ builtClasses: ["Stack", "Pair", "KeyValueStore"], typeParams: ["T", "U"], constraints: {} }`

---

## 🧩 PROBLEM–05: 🔄 Generic Pipeline & Transformer Engine

⚠️ **Function Name:** `createGenericPipeline()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (pipeline API)      |

**Rules:**

`config` object:

- `name` (string)
- `strict` (boolean) — enforce type consistency between pipeline steps
- `errorHandling` → `"throw"` | `"skip"` | `"default"`

**Generic Pipeline `Pipeline<T, U>` API (returned object):**

- `pipe(stepName, fn)` → adds transformation step `T → U`
  - Each step's output type becomes next step's input type
  - Tracks type flow: `T → A → B → U`
- `filter(stepName, predicate)` → adds filter step (keeps items where predicate is true)
- `reduce(stepName, fn, initial)` → adds reduce step `T[] → U`
- `branch(condition, truePipe, falsePipe)` → conditional branching
- `run(input)` → executes pipeline with given input
  - Returns `{ output, typeFlow, steps, executionLog }`
- `runAll(inputs[])` → runs pipeline for each input
  - Returns `{ results, successCount, failCount }`
- `getTypeFlow()` → returns type transformation chain as string
- `getReport()` → returns `{ pipelineName, totalSteps, typeFlow, executionsRun }`

| Challenge 📢 | Return pipeline API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const pipeline = createGenericPipeline({ name: "DataPipeline", strict: true, errorHandling: "skip" })`
- `pipeline.pipe("parse", (x) => parseInt(x))`
- `pipeline.pipe("double", (x) => x * 2)`
- `pipeline.filter("positiveOnly", (x) => x > 0)`
- `pipeline.pipe("stringify", (x) => x.toString())`
- `pipeline.run("21")` ➔
  `{`
  `output: "42",`
  `typeFlow: ["string", "number", "number", "number", "string"],`
  `steps: ["parse", "double", "positiveOnly", "stringify"],`
  `executionLog: [`
  `{ step: "parse", input: "21", output: 21 },`
  `{ step: "double", input: 21, output: 42 },`
  `{ step: "positiveOnly", input: 42, output: 42, filtered: false },`
  `{ step: "stringify", input: 42, output: "42" }`
  `]`
  `}`
- `pipeline.runAll(["5", "-3", "10"])` ➔
  `{ results: ["10", null, "20"], successCount: 2, failCount: 1 }` *(-3 filtered)*
- `pipeline.getTypeFlow()` ➔ `"string → number → number → number → string"`
- `pipeline.getReport()` ➔ `{ pipelineName: "DataPipeline", totalSteps: 4, typeFlow: "string → number → number → number → string", executionsRun: 4 }`

---