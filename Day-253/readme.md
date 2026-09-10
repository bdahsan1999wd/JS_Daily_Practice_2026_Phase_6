# 🎓 JS DAILY PRACTICE – DAY-253

📅 **Goal:** Event Loop Internals & Async Execution Model Engine
🎯 **Focus:** Event Loop • Microtask Queue • Macrotask Queue • Execution Order • Async Pattern Simulation

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔄 Event Loop Execution Order Predictor

⚠️ **Function Name:** `predictExecutionOrder()`

| Input      | `tasks` (array of objects) |
| :--------- | :------------------------- |
| **Output** | array (ordered task names) |

**Rules:**

Each task object:

- `name` (string) — task identifier
- `type` → `"sync"` | `"microtask"` | `"macrotask"` | `"animationFrame"`

**Execution Priority Order:**

1. `"sync"` — runs first (Call Stack)
2. `"microtask"` — runs after sync (Promise callbacks, queueMicrotask)
3. `"animationFrame"` — runs after microtasks (requestAnimationFrame)
4. `"macrotask"` — runs last (setTimeout, setInterval)

| Challenge 📢 | Return array of task names in correct execution order. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------ |

**Sample Input & Output:**

- `predictExecutionOrder([`
  `{ name: "script", type: "sync" },`
  `{ name: "setTimeout_CB", type: "macrotask" },`
  `{ name: "promise_CB", type: "microtask" },`
  `{ name: "rAF_CB", type: "animationFrame" },`
  `{ name: "scriptEnd", type: "sync" },`
  `{ name: "queueMicrotask_CB", type: "microtask" }`
  `])` ➔
  `[`
  `"script",`
  `"scriptEnd",`
  `"promise_CB",`
  `"queueMicrotask_CB",`
  `"rAF_CB",`
  `"setTimeout_CB"`
  `]`

---

## 🧩 PROBLEM–02: 📬 Async Task Queue Manager

