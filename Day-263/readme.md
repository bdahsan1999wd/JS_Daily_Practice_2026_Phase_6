# 🎓 JS DAILY PRACTICE – DAY-263

📅 **Goal:** Advanced OOP Design Patterns Engine
🎯 **Focus:** Singleton • Factory • Observer • Strategy • Decorator — Real-World OOP Patterns

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🏛️ Singleton Pattern Engine

⚠️ **Function Name:** `buildSingletonSystem()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (singleton API)   |

**Rules:**

`config` object:

- `systemName` (string)
- `maxInstances` (number)

**Singleton Implementation:**

- `AppConfig` (Singleton class):
  - Only **one instance** ever created
  - `getInstance()` → always returns the same instance
  - Private fields: `#settings`, `#instanceCount`
  - Methods:
    - `set(key, value)` → updates setting
    - `get(key)` → returns setting value
    - `getAll()` → returns copy of all settings
    - `reset()` → resets to default settings

- `Logger` (Singleton class):
  - One instance, shared log store
  - Methods:
    - `log(level, message)` → stores `{ level, message, timestamp }`
    - `getLogs(level)` → filters by level (`"info"` | `"warn"` | `"error"`)
    - `clearLogs()` → empties log store
    - `getStats()` → returns `{ total, byLevel }`

**Singleton API (returned object):**

- `getConfig()` → returns AppConfig singleton instance
- `getLogger()` → returns Logger singleton instance
- `verifyInstance(inst1, inst2)` → returns `true` if both are same singleton instance
- `getReport()` → returns `{ configSettings, logCount }`

| Challenge 📢 | Return singleton API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const system = buildSingletonSystem({ systemName: "AppCore", maxInstances: 1 })`
- `const config1 = system.getConfig()`
- `const config2 = system.getConfig()`
- `system.verifyInstance(config1, config2)` ➔ `true`
- `config1.set("theme", "dark")`
- `config2.get("theme")` ➔ `"dark"` *(same instance)*
- `const logger = system.getLogger()`
- `logger.log("info", "App started")`
- `logger.log("error", "DB connection failed")`
- `logger.getStats()` ➔ `{ total: 2, byLevel: { info: 1, error: 1 } }`
- `system.getReport()` ➔ `{ configSettings: { theme: "dark" }, logCount: 2 }`

---

## 🧩 PROBLEM–02: 🏭 Factory Pattern Engine

⚠️ **Function Name:** `buildFactorySystem()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (factory API)    |

**Rules:**

`config` object:

- `factoryName` (string)
- `registrationMode` → `"strict"` | `"flexible"`
  - `"strict"` → only pre-registered types allowed
  - `"flexible"` → unknown types create generic objects

**Factory Pattern:**

- `AbstractNotification` (base):
  - `send(recipient, message)` → throws `"Must implement send()"`
  - `getType()` → returns notification type
  - `getLog()` → returns send history

- `EmailNotification` (extends AbstractNotification):
  - `send(recipient, message)` → returns `{ type: "email", to: recipient, subject: message, status: "sent" }`

- `SMSNotification` (extends AbstractNotification):
  - `send(recipient, message)` → returns `{ type: "sms", phone: recipient, text: message, status: "sent" }`

- `PushNotification` (extends AbstractNotification):
  - `send(recipient, message)` → returns `{ type: "push", deviceId: recipient, payload: message, status: "delivered" }`

**Factory API (returned object):**

- `register(type, NotificationClass)` → registers custom type
- `create(type)` → creates notification instance by type
- `createAndSend(type, recipient, message)` → creates + sends immediately
- `bulkSend(type, recipients[], message)` → sends to all recipients
- `getReport()` → returns `{ totalCreated, totalSent, byType }`

