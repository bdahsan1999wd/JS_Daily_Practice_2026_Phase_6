// 🧩 PROBLEM–01: detectMemoryLeaks()

// Logic: This function analyzes memory snapshots to detect potential
// memory leaks. An object is a potential leak if it appears in 3 or
// more consecutive snapshots without being released. It tracks total
// leaked memory and classifies severity.


function detectMemoryLeaks(memorySnapshots) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(memorySnapshots) || memorySnapshots.length === 0) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH SNAPSHOT ---
    for (const snapshot of memorySnapshots) {
        if (
            typeof snapshot !== 'object' ||
            snapshot === null ||
            typeof snapshot.snapshotId !== 'string' ||
            typeof snapshot.timestamp !== 'number' ||
            !Array.isArray(snapshot.allocations)
        ) {
            return "Invalid Input";
        }
        for (const alloc of snapshot.allocations) {
            if (
                typeof alloc !== 'object' ||
                alloc === null ||
                typeof alloc.id !== 'string' ||
                typeof alloc.size !== 'number' ||
                typeof alloc.type !== 'string'
            ) {
                return "Invalid Input";
            }
        }
    }

    // --- STEP 3: SORT SNAPSHOTS BY TIMESTAMP ---
    const snapshots = [...memorySnapshots].sort((a, b) => a.timestamp - b.timestamp);

    // --- STEP 4: TRACK OBJECT APPEARANCES ---
    const objectTracker = new Map(); // id -> { id, size, type, consecutiveCount, lastSeenIndex }
    const allObjectIds = new Set(); // Track all IDs that ever appeared

    for (let i = 0; i < snapshots.length; i++) {
        const snapshot = snapshots[i];
        const currentIds = new Set();

        for (const alloc of snapshot.allocations) {
            currentIds.add(alloc.id);
            allObjectIds.add(alloc.id);

            if (objectTracker.has(alloc.id)) {
                const tracker = objectTracker.get(alloc.id);
                // Check if consecutive (previous snapshot had this object)
                if (tracker.lastSeenIndex === i - 1) {
                    tracker.consecutiveCount++;
                } else {
                    tracker.consecutiveCount = 1;
                }
                tracker.lastSeenIndex = i;
                tracker.size = alloc.size;
                tracker.type = alloc.type;
            } else {
                objectTracker.set(alloc.id, {
                    id: alloc.id,
                    size: alloc.size,
                    type: alloc.type,
                    consecutiveCount: 1,
                    lastSeenIndex: i
                });
            }
        }

        // Reset count for objects not in this snapshot
        for (const [id, tracker] of objectTracker) {
            if (!currentIds.has(id)) {
                tracker.consecutiveCount = 0;
            }
        }
    }

    // --- STEP 5: IDENTIFY LEAKS AND CLEAN OBJECTS ---
    const leaks = [];
    const cleanObjects = [];

    for (const id of allObjectIds) {
        const tracker = objectTracker.get(id);
        if (tracker && tracker.consecutiveCount >= 3) {
            leaks.push({
                id: tracker.id,
                size: tracker.size,
                type: tracker.type,
                appearedIn: tracker.consecutiveCount
            });
        } else {
            // Not a leak (either never reached 3 consecutive, or not in tracker)
            cleanObjects.push(id);
        }
    }

    // --- STEP 6: CALCULATE TOTAL LEAKED MEMORY ---
    const totalLeakedKB = leaks.reduce((sum, leak) => sum + leak.size, 0);

    // --- STEP 7: DETERMINE SEVERITY ---
    let severity;
    if (totalLeakedKB > 500) severity = "Critical";
    else if (totalLeakedKB >= 100) severity = "Warning";
    else severity = "Low";

    // --- STEP 8: RETURN RESULTS ---
    return {
        leaks,
        totalLeakedKB,
        severity,
        cleanObjects: cleanObjects.sort()
    };
}


// --- EXAMPLE USAGE ---
console.log(detectMemoryLeaks([
    { snapshotId: "s1", timestamp: 1, allocations: [{ id: "A", size: 200, type: "closure" }, { id: "B", size: 50, type: "array" }] },
    { snapshotId: "s2", timestamp: 2, allocations: [{ id: "A", size: 200, type: "closure" }, { id: "C", size: 30, type: "dom" }] },
    { snapshotId: "s3", timestamp: 3, allocations: [{ id: "A", size: 200, type: "closure" }, { id: "C", size: 30, type: "dom" }] }
]));


// --- Invalid Input ---
console.log(detectMemoryLeaks("invalid"));