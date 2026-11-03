# 🎓 JS DAILY PRACTICE – DAY-280

📅 **Goal:** Error Path Testing Engine
🎯 **Focus:** Invalid Input Testing • Exception Handling • Boundary Testing • Error Messages • Negative Test Cases • Defensive Programming

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🚨 Error Path Test Suite Engine

⚠️ **Function Name:** `createErrorPathSuite()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (error suite API)   |

**Rules:**

`config` object:

- `suiteName` (string)
- `targetFn` (function) — function under test
- `expectedErrorType` → `"TypeError"` | `"RangeError"` | `"ValidationError"` | `"CustomError"` | `"any"`

**Error Path Suite API (returned object):**

- `testThrows(testName, input, expectedMessage)` → verifies function throws with expected message
  - Returns `{ passed, thrown, expectedMessage, actualMessage, matched }`
- `testReturnsInvalid(testName, input, expectedReturn)` → verifies function returns error value
  - Returns `{ passed, input, expected, actual }`
- `testDoesNotThrow(testName, input)` → verifies function handles input gracefully
  - Returns `{ passed, input, result, threwError }`
- `testErrorMessage(testName, input, messagePattern)` → validates error message format
  - `messagePattern` → string or regex pattern
  - Returns `{ passed, message, matchedPattern }`
- `runAll()` → runs all registered error path tests
  - Returns `{ total, passed, failed, errorPaths, results[] }`
- `getReport()` → returns `{ suiteName, totalTests, errorsCaught, unexpectedPasses, passRate }`

| Challenge 📢 | Return error suite API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------ |

**Sample Input & Output:**

- `const suite = createErrorPathSuite({`
  `suiteName: "Divide Function Error Paths",`
  `targetFn: (a, b) => { if (typeof a !== "number" || typeof b !== "number") return "Invalid Input"; if (b === 0) throw new Error("Division by zero"); return a / b; },`
  `expectedErrorType: "any"`
  `})`
- `suite.testThrows("throws on zero divisor", [10, 0], "Division by zero")` ➔
  `{ passed: true, thrown: true, expectedMessage: "Division by zero", actualMessage: "Division by zero", matched: true }`
- `suite.testReturnsInvalid("returns invalid for string input", ["hello", 2], "Invalid Input")` ➔
  `{ passed: true, input: ["hello", 2], expected: "Invalid Input", actual: "Invalid Input" }`
- `suite.testDoesNotThrow("handles valid input gracefully", [10, 2])` ➔
  `{ passed: true, input: [10, 2], result: 5, threwError: false }`
- `suite.testErrorMessage("error message format", [5, 0], "Division by zero")` ➔
  `{ passed: true, message: "Division by zero", matchedPattern: "Division by zero" }`
- `suite.runAll()` ➔
  `{ total: 4, passed: 4, failed: 0, errorPaths: 2, results: [...] }`
- `suite.getReport()` ➔ `{ suiteName: "Divide Function Error Paths", totalTests: 4, errorsCaught: 2, unexpectedPasses: 0, passRate: "100.00%" }`

---

## 🧩 PROBLEM–02: 🔢 Boundary Value Test Engine

⚠️ **Function Name:** `createBoundaryTester()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (boundary API)      |

**Rules:**

`config` object:

- `targetFn` (function) — function under test
- `boundaries` (array of objects):
  - `param` (string) — parameter name
  - `type` → `"number"` | `"string"` | `"array"`
  - `min` (number or `null`)
  - `max` (number or `null`)
  - `expectedBehavior` (object):
    - `atMin` → `"valid"` | `"invalid"` | `"throws"`
    - `belowMin` → `"valid"` | `"invalid"` | `"throws"`
    - `atMax` → `"valid"` | `"invalid"` | `"throws"`
    - `aboveMax` → `"valid"` | `"invalid"` | `"throws"`

**Boundary Tester API (returned object):**

