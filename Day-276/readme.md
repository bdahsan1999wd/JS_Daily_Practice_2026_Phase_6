# 🎓 JS DAILY PRACTICE – DAY-276

📅 **Goal:** TypeScript Utility Types Engine
🎯 **Focus:** Partial • Required • Pick • Omit • Record • Readonly • ReturnType • Parameters • Awaited • NonNullable

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔧 Core Utility Types Simulator

⚠️ **Function Name:** `createUtilityTypeSimulator()`

| Input      | `types` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object (utility API)       |

**Rules:**

Each type object:

- `name` (string)
- `properties` (object) — `{ propName: { type, optional, readonly } }`

**Utility Type Simulator API (returned object):**

- `Partial(typeName)` → makes all properties optional
  - Returns `{ name: "Partial<T>", properties, typeString }`
- `Required(typeName)` → makes all properties required
  - Returns `{ name: "Required<T>", properties, typeString }`
- `Readonly(typeName)` → makes all properties readonly
  - Returns `{ name: "Readonly<T>", properties, typeString }`
- `Pick(typeName, keys[])` → keeps only specified keys
  - Returns `{ name: "Pick<T, K>", properties, typeString }`
- `Omit(typeName, keys[])` → removes specified keys
  - Returns `{ name: "Omit<T, K>", properties, typeString }`
- `Record(keyType, valueType)` → creates record type
  - Returns `{ name: "Record<K, V>", keyType, valueType, typeString }`
- `validate(utilityResult, value)` → validates value against utility type result
  - Returns `{ valid, errors }`
- `getReport()` → returns `{ totalTypes, utilityApplications, byUtility }`

| Challenge 📢 | Return utility simulator API. If types invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------- |

**Sample Input & Output:**

- `const sim = createUtilityTypeSimulator([`
  `{ name: "User", properties: {`
  `id: { type: "number", optional: false, readonly: true },`
  `name: { type: "string", optional: false, readonly: false },`
  `email: { type: "string", optional: true, readonly: false },`
  `age: { type: "number", optional: false, readonly: false }`
  `} }`
  `])`
- `sim.Partial("User")` ➔
  `{ name: "Partial<User>", properties: { id: { type: "number", optional: true }, name: { type: "string", optional: true }, email: { type: "string", optional: true }, age: { type: "number", optional: true } }, typeString: "Partial<User>" }`
- `sim.Required("User")` ➔
  `{ name: "Required<User>", properties: { id: { type: "number", optional: false }, name: { type: "string", optional: false }, email: { type: "string", optional: false }, age: { type: "number", optional: false } }, typeString: "Required<User>" }`
- `sim.Pick("User", ["id", "name"])` ➔
  `{ name: "Pick<User, 'id' | 'name'>", properties: { id: { type: "number", optional: false, readonly: true }, name: { type: "string", optional: false, readonly: false } }, typeString: "Pick<User, 'id' | 'name'>" }`
- `sim.Omit("User", ["email", "age"])` ➔
  `{ name: "Omit<User, 'email' | 'age'>", properties: { id: { type: "number", optional: false, readonly: true }, name: { type: "string", optional: false, readonly: false } }, typeString: "Omit<User, 'email' | 'age'>" }`
- `sim.Record("string", "number")` ➔
  `{ name: "Record<string, number>", keyType: "string", valueType: "number", typeString: "Record<string, number>" }`
- `sim.validate(sim.Pick("User", ["id", "name"]), { id: 1, name: "Rahim" })` ➔ `{ valid: true, errors: {} }`
- `sim.getReport()` ➔ `{ totalTypes: 1, utilityApplications: 5, byUtility: { Partial: 1, Required: 1, Pick: 1, Omit: 1, Record: 1 } }`

---

## 🧩 PROBLEM–02: 🔍 Function Utility Types Engine

⚠️ **Function Name:** `createFunctionUtilityEngine()`

