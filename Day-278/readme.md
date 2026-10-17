# 🎓 JS DAILY PRACTICE – DAY-278

📅 **Goal:** Module 4 — TypeScript Mixed Revision & Mastery Test
🎯 **Focus:** Type System • Interfaces • Union/Intersection • Generics • Utility Types • Advanced Types — All Combined

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔬 TypeScript Type System Analyzer

⚠️ **Function Name:** `analyzeTypeSystem()`

| Input      | `definitions` (array of objects) |
| :--------- | :------------------------------- |
| **Output** | object                           |

**Rules:**

Each definition object:

- `name` (string)
- `kind` → `"type"` | `"interface"` | `"enum"` | `"union"` | `"intersection"` | `"generic"`
- `definition` (string) — TypeScript definition string
- `members` (array of strings) — member names or types

**Analysis Rules:**

- Parse each definition and identify:
  - All member types
  - Nullable members (`null` or `undefined` in union)
  - Readonly members
  - Optional members
  - Generic type parameters
- Detect **structural compatibility** between types
- Detect **circular references** (type A references type B which references type A)
- Calculate **complexity score** (0–100):
  - +10 per member
  - +20 if has generics
  - +15 if has union members
  - +10 if has intersection
  - +5 if has optional members

| Challenge 📢 | Return `{ analysisMap, circularRefs, compatibilityMatrix, complexityScores }`. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------------------------------ |

**Sample Input & Output:**

- `analyzeTypeSystem([`
  `{ name: "User", kind: "interface", definition: "interface User { id: number; name: string; email?: string; }", members: ["id", "name", "email"] },`
  `{ name: "AdminUser", kind: "intersection", definition: "type AdminUser = User & { role: string; permissions: string[] }", members: ["role", "permissions"] },`
  `{ name: "Response", kind: "generic", definition: "type Response<T> = { data: T; status: number; message: string }", members: ["data", "status", "message"] }`
  `])` ➔
  `{`
  `analysisMap: {`
  `User: { memberCount: 3, optional: ["email"], readonly: [], nullable: [], generics: [], complexity: 35 },`
  `AdminUser: { memberCount: 2, optional: [], readonly: [], nullable: [], generics: [], complexity: 30 },`
  `Response: { memberCount: 3, optional: [], readonly: [], nullable: [], generics: ["T"], complexity: 50 }`
  `},`
  `circularRefs: [],`
  `compatibilityMatrix: { AdminUser_extends_User: true },`
  `complexityScores: [{ name: "Response", score: 50 }, { name: "User", score: 35 }, { name: "AdminUser", score: 30 }]`
  `}`

---

## 🧩 PROBLEM–02: 🏗️ Full TypeScript API Type System

⚠️ **Function Name:** `buildAPITypeSystem()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (type system API) |

**Rules:**

`config` object:

- `apiName` (string)
- `version` (string)
- `strict` (boolean)
- `entities` (array of objects):
  - `name`, `properties`: `{ name, type, optional, readonly }`

**Full API Type System Architecture:**

- **Generic Response Wrapper:** `ApiResponse<T>` → `{ data: T; status: number; message: string; timestamp: number }`
- **Paginated Response:** `PaginatedResponse<T>` → `{ data: T[]; page: number; pageSize: number; total: number; totalPages: number }`
- **Error Type:** `ApiError` → `{ code: string; message: string; details?: unknown }`
- **For each entity** → auto-generate:
  - Base interface
  - `CreateDTO` → `Omit<T, "id" | "createdAt" | "updatedAt"> `
  - `UpdateDTO` → `Partial<Omit<T, "id">>`
  - `ResponseType` → `Readonly<T>`
  - `ListResponse` → `PaginatedResponse<T>`

**API (returned object):**

- `getEntityTypes(entityName)` → returns all generated types for entity
- `validateRequest(entityName, dtoType, data)` → validates against DTO type
- `generateDeclarations()` → returns full TypeScript declaration string
- `simulate(entityName, operation, data)` → simulates API operation:
  - `operation` → `"create"` | `"update"` | `"list"` | `"get"`
  - Returns typed response wrapped in `ApiResponse<T>`
- `getReport()` → returns `{ apiName, version, totalEntities, totalGeneratedTypes }`

| Challenge 📢 | Return API type system. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------ |

**Sample Input & Output:**

- `const api = buildAPITypeSystem({`
  `apiName: "ShopAPI", version: "v1", strict: true,`
  `entities: [{ name: "Product", properties: [`
  `{ name: "id", type: "number", optional: false, readonly: true },`
  `{ name: "name", type: "string", optional: false, readonly: false },`
  `{ name: "price", type: "number", optional: false, readonly: false },`
  `{ name: "stock", type: "number", optional: true, readonly: false },`
  `{ name: "createdAt", type: "string", optional: false, readonly: true }`
  `] }]`
  `})`
- `api.getEntityTypes("Product")` ➔
  `{`
  `Base: "interface Product { readonly id: number; name: string; price: number; stock?: number; readonly createdAt: string; }",`
  `CreateDTO: "type CreateProductDTO = Omit<Product, 'id' | 'createdAt'>",`
  `UpdateDTO: "type UpdateProductDTO = Partial<Omit<Product, 'id'>>",`
  `ResponseType: "type ProductResponse = Readonly<Product>",`
  `ListResponse: "type ProductListResponse = PaginatedResponse<Product>"`
  `}`
- `api.validateRequest("Product", "CreateDTO", { name: "Laptop", price: 50000, stock: 10 })` ➔
  `{ valid: true, errors: {} }`
- `api.simulate("Product", "create", { name: "Laptop", price: 50000 })` ➔
  `{ data: { id: 1, name: "Laptop", price: 50000, createdAt: "2024-01-01" }, status: 201, message: "Created", timestamp: 1704067200 }`
- `api.getReport()` ➔ `{ apiName: "ShopAPI", version: "v1", totalEntities: 1, totalGeneratedTypes: 7 }`

---

## 🧩 PROBLEM–03: 🎯 Generic Type-Safe Event System

⚠️ **Function Name:** `buildTypeSafeEventSystem()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (event system API)  |

