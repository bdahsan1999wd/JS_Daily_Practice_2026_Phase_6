# 🎓 JS DAILY PRACTICE – DAY-259

📅 **Goal:** ES6 Class System & Modern OOP Architecture
🎯 **Focus:** class • constructor • Methods • extends • super • Static Methods • Method Chaining

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🏫 School Management Class System

⚠️ **Function Name:** `buildSchoolSystem()`

| Input      | `config` (object)      |
| :--------- | :--------------------- |
| **Output** | object (school API)    |

**Rules:**

`config` object:

- `schoolName` (string)
- `maxStudents` (number)
- `passMark` (number)

**Class Architecture:**

- `Person` (base class):
  - `constructor(name, age)`
  - `getInfo()` → returns `"Name: X, Age: Y"`

- `Student` (extends `Person`):
  - `constructor(name, age, studentId, marks[])`
  - `getAverage()` → returns average of marks
  - `getStatus()` → `"Pass"` if average ≥ `passMark`, else `"Fail"`
  - `getInfo()` → overrides base: `"Student: X, Age: Y, ID: Z, Avg: W"`

- `Teacher` (extends `Person`):
  - `constructor(name, age, subject, salary)`
  - `getSalaryInfo()` → returns `"Teacher: X, Subject: Y, Salary: Z"`
  - `getInfo()` → overrides base: `"Teacher: X, Age: Y, Subject: Z"`

**School API (returned object):**

- `addStudent(name, age, studentId, marks)` → creates & registers Student
- `addTeacher(name, age, subject, salary)` → creates & registers Teacher
- `getStudent(studentId)` → returns student instance
- `getReport()` → returns `{ totalStudents, totalTeachers, passCount, failCount }`

| Challenge 📢 | Return school API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------- |

**Sample Input & Output:**

- `const school = buildSchoolSystem({ schoolName: "ProtoSchool", maxStudents: 100, passMark: 50 })`
- `school.addStudent("Rahim", 16, "S001", [80, 70, 90])`
- `school.addStudent("Karim", 15, "S002", [40, 35, 45])`
- `school.addTeacher("Mr. Hasan", 35, "Math", 50000)`
- `school.getStudent("S001").getInfo()` ➔ `"Student: Rahim, Age: 16, ID: S001, Avg: 80"`
- `school.getStudent("S002").getStatus()` ➔ `"Fail"`
- `school.getReport()` ➔ `{ totalStudents: 2, totalTeachers: 1, passCount: 1, failCount: 1 }`

---

## 🧩 PROBLEM–02: 🚗 Vehicle Fleet Class System

⚠️ **Function Name:** `buildVehicleFleet()`

| Input      | `config` (object)     |
| :--------- | :-------------------- |
| **Output** | object (fleet API)    |

**Rules:**

`config` object:

- `fleetName` (string)
- `fuelPricePerLiter` (number)

**Class Architecture:**

- `Vehicle` (base class):
  - `constructor(brand, model, year, fuelCapacity)`
  - `refuel(liters)` → adds fuel (cannot exceed `fuelCapacity`)
  - `getFuelStatus()` → returns `{ current, capacity, percentage }`
  - `getInfo()` → returns `"Brand: X, Model: Y, Year: Z"`

- `Car` (extends `Vehicle`):
  - `constructor(brand, model, year, fuelCapacity, seats)`
  - `drive(km, kmPerLiter)` → consumes fuel, returns `{ kmDriven, fuelUsed, remaining }`
  - `getInfo()` → overrides: `"Car: X Y, Seats: Z"`

- `Truck` (extends `Vehicle`):
  - `constructor(brand, model, year, fuelCapacity, payloadTons)`
  - `loadCargo(tons)` → sets cargo (cannot exceed `payloadTons`)
  - `getInfo()` → overrides: `"Truck: X Y, Payload: Z tons"`

**Fleet API (returned object):**

- `addCar(brand, model, year, fuelCapacity, seats)` → registers car
- `addTruck(brand, model, year, fuelCapacity, payloadTons)` → registers truck
- `getVehicle(brand, model)` → returns vehicle instance
- `getFleetReport()` → returns `{ totalVehicles, totalCars, totalTrucks, totalFuelCapacity }`

| Challenge 📢 | Return fleet API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------ |

**Sample Input & Output:**

- `const fleet = buildVehicleFleet({ fleetName: "SpeedFleet", fuelPricePerLiter: 110 })`
- `fleet.addCar("Toyota", "Corolla", 2022, 50, 5)`
- `fleet.addTruck("Volvo", "FH16", 2021, 300, 20)`
- `fleet.getVehicle("Toyota", "Corolla").refuel(30)`
- `fleet.getVehicle("Toyota", "Corolla").drive(100, 15)` ➔ `{ kmDriven: 100, fuelUsed: 6.67, remaining: 23.33 }`
- `fleet.getVehicle("Volvo", "FH16").getInfo()` ➔ `"Truck: Volvo FH16, Payload: 20 tons"`
- `fleet.getFleetReport()` ➔ `{ totalVehicles: 2, totalCars: 1, totalTrucks: 1, totalFuelCapacity: 350 }`

---

## 🧩 PROBLEM–03: 🔗 Method Chaining Class Builder

