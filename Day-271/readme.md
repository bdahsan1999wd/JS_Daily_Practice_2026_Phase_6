# 🎓 JS DAILY PRACTICE – DAY-271

📅 **Goal:** Module 3 — Browser & DOM Mixed Revision & Mastery Test
🎯 **Focus:** DOM • Events • Forms • Storage • Timers • Animation • URL — All Combined

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🌐 Browser Environment Simulator

⚠️ **Function Name:** `createBrowserSimulator()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (browser API)      |

**Rules:**

`config` object:

- `initialURL` (string)
- `storageQuota` (number) — KB
- `viewportWidth` (number)
- `viewportHeight` (number)

**Simulates core browser APIs combined:**

- **DOM** → `document.createElement`, `querySelector`, `classList`
- **Storage** → `localStorage.set/get`, with quota enforcement
- **History** → `pushState`, `back`, `forward`
- **Timers** → `setTimeout`, `tick` simulation

**Browser Simulator API (returned object):**

- `dom.createElement(tag, options)` → creates element descriptor
- `dom.querySelector(selector)` → queries registered elements
- `dom.registerElement(element)` → adds element to virtual DOM
- `storage.set(key, value, ttl)` → stores with TTL, enforces quota
- `storage.get(key)` → retrieves value
- `history.pushState(state, url)` → navigates
- `history.back()` → goes back
- `timers.setTimeout(name, fn, delay)` → registers timer
- `timers.tick(ms)` → advances time
- `getSnapshot()` → returns `{ currentURL, domElements, storageKeys, activeTimers, historyStack }`
- `getReport()` → returns `{ url, storageUsed, domCount, timerCount, historySize }`

| Challenge 📢 | Return browser API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const browser = createBrowserSimulator({ initialURL: "https://app.com/", storageQuota: 50, viewportWidth: 1920, viewportHeight: 1080 })`
- `browser.dom.createElement("div", { classes: ["container"], text: "Hello" })`
- `browser.storage.set("user", { name: "Rahim" }, 3600)`
- `browser.history.pushState({ page: "about" }, "/about")`
- `browser.timers.setTimeout("greet", () => "Hello!", 100)`
- `browser.timers.tick(100)`
- `browser.getSnapshot()` ➔
  `{`
  `currentURL: "https://app.com/about",`
  `domElements: [{ tag: "div", classes: ["container"] }],`
  `storageKeys: ["user"],`
  `activeTimers: [],`
  `historyStack: ["https://app.com/", "https://app.com/about"]`
  `}`
- `browser.getReport()` ➔ `{ url: "https://app.com/about", storageUsed: "0.03KB", domCount: 1, timerCount: 0, historySize: 2 }`

---

## 🧩 PROBLEM–02: 📝 Single Page App State Engine

⚠️ **Function Name:** `createSPAEngine()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (SPA API)       |

**Rules:**

`config` object:

- `appName` (string)
- `baseURL` (string)
- `persistState` (boolean) — save state to localStorage simulation
- `maxHistorySize` (number)

**SPA Engine combines:**

- **Router** → client-side routing with dynamic params
- **State Manager** → URL-synced state
- **Event System** → page lifecycle events (`beforeNavigate`, `afterNavigate`, `stateChange`)
- **Storage** → persists app state
- **Timers** → handles route transition delays

**SPA API (returned object):**

- `registerRoute(path, component, guards[])` → registers route with optional auth guards
  - Guard: `fn(context) → boolean` — blocks navigation if returns false
- `navigate(url, state)` → navigates to route
  - Fires `beforeNavigate` → runs guards → fires `afterNavigate`
  - Returns `{ success, route, params, blocked, reason }`
- `setState(key, value)` → updates app state, syncs to URL params
- `getState(key)` → retrieves state value
- `on(event, fn)` → subscribes to lifecycle event
- `back()` → navigates back in history
- `getAppReport()` → returns `{ appName, currentRoute, stateKeys, historySize, totalNavigations }`

| Challenge 📢 | Return SPA API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------- |

**Sample Input & Output:**

- `const spa = createSPAEngine({ appName: "ShopApp", baseURL: "https://shop.com", persistState: true, maxHistorySize: 20 })`
- `spa.registerRoute("/", () => "Home", [])`
- `spa.registerRoute("/products/:id", (params) => "Product: " + params.id, [])`
- `spa.registerRoute("/admin", () => "Admin Panel", [(ctx) => ctx.isAdmin === true])`
- `spa.on("beforeNavigate", (url) => "Navigating to: " + url)`
- `spa.navigate("/products/42", {})` ➔
  `{ success: true, route: "/products/:id", params: { id: "42" }, blocked: false, reason: null }`
- `spa.navigate("/admin", { isAdmin: false })` ➔
  `{ success: false, route: "/admin", params: {}, blocked: true, reason: "Guard failed" }`
- `spa.setState("cart", [{ id: "P001", qty: 2 }])`
- `spa.getState("cart")` ➔ `[{ id: "P001", qty: 2 }]`
- `spa.getAppReport()` ➔
  `{ appName: "ShopApp", currentRoute: "/products/:id", stateKeys: ["cart"], historySize: 2, totalNavigations: 2 }`

---

## 🧩 PROBLEM–03: 🎨 Interactive UI Component Engine

⚠️ **Function Name:** `createUIComponentEngine()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (UI engine API)    |

