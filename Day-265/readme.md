# 🎓 JS DAILY PRACTICE – DAY-265

📅 **Goal:** DOM Selection & Manipulation Engine
🎯 **Focus:** DOM Tree • Element Selection • Dynamic Creation • innerHTML • textContent • classList • Attributes

---

## ⚠️ General Rules

- Solve every problem using a **function**.
- **Return** the result (❌ do not use `console.log` inside the function).
- Proper **input validation** is mandatory (check types and ranges).
- If input is invalid → return `"Invalid Input"`.

---

## 🧩 PROBLEM–01: 🌳 DOM Tree Builder & Serializer

⚠️ **Function Name:** `buildDOMTree()`

| Input      | `nodes` (array of objects) |
| :--------- | :------------------------- |
| **Output** | object (DOM tree API)      |

**Rules:**

Each node object:

- `id` (string) — unique node identifier
- `tag` (string) — HTML tag name (e.g., `"div"`, `"p"`, `"ul"`)
- `parentId` (string or `null`) — parent node id (`null` = root)
- `attributes` (object) — key/value pairs (e.g., `{ class: "container", id: "main" }`)
- `textContent` (string or `null`) — text inside element

**DOM Tree API (returned object):**

- `getNode(id)` → returns node object
- `getChildren(id)` → returns direct children of node
- `getAncestors(id)` → returns array from parent to root
- `querySelector(selector)` → finds first node matching:
  - `"tag"` → by tag name
  - `".class"` → by class attribute
  - `"#id"` → by id attribute
- `querySelectorAll(selector)` → returns all matching nodes
- `serialize()` → returns HTML string representation of entire tree
- `getTreeStats()` → returns `{ totalNodes, maxDepth, tagDistribution }`

