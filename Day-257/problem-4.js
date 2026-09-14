// 🧩 PROBLEM–04: createAsyncExecutionEngine()

// Logic: This function creates an async execution engine that simulates
// the JavaScript event loop with separate queues for sync, microtask,
// and macrotask tasks. It executes them in correct order and respects
// a maximum macrotask limit per cycle.


function createAsyncExecutionEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.name !== 'string' ||
        typeof config.maxMacrotasks !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.maxMacrotasks < 0) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE QUEUES ---
    const syncQueue = [];
    const microtaskQueue = [];
    const macrotaskQueue = [];

    // --- STEP 3: DEFINE ADDSYNC ---
    function addSync(name, fn) {
        if (typeof name !== 'string' || typeof fn !== 'function') {
            return "Invalid Input";
        }
        syncQueue.push({ name, fn });
    }

    // --- STEP 4: DEFINE ADDMICROTASK ---
    function addMicrotask(name, fn) {
        if (typeof name !== 'string' || typeof fn !== 'function') {
            return "Invalid Input";
        }
        microtaskQueue.push({ name, fn });
    }

    // --- STEP 5: DEFINE ADDMACROTASK ---
    function addMacrotask(name, fn) {
        if (typeof name !== 'string' || typeof fn !== 'function') {
            return "Invalid Input";
        }
        macrotaskQueue.push({ name, fn });
    }

    // --- STEP 6: DEFINE RUN ---
    function run() {
        const executionLog = [];
        const results = {};
        const blockedTasks = [];

        // 1. Execute all sync tasks
        for (const task of syncQueue) {
            results[task.name] = task.fn();
            executionLog.push(task.name);
        }

        // 2. Execute all microtasks
        for (const task of microtaskQueue) {
            results[task.name] = task.fn();
            executionLog.push(task.name);
        }

        // 3. Execute macrotasks up to limit
        for (let i = 0; i < macrotaskQueue.length; i++) {
            const task = macrotaskQueue[i];
            if (i < config.maxMacrotasks) {
                results[task.name] = task.fn();
                executionLog.push(task.name);
            } else {
                blockedTasks.push(task.name);
            }
        }

        return {
            executionLog,
            results,
            blockedTasks
        };
    }

    // --- STEP 7: DEFINE GETQUEUESTATE ---
    function getQueueState() {
        return {
            syncQueue: syncQueue.map(t => t.name),
            microtaskQueue: microtaskQueue.map(t => t.name),
            macrotaskQueue: macrotaskQueue.map(t => t.name)
        };
    }

    // --- STEP 8: DEFINE RESET ---
    function reset() {
        syncQueue.length = 0;
        microtaskQueue.length = 0;
        macrotaskQueue.length = 0;
    }

    // --- STEP 9: RETURN API ---
    return {
        addSync,
        addMicrotask,
        addMacrotask,
        run,
        getQueueState,
        reset
    };
}


// --- EXAMPLE USAGE ---
const engine = createAsyncExecutionEngine({ name: "loopEngine", maxMacrotasks: 2 });
engine.addSync("main", () => "mainDone");
engine.addMacrotask("timeout1", () => "t1Done");
engine.addMicrotask("promise1", () => "p1Done");
engine.addMacrotask("timeout2", () => "t2Done");
engine.addMacrotask("timeout3", () => "t3Done");
console.log(engine.run());


// --- Invalid Input ---
console.log(createAsyncExecutionEngine("invalid"));