**Rules:**

`config` object:

- `namespace` (string)
- `theme` → `"light"` | `"dark"`
- `animationDuration` (number) — ms for transitions
- `storageKey` (string) — key for persisting UI state

**UI Component Engine combines:**

- **DOM Factory** → creates element descriptors
- **ClassList Manager** → manages component states
- **Event Delegation** → single root listener for all components
- **Animation Timeline** → smooth transitions
- **Storage** → persists theme and preferences

**UI Engine API (returned object):**

- `createComponent(type, props)` → creates UI component:
  - `type` → `"button"` | `"modal"` | `"dropdown"` | `"toast"` | `"accordion"`
  - Returns component descriptor with state machine
- `mount(componentId)` → activates component (fires `"mount"` event)
- `unmount(componentId)` → deactivates (fires `"unmount"` event)
- `toggleTheme()` → switches theme, persists to storage, animates transition
- `on(componentId, event, fn)` → delegates event listener to component
- `getComponent(componentId)` → returns component descriptor + current state
- `getReport()` → returns `{ totalComponents, mounted, unmounted, theme, storageKeys }`

| Challenge 📢 | Return UI engine API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const ui = createUIComponentEngine({ namespace: "app", theme: "light", animationDuration: 300, storageKey: "ui-prefs" })`
- `ui.createComponent("button", { label: "Submit", variant: "primary", disabled: false })` ➔
  `{ id: "app-button-1", type: "button", props: { label: "Submit", variant: "primary", disabled: false }, state: "idle" }`
- `ui.createComponent("modal", { title: "Confirm", content: "Are you sure?", closable: true })` ➔
  `{ id: "app-modal-1", type: "modal", props: { title: "Confirm", content: "Are you sure?", closable: true }, state: "closed" }`
- `ui.mount("app-button-1")` ➔ `{ id: "app-button-1", state: "mounted", event: "mount" }`
- `ui.on("app-button-1", "click", () => "Button clicked!")` ➔ `{ registered: true, componentId: "app-button-1", event: "click" }`
- `ui.toggleTheme()` ➔ `{ theme: "dark", persisted: true, animating: true }`
- `ui.getReport()` ➔ `{ totalComponents: 2, mounted: 1, unmounted: 0, theme: "dark", storageKeys: ["ui-prefs"] }`

---

## 🧩 PROBLEM–04: 📊 Browser Performance Monitor

⚠️ **Function Name:** `createBrowserPerformanceMonitor()`

| Input      | `config` (object)           |
| :--------- | :-------------------------- |
| **Output** | object (monitor API)        |

**Rules:**

`config` object:

- `sampleInterval` (number) — ms between samples
- `maxSamples` (number) — max samples to keep
- `thresholds` (object):
  - `domNodes` (number) — warn if DOM node count exceeds
  - `eventListeners` (number) — warn if listener count exceeds
  - `storageUsed` (number) — warn if storage used exceeds KB
  - `timerCount` (number) — warn if active timer count exceeds
  - `longTaskMs` (number) — warn if any task takes longer than N ms

**Monitor API (returned object):**

- `recordSample(metrics)` → records a performance snapshot:
  - `metrics`: `{ domNodes, eventListeners, storageUsedKB, activeTimers, taskDurations[] }`
- `analyze()` → analyzes all samples and returns:
  - `{ warnings, criticalIssues, trends, recommendations }`
- `getTimeline()` → returns samples in order with threshold violation flags
- `detectLeaks()` → identifies growing trends:
  - DOM nodes increasing each sample → `"Potential DOM Leak"`
  - Event listeners increasing → `"Potential Listener Leak"`
  - Storage growing → `"Storage Growth Detected"`
- `getBudget()` → returns performance budget status per metric
- `getReport()` → returns `{ totalSamples, violationCount, leaksDetected, overallHealth }`

| Challenge 📢 | Return monitor API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const monitor = createBrowserPerformanceMonitor({ sampleInterval: 1000, maxSamples: 100, thresholds: { domNodes: 500, eventListeners: 100, storageUsed: 4000, timerCount: 20, longTaskMs: 50 } })`
- `monitor.recordSample({ domNodes: 120, eventListeners: 45, storageUsedKB: 1200, activeTimers: 5, taskDurations: [20, 30] })`
- `monitor.recordSample({ domNodes: 250, eventListeners: 80, storageUsedKB: 2400, activeTimers: 8, taskDurations: [60, 25] })`
- `monitor.recordSample({ domNodes: 480, eventListeners: 110, storageUsedKB: 3800, activeTimers: 12, taskDurations: [80, 90] })`
- `monitor.analyze()` ➔
  `{`
  `warnings: ["Event listeners exceeded threshold (110 > 100)", "Long tasks detected: 60ms, 80ms, 90ms"],`
  `criticalIssues: [],`
  `trends: { domNodes: "increasing", eventListeners: "increasing", storageUsedKB: "increasing" },`
  `recommendations: ["Audit event listener cleanup", "Optimize long-running tasks", "Monitor storage growth"]`
  `}`
