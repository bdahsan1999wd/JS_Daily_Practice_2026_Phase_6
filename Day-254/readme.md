# 🎓 JS DAILY PRACTICE – DAY-254

📅 **Goal:** Scope & Variable Lifecycle Deep Dive Engine
🎯 **Focus:** var/let/const Internals • Temporal Dead Zone • Lexical Environment • Block Scope • Variable Shadowing

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔬 Variable Declaration Behavior Analyzer

⚠️ **Function Name:** `analyzeDeclarations()`

| Input      | `declarations` (array of objects) |
| :--------- | :-------------------------------- |
| **Output** | array of objects                  |

**Rules:**

Each declaration object:

- `keyword` → `"var"` | `"let"` | `"const"`
- `name` (string) — variable name
- `scope` → `"global"` | `"function"` | `"block"`
- `accessedBeforeInit` (boolean) — whether accessed before initialization

**Analysis Rules:**

| Keyword | Scope | Hoisted | TDZ | Re-declarable | Re-assignable |
| :------ | :---- | :------ | :-- | :------------ | :------------ |
| `var` | function | ✅ (`undefined`) | ❌ | ✅ | ✅ |
| `let` | block | ✅ (TDZ) | ✅ | ❌ | ✅ |
| `const` | block | ✅ (TDZ) | ✅ | ❌ | ❌ |

- If `accessedBeforeInit: true` AND keyword is `var` → `hoistedValue: "undefined"`
- If `accessedBeforeInit: true` AND keyword is `let`/`const` → `hoistedValue: "ReferenceError: TDZ"`

| Challenge 📢 | Return array with `name`, `keyword`, `scope`, `hoistedValue`, `inTDZ`, `reDeclarable`, `reAssignable`. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `analyzeDeclarations([`
  `{ keyword: "var", name: "age", scope: "function", accessedBeforeInit: true },`
  `{ keyword: "let", name: "city", scope: "block", accessedBeforeInit: true },`
  `{ keyword: "const", name: "PI", scope: "block", accessedBeforeInit: false }`
  `])` ➔
  `[`
  `{ name: "age", keyword: "var", scope: "function", hoistedValue: "undefined", inTDZ: false, reDeclarable: true, reAssignable: true },`
  `{ name: "city", keyword: "let", scope: "block", hoistedValue: "ReferenceError: TDZ", inTDZ: true, reDeclarable: false, reAssignable: true },`
  `{ name: "PI", keyword: "const", scope: "block", hoistedValue: null, inTDZ: false, reDeclarable: false, reAssignable: false }`
  `]`

---

## 🧩 PROBLEM–02: 🌒 Variable Shadowing Detector

⚠️ **Function Name:** `detectVariableShadowing()`

| Input      | `scopes` (array of objects) |
| :--------- | :-------------------------- |
| **Output** | object                      |

**Rules:**

Each scope object:

- `scopeName` (string)
- `parentScope` (string or `null`)
- `variables` (array of strings) — variable names declared in this scope

**Shadowing Rules:**

- A variable **shadows** a parent scope variable if both have the **same name**
- Track all shadowing pairs: `{ variable, innerScope, outerScope }`
- A variable can shadow across **multiple levels** (grandparent, great-grandparent)

| Challenge 📢 | Return `{ shadowingPairs, totalShadows, cleanScopes }`. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `detectVariableShadowing([`
  `{ scopeName: "global", parentScope: null, variables: ["x", "y", "z"] },`
  `{ scopeName: "outer", parentScope: "global", variables: ["x", "a"] },`
  `{ scopeName: "inner", parentScope: "outer", variables: ["x", "y", "b"] }`
  `])` ➔
  `{`
  `shadowingPairs: [`
  `{ variable: "x", innerScope: "outer", outerScope: "global" },`
  `{ variable: "x", innerScope: "inner", outerScope: "outer" },`
  `{ variable: "x", innerScope: "inner", outerScope: "global" },`
  `{ variable: "y", innerScope: "inner", outerScope: "global" }`
  `],`
  `totalShadows: 4,`
  `cleanScopes: ["global"]`
  `}`

---

## 🧩 PROBLEM–03: 🧱 Block Scope Boundary Analyzer

⚠️ **Function Name:** `analyzeBlockScope()`

| Input      | `codeBlocks` (array of objects) |
| :--------- | :------------------------------ |
| **Output** | object                          |

**Rules:**

Each code block object:

- `blockId` (string)
- `parentBlock` (string or `null`)
- `declarations` (array of objects):
  - `keyword` → `"var"` | `"let"` | `"const"`
  - `name` (string)

