# 🎓 JS DAILY PRACTICE – DAY-264

📅 **Goal:** Module 2 — OOP & Prototypes Mixed Revision & Mastery Test
🎯 **Focus:** Constructor • Prototype • Classes • Encapsulation • Inheritance • Composition • Design Patterns — All Combined

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🏗️ Prototype & Class Hybrid Analyzer

⚠️ **Function Name:** `analyzeOOPStructure()`

| Input      | `definitions` (array of objects) |
| :--------- | :------------------------------- |
| **Output** | object                           |

**Rules:**

Each definition object:

- `name` (string)
- `type` → `"constructor"` | `"class"` | `"object.create"`
- `parent` (string or `null`)
- `ownMethods` (array of strings)
- `protoMethods` (array of strings)
- `privateFields` (array of strings)
- `staticMethods` (array of strings)

**Analysis Rules:**

- Build full **prototype chain** for each definition
- Detect **method shadowing** (same method in child and parent)
- Detect **missing private field encapsulation** (private field with no getter/setter)
- Calculate **OOP score** per definition (0–100):
  - +20 if has private fields
  - +20 if has getters/setters (protoMethods includes `"get*"` or `"set*"`)
  - +20 if inherits from parent
  - +20 if has static methods
  - +20 if no direct private field exposure

| Challenge 📢 | Return `{ chainMap, shadowedMethods, oopScores, overallGrade }`. If invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `analyzeOOPStructure([`
  `{ name: "Animal", type: "class", parent: null, ownMethods: ["breathe"], protoMethods: ["speak", "getAge"], privateFields: ["#age"], staticMethods: ["create"] },`
  `{ name: "Dog", type: "class", parent: "Animal", ownMethods: ["fetch"], protoMethods: ["speak", "bark", "getBreed"], privateFields: ["#breed"], staticMethods: [] }`
  `])` ➔
  `{`
  `chainMap: {`
  `Animal: ["Animal"],`
  `Dog: ["Dog", "Animal"]`
  `},`
  `shadowedMethods: [{ method: "speak", child: "Dog", parent: "Animal" }],`
  `oopScores: [{ name: "Animal", score: 80 }, { name: "Dog", score: 60 }],`
  `overallGrade: "B"`
  `}`

---

## 🧩 PROBLEM–02: 🏦 Full OOP Banking Architecture

⚠️ **Function Name:** `buildFullBankingSystem()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (bank API)      |

**Rules:**

`config` object:

- `bankName` (string)
- `taxRate` (number)
- `interestRates` (object): `{ savings: number, current: number, fixed: number }`
- `minBalances` (object): `{ savings: number, current: number, fixed: number }`

**Full Class Hierarchy:**

- `Account` (base class — abstract):
  - Private: `#balance`, `#transactionLog`
  - `deposit(amount)`, `withdraw(amount)`, `getBalance()`, `getStatement()`
  - Abstract: `applyInterest()` — must be overridden

- `SavingsAccount` (extends Account):
  - `applyInterest()` → applies savings rate
  - `setGoal(targetAmount)` → sets savings goal
  - `getGoalProgress()` → returns `{ target, current, percent, achieved }`

- `CurrentAccount` (extends Account):
  - `applyInterest()` → applies current rate (lower)
  - `overdraftLimit` → can go below minBalance up to this limit
  - `getOverdraftStatus()` → returns `{ inOverdraft, amount }`

- `FixedDepositAccount` (extends Account):
  - `constructor(..., durationMonths, lockedUntil)`
  - `applyInterest()` → applies fixed rate (highest)
  - `withdraw(amount)` → blocked if before `lockedUntil` → `"Account Locked"`
  - `getMaturityInfo()` → returns `{ lockedUntil, maturityAmount }`

**Bank API uses:**
- Factory Pattern → `openAccount(type, owner, initialBalance, ...extras)`
- Observer Pattern → notify `"accountAlert"` event on low balance
- Singleton → one bank instance only

**Bank API (returned object):**

- `openAccount(type, owner, initialBalance, ...extras)` → creates account
- `getAccount(owner)` → returns account instance
- `applyInterestAll()` → applies interest to all accounts
- `subscribeAlert(observerName, fn)` → subscribes to account alerts
- `getBankReport()` → returns `{ totalAccounts, totalBalance, byType, taxCollected }`

| Challenge 📢 | Return bank API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------- |

**Sample Input & Output:**

