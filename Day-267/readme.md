# 🎓 JS DAILY PRACTICE – DAY-267

📅 **Goal:** Event Delegation & Form Engineering Engine
🎯 **Focus:** Event Delegation • Form Handling • Form Validation • FormData • Dynamic Form Builder • Multi-Step Forms

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 📋 Form Schema Validator Engine

⚠️ **Function Name:** `createFormValidator()`

| Input      | `schema` (array of objects) |
| :--------- | :-------------------------- |
| **Output** | object (validator API)      |

**Rules:**

Each schema field object:

- `name` (string) — field name
- `type` → `"text"` | `"email"` | `"number"` | `"password"` | `"tel"` | `"url"`
- `required` (boolean)
- `rules` (array of objects):
  - `{ rule: "minLength", value: N }`
  - `{ rule: "maxLength", value: N }`
  - `{ rule: "min", value: N }` — for number type
  - `{ rule: "max", value: N }` — for number type
  - `{ rule: "pattern", value: "regex string" }`
  - `{ rule: "match", value: "otherFieldName" }` — must equal another field

**Validator API (returned object):**

- `validate(formData)` → validates object against schema
  - Returns `{ valid, errors: { fieldName: [errorMessages] }, passedFields }`
- `validateField(fieldName, value, formData)` → validates single field
  - Returns `{ valid, errors: [] }`
- `addRule(fieldName, rule)` → adds new rule to existing field
- `getSchema()` → returns current schema
- `getReport()` → returns `{ totalFields, requiredCount, optionalCount, ruleCount }`

**Built-in Validations per type:**

- `"email"` → must contain `@` and `.`
- `"tel"` → only digits, `+`, `-`, spaces allowed
- `"url"` → must start with `http://` or `https://`
- `"password"` → must have uppercase, lowercase, digit, special char

| Challenge 📢 | Return validator API. If schema invalid → `"Invalid Input"` |
| :----------- | :---------------------------------------------------------- |

**Sample Input & Output:**

- `const validator = createFormValidator([`
  `{ name: "email", type: "email", required: true, rules: [{ rule: "maxLength", value: 50 }] },`
  `{ name: "password", type: "password", required: true, rules: [{ rule: "minLength", value: 8 }] },`
  `{ name: "confirmPassword", type: "text", required: true, rules: [{ rule: "match", value: "password" }] },`
  `{ name: "age", type: "number", required: false, rules: [{ rule: "min", value: 18 }, { rule: "max", value: 100 }] }`
  `])`
- `validator.validate({ email: "rahim@mail.com", password: "Pass@123", confirmPassword: "Pass@123", age: 25 })` ➔
  `{ valid: true, errors: {}, passedFields: ["email", "password", "confirmPassword", "age"] }`
- `validator.validate({ email: "invalid-email", password: "weak", confirmPassword: "mismatch", age: 15 })` ➔
  `{`
  `valid: false,`
  `errors: {`
  `email: ["Invalid email format"],`
  `password: ["Minimum length is 8", "Must contain uppercase, lowercase, digit, and special character"],`
  `confirmPassword: ["Must match password"],`
  `age: ["Minimum value is 18"]`
  `},`
  `passedFields: []`
  `}`

---

## 🧩 PROBLEM–02: 📦 FormData Builder & Parser Engine

⚠️ **Function Name:** `createFormDataEngine()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (formdata API)    |

**Rules:**

`config` object:

- `encType` → `"application/x-www-form-urlencoded"` | `"multipart/form-data"` | `"application/json"`
- `trimValues` (boolean) — auto-trim string values
- `excludeEmpty` (boolean) — exclude fields with empty/null values

**FormData Engine API (returned object):**

- `append(name, value, fileName)` → adds field (fileName only for file fields)
- `set(name, value)` → sets/overwrites field value
- `get(name)` → returns first value for field name
- `getAll(name)` → returns all values for field (for multi-value fields)
- `delete(name)` → removes field
- `has(name)` → returns boolean
- `entries()` → returns array of `[name, value]` pairs
- `serialize()` → serializes based on `encType`:
  - `"application/x-www-form-urlencoded"` → `"name=value&name2=value2"` (URL encoded)
  - `"application/json"` → JSON string
  - `"multipart/form-data"` → `"--boundary\r\nContent-Disposition: form-data; name=\"field\"\r\n\r\nvalue\r\n"`
- `parse(serializedData)` → parses serialized string back to entries
- `getReport()` → returns `{ totalFields, multiValueFields, emptyFields }`

| Challenge 📢 | Return formdata API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const fd = createFormDataEngine({ encType: "application/json", trimValues: true, excludeEmpty: true })`
- `fd.append("username", "  rahim  ")`
- `fd.append("tags", "js")`
- `fd.append("tags", "node")`
- `fd.append("bio", "")`
- `fd.get("username")` ➔ `"rahim"` *(trimmed)*
- `fd.getAll("tags")` ➔ `["js", "node"]`
- `fd.has("bio")` ➔ `false` *(excludeEmpty: true)*
- `fd.entries()` ➔ `[["username", "rahim"], ["tags", "js"], ["tags", "node"]]`
- `fd.serialize()` ➔ `'{"username":"rahim","tags":["js","node"]}'`
- `fd.getReport()` ➔ `{ totalFields: 2, multiValueFields: ["tags"], emptyFields: ["bio"] }`

