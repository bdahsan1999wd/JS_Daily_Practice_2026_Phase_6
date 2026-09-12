# 🎓 JS DAILY PRACTICE – DAY-255

📅 **Goal:** Advanced Closure Patterns & Functional Engineering
🎯 **Focus:** Currying • Partial Application • Function Composition • Once/Before/After Wrappers • Pipe & Compose

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🍛 Currying Engine

⚠️ **Function Name:** `createCurry()`

| Input      | `fn` (function)            |
| :--------- | :------------------------- |
| **Output** | function (curried version) |

**Rules:**

- Converts any multi-argument function into a **curried** version
- Each call accepts **one or more** arguments
- When total collected arguments reach `fn.length` → execute and return result
- Supports **partial application** at each step
- Each intermediate call returns a new function (closure-based)

| Challenge 📢 | Return curried function. If `fn` is not a function → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------------- |

**Sample Input & Output:**

- `const curriedAdd = createCurry((a, b, c) => a + b + c)`
- `curriedAdd(1)(2)(3)` ➔ `6`
- `curriedAdd(1, 2)(3)` ➔ `6`
- `curriedAdd(1)(2, 3)` ➔ `6`
- `curriedAdd(1, 2, 3)` ➔ `6`
- `const add5 = curriedAdd(5)`
- `add5(3)(2)` ➔ `10`

---

## 🧩 PROBLEM–02: 🔧 Partial Application Engine

⚠️ **Function Name:** `createPartial()`

| Input      | `fn` (function), `...presetArgs` (any) |
| :--------- | :------------------------------------- |
| **Output** | function (partially applied)           |

**Rules:**

- Pre-fills **left-side** arguments of a function
- Returns a new function waiting for the **remaining** arguments
- Supports placeholder `"_"` to skip preset positions and fill them later
- All state captured via closure

**Placeholder Rules:**

- `"_"` in `presetArgs` → that position is left empty for later call
- Later call fills `"_"` positions first (left to right), then appends remaining

| Challenge 📢 | Return partially applied function. If `fn` is not a function → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `const multiply = (a, b, c) => a * b * c`
- `const double = createPartial(multiply, 2, "_", "_")`
- `double(3, 4)` ➔ `24`
- `const multiplyBy5And = createPartial(multiply, "_", 5, "_")`
- `multiplyBy5And(2, 3)` ➔ `30`
- `const fixed = createPartial(multiply, 2, 3, 4)`
- `fixed()` ➔ `24`

---

## 🧩 PROBLEM–03: 🔗 Function Composition Engine

⚠️ **Function Name:** `createCompose()`

| Input      | `...fns` (functions)         |
| :--------- | :--------------------------- |
| **Output** | function (composed function) |

**Rules:**

- `compose` → executes functions **right to left** (mathematical composition)
- `pipe` → executes functions **left to right**
- Each function receives the output of the previous one as input
- Return an object with both `compose` and `pipe` versions
- All intermediate results captured via closure

**Returned object:**

- `compose(...fns)` → right-to-left execution
- `pipe(...fns)` → left-to-right execution
- `.getSteps()` → returns array of function names in execution order
- `.reset()` → clears registered functions

| Challenge 📢 | Return composition engine object. If any argument is not a function → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createCompose()`
- `const double = x => x * 2`
- `const addTen = x => x + 10`
- `const square = x => x * x`
- `const composed = engine.compose(double, addTen, square)`
- `composed(3)` ➔ `38` *(square(3)=9 → addTen(9)=19 → double(19)=38)*
- `const piped = engine.pipe(square, addTen, double)`
- `piped(3)` ➔ `38` *(square(3)=9 → addTen(9)=19 → double(19)=38)*

---

## 🧩 PROBLEM–04: 🛡️ Function Execution Guard Engine

⚠️ **Function Name:** `createFunctionGuard()`

| Input      | `fn` (function), `options` (object) |
| :--------- | :---------------------------------- |
| **Output** | object (guarded function API)       |

**Rules:**

`options` object:

- `once` (boolean) — function executes **only once**, subsequent calls return first result
- `before` (number) — function executes only **before** N total calls (after that → `"Blocked"`)
- `after` (number) — function executes only **after** N calls have been attempted
- `maxCalls` (number) — function executes at most N times total

**Guarded API (returned object):**

- `execute(...args)` → runs `fn` according to guard rules
- `getStats()` → returns `{ totalAttempts, successfulCalls, blockedCalls }`
- `reset()` → resets all counters (but keeps options)

**Rules:**

- Options are applied in combination if multiple provided
- Blocked calls → return `"Blocked"`
- All counters must be **private** (closure-based)

| Challenge 📢 | Return guarded API object. If `fn` is not a function or options invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `const guard = createFunctionGuard(x => x * 2, { once: true })`
- `guard.execute(5)` ➔ `10`
- `guard.execute(8)` ➔ `10` *(cached first result)*
- `guard.execute(3)` ➔ `10` *(cached first result)*
- `guard.getStats()` ➔ `{ totalAttempts: 3, successfulCalls: 1, blockedCalls: 2 }`
- `const guard2 = createFunctionGuard(x => x + 1, { after: 2, maxCalls: 3 })`
- `guard2.execute(10)` ➔ `"Blocked"` *(attempt 1 — before threshold)*
- `guard2.execute(10)` ➔ `"Blocked"` *(attempt 2 — before threshold)*
- `guard2.execute(10)` ➔ `11` *(attempt 3 — after threshold, within maxCalls)*
- `guard2.execute(10)` ➔ `11`
- `guard2.execute(10)` ➔ `11`
- `guard2.execute(10)` ➔ `"Blocked"` *(maxCalls exceeded)*

---

## 🧩 PROBLEM–05: 🔄 Closure-Based Middleware Pipeline

⚠️ **Function Name:** `createMiddlewarePipeline()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (pipeline API)   |

**Rules:**

`config` object:

- `name` (string) — pipeline name
- `stopOnError` (boolean) — if `true`, pipeline halts on first middleware error

**Pipeline API (returned object):**

- `use(name, fn)` → registers a middleware function
  - Each middleware receives `(context, next)` where `next()` calls the next middleware
- `run(initialContext)` → executes all middlewares in order passing context through
  - Returns `{ finalContext, executionLog, stopped }`
- `getMiddlewares()` → returns array of registered middleware names
- `clear()` → removes all middlewares

**Middleware Rules:**

- Each middleware can **modify** `context` before calling `next()`
- If middleware does NOT call `next()` → pipeline stops there
- If middleware throws error AND `stopOnError: true` → pipeline halts, log the error
- All middleware registry must be **private** (closure-based)

| Challenge 📢 | Return pipeline API object. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------- |

**Sample Input & Output:**

- `const pipeline = createMiddlewarePipeline({ name: "authPipeline", stopOnError: true })`
- `pipeline.use("logger", (ctx, next) => { ctx.logged = true; next(); })`
- `pipeline.use("auth", (ctx, next) => { ctx.authenticated = true; next(); })`
- `pipeline.use("transform", (ctx, next) => { ctx.data = ctx.data.toUpperCase(); next(); })`
- `pipeline.run({ data: "hello" })` ➔
  `{`
  `finalContext: { data: "HELLO", logged: true, authenticated: true },`
  `executionLog: ["logger", "auth", "transform"],`
  `stopped: false`
  `}`
- `pipeline.getMiddlewares()` ➔ `["logger", "auth", "transform"]`

---