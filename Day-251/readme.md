# 🎓 JS DAILY PRACTICE – DAY-251

📅 **Goal:** JavaScript Runtime Internals Engine (Closure, Scope & Execution Model)
🎯 **Focus:** Execution Context • Lexical Scope • Closure • Hoisting • Call Stack Simulation

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔒 Closure-Based Counter Engine

⚠️ **Function Name:** `createCounter()`

| Input      | `config` (object)    |
| :--------- | :------------------- |
| **Output** | object (counter API) |

**Rules:**

`config` object:

- `start` (number) — initial value
- `step` (number) — increment/decrement amount
- `min` (number) — lower boundary
- `max` (number) — upper boundary

**Counter API (returned object):**

- `increment()` → increases by `step` (cannot exceed `max`)
- `decrement()` → decreases by `step` (cannot go below `min`)
- `reset()` → returns to `start`
- `getCount()` → returns current value

**Rules:**

- All state must be **private** (closure-based, no external access)
- Boundary violations → stay at boundary value (no error)

| Challenge 📢 | Return counter API object. If config is invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------ |

**Sample Input & Output:**

- `const counter = createCounter({ start: 0, step: 1, min: 0, max: 3 })`
- `counter.increment()` ➔ `1`
- `counter.increment()` ➔ `2`
- `counter.decrement()` ➔ `1`
- `counter.reset()` ➔ `0`
- `counter.getCount()` ➔ `0`

---

## 🧩 PROBLEM–02: 🔍 Scope Chain Resolver

⚠️ **Function Name:** `resolveScopeChain()`

| Input      | `scopeTree` (array of objects) |
| :--------- | :----------------------------- |
| **Output** | object                         |

**Rules:**

Each scope object:

- `scopeName` (string)
- `variables` (object — key/value pairs)
- `parentScope` (string or `null`)

**Resolution Rules:**

- Look up a variable starting from the **innermost** scope
- If not found → walk up the `parentScope` chain
- If not found in any scope → `"undefined"`

| Challenge 📢 | Return `{ variable: resolvedValue }` for each lookup. If invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `resolveScopeChain(`
  `[`
  `{ scopeName: "global", variables: { x: 10, y: 20 }, parentScope: null },`
  `{ scopeName: "outer", variables: { y: 99, z: 5 }, parentScope: "global" },`
  `{ scopeName: "inner", variables: { z: 42 }, parentScope: "outer" }`
  `],`
  `"inner",`
  `["x", "y", "z", "w"]`
  `)` ➔
  `{ x: 10, y: 99, z: 42, w: "undefined" }`

---

## 🧩 PROBLEM–03: ⏫ Hoisting Behavior Simulator

⚠️ **Function Name:** `simulateHoisting()`

| Input      | `declarations` (array of objects) |
| :--------- | :-------------------------------- |
| **Output** | object                            |

**Rules:**

Each declaration object:

- `type` → `"var"` | `"let"` | `"const"` | `"function"`
- `name` (string)
- `value` (any)

**Hoisting Rules:**

- `var` → hoisted with value `undefined`
- `let` / `const` → hoisted but in **Temporal Dead Zone** → `"TDZ"`
- `function` → hoisted with **full value**

| Challenge 📢 | Return object showing the **pre-execution hoisted state** of all declarations. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------------------------------ |

**Sample Input & Output:**

- `simulateHoisting([`
  `{ type: "var", name: "age", value: 25 },`
  `{ type: "let", name: "city", value: "Dhaka" },`
  `{ type: "const", name: "PI", value: 3.14 },`
  `{ type: "function", name: "greet", value: "function greet(){}" }`
  `])` ➔
  `{`
  `age: "undefined",`
  `city: "TDZ",`
  `PI: "TDZ",`
  `greet: "function greet(){}"`
  `}`

---

## 🧩 PROBLEM–04: 📞 Call Stack Execution Tracer

⚠️ **Function Name:** `traceCallStack()`

| Input      | `callSequence` (array of objects) |
| :--------- | :-------------------------------- |
| **Output** | object                            |

**Rules:**

Each call object:

- `fn` (string) — function name
- `action` → `"call"` | `"return"`

**Simulation Rules:**

- `"call"` → push to call stack
- `"return"` → pop from call stack
- Track **max stack depth** reached
- Detect **stack underflow** (return on empty stack) → flag as error

| Challenge 📢 | Return `{ finalStack, maxDepth, hasError }`. If invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------------------- |

**Sample Input & Output:**

- `traceCallStack([`
  `{ fn: "main", action: "call" },`
  `{ fn: "fetchData", action: "call" },`
  `{ fn: "parseJSON", action: "call" },`
  `{ fn: "parseJSON", action: "return" },`
  `{ fn: "fetchData", action: "return" }`
  `])` ➔
  `{`
  `finalStack: ["main"],`
  `maxDepth: 3,`
  `hasError: false`
  `}`

---

## 🧩 PROBLEM–05: ⚡ Microtask vs Macrotask Execution Scheduler

⚠️ **Function Name:** `scheduleTaskQueue()`

| Input      | `tasks` (array of objects) |
| :--------- | :------------------------- |
| **Output** | array (execution order)    |

**Rules:**

Each task object:

- `name` (string)
- `type` → `"sync"` | `"microtask"` | `"macrotask"`

**Execution Order Rules (Event Loop):**

1. All `"sync"` tasks run **first** (in order)
2. All `"microtask"` tasks run **next** (in order)
3. All `"macrotask"` tasks run **last** (in order)

| Challenge 📢 | Return array of task names in correct execution order. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------ |

**Sample Input & Output:**

- `scheduleTaskQueue([`
  `{ name: "scriptStart", type: "sync" },`
  `{ name: "setTimeout_CB", type: "macrotask" },`
  `{ name: "promise_CB", type: "microtask" },`
  `{ name: "scriptEnd", type: "sync" },`
  `{ name: "queueMicrotask_CB", type: "microtask" }`
  `])` ➔
  `[`
  `"scriptStart",`
  `"scriptEnd",`
  `"promise_CB",`
  `"queueMicrotask_CB",`
  `"setTimeout_CB"`
  `]`

---
