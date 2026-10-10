# 🎓 JS DAILY PRACTICE – DAY-274

📅 **Goal:** Union, Intersection & Literal Types Engine
🎯 **Focus:** Union Types • Intersection Types • Literal Types • Type Narrowing • Discriminated Unions • Type Guards

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔀 Union Type Resolver Engine

⚠️ **Function Name:** `createUnionTypeEngine()`

| Input      | `unions` (array of objects) |
| :--------- | :-------------------------- |
| **Output** | object (union engine API)   |

**Rules:**

Each union object:

- `name` (string) — union type name
- `members` (array of strings) — member types (e.g., `["string", "number", "null"]`)
- `discriminant` (string or `null`) — discriminant property for discriminated unions

**Union Engine API (returned object):**

- `check(unionName, value)` → checks if value satisfies union
  - Returns `{ valid, matchedMember, reason }`
- `narrow(unionName, value, guard)` → narrows union to specific member
  - `guard` → `{ kind: "typeof", type: "string" }` | `{ kind: "literal", property: "tag", value: "circle" }` | `{ kind: "instanceof", class: "ClassName" }`
  - Returns `{ narrowedType, value, guardApplied }`
- `resolve(unionName)` → returns TypeScript union type string
- `distribute(unionName, operation)` → applies operation to each member type:
  - `operation` → `"array"` → `"string[] | number[]"`, `"promise"` → `"Promise<string> | Promise<number>"`
- `intersect(union1, union2)` → finds common members between two unions
- `getReport()` → returns `{ totalUnions, discriminated, maxMembers, minMembers }`

| Challenge 📢 | Return union engine API. If unions invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createUnionTypeEngine([`
  `{ name: "StringOrNumber", members: ["string", "number"], discriminant: null },`
  `{ name: "Nullable", members: ["string", "null", "undefined"], discriminant: null },`
  `{ name: "Shape", members: ["Circle", "Rectangle", "Triangle"], discriminant: "kind" }`
  `])`
- `engine.check("StringOrNumber", 42)` ➔ `{ valid: true, matchedMember: "number", reason: null }`
- `engine.check("StringOrNumber", true)` ➔ `{ valid: false, matchedMember: null, reason: "boolean is not assignable to string | number" }`
- `engine.check("Nullable", null)` ➔ `{ valid: true, matchedMember: "null", reason: null }`
- `engine.narrow("StringOrNumber", "hello", { kind: "typeof", type: "string" })` ➔
  `{ narrowedType: "string", value: "hello", guardApplied: "typeof x === 'string'" }`
- `engine.resolve("Shape")` ➔ `"Circle | Rectangle | Triangle"`
- `engine.distribute("StringOrNumber", "array")` ➔ `"string[] | number[]"`
- `engine.intersect("StringOrNumber", "Nullable")` ➔ `["string"]`
- `engine.getReport()` ➔ `{ totalUnions: 3, discriminated: 1, maxMembers: 3, minMembers: 2 }`

---

## 🧩 PROBLEM–02: ⚔️ Intersection Type Builder Engine

⚠️ **Function Name:** `createIntersectionEngine()`

| Input      | `types` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object (intersection API)  |

**Rules:**

Each type object:

- `name` (string)
- `properties` (object) — `{ propName: { type, optional, readonly } }`

**Intersection Type Rules:**

- `A & B` → must satisfy ALL properties from BOTH types
- Conflicting property types → `never` (impossible to satisfy)
- Optional in A but required in B → becomes **required** in intersection

**Intersection Engine API (returned object):**

- `intersect(typeName, typeNames[])` → creates intersection of multiple types
  - Returns `{ name, properties, conflicts, typeString }`
- `validate(intersectionName, value)` → validates value against intersection
  - Returns `{ valid, errors, satisfiedTypes, failedTypes }`
- `hasConflict(typeA, typeB)` → returns `{ hasConflict, conflicts: [{ property, typeA, typeB }] }`
- `simplify(intersectionName)` → resolves to final merged type or `"never"` if conflicts
- `generate(intersectionName)` → returns TypeScript type string `"TypeA & TypeB"`
- `getReport()` → returns `{ totalTypes, intersections, neverTypes, conflicts }`

| Challenge 📢 | Return intersection engine API. If types invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createIntersectionEngine([`
  `{ name: "Flyable", properties: { fly: { type: "function", optional: false, readonly: false }, altitude: { type: "number", optional: false, readonly: false } } },`
  `{ name: "Swimmable", properties: { swim: { type: "function", optional: false, readonly: false }, depth: { type: "number", optional: false, readonly: false } } },`
  `{ name: "Named", properties: { name: { type: "string", optional: false, readonly: false } } },`
  `{ name: "Conflicting", properties: { name: { type: "number", optional: false, readonly: false } } }`
  `])`
- `engine.intersect("FlyingSwimmer", ["Flyable", "Swimmable", "Named"])` ➔
  `{ name: "FlyingSwimmer", properties: { fly: "function", altitude: "number", swim: "function", depth: "number", name: "string" }, conflicts: [], typeString: "Flyable & Swimmable & Named" }`
