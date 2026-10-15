# 🎓 JS DAILY PRACTICE – DAY-277

📅 **Goal:** Advanced TypeScript Types Engine
🎯 **Focus:** Type Guards • unknown • never • Type Assertions • Enums • Conditional Types • Infer • Template Literal Types

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: ❓ unknown & never Type Engine

⚠️ **Function Name:** `createUnknownNeverEngine()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (engine API)       |

**Rules:**

`config` object:

- `strict` (boolean) — enforce strict unknown handling
- `exhaustiveChecks` (boolean) — enforce never in exhaustive branches

**unknown & never Engine API (returned object):**

- `processUnknown(value, operations[])` → safely processes `unknown` value
  - `operations`: array of `{ guard, type, action }`
  - Must narrow before use — direct operations without narrowing → `"Type Error: Cannot use unknown without narrowing"`
  - Returns `{ processed, narrowedAs, operationsApplied }`
- `assertNever(value, context)` → simulates `never` assertion in exhaustive switch
  - If value matches any known type → `"Unreachable code: value should be never"`
  - Returns `{ isNever, value, context, message }`
- `safeOperation(value, fn, fallback)` → wraps unknown in try-safe execution
  - Returns `{ result, usedFallback, error }`
- `narrowUnknown(value)` → infers safe type from unknown value
  - Returns `{ originalType: "unknown", narrowedType, safe: boolean }`
- `neverUnion(types[])` → checks if intersection of types results in `never`
  - Returns `{ isNever, reason, types }`
- `getReport()` → returns `{ totalUnknown, narrowedSuccessfully, neverAssertions, safeOps }`

| Challenge 📢 | Return engine API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createUnknownNeverEngine({ strict: true, exhaustiveChecks: true })`
- `engine.processUnknown("hello", [{ guard: "typeof", type: "string", action: "toUpperCase" }])` ➔
  `{ processed: "HELLO", narrowedAs: "string", operationsApplied: ["toUpperCase"] }`
- `engine.processUnknown(42, [])` ➔
  `{ processed: null, narrowedAs: null, operationsApplied: [], error: "Type Error: Cannot use unknown without narrowing" }`
- `engine.narrowUnknown("hello world")` ➔ `{ originalType: "unknown", narrowedType: "string", safe: true }`
- `engine.narrowUnknown(null)` ➔ `{ originalType: "unknown", narrowedType: "null", safe: false }`
- `engine.assertNever("unexpectedValue", "switch statement")` ➔
  `{ isNever: false, value: "unexpectedValue", context: "switch statement", message: "Unreachable code: value should be never but got string" }`
- `engine.neverUnion(["string", "number"])` ➔ `{ isNever: false, reason: "No conflict between string and number", types: ["string", "number"] }`
- `engine.neverUnion(["string", "number", "never"])` ➔ `{ isNever: true, reason: "never absorbs all types in intersection", types: ["string", "number", "never"] }`
- `engine.getReport()` ➔ `{ totalUnknown: 3, narrowedSuccessfully: 1, neverAssertions: 1, safeOps: 0 }`

---

## 🧩 PROBLEM–02: 🏷️ Enum System Engine

⚠️ **Function Name:** `createEnumEngine()`

| Input      | `enums` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object (enum API)          |

**Rules:**

Each enum object:

- `name` (string)
- `kind` → `"numeric"` | `"string"` | `"const"` | `"heterogeneous"`
- `members` (array of objects):
  - `key` (string)
  - `value` (number or string or `null`) — `null` = auto-increment for numeric

**Enum Engine API (returned object):**

- `getValue(enumName, key)` → returns value for key
- `getKey(enumName, value)` → returns key for value (reverse lookup)
- `validate(enumName, value)` → checks if value is valid enum member
  - Returns `{ valid, key, value, kind }`
- `generate(enumName)` → returns TypeScript enum declaration string
- `toObject(enumName)` → returns `{ key: value }` plain object representation
- `compare(enum1, enum2)` → returns `{ commonKeys, onlyInA, onlyInB, valueDiffs }`
- `extend(enumName, newMembers[])` → adds members to existing enum (simulated)
- `getReport()` → returns `{ totalEnums, byKind, totalMembers, avgMembersPerEnum }`

