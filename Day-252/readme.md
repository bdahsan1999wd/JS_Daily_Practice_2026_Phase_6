# 🎓 JS DAILY PRACTICE – DAY-252

📅 **Goal:** Private State Architecture & Closure Mastery Engine
🎯 **Focus:** Closure Patterns • Private Variables • Factory Functions • Memoization • Lexical Environment

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🏦 Private Bank Account Engine

⚠️ **Function Name:** `createBankAccount()`

| Input      | `config` (object)    |
| :--------- | :------------------- |
| **Output** | object (account API) |

**Rules:**

`config` object:

- `owner` (string) — account holder name
- `initialBalance` (number ≥ 0) — starting balance
- `pin` (4-digit number) — security PIN

**Account API (returned object):**

- `deposit(amount)` → adds amount (must be > 0)
- `withdraw(pin, amount)` → deducts amount if PIN correct & balance sufficient
- `getBalance(pin)` → returns current balance if PIN correct
- `getOwner()` → returns owner name (no PIN needed)

**Rules:**

- Balance must be **private** (closure-based)
- Wrong PIN → return `"Access Denied"`
- Insufficient balance → return `"Insufficient Funds"`
- Invalid amount → return `"Invalid Amount"`

| Challenge 📢 | Return account API object. If config is invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------ |

**Sample Input & Output:**

- `const acc = createBankAccount({ owner: "Rahim", initialBalance: 1000, pin: 1234 })`
- `acc.deposit(500)` ➔ `1500`
- `acc.withdraw(1234, 200)` ➔ `1300`
- `acc.withdraw(9999, 200)` ➔ `"Access Denied"`
- `acc.getBalance(1234)` ➔ `1300`
- `acc.getOwner()` ➔ `"Rahim"`

---

## 🧩 PROBLEM–02: 🔁 Memoization Cache Engine

⚠️ **Function Name:** `createMemoizer()`

| Input      | `fn` (function)             |
| :--------- | :-------------------------- |
| **Output** | function (memoized version) |

**Rules:**

- Wraps any **pure function** with a cache layer
- If same arguments called again → return **cached result** (no re-execution)
- Cache must be **private** (closure-based)
- Track cache **hit count** and **miss count**

**Returned memoized function must also have:**

- `.getCacheStats()` → returns `{ hits, misses, cachedKeys }`
- `.clearCache()` → resets the cache

| Challenge 📢 | Return memoized function with stats API. If `fn` is not a function → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `const memoAdd = createMemoizer((a, b) => a + b)`
- `memoAdd(2, 3)` ➔ `5` (miss)
- `memoAdd(2, 3)` ➔ `5` (hit)
- `memoAdd(4, 5)` ➔ `9` (miss)
- `memoAdd.getCacheStats()` ➔ `{ hits: 1, misses: 2, cachedKeys: 2 }`
- `memoAdd.clearCache()` ➔ `{ hits: 0, misses: 0, cachedKeys: 0 }`

---

## 🧩 PROBLEM–03: 🏭 Function Factory Engine

⚠️ **Function Name:** `createMultiplierFactory()`

| Input      | `rules` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object (factory API)       |

**Rules:**

Each rule object:

- `name` (string) — multiplier name (e.g., `"double"`, `"triple"`)
- `factor` (number) — multiplication factor

**Factory API (returned object):**

- `getMultiplier(name)` → returns a **closure function** that multiplies input by that factor
- `listMultipliers()` → returns array of registered multiplier names
- `addMultiplier(name, factor)` → adds new multiplier dynamically

**Rules:**

- Each multiplier function must **privately capture** its own `factor` via closure
- Calling unknown multiplier name → return `"Not Found"`

| Challenge 📢 | Return factory API object. If rules is invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------- |

**Sample Input & Output:**

- `const factory = createMultiplierFactory([`
  `{ name: "double", factor: 2 },`
  `{ name: "triple", factor: 3 }`
  `])`
- `const double = factory.getMultiplier("double")`
- `double(5)` ➔ `10`
- `factory.getMultiplier("triple")(4)` ➔ `12`
- `factory.listMultipliers()` ➔ `["double", "triple"]`
- `factory.addMultiplier("quadruple", 4)`
- `factory.getMultiplier("quadruple")(3)` ➔ `12`
- `factory.getMultiplier("unknown")` ➔ `"Not Found"`

---

## 🧩 PROBLEM–04: ⏱️ Rate Limiter Engine

⚠️ **Function Name:** `createRateLimiter()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (rate limiter API) |

**Rules:**

`config` object:

- `maxCalls` (number) — max allowed calls per window
- `windowSize` (number) — time window in seconds (simulated as call count)

**Rate Limiter API:**

- `call(fnName)` → registers a call attempt
  - If within limit → return `{ allowed: true, remaining: N }`
  - If limit exceeded → return `{ allowed: false, remaining: 0 }`
- `getStats()` → returns `{ totalCalls, blockedCalls, allowedCalls }`
- `reset()` → resets the window counter

**Rules:**

- All counters must be **private** (closure-based)
- Track every call attempt regardless of allow/block

| Challenge 📢 | Return rate limiter API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------- |

**Sample Input & Output:**

- `const limiter = createRateLimiter({ maxCalls: 3, windowSize: 10 })`
- `limiter.call("fetchUser")` ➔ `{ allowed: true, remaining: 2 }`
- `limiter.call("fetchUser")` ➔ `{ allowed: true, remaining: 1 }`
- `limiter.call("fetchUser")` ➔ `{ allowed: true, remaining: 0 }`
- `limiter.call("fetchUser")` ➔ `{ allowed: false, remaining: 0 }`
- `limiter.getStats()` ➔ `{ totalCalls: 4, blockedCalls: 1, allowedCalls: 3 }`
- `limiter.reset()` ➔ `{ totalCalls: 0, blockedCalls: 0, allowedCalls: 0 }`

---

## 🧩 PROBLEM–05: 🔐 Private Configuration Manager

⚠️ **Function Name:** `createConfigManager()`

| Input      | `initialConfig` (object) |
| :--------- | :----------------------- |
| **Output** | object (config API)      |

**Rules:**

`initialConfig` — any key-value pairs (string keys, primitive values)

**Config API (returned object):**

- `get(key)` → returns value for key (or `"Key Not Found"`)
- `set(key, value)` → updates or adds a key-value pair
- `delete(key)` → removes a key (returns `true` if existed, `false` if not)
- `getAll()` → returns a **copy** (not reference) of current config
- `reset()` → restores config to original `initialConfig`
- `getHistory()` → returns array of all change operations `{ action, key, value, timestamp }`

**Rules:**

- Config object must be **private** (closure-based)
- `getAll()` must return a **shallow copy** (prevent external mutation)
- `timestamp` → use call index (1, 2, 3...) instead of real time

| Challenge 📢 | Return config API object. If initialConfig is not a plain object → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `const config = createConfigManager({ theme: "dark", lang: "en" })`
- `config.get("theme")` ➔ `"dark"`
- `config.set("lang", "bn")` ➔ `{ theme: "dark", lang: "bn" }`
- `config.delete("theme")` ➔ `true`
- `config.getAll()` ➔ `{ lang: "bn" }`
- `config.reset()` ➔ `{ theme: "dark", lang: "en" }`
- `config.getHistory()` ➔
  `[`
  `{ action: "set", key: "lang", value: "bn", timestamp: 1 },`
  `{ action: "delete", key: "theme", value: null, timestamp: 2 },`
  `{ action: "reset", key: null, value: null, timestamp: 3 }`
  `]`

---
