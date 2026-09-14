# 🎓 JS DAILY PRACTICE – DAY-257

📅 **Goal:** Module 1 — JS Internals Mixed Revision & Mastery Test
🎯 **Focus:** Execution Context • Closure • Scope • Event Loop • Memory • Performance — All Combined

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🧠 JS Runtime Internals Analyzer

⚠️ **Function Name:** `analyzeRuntimeBehavior()`

| Input      | `program` (array of objects) |
| :--------- | :--------------------------- |
| **Output** | object                       |

**Rules:**

Each program instruction object:

- `type` → `"declare"` | `"call"` | `"return"` | `"schedule"`
- `keyword` → `"var"` | `"let"` | `"const"` (only for `"declare"`)
- `name` (string) — variable or function name
- `scheduleType` → `"microtask"` | `"macrotask"` (only for `"schedule"`)
- `order` (number) — instruction sequence number

**Analysis Rules:**

- Track **hoisting state** of all declarations before execution
- Track **call stack** changes from `"call"` and `"return"` instructions
- Track **execution queue order** from `"schedule"` instructions
- Detect any **TDZ violations** (access before `let`/`const` declaration)

| Challenge 📢 | Return `{ hoistingMap, callStackTrace, executionOrder, tdzViolations }`. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------------------------ |

**Sample Input & Output:**

- `analyzeRuntimeBehavior([`
  `{ type: "declare", keyword: "var", name: "x", order: 1 },`
  `{ type: "declare", keyword: "let", name: "y", order: 2 },`
  `{ type: "call", name: "fetchData", order: 3 },`
  `{ type: "schedule", name: "promise_CB", scheduleType: "microtask", order: 4 },`
  `{ type: "schedule", name: "timeout_CB", scheduleType: "macrotask", order: 5 },`
  `{ type: "return", name: "fetchData", order: 6 }`
  `])` ➔
  `{`
  `hoistingMap: { x: "undefined", y: "TDZ" },`
  `callStackTrace: ["fetchData pushed", "fetchData popped"],`
  `executionOrder: ["promise_CB", "timeout_CB"],`
  `tdzViolations: []`
  `}`

---

## 🧩 PROBLEM–02: 🔒 Advanced Closure System

⚠️ **Function Name:** `createAdvancedClosureSystem()`

| Input      | `config` (object)   |
| :--------- | :------------------ |
| **Output** | object (system API) |

**Rules:**

`config` object:

- `name` (string) — system name
- `maxOperations` (number) — max total operations allowed
- `enableMemo` (boolean) — whether to cache function results

**System API (returned object):**

- `register(fnName, fn)` → registers a named function
- `execute(fnName, ...args)` → executes registered function
  - If `enableMemo: true` → cache result, return cached on same args
  - If `maxOperations` exceeded → return `"Operation Limit Reached"`
- `curry(fnName)` → returns curried version of registered function
- `getStats()` → returns `{ totalExecutions, cacheHits, registeredFunctions, remainingOps }`
- `reset()` → clears cache and resets operation count

**Rules:**

- All state **private** (closure-based)
- Unregistered function execution → return `"Function Not Found"`

| Challenge 📢 | Return system API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const system = createAdvancedClosureSystem({ name: "mathSystem", maxOperations: 5, enableMemo: true })`
- `system.register("add", (a, b) => a + b)`
- `system.execute("add", 2, 3)` ➔ `5` _(miss)_
- `system.execute("add", 2, 3)` ➔ `5` _(cache hit)_
- `system.execute("add", 4, 5)` ➔ `9` _(miss)_
- `system.execute("unknown", 1)` ➔ `"Function Not Found"`
- `system.getStats()` ➔ `{ totalExecutions: 3, cacheHits: 1, registeredFunctions: 1, remainingOps: 2 }`

---

## 🧩 PROBLEM–03: 🔀 Full Scope & Memory Lifecycle Engine

⚠️ **Function Name:** `createScopeMemoryEngine()`

| Input      | `config` (object)   |
| :--------- | :------------------ |
| **Output** | object (engine API) |

**Rules:**

`config` object:

- `gcInterval` (number) — auto-GC runs every N operations
- `maxScopeDepth` (number) — maximum allowed scope nesting depth

**Engine API (returned object):**

- `pushScope(scopeName, variables)` → creates new nested scope with given variables
- `popScope()` → removes innermost scope, marks its variables eligible for GC
- `lookup(varName)` → resolves variable through scope chain (inner → outer)
- `runGC()` → manually triggers garbage collection, removes eligible objects
- `getState()` → returns `{ scopeStack, gcEligible, totalCollected, operationCount }`

**Rules:**

- Scope depth exceeding `maxScopeDepth` → return `"Max Depth Exceeded"`
- Lookup in empty scope stack → return `"No Active Scope"`
- Variable not found in any scope → return `"undefined"`
- Auto-GC triggers every `gcInterval` operations (push/pop/lookup each count as 1)
- All state **private** (closure-based)

| Challenge 📢 | Return engine API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createScopeMemoryEngine({ gcInterval: 3, maxScopeDepth: 2 })`
- `engine.pushScope("global", { x: 10, y: 20 })`
- `engine.pushScope("inner", { z: 30 })`
- `engine.lookup("x")` ➔ `10` _(found in global via chain — auto GC triggered)_
- `engine.popScope()`
- `engine.getState()` ➔
  `{`
  `scopeStack: ["global"],`
  `gcEligible: ["z"],`
  `totalCollected: 0,`
  `operationCount: 4`
  `}`