⚠️ **Function Name:** `createTaskQueueManager()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (queue API)     |

**Rules:**

`config` object:

- `maxConcurrent` (number) — max tasks running at once
- `queueType` → `"fifo"` | `"lifo"` (First-In-First-Out or Last-In-First-Out)

**Queue API (returned object):**

- `enqueue(taskName, priority)` → adds task to queue
  - `priority` → `"high"` | `"normal"` | `"low"`
- `dequeue()` → removes & returns next task based on `queueType` and `priority`
  - Priority order: `"high"` → `"normal"` → `"low"`
- `peek()` → returns next task without removing
- `getQueueState()` → returns `{ pending, maxConcurrent, queueType }`

**Rules:**

- High priority tasks always dequeue before normal/low regardless of `queueType`
- Within same priority → follow `queueType` rule
- Empty queue dequeue → return `"Queue Empty"`

| Challenge 📢 | Return queue API object. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------- |

**Sample Input & Output:**

- `const queue = createTaskQueueManager({ maxConcurrent: 2, queueType: "fifo" })`
- `queue.enqueue("taskA", "normal")`
- `queue.enqueue("taskB", "high")`
- `queue.enqueue("taskC", "low")`
- `queue.enqueue("taskD", "high")`
- `queue.dequeue()` ➔ `{ taskName: "taskB", priority: "high" }`
- `queue.dequeue()` ➔ `{ taskName: "taskD", priority: "high" }`
- `queue.dequeue()` ➔ `{ taskName: "taskA", priority: "normal" }`
- `queue.getQueueState()` ➔ `{ pending: 1, maxConcurrent: 2, queueType: "fifo" }`

---

## 🧩 PROBLEM–03: 🔂 Promise Chain Simulator

⚠️ **Function Name:** `simulatePromiseChain()`

| Input      | `steps` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object                     |

**Rules:**

Each step object:

- `name` (string) — step identifier
- `status` → `"resolve"` | `"reject"`
- `value` (any) — resolved value or rejection reason
- `hasFinally` (boolean) — whether a `.finally()` runs after this step

**Simulation Rules:**

- Steps run in sequence (chained)
- First `"reject"` → skips all subsequent `"resolve"` steps → jumps to next `"reject"` step (`.catch()`)
- `hasFinally: true` → always runs regardless of resolve/reject
- Track execution log with order

| Challenge 📢 | Return `{ executionLog, finalStatus, finalValue }`. If invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `simulatePromiseChain([`
  `{ name: "fetchUser", status: "resolve", value: "userData", hasFinally: false },`
  `{ name: "parseData", status: "reject", value: "ParseError", hasFinally: true },`
  `{ name: "saveDB", status: "resolve", value: "saved", hasFinally: false },`
  `{ name: "handleError", status: "resolve", value: "errorHandled", hasFinally: false }`
  `])` ➔
  `{`
  `executionLog: ["fetchUser", "parseData", "finally:parseData", "handleError"],`
  `finalStatus: "resolve",`
  `finalValue: "errorHandled"`
  `}`

---

## 🧩 PROBLEM–04: ⚙️ Garbage Collection Eligibility Analyzer

⚠️ **Function Name:** `analyzeGCEligibility()`

| Input      | `memoryMap` (array of objects) |
| :--------- | :----------------------------- |
| **Output** | object                         |

**Rules:**

Each memory object:

- `id` (string) — object identifier
- `references` (array of strings) — IDs this object references
- `referencedBy` (array of strings) — IDs that reference this object

**GC Rules:**

- An object is **eligible for GC** if:
  - `referencedBy` is empty (nothing holds a reference to it)
- An object is **safe** if:
  - At least one other object references it
- Detect **circular references** — two objects referencing each other with no outside references → both GC eligible

| Challenge 📢 | Return `{ gcEligible: [], safe: [], circularGroups: [] }`. If invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `analyzeGCEligibility([`
  `{ id: "A", references: ["B"], referencedBy: [] },`
  `{ id: "B", references: ["A"], referencedBy: ["A"] },`
  `{ id: "C", references: [], referencedBy: ["D"] },`
  `{ id: "D", references: ["C"], referencedBy: [] }`
  `])` ➔
  `{`
  `gcEligible: ["A", "D"],`
  `safe: ["C"],`
  `circularGroups: [["A", "B"]]`
  `}`

---

## 🧩 PROBLEM–05: 🧵 Execution Context Stack Simulator

⚠️ **Function Name:** `simulateExecutionContext()`

| Input      | `program` (array of objects) |
| :--------- | :--------------------------- |
| **Output** | object                       |

**Rules:**

Each program instruction object:

- `type` → `"createGlobal"` | `"callFunction"` | `"returnFunction"` | `"declareVar"` | `"assignVar"`
- `fnName` (string, optional) — for `callFunction` / `returnFunction`
- `varName` (string, optional) — for `declareVar` / `assignVar`
- `value` (any, optional) — for `assignVar`

**Simulation Rules:**

- `createGlobal` → creates Global Execution Context (GEC)
- `callFunction` → pushes new Function Execution Context (FEC) onto stack
- `returnFunction` → pops FEC from stack
- `declareVar` → adds variable to **current** context's local environment
- `assignVar` → updates variable value in current context

**Output:**

- `contextStack` — current state of execution context stack
- `globalEnv` — variables declared in global context
- `executionLog` — ordered list of operations performed

| Challenge 📢 | Return `{ contextStack, globalEnv, executionLog }`. If invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `simulateExecutionContext([`
  `{ type: "createGlobal" },`
  `{ type: "declareVar", varName: "x", value: 10 },`
  `{ type: "callFunction", fnName: "greet" },`
  `{ type: "declareVar", varName: "msg", value: "hello" },`
  `{ type: "returnFunction", fnName: "greet" },`
  `{ type: "assignVar", varName: "x", value: 99 }`
  `])` ➔
  `{`
  `contextStack: ["GEC"],`
  `globalEnv: { x: 99 },`
  `executionLog: [`
  `"GEC created",`
  `"GEC: var x = 10",`
  `"FEC pushed: greet",`
  `"greet: var msg = hello",`
  `"FEC popped: greet",`
  `"GEC: x = 99"`
  `]`
  `}`

---