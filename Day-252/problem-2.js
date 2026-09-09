// 🧩 PROBLEM–02: createMemoizer()

// Logic: This function creates a memoized version of any pure function.
// It uses a closure to maintain a private cache that stores results
// of previous function calls. When the same arguments are passed again,
// the cached result is returned without re-executing the function.
// It also tracks cache hit and miss statistics.


function createMemoizer(fn) {

    // --- STEP 1: VALIDATE INPUT ---
    // Check if fn is a function.
    if (typeof fn !== 'function') {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE CACHE STATE ---
    // Use a Map for O(1) cache lookups. Keys are serialized arguments.
    const cache = new Map();
    // Track cache statistics
    let hits = 0;
    let misses = 0;

    // --- STEP 3: CREATE MEMOIZED FUNCTION ---
    // The memoized function captures fn, cache, hits, misses via closure.
    const memoizedFn = (...args) => {
        // Create a cache key from arguments
        // JSON.stringify handles most serializable arguments
        const key = JSON.stringify(args);

        // Check if result is cached
        if (cache.has(key)) {
            hits++;
            return cache.get(key);
        }

        // Cache miss: execute function and store result
        misses++;
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };

    // --- STEP 4: DEFINE GETCACHESTATS METHOD ---
    // Returns cache statistics including hits, misses, and number of cached keys.
    memoizedFn.getCacheStats = () => ({
        hits,
        misses,
        cachedKeys: cache.size
    });

    // --- STEP 5: DEFINE CLEARCACHE METHOD ---
    // Clears the cache and resets statistics.
    memoizedFn.clearCache = () => {
        cache.clear();
        hits = 0;
        misses = 0;
        return memoizedFn.getCacheStats();
    };

    // --- STEP 6: RETURN MEMOIZED FUNCTION WITH API ---
    return memoizedFn;
}


// --- EXAMPLE USAGE ---
const memoAdd = createMemoizer((a, b) => a + b);

console.log(memoAdd(2, 3));
console.log(memoAdd(2, 3));
console.log(memoAdd(4, 5));
console.log(memoAdd.getCacheStats());
console.log(memoAdd.clearCache());

// --- Invalid Input ---
console.log(createMemoizer("not a function"));