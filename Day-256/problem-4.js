// 🧩 PROBLEM–04: createLRUCache()

// Logic: This function creates an LRU (Least Recently Used) cache with
// a fixed capacity. Every get and set updates recency. When capacity
// is exceeded, the least recently used item is evicted. All state is
// private via closure.


function createLRUCache(capacity) {

    // --- STEP 1: VALIDATE CAPACITY ---
    if (typeof capacity !== 'number' || capacity < 1 || !Number.isInteger(capacity)) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    // Use a Map for O(1) access, but we need order tracking
    // We'll use an array to track order (most recent at end)
    const cache = new Map(); // key -> value
    const order = []; // keys from least recent to most recent
    let hits = 0;
    let misses = 0;
    let evictions = 0;

    // --- STEP 3: HELPER - UPDATE RECENCY ---
    function updateRecency(key) {
        // Remove from current position
        const idx = order.indexOf(key);
        if (idx !== -1) {
            order.splice(idx, 1);
        }
        // Add to end (most recent)
        order.push(key);
    }

    // --- STEP 4: DEFINE SET ---
    function set(key, value) {
        if (cache.has(key)) {
            // Update existing
            cache.set(key, value);
            updateRecency(key);
        } else {
            // Insert new
            if (cache.size >= capacity) {
                // Evict LRU (first in order array)
                const lruKey = order.shift();
                cache.delete(lruKey);
                evictions++;
            }
            cache.set(key, value);
            order.push(key);
        }
    }

    // --- STEP 5: DEFINE GET ---
    function get(key) {
        if (cache.has(key)) {
            hits++;
            updateRecency(key);
            return cache.get(key);
        } else {
            misses++;
            return "Cache Miss";
        }
    }

    // --- STEP 6: DEFINE PEEK ---
    function peek(key) {
        if (cache.has(key)) {
            return cache.get(key);
        } else {
            return "Cache Miss";
        }
    }

    // --- STEP 7: DEFINE DELETE ---
    function deleteKey(key) {
        if (cache.has(key)) {
            cache.delete(key);
            const idx = order.indexOf(key);
            if (idx !== -1) order.splice(idx, 1);
            return true;
        }
        return false;
    }

    // --- STEP 8: DEFINE GETSTATS ---
    function getStats() {
        return {
            size: cache.size,
            capacity,
            hits,
            misses,
            evictions
        };
    }

    // --- STEP 9: DEFINE GETORDER ---
    function getOrder() {
        // Return from most recent to least recent
        return [...order].reverse();
    }

    // --- STEP 10: RETURN API ---
    return {
        set,
        get,
        peek,
        delete: deleteKey,
        getStats,
        getOrder
    };
}


// --- EXAMPLE USAGE ---
const cache = createLRUCache(3);

cache.set("a", 1);
cache.set("b", 2);
cache.set("c", 3);
console.log(cache.get("a"));
cache.set("d", 4);
console.log(cache.get("b"));
console.log(cache.getOrder());
console.log(cache.getStats());


// --- Invalid Input ---
console.log(createLRUCache(0));