| Input      | `functions` (array of objects) |
| :--------- | :----------------------------- |
| **Output** | object (function utility API)  |

**Rules:**

Each function object:

- `name` (string)
- `params` (array of objects) — `{ name, type, optional }`
- `returnType` (string)
- `isAsync` (boolean)

**Function Utility Types API (returned object):**

- `ReturnType(fnName)` → extracts return type
  - Returns `{ fnName, returnType, isAsync, awaitedType }`
- `Parameters(fnName)` → extracts parameter types as tuple
  - Returns `{ fnName, paramsTuple, typeString }`
- `Awaited(fnName)` → unwraps Promise return type
  - `Promise<string>` → `string`, `Promise<Promise<number>>` → `number`
  - Returns `{ fnName, original, awaited }`
- `ConstructorParameters(className, params[])` → extracts constructor params
- `InstanceType(className, properties[])` → returns instance type shape
- `ThisParameterType(fn)` → extracts `this` type if present
- `OmitThisParameter(fn)` → removes `this` parameter from function type
- `getReport()` → returns `{ totalFunctions, asyncFunctions, withThis }`

| Challenge 📢 | Return function utility API. If functions invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createFunctionUtilityEngine([`
  `{ name: "fetchUser", params: [{ name: "id", type: "number", optional: false }], returnType: "Promise<User>", isAsync: true },`
  `{ name: "formatName", params: [{ name: "first", type: "string", optional: false }, { name: "last", type: "string", optional: true }], returnType: "string", isAsync: false },`
  `{ name: "calculate", params: [{ name: "a", type: "number", optional: false }, { name: "b", type: "number", optional: false }], returnType: "number", isAsync: false }`
  `])`
- `engine.ReturnType("fetchUser")` ➔ `{ fnName: "fetchUser", returnType: "Promise<User>", isAsync: true, awaitedType: "User" }`
- `engine.ReturnType("formatName")` ➔ `{ fnName: "formatName", returnType: "string", isAsync: false, awaitedType: "string" }`
- `engine.Parameters("formatName")` ➔ `{ fnName: "formatName", paramsTuple: ["string", "string?"], typeString: "Parameters<formatName> = [string, string?]" }`
- `engine.Awaited("fetchUser")` ➔ `{ fnName: "fetchUser", original: "Promise<User>", awaited: "User" }`
- `engine.getReport()` ➔ `{ totalFunctions: 3, asyncFunctions: 1, withThis: 0 }`

---

## 🧩 PROBLEM–03: 🗺️ Record & Mapped Utility Engine

⚠️ **Function Name:** `createRecordUtilityEngine()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (record utility API)|

**Rules:**

`config` object:

- `strict` (boolean)
- `allowPartialRecords` (boolean)

**Record & Mapped Utility API (returned object):**

- `createRecord(keys[], valueType, values)` → creates typed record
  - Validates all keys present and values match `valueType`
  - Returns `{ record, valid, errors }`
- `fromEntries(entries[])` → converts `[key, value][]` to Record
  - Returns `{ record, keyType, valueType }`
- `mapValues(record, fn)` → transforms all values: `Record<K,V>` → `Record<K,U>`
  - Returns `{ result, originalValueType, newValueType }`
- `filterRecord(record, fn)` → keeps entries where `fn(key, value)` is true
- `groupBy(items[], keyFn)` → groups array items into `Record<K, T[]>`
  - Returns `{ record, groups, keyType }`
- `invertRecord(record)` → swaps keys and values (values become keys)
  - Returns `{ inverted, conflicts }` (conflicts if multiple keys had same value)
- `mergeRecords(records[], strategy)` → merges multiple records
  - `strategy` → `"overwrite"` | `"keep"` | `"array"` (collect into arrays)
- `getReport()` → returns `{ totalOperations, byOperation }`

