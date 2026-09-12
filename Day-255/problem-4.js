// 🧩 PROBLEM–04: createFunctionGuard()

// Logic: This function creates a guarded version of a function with
// various execution constraints: once, before, after, maxCalls.
// All counters are kept private via closure. The returned object
// provides execute, getStats, and reset methods.


function createFunctionGuard(fn, options) {

    // --- STEP 1: VALIDATE INPUT ---
    if (typeof fn !== 'function') {
        return "Invalid Input";
    }
    if (!options || typeof options !== 'object' || Array.isArray(options)) {
        return "Invalid Input";
    }

    const { once, before, after, maxCalls } = options;

    // Validate option types
    if (once !== undefined && typeof once !== 'boolean') return "Invalid Input";
    if (before !== undefined && (typeof before !== 'number' || before < 0)) return "Invalid Input";
    if (after !== undefined && (typeof after !== 'number' || after < 0)) return "Invalid Input";
    if (maxCalls !== undefined && (typeof maxCalls !== 'number' || maxCalls < 0)) return "Invalid Input";

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    let totalAttempts = 0;
    let successfulCalls = 0;
    let blockedCalls = 0;
    let cachedResult = null;
    let hasExecutedOnce = false;

    // --- STEP 3: DEFINE EXECUTE ---
    function execute(...args) {
        totalAttempts++;

        // Check maxCalls limit
        if (maxCalls !== undefined && successfulCalls >= maxCalls) {
            blockedCalls++;
            return "Blocked";
        }

        // Check once option
        if (once && hasExecutedOnce) {
            blockedCalls++;
            return cachedResult;
        }

        // Check before option (block before N attempts)
        if (before !== undefined && totalAttempts <= before) {
            blockedCalls++;
            return "Blocked";
        }

        // Check after option (allow only after N attempts)
        if (after !== undefined && totalAttempts <= after) {
            blockedCalls++;
            return "Blocked";
        }

        // Execute the function
        const result = fn(...args);
        successfulCalls++;

        // Cache result if once is true
        if (once) {
            cachedResult = result;
            hasExecutedOnce = true;
        }

        return result;
    }

    // --- STEP 4: DEFINE GETSTATS ---
    function getStats() {
        return {
            totalAttempts,
            successfulCalls,
            blockedCalls
        };
    }

    // --- STEP 5: DEFINE RESET ---
    function reset() {
        totalAttempts = 0;
        successfulCalls = 0;
        blockedCalls = 0;
        // Keep cachedResult and hasExecutedOnce for once option
        // (per requirements: reset resets counters but keeps options)
    }

    // --- STEP 6: RETURN GUARDED API ---
    return {
        execute,
        getStats,
        reset
    };
}


// --- EXAMPLE USAGE ---
const guard = createFunctionGuard(x => x * 2, { once: true });
console.log(guard.execute(5));
console.log(guard.execute(8));
console.log(guard.execute(3));
console.log(guard.getStats());


const guard2 = createFunctionGuard(x => x + 1, { after: 2, maxCalls: 3 });
console.log(guard2.execute(10));
console.log(guard2.execute(10));
console.log(guard2.execute(10));
console.log(guard2.execute(10));
console.log(guard2.execute(10));
console.log(guard2.execute(10));


// --- Invalid Input ---
console.log(createFunctionGuard("not a function", {}));