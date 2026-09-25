// 🧩 PROBLEM–05: Virtual DOM Diff Engine

function createVirtualDOMDiff(oldTree, newTree) {

    // --- STEP 1: VALIDATE NODE ---

    function isValidNode(node, ids) {

        if (
            !node ||
            typeof node !== "object" ||
            Array.isArray(node) ||
            typeof node.id !== "string" ||
            node.id.trim() === "" ||
            typeof node.tag !== "string" ||
            node.tag.trim() === "" ||
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

            if (!isValidNode(child, ids)) {
                return false;
            }
        }

        return true;
    }

    // --- STEP 2: VALIDATE BOTH TREES ---

    const oldIds = new Set();
    const newIds = new Set();

    if (
        !isValidNode(oldTree, oldIds) ||
        !isValidNode(newTree, newIds)
    ) {
        return "Invalid Input";
    }

    // --- STEP 3: FLATTEN TREE ---

    function flattenTree(root) {

        const map = new Map();

        function traverse(node) {

            map.set(node.id, node);

            for (const child of node.children) {
                traverse(child);
            }
        }

        traverse(root);

        return map;
    }

    const oldMap = flattenTree(oldTree);
    const newMap = flattenTree(newTree);

    // --- STEP 4: COMPARE ARRAYS ---

    function arraysEqual(first, second) {

        if (first.length !== second.length) {
            return false;
        }

        return first.every(
            (value, index) =>
                value === second[index]
        );
    }

    // --- STEP 5: COMPARE OBJECTS ---

    function objectsEqual(first, second) {

        const firstKeys =
            Object.keys(first);

        const secondKeys =
            Object.keys(second);

        if (
            firstKeys.length !==
            secondKeys.length
        ) {
            return false;
        }

        return firstKeys.every(
            key =>
                Object.prototype.hasOwnProperty.call(
                    second,
                    key
                ) &&
                first[key] === second[key]
        );
    }

    // --- STEP 6: INITIALIZE DIFF STATE ---

    const patches = [];

    let added = 0;
    let removed = 0;
    let updated = 0;
    let unchanged = 0;

    // --- STEP 7: PRESERVE TREE ORDER ---

    const orderedIds = [];

    function collectIds(node) {

        orderedIds.push(node.id);

        for (const child of node.children) {
            collectIds(child);
        }
    }

    collectIds(oldTree);
    collectIds(newTree);

    const uniqueIds = [
        ...new Set(orderedIds)
    ];

    // --- STEP 8: COMPARE NODES ---

    for (const id of uniqueIds) {

        const oldNode = oldMap.get(id);
        const newNode = newMap.get(id);

        // Node added
        if (!oldNode && newNode) {

            patches.push({
                id,
                type: "ADDED",
                changes: null
            });

            added++;

            continue;
        }

        // Node removed
        if (oldNode && !newNode) {

            patches.push({
                id,
                type: "REMOVED",
                changes: null
            });

            removed++;

            continue;
        }

        // Node exists in both
        const textChanged =
            oldNode.textContent !==
            newNode.textContent;

        const classesChanged =
            !arraysEqual(
                oldNode.classes,
                newNode.classes
            );

        const attributesChanged =
            !objectsEqual(
                oldNode.attributes,
                newNode.attributes
            );

        const hasChanges =
            textChanged ||
            classesChanged ||
            attributesChanged;

        if (hasChanges) {

            patches.push({
                id,
                type: "UPDATED",

                changes: {
                    textChanged,
                    classesChanged,
                    attributesChanged
                }
            });

            updated++;

        } else {

            unchanged++;
        }
    }

    // --- STEP 9: TOTAL NODES ---

    const totalNodes =
        oldMap.size + newMap.size;

    // Common nodes were counted twice, so calculate total unique nodes.
    const uniqueNodeCount =
        new Set([
            ...oldMap.keys(),
            ...newMap.keys()
        ]).size;

    // --- STEP 10: BUILD STATS ---

    const stats = {

        added,

        removed,

        updated,

        unchanged,

        totalNodes: uniqueNodeCount
    };

    // --- STEP 11: BUILD SUMMARY ---

    const patchSummary =
        `${updated} updated, ` +
        `${added} added, ` +
        `${removed} removed, ` +
        `${unchanged} unchanged`;

    // --- STEP 12: RETURN RESULT ---

    return {
        patches,
        stats,
        patchSummary
    };
}


// --- EXAMPLE USAGE ---

const diffResult = createVirtualDOMDiff(

    {
        id: "root",
        tag: "div",
        classes: ["app"],
        attributes: {},
        textContent: null,

        children: [

            {
                id: "h1",
                tag: "h1",
                classes: [],
                attributes: {},
                textContent: "Old Title",
                children: []
            },

            {
                id: "p1",
                tag: "p",
                classes: ["text"],
                attributes: {},
                textContent: "Hello",
                children: []
            }
        ]
    },

    {
        id: "root",
        tag: "div",
        classes: ["app", "dark"],
        attributes: {},
        textContent: null,

        children: [

            {
                id: "h1",
                tag: "h1",
                classes: [],
                attributes: {},
                textContent: "New Title",
                children: []
            },

            {
                id: "p2",
                tag: "p",
                classes: ["text"],
                attributes: {},
                textContent: "World",
                children: []
            }
        ]
    }
);


console.log(diffResult);


// --- Invalid Input ---
console.log(
    createVirtualDOMDiff(
        "invalid",
        {}
    )
);