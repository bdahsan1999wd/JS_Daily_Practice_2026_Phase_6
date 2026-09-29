# 🎓 JS DAILY PRACTICE – DAY-268

📅 **Goal:** Browser Storage Architecture Engine
🎯 **Focus:** localStorage • sessionStorage • Cookies • Storage Events • TTL • Encryption Simulation • Storage Quota

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🗄️ LocalStorage Manager Engine

⚠️ **Function Name:** `createLocalStorageManager()`

| Input      | `config` (object)    |
| :--------- | :------------------- |
| **Output** | object (storage API) |

**Rules:**

`config` object:

- `namespace` (string) — prefix for all keys (e.g., `"app"` → keys stored as `"app:keyName"`)
- `maxSize` (number) — max total storage in KB (simulated)
- `defaultTTL` (number or `null`) — default time-to-live in seconds (`null` = no expiry)

**LocalStorage Manager API (returned object):**

- `set(key, value, ttl)` → stores value with optional TTL override
  - Serializes to JSON internally
  - Stores as `{ value, expiresAt: timestamp or null }`
  - Returns `{ success, key, sizeKB }`
- `get(key)` → retrieves value
  - Returns `null` if expired or not found
  - Auto-removes expired entries on access
- `remove(key)` → deletes entry → returns boolean
- `clear()` → removes all entries in namespace → returns count removed
- `has(key)` → returns boolean (checks expiry too)
- `keys()` → returns all non-expired keys in namespace
- `getUsage()` → returns `{ usedKB, maxKB, percentUsed, itemCount }`
- `getExpired()` → returns keys that have already expired
- `getReport()` → returns `{ namespace, totalStored, expiredCount, activeCount }`

| Challenge 📢 | Return storage API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const storage = createLocalStorageManager({ namespace: "app", maxSize: 100, defaultTTL: 3600 })`
- `storage.set("user", { name: "Rahim", role: "admin" })` ➔ `{ success: true, key: "app:user", sizeKB: 0.04 }`
- `storage.set("theme", "dark", null)` _(no TTL — permanent)_
- `storage.get("user")` ➔ `{ name: "Rahim", role: "admin" }`
- `storage.get("nonexistent")` ➔ `null`
- `storage.has("theme")` ➔ `true`
- `storage.keys()` ➔ `["user", "theme"]`
- `storage.getUsage()` ➔ `{ usedKB: 0.08, maxKB: 100, percentUsed: 0.08, itemCount: 2 }`
- `storage.remove("theme")` ➔ `true`
- `storage.getReport()` ➔ `{ namespace: "app", totalStored: 2, expiredCount: 0, activeCount: 1 }`

---

## 🧩 PROBLEM–02: ⏱️ TTL-Based Storage Engine

⚠️ **Function Name:** `createTTLStorage()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (TTL storage API) |

**Rules:**

`config` object:

- `storageType` → `"local"` | `"session"` | `"memory"`
- `gcInterval` (number) — garbage collection runs every N operations
- `onExpire` (function or `null`) — callback when item expires `(key, value) => void`

**TTL Storage API (returned object):**

- `set(key, value, ttlSeconds)` → stores with TTL
- `get(key)` → returns value or `null` if expired
- `getWithMeta(key)` → returns `{ value, ttl, expiresAt, remainingSeconds, isExpired }`
- `extend(key, additionalSeconds)` → extends TTL of existing key
- `persist(key)` → removes TTL (makes permanent)
- `runGC()` → manually triggers garbage collection, removes all expired keys
  - Returns `{ removed, keys }`
- `getSnapshot()` → returns all entries with their TTL status
- `getReport()` → returns `{ total, expired, active, avgTTL, nearExpiry }` _(nearExpiry = expires in < 60s)_

| Challenge 📢 | Return TTL storage API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------ |

**Sample Input & Output:**

- `const ttlStorage = createTTLStorage({ storageType: "memory", gcInterval: 5, onExpire: null })`
- `ttlStorage.set("session", "token_abc", 3600)`
- `ttlStorage.set("tempCode", "OTP123", 30)`
- `ttlStorage.set("permanent", "alwaysHere", null)` _(no TTL)_
- `ttlStorage.getWithMeta("session")` ➔
  `{ value: "token_abc", ttl: 3600, expiresAt: 1620003600, remainingSeconds: 3600, isExpired: false }`
