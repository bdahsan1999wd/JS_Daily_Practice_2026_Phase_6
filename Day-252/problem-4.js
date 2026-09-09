// 🧩 PROBLEM–04: createRateLimiter()

// Logic: This function creates a rate limiter that tracks call attempts
// within a simulated time window. All counters (total calls, allowed,
// blocked) are kept private via closure. The limiter enforces a maximum
// number of calls per window and returns appropriate status objects.

function createRateLimiter(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    // Check if config exists, is a plain object, and has required numeric properties.
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.maxCalls !== 'number' ||
        typeof config.windowSize !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE LOGICAL CONSTRAINTS ---
    // maxCalls and windowSize must be positive numbers.
    if (config.maxCalls <= 0 || config.windowSize <= 0) {
        return "Invalid Input";
    }

    // --- STEP 3: INITIALIZE PRIVATE STATE ---
    // Track call counts and statistics privately.
    let callsInWindow = 0;
    let totalCalls = 0;
    let blockedCalls = 0;
    let allowedCalls = 0;

    // --- STEP 4: DEFINE CALL METHOD ---
    // Registers a call attempt. Increments total calls.
    // If within limit, allows and returns remaining calls.
    // If limit exceeded, blocks and returns remaining as 0.
    const call = (fnName) => {
        totalCalls++;
        callsInWindow++;

        if (callsInWindow <= config.maxCalls) {
            allowedCalls++;
            return {
                allowed: true,
                remaining: config.maxCalls - callsInWindow
            };
        } else {
            blockedCalls++;
            return {
                allowed: false,
                remaining: 0
            };
        }
    };

    // --- STEP 5: DEFINE GETSTATS METHOD ---
    // Returns current statistics: total calls, blocked, allowed.
    const getStats = () => ({
        totalCalls,
        blockedCalls,
        allowedCalls
    });

    // --- STEP 6: DEFINE RESET METHOD ---
    // Resets all counters to zero. Returns the reset stats.
    const reset = () => {
        callsInWindow = 0;
        totalCalls = 0;
        blockedCalls = 0;
        allowedCalls = 0;
        return getStats();
    };

    // --- STEP 7: RETURN RATE LIMITER API ---
    return {
        call,
        getStats,
        reset
    };
}

// --- EXAMPLE USAGE ---
const limiter = createRateLimiter({ maxCalls: 3, windowSize: 10 });

console.log(limiter.call("fetchUser"));
console.log(limiter.call("fetchUser"));
console.log(limiter.call("fetchUser"));
console.log(limiter.call("fetchUser"));
console.log(limiter.getStats());
console.log(limiter.reset());

// --- Invalid Input ---
console.log(createRateLimiter("invalid"));