| Challenge 📢 | Return record utility API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createRecordUtilityEngine({ strict: true, allowPartialRecords: false })`
- `engine.createRecord(["alice", "bob", "carol"], "number", { alice: 90, bob: 85, carol: 92 })` ➔
  `{ record: { alice: 90, bob: 85, carol: 92 }, valid: true, errors: {} }`
- `engine.createRecord(["alice", "bob"], "number", { alice: 90 })` ➔
  `{ record: null, valid: false, errors: { bob: "Required key missing" } }`
- `engine.groupBy([{ name: "Rahim", dept: "Eng" }, { name: "Karim", dept: "HR" }, { name: "Jamal", dept: "Eng" }], item => item.dept)` ➔
  `{ record: { Eng: [{ name: "Rahim", dept: "Eng" }, { name: "Jamal", dept: "Eng" }], HR: [{ name: "Karim", dept: "HR" }] }, groups: 2, keyType: "string" }`
- `engine.mapValues({ a: 1, b: 2, c: 3 }, v => v * 10)` ➔
  `{ result: { a: 10, b: 20, c: 30 }, originalValueType: "number", newValueType: "number" }`
- `engine.invertRecord({ a: "1", b: "2", c: "3" })` ➔ `{ inverted: { "1": "a", "2": "b", "3": "c" }, conflicts: [] }`
- `engine.mergeRecords([{ a: 1, b: 2 }, { b: 99, c: 3 }], "overwrite")` ➔ `{ a: 1, b: 99, c: 3 }`
- `engine.getReport()` ➔ `{ totalOperations: 6, byOperation: { createRecord: 2, groupBy: 1, mapValues: 1, invertRecord: 1, mergeRecords: 1 } }`

---

## 🧩 PROBLEM–04: ⚡ NonNullable & Conditional Utility Engine

⚠️ **Function Name:** `createConditionalUtilityEngine()`

| Input      | `config` (object)              |
| :--------- | :----------------------------- |
| **Output** | object (conditional utility)   |

**Rules:**

`config` object:

- `strict` (boolean) — strict null checks
- `distributive` (boolean) — distribute conditionals over unions

**Conditional Utility Engine API (returned object):**

- `NonNullable(type)` → removes `null` and `undefined` from type
  - Returns `{ original, result, removed }`
- `Exclude(type, excludeUnion)` → removes members from union
  - `Exclude<string | number | boolean, boolean>` → `string | number`
  - Returns `{ original, excluded, result }`
- `Extract(type, extractUnion)` → keeps only matching members
  - `Extract<string | number | boolean, string | boolean>` → `string | boolean`
  - Returns `{ original, extracted, result }`
- `NoInfer(type)` → simulates `NoInfer<T>` — prevents type inference at position
  - Returns `{ type, inferBlocked: true }`
- `Uppercase(literalType)` → transforms string literal to uppercase
  - `"hello"` → `"HELLO"`, `"'active'"` → `"'ACTIVE'"`
- `Lowercase(literalType)` → transforms to lowercase
- `Capitalize(literalType)` → capitalizes first letter
- `Uncapitalize(literalType)` → lowercases first letter
- `getReport()` → returns `{ totalOperations, byUtility }`

| Challenge 📢 | Return conditional utility API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createConditionalUtilityEngine({ strict: true, distributive: true })`
- `engine.NonNullable("string | null | undefined")` ➔ `{ original: "string | null | undefined", result: "string", removed: ["null", "undefined"] }`
- `engine.NonNullable("number | null")` ➔ `{ original: "number | null", result: "number", removed: ["null"] }`
- `engine.Exclude("string | number | boolean | null", "boolean | null")` ➔
  `{ original: "string | number | boolean | null", excluded: ["boolean", "null"], result: "string | number" }`
- `engine.Extract("string | number | boolean", "string | boolean")` ➔
  `{ original: "string | number | boolean", extracted: ["string", "boolean"], result: "string | boolean" }`
