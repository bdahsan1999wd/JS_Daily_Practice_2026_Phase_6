# 🎓 JS DAILY PRACTICE – DAY-260

📅 **Goal:** Encapsulation & Access Control Architecture
🎯 **Focus:** Private Fields (#) • Getters & Setters • Static Methods • Access Modifiers Simulation • Data Protection Patterns

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🔐 Private Field Bank Account System

⚠️ **Function Name:** `buildSecureBankSystem()`

| Input      | `config` (object)     |
| :--------- | :-------------------- |
| **Output** | object (bank API)     |

**Rules:**

`config` object:

- `bankName` (string)
- `minBalance` (number)
- `maxDailyWithdraw` (number)

**Class Architecture (simulate private fields using closure or naming convention `#`):**

- `SecureAccount` (class):
  - Private fields: `#balance`, `#pin`, `#dailyWithdrawn`, `#transactionLog`
  - `constructor(owner, initialBalance, pin)`
  - Getters:
    - `get owner()` → returns owner name
    - `get balance()` → returns current balance (read-only)
    - `get transactionCount()` → returns total transaction count
  - Setters:
    - `set pin(newPin)` → validates & updates PIN (must be 4-digit number)
  - Methods:
    - `deposit(amount)` → adds to `#balance`, logs transaction
    - `withdraw(pin, amount)` → validates PIN, daily limit, min balance
    - `getStatement()` → returns last 5 transactions
    - `resetDailyLimit()` → resets `#dailyWithdrawn` to 0

**Bank API (returned object):**

- `openAccount(owner, initialBalance, pin)` → creates SecureAccount
- `getAccount(owner)` → returns account instance
- `resetAllDailyLimits()` → resets daily limits for all accounts
- `getBankSummary()` → returns `{ bankName, totalAccounts, totalBalance }`

| Challenge 📢 | Return bank API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------- |

**Sample Input & Output:**

- `const bank = buildSecureBankSystem({ bankName: "SecureBank", minBalance: 500, maxDailyWithdraw: 10000 })`
- `bank.openAccount("Rahim", 5000, 1234)`
- `const acc = bank.getAccount("Rahim")`
- `acc.deposit(2000)` ➔ `7000`
- `acc.withdraw(1234, 3000)` ➔ `4000`
- `acc.withdraw(9999, 1000)` ➔ `"Access Denied"`
- `acc.balance` ➔ `4000`
- `acc.transactionCount` ➔ `2`
- `acc.pin = 5678` *(updates PIN)*
- `acc.withdraw(5678, 500)` ➔ `3500`
- `bank.getBankSummary()` ➔ `{ bankName: "SecureBank", totalAccounts: 1, totalBalance: 3500 }`

---

## 🧩 PROBLEM–02: 🌡️ Smart Sensor System with Getters & Setters

⚠️ **Function Name:** `buildSensorSystem()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (sensor API)    |

**Rules:**

`config` object:

- `systemName` (string)
- `tempUnit` → `"C"` | `"F"` | `"K"` (Celsius, Fahrenheit, Kelvin)
- `alertThresholds` (object):
  - `minTemp` (number)
  - `maxTemp` (number)
  - `maxHumidity` (number)

**Class Architecture:**

- `Sensor` (class):
  - Private fields: `#rawTemp`, `#humidity`, `#readingLog`
  - `constructor(sensorId, location)`
  - Getters:
    - `get temperature()` → returns temp in configured `tempUnit`
    - `get humidity()` → returns current humidity
    - `get status()` → `"Normal"` | `"Warning"` | `"Critical"` based on thresholds
    - `get readingCount()` → total readings logged
  - Setters:
    - `set temperature(val)` → stores raw Celsius value, validates range (-100 to 100°C)
    - `set humidity(val)` → validates 0–100 range
  - Methods:
    - `logReading()` → saves current temp + humidity with timestamp (sequential number)
    - `getAlerts()` → returns array of active alert messages
    - `getHistory()` → returns last 5 logged readings

**Sensor API (returned object):**

- `addSensor(sensorId, location)` → creates & registers sensor
- `getSensor(sensorId)` → returns sensor instance
- `getSystemAlert()` → returns sensors currently in `"Critical"` status
- `getSystemReport()` → returns `{ systemName, totalSensors, criticalCount, warningCount }`

| Challenge 📢 | Return sensor API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const system = buildSensorSystem({ systemName: "FactorySensors", tempUnit: "F", alertThresholds: { minTemp: 10, maxTemp: 40, maxHumidity: 80 } })`
- `system.addSensor("S01", "Room A")`
- `const s = system.getSensor("S01")`
- `s.temperature = 35`
- `s.humidity = 85`
- `s.temperature` ➔ `95` *(35°C → 95°F)*
- `s.status` ➔ `"Warning"` *(humidity > maxHumidity)*
- `s.getAlerts()` ➔ `["Humidity too high: 85%"]`
- `s.logReading()`
- `system.getSystemReport()` ➔ `{ systemName: "FactorySensors", totalSensors: 1, criticalCount: 0, warningCount: 1 }`

---

## 🧩 PROBLEM–03: 🛡️ Access Control Level System

⚠️ **Function Name:** `buildAccessControlSystem()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (access API)     |

**Rules:**

`config` object:

- `systemName` (string)
- `accessLevels` (array) — ordered from lowest to highest (e.g., `["guest", "user", "admin", "superadmin"]`)

**Class Architecture:**

- `User` (class):
  - Private fields: `#password`, `#accessLevel`, `#loginAttempts`, `#locked`
  - `constructor(username, password, accessLevel)`
  - Getters:
    - `get username()` → returns username
    - `get accessLevel()` → returns current access level
    - `get isLocked()` → returns lock status
  - Setters:
    - `set accessLevel(level)` → validates level exists in `accessLevels`
  - Methods:
    - `login(password)` → validates password
      - 3 failed attempts → auto-lock account → return `"Account Locked"`
    - `logout()` → returns `"Logged Out"`
    - `canAccess(requiredLevel)` → returns boolean (user level ≥ required level)
    - `unlock()` → resets lock & attempts

**Access API (returned object):**

- `createUser(username, password, accessLevel)` → creates & registers User
- `getUser(username)` → returns user instance
- `checkPermission(username, requiredLevel)` → returns `{ allowed, userLevel, requiredLevel }`
- `getLockedAccounts()` → returns array of locked usernames
- `getSystemReport()` → returns `{ totalUsers, lockedCount, levelDistribution }`

| Challenge 📢 | Return access API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const acs = buildAccessControlSystem({ systemName: "OfficeACS", accessLevels: ["guest", "user", "admin", "superadmin"] })`
- `acs.createUser("rahim", "pass123", "user")`
- `acs.createUser("karim", "secret", "admin")`
- `const u = acs.getUser("rahim")`
- `u.login("wrongpass")` ➔ `{ success: false, attemptsLeft: 2 }`
- `u.login("wrongpass")` ➔ `{ success: false, attemptsLeft: 1 }`
- `u.login("wrongpass")` ➔ `"Account Locked"`
- `u.isLocked` ➔ `true`
- `acs.checkPermission("karim", "user")` ➔ `{ allowed: true, userLevel: "admin", requiredLevel: "user" }`
- `acs.checkPermission("karim", "superadmin")` ➔ `{ allowed: false, userLevel: "admin", requiredLevel: "superadmin" }`
- `acs.getLockedAccounts()` ➔ `["rahim"]`
- `acs.getSystemReport()` ➔ `{ totalUsers: 2, lockedCount: 1, levelDistribution: { user: 1, admin: 1 } }`

---

## 🧩 PROBLEM–04: 🏪 Inventory Item with Computed Properties

⚠️ **Function Name:** `buildInventorySystem()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (inventory API)   |

**Rules:**

`config` object:

- `storeName` (string)
- `taxRate` (number) — percentage
- `lowStockThreshold` (number)

**Class Architecture:**

- `InventoryItem` (class):
  - Private fields: `#costPrice`, `#stock`, `#salesLog`
  - `constructor(id, name, costPrice, sellingPrice, stock, category)`
  - Getters:
    - `get profitMargin()` → `((sellingPrice - #costPrice) / #costPrice) * 100` (rounded 2dp)
    - `get priceWithTax()` → `sellingPrice * (1 + taxRate/100)` (rounded 2dp)
    - `get stockStatus()` → `"Out of Stock"` | `"Low Stock"` | `"In Stock"`
    - `get totalRevenue()` → sum of all sales amounts
  - Setters:
    - `set sellingPrice(price)` → validates price > `#costPrice`
    - `set stock(qty)` → validates qty ≥ 0
  - Methods:
    - `sell(qty)` → reduces stock, logs sale `{ qty, amount, timestamp }`
    - `restock(qty)` → increases stock
    - `getSalesReport()` → returns `{ totalSold, totalRevenue, averageOrderSize }`

**Inventory API (returned object):**

- `addItem(id, name, costPrice, sellingPrice, stock, category)` → registers item
- `getItem(id)` → returns item instance
- `getLowStockItems()` → returns items where stockStatus is `"Low Stock"` or `"Out of Stock"`
- `getInventoryReport()` → returns `{ totalItems, totalValue, categoryBreakdown }`

| Challenge 📢 | Return inventory API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const inv = buildInventorySystem({ storeName: "TechStore", taxRate: 15, lowStockThreshold: 5 })`
- `inv.addItem("P001", "Laptop", 40000, 55000, 10, "Electronics")`
- `const laptop = inv.getItem("P001")`
- `laptop.profitMargin` ➔ `37.5`
- `laptop.priceWithTax` ➔ `63250`
- `laptop.sell(3)`
- `laptop.sell(5)`
- `laptop.stockStatus` ➔ `"Low Stock"` *(2 remaining)*
- `laptop.getSalesReport()` ➔ `{ totalSold: 8, totalRevenue: 440000, averageOrderSize: 4 }`
- `inv.getLowStockItems()` ➔ `[{ id: "P001", name: "Laptop", stock: 2, status: "Low Stock" }]`

---

## 🧩 PROBLEM–05: 🔒 Encapsulation Audit Engine

⚠️ **Function Name:** `auditEncapsulation()`

| Input      | `classes` (array of objects) |
| :--------- | :--------------------------- |
| **Output** | object                       |

**Rules:**

Each class object:

- `name` (string)
- `fields` (array of objects):
  - `fieldName` (string)
  - `access` → `"private"` | `"public"` | `"protected"`
- `methods` (array of objects):
  - `methodName` (string)
  - `access` → `"private"` | `"public"` | `"protected"`
  - `modifiesPrivateField` (boolean)
  - `exposesPrivateField` (boolean)
- `hasGetters` (boolean)
- `hasSetters` (boolean)

**Audit Rules:**

- Public method that directly `exposesPrivateField: true` without getter → flag `"Direct Private Exposure"`
- Private field with no getter AND no setter AND no method modifying it → flag `"Dead Private Field"`
- Class with all public fields → flag `"No Encapsulation"`
- Setter present but no validation logic simulated (no private field it modifies) → flag `"Unguarded Setter"`
- Calculate **encapsulation score** (0–100):
  - +20 if any private fields exist
  - +20 if getters used
  - +20 if setters used
  - +20 if no direct private exposure
  - +20 if no dead private fields

| Challenge 📢 | Return `{ auditResults, encapsulationScores, overallGrade }`. If invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `auditEncapsulation([`
  `{`
  `name: "UserAccount",`
  `fields: [{ fieldName: "balance", access: "private" }, { fieldName: "username", access: "public" }],`
  `methods: [`
  `{ methodName: "getBalance", access: "public", modifiesPrivateField: false, exposesPrivateField: true },`
  `{ methodName: "deposit", access: "public", modifiesPrivateField: true, exposesPrivateField: false }`
  `],`
  `hasGetters: true,`
  `hasSetters: false`
  `}`
  `])` ➔
  `{`
  `auditResults: {`
  `UserAccount: {`
  `issues: [],`
  `score: 80`
  `}`
  `},`
  `encapsulationScores: [{ class: "UserAccount", score: 80 }],`
  `overallGrade: "B"`
  `}`

---