- `engine.hasConflict("Named", "Conflicting")` ➔
  `{ hasConflict: true, conflicts: [{ property: "name", typeA: "string", typeB: "number" }] }`
- `engine.validate("FlyingSwimmer", { fly: () => {}, altitude: 1000, swim: () => {}, depth: 50, name: "Duck" })` ➔
  `{ valid: true, errors: {}, satisfiedTypes: ["Flyable", "Swimmable", "Named"], failedTypes: [] }`
- `engine.generate("FlyingSwimmer")` ➔ `"Flyable & Swimmable & Named"`
- `engine.getReport()` ➔ `{ totalTypes: 4, intersections: 1, neverTypes: 0, conflicts: 1 }`

---

## 🧩 PROBLEM–03: 🎯 Literal Type & Const Assertion Engine

⚠️ **Function Name:** `createLiteralTypeEngine()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (literal API)       |

**Rules:**

`config` object:

- `strict` (boolean) — strict literal checking
- `allowWiden` (boolean) — allow widening literal to base type

**Literal Type Engine API (returned object):**

- `defineLiteral(name, value)` → registers literal type
  - Supports: string literals `"active"`, number literals `42`, boolean literals `true`
- `defineConst(name, obj)` → simulates `as const` — makes all values deeply readonly literals
- `check(literalName, value)` → returns `{ valid, expected, got, isWidened }`
- `widen(literalName)` → returns base type: `"'active'"` → `"string"`, `"42"` → `"number"`
- `narrow(baseType, literals[])` → creates union of literals: `["'a'", "'b'", "'c'"]` → `"'a' | 'b' | 'c'"`
- `exhaustiveCheck(unionName, members[], handledValues[])` → checks if all union members are handled
  - Returns `{ exhaustive, unhandled }`
- `templateLiteral(template, unions[])` → generates template literal type:
  - e.g., `"${'get' | 'set'}${'Name' | 'Age'}"` → `"getName | getAge | setName | setAge"`
- `getReport()` → returns `{ totalLiterals, stringLiterals, numberLiterals, booleanLiterals, constObjects }`

| Challenge 📢 | Return literal engine API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createLiteralTypeEngine({ strict: true, allowWiden: false })`
- `engine.defineLiteral("ActiveStatus", "active")`
- `engine.defineLiteral("MaxRetries", 3)`
- `engine.defineConst("Config", { theme: "dark", fontSize: 14, features: ["auth", "api"] })`
- `engine.check("ActiveStatus", "active")` ➔ `{ valid: true, expected: "'active'", got: "'active'", isWidened: false }`
- `engine.check("ActiveStatus", "inactive")` ➔ `{ valid: false, expected: "'active'", got: "'inactive'", isWidened: false }`
- `engine.widen("ActiveStatus")` ➔ `"string"`
- `engine.narrow("string", ["'active'", "'inactive'", "'pending'"])` ➔ `"'active' | 'inactive' | 'pending'"`
- `engine.exhaustiveCheck("Status", ["active", "inactive", "pending"], ["active", "inactive"])` ➔
  `{ exhaustive: false, unhandled: ["pending"] }`
- `engine.templateLiteral("${prefix}${suffix}", [["get", "set"], ["Name", "Age"]])` ➔
  `["getName", "getAge", "setName", "setAge"]`
- `engine.getReport()` ➔ `{ totalLiterals: 2, stringLiterals: 1, numberLiterals: 1, booleanLiterals: 0, constObjects: 1 }`

---

## 🧩 PROBLEM–04: 🏷️ Discriminated Union Pattern Engine

⚠️ **Function Name:** `createDiscriminatedUnionEngine()`

| Input      | `variants` (array of objects) |
| :--------- | :---------------------------- |
| **Output** | object (discriminated API)    |

**Rules:**

Each variant object:

- `tag` (string) — discriminant value (e.g., `"circle"`, `"rectangle"`)
- `discriminantProperty` (string) — property name used as discriminant (e.g., `"kind"`)
- `properties` (object) — other properties for this variant

**Discriminated Union API (returned object):**

- `validate(value)` → identifies which variant matches by discriminant
  - Returns `{ matched, variant, valid, errors }`
- `narrow(value)` → returns the specific variant type and its properties
- `match(value, handlers)` → pattern matching:
  - `handlers`: `{ variantTag: fn }` + optional `default: fn`
  - Returns result of matched handler
- `exhaustive(handlers)` → checks all variants are handled
  - Returns `{ exhaustive, missingHandlers }`
- `generate()` → returns full TypeScript discriminated union type string
- `addVariant(tag, properties)` → adds new variant dynamically
- `getReport()` → returns `{ totalVariants, discriminantProperty, variantTags }`