| Challenge 📢 | Return factory API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const factory = buildFactorySystem({ factoryName: "NotifFactory", registrationMode: "strict" })`
- `factory.create("email").send("rahim@mail.com", "Welcome!")` ➔ `{ type: "email", to: "rahim@mail.com", subject: "Welcome!", status: "sent" }`
- `factory.createAndSend("sms", "01711111111", "OTP: 123456")` ➔ `{ type: "sms", phone: "01711111111", text: "OTP: 123456", status: "sent" }`
- `factory.bulkSend("push", ["d001", "d002", "d003"], "New update!")` ➔
  `[`
  `{ type: "push", deviceId: "d001", payload: "New update!", status: "delivered" },`
  `{ type: "push", deviceId: "d002", payload: "New update!", status: "delivered" },`
  `{ type: "push", deviceId: "d003", payload: "New update!", status: "delivered" }`
  `]`
- `factory.getReport()` ➔ `{ totalCreated: 5, totalSent: 5, byType: { email: 1, sms: 1, push: 3 } }`

---

## 🧩 PROBLEM–03: 👁️ Observer Pattern Engine

⚠️ **Function Name:** `buildObserverSystem()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (observer API)    |

**Rules:**

`config` object:

- `systemName` (string)
- `maxObservers` (number)
- `asyncMode` (boolean)

**Observer Pattern:**

- `EventEmitter` (Subject class):
  - Private: `#observers` map `{ eventName: [observers] }`
  - `subscribe(eventName, observerName, callbackFn)` → registers observer
  - `unsubscribe(eventName, observerName)` → removes observer
  - `emit(eventName, data)` → notifies all observers for that event
  - `once(eventName, observerName, callbackFn)` → fires only on first emit then auto-unsubscribes
  - `getObservers(eventName)` → returns observer names for event

- `Observer` (class):
  - `constructor(name, handlerFn)`
  - `update(eventName, data)` → calls handlerFn with data
  - `getHistory()` → returns received events log

**Observer API (returned object):**

- `createEmitter(name)` → creates EventEmitter instance
- `createObserver(name, handlerFn)` → creates Observer instance
- `getEmitter(name)` → returns emitter instance
- `getObserver(name)` → returns observer instance
- `getSystemReport()` → returns `{ totalEmitters, totalObservers, totalEventsEmitted }`

| Challenge 📢 | Return observer API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const system = buildObserverSystem({ systemName: "EventBus", maxObservers: 10, asyncMode: false })`
- `system.createEmitter("userEmitter")`
- `system.createObserver("emailService", (data) => "Email sent to " + data.email)`
- `system.createObserver("logService", (data) => "Logged: " + data.name)`
- `const emitter = system.getEmitter("userEmitter")`
- `emitter.subscribe("userCreated", "emailService", system.getObserver("emailService").update)`
- `emitter.subscribe("userCreated", "logService", system.getObserver("logService").update)`
- `emitter.emit("userCreated", { name: "Rahim", email: "rahim@mail.com" })`
- `emitter.getObservers("userCreated")` ➔ `["emailService", "logService"]`
- `emitter.unsubscribe("userCreated", "logService")`
- `emitter.getObservers("userCreated")` ➔ `["emailService"]`
- `system.getSystemReport()` ➔ `{ totalEmitters: 1, totalObservers: 2, totalEventsEmitted: 1 }`

---

## 🧩 PROBLEM–04: 🎯 Strategy Pattern Engine

⚠️ **Function Name:** `buildStrategySystem()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (strategy API)    |

**Rules:**

`config` object:

- `systemName` (string)
- `defaultStrategy` (string)

**Strategy Pattern:**

- `Sorter` (context class — uses interchangeable sort strategies):
  - `setStrategy(strategyName)` → switches sorting strategy
  - `sort(data[])` → executes current strategy on data
  - `getCurrentStrategy()` → returns active strategy name

**Built-in Strategies:**

- `BubbleSort` → O(n²), stable sort, simulatedTime = `n * n`
- `QuickSort` → O(n log n), unstable, simulatedTime = `n * log2(n)`
- `MergeSort` → O(n log n), stable, simulatedTime = `n * log2(n)`
- `InsertionSort` → O(n²), stable, best for small arrays, simulatedTime = `n * n`

Each strategy tracks:
- `executionCount` (how many times used)
- `lastExecutionTime` (simulatedTime based on array length)

**Strategy API (returned object):**