- `const bank = buildFullBankingSystem({ bankName: "MegaBank", taxRate: 10, interestRates: { savings: 8, current: 3, fixed: 12 }, minBalances: { savings: 500, current: 1000, fixed: 5000 } })`
- `bank.openAccount("savings", "Rahim", 10000)`
- `bank.openAccount("fixed", "Karim", 50000, 12, "2027-01-01")`
- `bank.getAccount("Rahim").deposit(5000)` ➔ `15000`
- `bank.getAccount("Karim").withdraw(1000)` ➔ `"Account Locked"`
- `bank.getAccount("Rahim").getBalance()` ➔ `15000`
- `bank.applyInterestAll()`
- `bank.getBankReport()` ➔
  `{`
  `totalAccounts: 2,`
  `totalBalance: 77200,`
  `byType: { savings: 1, fixed: 1 },`
  `taxCollected: 720`
  `}`

---

## 🧩 PROBLEM–03: 🎮 OOP Game Engine — Full Architecture

⚠️ **Function Name:** `buildOOPGameEngine()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (game API)      |

**Rules:**

`config` object:

- `gameName` (string)
- `maxPlayers` (number)
- `difficultyMultiplier` (number)

**Full OOP Architecture:**

- `Entity` (base — abstract):
  - `#hp`, `#maxHp`, `#level`
  - `takeDamage(n)`, `heal(n)`, `isAlive()`, `getStatus()`
  - Abstract: `act()` — must override

- `Character` (extends Entity):
  - Adds: `#name`, `#inventory[]`
  - `addItem(item)`, `removeItem(item)`, `getInventory()`
  - Abstract: `attack(target)` — must override

- `Warrior` / `Mage` / `Archer` (extend Character) — each overrides `attack()` and `act()`

- `Enemy` (extends Entity):
  - `#type`, `#reward`
  - `act(target)` → attacks target
  - `getReward()` → returns reward on defeat

- Uses **Strategy Pattern** for battle logic (attack strategies per character type)
- Uses **Observer Pattern** to emit `"playerDefeated"`, `"enemyDefeated"`, `"levelUp"` events
- Uses **Composition** for inventory, stats, position behaviors

**Game API (returned object):**

- `createCharacter(type, name, level)` → creates character
- `createEnemy(type, level)` → creates enemy
- `battle(characterName, enemyType)` → simulates one battle round
- `onEvent(eventName, fn)` → subscribes to game events
- `getLeaderboard()` → ranks characters by level × hp
- `getGameReport()` → returns `{ gameName, totalCharacters, totalEnemies, eventsEmitted }`

| Challenge 📢 | Return game API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------- |

**Sample Input & Output:**

- `const game = buildOOPGameEngine({ gameName: "OOPQuest", maxPlayers: 4, difficultyMultiplier: 1.2 })`
- `game.createCharacter("warrior", "Thor", 5)`
- `game.createEnemy("goblin", 3)`
- `game.onEvent("enemyDefeated", (data) => data)`
- `game.battle("Thor", "goblin")` ➔
  `{`
  `attacker: "Thor",`
  `defender: "goblin",`
  `damageDealt: 90,`
  `result: "enemyDefeated",`
  `reward: { xp: 30, gold: 15 }`
  `}`
- `game.getGameReport()` ➔ `{ gameName: "OOPQuest", totalCharacters: 1, totalEnemies: 1, eventsEmitted: 1 }`

---

## 🧩 PROBLEM–04: 🔌 OOP Plugin & Decorator Combined System

