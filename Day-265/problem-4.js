// 🧩 PROBLEM–04: DOM Query Engine

function createDOMQueryEngine(domSnapshot) {

    // --- STEP 1: VALIDATE SNAPSHOT ---

    if (
        !domSnapshot ||
        typeof domSnapshot !== "object" ||
        Array.isArray(domSnapshot) ||
        !domSnapshot.root ||
        typeof domSnapshot.root !== "object"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE NODE ---

    const ids = new Set();

    function validateNode(node) {

        if (
            !node ||
            typeof node !== "object" ||
            Array.isArray(node) ||
            typeof node.tag !== "string" ||
            node.tag.trim() === "" ||
            typeof node.id !== "string" ||
            node.id.trim() === "" ||
            !Array.isArray(node.classes) ||
            !node.attributes ||
            typeof node.attributes !== "object" ||
            Array.isArray(node.attributes) ||
            !(
                node.textContent === null ||
                typeof node.textContent === "string"
            ) ||
            !Array.isArray(node.children)
        ) {
            return false;
        }

        if (ids.has(node.id)) {
            return false;
        }

        ids.add(node.id);

        if (
            !node.classes.every(
                className =>
                    typeof className === "string" &&
                    className.trim() !== ""
            )
        ) {
            return false;
        }

        for (const child of node.children) {

            if (!validateNode(child)) {
                return false;
            }
        }

        return true;
    }

    if (!validateNode(domSnapshot.root)) {
        return "Invalid Input";
    }

    // --- STEP 3: CREATE NODE MAP ---

    const nodeMap = new Map();

    function indexNodes(node, parentId = null, depth = 0) {

        nodeMap.set(node.id, {
            node,
            parentId,
            depth
        });

        for (const child of node.children) {
            indexNodes(child, node.id, depth + 1);
        }
    }

    indexNodes(domSnapshot.root);

    // --- STEP 4: PARSE SIMPLE SELECTOR ---

    function parseSelector(selector) {

        if (
            typeof selector !== "string" ||
            selector.trim() === ""
        ) {
            return null;
        }

        selector = selector.trim();

        // ID selector
        if (selector.startsWith("#")) {

            const id = selector.slice(1);

            if (!id) {
                return null;
            }

            return {
                tag: null,
                id,
                className: null
            };
        }

        // Class selector
        if (selector.startsWith(".")) {

            const className = selector.slice(1);

            if (!className) {
                return null;
            }

            return {
                tag: null,
                id: null,
                className
            };
        }

        // tag.class selector
        if (selector.includes(".")) {

            const [tag, className] =
                selector.split(".");

            if (
                !tag ||
                !className
            ) {
                return null;
            }

            return {
                tag: tag.toLowerCase(),
                id: null,
                className
            };
        }

        // Tag selector
        return {
            tag: selector.toLowerCase(),
            id: null,
            className: null
        };
    }

    // --- STEP 5: MATCH NODE ---

    function matchesNode(node, selector) {

        const parsed = parseSelector(selector);

        if (!parsed) {
            return false;
        }

        if (
            parsed.id !== null &&
            node.id !== parsed.id
        ) {
            return false;
        }

        if (
            parsed.tag !== null &&
            node.tag.toLowerCase() !== parsed.tag
        ) {
            return false;
        }

        if (
            parsed.className !== null &&
            !node.classes.includes(parsed.className)
        ) {
            return false;
        }

        return true;
    }

    // --- STEP 6: TRAVERSE TREE ---

    function traverse(node, callback) {

        callback(node);

        for (const child of node.children) {
            traverse(child, callback);
        }
    }

    // --- STEP 7: SELECT ---

    function select(selector) {

        if (
            typeof selector !== "string" ||
            selector.trim() === ""
        ) {
            return "Invalid Input";
        }

        const parts = selector
            .trim()
            .split(/\s*>\s*|\s+/);

        const isDirectChild =
            selector.includes(">");

        if (isDirectChild) {

            const [parentSelector, childSelector] =
                selector.split(">").
                    map(part => part.trim());

            if (
                !parentSelector ||
                !childSelector
            ) {
                return undefined;
            }

            let result;

            traverse(domSnapshot.root, node => {

                if (result) {
                    return;
                }

                if (!matchesNode(node, parentSelector)) {
                    return;
                }

                for (const child of node.children) {

                    if (
                        matchesNode(
                            child,
                            childSelector
                        )
                    ) {
                        result = child;
                        return;
                    }
                }
            });

            return result;
        }

        if (parts.length === 2) {

            const [
                ancestorSelector,
                descendantSelector
            ] = parts;

            let result;

            traverse(domSnapshot.root, node => {

                if (result) {
                    return;
                }

                if (
                    !matchesNode(
                        node,
                        ancestorSelector
                    )
                ) {
                    return;
                }

                function searchDescendants(child) {

                    if (
                        matchesNode(
                            child,
                            descendantSelector
                        )
                    ) {
                        result = child;
                        return;
                    }

                    for (const grandChild of child.children) {

                        if (result) {
                            return;
                        }

                        searchDescendants(grandChild);
                    }
                }

                for (const child of node.children) {

                    if (result) {
                        break;
                    }

                    searchDescendants(child);
                }
            });

            return result;
        }

        let result;

        traverse(domSnapshot.root, node => {

            if (!result && matchesNode(node, selector)) {
                result = node;
            }
        });

        return result;
    }

    // --- STEP 8: SELECT ALL ---

    function selectAll(selector) {

        if (
            typeof selector !== "string" ||
            selector.trim() === ""
        ) {
            return "Invalid Input";
        }

        const results = [];

        // Support comma-separated selectors
        const selectors = selector
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);

        for (const currentSelector of selectors) {

            const parts = currentSelector
                .split(/\s*>\s*|\s+/);

            const isDirectChild =
                currentSelector.includes(">");

            if (isDirectChild) {

                const [
                    parentSelector,
                    childSelector
                ] = currentSelector
                    .split(">")
                    .map(part => part.trim());

                traverse(
                    domSnapshot.root,
                    node => {

                        if (
                            matchesNode(
                                node,
                                parentSelector
                            )
                        ) {

                            for (
                                const child of node.children
                            ) {

                                if (
                                    matchesNode(
                                        child,
                                        childSelector
                                    ) &&
                                    !results.includes(child)
                                ) {
                                    results.push(child);
                                }
                            }
                        }
                    }
                );

            } else if (parts.length === 2) {

                const [
                    ancestorSelector,
                    descendantSelector
                ] = parts;

                traverse(
                    domSnapshot.root,
                    node => {

                        if (
                            matchesNode(
                                node,
                                ancestorSelector
                            )
                        ) {

                            function collect(child) {

                                if (
                                    matchesNode(
                                        child,
                                        descendantSelector
                                    ) &&
                                    !results.includes(child)
                                ) {
                                    results.push(child);
                                }

                                for (
                                    const grandChild of child.children
                                ) {
                                    collect(grandChild);
                                }
                            }

                            for (
                                const child of node.children
                            ) {
                                collect(child);
                            }
                        }
                    }
                );

            } else {

                traverse(
                    domSnapshot.root,
                    node => {

                        if (
                            matchesNode(
                                node,
                                currentSelector
                            ) &&
                            !results.includes(node)
                        ) {
                            results.push(node);
                        }
                    }
                );
            }
        }

        return results;
    }

    // --- STEP 9: CLOSEST ---

    function closest(startId, selector) {

        if (
            typeof startId !== "string" ||
            startId.trim() === "" ||
            typeof selector !== "string" ||
            selector.trim() === ""
        ) {
            return "Invalid Input";
        }

        const startData = nodeMap.get(startId);

        if (!startData) {
            return undefined;
        }

        let parentId = startData.parentId;

        while (parentId !== null) {

            const parentData = nodeMap.get(parentId);

            if (
                matchesNode(
                    parentData.node,
                    selector
                )
            ) {
                return parentData.node;
            }

            parentId = parentData.parentId;
        }

        return undefined;
    }

    // --- STEP 10: MATCHES ---

    function matches(nodeId, selector) {

        if (
            typeof nodeId !== "string" ||
            nodeId.trim() === "" ||
            typeof selector !== "string" ||
            selector.trim() === ""
        ) {
            return "Invalid Input";
        }

        const nodeData = nodeMap.get(nodeId);

        if (!nodeData) {
            return false;
        }

        return matchesNode(
            nodeData.node,
            selector
        );
    }

    // --- STEP 11: GET ATTRIBUTE ---

    function getAttribute(nodeId, attrName) {

        if (
            typeof nodeId !== "string" ||
            nodeId.trim() === "" ||
            typeof attrName !== "string" ||
            attrName.trim() === ""
        ) {
            return "Invalid Input";
        }

        const nodeData = nodeMap.get(nodeId);

        if (!nodeData) {
            return null;
        }

        return Object.prototype.hasOwnProperty.call(
            nodeData.node.attributes,
            attrName
        )
            ? nodeData.node.attributes[attrName]
            : null;
    }

    // --- STEP 12: GET DEPTH ---

    function getDepth(nodeId) {

        if (
            typeof nodeId !== "string" ||
            nodeId.trim() === ""
        ) {
            return "Invalid Input";
        }

        const nodeData = nodeMap.get(nodeId);

        if (!nodeData) {
            return -1;
        }

        return nodeData.depth;
    }

    // --- STEP 13: RETURN API ---

    return {
        select,
        selectAll,
        closest,
        matches,
        getAttribute,
        getDepth
    };
}


// --- EXAMPLE USAGE ---

const engine = createDOMQueryEngine({

    root: {
        tag: "div",
        id: "app",
        classes: ["container"],
        attributes: {},
        textContent: null,

        children: [

            {
                tag: "header",
                id: "header",
                classes: ["sticky"],
                attributes: {},
                textContent: null,

                children: [
                    {
                        tag: "h1",
                        id: "title",
                        classes: ["bold"],
                        attributes: {},
                        textContent: "App Title",
                        children: []
                    }
                ]
            },

            {
                tag: "main",
                id: "main",
                classes: ["content"],
                attributes: {},
                textContent: null,

                children: [
                    {
                        tag: "p",
                        id: "intro",
                        classes: ["text", "bold"],
                        attributes: {},
                        textContent: "Welcome",
                        children: []
                    }
                ]
            }
        ]
    }
});

console.log(engine.select("#title"));

console.log(engine.selectAll(".bold"));

console.log(engine.select("header > h1"));

console.log(engine.closest("title", "div"));

console.log(engine.matches("intro", "p.text"));

console.log(engine.getDepth("title"));