- `testBoundary(param, value, expectation)` → tests single boundary value
  - Returns `{ param, value, expectation, actual, passed }`
- `runBoundaryTests()` → auto-generates and runs all boundary tests:
  - At min, below min (min-1), at max, above max (max+1), midpoint
  - Returns `{ total, passed, failed, boundaryResults[] }`
- `findEdgeFailures()` → returns only boundary values where behavior was unexpected
- `getEquivalenceClasses()` → returns equivalence partitions:
  - `{ belowMin: [], validRange: [], aboveMax: [] }`
- `getReport()` → returns `{ totalBoundaries, totalTests, passRate, criticalFailures }`

| Challenge 📢 | Return boundary tester API. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------- |

**Sample Input & Output:**

- `const tester = createBoundaryTester({`
  `targetFn: (age) => { if (typeof age !== "number") return "Invalid Input"; if (age < 18) return "Minor"; if (age > 120) return "Invalid Input"; return "Adult"; },`
  `boundaries: [{ param: "age", type: "number", min: 18, max: 120, expectedBehavior: { atMin: "valid", belowMin: "valid", atMax: "valid", aboveMax: "invalid" } }]`
  `})`
- `tester.testBoundary("age", 18, "valid")` ➔ `{ param: "age", value: 18, expectation: "valid", actual: "Adult", passed: true }`
- `tester.testBoundary("age", 17, "valid")` ➔ `{ param: "age", value: 17, expectation: "valid", actual: "Minor", passed: true }`
- `tester.testBoundary("age", 121, "invalid")` ➔ `{ param: "age", value: 121, expectation: "invalid", actual: "Invalid Input", passed: true }`
- `tester.runBoundaryTests()` ➔
  `{`
  `total: 5,`
  `passed: 5,`
  `failed: 0,`
  `boundaryResults: [`
  `{ value: 17, label: "belowMin", passed: true },`
  `{ value: 18, label: "atMin", passed: true },`
  `{ value: 69, label: "midpoint", passed: true },`
  `{ value: 120, label: "atMax", passed: true },`
  `{ value: 121, label: "aboveMax", passed: true }`
  `]`
  `}`
- `tester.getEquivalenceClasses()` ➔ `{ belowMin: [17, 0, -1], validRange: [18, 69, 120], aboveMax: [121, 200] }`
- `tester.getReport()` ➔ `{ totalBoundaries: 1, totalTests: 5, passRate: "100.00%", criticalFailures: 0 }`

---

## 🧩 PROBLEM–03: ⚠️ Exception Handler Test Engine

⚠️ **Function Name:** `createExceptionTester()`

| Input      | `config` (object)           |
| :--------- | :--------------------------- |
| **Output** | object (exception API)       |

**Rules:**

`config` object:

- `targetFn` (function)
- `errorClasses` (array of objects):
  - `name` (string) — error class name
  - `message` (string) — expected message pattern
  - `code` (string or `null`) — optional error code

**Exception Tester API (returned object):**

- `expectError(testName, input, errorClass, message)` → verifies specific error thrown
  - Returns `{ passed, errorClass, expectedMessage, actualError }`
- `expectNoError(testName, input)` → verifies no error thrown
  - Returns `{ passed, input, result }`
- `catchAndValidate(input, validator)` → catches error and validates it:
  - `validator(error) → boolean`
  - Returns `{ caught, valid, error }`
- `testErrorChain(inputs[], expectedErrors[])` → tests sequence of inputs producing chain of errors
  - Returns `{ chainValid, results[] }`
- `testRecovery(input, recoveryFn)` → tests that error can be recovered from:
  - Returns `{ errorThrown, recovered, recoveryResult }`
- `getExceptionMap()` → returns `{ errorClass: [inputs that trigger it] }`
- `getReport()` → returns `{ totalTests, errorsExpected, errorsCaught, recoveries, passRate }`

| Challenge 📢 | Return exception tester API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------- |

**Sample Input & Output:**