- `engine.runGC()`
- `engine.getState().totalCollected` ➔ `1`

---

## 🧩 PROBLEM–04: ⚡ Event Loop & Async Execution Master Engine

⚠️ **Function Name:** `createAsyncExecutionEngine()`

| Input      | `config` (object)   |
| :--------- | :------------------ |
| **Output** | object (engine API) |

**Rules:**

`config` object:

- `name` (string) — engine name
- `maxMacrotasks` (number) — max macrotasks allowed per cycle

**Engine API (returned object):**

- `addSync(name, fn)` → adds synchronous task
- `addMicrotask(name, fn)` → adds microtask (Promise-like)
- `addMacrotask(name, fn)` → adds macrotask (setTimeout-like)
- `run()` → executes all tasks in correct event loop order
  - Returns `{ executionLog, results, blockedTasks }`
- `getQueueState()` → returns `{ syncQueue, microtaskQueue, macrotaskQueue }`
- `reset()` → clears all queues

**Execution Order:**

1. All sync tasks (in order)
2. All microtasks (in order)
3. Macrotasks up to `maxMacrotasks` limit — rest go to `blockedTasks`

**Rules:**

- Each `fn` returns a value that gets logged in `results`
- All queues **private** (closure-based)

| Challenge 📢 | Return engine API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createAsyncExecutionEngine({ name: "loopEngine", maxMacrotasks: 2 })`
- `engine.addSync("main", () => "mainDone")`
- `engine.addMacrotask("timeout1", () => "t1Done")`
- `engine.addMicrotask("promise1", () => "p1Done")`
- `engine.addMacrotask("timeout2", () => "t2Done")`
- `engine.addMacrotask("timeout3", () => "t3Done")`
- `engine.run()` ➔
  `{`
  `executionLog: ["main", "promise1", "timeout1", "timeout2"],`
  `results: { main: "mainDone", promise1: "p1Done", timeout1: "t1Done", timeout2: "t2Done" },`
  `blockedTasks: ["timeout3"]`
  `}`

---

## 🧩 PROBLEM–05: 🏆 JS Internals Master Simulator

⚠️ **Function Name:** `createJSInternalsMaster()`

| Input      | `config` (object)   |
| :--------- | :------------------ |
| **Output** | object (master API) |

**Rules:**

`config` object:

- `name` (string) — simulator name
- `slowThreshold` (number) — ms threshold for slow execution flagging
- `memoryLimit` (number) — KB limit before memory warning
- `maxCallDepth` (number) — max call stack depth before overflow error

**Master API — combines ALL M1 concepts:**

- `declare(keyword, name, value)` → declares variable, tracks hoisting & TDZ
- `call(fnName, executionTime, memoryUsed)` → pushes to call stack, profiles performance
- `return(fnName)` → pops from call stack
- `schedule(name, type)` → schedules microtask or macrotask
- `runCycle()` → executes scheduled tasks in correct event loop order
- `getFullReport()` → returns:
  - `hoistingMap` — all declared variables and their hoisted state
  - `callStackState` — current call stack
  - `executionLog` — scheduled task execution order
  - `performanceIssues` — slow or memory-heavy calls
  - `memoryWarning` (boolean) — true if total memory exceeds `memoryLimit`
  - `stackOverflow` (boolean) — true if `maxCallDepth` was exceeded

| Challenge 📢 | Return master API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const master = createJSInternalsMaster({ name: "jsEngine", slowThreshold: 100, memoryLimit: 300, maxCallDepth: 3 })`
- `master.declare("var", "x", 10)`
- `master.declare("let", "y", 20)`
- `master.call("main", 50, 100)`
- `master.call("fetchData", 150, 120)`
- `master.call("parseJSON", 80, 90)`
- `master.schedule("promise_CB", "microtask")`
- `master.schedule("timeout_CB", "macrotask")`
- `master.return("parseJSON")`
- `master.return("fetchData")`
- `master.runCycle()`
- `master.getFullReport()` ➔
  `{`
  `hoistingMap: { x: "undefined", y: "TDZ" },`
  `callStackState: ["main"],`
  `executionLog: ["promise_CB", "timeout_CB"],`
  `performanceIssues: [{ fnName: "fetchData", executionTime: 150, issue: "Slow Call" }],`
  `memoryWarning: true,`
  `stackOverflow: false`
  `}`

---
