# 🎓 JS DAILY PRACTICE – DAY-270

📅 **Goal:** URL & Browser Navigation Engine
🎯 **Focus:** URL Parsing • URLSearchParams • History API • Navigation Simulation • Route Matching • Deep Link

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔗 URL Parser & Builder Engine

⚠️ **Function Name:** `createURLEngine()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (URL API)       |

**Rules:**

`config` object:

- `baseURL` (string) — base URL (e.g., `"https://api.example.com"`)
- `defaultParams` (object) — default query params added to all URLs
- `trailingSlash` (boolean) — whether to enforce trailing slash

**URL Engine API (returned object):**

- `parse(urlString)` → parses URL into components:
  - Returns `{ protocol, hostname, port, pathname, search, hash, origin, params }`
- `build(path, params, hash)` → constructs full URL from parts
  - Merges `defaultParams` with provided `params`
  - Returns full URL string
- `resolve(base, relative)` → resolves relative URL against base
- `normalize(urlString)` → normalizes URL:
  - Lowercase hostname
  - Remove duplicate slashes
  - Sort query params alphabetically
  - Remove default port (80 for http, 443 for https)
- `compare(url1, url2)` → returns `{ equal, differences: [] }`
- `isValid(urlString)` → returns boolean with reason if invalid
- `getReport()` → returns `{ totalParsed, totalBuilt, totalResolved }`

| Challenge 📢 | Return URL engine API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createURLEngine({ baseURL: "https://api.example.com", defaultParams: { version: "v1" }, trailingSlash: false })`
- `engine.parse("https://api.example.com:8080/users?name=rahim&age=25#profile")` ➔
  `{`
  `protocol: "https:",`
  `hostname: "api.example.com",`
  `port: "8080",`
  `pathname: "/users",`
  `search: "?name=rahim&age=25",`
  `hash: "#profile",`
  `origin: "https://api.example.com:8080",`
  `params: { name: "rahim", age: "25" }`
  `}`
- `engine.build("/products", { category: "electronics", sort: "price" }, "top")` ➔
  `"https://api.example.com/products?version=v1&category=electronics&sort=price#top"`
- `engine.normalize("HTTPS://API.EXAMPLE.COM:443//users//list?z=1&a=2")` ➔
  `"https://api.example.com/users/list?a=2&z=1"`
- `engine.isValid("not-a-url")` ➔ `{ valid: false, reason: "Missing protocol" }`
- `engine.getReport()` ➔ `{ totalParsed: 1, totalBuilt: 1, totalResolved: 0 }`

---

## 🧩 PROBLEM–02: 🔍 URLSearchParams Manager Engine

⚠️ **Function Name:** `createSearchParamsEngine()`

| Input      | `initialParams` (string or object) |
| :--------- | :--------------------------------- |
| **Output** | object (params API)                |

**Rules:**

- `initialParams` can be:
  - Query string: `"name=rahim&age=25&tags=js&tags=node"`
  - Object: `{ name: "rahim", age: 25 }`

**SearchParams Engine API (returned object):**

- `get(key)` → returns first value for key or `null`
- `getAll(key)` → returns all values for key as array
- `set(key, value)` → sets/overwrites key (removes duplicates)
- `append(key, value)` → adds value without removing existing
- `delete(key)` → removes all values for key
- `has(key)` → returns boolean
- `keys()` → returns array of unique keys
- `values()` → returns array of all values
- `entries()` → returns array of `[key, value]` pairs
- `toString()` → returns URL-encoded query string
- `toObject()` → returns `{ key: value }` or `{ key: [values] }` for multi-value
- `merge(otherParams)` → merges another params object (appends, no overwrite)
- `filter(fn)` → keeps only entries where `fn(key, value)` returns true
- `getReport()` → returns `{ totalKeys, multiValueKeys, totalValues }`

| Challenge 📢 | Return params API. If initialParams invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------- |

**Sample Input & Output:**

