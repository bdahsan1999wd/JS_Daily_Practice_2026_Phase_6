# 🎓 JS DAILY PRACTICE – DAY-258

📅 **Goal:** Constructor Functions & Prototype Chain Engine
🎯 **Focus:** Constructor Functions • prototype • __proto__ • Object.create() • Prototype Chain Lookup

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🏗️ Constructor Function & Prototype Builder

⚠️ **Function Name:** `buildConstructorSystem()`

| Input      | `blueprint` (object)      |
| :--------- | :------------------------ |
| **Output** | object (constructor API)  |

**Rules:**

`blueprint` object:

- `name` (string) — constructor name (e.g., `"Person"`)
- `properties` (array of strings) — instance properties
- `methods` (object) — key: method name, value: method description string

**System API (returned object):**

- `create(...values)` → creates a new instance with given property values
- `addMethod(methodName, fn)` → adds method to prototype (shared across all instances)
- `getInstance(id)` → returns created instance by index (0-based)
- `getPrototypeMethods()` → returns array of method names on prototype
- `getInstanceCount()` → returns total instances created

**Rules:**

- Methods added via `addMethod` must be on the **prototype** (not copied per instance)
- Each instance must have its own **property values** (not shared)
- Invalid property count (values.length ≠ properties.length) → return `"Invalid Input"`

| Challenge 📢 | Return constructor system API. If blueprint invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------- |

**Sample Input & Output:**

- `const system = buildConstructorSystem({`
  `name: "Person",`
  `properties: ["name", "age"],`
  `methods: { greet: "returns greeting", getAge: "returns age" }`
  `})`
- `system.addMethod("greet", function() { return "Hi, I am " + this.name; })`
- `system.addMethod("getAge", function() { return this.age; })`
- `const p1 = system.create("Rahim", 25)`
- `const p2 = system.create("Karim", 30)`
- `p1.greet()` ➔ `"Hi, I am Rahim"`
- `p2.getAge()` ➔ `30`
- `system.getPrototypeMethods()` ➔ `["greet", "getAge"]`
- `system.getInstanceCount()` ➔ `2`

---

## 🧩 PROBLEM–02: 🔗 Prototype Chain Lookup Simulator

⚠️ **Function Name:** `simulatePrototypeChain()`

| Input      | `chain` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object                     |

**Rules:**

Each chain object represents one level:

- `level` (string) — name of this prototype level (e.g., `"instance"`, `"Animal"`, `"Object"`)
- `properties` (object) — key/value pairs available at this level
- `methods` (array of strings) — method names available at this level

**Lookup Rules:**

- Start from `level[0]` (instance level) → walk up the chain
- First level that has the property/method → that is the resolved level
- Not found in any level → `"undefined"`
- Track how many levels were traversed for each lookup

| Challenge 📢 | Return `{ lookupResults }` where each result has `{ name, foundAt, traversedLevels, value }`. If invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `simulatePrototypeChain(`
  `[`
  `{ level: "instance", properties: { name: "Rahim" }, methods: [] },`
  `{ level: "Person", properties: { species: "human" }, methods: ["greet", "walk"] },`
  `{ level: "Object", properties: {}, methods: ["toString", "hasOwnProperty"] }`
  `],`
  `["name", "species", "greet", "toString", "fly"]`
  `)` ➔
  `{`
  `lookupResults: [`
  `{ name: "name", foundAt: "instance", traversedLevels: 1, value: "Rahim" },`
  `{ name: "species", foundAt: "Person", traversedLevels: 2, value: "human" },`
  `{ name: "greet", foundAt: "Person", traversedLevels: 2, value: "method" },`
  `{ name: "toString", foundAt: "Object", traversedLevels: 3, value: "method" },`
  `{ name: "fly", foundAt: null, traversedLevels: 3, value: "undefined" }`
  `]`
  `}`

---

## 🧩 PROBLEM–03: 🧬 Object.create() Inheritance Simulator

⚠️ **Function Name:** `simulateObjectCreate()`

| Input      | `hierarchy` (array of objects) |
| :--------- | :----------------------------- |
| **Output** | object                         |

**Rules:**

Each hierarchy object:

- `name` (string) — object name
- `inheritsFrom` (string or `null`) — parent object name (simulates `Object.create(parent)`)
- `ownProperties` (object) — own key/value pairs
- `ownMethods` (array of strings) — own method names

**Simulation Rules:**

- Build the full prototype chain for each object
- `hasOwnProperty(name, key)` → true only if key is in `ownProperties` or `ownMethods`
- `canAccess(name, key)` → true if key exists anywhere in the prototype chain
- `getInheritedFrom(name, key)` → returns which ancestor provides this key