**Analysis Rules:**

- `let` / `const` → scoped to their **own block** only
- `var` → leaks up to the nearest **function scope** (or global if no function)
- Identify variables **accessible** from each block (own + parent `var` leaks + parent `let`/`const` if same block)
- Identify **leaked vars** — `var` declarations that escape their block

| Challenge 📢 | Return `{ blockAccessMap, leakedVars }`. If invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------- |

**Sample Input & Output:**

- `analyzeBlockScope([`
  `{ blockId: "function", parentBlock: null, declarations: [{ keyword: "var", name: "a" }] },`
  `{ blockId: "ifBlock", parentBlock: "function", declarations: [{ keyword: "let", name: "b" }, { keyword: "var", name: "c" }] },`
  `{ blockId: "forBlock", parentBlock: "ifBlock", declarations: [{ keyword: "const", name: "d" }] }`
  `])` ➔
  `{`
  `blockAccessMap: {`
  `function: ["a", "c"],`
  `ifBlock: ["a", "b", "c"],`
  `forBlock: ["a", "b", "c", "d"]`
  `},`
  `leakedVars: ["c"]`
  `}`

---

## 🧩 PROBLEM–04: 🔀 Lexical Environment Chain Builder

⚠️ **Function Name:** `buildLexicalEnvironment()`

| Input      | `functions` (array of objects) |
| :--------- | :----------------------------- |
| **Output** | object                         |

**Rules:**

Each function object:

- `name` (string)
- `definedIn` (string or `null`) — name of the scope where this function was **defined** (lexical parent)
- `variables` (object) — local variables key/value

**Lexical Environment Rules:**

- Each function carries a reference to its **outer lexical environment** (where it was defined, NOT where it is called)
- Variable lookup: check own env → outer env → outer's outer → ... → global
- Build the full **lexical chain** for each function

| Challenge 📢 | Return `{ functionName, lexicalChain, resolvedEnv }` for each function. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------------------------ |

**Sample Input & Output:**

- `buildLexicalEnvironment([`
  `{ name: "global", definedIn: null, variables: { x: 1, y: 2 } },`
  `{ name: "outer", definedIn: "global", variables: { y: 99, z: 3 } },`
  `{ name: "inner", definedIn: "outer", variables: { z: 42 } }`
  `])` ➔
  `[`
  `{ functionName: "global", lexicalChain: ["global"], resolvedEnv: { x: 1, y: 2 } },`
  `{ functionName: "outer", lexicalChain: ["outer", "global"], resolvedEnv: { x: 1, y: 99, z: 3 } },`
  `{ functionName: "inner", lexicalChain: ["inner", "outer", "global"], resolvedEnv: { x: 1, y: 99, z: 42 } }`
  `]`

---

## 🧩 PROBLEM–05: ⚠️ Temporal Dead Zone Violation Detector

⚠️ **Function Name:** `detectTDZViolations()`

| Input      | `operations` (array of objects) |
| :--------- | :------------------------------ |
| **Output** | object                          |

**Rules:**

Each operation object:

- `type` → `"declare"` | `"access"` | `"assign"`
- `keyword` → `"var"` | `"let"` | `"const"` (only for `"declare"`)
- `name` (string) — variable name
- `order` (number) — execution order (1, 2, 3...)

**TDZ Rules:**

- `let` / `const` enter TDZ from the **start of their block** until their `"declare"` operation
- Any `"access"` or `"assign"` before `"declare"` for `let`/`const` → **TDZ Violation**
- `var` → never TDZ violation (hoisted as `undefined`)
- `const` → no `"assign"` after `"declare"` allowed → **Re-assignment Violation**

| Challenge 📢 | Return `{ tdzViolations, reAssignViolations, safeOperations }`. If invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `detectTDZViolations([`
  `{ type: "access", name: "x", order: 1 },`
  `{ type: "declare", keyword: "let", name: "x", order: 2 },`
  `{ type: "declare", keyword: "const", name: "PI", order: 3 },`
  `{ type: "assign", name: "PI", order: 4 },`
  `{ type: "declare", keyword: "var", name: "age", order: 5 },`
  `{ type: "access", name: "age", order: 6 }`
  `])` ➔
  `{`
  `tdzViolations: [{ name: "x", accessOrder: 1, declareOrder: 2 }],`
  `reAssignViolations: [{ name: "PI", assignOrder: 4 }],`
  `safeOperations: ["age"]`
  `}`

---