| Challenge 📢 | Return enum engine API. If enums invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createEnumEngine([`
  `{ name: "Direction", kind: "numeric", members: [{ key: "Up", value: null }, { key: "Down", value: null }, { key: "Left", value: null }, { key: "Right", value: null }] },`
  `{ name: "Status", kind: "string", members: [{ key: "Active", value: "active" }, { key: "Inactive", value: "inactive" }, { key: "Pending", value: "pending" }] },`
  `{ name: "Flags", kind: "numeric", members: [{ key: "None", value: 0 }, { key: "Read", value: 1 }, { key: "Write", value: 2 }, { key: "Admin", value: 4 }] }`
  `])`
- `engine.getValue("Direction", "Up")` ➔ `0`
- `engine.getValue("Direction", "Right")` ➔ `3`
- `engine.getKey("Direction", 2)` ➔ `"Left"`
- `engine.validate("Status", "active")` ➔ `{ valid: true, key: "Active", value: "active", kind: "string" }`
- `engine.validate("Status", "deleted")` ➔ `{ valid: false, key: null, value: "deleted", kind: "string" }`
- `engine.generate("Status")` ➔ `"enum Status {\n  Active = 'active',\n  Inactive = 'inactive',\n  Pending = 'pending'\n}"`
- `engine.generate("Direction")` ➔ `"enum Direction {\n  Up,\n  Down,\n  Left,\n  Right\n}"`
- `engine.toObject("Flags")` ➔ `{ None: 0, Read: 1, Write: 2, Admin: 4 }`
- `engine.getReport()` ➔ `{ totalEnums: 3, byKind: { numeric: 2, string: 1 }, totalMembers: 11, avgMembersPerEnum: 3.67 }`

---

## 🧩 PROBLEM–03: 🔄 Conditional Type & Infer Engine

⚠️ **Function Name:** `createConditionalTypeEngine()`

| Input      | `config` (object)             |
| :--------- | :---------------------------- |
| **Output** | object (conditional type API) |

**Rules:**

`config` object:

- `distributive` (boolean) — distribute over union members
- `strict` (boolean)

**Conditional Type Engine API (returned object):**

- `evaluate(type, condition, trueType, falseType)` → evaluates `T extends U ? X : Y`
  - Returns `{ input, condition, result, distributed }` (distributed = array if union input)
- `infer(type, pattern)` → simulates `infer` keyword:
  - `pattern: "ReturnType"` → infers return type from function type string
  - `pattern: "ArrayElement"` → infers element type from `T[]`
  - `pattern: "PromiseValue"` → infers value from `Promise<T>`
  - `pattern: "FirstParam"` → infers first parameter type
  - Returns `{ original, inferred, pattern }`
- `flatten(type)` → flattens nested arrays: `string[][]` → `string[]`
- `deepReadonly(typeShape)` → recursively makes all properties readonly
- `unpack(type)` → unwraps one level: `Promise<string>` → `string`, `string[]` → `string`
- `isNever(type)` → returns boolean
- `getReport()` → returns `{ totalEvaluations, inferPatterns, distributedUnions }`

| Challenge 📢 | Return conditional type engine API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------ |

**Sample Input & Output:**

- `const engine = createConditionalTypeEngine({ distributive: true, strict: true })`
- `engine.evaluate("string", "extends string", "Yes", "No")` ➔
  `{ input: "string", condition: "extends string", result: "Yes", distributed: false }`
- `engine.evaluate("string | number", "extends string", "Yes", "No")` ➔
  `{ input: "string | number", condition: "extends string", result: "Yes | No", distributed: true }`
- `engine.infer("() => string", "ReturnType")` ➔ `{ original: "() => string", inferred: "string", pattern: "ReturnType" }`
- `engine.infer("string[]", "ArrayElement")` ➔ `{ original: "string[]", inferred: "string", pattern: "ArrayElement" }`
- `engine.infer("Promise<number>", "PromiseValue")` ➔ `{ original: "Promise<number>", inferred: "number", pattern: "PromiseValue" }`
- `engine.infer("(a: string, b: number) => void", "FirstParam")` ➔ `{ original: "(a: string, b: number) => void", inferred: "string", pattern: "FirstParam" }`
- `engine.flatten("string[][]")` ➔ `"string[]"`
- `engine.unpack("Promise<User>")` ➔ `"User"`
- `engine.unpack("number[]")` ➔ `"number"`
- `engine.getReport()` ➔ `{ totalEvaluations: 2, inferPatterns: { ReturnType: 1, ArrayElement: 1, PromiseValue: 1, FirstParam: 1 }, distributedUnions: 1 }`

---

## 🧩 PROBLEM–04: 📝 Template Literal Type Engine

⚠️ **Function Name:** `createTemplateLiteralEngine()`

| Input      | `config` (object)              |
| :--------- | :----------------------------- |
| **Output** | object (template literal API)  |

**Rules:**

`config` object:

- `caseSensitive` (boolean)
- `maxCombinations` (number) — max template combinations to generate

**Template Literal Type Engine API (returned object):**

- `define(name, template, unions[])` → defines template literal type
  - `template`: string with `${U}` placeholders
  - `unions`: array of string arrays for each placeholder
  - Returns all possible combinations
- `validate(templateName, value)` → checks if value matches template pattern
  - Returns `{ valid, matchedPattern, captures }`
- `generate(templateName)` → returns TypeScript template literal type string
- `combine(template1, template2)` → intersects two template patterns
- `extract(value, template)` → extracts captured parts from a value
  - e.g., `extract("getUserById", "${method}${Entity}By${Key}")` → `{ method: "get", Entity: "User", Key: "Id" }`
- `buildEventNames(entities[], actions[])` → generates event name union:
  - `["User", "Product"]` + `["Created", "Updated", "Deleted"]` → `"UserCreated | UserUpdated | ... | ProductDeleted"`
- `buildCSSClasses(prefixes[], sizes[])` → generates CSS class union
- `getReport()` → returns `{ totalTemplates, totalCombinations, validations }`

| Challenge 📢 | Return template literal engine API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------ |

**Sample Input & Output:**

- `const engine = createTemplateLiteralEngine({ caseSensitive: true, maxCombinations: 100 })`
- `engine.define("EventName", "${entity}${action}", [["User", "Product", "Order"], ["Created", "Updated", "Deleted"]])` ➔
  `{ name: "EventName", combinations: ["UserCreated", "UserUpdated", "UserDeleted", "ProductCreated", "ProductUpdated", "ProductDeleted", "OrderCreated", "OrderUpdated", "OrderDeleted"], count: 9 }`
- `engine.validate("EventName", "UserCreated")` ➔ `{ valid: true, matchedPattern: "${entity}${action}", captures: { entity: "User", action: "Created" } }`
- `engine.validate("EventName", "AdminDeleted")` ➔ `{ valid: false, matchedPattern: null, captures: null }`
- `engine.generate("EventName")` ➔ `"type EventName = 'UserCreated' | 'UserUpdated' | 'UserDeleted' | 'ProductCreated' | 'ProductUpdated' | 'ProductDeleted' | 'OrderCreated' | 'OrderUpdated' | 'OrderDeleted'"`
- `engine.extract("getUserById", "${method}${Entity}By${Key}")` ➔ `{ method: "get", Entity: "User", Key: "Id" }`
- `engine.buildEventNames(["User", "Order"], ["Created", "Deleted"])` ➔
  `"UserCreated | UserDeleted | OrderCreated | OrderDeleted"`
- `engine.getReport()` ➔ `{ totalTemplates: 1, totalCombinations: 9, validations: 2 }`

---

## 🧩 PROBLEM–05: 🔐 Type Assertion & Assertion Function Engine

⚠️ **Function Name:** `createTypeAssertionEngine()`

| Input      | `config` (object)            |
| :--------- | :--------------------------- |
| **Output** | object (assertion API)       |

**Rules:**

`config` object:

- `strict` (boolean) — only allow safe assertions
- `logAssertions` (boolean) — track all assertions made

**Type Assertion Engine API (returned object):**

- `as(value, targetType)` → simulates `value as TargetType`
  - Safe: value is structurally compatible → `{ asserted, type, safe: true }`
  - Unsafe: not compatible → if `strict: true` → `"Unsafe Assertion"`, else proceed with warning
  - Returns `{ asserted, type, safe, warning }`
- `assertIs(value, typeName, validator)` → simulates assertion function `asserts value is T`
  - `validator(value) → boolean`
  - If fails → returns `{ passed: false, error: "Assertion failed: value is not T" }`
  - If passes → returns `{ passed: true, assertedType: typeName }`
- `doubleAssertion(value, intermediate, target)` → simulates `value as unknown as Target`
  - Returns `{ original, intermediate, final, dangerLevel: "low" | "medium" | "high" }`
- `satisfies(value, typeName, shape)` → simulates `satisfies` operator
  - Validates value satisfies type without widening
  - Returns `{ satisfies, inferredType, targetType, errors }`
- `getAssertionLog()` → returns all assertion records
- `getReport()` → returns `{ totalAssertions, safe, unsafe, assertionFunctions, satisfies }`

| Challenge 📢 | Return assertion engine API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createTypeAssertionEngine({ strict: true, logAssertions: true })`
- `engine.as("hello", "string")` ➔ `{ asserted: "hello", type: "string", safe: true, warning: null }`
- `engine.as(42, "string")` ➔ `{ asserted: null, type: "string", safe: false, warning: "Unsafe Assertion: number is not assignable to string" }`
- `engine.assertIs({ id: 1, name: "Rahim" }, "User", (v) => typeof v.id === "number" && typeof v.name === "string")` ➔
  `{ passed: true, assertedType: "User" }`
- `engine.assertIs("notAUser", "User", (v) => typeof v === "object" && v !== null)` ➔
  `{ passed: false, error: "Assertion failed: value is not User" }`
- `engine.doubleAssertion("hello", "unknown", "number")` ➔
  `{ original: "string", intermediate: "unknown", final: "number", dangerLevel: "high" }`
- `engine.satisfies({ theme: "dark", fontSize: 14 }, "Config", { theme: "string", fontSize: "number" })` ➔
  `{ satisfies: true, inferredType: "{ theme: string; fontSize: number }", targetType: "Config", errors: {} }`
- `engine.satisfies({ theme: 123, fontSize: 14 }, "Config", { theme: "string", fontSize: "number" })` ➔
  `{ satisfies: false, inferredType: "{ theme: number; fontSize: number }", targetType: "Config", errors: { theme: "Expected string, got number" } }`
- `engine.getReport()` ➔ `{ totalAssertions: 6, safe: 3, unsafe: 1, assertionFunctions: 2, satisfies: 2 }`

---