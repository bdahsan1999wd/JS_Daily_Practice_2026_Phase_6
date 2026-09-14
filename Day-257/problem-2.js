// 🧩 PROBLEM–02: createAdvancedClosureSystem()

// Logic: This function creates an advanced closure system that combines
// function registration, execution with memoization, currying, and
// operation limiting. All state is private via closure.


function createAdvancedClosureSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.name !== 'string' ||
        typeof config.maxOperations !== 'number' ||
        typeof config.enableMemo !== 'boolean'
    ) {
        return "Invalid Input";
    }
    if (config.maxOperations <= 0) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    const functions = new Map(); // name -> fn
    const memoCache = new Map(); // key -> result
    let totalExecutions = 0;
    let cacheHits = 0;
    let operationsUsed = 0;

    // --- STEP 3: DEFINE REGISTER ---
    function register(fnName, fn) {
        if (typeof fnName !== 'string' || typeof fn !== 'function') {
            return "Invalid Input";
        }
        functions.set(fnName, fn);
    }

    // --- STEP 4: DEFINE EXECUTE ---
    function execute(fnName, ...args) {
        // Check operation limit
        if (operationsUsed >= config.maxOperations) {
            return "Operation Limit Reached";
        }

        const fn = functions.get(fnName);
        if (!fn) {
            return "Function Not Found";
        }

        operationsUsed++;
        totalExecutions++; // Count every execution attempt

        if (config.enableMemo) {
            const key = fnName + ":" + JSON.stringify(args);
            if (memoCache.has(key)) {
                cacheHits++;
                return memoCache.get(key);
            }
            const result = fn(...args);
            memoCache.set(key, result);
            return result;
        } else {
            return fn(...args);
        }
    }

    // --- STEP 5: DEFINE CURRY ---
    function curry(fnName) {
        const fn = functions.get(fnName);
        if (!fn) {
            return "Function Not Found";
        }

        const arity = fn.length;

        function curried(...args) {
            if (args.length >= arity) {
                return execute(fnName, ...args.slice(0, arity));
            }
            return function (...moreArgs) {
                return curried(...args, ...moreArgs);
            };
        }

        return curried;
    }

    // --- STEP 6: DEFINE GETSTATS ---
    function getStats() {
        return {
            totalExecutions,
            cacheHits,
            registeredFunctions: functions.size,
            remainingOps: config.maxOperations - operationsUsed
        };
    }

    // --- STEP 7: DEFINE RESET ---
    function reset() {
        memoCache.clear();
        totalExecutions = 0;
        cacheHits = 0;
        operationsUsed = 0;
    }

    // --- STEP 8: RETURN API ---
    return {
        register,
        execute,
        curry,
        getStats,
        reset
    };
}


// --- EXAMPLE USAGE ---
const system = createAdvancedClosureSystem({ name: "mathSystem", maxOperations: 5, enableMemo: true });

system.register("add", (a, b) => a + b);

console.log(system.execute("add", 2, 3));
console.log(system.execute("add", 2, 3));
console.log(system.execute("add", 4, 5));
console.log(system.execute("unknown", 1));
console.log(system.getStats());


// --- Invalid Input ---
console.log(createAdvancedClosureSystem("invalid"));