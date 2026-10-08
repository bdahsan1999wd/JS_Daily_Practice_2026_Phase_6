# 🎓 JS DAILY PRACTICE – DAY-273

📅 **Goal:** TypeScript Interfaces & Object Types Engine
🎯 **Focus:** Interfaces • Optional Properties • Readonly • Extending Interfaces • Index Signatures • Function Types • Structural Typing

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🏗️ Interface Definition & Validation Engine

⚠️ **Function Name:** `createInterfaceEngine()`

| Input      | `interfaces` (array of objects) |
| :--------- | :------------------------------ |
| **Output** | object (interface API)          |

**Rules:**

Each interface object:

- `name` (string) — interface name
- `extends` (array of strings) — parent interface names
- `properties` (array of objects):
  - `name` (string)
  - `type` (string) — e.g., `"string"`, `"number"`, `"boolean"`, `"string[]"`, another interface name
  - `optional` (boolean) — `?` modifier
  - `readonly` (boolean) — `readonly` modifier
- `indexSignature` (object or `null`):
  - `keyType` → `"string"` | `"number"`
  - `valueType` (string)
- `methods` (array of objects):
  - `name` (string)
  - `params` (array of `{ name, type }`)
  - `returnType` (string)
  - `optional` (boolean)

**Interface Engine API (returned object):**

- `validate(interfaceName, value)` → checks if value satisfies interface
  - Merges all extended interface properties
  - Returns `{ valid, errors: { property: message }, missingRequired, extraProperties }`
- `extend(childName, parentNames[])` → creates new interface extending others
- `merge(name, interface1, interface2)` → merges two interfaces (intersection)
- `generate(interfaceName)` → returns TypeScript interface string
- `getFlattened(interfaceName)` → returns all properties including from extended interfaces
- `getReport()` → returns `{ totalInterfaces, withExtends, withIndex, withMethods }`

| Challenge 📢 | Return interface engine API. If interfaces invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createInterfaceEngine([`
  `{ name: "Entity", extends: [], properties: [{ name: "id", type: "number", optional: false, readonly: true }], indexSignature: null, methods: [] },`
  `{ name: "User", extends: ["Entity"], properties: [`
  `{ name: "name", type: "string", optional: false, readonly: false },`
  `{ name: "email", type: "string", optional: true, readonly: false },`
  `{ name: "age", type: "number", optional: false, readonly: false }`
  `], indexSignature: null, methods: [{ name: "greet", params: [], returnType: "string", optional: false }] }`
  `])`
- `engine.validate("User", { id: 1, name: "Rahim", age: 25 })` ➔
  `{ valid: true, errors: {}, missingRequired: [], extraProperties: [] }`
- `engine.validate("User", { name: "Rahim" })` ➔
  `{ valid: false, errors: { id: "Required readonly property missing", age: "Required property missing" }, missingRequired: ["id", "age"], extraProperties: [] }`
- `engine.generate("User")` ➔
  `"interface User extends Entity {\n  name: string;\n  email?: string;\n  age: number;\n  greet(): string;\n}"`
- `engine.getFlattened("User")` ➔
  `[{ name: "id", type: "number", readonly: true, optional: false, from: "Entity" }, { name: "name", type: "string", readonly: false, optional: false, from: "User" }, { name: "email", type: "string", readonly: false, optional: true, from: "User" }, { name: "age", type: "number", readonly: false, optional: false, from: "User" }]`
- `engine.getReport()` ➔ `{ totalInterfaces: 2, withExtends: 1, withIndex: 0, withMethods: 1 }`

---

## 🧩 PROBLEM–02: 📋 Index Signature & Dynamic Object Engine

⚠️ **Function Name:** `createIndexSignatureEngine()`

| Input      | `schemas` (array of objects) |
| :--------- | :--------------------------- |
| **Output** | object (index engine API)    |

**Rules:**

Each schema object:

- `name` (string)
- `keyType` → `"string"` | `"number"`
- `valueType` (string) — e.g., `"string"`, `"number"`, `"boolean"`, `"any"`
- `requiredKeys` (array of strings) — keys that must always exist
- `forbiddenKeys` (array of strings) — keys that must NOT exist

**Index Signature Engine API (returned object):**

- `validate(schemaName, obj)` → validates object against index signature schema
  - Returns `{ valid, errors, keyCount, valueTypes }`
- `create(schemaName, entries[])` → creates valid object from `[key, value]` pairs
- `merge(obj1, obj2, strategy)` → merges two index-typed objects
  - `strategy` → `"overwrite"` | `"keep"` | `"error"` (on key conflict)
- `filter(obj, fn)` → keeps only entries where `fn(key, value)` returns true
- `transform(obj, fn)` → maps values: `fn(key, value) → newValue`
- `toTypedArray(obj)` → converts to `[{ key, value }]` array sorted by key
- `getReport()` → returns `{ totalSchemas, stringKeyed, numberKeyed }`

| Challenge 📢 | Return index engine API. If schemas invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createIndexSignatureEngine([`
  `{ name: "StringMap", keyType: "string", valueType: "string", requiredKeys: ["name"], forbiddenKeys: ["__proto__"] },`
  `{ name: "ScoreBoard", keyType: "string", valueType: "number", requiredKeys: [], forbiddenKeys: [] }`
  `])`
