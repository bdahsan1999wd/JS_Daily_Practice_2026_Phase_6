# 🎓 JS DAILY PRACTICE – DAY-261

📅 **Goal:** Inheritance & Polymorphism Architecture Engine
🎯 **Focus:** Multi-level Inheritance • Method Overriding • Polymorphism • instanceof • Abstract Class Simulation

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🐾 Animal Kingdom Polymorphism Engine

⚠️ **Function Name:** `buildAnimalKingdom()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (kingdom API)    |

**Rules:**

`config` object:

- `kingdomName` (string)
- `soundMap` (object) — default sounds per animal type

**Class Architecture (multi-level inheritance):**

- `Animal` (base class):
  - `constructor(name, age, weight)`
  - `speak()` → returns `"..."` (to be overridden)
  - `move()` → returns `"Animal moves"`
  - `getInfo()` → returns `"Name: X, Age: Y, Weight: Z"`
  - `toString()` → returns `"[Animal: X]"`

- `Mammal` (extends `Animal`):
  - `constructor(name, age, weight, furColor)`
  - `speak()` → returns `"Mammal sound"`
  - `nurse()` → returns `"X is nursing young"`
  - `getInfo()` → overrides: adds `furColor`

- `Dog` (extends `Mammal`):
  - `constructor(name, age, weight, furColor, breed)`
  - `speak()` → returns `"Woof! I am X"`
  - `fetch()` → returns `"X fetches the ball"`
  - `getInfo()` → overrides: adds `breed`

- `Bird` (extends `Animal`):
  - `constructor(name, age, weight, wingSpan)`
  - `speak()` → returns `"Tweet! I am X"`
  - `move()` → overrides: `"X flies through the air"`
  - `getInfo()` → overrides: adds `wingSpan`

- `Fish` (extends `Animal`):
  - `constructor(name, age, weight, waterType)`
  - `speak()` → returns `"..."`  *(fish don't speak)*
  - `move()` → overrides: `"X swims through the water"`
  - `getInfo()` → overrides: adds `waterType`

**Kingdom API (returned object):**

- `addAnimal(type, ...args)` → creates animal by type (`"dog"` | `"bird"` | `"fish"` | `"mammal"`)
- `getAnimal(name)` → returns animal instance
- `makeAllSpeak()` → returns array of all `speak()` outputs
- `makeAllMove()` → returns array of all `move()` outputs
- `getReport()` → returns `{ totalAnimals, byType, averageWeight }`

| Challenge 📢 | Return kingdom API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const kingdom = buildAnimalKingdom({ kingdomName: "Wildlife", soundMap: {} })`
- `kingdom.addAnimal("dog", "Rex", 3, 25, "brown", "Labrador")`
- `kingdom.addAnimal("bird", "Tweety", 1, 0.5, 30)`
- `kingdom.addAnimal("fish", "Nemo", 2, 0.3, "saltwater")`
- `kingdom.getAnimal("Rex").speak()` ➔ `"Woof! I am Rex"`
- `kingdom.getAnimal("Tweety").move()` ➔ `"Tweety flies through the air"`
- `kingdom.makeAllSpeak()` ➔ `["Woof! I am Rex", "Tweet! I am Tweety", "..."]`
- `kingdom.getReport()` ➔ `{ totalAnimals: 3, byType: { dog: 1, bird: 1, fish: 1 }, averageWeight: 8.6 }`

---

## 🧩 PROBLEM–02: 💳 Payment Provider Polymorphism System

⚠️ **Function Name:** `buildPaymentSystem()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (payment API)    |

**Rules:**

`config` object:

- `systemName` (string)
- `currency` (string) — e.g., `"BDT"`
- `defaultTimeout` (number) — seconds

**Class Architecture:**

- `PaymentProvider` (abstract base — throws error if instantiated directly):
  - `constructor(providerName, feePercent)`
  - `process(amount)` → throws `"Must implement process()"` *(abstract)*
  - `calculateFee(amount)` → returns `amount * feePercent / 100`
  - `getProviderInfo()` → returns `"Provider: X, Fee: Y%"`

- `CreditCard` (extends `PaymentProvider`):
  - `constructor(providerName, feePercent, cardNetwork)`
  - `process(amount)` → returns `{ method: "CreditCard", network: cardNetwork, amount, fee, total, status: "Success" }`
  - `getProviderInfo()` → overrides: adds `cardNetwork`

- `MobileBanking` (extends `PaymentProvider`):
  - `constructor(providerName, feePercent, phoneNumber)`
  - `process(amount)` → returns `{ method: "MobileBanking", phone: phoneNumber, amount, fee, total, status: "Success" }`
  - `verify(otp)` → returns `true` if otp is 6-digit number, else `false`

- `Crypto` (extends `PaymentProvider`):
  - `constructor(providerName, feePercent, coinType, walletAddress)`
  - `process(amount)` → returns `{ method: "Crypto", coin: coinType, amount, fee, total, txHash: "TX"+Date.now(), status: "Pending" }`
  - `getExchangeRate(targetCurrency)` → returns simulated rate `{ from: coinType, to: targetCurrency, rate: 1000 }`

**Payment API (returned object):**

- `addProvider(type, ...args)` → registers provider (`"creditcard"` | `"mobilebanking"` | `"crypto"`)
- `getProvider(name)` → returns provider instance
- `processAll(amount)` → runs `process(amount)` on all providers, returns results array
- `getTotalFees(amount)` → returns total fees across all providers for given amount
- `getSystemReport()` → returns `{ systemName, totalProviders, providerList }`

| Challenge 📢 | Return payment API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const pay = buildPaymentSystem({ systemName: "PayEngine", currency: "BDT", defaultTimeout: 30 })`
- `pay.addProvider("creditcard", "Visa", 2.5, "VISA")`
- `pay.addProvider("mobilebanking", "bKash", 1.5, "01712345678")`
- `pay.getProvider("Visa").process(1000)` ➔ `{ method: "CreditCard", network: "VISA", amount: 1000, fee: 25, total: 1025, status: "Success" }`
- `pay.getProvider("bKash").verify(123456)` ➔ `true`
- `pay.getTotalFees(1000)` ➔ `40`
- `pay.getSystemReport()` ➔ `{ systemName: "PayEngine", totalProviders: 2, providerList: ["Visa", "bKash"] }`