⚠️ **Function Name:** `buildAdvancedPluginSystem()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (system API)       |

**Rules:**

`config` object:

- `systemName` (string)
- `version` (string)
- `maxPlugins` (number)
- `logLevel` → `"debug"` | `"info"` | `"error"`

**Combined Architecture:**

- **Singleton** → one system instance
- **Plugin Pattern** (Composition) → add capabilities dynamically:
  - `AuthPlugin` → adds `login()`, `logout()`, `isAuthenticated()`
  - `CachePlugin` → adds `cacheGet(key)`, `cacheSet(key, val)`, `cacheClear()`
  - `MetricsPlugin` → adds `recordMetric(name, value)`, `getMetrics()`
- **Decorator Pattern** → wrap system logger:
  - `TimestampDecorator` → adds timestamp to logs
  - `LevelDecorator` → filters logs by `logLevel`
- **Observer Pattern** → emit events on plugin install/uninstall

**System API (returned object):**

- `installPlugin(pluginName)` → installs plugin, emits `"pluginInstalled"` event
- `uninstallPlugin(pluginName)` → uninstalls, emits `"pluginUninstalled"` event
- `decorateLogger(...decorators)` → applies decorator stack to logger
- `call(capability, ...args)` → calls installed plugin capability
- `onEvent(event, fn)` → subscribes to system events
- `getSystemReport()` → returns `{ systemName, version, installedPlugins, capabilities, loggerStack }`

| Challenge 📢 | Return system API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const sys = buildAdvancedPluginSystem({ systemName: "CoreOS", version: "2.0.0", maxPlugins: 10, logLevel: "info" })`
- `sys.installPlugin("AuthPlugin")`
- `sys.installPlugin("CachePlugin")`
- `sys.decorateLogger("TimestampDecorator", "LevelDecorator")`
- `sys.call("login", "rahim", "pass123")` ➔ `{ success: true, user: "rahim", token: "TOKEN_rahim" }`
- `sys.call("cacheSet", "user:1", { name: "Rahim" })`
- `sys.call("cacheGet", "user:1")` ➔ `{ name: "Rahim" }`
- `sys.getSystemReport()` ➔
  `{`
  `systemName: "CoreOS",`
  `version: "2.0.0",`
  `installedPlugins: ["AuthPlugin", "CachePlugin"],`
  `capabilities: ["login", "logout", "isAuthenticated", "cacheGet", "cacheSet", "cacheClear"],`
  `loggerStack: ["TimestampDecorator", "LevelDecorator"]`
  `}`

---

## 🧩 PROBLEM–05: 🏆 OOP Master System — All M2 Concepts Combined

⚠️ **Function Name:** `buildOOPMasterSystem()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (master API)    |

**Rules:**

`config` object:

- `systemName` (string)
- `version` (string)
- `taxRate` (number)
- `maxEntities` (number)

**Master System combines ALL M2 concepts:**

- **Constructor + Prototype** → base entity creation
- **ES6 Classes** → structured hierarchy
- **Encapsulation** → private fields, getters/setters
- **Inheritance + Polymorphism** → `Entity → Asset → Product / Service / User`
- **Composition** → behavior units (withAudit, withCache, withValidation)
- **Design Patterns**:
  - Singleton → one master system instance
  - Factory → create entities by type
  - Observer → event notifications
  - Strategy → pricing strategies (`"standard"` | `"premium"` | `"discount"`)
  - Decorator → wrap entity output

**Master API (returned object):**

- `createEntity(type, data)` → factory creates `"product"` | `"service"` | `"user"`
- `getEntity(id)` → returns entity instance
- `setPricingStrategy(strategy)` → switches pricing strategy for all products
- `applyDecorator(entityId, decoratorType)` → wraps entity with decorator
- `onEvent(event, fn)` → observe system events
- `processTransaction(fromId, toId, amount)` → records transaction with tax
- `getFullReport()` → returns:
  - `totalEntities` — by type
  - `pricingStrategy` — current active strategy
  - `transactionLog` — all transactions
  - `taxCollected` — total tax
  - `activeObservers` — event subscriptions
  - `decoratorMap` — decorators per entity

| Challenge 📢 | Return master API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const master = buildOOPMasterSystem({ systemName: "OOPCore", version: "3.0.0", taxRate: 15, maxEntities: 100 })`
- `master.createEntity("product", { id: "P001", name: "Laptop", price: 50000, stock: 10 })`
- `master.createEntity("user", { id: "U001", name: "Rahim", email: "rahim@mail.com", role: "admin" })`
- `master.setPricingStrategy("premium")`
- `master.applyDecorator("P001", "TaxDecorator")`
- `master.onEvent("transactionCompleted", (data) => data)`
- `master.processTransaction("U001", "P001", 50000)` ➔
  `{`
  `from: "U001",`
  `to: "P001",`
  `amount: 50000,`
  `tax: 7500,`
  `netAmount: 42500,`
  `status: "completed"`
  `}`
- `master.getFullReport()` ➔
  `{`
  `totalEntities: { product: 1, user: 1 },`
  `pricingStrategy: "premium",`
  `transactionLog: [{ from: "U001", to: "P001", amount: 50000, tax: 7500 }],`
  `taxCollected: 7500,`
  `activeObservers: ["transactionCompleted"],`
  `decoratorMap: { P001: ["TaxDecorator"] }`
  `}`

---