| Challenge 📢 | Return discriminated union API. If variants invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createDiscriminatedUnionEngine([`
  `{ tag: "circle", discriminantProperty: "kind", properties: { radius: "number" } },`
  `{ tag: "rectangle", discriminantProperty: "kind", properties: { width: "number", height: "number" } },`
  `{ tag: "triangle", discriminantProperty: "kind", properties: { base: "number", height: "number" } }`
  `])`
- `engine.validate({ kind: "circle", radius: 10 })` ➔
  `{ matched: true, variant: "circle", valid: true, errors: {} }`
- `engine.validate({ kind: "circle", width: 10 })` ➔
  `{ matched: true, variant: "circle", valid: false, errors: { radius: "Required property missing" } }`
- `engine.validate({ kind: "hexagon", sides: 6 })` ➔
  `{ matched: false, variant: null, valid: false, errors: { kind: "Unknown variant: hexagon" } }`
- `engine.match({ kind: "rectangle", width: 5, height: 3 }, {`
  `circle: (s) => Math.PI * s.radius ** 2,`
  `rectangle: (s) => s.width * s.height,`
  `triangle: (s) => 0.5 * s.base * s.height`
  `})` ➔ `15`
- `engine.exhaustive({ circle: () => {}, rectangle: () => {} })` ➔
  `{ exhaustive: false, missingHandlers: ["triangle"] }`
- `engine.generate()` ➔
  `"type Shape =\n  | { kind: 'circle'; radius: number }\n  | { kind: 'rectangle'; width: number; height: number }\n  | { kind: 'triangle'; base: number; height: number }"`
- `engine.getReport()` ➔ `{ totalVariants: 3, discriminantProperty: "kind", variantTags: ["circle", "rectangle", "triangle"] }`

---

## 🧩 PROBLEM–05: 🔍 Type Guard & Narrowing Engine

⚠️ **Function Name:** `createTypeGuardEngine()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (type guard API)   |

**Rules:**

`config` object:

- `strict` (boolean)
- `trackNarrowing` (boolean) — log narrowing steps

**Type Guard Engine API (returned object):**

- `typeof(value, expectedType)` → simulates `typeof` guard
  - Returns `{ narrowed, type, passed }`
- `instanceof(value, className, classProperties[])` → simulates `instanceof` guard
  - `classProperties[]` — properties that instances of this class should have
  - Returns `{ narrowed, instanceOf, passed }`
- `in(value, key)` → simulates `"key" in obj` guard
  - Returns `{ narrowed, hasKey, passed }`
- `truthiness(value)` → simulates truthiness narrowing
  - Returns `{ narrowed, isTruthy, eliminates }`
- `equality(value, literal)` → simulates `===` narrowing
  - Returns `{ narrowed, matched, type }`
- `userDefined(value, guardFn, resultType)` → simulates user-defined type guard `value is Type`
  - `guardFn(value) → boolean`
  - Returns `{ narrowed, passed, assertedType }`
- `getNarrowingLog()` → returns all narrowing operations performed
- `getReport()` → returns `{ totalChecks, passed, failed, byGuardType }`

| Challenge 📢 | Return type guard engine API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------ |

**Sample Input & Output:**

- `const engine = createTypeGuardEngine({ strict: true, trackNarrowing: true })`
- `engine.typeof("hello", "string")` ➔ `{ narrowed: "string", type: "string", passed: true }`
- `engine.typeof(42, "string")` ➔ `{ narrowed: null, type: "number", passed: false }`
- `engine.in({ name: "Rahim", role: "admin" }, "role")` ➔ `{ narrowed: "{ name: string; role: string }", hasKey: true, passed: true }`
- `engine.truthiness(0)` ➔ `{ narrowed: "never", isTruthy: false, eliminates: "number" }`
- `engine.truthiness("hello")` ➔ `{ narrowed: "string", isTruthy: true, eliminates: null }`
- `engine.equality("active", "'active'")` ➔ `{ narrowed: "'active'", matched: true, type: "string literal" }`
- `engine.userDefined({ id: 1, name: "Rahim" }, (v) => typeof v.id === "number" && typeof v.name === "string", "User")` ➔
  `{ narrowed: "User", passed: true, assertedType: "User" }`
- `engine.getNarrowingLog()` ➔
  `[`
  `{ guard: "typeof", input: "hello", result: "string", passed: true },`
  `{ guard: "typeof", input: 42, result: null, passed: false },`
  `{ guard: "in", input: { name: "Rahim", role: "admin" }, result: "narrowed", passed: true },`
  `{ guard: "truthiness", input: 0, result: "never", passed: false },`
  `{ guard: "truthiness", input: "hello", result: "string", passed: true },`
  `{ guard: "equality", input: "active", result: "'active'", passed: true },`
  `{ guard: "userDefined", input: { id: 1, name: "Rahim" }, result: "User", passed: true }`
  `]`
- `engine.getReport()` ➔ `{ totalChecks: 7, passed: 5, failed: 2, byGuardType: { typeof: 2, in: 1, truthiness: 2, equality: 1, userDefined: 1 } }`

---