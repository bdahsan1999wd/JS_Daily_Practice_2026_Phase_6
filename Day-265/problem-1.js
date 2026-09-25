// 🧩 PROBLEM–01: DOM Tree Builder & Serializer

function buildDOMTree(nodes) {

    // --- STEP 1: VALIDATE INPUT ---

    if (
        !Array.isArray(nodes) ||
        nodes.length === 0
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE NODE STRUCTURE ---

    const nodeIds = new Set();

    for (const node of nodes) {

        if (
            !node ||
            typeof node !== "object" ||
            Array.isArray(node) ||
            typeof node.id !== "string" ||
            node.id.trim() === "" ||
            typeof node.tag !== "string" ||
            node.tag.trim() === "" ||
            !(
                node.parentId === null ||
                typeof node.parentId === "string"
            ) ||
            !node.attributes ||
            typeof node.attributes !== "object" ||
            Array.isArray(node.attributes) ||
            !(
                node.textContent === null ||
                typeof node.textContent === "string"
            )
        ) {
            return "Invalid Input";
        }

        if (nodeIds.has(node.id)) {
            return "Invalid Input";
        }

        nodeIds.add(node.id);

        // Validate attributes
        for (const [key, value] of Object.entries(node.attributes)) {

            if (
                typeof key !== "string" ||
                key.trim() === "" ||
                !(
                    typeof value === "string" ||
                    typeof value === "number" ||
                    typeof value === "boolean"
                )
            ) {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 3: VALIDATE PARENT REFERENCES ---

    let rootCount = 0;

    for (const node of nodes) {

        if (node.parentId === null) {
            rootCount++;
        } else if (!nodeIds.has(node.parentId)) {
            return "Invalid Input";
        }
    }

    // Exactly one root is required
    if (rootCount !== 1) {
        return "Invalid Input";
    }

    // --- STEP 4: CREATE NODE MAP ---

    const nodeMap = new Map();

    for (const node of nodes) {

        nodeMap.set(node.id, {
            id: node.id,
            tag: node.tag.toLowerCase(),
            parentId: node.parentId,
            attributes: { ...node.attributes },
            textContent: node.textContent,
            children: []
        });
    }

    // --- STEP 5: BUILD TREE ---

    let root = null;

    for (const node of nodeMap.values()) {

        if (node.parentId === null) {

            root = node;

        } else {

            const parent = nodeMap.get(node.parentId);

            parent.children.push(node);
        }
    }

    // --- STEP 6: PREVENT CYCLIC TREE ---

    const visited = new Set();

    function validateTree(node) {

        if (visited.has(node.id)) {
            return false;
        }

        visited.add(node.id);

        for (const child of node.children) {

            if (!validateTree(child)) {
                return false;
            }
        }

        return true;
    }

    if (!validateTree(root) || visited.size !== nodes.length) {
        return "Invalid Input";
    }

    // --- STEP 7: GET NODE ---

    function getNode(id) {

        if (
            typeof id !== "string" ||
            id.trim() === ""
        ) {
            return undefined;
        }

        return nodeMap.get(id);
    }

    // --- STEP 8: GET CHILDREN ---

    function getChildren(id) {

        const node = getNode(id);

        if (!node) {
            return [];
        }

        return node.children.map(child => child);
    }

    // --- STEP 9: GET ANCESTORS ---

    function getAncestors(id) {

        const node = getNode(id);

        if (!node) {
            return [];
        }

        const ancestors = [];

        let current = node;

        while (current.parentId !== null) {

            ancestors.push(current.parentId);

            current = nodeMap.get(current.parentId);
        }

        return ancestors;
    }

    // --- STEP 10: MATCH SELECTOR ---

    function matchesSelector(node, selector) {

        if (typeof selector !== "string") {
            return false;
        }

        selector = selector.trim();

        if (!selector) {
            return false;
        }

        // ID selector
        if (selector.startsWith("#")) {

            const id = selector.slice(1);

            return node.id === id;
        }

        // Class selector
        if (selector.startsWith(".")) {

            const className = selector.slice(1);

            const classAttribute =
                String(node.attributes.class || "");

            const classes =
                classAttribute
                    .split(/\s+/)
                    .filter(Boolean);

            return classes.includes(className);
        }

        // Tag selector
        return node.tag === selector.toLowerCase();
    }

    // --- STEP 11: TRAVERSE TREE ---

    function traverse(node, callback) {

        callback(node);

        for (const child of node.children) {
            traverse(child, callback);
        }
    }

    // --- STEP 12: QUERY SELECTOR ---

    function querySelector(selector) {

        if (typeof selector !== "string") {
            return undefined;
        }

        // Support comma-separated selectors
        const selectors = selector
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

        if (selectors.length === 0) {
            return undefined;
        }

        let result;

        traverse(root, node => {

            if (result) {
                return;
            }

            if (
                selectors.some(
                    selector => matchesSelector(node, selector)
                )
            ) {
                result = node;
            }
        });

        return result;
    }

    // --- STEP 13: QUERY SELECTOR ALL ---

    function querySelectorAll(selector) {

        if (typeof selector !== "string") {
            return [];
        }

        const selectors = selector
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

        if (selectors.length === 0) {
            return [];
        }

        const results = [];

        traverse(root, node => {

            if (
                selectors.some(
                    selector => matchesSelector(node, selector)
                )
            ) {
                results.push(node);
            }
        });

        return results;
    }

    // --- STEP 14: ESCAPE HTML ---

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // --- STEP 15: SERIALIZE NODE ---

    function serializeNode(node) {

        let html = `<${node.tag}`;

        for (const [key, value] of Object.entries(node.attributes)) {

            html += ` ${key}="${escapeHTML(value)}"`;
        }

        html += ">";

        if (node.textContent !== null) {
            html += escapeHTML(node.textContent);
        }

        for (const child of node.children) {
            html += serializeNode(child);
        }

        html += `</${node.tag}>`;

        return html;
    }

    // --- STEP 16: SERIALIZE TREE ---

    function serialize() {
        return serializeNode(root);
    }

    // --- STEP 17: TREE STATS ---

    function getTreeStats() {

        const tagDistribution = {};

        let maxDepth = 0;

        function calculate(node, depth) {

            tagDistribution[node.tag] =
                (tagDistribution[node.tag] || 0) + 1;

            maxDepth = Math.max(maxDepth, depth);

            for (const child of node.children) {
                calculate(child, depth + 1);
            }
        }

        // Root depth is considered 1
        calculate(root, 1);

        return {
            totalNodes: nodes.length,
            maxDepth,
            tagDistribution
        };
    }

    // --- STEP 18: RETURN DOM API ---

    return {
        getNode,
        getChildren,
        getAncestors,
        querySelector,
        querySelectorAll,
        serialize,
        getTreeStats
    };
}


// --- EXAMPLE USAGE ---

const tree = buildDOMTree([
    {
        id: "n1",
        tag: "div",
        parentId: null,
        attributes: {
            class: "container"
        },
        textContent: null
    },
    {
        id: "n2",
        tag: "h1",
        parentId: "n1",
        attributes: {
            class: "title"
        },
        textContent: "Hello World"
    },
    {
        id: "n3",
        tag: "p",
        parentId: "n1",
        attributes: {
            class: "text"
        },
        textContent: "Welcome"
    },
    {
        id: "n4",
        tag: "span",
        parentId: "n3",
        attributes: {},
        textContent: "!"
    }
]);

console.log(tree.getChildren("n1"));

console.log(tree.getAncestors("n4"));

console.log(tree.querySelector(".title"));

console.log(tree.querySelectorAll("div, p"));

console.log(tree.serialize());

console.log(tree.getTreeStats());


// --- Invalid Input ---
console.log(buildDOMTree("invalid"));