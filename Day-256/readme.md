# 🎓 JS DAILY PRACTICE – DAY-256

📅 **Goal:** Memory Management & Performance Optimization Engine
🎯 **Focus:** Memory Leak Detection • WeakMap/WeakRef Simulation • Object Lifecycle • Cache Eviction • Performance Profiling

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🚰 Memory Leak Detector Engine

⚠️ **Function Name:** `detectMemoryLeaks()`

| Input      | `memorySnapshots` (array of objects) |
| :--------- | :----------------------------------- |
| **Output** | object                               |

**Rules:**

Each snapshot object:

- `snapshotId` (string)
- `timestamp` (number) — sequential order
- `allocations` (array of objects):
  - `id` (string) — object identifier
  - `size` (number) — memory size in KB
  - `type` (string) — object type (e.g., `"closure"`, `"array"`, `"dom"`)

**Leak Detection Rules:**

- An object is a **potential leak** if it appears in **3 or more consecutive snapshots** without being released
- A **released** object disappears from a snapshot
- Track **total leaked memory** (sum of leaked object sizes)
- Classify leak severity:
  - `> 500KB` total → `"Critical"`
  - `100–500KB` → `"Warning"`
  - `< 100KB` → `"Low"`

| Challenge 📢 | Return `{ leaks, totalLeakedKB, severity, cleanObjects }`. If invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `detectMemoryLeaks([`
  `{ snapshotId: "s1", timestamp: 1, allocations: [{ id: "A", size: 200, type: "closure" }, { id: "B", size: 50, type: "array" }] },`
  `{ snapshotId: "s2", timestamp: 2, allocations: [{ id: "A", size: 200, type: "closure" }, { id: "C", size: 30, type: "dom" }] },`
  `{ snapshotId: "s3", timestamp: 3, allocations: [{ id: "A", size: 200, type: "closure" }, { id: "C", size: 30, type: "dom" }] }`
  `])` ➔
  `{`
  `leaks: [{ id: "A", size: 200, type: "closure", appearedIn: 3 }],`
  `totalLeakedKB: 200,`
  `severity: "Warning",`
  `cleanObjects: ["B", "C"]`
  `}`

---

## 🧩 PROBLEM–02: 🗺️ WeakMap Behavior Simulator

⚠️ **Function Name:** `createWeakMapSimulator()`

| Input      | none                          |
| :--------- | :---------------------------- |
| **Output** | object (WeakMap-like API)     |

**Rules:**

Simulate WeakMap behavior where:

- Keys must be **objects** (non-primitive) — represented as `{ id, type }`
- Values can be anything
- When a key object is **marked for GC** → its entry is automatically removed
- No iteration allowed (no `keys()`, `values()`, `entries()`)

**API (returned object):**

- `set(keyObj, value)` → stores key-value pair
- `get(keyObj)` → returns value or `undefined`
- `has(keyObj)` → returns boolean
- `delete(keyObj)` → removes entry, returns boolean
- `markForGC(keyId)` → simulates key object being garbage collected (auto-removes entry)
- `getSize()` → returns current number of entries (non-standard, for simulation only)

**Rules:**

- Primitive keys → return `"Invalid Key: Objects Only"`
- All storage must be **private** (closure-based)

| Challenge 📢 | Return WeakMap simulator API. No invalid config possible here — always return API |
| :----------- | :-------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `const wm = createWeakMapSimulator()`
- `const key1 = { id: "u1", type: "user" }`
- `const key2 = { id: "u2", type: "user" }`
- `wm.set(key1, { name: "Rahim" })`
- `wm.set(key2, { name: "Karim" })`
- `wm.get(key1)` ➔ `{ name: "Rahim" }`
- `wm.has(key2)` ➔ `true`
- `wm.getSize()` ➔ `2`
- `wm.markForGC("u1")`
- `wm.has(key1)` ➔ `false`
- `wm.getSize()` ➔ `1`
- `wm.set("primitiveKey", 123)` ➔ `"Invalid Key: Objects Only"`

---

## 🧩 PROBLEM–03: ♻️ Object Lifecycle Tracker

