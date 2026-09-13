// 🧩 PROBLEM–03: createLifecycleTracker()

// Logic: This function creates an object lifecycle tracker with
// time-to-live (maxAge) and capacity (maxObjects) limits. It tracks
// object allocation, access, and expiration. Uses a tick-based time
// simulation. Objects expire when age >= maxAge (i.e., older than or
// equal to maxAge). All state is private via closure.


function createLifecycleTracker(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.maxAge !== 'number' ||
        typeof config.maxObjects !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.maxAge <= 0 || config.maxObjects <= 0) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    const objects = new Map(); // id -> { data, allocatedTick, lastAccessedTick, expired }
    let currentTick = 0;
    let totalAllocated = 0;
    let totalExpired = 0;

    // --- STEP 3: DEFINE ALLOCATE ---
    function allocate(id, data) {
        if (typeof id !== 'string') {
            return "Invalid Input";
        }

        // If at capacity, expire oldest object first (LRU-like)
        if (objects.size >= config.maxObjects) {
            // Find oldest non-expired object by allocation time
            let oldestId = null;
            let oldestTick = Infinity;
            for (const [objId, obj] of objects) {
                if (!obj.expired && obj.allocatedTick < oldestTick) {
                    oldestTick = obj.allocatedTick;
                    oldestId = objId;
                }
            }
            if (oldestId) {
                objects.get(oldestId).expired = true;
                totalExpired++;
            }
        }

        objects.set(id, {
            data,
            allocatedTick: currentTick,
            lastAccessedTick: currentTick,
            expired: false
        });
        totalAllocated++;
    }

    // --- STEP 4: DEFINE ACCESS ---
    function access(id) {
        if (typeof id !== 'string') {
            return "Not Found";
        }
        const obj = objects.get(id);
        if (!obj || obj.expired) {
            return "Not Found";
        }
        obj.lastAccessedTick = currentTick;
        return obj.data;
    }

    // --- STEP 5: DEFINE TICK ---
    function tick() {
        // Advance time first
        currentTick++;
        // Then auto-expire objects with age >= maxAge
        for (const [id, obj] of objects) {
            if (!obj.expired && (currentTick - obj.allocatedTick) >= config.maxAge) {
                obj.expired = true;
                totalExpired++;
            }
        }
    }

    // --- STEP 6: DEFINE RELEASE ---
    function release(id) {
        if (typeof id !== 'string') {
            return false;
        }
        const obj = objects.get(id);
        if (obj && !obj.expired) {
            obj.expired = true;
            totalExpired++;
            return true;
        }
        return false;
    }

    // --- STEP 7: DEFINE GETSTATS ---
    function getStats() {
        let active = 0;
        let oldestObject = null;
        let oldestTick = Infinity;

        for (const [id, obj] of objects) {
            if (!obj.expired) {
                active++;
                if (obj.allocatedTick < oldestTick) {
                    oldestTick = obj.allocatedTick;
                    oldestObject = id;
                }
            }
        }

        return {
            active,
            expired: totalExpired,
            totalAllocated,
            oldestObject
        };
    }

    // --- STEP 8: RETURN API ---
    return {
        allocate,
        access,
        tick,
        release,
        getStats
    };
}


// --- EXAMPLE USAGE ---
const tracker = createLifecycleTracker({ maxAge: 2, maxObjects: 3 });

tracker.allocate("obj1", { val: 1 });
tracker.allocate("obj2", { val: 2 });
tracker.tick();
tracker.tick();
tracker.allocate("obj3", { val: 3 });
console.log(tracker.access("obj1"));
console.log(tracker.access("obj3"));
console.log(tracker.getStats());

// --- Invalid Input ---
console.log(createLifecycleTracker("invalid"));