⚠️ **Function Name:** `createQueryBuilder()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (query builder)   |

**Rules:**

`config` object:

- `tableName` (string)
- `availableColumns` (array of strings)

**Class-based Query Builder — all methods return `this` for chaining:**

- `select(...columns)` → sets columns to fetch (validates against `availableColumns`)
- `where(column, operator, value)` → adds filter condition
  - `operator` → `"="` | `">"` | `"<"` | `">="` | `"<="` | `"!="`
- `orderBy(column, direction)` → sets sort (`"ASC"` | `"DESC"`)
- `limit(n)` → sets result limit
- `offset(n)` → sets result offset (for pagination)
- `build()` → returns final query object `{ table, columns, conditions, orderBy, limit, offset }`
- `reset()` → clears all query state, returns `this`

**Rules:**

- Invalid column in `select()` or `where()` → skip that column silently
- `build()` without `select()` → defaults to all `availableColumns`

| Challenge 📢 | Return query builder instance. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------- |

**Sample Input & Output:**

- `const qb = createQueryBuilder({ tableName: "users", availableColumns: ["id", "name", "age", "email"] })`
- `qb.select("id", "name", "age")`
  `.where("age", ">", 18)`
  `.where("name", "!=", "Admin")`
  `.orderBy("age", "DESC")`
  `.limit(10)`
  `.offset(20)`
  `.build()` ➔
  `{`
  `table: "users",`
  `columns: ["id", "name", "age"],`
  `conditions: [{ column: "age", operator: ">", value: 18 }, { column: "name", operator: "!=", value: "Admin" }],`
  `orderBy: { column: "age", direction: "DESC" },`
  `limit: 10,`
  `offset: 20`
  `}`

---

## 🧩 PROBLEM–04: ⚡ Static Methods & Class Registry System

⚠️ **Function Name:** `buildProductRegistry()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (registry API)    |

**Rules:**

`config` object:

- `storeName` (string)
- `taxRate` (number) — percentage
- `discountRules` (array of objects):
  - `minQty` (number)
  - `discountPercent` (number)

**Class Architecture:**

- `Product` (class):
  - `constructor(id, name, price, category, stock)`
  - Instance methods:
    - `applyDiscount(qty)` → finds matching discount rule by qty, returns discounted price
    - `getTotal(qty)` → returns `{ subtotal, discount, tax, total }`
    - `isAvailable(qty)` → returns boolean
  - Static methods:
    - `Product.compare(p1, p2)` → returns product with lower price
    - `Product.findCheapest(products[])` → returns cheapest product
    - `Product.getCategoryCount(products[])` → returns `{ category: count }`

**Registry API (returned object):**

- `addProduct(id, name, price, category, stock)` → creates & registers product
- `getProduct(id)` → returns product instance
- `compareProducts(id1, id2)` → uses `Product.compare()`
- `getCheapest()` → uses `Product.findCheapest()`
- `getCategoryReport()` → uses `Product.getCategoryCount()`

| Challenge 📢 | Return registry API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const registry = buildProductRegistry({ storeName: "TechMart", taxRate: 15, discountRules: [{ minQty: 5, discountPercent: 10 }, { minQty: 10, discountPercent: 20 }] })`
- `registry.addProduct("P001", "Laptop", 50000, "Electronics", 20)`
- `registry.addProduct("P002", "Mouse", 500, "Accessories", 100)`
- `registry.addProduct("P003", "Keyboard", 1500, "Accessories", 50)`
- `registry.getProduct("P001").getTotal(10)` ➔ `{ subtotal: 500000, discount: 100000, tax: 60000, total: 460000 }`
- `registry.compareProducts("P001", "P002")` ➔ `{ id: "P002", name: "Mouse", price: 500 }`
- `registry.getCheapest()` ➔ `{ id: "P002", name: "Mouse", price: 500 }`
- `registry.getCategoryReport()` ➔ `{ Electronics: 1, Accessories: 2 }`

---

## 🧩 PROBLEM–05: 🏗️ Class Hierarchy Validator

⚠️ **Function Name:** `validateClassHierarchy()`

| Input      | `classes` (array of objects) |
| :--------- | :--------------------------- |
| **Output** | object                       |

**Rules:**

Each class object:

- `name` (string)
- `extends` (string or `null`) — parent class name
- `constructor` (array of strings) — constructor parameter names
- `methods` (array of strings) — instance method names
- `staticMethods` (array of strings) — static method names
- `callsSuper` (boolean) — whether constructor calls `super()`

**Validation Rules:**

- Child class that does NOT call `super()` → flag as `"Missing super() call"`
- Method name existing in both parent and child → flag as `"Override"` (valid)
- Method name starting with `_` → flag as `"Convention: private method"`
- Circular inheritance (A extends B, B extends A) → flag as `"Circular Inheritance Error"`
- Class extending non-existent parent → flag as `"Parent Not Found"`
- Static method with same name as instance method → flag as `"Name Conflict"`

| Challenge 📢 | Return `{ validClasses, warnings, errors, overrideMap }`. If invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------------------------------------- |

**Sample Input & Output:**

- `validateClassHierarchy([`
  `{ name: "Animal", extends: null, constructor: ["name"], methods: ["speak", "move"], staticMethods: ["create"], callsSuper: false },`
  `{ name: "Dog", extends: "Animal", constructor: ["name", "breed"], methods: ["speak", "_fetch"], staticMethods: [], callsSuper: true },`
  `{ name: "Cat", extends: "Ghost", constructor: ["name"], methods: ["purr"], staticMethods: [], callsSuper: true }`
  `])` ➔
  `{`
  `validClasses: ["Animal", "Dog"],`
  `warnings: [`
  `{ class: "Dog", warning: "Convention: private method", method: "_fetch" }`
  `],`
  `errors: [`
  `{ class: "Cat", error: "Parent Not Found", parent: "Ghost" }`
  `],`
  `overrideMap: [`
  `{ method: "speak", childClass: "Dog", parentClass: "Animal" }`
  `]`
  `}`

---