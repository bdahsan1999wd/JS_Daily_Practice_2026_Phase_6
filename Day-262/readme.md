# 🎓 JS DAILY PRACTICE – DAY-262

📅 **Goal:** Composition vs Inheritance Architecture Engine
🎯 **Focus:** Object Composition • Mixins • Favor Composition • Has-A vs Is-A • Behavior Injection

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🧩 Mixin Behavior Injection Engine

⚠️ **Function Name:** `buildMixinSystem()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (mixin API)     |

**Rules:**

`config` object:

- `systemName` (string)
- `allowConflicts` (boolean) — if `false`, conflicting mixin methods throw error

**Predefined Mixins (behaviors to inject):**

- `Serializable` → adds:
  - `serialize()` → returns JSON string of instance own properties
  - `deserialize(json)` → parses and assigns properties

- `Validatable` → adds:
  - `validate()` → returns `{ valid: boolean, errors: [] }`
  - `addRule(field, ruleFn)` → adds validation rule for a field

- `Loggable` → adds:
  - `log(message)` → stores log entry `{ message, timestamp }`
  - `getLogs()` → returns all log entries

- `Comparable` → adds:
  - `compareTo(other, field)` → returns `-1` | `0` | `1`
  - `isEqualTo(other)` → deep equality check on own properties

**Mixin API (returned object):**

- `createClass(className, baseProperties)` → creates a plain class with given properties
- `applyMixin(className, ...mixinNames)` → injects mixin behaviors into class
- `getInstance(className, values)` → creates instance with mixin behaviors attached
- `listMixins(className)` → returns applied mixin names for a class
- `getReport()` → returns `{ totalClasses, mixinUsage }`

| Challenge 📢 | Return mixin API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------ |

**Sample Input & Output:**

- `const system = buildMixinSystem({ systemName: "MixinLab", allowConflicts: false })`
- `system.createClass("User", ["name", "email", "age"])`
- `system.applyMixin("User", "Serializable", "Loggable", "Validatable")`
- `const user = system.getInstance("User", { name: "Rahim", email: "rahim@mail.com", age: 25 })`
- `user.serialize()` ➔ `'{"name":"Rahim","email":"rahim@mail.com","age":25}'`
- `user.log("User created")` ➔ `[{ message: "User created", timestamp: 1 }]`
- `user.addRule("age", val => val >= 18)`
- `user.validate()` ➔ `{ valid: true, errors: [] }`
- `system.listMixins("User")` ➔ `["Serializable", "Loggable", "Validatable"]`
- `system.getReport()` ➔ `{ totalClasses: 1, mixinUsage: { Serializable: 1, Loggable: 1, Validatable: 1 } }`

---

## 🧩 PROBLEM–02: 🏗️ Component Composition System

⚠️ **Function Name:** `buildComponentSystem()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (component API)    |

**Rules:**

`config` object:

- `appName` (string)
- `maxComponents` (number)

**Composition Approach — build complex objects from small behavior units:**

**Behavior Units (pure functions returning behavior objects):**

- `withHealth(hp)` → `{ hp, takeDamage(n), heal(n), isAlive() }`
- `withInventory(capacity)` → `{ items: [], addItem(item), removeItem(item), getItems(), isFull() }`
- `withPosition(x, y)` → `{ x, y, moveTo(x, y), distanceTo(other) }`
- `withStats(strength, speed)` → `{ strength, speed, getStats(), buffStats(multiplier) }`

**Component API (returned object):**

- `createEntity(name, ...behaviors)` → composes entity from behavior units
  - Each behavior unit result is merged into the entity object
- `getEntity(name)` → returns composed entity
- `addBehavior(entityName, behavior)` → adds new behavior to existing entity
- `hasBehavior(entityName, behaviorName)` → returns boolean
- `getEntityReport(name)` → returns `{ name, behaviors, propertyCount }`
- `getAppReport()` → returns `{ appName, totalEntities, behaviorUsage }`

| Challenge 📢 | Return component API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const app = buildComponentSystem({ appName: "GameEngine", maxComponents: 50 })`
- `app.createEntity("Hero",`
  `withHealth(100),`
  `withInventory(10),`
  `withPosition(0, 0),`
  `withStats(80, 70)`
  `)`
- `app.createEntity("Chest", withPosition(5, 5), withInventory(20))`
- `const hero = app.getEntity("Hero")`
- `hero.takeDamage(30)` ➔ `70`
- `hero.addItem("Sword")` ➔ `["Sword"]`
- `hero.moveTo(3, 4)`
- `hero.distanceTo(app.getEntity("Chest"))` ➔ `2.83`
- `app.hasBehavior("Hero", "withHealth")` ➔ `true`
- `app.hasBehavior("Chest", "withHealth")` ➔ `false`
- `app.getEntityReport("Hero")` ➔ `{ name: "Hero", behaviors: ["withHealth", "withInventory", "withPosition", "withStats"], propertyCount: 12 }`

---

## 🧩 PROBLEM–03: 🔌 Plugin-Based Architecture Engine

⚠️ **Function Name:** `buildPluginArchitecture()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (plugin API)      |

**Rules:**

`config` object:

- `appName` (string)
- `version` (string)
- `pluginTimeout` (number) — max ms a plugin can run (simulated as operation count)

**Plugin System (composition over inheritance):**

Each plugin is an object with:

- `name` (string)
- `version` (string)
- `dependencies` (array of strings) — other plugin names required first
- `install(app)` → function that adds capabilities to app context
- `uninstall(app)` → function that removes capabilities

**Plugin API (returned object):**

