# 🎓 JS DAILY PRACTICE – DAY-279

📅 **Goal:** Unit Testing Basics Engine
🎯 **Focus:** Arrange-Act-Assert • Test Cases • Assertions • Edge Cases • Test Suites • Test Runner Simulation

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🧪 Test Runner Engine

⚠️ **Function Name:** `createTestRunner()`

| Input      | `config` (object)       |
| :--------- | :---------------------- |
| **Output** | object (test runner API)|

**Rules:**

`config` object:

- `suiteName` (string)
- `stopOnFail` (boolean) — stop running tests after first failure
- `timeout` (number) — max ms per test (simulated as operation count)

**Test Runner API (returned object):**

- `describe(suiteName, fn)` → groups tests into a suite
- `it(testName, fn)` → registers a single test case
  - `fn` receives `expect` function
- `expect(value)` → returns assertion object with:
  - `.toBe(expected)` → strict equality (`===`)
  - `.toEqual(expected)` → deep equality
  - `.toBeTruthy()` → truthy check
  - `.toBeFalsy()` → falsy check
  - `.toBeNull()` → null check
  - `.toBeUndefined()` → undefined check
  - `.toThrow()` → expects function to throw
  - `.toContain(item)` → array/string contains
  - `.toHaveLength(n)` → length check
  - `.not` → negates next assertion
- `run()` → executes all registered tests
  - Returns `{ passed, failed, skipped, total, duration, results[] }`
- `skip(testName, fn)` → registers but skips test
- `getReport()` → returns `{ suiteName, passed, failed, skipped, passRate }`

| Challenge 📢 | Return test runner API. If config invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------ |

**Sample Input & Output:**

- `const runner = createTestRunner({ suiteName: "Math Utils", stopOnFail: false, timeout: 100 })`
- `runner.describe("addition", () => {`
  `runner.it("adds two numbers", (expect) => {`
  `expect(2 + 2).toBe(4)`
  `})`
  `runner.it("handles negatives", (expect) => {`
  `expect(-1 + -1).toBe(-2)`
  `})`
  `})`
- `runner.it("failing test", (expect) => {`
  `expect(1 + 1).toBe(3)`
  `})`
- `runner.skip("skipped test", (expect) => {`
  `expect(true).toBe(false)`
  `})`
- `runner.run()` ➔
  `{`
  `passed: 2,`
  `failed: 1,`
  `skipped: 1,`
  `total: 4,`
  `duration: 4,`
  `results: [`
  `{ name: "adds two numbers", status: "passed", suite: "addition" },`
  `{ name: "handles negatives", status: "passed", suite: "addition" },`
  `{ name: "failing test", status: "failed", error: "Expected 2 to be 3", suite: null },`
  `{ name: "skipped test", status: "skipped", suite: null }`
  `]`
  `}`
- `runner.getReport()` ➔ `{ suiteName: "Math Utils", passed: 2, failed: 1, skipped: 1, passRate: "50.00%" }`

---

## 🧩 PROBLEM–02: ✅ Assertion Library Engine

⚠️ **Function Name:** `createAssertionLibrary()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (assertion API)     |

**Rules:**

`config` object:

- `strict` (boolean) — use strict equality everywhere
- `verbose` (boolean) — include detailed error messages
- `customMatchers` (array of objects):
  - `{ name, fn, errorMessage }` — custom matcher functions

**Assertion Library API (returned object):**

- `assert(value)` → returns assertion chain:
  - **Equality:** `equals(expected)`, `notEquals(expected)`, `strictEquals(expected)`
  - **Type:** `isString()`, `isNumber()`, `isBoolean()`, `isArray()`, `isObject()`, `isFunction()`, `isNull()`, `isUndefined()`
  - **Comparison:** `greaterThan(n)`, `lessThan(n)`, `between(min, max)`
  - **String:** `includes(str)`, `startsWith(str)`, `endsWith(str)`, `matches(regex)`
  - **Array:** `contains(item)`, `hasLength(n)`, `isEmpty()`, `containsAll(items[])`
  - **Object:** `hasKey(key)`, `hasKeys(keys[])`, `deepEquals(expected)`
  - **Negation:** `not` prefix on all assertions
- `addMatcher(name, fn, errorMessage)` → adds custom matcher
- `batch(assertions[])` → runs multiple assertions, returns all results
- `getStats()` → returns `{ totalAssertions, passed, failed, customMatchers }`

| Challenge 📢 | Return assertion library. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------- |

**Sample Input & Output:**

- `const lib = createAssertionLibrary({ strict: true, verbose: true, customMatchers: [] })`
- `lib.assert(42).isNumber()` ➔ `{ passed: true, assertion: "isNumber", value: 42 }`
- `lib.assert("hello").isString()` ➔ `{ passed: true, assertion: "isString", value: "hello" }`
- `lib.assert([1,2,3]).hasLength(3)` ➔ `{ passed: true, assertion: "hasLength(3)", value: [1,2,3] }`
- `lib.assert([1,2,3]).contains(2)` ➔ `{ passed: true, assertion: "contains(2)", value: [1,2,3] }`
- `lib.assert(5).between(1, 10)` ➔ `{ passed: true, assertion: "between(1, 10)", value: 5 }`
- `lib.assert(5).greaterThan(10)` ➔ `{ passed: false, assertion: "greaterThan(10)", value: 5, error: "Expected 5 to be greater than 10" }`
- `lib.assert({ name: "Rahim", age: 25 }).hasKeys(["name", "age"])` ➔ `{ passed: true, assertion: "hasKeys(['name','age'])", value: { name: "Rahim", age: 25 } }`
- `lib.batch([`
  `{ value: 42, assertion: "isNumber" },`
  `{ value: "hello", assertion: "isString" },`
  `{ value: null, assertion: "isNull" }`
  `])` ➔ `{ passed: 3, failed: 0, results: [...] }`
- `lib.getStats()` ➔ `{ totalAssertions: 9, passed: 8, failed: 1, customMatchers: 0 }`

---

## 🧩 PROBLEM–03: 🏗️ Test Suite Builder Engine

⚠️ **Function Name:** `createTestSuite()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (test suite API)  |

