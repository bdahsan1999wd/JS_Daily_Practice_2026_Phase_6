// 🧩 PROBLEM–01: simulateEventPropagation()

// Logic: This function simulates DOM event propagation through capture phase, target phase, and bubble phase. It tracks listener execution order, stopPropagation, and preventDefault.


function simulateEventPropagation(domTree, event) {

    // --- STEP 1: VALIDATE INPUT ---
    if (
        !Array.isArray(domTree) ||
        !event ||
        typeof event !== 'object' ||
        typeof event.type !== 'string' ||
        typeof event.targetId !== 'string'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE DOM TREE ---
    for (const node of domTree) {
        if (
            typeof node !== 'object' ||
            node === null ||
            typeof node.id !== 'string' ||
            typeof node.tag !== 'string' ||
            (node.parentId !== null && typeof node.parentId !== 'string') ||
            !Array.isArray(node.listeners)
        ) {
            return "Invalid Input";
        }
        for (const listener of node.listeners) {
            if (
                typeof listener !== 'object' ||
                listener === null ||
                typeof listener.eventType !== 'string' ||
                !["capture", "bubble"].includes(listener.phase) ||
                typeof listener.stopsAt !== 'boolean' ||
                typeof listener.prevents !== 'boolean'
            ) {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 3: BUILD NODE MAP ---
    const nodeMap = new Map();
    for (const node of domTree) {
        nodeMap.set(node.id, node);
    }

    // --- STEP 4: VALIDATE TARGET EXISTS ---
    if (!nodeMap.has(event.targetId)) {
        return "Invalid Input";
    }

    // --- STEP 5: BUILD ANCESTOR CHAIN (root to target) ---
    const ancestorChain = [];
    let currentId = event.targetId;
    while (currentId !== null) {
        const node = nodeMap.get(currentId);
        if (!node) break;
        ancestorChain.unshift(node); // Add to front (root first)
        currentId = node.parentId;
    }

    // --- STEP 6: SIMULATE CAPTURE PHASE ---
    const captureLog = [];
    let stoppedAt = null;
    let defaultPrevented = false;

    for (const node of ancestorChain) {
        for (const listener of node.listeners) {
            if (listener.eventType === event.type && listener.phase === "capture") {
                captureLog.push(node.id);
                if (listener.prevents) defaultPrevented = true;
                if (listener.stopsAt) {
                    stoppedAt = node.id;
                    break;
                }
            }
        }
        if (stoppedAt) break;
    }

    // --- STEP 7: SIMULATE TARGET PHASE ---
    const targetNode = nodeMap.get(event.targetId);
    const bubbleLog = [];

    if (!stoppedAt) {
        for (const listener of targetNode.listeners) {
            if (listener.eventType === event.type) {
                // Both capture and bubble listeners fire on target
                bubbleLog.push(targetNode.id);
                if (listener.prevents) defaultPrevented = true;
                if (listener.stopsAt) {
                    stoppedAt = targetNode.id;
                    break;
                }
            }
        }
    }

    // --- STEP 8: SIMULATE BUBBLE PHASE ---
    if (!stoppedAt) {
        // Walk back up from target's parent to root
        for (let i = ancestorChain.length - 2; i >= 0; i--) {
            const node = ancestorChain[i];
            for (const listener of node.listeners) {
                if (listener.eventType === event.type && listener.phase === "bubble") {
                    bubbleLog.push(node.id);
                    if (listener.prevents) defaultPrevented = true;
                    if (listener.stopsAt) {
                        stoppedAt = node.id;
                        break;
                    }
                }
            }
            if (stoppedAt) break;
        }
    }

    // --- STEP 9: RETURN RESULTS ---
    return {
        captureLog,
        bubbleLog,
        defaultPrevented,
        stoppedAt
    };
}


// --- EXAMPLE USAGE ---
console.log(simulateEventPropagation(
    [
        { id: "window", tag: "window", parentId: null, listeners: [{ eventType: "click", phase: "capture", stopsAt: false, prevents: false }] },
        { id: "div", tag: "div", parentId: "window", listeners: [{ eventType: "click", phase: "bubble", stopsAt: false, prevents: false }] },
        { id: "btn", tag: "button", parentId: "div", listeners: [{ eventType: "click", phase: "bubble", stopsAt: true, prevents: true }] }
    ],
    { type: "click", targetId: "btn" }
));


// --- Invalid Input ---
console.log(simulateEventPropagation("invalid", {}));