**Rules:**

`config` object:

- `systemName` (string)
- `strict` (boolean)
- `events` (array of objects):
  - `name` (string) — event name
  - `payloadType` (object) — `{ field: type }` shape of event payload

**Type-Safe Event System combines:**

- **Discriminated Union** → all events form `EventMap` union
- **Generic EventEmitter** → `EventEmitter<EventMap>`
- **Type Guards** → narrow event payload by event name
- **Template Literal Types** → generate `"on${EventName}"` handler names
- **Utility Types** → `Pick<EventMap, EventName>` for specific events

**Event System API (returned object):**

- `defineEvent(name, payloadShape)` → registers typed event
- `on(eventName, handler)` → registers typed handler
  - Validates handler receives correct payload type
- `emit(eventName, payload)` → fires event with type-validated payload
  - Returns `{ emitted, subscriberCount, payloadValid, errors }`
- `getEventType(eventName)` → returns payload type string
- `generateEventMap()` → returns TypeScript EventMap type string
- `getHandlerNames()` → returns `["onUserCreated", "onOrderPlaced", ...]` style names
- `getReport()` → returns `{ totalEvents, totalHandlers, totalEmitted, typeErrors }`

| Challenge 📢 | Return event system API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------- |

**Sample Input & Output:**

- `const system = buildTypeSafeEventSystem({`
  `systemName: "AppEvents", strict: true,`
  `events: [`
  `{ name: "UserCreated", payloadType: { userId: "number", name: "string", email: "string" } },`
  `{ name: "OrderPlaced", payloadType: { orderId: "number", userId: "number", total: "number" } },`
  `{ name: "PaymentFailed", payloadType: { orderId: "number", reason: "string" } }`
  `]`
  `})`
- `system.on("UserCreated", (payload) => "User: " + payload.name)`
- `system.emit("UserCreated", { userId: 1, name: "Rahim", email: "r@mail.com" })` ➔
  `{ emitted: true, subscriberCount: 1, payloadValid: true, errors: {} }`
- `system.emit("UserCreated", { userId: "one", name: "Rahim" })` ➔
  `{ emitted: false, subscriberCount: 0, payloadValid: false, errors: { userId: "Expected number, got string", email: "Required field missing" } }`
- `system.generateEventMap()` ➔
  `"type EventMap = {\n  UserCreated: { userId: number; name: string; email: string };\n  OrderPlaced: { orderId: number; userId: number; total: number };\n  PaymentFailed: { orderId: number; reason: string };\n}"`
- `system.getHandlerNames()` ➔ `["onUserCreated", "onOrderPlaced", "onPaymentFailed"]`
- `system.getReport()` ➔ `{ totalEvents: 3, totalHandlers: 1, totalEmitted: 1, typeErrors: 1 }`

---

## 🧩 PROBLEM–04: 🔄 TypeScript Type Transformer Engine

⚠️ **Function Name:** `buildTypeTransformer()`

| Input      | `config` (object)            |
| :--------- | :--------------------------- |
| **Output** | object (transformer API)     |

**Rules:**

`config` object:

- `types` (object) — registered types `{ name: properties }`
- `strict` (boolean)
- `trackHistory` (boolean)

**Type Transformer — combines ALL M4 utility & advanced types:**

- **Utility Transforms:** `Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`
- **Conditional Transforms:** `NonNullable`, `Exclude`, `Extract`
- **Mapped Transforms:** make all values arrays, make all nullable, deep readonly
- **Generic Transforms:** wrap in `Promise<T>`, `Array<T>`, `Record<string, T>`
- **Inference:** extract `ReturnType`, `Parameters`, infer from conditional

**Transformer API (returned object):**

- `transform(typeName, ...operations)` → chains transformations
  - Returns `{ result, typeString, lineage }`
- `inferFrom(typeString, pattern)` → infers inner type
  - Returns `{ inferred, pattern, original }`
- `compose(name, typeA, operator, typeB)` → combines types:
  - `operator` → `"union"` | `"intersection"` | `"exclude"` | `"extract"`