**Rules:**

`config` object:

- `name` (string)
- `beforeEach` (function or `null`) — runs before each test
- `afterEach` (function or `null`) — runs after each test
- `beforeAll` (function or `null`) — runs once before all tests
- `afterAll` (function or `null`) — runs once after all tests

**Test Suite API (returned object):**

- `addTest(name, fn, category)` → adds test with optional category tag
- `addParametrized(name, fn, cases[])` → adds data-driven test:
  - Runs `fn` for each `{ input, expected }` case
  - Returns separate result per case
- `only(name, fn)` → marks test as exclusive (only this runs)
- `skip(name, fn)` → marks test as skipped
- `tag(testName, ...tags)` → adds tags to test
- `runCategory(category)` → runs only tests in given category
- `runByTag(tag)` → runs only tests matching tag
- `run()` → runs all tests with lifecycle hooks
  - Returns `{ total, passed, failed, skipped, lifecycle, results[] }`
- `getSummary()` → returns `{ name, categories, tags, testCount, byCategory }`

| Challenge 📢 | Return test suite API. If config invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------- |

**Sample Input & Output:**

- `const suite = createTestSuite({ name: "User Service Tests", beforeEach: () => "setup", afterEach: () => "teardown", beforeAll: null, afterAll: null })`
- `suite.addTest("creates user", (expect) => expect({ id: 1 }).hasKey("id"), "user")`
- `suite.addTest("validates email", (expect) => expect("bad").matches(/^[\w.]+@[\w.]+$/), "validation")`
- `suite.addParametrized("addition", (expect, { input, expected }) => expect(input[0] + input[1]).toBe(expected), [`
  `{ input: [1, 2], expected: 3 },`
  `{ input: [5, 5], expected: 10 },`
  `{ input: [-1, 1], expected: 0 }`
  `])`
- `suite.tag("creates user", "smoke", "regression")`
- `suite.run()` ➔
  `{`
  `total: 5,`
  `passed: 4,`
  `failed: 1,`
  `skipped: 0,`
  `lifecycle: { beforeEach: 5, afterEach: 5 },`
  `results: [`
  `{ name: "creates user", status: "passed", category: "user", tags: ["smoke", "regression"] },`
  `{ name: "validates email", status: "failed", error: "Expected 'bad' to match /^[\\w.]+@[\\w.]+$/" },`
  `{ name: "addition [case 1]", status: "passed" },`
  `{ name: "addition [case 2]", status: "passed" },`
  `{ name: "addition [case 3]", status: "passed" }`
  `]`
  `}`
- `suite.getSummary()` ➔ `{ name: "User Service Tests", categories: ["user", "validation"], tags: ["smoke", "regression"], testCount: 5, byCategory: { user: 1, validation: 1, uncategorized: 3 } }`

---

## 🧩 PROBLEM–04: 🔍 Edge Case Test Generator

⚠️ **Function Name:** `createEdgeCaseGenerator()`

| Input      | `config` (object)           |
| :--------- | :--------------------------- |
| **Output** | object (edge case API)       |

**Rules:**

`config` object:

- `targetFn` (function) — function to generate edge cases for
- `paramTypes` (array of strings) — parameter types (e.g., `["number", "string", "array"]`)
- `includeNull` (boolean) — include null/undefined cases
- `includeBoundary` (boolean) — include boundary values

**Edge Case Generator API (returned object):**

- `generate()` → generates edge case test inputs based on `paramTypes`:
  - `"number"` → `[0, -1, 1, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]`
  - `"string"` → `["", " ", "a", "a".repeat(1000), "null", "undefined", "<script>", "'; DROP TABLE"]`
  - `"array"` → `[[], [null], [undefined], Array(1000).fill(0)]`
  - `"object"` → `[{}, { __proto__: {} }, null, { [Symbol()]: "val" }]`
  - `"boolean"` → `[true, false, 0, 1, "true", "false"]`
  - Null cases → `[null, undefined]` (if `includeNull: true`)
