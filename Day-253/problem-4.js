// 🧩 PROBLEM–04: analyzeGCEligibility()

// Logic: This function analyzes object references to determine
// garbage collection eligibility. It builds a reference graph
// from the memory map and identifies:
// 1. Objects with empty `referencedBy` → gcEligible
// 2. Objects with non-empty `referencedBy` not in circular groups → safe
// 3. Circular reference groups (mutual references, no external refs) → circularGroups


function analyzeGCEligibility(memoryMap) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(memoryMap)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH MEMORY OBJECT ---
    for (const obj of memoryMap) {
        if (
            typeof obj !== 'object' ||
            obj === null ||
            typeof obj.id !== 'string' ||
            !Array.isArray(obj.references) ||
            !Array.isArray(obj.referencedBy)
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: BUILD OBJECT MAP ---
    const objects = new Map();
    for (const obj of memoryMap) {
        objects.set(obj.id, obj);
    }

    // --- STEP 4: FIND STRONGLY CONNECTED COMPONENTS (SCC) ---
    // Use Tarjan's algorithm to find all SCCs
    const allIds = Array.from(objects.keys());
    const index = new Map();
    const lowlink = new Map();
    const onStack = new Set();
    const stack = [];
    const sccs = [];
    let idx = 0;

    function strongconnect(v) {
        index.set(v, idx);
        lowlink.set(v, idx);
        idx++;
        stack.push(v);
        onStack.add(v);

        const obj = objects.get(v);
        if (obj) {
            for (const w of obj.references) {
                if (objects.has(w)) {
                    if (!index.has(w)) {
                        strongconnect(w);
                        lowlink.set(v, Math.min(lowlink.get(v), lowlink.get(w)));
                    } else if (onStack.has(w)) {
                        lowlink.set(v, Math.min(lowlink.get(v), index.get(w)));
                    }
                }
            }
        }

        if (lowlink.get(v) === index.get(v)) {
            // Start a new SCC
            const scc = [];
            let w;
            do {
                w = stack.pop();
                onStack.delete(w);
                scc.push(w);
            } while (w !== v);
            sccs.push(scc);
        }
    }

    for (const v of allIds) {
        if (!index.has(v)) {
            strongconnect(v);
        }
    }

    // --- STEP 5: IDENTIFY CIRCULAR GROUPS WITH NO EXTERNAL REFERENCES ---
    // An SCC with size > 1 is a circular reference group
    // It qualifies only if NO object outside the SCC references any object inside
    const inCircularGroup = new Set();
    const circularGroups = [];

    for (const scc of sccs) {
        if (scc.length > 1) {
            // Check for external references using `referencedBy` field
            let hasExternalRef = false;
            for (const objId of scc) {
                const obj = objects.get(objId);
                for (const ref of obj.referencedBy) {
                    if (!scc.includes(ref)) {
                        hasExternalRef = true;
                        break;
                    }
                }
                if (hasExternalRef) break;
            }

            if (!hasExternalRef) {
                const group = [...scc].sort();
                circularGroups.push(group);
                for (const gId of group) {
                    inCircularGroup.add(gId);
                }
            }
        }
    }

    // --- STEP 6: CLASSIFY OBJECTS ---
    // gcEligible: objects with empty referencedBy (regardless of circular group)
    // safe: objects with non empty referencedBy that are NOT in circular groups
    // circularGroups: the detected groups (may overlap with gcEligible)
    const gcEligible = [];
    const safe = [];

    for (const obj of memoryMap) {
        if (obj.referencedBy.length === 0) {
            gcEligible.push(obj.id);
        } else if (!inCircularGroup.has(obj.id)) {
            safe.push(obj.id);
        }
        // Objects in circular groups with non empty referencedBy
        // are only listed in circularGroups, not in safe
    }

    // Sort for consistent output
    gcEligible.sort();
    safe.sort();

    // --- STEP 7: RETURN ANALYSIS RESULT ---
    return {
        gcEligible,
        safe,
        circularGroups
    };
}


// --- EXAMPLE USAGE ---
console.log(analyzeGCEligibility([
    { id: "A", references: ["B"], referencedBy: [] },
    { id: "B", references: ["A"], referencedBy: ["A"] },
    { id: "C", references: [], referencedBy: ["D"] },
    { id: "D", references: ["C"], referencedBy: [] }
]));

// --- Invalid Input ---
console.log(analyzeGCEligibility("invalid"));