- `const tester = createExceptionTester({`
  `targetFn: (input) => {`
  `if (input === null) throw new TypeError("Input cannot be null");`
  `if (input < 0) throw new RangeError("Input must be non-negative");`
  `if (input > 1000) throw new RangeError("Input exceeds maximum");`
  `return input * 2;`
  `},`
  `errorClasses: [`
  `{ name: "TypeError", message: "Input cannot be null", code: null },`
  `{ name: "RangeError", message: "Input must be non-negative", code: null }`
  `]`
  `})`
- `tester.expectError("null input throws TypeError", null, "TypeError", "Input cannot be null")` ➔
  `{ passed: true, errorClass: "TypeError", expectedMessage: "Input cannot be null", actualError: { type: "TypeError", message: "Input cannot be null" } }`
- `tester.expectError("negative throws RangeError", -5, "RangeError", "Input must be non-negative")` ➔
  `{ passed: true, errorClass: "RangeError", expectedMessage: "Input must be non-negative", actualError: { type: "RangeError", message: "Input must be non-negative" } }`
- `tester.expectNoError("valid input", 42)` ➔ `{ passed: true, input: 42, result: 84 }`
- `tester.testRecovery(-5, (err) => 0)` ➔ `{ errorThrown: true, recovered: true, recoveryResult: 0 }`
- `tester.getExceptionMap()` ➔ `{ TypeError: [null], RangeError: [-5, 1001] }`
- `tester.getReport()` ➔ `{ totalTests: 4, errorsExpected: 2, errorsCaught: 2, recoveries: 1, passRate: "100.00%" }`

---

## 🧩 PROBLEM–04: 🛡️ Defensive Programming Test Engine

⚠️ **Function Name:** `createDefensiveProgrammingTester()`

| Input      | `config` (object)              |
| :--------- | :----------------------------- |
| **Output** | object (defensive API)         |

**Rules:**

`config` object:

- `targetFn` (function)
- `inputContract` (object):
  - `params` (array of objects): `{ name, type, required, constraints }`
    - `constraints`: `{ min, max, pattern, enum: [] }`
- `outputContract` (object):
  - `type` (string)
  - `nullable` (boolean)
  - `schema` (object or `null`)

**Defensive Programming Tester API (returned object):**

- `testPreconditions(testName, inputs, shouldPass)` → tests input contract validation
  - Returns `{ passed, violations[], result }`
- `testPostconditions(testName, inputs)` → tests output meets contract
  - Returns `{ passed, output, violations[] }`
- `testInvariant(testName, stateMutationFn, invariantFn)` → tests invariant holds:
  - `invariantFn(state) → boolean` — must be true before and after mutation
  - Returns `{ held, before, after, invariantBroken }`
- `testNullSafety(inputs[])` → tests all null/undefined combinations
  - Returns `{ safe, crashedOn[], handledGracefully[] }`
- `testIdempotency(input)` → tests calling fn twice with same input gives same result
  - Returns `{ idempotent, firstResult, secondResult }`
- `generateContractReport()` → returns full contract compliance report
- `getReport()` → returns `{ totalTests, contractViolations, invariantBreaches, nullSafe, idempotent }`

| Challenge 📢 | Return defensive tester API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------------- |

**Sample Input & Output:**

- `const tester = createDefensiveProgrammingTester({`
  `targetFn: (user) => { if (!user || typeof user.name !== "string") return "Invalid Input"; return { ...user, name: user.name.trim().toUpperCase() }; },`
  `inputContract: { params: [{ name: "user", type: "object", required: true, constraints: {} }] },`
  `outputContract: { type: "object", nullable: false, schema: { name: "string" } }`
  `})`
- `tester.testPreconditions("valid user passes", [{ name: "Rahim" }], true)` ➔
  `{ passed: true, violations: [], result: { name: "RAHIM" } }`
- `tester.testPreconditions("null user fails", [null], false)` ➔
  `{ passed: true, violations: [{ param: "user", issue: "Required param is null" }], result: "Invalid Input" }`