⚠️ **Function Name:** `createLifecycleTracker()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (tracker API)      |

**Rules:**

`config` object:

- `maxAge` (number) — max time-to-live in ticks before object is auto-expired
- `maxObjects` (number) — max objects tracker can hold simultaneously

**Tracker API (returned object):**

- `allocate(id, data)` → registers a new object with current tick
- `access(id)` → marks object as recently used (resets age), returns object data
- `tick()` → advances time by 1 unit, auto-expires objects older than `maxAge`
- `release(id)` → manually releases an object
- `getStats()` → returns `{ active, expired, totalAllocated, oldestObject }`

**Rules:**

- Allocating when at `maxObjects` limit → auto-expire the **oldest** object first (LRU-like)
- Accessing non-existent or expired object → return `"Not Found"`
- All state **private** (closure-based)

| Challenge 📢 | Return tracker API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const tracker = createLifecycleTracker({ maxAge: 2, maxObjects: 3 })`
- `tracker.allocate("obj1", { val: 1 })`
- `tracker.allocate("obj2", { val: 2 })`
- `tracker.tick()`
- `tracker.tick()`
- `tracker.allocate("obj3", { val: 3 })`
- `tracker.access("obj1")` ➔ `"Not Found"` *(expired after 2 ticks)*
- `tracker.access("obj3")` ➔ `{ val: 3 }`
- `tracker.getStats()` ➔ `{ active: 2, expired: 1, totalAllocated: 3, oldestObject: "obj2" }`

---

## 🧩 PROBLEM–04: 🗑️ LRU Cache Engine

⚠️ **Function Name:** `createLRUCache()`

| Input      | `capacity` (number)   |
| :--------- | :-------------------- |
| **Output** | object (cache API)    |

**Rules:**

- **LRU (Least Recently Used)** eviction policy
- When cache is full → evict the **least recently used** item before inserting new one
- Every `get` and `set` counts as a **use** (updates recency)

**Cache API (returned object):**

- `set(key, value)` → inserts or updates key-value pair
- `get(key)` → returns value or `"Cache Miss"`; updates recency
- `peek(key)` → returns value WITHOUT updating recency, or `"Cache Miss"`
- `delete(key)` → removes key, returns `true` or `false`
- `getStats()` → returns `{ size, capacity, hits, misses, evictions }`
- `getOrder()` → returns keys from **most recently used** to **least recently used**

**Rules:**

- Capacity must be ≥ 1
- All state **private** (closure-based)

| Challenge 📢 | Return LRU cache API. If capacity invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------ |

**Sample Input & Output:**

- `const cache = createLRUCache(3)`
- `cache.set("a", 1)`
- `cache.set("b", 2)`
- `cache.set("c", 3)`
- `cache.get("a")` ➔ `1` *(a becomes MRU)*
- `cache.set("d", 4)` *(b evicted — LRU)*
- `cache.get("b")` ➔ `"Cache Miss"`
- `cache.getOrder()` ➔ `["d", "a", "c"]`
- `cache.getStats()` ➔ `{ size: 3, capacity: 3, hits: 1, misses: 1, evictions: 1 }`

---

## 🧩 PROBLEM–05: 📊 Performance Profiler Engine

⚠️ **Function Name:** `createProfiler()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (profiler API)   |

**Rules:**

`config` object:

- `name` (string) — profiler name
- `slowThreshold` (number) — execution time (in ms ticks) above which a call is flagged as slow
- `memoryThreshold` (number) — memory usage (in KB) above which a call is flagged

**Profiler API (returned object):**

- `profile(fnName, executionTime, memoryUsed)` → records a function call's performance data
- `getReport()` → returns full performance report:
  - `totalCalls`
  - `averageTime`
  - `slowCalls` (array of `{ fnName, executionTime }`)
  - `memoryHeavyCalls` (array of `{ fnName, memoryUsed }`)
  - `fastestCall` → `{ fnName, executionTime }`
  - `slowestCall` → `{ fnName, executionTime }`
- `reset()` → clears all recorded data
- `getSummary()` → returns `{ status, issues }` where:
  - `status` → `"Healthy"` | `"Degraded"` | `"Critical"`
  - `"Degraded"` if > 30% calls are slow
  - `"Critical"` if > 60% calls are slow
  - `issues` → array of flagged problem descriptions

**Rules:**

- All profiling data **private** (closure-based)
- `executionTime` and `memoryUsed` must be positive numbers

| Challenge 📢 | Return profiler API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const profiler = createProfiler({ name: "apiProfiler", slowThreshold: 100, memoryThreshold: 50 })`
- `profiler.profile("fetchUser", 80, 30)`
- `profiler.profile("parseData", 150, 70)`
- `profiler.profile("saveDB", 200, 90)`
- `profiler.getReport()` ➔
  `{`
  `totalCalls: 3,`
  `averageTime: 143.33,`
  `slowCalls: [{ fnName: "parseData", executionTime: 150 }, { fnName: "saveDB", executionTime: 200 }],`
  `memoryHeavyCalls: [{ fnName: "parseData", memoryUsed: 70 }, { fnName: "saveDB", memoryUsed: 90 }],`
  `fastestCall: { fnName: "fetchUser", executionTime: 80 },`
  `slowestCall: { fnName: "saveDB", executionTime: 200 }`
  `}`
- `profiler.getSummary()` ➔
  `{`
  `status: "Critical",`
  `issues: ["66.67% calls exceeded slow threshold", "2 calls exceeded memory threshold"]`
  `}`

---