- `engine.validate("StringMap", { name: "Rahim", city: "Dhaka" })` ➔
  `{ valid: true, errors: [], keyCount: 2, valueTypes: { name: "string", city: "string" } }`
- `engine.validate("StringMap", { city: "Dhaka", count: 5 })` ➔
  `{ valid: false, errors: ["Required key missing: name", "Value at 'count' must be string, got number"], keyCount: 2, valueTypes: null }`
- `engine.validate("StringMap", { name: "X", __proto__: "hack" })` ➔
  `{ valid: false, errors: ["Forbidden key present: __proto__"], keyCount: 2, valueTypes: null }`
- `engine.merge({ a: 10, b: 20 }, { b: 99, c: 30 }, "overwrite")` ➔ `{ a: 10, b: 99, c: 30 }`
- `engine.merge({ a: 10, b: 20 }, { b: 99, c: 30 }, "keep")` ➔ `{ a: 10, b: 20, c: 30 }`
- `engine.transform({ alice: 80, bob: 60, carol: 95 }, (k, v) => v * 1.1)` ➔ `{ alice: 88, bob: 66, carol: 104.5 }`
- `engine.getReport()` ➔ `{ totalSchemas: 2, stringKeyed: 2, numberKeyed: 0 }`

---

## 🧩 PROBLEM–03: 🔗 Structural Typing & Duck Type Checker

⚠️ **Function Name:** `createStructuralTypeChecker()`

| Input      | `types` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object (structural API)    |

**Rules:**

Each type object:

- `name` (string)
- `shape` (object) — `{ propertyName: typeString }` defining required shape

**Structural Typing Rules (TypeScript-style):**

- A value satisfies a type if it has **at least** all required properties with correct types
- Extra properties are allowed (structural/duck typing)
- Nested objects must also satisfy nested type shapes

**Structural Type Checker API (returned object):**

- `satisfies(typeName, value)` → checks structural compatibility
  - Returns `{ compatible, missing, typeMismatches, extraProperties }`
- `isSubtype(typeA, typeB)` → checks if typeA is a subtype of typeB
  - A is subtype of B if A has all of B's properties (possibly more)
  - Returns `{ isSubtype, reason }`
- `findCompatible(value, typeNames[])` → returns all type names value is compatible with
- `assignable(sourceType, targetType)` → checks if sourceType values can be assigned to targetType variables
- `diff(typeA, typeB)` → returns `{ onlyInA, onlyInB, inBoth, typeDiffs }`
- `getReport()` → returns `{ totalTypes, avgProperties, mostComplex }`

| Challenge 📢 | Return structural checker API. If types invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------ |

**Sample Input & Output:**

- `const checker = createStructuralTypeChecker([`
  `{ name: "Printable", shape: { print: "function" } },`
  `{ name: "Serializable", shape: { serialize: "function", deserialize: "function" } },`
  `{ name: "User", shape: { id: "number", name: "string", email: "string" } },`
  `{ name: "AdminUser", shape: { id: "number", name: "string", email: "string", role: "string", permissions: "array" } }`
  `])`
- `checker.satisfies("User", { id: 1, name: "Rahim", email: "r@mail.com", role: "admin" })` ➔
  `{ compatible: true, missing: [], typeMismatches: [], extraProperties: ["role"] }`
- `checker.satisfies("User", { id: "one", name: "Rahim" })` ➔
  `{ compatible: false, missing: ["email"], typeMismatches: [{ property: "id", expected: "number", got: "string" }], extraProperties: [] }`
- `checker.isSubtype("AdminUser", "User")` ➔ `{ isSubtype: true, reason: "AdminUser has all properties of User plus more" }`
- `checker.isSubtype("User", "AdminUser")` ➔ `{ isSubtype: false, reason: "User is missing: role, permissions" }`
- `checker.findCompatible({ id: 1, name: "Rahim", email: "r@mail.com", role: "admin", permissions: ["read"] }, ["User", "AdminUser", "Printable"])` ➔ `["User", "AdminUser"]`
- `checker.diff("User", "AdminUser")` ➔ `{ onlyInA: [], onlyInB: ["role", "permissions"], inBoth: ["id", "name", "email"], typeDiffs: [] }`

---

## 🧩 PROBLEM–04: 🔄 Interface Merging & Declaration Engine

⚠️ **Function Name:** `createDeclarationMerger()`

| Input      | `declarations` (array of objects) |
| :--------- | :-------------------------------- |
| **Output** | object (merger API)               |

**Rules:**

Each declaration object:

- `type` → `"interface"` | `"namespace"` | `"function"`
- `name` (string)
- `properties` (object) — for interfaces
- `members` (object) — for namespaces
- `overloads` (array of objects) — for functions:
  - `{ params: [{ name, type }], returnType }`