- `createSorter(name)` → creates Sorter context instance
- `getSorter(name)` → returns sorter instance
- `registerStrategy(name, strategyFn)` → adds custom sort strategy
- `benchmark(data[], strategies[])` → runs all listed strategies, returns performance comparison
- `getReport()` → returns `{ totalSorters, strategyUsage, fastestStrategy }`

| Challenge 📢 | Return strategy API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const system = buildStrategySystem({ systemName: "SortEngine", defaultStrategy: "MergeSort" })`
- `system.createSorter("dataSorter")`
- `const sorter = system.getSorter("dataSorter")`
- `sorter.setStrategy("BubbleSort")`
- `sorter.sort([5, 3, 8, 1, 9, 2])` ➔ `[1, 2, 3, 5, 8, 9]`
- `sorter.setStrategy("QuickSort")`
- `sorter.sort([5, 3, 8, 1, 9, 2])` ➔ `[1, 2, 3, 5, 8, 9]`
- `system.benchmark([5, 3, 8, 1, 9, 2], ["BubbleSort", "QuickSort", "MergeSort"])` ➔
  `[`
  `{ strategy: "BubbleSort", result: [1,2,3,5,8,9], simulatedTime: 36 },`
  `{ strategy: "QuickSort", result: [1,2,3,5,8,9], simulatedTime: 15 },`
  `{ strategy: "MergeSort", result: [1,2,3,5,8,9], simulatedTime: 15 }`
  `]`
- `system.getReport()` ➔ `{ totalSorters: 1, strategyUsage: { BubbleSort: 1, QuickSort: 1 }, fastestStrategy: "QuickSort" }`

---

## 🧩 PROBLEM–05: 🎨 Decorator Pattern Engine

⚠️ **Function Name:** `buildDecoratorSystem()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (decorator API)     |

**Rules:**

`config` object:

- `systemName` (string)
- `maxDecorators` (number)

**Decorator Pattern — wrap objects to add behavior dynamically:**

- `BaseLogger` (component class):
  - `constructor(name)`
  - `log(message)` → returns `"[BASE] message"`
  - `getType()` → returns `"BaseLogger"`

**Decorators (each wraps a logger and adds behavior):**

- `TimestampDecorator` → prepends `[T:N]` (N = sequential number) to log output
- `LevelDecorator(level)` → prepends `[LEVEL]` to log output
- `PrefixDecorator(prefix)` → prepends custom prefix
- `FilterDecorator(keyword)` → only logs messages containing keyword, else returns `"Filtered"`
- `CountDecorator` → tracks how many times `log()` was called, adds `[#N]` to output

**Decorator API (returned object):**

- `createLogger(name)` → creates BaseLogger instance
- `decorate(loggerName, decoratorType, ...args)` → wraps logger with decorator
- `getLogger(name)` → returns current (possibly decorated) logger
- `getDecoratorStack(name)` → returns array of applied decorator names
- `undecorate(name)` → removes outermost decorator
- `getReport()` → returns `{ totalLoggers, decoratorUsage, totalLogsEmitted }`

| Challenge 📢 | Return decorator API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const system = buildDecoratorSystem({ systemName: "LogSystem", maxDecorators: 5 })`
- `system.createLogger("appLogger")`
- `system.decorate("appLogger", "TimestampDecorator")`
- `system.decorate("appLogger", "LevelDecorator", "ERROR")`
- `system.decorate("appLogger", "PrefixDecorator", "APP")`
- `system.getLogger("appLogger").log("DB connection failed")` ➔ `"[APP] [ERROR] [T:1] [BASE] DB connection failed"`
- `system.getDecoratorStack("appLogger")` ➔ `["TimestampDecorator", "LevelDecorator", "PrefixDecorator"]`
- `system.undecorate("appLogger")`
- `system.getDecoratorStack("appLogger")` ➔ `["TimestampDecorator", "LevelDecorator"]`
- `system.getReport()` ➔ `{ totalLoggers: 1, decoratorUsage: { TimestampDecorator: 1, LevelDecorator: 1, PrefixDecorator: 1 }, totalLogsEmitted: 1 }`

---