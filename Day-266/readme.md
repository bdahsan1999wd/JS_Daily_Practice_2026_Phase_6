# 🎓 JS DAILY PRACTICE – DAY-266

📅 **Goal:** Browser Event System Architecture Engine
🎯 **Focus:** Event Handling • Event Bubbling • Event Capturing • preventDefault • stopPropagation • Custom Events

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🫧 Event Bubbling & Capturing Simulator

⚠️ **Function Name:** `simulateEventPropagation()`

| Input      | `domTree` (array of objects), `event` (object) |
| :--------- | :--------------------------------------------- |
| **Output** | object                                         |

**Rules:**

Each domTree node object:

- `id` (string)
- `tag` (string)
- `parentId` (string or `null`)
- `listeners` (array of objects):
  - `eventType` (string) — e.g., `"click"`
  - `phase` → `"bubble"` | `"capture"`
  - `stopsAt` (boolean) — calls `stopPropagation()`
  - `prevents` (boolean) — calls `preventDefault()`

`event` object:

- `type` (string) — event type (e.g., `"click"`)
- `targetId` (string) — node where event originates

**Propagation Rules:**

1. **Capture phase** → root → target (top-down), fire `"capture"` listeners
2. **Target phase** → fire both `"capture"` and `"bubble"` listeners on target
3. **Bubble phase** → target → root (bottom-up), fire `"bubble"` listeners
4. If any listener has `stopsAt: true` → stop propagation immediately
5. Track `preventDefault` calls

| Challenge 📢 | Return `{ captureLog, bubbleLog, defaultPrevented, stoppedAt }`. If invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `simulateEventPropagation(`
  `[`
  `{ id: "window", tag: "window", parentId: null, listeners: [{ eventType: "click", phase: "capture", stopsAt: false, prevents: false }] },`
  `{ id: "div", tag: "div", parentId: "window", listeners: [{ eventType: "click", phase: "bubble", stopsAt: false, prevents: false }] },`
  `{ id: "btn", tag: "button", parentId: "div", listeners: [{ eventType: "click", phase: "bubble", stopsAt: true, prevents: true }] }`
  `],`
  `{ type: "click", targetId: "btn" }`
  `)` ➔
  `{`
  `captureLog: ["window"],`
  `bubbleLog: ["btn"],`
  `defaultPrevented: true,`
  `stoppedAt: "btn"`
  `}`

---

## 🧩 PROBLEM–02: 📋 Event Listener Registry Engine

⚠️ **Function Name:** `createEventRegistry()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (registry API)    |

**Rules:**

`config` object:

- `maxListenersPerEvent` (number) — max listeners per event type per element
- `allowDuplicates` (boolean) — if `false`, same handler cannot be added twice

**Registry API (returned object):**

- `on(elementId, eventType, handlerName, handlerFn, options)` → registers listener
  - `options`: `{ once: boolean, capture: boolean, passive: boolean }`
- `off(elementId, eventType, handlerName)` → removes specific listener
- `once(elementId, eventType, handlerName, handlerFn)` → fires only once then auto-removes
- `emit(elementId, eventType, eventData)` → triggers all listeners for that event
  - Returns array of handler results
  - `once` handlers auto-removed after firing
- `getListeners(elementId, eventType)` → returns listener names for element+event
- `removeAllListeners(elementId)` → removes all listeners from element
- `getStats()` → returns `{ totalElements, totalListeners, eventTypeDistribution }`

| Challenge 📢 | Return registry API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const registry = createEventRegistry({ maxListenersPerEvent: 5, allowDuplicates: false })`
- `registry.on("btn1", "click", "handleClick", (e) => "clicked: " + e.target, { once: false, capture: false, passive: false })`
- `registry.on("btn1", "click", "logClick", (e) => "logged: " + e.target, { once: false, capture: false, passive: false })`
- `registry.once("btn1", "mouseenter", "hoverOnce", (e) => "hovered")`
- `registry.emit("btn1", "click", { target: "btn1" })` ➔ `["clicked: btn1", "logged: btn1"]`
- `registry.emit("btn1", "mouseenter", { target: "btn1" })` ➔ `["hovered"]`
- `registry.emit("btn1", "mouseenter", { target: "btn1" })` ➔ `[]` *(once removed)*
- `registry.getListeners("btn1", "click")` ➔ `["handleClick", "logClick"]`
- `registry.getStats()` ➔ `{ totalElements: 1, totalListeners: 2, eventTypeDistribution: { click: 2 } }`

---

## 🧩 PROBLEM–03: 🎯 Custom Event System Engine