- `generateVariants(typeName)` → generates common variants:
  - `Partial`, `Required`, `Readonly`, `Nullable`, `Array`, `Promise`, `Record`
- `validate(transformResult, value)` → validates value against transformed type
- `getHistory()` → returns all transformation history
- `getReport()` → returns `{ totalTransforms, chainedOps, generatedVariants }`

| Challenge 📢 | Return transformer API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------ |

**Sample Input & Output:**

- `const transformer = buildTypeTransformer({`
  `types: { User: { id: { type: "number", optional: false, readonly: true }, name: { type: "string", optional: false, readonly: false }, email: { type: "string", optional: true, readonly: false } } },`
  `strict: true, trackHistory: true`
  `})`
- `transformer.transform("User", "Partial", ["Omit", ["id"]], "Readonly")` ➔
  `{`
  `result: { name: { type: "string", optional: true, readonly: true }, email: { type: "string", optional: true, readonly: true } },`
  `typeString: "Readonly<Omit<Partial<User>, 'id'>>",`
  `lineage: ["User", "Partial<User>", "Omit<Partial<User>, 'id'>", "Readonly<Omit<Partial<User>, 'id'>>"]`
  `}`
- `transformer.compose("AdminOrUser", "User", "union", "Admin")` ➔
  `{ result: "User | Admin", typeString: "User | Admin", lineage: ["User", "Admin"] }`
- `transformer.generateVariants("User")` ➔
  `{`
  `Partial: "Partial<User>",`
  `Required: "Required<User>",`
  `Readonly: "Readonly<User>",`
  `Nullable: "User | null",`
  `Array: "User[]",`
  `Promise: "Promise<User>",`
  `Record: "Record<string, User>"`
  `}`
- `transformer.getReport()` ➔ `{ totalTransforms: 3, chainedOps: 3, generatedVariants: 7 }`

---

## 🧩 PROBLEM–05: 🏆 TypeScript Master Engine — All M4 Concepts Combined

⚠️ **Function Name:** `buildTypeScriptMaster()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (master API)      |

**Rules:**

`config` object:

- `projectName` (string)
- `strict` (boolean)
- `target` → `"es5"` | `"es6"` | `"esnext"`
- `entities` (array of strings) — entity names to scaffold

**TypeScript Master combines ALL M4 concepts:**

- **Type System** → primitives, arrays, tuples, inference
- **Interfaces** → definition, merging, extension, index signatures
- **Union/Intersection** → discriminated unions, type guards, narrowing
- **Generics** → generic functions, classes, constraints, conditional
- **Utility Types** → Partial, Required, Pick, Omit, Record, ReturnType
- **Advanced Types** → unknown, never, enums, template literals, assertions, satisfies

**Master API (returned object):**

- `scaffold(entityName, fields[])` → generates full type scaffold:
  - Base interface, CreateDTO, UpdateDTO, ResponseType, ListResponse
  - Enum for status, Generic repository type, Event types
- `validate(entityName, dtoType, data)` → validates with full type checking
- `infer(value)` → infers TypeScript type string
- `generate()` → generates complete `.d.ts` declaration file content
- `checkAssignment(source, target)` → checks type assignability
- `getTypeStats()` → returns comprehensive type statistics
- `getFullReport()` → returns complete M4 mastery report:
  - `{ projectName, target, entities, totalTypes, generatedLines, typeErrors, coverage }`

| Challenge 📢 | Return master API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const master = buildTypeScriptMaster({ projectName: "ShopApp", strict: true, target: "esnext", entities: ["User", "Product"] })`
- `master.scaffold("User", [{ name: "id", type: "number", readonly: true }, { name: "name", type: "string" }, { name: "email", type: "string", optional: true }, { name: "role", type: "'admin' | 'user' | 'guest'" }])` ➔
  `{`
  `interface: "interface User { readonly id: number; name: string; email?: string; role: 'admin' | 'user' | 'guest'; }",`
  `CreateDTO: "type CreateUserDTO = Omit<User, 'id'>",`
  `UpdateDTO: "type UpdateUserDTO = Partial<Omit<User, 'id'>>",`
  `ResponseType: "type UserResponse = Readonly<User>",`
  `ListResponse: "type UserListResponse = PaginatedResponse<User>",`
  `StatusEnum: "enum UserStatus { Active = 'active', Inactive = 'inactive', Pending = 'pending' }",`
  `Repository: "type UserRepository = Repository<User, number>",`
  `Events: "type UserEvents = 'UserCreated' | 'UserUpdated' | 'UserDeleted'"`
  `}`
- `master.infer({ id: 1, name: "Rahim", active: true, tags: ["js", "ts"] })` ➔
  `"{ id: number; name: string; active: boolean; tags: string[] }"`
- `master.checkAssignment("CreateUserDTO", "User")` ➔
  `{ assignable: false, reason: "CreateUserDTO is missing readonly id: number" }`
- `master.getFullReport()` ➔
  `{`
  `projectName: "ShopApp",`
  `target: "esnext",`
  `entities: ["User", "Product"],`
  `totalTypes: 16,`
  `generatedLines: 48,`
  `typeErrors: 0,`
  `coverage: "100%"`
  `}`

---