- `tester.testPostconditions("output is uppercase", [{ name: "  rahim  " }])` ➔
  `{ passed: true, output: { name: "RAHIM" }, violations: [] }`
- `tester.testIdempotency({ name: "Rahim" })` ➔
  `{ idempotent: true, firstResult: { name: "RAHIM" }, secondResult: { name: "RAHIM" } }`
- `tester.testNullSafety([null, undefined, {}, { name: null }])` ➔
  `{ safe: true, crashedOn: [], handledGracefully: [null, undefined, {}, { name: null }] }`
- `tester.getReport()` ➔ `{ totalTests: 5, contractViolations: 1, invariantBreaches: 0, nullSafe: true, idempotent: true }`

---

## 🧩 PROBLEM–05: 🔄 Regression Test Engine

⚠️ **Function Name:** `createRegressionTestEngine()`

| Input      | `config` (object)           |
| :--------- | :--------------------------- |
| **Output** | object (regression API)      |

**Rules:**

`config` object:

- `moduleName` (string)
- `snapshotMode` → `"create"` | `"compare"` — create new snapshots or compare against saved
- `tolerance` (number) — allowed difference for numeric outputs (0 = exact match)

**Regression Test Engine API (returned object):**

- `snapshot(testName, fn, input)` → captures output as baseline snapshot
  - Returns `{ name, input, output, captured }`
- `compare(testName, fn, input)` → compares current output against snapshot
  - Returns `{ name, passed, expected, actual, diff }`
- `addKnownBug(bugId, description, input, brokenOutput)` → documents known failing case
- `verifyBugFixed(bugId, fn)` → checks if known bug is now fixed
  - Returns `{ bugId, fixed, previousOutput, currentOutput }`
- `runRegressionSuite()` → runs all snapshots and comparisons
  - Returns `{ total, passed, failed, newRegressions, fixedBugs, results[] }`
- `diffReport(expected, actual)` → detailed diff between two outputs
  - Returns `{ changes[], addedKeys, removedKeys, modifiedKeys }`
- `getReport()` → returns `{ moduleName, totalSnapshots, regressions, knownBugs, fixedBugs }`

| Challenge 📢 | Return regression engine API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------ |

**Sample Input & Output:**

- `const engine = createRegressionTestEngine({ moduleName: "UserService", snapshotMode: "create", tolerance: 0 })`
- `engine.snapshot("createUser returns correct shape", (input) => ({ id: 1, ...input, createdAt: "2024-01-01" }), { name: "Rahim", email: "r@mail.com" })` ➔
  `{ name: "createUser returns correct shape", input: { name: "Rahim", email: "r@mail.com" }, output: { id: 1, name: "Rahim", email: "r@mail.com", createdAt: "2024-01-01" }, captured: true }`
- `engine.addKnownBug("BUG-001", "Email not trimmed", { email: "  rahim@mail.com  " }, { email: "  rahim@mail.com  " })`
- `engine.verifyBugFixed("BUG-001", (input) => ({ email: input.email.trim() }))` ➔
  `{ bugId: "BUG-001", fixed: true, previousOutput: { email: "  rahim@mail.com  " }, currentOutput: { email: "rahim@mail.com" } }`
- `engine.compare("createUser returns correct shape", (input) => ({ id: 1, ...input, createdAt: "2024-01-01" }), { name: "Rahim", email: "r@mail.com" })` ➔
  `{ name: "createUser returns correct shape", passed: true, expected: { id: 1, name: "Rahim", email: "r@mail.com", createdAt: "2024-01-01" }, actual: { id: 1, name: "Rahim", email: "r@mail.com", createdAt: "2024-01-01" }, diff: null }`
- `engine.getReport()` ➔ `{ moduleName: "UserService", totalSnapshots: 1, regressions: 0, knownBugs: 1, fixedBugs: 1 }`

---