| Challenge 📢 | Return DOM tree API. If nodes invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const tree = buildDOMTree([`
  `{ id: "n1", tag: "div", parentId: null, attributes: { class: "container" }, textContent: null },`
  `{ id: "n2", tag: "h1", parentId: "n1", attributes: { class: "title" }, textContent: "Hello World" },`
  `{ id: "n3", tag: "p", parentId: "n1", attributes: { class: "text" }, textContent: "Welcome" },`
  `{ id: "n4", tag: "span", parentId: "n3", attributes: {}, textContent: "!" }`
  `])`
- `tree.getChildren("n1")` ➔ `[{ id: "n2", tag: "h1" }, { id: "n3", tag: "p" }]`
- `tree.getAncestors("n4")` ➔ `["n3", "n1"]`
- `tree.querySelector(".title")` ➔ `{ id: "n2", tag: "h1", textContent: "Hello World" }`
- `tree.querySelectorAll("div, p")` ➔ `[{ id: "n1" }, { id: "n3" }]`
- `tree.serialize()` ➔ `'<div class="container"><h1 class="title">Hello World</h1><p class="text">Welcome<span>!</span></p></div>'`
- `tree.getTreeStats()` ➔ `{ totalNodes: 4, maxDepth: 3, tagDistribution: { div: 1, h1: 1, p: 1, span: 1 } }`

---

## 🧩 PROBLEM–02: 🎨 ClassList Manager Engine

⚠️ **Function Name:** `createClassListManager()`

| Input      | `elements` (array of objects) |
| :--------- | :---------------------------- |
| **Output** | object (classlist API)        |

**Rules:**

Each element object:

- `id` (string)
- `tag` (string)
- `classes` (array of strings) — initial class list

**ClassList API (returned object):**

- `add(id, ...classNames)` → adds classes to element
- `remove(id, ...classNames)` → removes classes from element
- `toggle(id, className)` → adds if absent, removes if present → returns new state (boolean)
- `contains(id, className)` → returns boolean
- `replace(id, oldClass, newClass)` → replaces one class with another → returns boolean
- `getClasses(id)` → returns current class array
- `getElements(className)` → returns all element ids that have given class
- `getReport()` → returns `{ totalElements, classDistribution }`

| Challenge 📢 | Return classlist API. If elements invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------ |

**Sample Input & Output:**

- `const manager = createClassListManager([`
  `{ id: "btn1", tag: "button", classes: ["btn", "primary"] },`
  `{ id: "btn2", tag: "button", classes: ["btn", "secondary"] },`
  `{ id: "card1", tag: "div", classes: ["card", "primary"] }`
  `])`
- `manager.add("btn1", "active", "large")` ➔ `["btn", "primary", "active", "large"]`
- `manager.remove("btn1", "large")` ➔ `["btn", "primary", "active"]`
- `manager.toggle("btn2", "active")` ➔ `true` *(added)*
- `manager.toggle("btn2", "active")` ➔ `false` *(removed)*
- `manager.replace("card1", "primary", "featured")` ➔ `true`
- `manager.getClasses("card1")` ➔ `["card", "featured"]`
- `manager.getElements("btn")` ➔ `["btn1", "btn2"]`
- `manager.getReport()` ➔ `{ totalElements: 3, classDistribution: { btn: 2, primary: 1, secondary: 1, card: 1, featured: 1, active: 1 } }`

---

## 🧩 PROBLEM–03: 🏗️ Dynamic Element Factory Engine

⚠️ **Function Name:** `createElementFactory()`

| Input      | `config` (object)        |
| :--------- | :----------------------- |
| **Output** | object (factory API)     |

**Rules:**

`config` object:

- `namespace` (string) — prefix for generated ids (e.g., `"app"`)
- `defaultStyles` (object) — default style properties for all elements
- `allowedTags` (array of strings) — only these tags can be created

**Element Factory API (returned object):**

- `createElement(tag, options)` → creates element descriptor:
  - `options`: `{ id, classes[], text, attributes{}, children[], styles{} }`
  - Auto-generates id if not provided: `"namespace-tag-N"`
- `createList(items[], tag)` → creates `ul/ol` with `li` children
- `createTable(headers[], rows[][])` → creates table structure
- `createForm(fields[])` → creates form with inputs:
  - Each field: `{ name, type, label, required, placeholder }`
- `getElementById(id)` → returns created element descriptor
- `getCreatedElements()` → returns all created element descriptors
- `getReport()` → returns `{ totalCreated, byTag, lastCreated }`

| Challenge 📢 | Return factory API. If config invalid → `"Invalid Input"` |
| :----------- | :-------------------------------------------------------- |

**Sample Input & Output:**

- `const factory = createElementFactory({ namespace: "app", defaultStyles: { fontFamily: "Arial" }, allowedTags: ["div", "p", "ul", "li", "table", "form", "input"] })`
- `factory.createElement("div", { classes: ["container"], text: "Hello", styles: { color: "red" } })` ➔
  `{ id: "app-div-1", tag: "div", classes: ["container"], text: "Hello", styles: { fontFamily: "Arial", color: "red" }, attributes: {}, children: [] }`
- `factory.createList(["Item 1", "Item 2", "Item 3"], "ul")` ➔
  `{ id: "app-ul-2", tag: "ul", children: [`
  `{ id: "app-li-3", tag: "li", text: "Item 1" },`
  `{ id: "app-li-4", tag: "li", text: "Item 2" },`
  `{ id: "app-li-5", tag: "li", text: "Item 3" }`
  `] }`
- `factory.getReport()` ➔ `{ totalCreated: 5, byTag: { div: 1, ul: 1, li: 3 }, lastCreated: "app-li-5" }`

---

## 🧩 PROBLEM–04: 🔍 DOM Query Engine

⚠️ **Function Name:** `createDOMQueryEngine()`

| Input      | `domSnapshot` (object)   |
| :--------- | :----------------------- |
| **Output** | object (query API)       |

**Rules:**

`domSnapshot` object represents a virtual DOM:

- `root` (object) — root element with nested children:
  - Each element: `{ tag, id, classes[], attributes{}, textContent, children[] }`

**Query Engine API (returned object):**

- `select(selector)` → CSS-like selector, returns first match:
  - `"tag"` → by tag
  - `"#id"` → by id
  - `".class"` → by class
  - `"tag.class"` → tag + class combined
  - `"parent > child"` → direct child only
  - `"ancestor descendant"` → any depth descendant
- `selectAll(selector)` → returns all matches
- `closest(startId, selector)` → traverses up from node to find matching ancestor
- `matches(nodeId, selector)` → returns boolean if node matches selector
- `getAttribute(nodeId, attrName)` → returns attribute value or `null`
- `getDepth(nodeId)` → returns how deep the node is (root = 0)

| Challenge 📢 | Return query API. If domSnapshot invalid → `"Invalid Input"` |
| :----------- | :----------------------------------------------------------- |

**Sample Input & Output:**

- `const engine = createDOMQueryEngine({`
  `root: {`
  `tag: "div", id: "app", classes: ["container"], attributes: {}, textContent: null,`
  `children: [`
  `{ tag: "header", id: "header", classes: ["sticky"], attributes: {}, textContent: null,`
  `children: [{ tag: "h1", id: "title", classes: ["bold"], attributes: {}, textContent: "App Title", children: [] }] },`
  `{ tag: "main", id: "main", classes: ["content"], attributes: {}, textContent: null,`
  `children: [{ tag: "p", id: "intro", classes: ["text", "bold"], attributes: {}, textContent: "Welcome", children: [] }] }`
  `]`
  `}`
  `})`
- `engine.select("#title")` ➔ `{ tag: "h1", id: "title", textContent: "App Title" }`
- `engine.selectAll(".bold")` ➔ `[{ id: "title" }, { id: "intro" }]`
- `engine.select("header > h1")` ➔ `{ id: "title" }`
- `engine.closest("title", "div")` ➔ `{ id: "app", tag: "div" }`
- `engine.matches("intro", "p.text")` ➔ `true`
- `engine.getDepth("title")` ➔ `2`

---

## 🧩 PROBLEM–05: 🔄 Virtual DOM Diff Engine

⚠️ **Function Name:** `createVirtualDOMDiff()`

| Input      | `oldTree` (object), `newTree` (object) |
| :--------- | :------------------------------------- |
| **Output** | object                                 |

**Rules:**

Each tree is a virtual DOM object:

- `{ id, tag, classes[], attributes{}, textContent, children[] }`

**Diff Algorithm Rules:**

- Compare old and new trees node by node (by `id`)
- Detect changes:
  - `"ADDED"` → node exists in new but not old
  - `"REMOVED"` → node exists in old but not new
  - `"UPDATED"` → node exists in both but `textContent`, `classes`, or `attributes` changed
  - `"UNCHANGED"` → node identical in both
- For `"UPDATED"` → specify what changed: `{ textChanged, classesChanged, attributesChanged }`

**Output:**

- `patches` → array of `{ id, type, changes }` for all non-UNCHANGED nodes
- `stats` → `{ added, removed, updated, unchanged, totalNodes }`
- `patchSummary` → human-readable string summary

| Challenge 📢 | Return `{ patches, stats, patchSummary }`. If either tree invalid → `"Invalid Input"` |
| :----------- | :------------------------------------------------------------------------------------ |

**Sample Input & Output:**

- `createVirtualDOMDiff(`
  `{ id: "root", tag: "div", classes: ["app"], attributes: {}, textContent: null, children: [`
  `{ id: "h1", tag: "h1", classes: [], attributes: {}, textContent: "Old Title", children: [] },`
  `{ id: "p1", tag: "p", classes: ["text"], attributes: {}, textContent: "Hello", children: [] }`
  `]},`
  `{ id: "root", tag: "div", classes: ["app", "dark"], attributes: {}, textContent: null, children: [`
  `{ id: "h1", tag: "h1", classes: [], attributes: {}, textContent: "New Title", children: [] },`
  `{ id: "p2", tag: "p", classes: ["text"], attributes: {}, textContent: "World", children: [] }`
  `]}`
  `)` ➔
  `{`
  `patches: [`
  `{ id: "root", type: "UPDATED", changes: { textChanged: false, classesChanged: true, attributesChanged: false } },`
  `{ id: "h1", type: "UPDATED", changes: { textChanged: true, classesChanged: false, attributesChanged: false } },`
  `{ id: "p1", type: "REMOVED", changes: null },`
  `{ id: "p2", type: "ADDED", changes: null }`
  `],`
  `stats: { added: 1, removed: 1, updated: 2, unchanged: 0, totalNodes: 4 },`
  `patchSummary: "2 updated, 1 added, 1 removed, 0 unchanged"`
  `}`

---