---

## 🧩 PROBLEM–03: 🏢 Employee Hierarchy Polymorphism Engine

⚠️ **Function Name:** `buildEmployeeHierarchy()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (HR API)          |

**Rules:**

`config` object:

- `companyName` (string)
- `taxRate` (number) — percentage
- `bonusRules` (object):
  - `manager` (number) — bonus percentage
  - `engineer` (number)
  - `intern` (number)

**Class Architecture:**

- `Employee` (base class):
  - `constructor(id, name, baseSalary, department)`
  - `calculateSalary()` → returns `baseSalary` *(to be overridden)*
  - `calculateTax()` → returns `calculateSalary() * taxRate / 100`
  - `getNetSalary()` → returns `calculateSalary() - calculateTax()`
  - `getInfo()` → returns `"ID: X, Name: Y, Dept: Z"`
  - `toString()` → returns `"[Employee: X]"`

- `Manager` (extends `Employee`):
  - `constructor(id, name, baseSalary, department, teamSize)`
  - `calculateSalary()` → `baseSalary + (baseSalary * bonusRules.manager / 100) + (teamSize * 500)`
  - `getInfo()` → overrides: adds `teamSize`

- `Engineer` (extends `Employee`):
  - `constructor(id, name, baseSalary, department, techStack[])`
  - `calculateSalary()` → `baseSalary + (baseSalary * bonusRules.engineer / 100) + (techStack.length * 1000)`
  - `getInfo()` → overrides: adds `techStack`

- `Intern` (extends `Employee`):
  - `constructor(id, name, baseSalary, department, durationMonths)`
  - `calculateSalary()` → `baseSalary * (durationMonths / 12) + (baseSalary * bonusRules.intern / 100)`
  - `getInfo()` → overrides: adds `durationMonths`

**HR API (returned object):**

- `hire(type, ...args)` → creates employee (`"manager"` | `"engineer"` | `"intern"`)
- `getEmployee(id)` → returns employee instance
- `getPayroll()` → returns array of `{ id, name, type, grossSalary, tax, netSalary }`
- `getTotalPayrollCost()` → returns total gross salary
- `getDepartmentReport()` → returns `{ department: { count, totalSalary } }`

| Challenge 📢 | Return HR API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------- |

**Sample Input & Output:**

- `const hr = buildEmployeeHierarchy({ companyName: "TechCorp", taxRate: 10, bonusRules: { manager: 20, engineer: 15, intern: 5 } })`
- `hr.hire("manager", "M001", "Rahim", 80000, "Engineering", 5)`
- `hr.hire("engineer", "E001", "Karim", 60000, "Engineering", ["JS", "React", "Node"])`
- `hr.hire("intern", "I001", "Jamal", 15000, "Design", 6)`
- `hr.getEmployee("M001").calculateSalary()` ➔ `98500` *(80000 + 16000 + 2500)*
- `hr.getEmployee("E001").getNetSalary()` ➔ `*(60000 + 9000 + 3000) * 0.9 = 64800*`
- `hr.getDepartmentReport()` ➔
  `{`
  `Engineering: { count: 2, totalSalary: 170500 },`
  `Design: { count: 1, totalSalary: 8625 }`
  `}`

---

## 🧩 PROBLEM–04: 🎮 Game Character Polymorphism System

⚠️ **Function Name:** `buildGameSystem()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (game API)      |

**Rules:**

`config` object:

- `gameName` (string)
- `difficultyMultiplier` (number) — multiplies all damage values

**Class Architecture:**