- `engine.Uppercase("'active'")` ➔ `"'ACTIVE'"`
- `engine.Lowercase("'PENDING'")` ➔ `"'pending'"`
- `engine.Capitalize("'hello world'")` ➔ `"'Hello world'"`
- `engine.getReport()` ➔ `{ totalOperations: 7, byUtility: { NonNullable: 2, Exclude: 1, Extract: 1, Uppercase: 1, Lowercase: 1, Capitalize: 1 } }`

---

## 🧩 PROBLEM–05: 🏗️ Utility Type Composition Engine

⚠️ **Function Name:** `createUtilityComposer()`

| Input      | `config` (object)           |
| :--------- | :-------------------------- |
| **Output** | object (composer API)       |

**Rules:**

`config` object:

- `types` (object) — registered base types `{ typeName: properties }`
- `strict` (boolean)
- `trackLineage` (boolean) — track how each utility type was derived

**Utility Composer API — chains multiple utility types:**

- `apply(typeName, ...utilities)` → applies utilities in sequence:
  - e.g., `apply("User", "Partial", ["Pick", ["id", "name"]], "Readonly")`
  - Returns `{ resultType, lineage, typeString }`
- `createUpdateDTO(typeName)` → creates update DTO pattern:
  - `Partial<Omit<T, "id" | "createdAt">>` — all optional except ID fields
- `createCreateDTO(typeName, omitFields[])` → creates create DTO:
  - `Omit<T, omitFields>` — removes auto-generated fields
- `createResponseType(typeName, includeFields[])` → creates API response type:
  - `Readonly<Pick<T, includeFields>>`
- `diff(typeA, typeB)` → compares two utility-derived types
- `validate(composedType, value)` → validates against composed type
- `generateAll(typeName)` → generates common utility variations:
  - Returns `{ Partial, Required, Readonly, WithoutId }` all as type strings
- `getReport()` → returns `{ totalCompositions, typeLineage, mostComposed }`

| Challenge 📢 | Return composer API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const composer = createUtilityComposer({`
  `types: {`
  `User: {`
  `id: { type: "number", optional: false, readonly: true },`
  `name: { type: "string", optional: false, readonly: false },`
  `email: { type: "string", optional: false, readonly: false },`
  `createdAt: { type: "string", optional: false, readonly: true },`
  `role: { type: "string", optional: true, readonly: false }`
  `}`
  `},`
  `strict: true,`
  `trackLineage: true`
  `})`
- `composer.apply("User", "Partial", ["Pick", ["id", "name", "email"]], "Readonly")` ➔
  `{`
  `resultType: { id: { type: "number", optional: true, readonly: true }, name: { type: "string", optional: true, readonly: true }, email: { type: "string", optional: true, readonly: true } },`
  `lineage: ["User", "Partial<User>", "Pick<Partial<User>, 'id'|'name'|'email'>", "Readonly<Pick<Partial<User>, 'id'|'name'|'email'>>"],`
  `typeString: "Readonly<Pick<Partial<User>, 'id' | 'name' | 'email'>>"`
  `}`
- `composer.createUpdateDTO("User")` ➔
  `{ typeString: "Partial<Omit<User, 'id' | 'createdAt'>>", properties: { name: { optional: true }, email: { optional: true }, role: { optional: true } } }`
- `composer.createResponseType("User", ["id", "name", "email"])` ➔
  `{ typeString: "Readonly<Pick<User, 'id' | 'name' | 'email'>>", properties: { id: { readonly: true }, name: { readonly: true }, email: { readonly: true } } }`
- `composer.generateAll("User")` ➔
  `{`
  `Partial: "Partial<User>",`
  `Required: "Required<User>",`
  `Readonly: "Readonly<User>",`
  `WithoutId: "Omit<User, 'id'>"`
  `}`
- `composer.getReport()` ➔ `{ totalCompositions: 4, typeLineage: { User: 4 }, mostComposed: "User" }`

---