---

## 🧩 PROBLEM–03: 🧩 Multi-Step Form Controller

⚠️ **Function Name:** `createMultiStepForm()`

| Input      | `steps` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object (form controller)   |

**Rules:**

Each step object:

- `stepId` (string)
- `title` (string)
- `fields` (array of objects) — same format as schema fields from P-01
- `canSkip` (boolean) — whether step is optional
- `dependsOn` (string or `null`) — stepId that must be completed first

**Multi-Step Form Controller API (returned object):**

- `getCurrentStep()` → returns current step info `{ stepId, title, fields, progress }`
- `next(formData)` → validates current step data and advances
  - Returns `{ success, errors, nextStep }` or `{ success, completed: true }` if last step
- `prev()` → goes back one step → returns `{ stepId, title }`
- `goTo(stepId)` → jumps to step (only if dependency met and previous steps valid)
- `skip()` → skips current step if `canSkip: true`
- `getProgress()` → returns `{ currentStep, totalSteps, completedSteps, percent }`
- `getFormData()` → returns all collected data across all completed steps
- `reset()` → resets to first step, clears all data

| Challenge 📢 | Return form controller. If steps invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------- |

**Sample Input & Output:**

- `const form = createMultiStepForm([`
  `{ stepId: "personal", title: "Personal Info", canSkip: false, dependsOn: null,`
  `fields: [{ name: "name", type: "text", required: true, rules: [{ rule: "minLength", value: 2 }] }] },`
  `{ stepId: "contact", title: "Contact Info", canSkip: false, dependsOn: "personal",`
  `fields: [{ name: "email", type: "email", required: true, rules: [] }] },`
  `{ stepId: "preferences", title: "Preferences", canSkip: true, dependsOn: "contact",`
  `fields: [{ name: "theme", type: "text", required: false, rules: [] }] }`
  `])`
- `form.getCurrentStep()` ➔ `{ stepId: "personal", title: "Personal Info", fields: [...], progress: { current: 1, total: 3 } }`
- `form.next({ name: "Rahim" })` ➔ `{ success: true, errors: {}, nextStep: "contact" }`
- `form.next({ email: "bad-email" })` ➔ `{ success: false, errors: { email: ["Invalid email format"] }, nextStep: null }`
- `form.next({ email: "rahim@mail.com" })` ➔ `{ success: true, errors: {}, nextStep: "preferences" }`
- `form.skip()` ➔ `{ success: true, completed: true }`
- `form.getFormData()` ➔ `{ name: "Rahim", email: "rahim@mail.com" }`
- `form.getProgress()` ➔ `{ currentStep: 3, totalSteps: 3, completedSteps: 2, percent: 66.67 }`

---

## 🧩 PROBLEM–04: 🔄 Dynamic Form Builder Engine

⚠️ **Function Name:** `createDynamicFormBuilder()`

| Input      | `config` (object)         |
| :--------- | :------------------------ |
| **Output** | object (builder API)      |

**Rules:**

`config` object:

- `formId` (string)
- `method` → `"GET"` | `"POST"` | `"PUT"` | `"PATCH"`
- `action` (string) — form submission URL
- `autoValidate` (boolean) — validate on each field change

**Dynamic Form Builder API (returned object):**

- `addField(fieldConfig)` → adds field to form:
  - `fieldConfig`: `{ name, type, label, placeholder, required, defaultValue, options[], dependsOnField, dependsOnValue }`
  - `options[]` → for `"select"` | `"radio"` | `"checkbox"` types
  - `dependsOnField` + `dependsOnValue` → conditional field (only shown when dependency met)