- `register(plugin)` → registers plugin (validates dependencies exist)
- `install(pluginName)` → installs plugin (checks & installs dependencies first)
- `uninstall(pluginName)` → uninstalls plugin (checks no other plugin depends on it)
- `isInstalled(pluginName)` → returns boolean
- `getInstalledCapabilities()` → returns all methods added by installed plugins
- `getPluginReport()` → returns `{ totalRegistered, totalInstalled, dependencyMap }`

| Challenge 📢 | Return plugin API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const arch = buildPluginArchitecture({ appName: "CMS", version: "1.0.0", pluginTimeout: 100 })`
- `arch.register({ name: "auth", version: "1.0", dependencies: [], install: (app) => { app.login = () => "logged in" }, uninstall: (app) => { delete app.login } })`
- `arch.register({ name: "profile", version: "1.0", dependencies: ["auth"], install: (app) => { app.getProfile = () => "profile data" }, uninstall: (app) => { delete app.getProfile } })`
- `arch.install("profile")` *(auto-installs "auth" first)*
- `arch.isInstalled("auth")` ➔ `true`
- `arch.isInstalled("profile")` ➔ `true`
- `arch.getInstalledCapabilities()` ➔ `["login", "getProfile"]`
- `arch.uninstall("auth")` ➔ `"Cannot uninstall: profile depends on auth"`
- `arch.getPluginReport()` ➔ `{ totalRegistered: 2, totalInstalled: 2, dependencyMap: { auth: [], profile: ["auth"] } }`

---

## 🧩 PROBLEM–04: ⚖️ Composition vs Inheritance Comparator

⚠️ **Function Name:** `compareApproaches()`

| Input      | `scenario` (object)    |
| :--------- | :--------------------- |
| **Output** | object                 |

**Rules:**

`scenario` object:

- `name` (string) — scenario name
- `entities` (array of objects):
  - `name` (string)
  - `behaviors` (array of strings) — all behaviors this entity needs
- `inheritanceTree` (object) — proposed inheritance: `{ parent: string, children: [] }`

**Analysis Rules:**

- **Inheritance Score** (0–100):
  - -10 for each entity that needs behaviors NOT in its parent chain
  - -15 for each level of depth beyond 3
  - -20 if any entity shares behaviors with a non-sibling in a way that forces awkward hierarchy
  - +30 base score

- **Composition Score** (0–100):
  - +10 for each unique behavior that can be shared independently
  - +20 for flexibility (no forced hierarchy)
  - +10 if total behaviors > 5 (complexity handled better by composition)
  - Base: 50

- **Recommendation** → `"Inheritance"` | `"Composition"` | `"Hybrid"` based on scores
  - Difference < 10 → `"Hybrid"`
  - Otherwise → higher scorer wins

| Challenge 📢 | Return `{ inheritanceScore, compositionScore, recommendation, reasoning }`. If invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `compareApproaches({`
  `name: "RobotSystem",`
  `entities: [`
  `{ name: "FlyingRobot", behaviors: ["fly", "talk", "recharge"] },`
  `{ name: "SwimmingRobot", behaviors: ["swim", "talk", "recharge"] },`
  `{ name: "HybridRobot", behaviors: ["fly", "swim", "talk", "recharge", "fight"] }`
  `],`
  `inheritanceTree: { parent: "Robot", children: ["FlyingRobot", "SwimmingRobot", "HybridRobot"] }`
  `})` ➔
  `{`
  `inheritanceScore: 30,`
  `compositionScore: 90,`
  `recommendation: "Composition",`
  `reasoning: "HybridRobot needs fly+swim which cannot be naturally inherited from a single parent. Composition handles shared behaviors (talk, recharge) without forcing awkward hierarchy."`
  `}`

---

## 🧩 PROBLEM–05: 🔄 Behavior Pipeline Composer

⚠️ **Function Name:** `createBehaviorPipeline()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (pipeline API)    |

**Rules:**

`config` object:

- `name` (string)
- `mode` → `"sequential"` | `"parallel"` | `"conditional"`

**Behavior Pipeline (composition of behaviors into a processing chain):**

Each behavior unit:

- `name` (string)
- `fn(input, context)` → transforms input, returns output
- `condition(input)` (optional) → boolean — only runs if condition is true (for `"conditional"` mode)
- `priority` (number) — lower runs first (for `"parallel"` mode, affects result merge order)

**Pipeline API (returned object):**

- `addBehavior(behaviorUnit)` → registers behavior in pipeline
- `removeBehavior(name)` → removes behavior
- `run(input)` → executes pipeline:
  - `"sequential"` → each behavior's output feeds into next
  - `"parallel"` → all behaviors run on original input, results merged by priority
  - `"conditional"` → behaviors run only if their condition passes
  - Returns `{ finalOutput, executionLog, skipped }`
- `getBehaviors()` → returns registered behavior names in execution order
- `reset()` → clears all behaviors

| Challenge 📢 | Return pipeline API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const pipeline = createBehaviorPipeline({ name: "DataPipeline", mode: "sequential" })`
- `pipeline.addBehavior({ name: "trim", fn: (input) => ({ ...input, name: input.name.trim() }) })`
- `pipeline.addBehavior({ name: "uppercase", fn: (input) => ({ ...input, name: input.name.toUpperCase() }) })`
- `pipeline.addBehavior({ name: "addPrefix", fn: (input) => ({ ...input, name: "USER_" + input.name }) })`
- `pipeline.run({ name: "  rahim  ", age: 25 })` ➔
  `{`
  `finalOutput: { name: "USER_RAHIM", age: 25 },`
  `executionLog: ["trim", "uppercase", "addPrefix"],`
  `skipped: []`
  `}`
- `pipeline.getBehaviors()` ➔ `["trim", "uppercase", "addPrefix"]`

---