- `Character` (base class):
  - `constructor(name, hp, level)`
  - `attack(target)` → returns `"Character attacks"` *(to be overridden)*
  - `defend()` → returns `{ blocked: 0, remaining: hp }`
  - `isAlive()` → returns `hp > 0`
  - `takeDamage(amount)` → reduces `hp` by amount (min 0)
  - `getStatus()` → returns `{ name, hp, level, alive }`

- `Warrior` (extends `Character`):
  - `constructor(name, hp, level, armor)`
  - `attack(target)` → deals `level * 15 * difficultyMultiplier` damage
  - `defend()` → overrides: blocks `armor * 5`, returns `{ blocked, remaining: hp }`
  - `rage()` → doubles next attack damage (flag-based)

- `Mage` (extends `Character`):
  - `constructor(name, hp, level, mana)`
  - `attack(target)` → deals `level * 20 * difficultyMultiplier` damage (costs 10 mana)
  - `castSpell(spellName, target)` → deals `level * 30 * difficultyMultiplier` damage (costs 30 mana)
  - `getMana()` → returns current mana

- `Archer` (extends `Character`):
  - `constructor(name, hp, level, arrows)`
  - `attack(target)` → deals `level * 12 * difficultyMultiplier` damage (costs 1 arrow)
  - `multiShot(target)` → fires 3 arrows, deals triple damage
  - `getArrows()` → returns remaining arrows

**Game API (returned object):**

- `createCharacter(type, ...args)` → creates character (`"warrior"` | `"mage"` | `"archer"`)
- `getCharacter(name)` → returns character instance
- `simulateBattle(attacker, defender)` → runs one attack, returns `{ attacker, defender, damageDealt, defenderStatus }`
- `getLeaderboard()` → returns characters sorted by `level * hp` (descending)
- `getGameReport()` → returns `{ gameName, totalCharacters, aliveCount, byType }`

| Challenge 📢 | Return game API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------- |

**Sample Input & Output:**

- `const game = buildGameSystem({ gameName: "EpicQuest", difficultyMultiplier: 1 })`
- `game.createCharacter("warrior", "Thor", 200, 5, 10)`
- `game.createCharacter("mage", "Merlin", 120, 8, 100)`
- `game.createCharacter("archer", "Legolas", 150, 6, 30)`
- `game.getCharacter("Thor").attack(game.getCharacter("Merlin"))` ➔ `75`
- `game.getCharacter("Merlin").castSpell("Fireball", game.getCharacter("Thor"))` ➔ `240`
- `game.getCharacter("Thor").isAlive()` ➔ `false` *(200 - 240 = 0)*
- `game.getGameReport()` ➔ `{ gameName: "EpicQuest", totalCharacters: 3, aliveCount: 2, byType: { warrior: 1, mage: 1, archer: 1 } }`

---

## 🧩 PROBLEM–05: 🔍 Inheritance Chain Analyzer

⚠️ **Function Name:** `analyzeInheritanceChain()`

| Input      | `classes` (array of objects) |
| :--------- | :--------------------------- |
| **Output** | object                       |

**Rules:**

Each class object:

- `name` (string)
- `extends` (string or `null`)
- `methods` (array of strings)
- `overrides` (array of strings) — methods intentionally overriding parent
- `isAbstract` (boolean)
- `abstractMethods` (array of strings) — methods that MUST be overridden by children

**Analysis Rules:**

- Build full inheritance chain for each class
- Detect **missing override** — child of abstract class that doesn't implement all `abstractMethods`
- Detect **override without super call simulation** — overridden method not in parent → flag `"Invalid Override"`
- Calculate **inheritance depth** for each class
- Detect **diamond problem** — class inheriting from two classes that share a common ancestor
- Identify **polymorphic methods** — methods overridden across 2+ levels

| Challenge 📢 | Return `{ chainMap, missingOverrides, invalidOverrides, polymorphicMethods, maxDepth }`. If invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `analyzeInheritanceChain([`
  `{ name: "Shape", extends: null, methods: ["draw", "area"], overrides: [], isAbstract: true, abstractMethods: ["draw", "area"] },`
  `{ name: "Polygon", extends: "Shape", methods: ["draw", "area", "perimeter"], overrides: ["draw", "area"], isAbstract: false, abstractMethods: [] },`
  `{ name: "Rectangle", extends: "Polygon", methods: ["draw", "area"], overrides: ["draw", "area"], isAbstract: false, abstractMethods: [] },`
  `{ name: "Circle", extends: "Shape", methods: ["draw"], overrides: ["draw"], isAbstract: false, abstractMethods: [] }`
  `])` ➔
  `{`
  `chainMap: {`
  `Shape: { chain: ["Shape"], depth: 1 },`
  `Polygon: { chain: ["Polygon", "Shape"], depth: 2 },`
  `Rectangle: { chain: ["Rectangle", "Polygon", "Shape"], depth: 3 },`
  `Circle: { chain: ["Circle", "Shape"], depth: 2 }`
  `},`
  `missingOverrides: [{ class: "Circle", missing: ["area"] }],`
  `invalidOverrides: [],`
  `polymorphicMethods: ["draw", "area"],`
  `maxDepth: 3`
  `}`

---