- `ttlStorage.extend("tempCode", 60)` ➔ `{ key: "tempCode", newTTL: 90, newExpiresAt: 1620000090 }`
- `ttlStorage.persist("tempCode")` ➔ `{ key: "tempCode", persistent: true }`
- `ttlStorage.getReport()` ➔ `{ total: 3, expired: 0, active: 3, avgTTL: 1800, nearExpiry: 0 }`

---

## 🧩 PROBLEM–03: 🍪 Cookie Manager Engine

⚠️ **Function Name:** `createCookieManager()`

| Input      | `config` (object)   |
| :--------- | :------------------ |
| **Output** | object (cookie API) |

**Rules:**

`config` object:

- `domain` (string) — cookie domain (e.g., `"example.com"`)
- `defaultPath` (string) — default path (e.g., `"/"`)
- `secure` (boolean) — default secure flag
- `sameSite` → `"Strict"` | `"Lax"` | `"None"`

**Cookie Manager API (returned object):**

- `set(name, value, options)` → creates cookie
  - `options`: `{ maxAge, expires, path, domain, secure, httpOnly, sameSite }`
  - Returns cookie string representation
- `get(name)` → returns cookie value or `null`
- `getAll()` → returns all cookies as `{ name: value }` object
- `delete(name, path)` → removes cookie (sets maxAge=0)
- `has(name)` → returns boolean
- `parse(cookieString)` → parses raw cookie header string → returns object
- `serialize(name, value, options)` → returns Set-Cookie header string
- `getSecureCookies()` → returns only cookies with `secure: true`
- `getReport()` → returns `{ totalCookies, secureCookies, httpOnlyCookies, expiredCookies }`

| Challenge 📢 | Return cookie API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const cookies = createCookieManager({ domain: "example.com", defaultPath: "/", secure: true, sameSite: "Strict" })`
- `cookies.set("sessionId", "abc123", { maxAge: 3600, httpOnly: true })` ➔
  `"sessionId=abc123; Max-Age=3600; Path=/; Domain=example.com; Secure; HttpOnly; SameSite=Strict"`
- `cookies.set("theme", "dark", { maxAge: 86400 })`
- `cookies.get("theme")` ➔ `"dark"`
- `cookies.getAll()` ➔ `{ sessionId: "abc123", theme: "dark" }`
- `cookies.parse("name=Rahim; age=25; city=Dhaka")` ➔ `{ name: "Rahim", age: "25", city: "Dhaka" }`
- `cookies.serialize("token", "xyz789", { maxAge: 900, secure: true })` ➔
  `"token=xyz789; Max-Age=900; Path=/; Domain=example.com; Secure; SameSite=Strict"`
- `cookies.getReport()` ➔ `{ totalCookies: 2, secureCookies: 2, httpOnlyCookies: 1, expiredCookies: 0 }`

---

## 🧩 PROBLEM–04: 🔐 Encrypted Storage Engine

⚠️ **Function Name:** `createEncryptedStorage()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (encrypted storage) |

**Rules:**

`config` object:

- `secretKey` (string) — encryption key
- `storageType` → `"local"` | `"session"` | `"memory"`
- `algorithm` → `"caesar"` | `"reverse"` | `"xor"` _(simulated algorithms)_

**Encryption Algorithms (simulate):**

- `"caesar"` → shift each char by `secretKey.length % 26`
- `"reverse"` → reverse the JSON string
- `"xor"` → XOR each char code with `secretKey.charCodeAt(0)`

**Encrypted Storage API (returned object):**

- `setSecure(key, value)` → encrypts value and stores
  - Returns `{ success, encryptedPreview }` (first 10 chars of encrypted)
- `getSecure(key)` → decrypts and returns original value
- `isEncrypted(key)` → returns boolean (checks if stored value looks encrypted)
- `rotate(newKey, newAlgorithm)` → re-encrypts all values with new key/algorithm
  - Returns `{ rotated, keys }`