- `removeField(name)` → removes field
- `updateField(name, updates)` → partially updates field config
- `getVisibleFields(currentValues)` → returns fields that should be visible given current form values
- `buildSchema()` → returns form descriptor `{ formId, method, action, fields }`
- `generateHTML()` → returns HTML string of the form
- `getReport()` → returns `{ totalFields, requiredCount, conditionalCount, byType }`

| Challenge 📢 | Return builder API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const builder = createDynamicFormBuilder({ formId: "regForm", method: "POST", action: "/register", autoValidate: true })`
- `builder.addField({ name: "name", type: "text", label: "Full Name", placeholder: "Enter name", required: true, defaultValue: "", options: [], dependsOnField: null, dependsOnValue: null })`
- `builder.addField({ name: "accountType", type: "select", label: "Account Type", placeholder: "", required: true, defaultValue: "personal", options: ["personal", "business"], dependsOnField: null, dependsOnValue: null })`
- `builder.addField({ name: "companyName", type: "text", label: "Company Name", placeholder: "Enter company", required: true, defaultValue: "", options: [], dependsOnField: "accountType", dependsOnValue: "business" })`
- `builder.getVisibleFields({ accountType: "personal" })` ➔ `["name", "accountType"]`
- `builder.getVisibleFields({ accountType: "business" })` ➔ `["name", "accountType", "companyName"]`
- `builder.getReport()` ➔ `{ totalFields: 3, requiredCount: 3, conditionalCount: 1, byType: { text: 2, select: 1 } }`

---

## 🧩 PROBLEM–05: 🛡️ Form Security & Sanitization Engine

⚠️ **Function Name:** `createFormSecurityEngine()`

| Input      | `config` (object)          |
| :--------- | :------------------------- |
| **Output** | object (security API)      |

**Rules:**

`config` object:

- `csrfTokenLength` (number) — length of generated CSRF token
- `maxSubmissionsPerMinute` (number) — rate limiting
- `sanitizationRules` (array of strings):
  - `"stripHTML"` → remove HTML tags
  - `"escapeSQL"` → escape SQL characters (`'`, `"`, `;`, `--`)
  - `"trimWhitespace"` → trim leading/trailing spaces
  - `"normalizeEmail"` → lowercase + trim email fields
  - `"removeDangerousChars"` → remove `<`, `>`, `&`, `{`, `}`

**Security Engine API (returned object):**

- `generateCSRF()` → returns random CSRF token string of configured length
- `validateCSRF(token, storedToken)` → returns boolean
- `sanitize(formData, fieldTypes)` → applies sanitization rules to each field
  - `fieldTypes`: `{ fieldName: "email" | "text" | "number" }` — applies type-specific rules
  - Returns sanitized formData object
- `checkRateLimit(submitterId)` → returns `{ allowed, remainingSubmissions, resetIn }`
- `detectThreats(formData)` → scans for:
  - XSS patterns (`<script>`, `javascript:`, `onerror=`)
  - SQL injection (`DROP`, `SELECT *`, `--`, `1=1`)
  - Returns `{ safe, threats: [{ field, type, detected }] }`
- `getSecurityReport()` → returns `{ totalSubmissions, blockedSubmissions, threatsDetected, sanitizedFields }`

| Challenge 📢 | Return security API. If config invalid → `"Invalid Input"` |
| :----------- | :--------------------------------------------------------- |

**Sample Input & Output:**

- `const security = createFormSecurityEngine({ csrfTokenLength: 32, maxSubmissionsPerMinute: 5, sanitizationRules: ["stripHTML", "trimWhitespace", "normalizeEmail"] })`
- `const token = security.generateCSRF()` ➔ `"a3f9...32chars"` *(random 32-char string)*
- `security.validateCSRF(token, token)` ➔ `true`
- `security.sanitize({ name: "  <b>Rahim</b>  ", email: "  RAHIM@MAIL.COM  " }, { name: "text", email: "email" })` ➔
  `{ name: "Rahim", email: "rahim@mail.com" }`
- `security.detectThreats({ username: "admin", query: "SELECT * FROM users WHERE 1=1 --" })` ➔
  `{`
  `safe: false,`
  `threats: [{ field: "query", type: "SQL Injection", detected: "SELECT *, 1=1, --" }]`
  `}`
- `security.checkRateLimit("user123")` ➔ `{ allowed: true, remainingSubmissions: 4, resetIn: 60 }`
- `security.getSecurityReport()` ➔ `{ totalSubmissions: 1, blockedSubmissions: 0, threatsDetected: 1, sanitizedFields: 2 }`

---