⚠️ **Function Name:** `createCustomEventSystem()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (event system API) |

**Rules:**

`config` object:

- `systemName` (string)
- `allowWildcard` (boolean) — if `true`, `"*"` listeners fire on ALL events
- `maxHistory` (number) — max events to keep in history

**Custom Event System API (returned object):**

- `defineEvent(eventName, schema)` → registers event with expected data shape
  - `schema`: `{ required: [], optional: [] }` field names
- `dispatch(eventName, data)` → fires event:
  - Validates data against schema
  - Notifies all subscribers
  - Stores in history
  - Returns `{ dispatched, subscriberCount, validationPassed }`
- `subscribe(eventName, subscriberName, fn)` → listens to event
- `unsubscribe(eventName, subscriberName)` → stops listening
- `getHistory(eventName)` → returns past dispatches for event (up to `maxHistory`)
- `replay(eventName, index)` → re-dispatches a historical event by index
- `getSystemReport()` → returns `{ totalEvents, totalSubscribers, totalDispatched, historySize }`

| Challenge 📢 | Return event system API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------- |

**Sample Input & Output:**

- `const system = createCustomEventSystem({ systemName: "AppEvents", allowWildcard: true, maxHistory: 10 })`
- `system.defineEvent("userLogin", { required: ["userId", "timestamp"], optional: ["device"] })`
- `system.subscribe("userLogin", "analyticsService", (data) => "Analytics: " + data.userId)`
- `system.subscribe("userLogin", "auditLogger", (data) => "Audit: " + data.userId)`
- `system.subscribe("*", "globalLogger", (data) => "Global log")`
- `system.dispatch("userLogin", { userId: "U001", timestamp: 1620000000 })` ➔
  `{ dispatched: true, subscriberCount: 3, validationPassed: true }`
- `system.dispatch("userLogin", { userId: "U002" })` ➔
  `{ dispatched: false, subscriberCount: 0, validationPassed: false }` *(missing required: timestamp)*
- `system.getHistory("userLogin")` ➔ `[{ userId: "U001", timestamp: 1620000000 }]`
- `system.getSystemReport()` ➔ `{ totalEvents: 1, totalSubscribers: 3, totalDispatched: 1, historySize: 1 }`

---

## 🧩 PROBLEM–04: 🖱️ Mouse & Keyboard Event Simulator

⚠️ **Function Name:** `createInputEventSimulator()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (simulator API)    |

**Rules:**

`config` object:

- `targetId` (string) — element being interacted with
- `recordHistory` (boolean) — whether to store all events
- `doubleClickThreshold` (number) — ms between clicks to register as double-click (simulated as event count)

**Simulator API (returned object):**

- `simulateClick(x, y, button)` → fires click event
  - `button` → `"left"` | `"right"` | `"middle"`
  - Two left clicks within threshold → also fires `"dblclick"`
  - Returns `{ type, x, y, button, timestamp }`
- `simulateKeydown(key, modifiers)` → fires keydown event
  - `modifiers`: `{ ctrl, shift, alt, meta }` (booleans)
  - Returns `{ type, key, modifiers, shortcut }` where `shortcut` is `"Ctrl+C"` style string
- `simulateScroll(deltaX, deltaY)` → fires scroll event
  - Returns `{ type, deltaX, deltaY, direction }`
- `getEventHistory()` → returns all recorded events
- `getShortcutMap()` → returns detected keyboard shortcuts and their count
- `getReport()` → returns `{ totalEvents, byType, mostFrequent }`

| Challenge 📢 | Return simulator API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const sim = createInputEventSimulator({ targetId: "canvas", recordHistory: true, doubleClickThreshold: 2 })`
- `sim.simulateClick(100, 200, "left")` ➔ `{ type: "click", x: 100, y: 200, button: "left", timestamp: 1 }`
- `sim.simulateClick(100, 200, "left")` ➔ `{ type: "dblclick", x: 100, y: 200, button: "left", timestamp: 2 }`
- `sim.simulateKeydown("c", { ctrl: true, shift: false, alt: false, meta: false })` ➔
  `{ type: "keydown", key: "c", modifiers: { ctrl: true, shift: false, alt: false, meta: false }, shortcut: "Ctrl+C" }`
- `sim.simulateScroll(0, -100)` ➔ `{ type: "scroll", deltaX: 0, deltaY: -100, direction: "up" }`
- `sim.getShortcutMap()` ➔ `{ "Ctrl+C": 1 }`
- `sim.getReport()` ➔ `{ totalEvents: 4, byType: { click: 1, dblclick: 1, keydown: 1, scroll: 1 }, mostFrequent: "click" }`

---

## 🧩 PROBLEM–05: 🔗 Event Delegation Manager Engine

⚠️ **Function Name:** `createEventDelegationManager()`

| Input      | `config` (object)           |
| :--------- | :-------------------------- |
| **Output** | object (delegation API)     |

**Rules:**

`config` object:

- `rootId` (string) — root element that listens to all delegated events
- `stopOnMatch` (boolean) — if `true`, stops checking further rules after first match

**Event Delegation API (returned object):**

- `delegate(eventType, selector, handlerName, fn)` → registers delegated handler
  - `selector` → `"tag"` | `".class"` | `"#id"` | `"tag.class"`
- `undelegate(eventType, handlerName)` → removes delegated handler
- `trigger(eventType, targetDescriptor)` → simulates event on target:
  - `targetDescriptor`: `{ id, tag, classes[] }`
  - Checks which delegated handlers match
  - Returns `{ matched, results, stoppedEarly }`
- `getDelegatedHandlers(eventType)` → returns handler names for event type
- `getMatchHistory()` → returns log of all trigger results
- `getReport()` → returns `{ totalDelegated, byEventType, totalTriggered, totalMatched }`

| Challenge 📢 | Return delegation API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------- |

**Sample Input & Output:**

- `const manager = createEventDelegationManager({ rootId: "app", stopOnMatch: false })`
- `manager.delegate("click", ".btn", "handleBtn", (e) => "Button clicked: " + e.id)`
- `manager.delegate("click", "button", "handleAnyBtn", (e) => "Any button: " + e.id)`
- `manager.delegate("click", "#submitBtn", "handleSubmit", (e) => "Submit: " + e.id)`
- `manager.trigger("click", { id: "submitBtn", tag: "button", classes: ["btn", "primary"] })` ➔
  `{`
  `matched: ["handleBtn", "handleAnyBtn", "handleSubmit"],`
  `results: ["Button clicked: submitBtn", "Any button: submitBtn", "Submit: submitBtn"],`
  `stoppedEarly: false`
  `}`
- `manager.getDelegatedHandlers("click")` ➔ `["handleBtn", "handleAnyBtn", "handleSubmit"]`
- `manager.getReport()` ➔ `{ totalDelegated: 3, byEventType: { click: 3 }, totalTriggered: 1, totalMatched: 3 }`

---