- `exportEncrypted()` → returns all entries with encrypted values (for backup)
- `importEncrypted(backup)` → imports encrypted backup (no decryption needed)
- `getReport()` → returns `{ totalKeys, algorithm, storageType, encryptedSize }`

| Challenge 📢 | Return encrypted storage API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------ |

**Sample Input & Output:**

- `const encStorage = createEncryptedStorage({ secretKey: "mySecret", storageType: "memory", algorithm: "caesar" })`
- `encStorage.setSecure("user", { name: "Rahim", role: "admin" })` ➔ `{ success: true, encryptedPreview: "\"ynzl\":\"Ud..." }`
- `encStorage.getSecure("user")` ➔ `{ name: "Rahim", role: "admin" }`
- `encStorage.isEncrypted("user")` ➔ `true`
- `encStorage.rotate("newSecret", "reverse")` ➔ `{ rotated: 1, keys: ["user"] }`
- `encStorage.getSecure("user")` ➔ `{ name: "Rahim", role: "admin" }` _(still works after rotation)_
- `encStorage.getReport()` ➔ `{ totalKeys: 1, algorithm: "reverse", storageType: "memory", encryptedSize: "0.06KB" }`

---

## 🧩 PROBLEM–05: 📊 Storage Analytics & Quota Manager

⚠️ **Function Name:** `createStorageAnalytics()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (analytics API) |

**Rules:**

`config` object:

- `quotas` (object):
  - `local` (number) — max KB for localStorage simulation
  - `session` (number) — max KB for sessionStorage simulation
  - `cookie` (number) — max KB for cookie storage simulation
- `warningThreshold` (number) — percentage at which to warn (e.g., `80`)
- `trackHistory` (boolean) — track all storage operations

**Storage Analytics API (returned object):**

- `trackOperation(storageType, operation, key, sizeKB)` → logs a storage operation
  - `operation` → `"set"` | `"get"` | `"delete"` | `"clear"`
- `getQuotaStatus(storageType)` → returns `{ used, max, percent, status }`
  - `status` → `"OK"` | `"Warning"` | `"Critical"` | `"Full"`
- `getLargestItems(storageType, topN)` → returns top N largest items by size
- `getOperationHistory(storageType)` → returns all tracked operations
- `detectRedundancy()` → finds keys stored in multiple storage types
- `recommend()` → returns optimization suggestions based on usage patterns:
  - If `localStorage > 80%` → `"Consider clearing expired items"`
  - If same key in multiple storages → `"Redundant storage detected"`
  - If many small items → `"Consider consolidating into one object"`
- `getFullReport()` → returns complete analytics across all storage types

| Challenge 📢 | Return analytics API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const analytics = createStorageAnalytics({ quotas: { local: 5120, session: 5120, cookie: 4 }, warningThreshold: 80, trackHistory: true })`
- `analytics.trackOperation("local", "set", "userData", 1.5)`
- `analytics.trackOperation("local", "set", "settings", 0.8)`
- `analytics.trackOperation("session", "set", "userData", 1.2)`
- `analytics.trackOperation("cookie", "set", "sessionId", 0.1)`
- `analytics.getQuotaStatus("local")` ➔ `{ used: 2.3, max: 5120, percent: 0.04, status: "OK" }`
- `analytics.getLargestItems("local", 2)` ➔
  `[{ key: "userData", sizeKB: 1.5 }, { key: "settings", sizeKB: 0.8 }]`
- `analytics.detectRedundancy()` ➔ `[{ key: "userData", foundIn: ["local", "session"] }]`
- `analytics.recommend()` ➔ `["Redundant storage detected for: userData. Consider using one storage type."]`
- `analytics.getFullReport()` ➔
  `{`
  `local: { used: 2.3, max: 5120, itemCount: 2 },`
  `session: { used: 1.2, max: 5120, itemCount: 1 },`
  `cookie: { used: 0.1, max: 4, itemCount: 1 },`
  `totalOperations: 4,`
  `redundantKeys: ["userData"]`
  `}`

---