**Declaration Merging Rules (TypeScript):**

- Multiple `interface` declarations with same name → **merged** (properties combined)
- Multiple `function` declarations with same name → **overloaded**
- `interface` + `namespace` with same name → **augmented** (namespace adds static members)
- Conflicting property types → flag as error

**Merger API (returned object):**

- `merge(name)` → merges all declarations with given name
  - Returns `{ type, mergedProperties, overloads, errors }`
- `augment(interfaceName, additions)` → adds properties to existing interface
- `getOverloads(fnName)` → returns all function overload signatures
- `generate(name)` → generates merged TypeScript declaration string
- `detectConflicts()` → returns all property type conflicts across same-name interfaces
- `getReport()` → returns `{ totalDeclarations, mergedCount, conflicts, augmentations }`

| Challenge 📢 | Return merger API. If declarations invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------- |

**Sample Input & Output:**

- `const merger = createDeclarationMerger([`
  `{ type: "interface", name: "Window", properties: { title: "string", width: "number" }, members: {}, overloads: [] },`
  `{ type: "interface", name: "Window", properties: { height: "number", scrollY: "number" }, members: {}, overloads: [] },`
  `{ type: "function", name: "process", properties: {}, members: {}, overloads: [`
  `{ params: [{ name: "x", type: "string" }], returnType: "string" },`
  `{ params: [{ name: "x", type: "number" }], returnType: "number" }`
  `] }`
  `])`
- `merger.merge("Window")` ➔
  `{ type: "interface", mergedProperties: { title: "string", width: "number", height: "number", scrollY: "number" }, overloads: [], errors: [] }`
- `merger.getOverloads("process")` ➔
  `[{ params: [{ name: "x", type: "string" }], returnType: "string" }, { params: [{ name: "x", type: "number" }], returnType: "number" }]`
- `merger.generate("Window")` ➔
  `"interface Window {\n  title: string;\n  width: number;\n  height: number;\n  scrollY: number;\n}"`
- `merger.detectConflicts()` ➔ `[]`
- `merger.getReport()` ➔ `{ totalDeclarations: 3, mergedCount: 1, conflicts: 0, augmentations: 0 }`

---

## 🧩 PROBLEM–05: 🏭 Object Type Factory & Registry

⚠️ **Function Name:** `createObjectTypeRegistry()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (registry API)     |

**Rules:**

`config` object:

- `strict` (boolean) — strict null checks
- `allowExtraProperties` (boolean) — allow extra props beyond interface definition
- `autoCoerce` (boolean) — try to coerce types (e.g., `"42"` → `42` for number fields)

**Object Type Registry API (returned object):**

- `register(name, shape)` → registers object type shape
  - `shape`: `{ property: { type, optional, readonly, default } }`
- `create(typeName, data)` → creates typed object:
  - Validates data, applies defaults, optionally coerces types
  - Returns `{ object, warnings, coerced }`
- `cast(typeName, data)` → like `create` but throws-simulated error on invalid
  - Returns typed object or `{ error, violations }`
- `pick(typeName, keys[])` → creates new type with only specified keys
- `omit(typeName, keys[])` → creates new type without specified keys
- `partial(typeName)` → creates new type where all properties are optional
- `required(typeName)` → creates new type where all properties are required
- `getType(typeName)` → returns type shape definition
- `getReport()` → returns `{ totalTypes, withDefaults, strictMode, coercionEnabled }`

| Challenge 📢 | Return registry API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const registry = createObjectTypeRegistry({ strict: true, allowExtraProperties: false, autoCoerce: true })`
- `registry.register("Product", {`
  `id: { type: "number", optional: false, readonly: true, default: null },`
  `name: { type: "string", optional: false, readonly: false, default: null },`
  `price: { type: "number", optional: false, readonly: false, default: null },`
  `stock: { type: "number", optional: true, readonly: false, default: 0 },`
  `category: { type: "string", optional: true, readonly: false, default: "general" }`
  `})`
- `registry.create("Product", { id: 1, name: "Laptop", price: "50000" })` ➔
  `{ object: { id: 1, name: "Laptop", price: 50000, stock: 0, category: "general" }, warnings: [], coerced: ["price"] }`
- `registry.cast("Product", { name: "Mouse" })` ➔
  `{ error: true, violations: [{ field: "id", issue: "Required field missing" }, { field: "price", issue: "Required field missing" }] }`
- `registry.pick("Product", ["id", "name", "price"])` ➔
  `{ name: "Product_Pick", shape: { id: { type: "number", readonly: true }, name: { type: "string" }, price: { type: "number" } } }`
- `registry.partial("Product")` ➔
  `{ name: "Product_Partial", shape: { id: { optional: true }, name: { optional: true }, price: { optional: true }, stock: { optional: true }, category: { optional: true } } }`
- `registry.getReport()` ➔ `{ totalTypes: 1, withDefaults: 2, strictMode: true, coercionEnabled: true }`

---