- `const params = createSearchParamsEngine("name=rahim&age=25&tags=js&tags=node&tags=react")`
- `params.get("name")` ➔ `"rahim"`
- `params.getAll("tags")` ➔ `["js", "node", "react"]`
- `params.set("name", "karim")`
- `params.append("tags", "ts")`
- `params.has("age")` ➔ `true`
- `params.keys()` ➔ `["name", "age", "tags"]`
- `params.toString()` ➔ `"name=karim&age=25&tags=js&tags=node&tags=react&tags=ts"`
- `params.toObject()` ➔ `{ name: "karim", age: "25", tags: ["js", "node", "react", "ts"] }`
- `params.filter((key, val) => key !== "age")` ➔ *(removes age)*
- `params.getReport()` ➔ `{ totalKeys: 2, multiValueKeys: ["tags"], totalValues: 5 }`

---

## 🧩 PROBLEM–03: 🧭 History API Simulator

⚠️ **Function Name:** `createHistorySimulator()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (history API)      |

**Rules:**

`config` object:

- `initialURL` (string) — starting URL
- `maxHistorySize` (number) — max history stack size
- `onNavigate` (function or `null`) — callback on every navigation `(url, state) => void`

**History Simulator API (returned object):**

- `pushState(state, title, url)` → adds new entry to history stack
  - Truncates forward history (like real browser)
  - Returns `{ success, currentIndex, stackSize }`
- `replaceState(state, title, url)` → replaces current entry
  - Returns `{ success, replacedURL, newURL }`
- `go(delta)` → moves delta steps in history (`-1` = back, `+1` = forward)
  - Returns `{ success, currentURL, currentState }`
- `back()` → alias for `go(-1)`
- `forward()` → alias for `go(+1)`
- `getCurrentState()` → returns `{ url, state, title, index }`
- `getStack()` → returns full history stack as array
- `canGoBack()` → returns boolean
- `canGoForward()` → returns boolean
- `getReport()` → returns `{ totalNavigations, pushCount, replaceCount, goCount, currentIndex, stackSize }`

| Challenge 📢 | Return history API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const history = createHistorySimulator({ initialURL: "https://app.com/", maxHistorySize: 50, onNavigate: null })`
- `history.pushState({ page: "home" }, "Home", "/home")` ➔ `{ success: true, currentIndex: 1, stackSize: 2 }`
- `history.pushState({ page: "about" }, "About", "/about")` ➔ `{ success: true, currentIndex: 2, stackSize: 3 }`
- `history.pushState({ page: "contact" }, "Contact", "/contact")` ➔ `{ success: true, currentIndex: 3, stackSize: 4 }`
- `history.back()` ➔ `{ success: true, currentURL: "/about", currentState: { page: "about" } }`
- `history.back()` ➔ `{ success: true, currentURL: "/home", currentState: { page: "home" } }`
- `history.pushState({ page: "products" }, "Products", "/products")` *(truncates /about, /contact)*
- `history.getStack()` ➔ `["/", "/home", "/products"]`
- `history.canGoBack()` ➔ `true`
- `history.canGoForward()` ➔ `false`
- `history.getReport()` ➔ `{ totalNavigations: 5, pushCount: 4, replaceCount: 0, goCount: 2, currentIndex: 2, stackSize: 3 }`

---

## 🧩 PROBLEM–04: 🗺️ Client-Side Router Engine