- `monitor.detectLeaks()` ➔
  `["Potential DOM Leak: nodes grew 120→250→480", "Potential Listener Leak: listeners grew 45→80→110", "Storage Growth Detected: 1200→2400→3800 KB"]`
- `monitor.getReport()` ➔ `{ totalSamples: 3, violationCount: 3, leaksDetected: 3, overallHealth: "Degraded" }`

---

## 🧩 PROBLEM–05: 🏆 Browser Master System — All M3 Concepts Combined

⚠️ **Function Name:** `createBrowserMasterSystem()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (master API)      |

**Rules:**

`config` object:

- `appName` (string)
- `baseURL` (string)
- `theme` → `"light"` | `"dark"`
- `storageQuota` (number) — KB
- `targetFPS` (number)

**Master System combines ALL M3 concepts:**

- **DOM Engine** → element creation, query, classList, virtual DOM diff
- **Event System** → delegation, custom events, bubbling simulation
- **Form Engine** → validation, multi-step, FormData, security
- **Storage Engine** → localStorage, sessionStorage, cookies with TTL
- **Timer Engine** → setTimeout, setInterval, debounce, throttle
- **Animation Engine** → timeline, easing, requestAnimationFrame
- **URL/Router Engine** → routing, history, URL state, deep links

**Master API (returned object):**

- `dom.create(tag, options)` → creates element
- `dom.query(selector)` → queries element
- `events.on(elementId, event, fn)` → registers event
- `events.emit(elementId, event, data)` → fires event
- `forms.validate(schema, data)` → validates form data
- `storage.set(key, value, ttl)` → stores with TTL
- `storage.get(key)` → retrieves value
- `timers.setTimeout(name, fn, delay)` → registers timer
- `timers.tick(ms)` → advances time
- `animation.addKeyframe(name, prop, from, to, start, end)` → adds animation
- `animation.play(ms)` → advances animation
- `router.register(path, handler)` → registers route
- `router.navigate(url)` → navigates
- `getSystemReport()` → returns complete system state across all modules

| Challenge 📢 | Return master API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const master = createBrowserMasterSystem({ appName: "MasterApp", baseURL: "https://app.com", theme: "dark", storageQuota: 100, targetFPS: 60 })`
- `master.dom.create("div", { classes: ["hero"], text: "Welcome" })`
- `master.events.on("hero-btn", "click", () => "clicked")`
- `master.storage.set("session", { userId: "U001" }, 3600)`
- `master.router.register("/home", () => "Home Page")`
- `master.router.navigate("/home")` ➔ `{ matched: true, route: "/home", result: "Home Page" }`
- `master.forms.validate([{ name: "email", type: "email", required: true, rules: [] }], { email: "test@mail.com" })` ➔ `{ valid: true, errors: {} }`
- `master.timers.setTimeout("init", () => "initialized", 100)`
- `master.timers.tick(100)` ➔ `{ firedTimers: ["init"], executionLog: [{ name: "init", result: "initialized" }] }`
- `master.animation.addKeyframe("fade", "opacity", 0, 1, 0, 500)`
- `master.animation.play(250)` ➔ `{ currentTime: 250, values: { opacity: 0.75 }, isComplete: false }`
- `master.getSystemReport()` ➔
  `{`
  `appName: "MasterApp",`
  `dom: { elementCount: 1 },`
  `events: { listenerCount: 1 },`
  `storage: { keys: ["session"], usedKB: 0.03 },`
  `router: { currentRoute: "/home", totalRoutes: 1 },`
  `timers: { activeCount: 0, totalFired: 1 },`
  `animation: { keyframes: 1, currentTime: 250 }`
  `}`

---