- `runAll()` → runs `targetFn` with all generated cases
  - Returns `{ total, passed, failed, errors, crashedOn[] }`
- `findCrashInputs()` → returns inputs that cause the function to throw
- `findInvalidOutputs(validator)` → returns inputs where output fails validation
- `getReport()` → returns `{ totalCases, byType, crashCount, passRate }`

| Challenge 📢 | Return edge case generator. If config invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------------- |

**Sample Input & Output:**

- `const gen = createEdgeCaseGenerator({`
  `targetFn: (n) => n * 2,`
  `paramTypes: ["number"],`
  `includeNull: true,`
  `includeBoundary: true`
  `})`
- `gen.generate()` ➔
  `{ cases: [0, -1, 1, NaN, Infinity, -Infinity, 9007199254740991, -9007199254740991, null, undefined], count: 10 }`
- `gen.runAll()` ➔
  `{`
  `total: 10,`
  `passed: 6,`
  `failed: 4,`
  `errors: [`
  `{ input: null, error: "TypeError: Cannot multiply null" },`
  `{ input: undefined, error: "TypeError: Cannot multiply undefined" }`
  `],`
  `crashedOn: [null, undefined]`
  `}`
- `gen.findCrashInputs()` ➔ `[null, undefined]`
- `gen.getReport()` ➔ `{ totalCases: 10, byType: { number: 8, null: 2 }, crashCount: 2, passRate: "60.00%" }`

---

## 🧩 PROBLEM–05: 📊 Test Coverage Analyzer

⚠️ **Function Name:** `createCoverageAnalyzer()`

| Input      | `config` (object)           |
| :--------- | :--------------------------- |
| **Output** | object (coverage API)        |

**Rules:**

`config` object:

- `targetModule` (string) — module name being tested
- `thresholds` (object):
  - `statements` (number) — % threshold
  - `branches` (number)
  - `functions` (number)
  - `lines` (number)

**Coverage Analyzer API (returned object):**

- `registerFunction(fnName, branches[])` → registers function with its branches:
  - Each branch: `{ id, condition, type: "if" | "else" | "switch" | "ternary" }`
- `recordExecution(fnName, executedBranches[])` → records which branches were hit during a test
- `getCoverage(fnName)` → returns coverage for specific function:
  - Returns `{ statements, branches, functions, lines, uncoveredBranches }`
- `getTotalCoverage()` → returns aggregate coverage across all functions
- `findUncovered()` → returns all uncovered branches/functions
- `generateReport()` → returns coverage report string (Istanbul-style)
- `meetsThreshold()` → returns `{ meets, failures: [{ metric, actual, threshold }] }`
- `getReport()` → returns `{ module, functions, totalBranches, coveredBranches, overallCoverage }`

| Challenge 📢 | Return coverage analyzer. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------------- |

**Sample Input & Output:**

- `const analyzer = createCoverageAnalyzer({ targetModule: "UserService", thresholds: { statements: 80, branches: 75, functions: 90, lines: 80 } })`
- `analyzer.registerFunction("createUser", [`
  `{ id: "b1", condition: "email is valid", type: "if" },`
  `{ id: "b2", condition: "email is invalid", type: "else" },`
  `{ id: "b3", condition: "age >= 18", type: "if" },`
  `{ id: "b4", condition: "age < 18", type: "else" }`
  `])`
- `analyzer.registerFunction("deleteUser", [`
  `{ id: "b5", condition: "user exists", type: "if" },`
  `{ id: "b6", condition: "user not found", type: "else" }`
  `])`
- `analyzer.recordExecution("createUser", ["b1", "b3"])` *(happy path only)*
- `analyzer.recordExecution("createUser", ["b1", "b4"])` *(underage case)*
- `analyzer.getCoverage("createUser")` ➔
  `{ statements: 100, branches: 75, functions: 100, lines: 100, uncoveredBranches: ["b2"] }`
- `analyzer.getCoverage("deleteUser")` ➔
  `{ statements: 0, branches: 0, functions: 0, lines: 0, uncoveredBranches: ["b5", "b6"] }`
- `analyzer.getTotalCoverage()` ➔ `{ statements: 50, branches: 33.33, functions: 50, lines: 50 }`
- `analyzer.meetsThreshold()` ➔
  `{ meets: false, failures: [{ metric: "statements", actual: 50, threshold: 80 }, { metric: "branches", actual: 33.33, threshold: 75 }, { metric: "functions", actual: 50, threshold: 90 }, { metric: "lines", actual: 50, threshold: 80 }] }`
- `analyzer.getReport()` ➔ `{ module: "UserService", functions: 2, totalBranches: 6, coveredBranches: 3, overallCoverage: "50.00%" }`

---