| Challenge 📢 | Return `{ objectMap }` with `{ ownKeys, inheritedKeys, fullChain }` for each object. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `simulateObjectCreate([`
  `{ name: "Animal", inheritsFrom: null, ownProperties: { alive: true }, ownMethods: ["breathe"] },`
  `{ name: "Dog", inheritsFrom: "Animal", ownProperties: { breed: "Labrador" }, ownMethods: ["bark"] },`
  `{ name: "GuideDog", inheritsFrom: "Dog", ownProperties: { trained: true }, ownMethods: ["guide"] }`
  `])` ➔
  `{`
  `objectMap: {`
  `Animal: { ownKeys: ["alive", "breathe"], inheritedKeys: [], fullChain: ["Animal"] },`
  `Dog: { ownKeys: ["breed", "bark"], inheritedKeys: ["alive", "breathe"], fullChain: ["Dog", "Animal"] },`
  `GuideDog: { ownKeys: ["trained", "guide"], inheritedKeys: ["breed", "bark", "alive", "breathe"], fullChain: ["GuideDog", "Dog", "Animal"] }`
  `}`
  `}`

---

## 🧩 PROBLEM–04: 🏦 Prototype-Based Bank System

⚠️ **Function Name:** `createPrototypeBankSystem()`

| Input      | `config` (object)     |
| :--------- | :-------------------- |
| **Output** | object (bank API)     |

**Rules:**

`config` object:

- `bankName` (string)
- `defaultInterestRate` (number) — annual interest rate (%)
- `minBalance` (number) — minimum required balance

**Prototype Architecture:**

- `Account` — base constructor with shared prototype methods:
  - `deposit(amount)` → adds to balance
  - `withdraw(amount)` → deducts (not below `minBalance`)
  - `getBalance()` → returns current balance
  - `applyInterest()` → adds `balance * interestRate / 100`
- `SavingsAccount` — inherits from `Account`, overrides `applyInterest()` with **double rate**
- `CurrentAccount` — inherits from `Account`, allows balance to go **below minBalance by 20%**

**Bank API (returned object):**

- `openAccount(type, ownerName, initialBalance)` → creates account (`"savings"` | `"current"`)
- `getAccount(ownerName)` → returns account instance
- `applyInterestAll()` → applies interest to all accounts
- `getBankReport()` → returns `{ totalAccounts, totalDeposits, accountList }`

| Challenge 📢 | Return bank system API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------ |

**Sample Input & Output:**

- `const bank = createPrototypeBankSystem({ bankName: "ProtoBank", defaultInterestRate: 10, minBalance: 500 })`
- `bank.openAccount("savings", "Rahim", 1000)`
- `bank.openAccount("current", "Karim", 2000)`
- `bank.getAccount("Rahim").deposit(500)` ➔ `1500`
- `bank.getAccount("Rahim").applyInterest()` ➔ `1650` *(double rate: 20%)*
- `bank.getAccount("Karim").withdraw(1700)` ➔ `300` *(current: can go 20% below minBalance = 400)*
- `bank.getBankReport()` ➔
  `{`
  `totalAccounts: 2,`
  `totalDeposits: 3000,`
  `accountList: [`
  `{ owner: "Rahim", type: "savings", balance: 1650 },`
  `{ owner: "Karim", type: "current", balance: 300 }`
  `]`
  `}`

---

## 🧩 PROBLEM–05: 🔍 Prototype Integrity Inspector

⚠️ **Function Name:** `inspectPrototypeIntegrity()`

| Input      | `constructors` (array of objects) |
| :--------- | :-------------------------------- |
| **Output** | object                            |

**Rules:**

Each constructor object:

- `name` (string) — constructor name
- `prototypeProperties` (array of strings) — properties on prototype
- `prototypeMethods` (array of strings) — methods on prototype
- `inheritsFrom` (string or `null`) — parent constructor name
- `instances` (array of objects) — each has `{ instanceName, ownProperties }`

**Inspection Rules:**

- Verify **no instance properties leak onto prototype** (instance props must stay on instance only)
- Detect **method duplication** — same method name on both child and parent prototype → flag as override
- Detect **prototype pollution** — any property named `__proto__`, `constructor`, `toString` being overridden
- Verify **instanceof chain** — check if instance correctly belongs to its constructor and all ancestors

| Challenge 📢 | Return `{ instanceReport, overrides, pollutionRisks, instanceofMap }`. If invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `inspectPrototypeIntegrity([`
  `{ name: "Animal", prototypeProperties: [], prototypeMethods: ["breathe", "toString"], inheritsFrom: null, instances: [] },`
  `{ name: "Dog", prototypeProperties: [], prototypeMethods: ["breathe", "bark"], inheritsFrom: "Animal",`
  `instances: [{ instanceName: "rex", ownProperties: ["name", "age"] }] }`
  `])` ➔
  `{`
  `instanceReport: [{ instanceName: "rex", constructor: "Dog", ownProperties: ["name", "age"], leaksToPrototype: false }],`
  `overrides: [{ method: "breathe", childConstructor: "Dog", parentConstructor: "Animal" }],`
  `pollutionRisks: [{ method: "toString", constructor: "Animal", risk: "Overrides built-in" }],`
  `instanceofMap: { rex: ["Dog", "Animal"] }`
  `}`

---