⚠️ **Function Name:** `createClientRouter()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (router API)     |

**Rules:**

`config` object:

- `mode` → `"hash"` | `"history"` — routing mode
- `baseURL` (string) — base path prefix
- `notFoundHandler` (function) — called when no route matches

**Router API (returned object):**

- `register(path, handler, options)` → registers a route
  - `path` supports:
    - Static: `"/users"`
    - Dynamic: `"/users/:id"`
    - Wildcard: `"/files/*"`
    - Optional: `"/search/:query?"`
  - `options`: `{ exact: boolean, middleware: fn[] }`
- `navigate(url, state)` → navigates to URL, finds matching route, runs handler
  - Returns `{ matched, route, params, queryParams, middlewarePassed }`
- `match(url)` → finds matching route without navigating
  - Returns `{ matched, route, params }` or `{ matched: false }`
- `getCurrentRoute()` → returns current route info
- `getRoutes()` → returns all registered routes
- `getHistory()` → returns navigation history log
- `getReport()` → returns `{ totalRoutes, totalNavigations, notFoundCount, dynamicRoutes }`

| Challenge 📢 | Return router API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const router = createClientRouter({ mode: "history", baseURL: "/app", notFoundHandler: () => "404 Not Found" })`
- `router.register("/", () => "Home Page", { exact: true, middleware: [] })`
- `router.register("/users", () => "Users List", { exact: true, middleware: [] })`
- `router.register("/users/:id", (params) => "User: " + params.id, { exact: true, middleware: [] })`
- `router.register("/files/*", (params) => "File: " + params.wildcard, { exact: false, middleware: [] })`
- `router.match("/users/42")` ➔ `{ matched: true, route: "/users/:id", params: { id: "42" } }`
- `router.navigate("/users/42", {})` ➔
  `{ matched: true, route: "/users/:id", params: { id: "42" }, queryParams: {}, middlewarePassed: true }`
- `router.navigate("/files/images/logo.png", {})` ➔
  `{ matched: true, route: "/files/*", params: { wildcard: "images/logo.png" }, queryParams: {}, middlewarePassed: true }`
- `router.navigate("/unknown", {})` ➔
  `{ matched: false, route: null, params: {}, queryParams: {}, middlewarePassed: false }`
- `router.getReport()` ➔ `{ totalRoutes: 4, totalNavigations: 3, notFoundCount: 1, dynamicRoutes: 2 }`

---

## 🧩 PROBLEM–05: 🔗 Deep Link & URL State Manager

⚠️ **Function Name:** `createURLStateManager()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (state manager API) |

**Rules:**

`config` object:

- `baseURL` (string)
- `stateSchema` (object) — defines allowed state keys and their types:
  - e.g., `{ page: "number", search: "string", filters: "array", sort: "string" }`
- `compress` (boolean) — if true, encode state as base64 in URL hash

**URL State Manager API (returned object):**

- `setState(stateObj)` → serializes state into URL query params or hash
  - Validates against `stateSchema`
  - Returns `{ url, encodedState }`
- `getState(url)` → parses URL and extracts state object
  - Validates and coerces types per `stateSchema`
  - Returns state object
- `updateState(partialState)` → merges partial state into current state → returns new URL
- `resetState()` → clears all state → returns base URL
- `subscribe(key, fn)` → calls `fn(newValue)` when specific state key changes
- `generateShareableLink(state, expiresInSeconds)` → creates link with expiry encoded
- `validateState(stateObj)` → returns `{ valid, errors }` against schema
- `getReport()` → returns `{ currentState, totalUpdates, subscribers, compressed }`

| Challenge 📢 | Return state manager API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------- |

**Sample Input & Output:**

- `const manager = createURLStateManager({`
  `baseURL: "https://shop.example.com/products",`
  `stateSchema: { page: "number", search: "string", filters: "array", sort: "string" },`
  `compress: false`
  `})`
- `manager.setState({ page: 2, search: "laptop", filters: ["electronics", "sale"], sort: "price" })` ➔
  `{`
  `url: "https://shop.example.com/products?page=2&search=laptop&filters=electronics,sale&sort=price",`
  `encodedState: { page: 2, search: "laptop", filters: ["electronics", "sale"], sort: "price" }`
  `}`
- `manager.getState("https://shop.example.com/products?page=3&search=phone&filters=mobile&sort=rating")` ➔
  `{ page: 3, search: "phone", filters: ["mobile"], sort: "rating" }`
- `manager.updateState({ page: 3, sort: "rating" })` ➔
  `"https://shop.example.com/products?page=3&search=laptop&filters=electronics,sale&sort=rating"`
- `manager.validateState({ page: "notANumber", sort: "price" })` ➔
  `{ valid: false, errors: ["page must be of type number"] }`
- `manager.getReport()` ➔
  `{ currentState: { page: 3, search: "laptop", filters: ["electronics", "sale"], sort: "rating" }, totalUpdates: 2, subscribers: 0, compressed: false }`

---