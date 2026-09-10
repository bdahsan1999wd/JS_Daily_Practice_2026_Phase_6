// 🧩 PROBLEM–01: predictExecutionOrder()

// Logic: This function simulates the JavaScript event loop execution order.
// It categorizes tasks by type (sync, microtask, animationFrame, macrotask)
// and returns them in the correct execution priority order:
// 1. sync (call stack)
// 2. microtask (Promise callbacks, queueMicrotask)
// 3. animationFrame (requestAnimationFrame)
// 4. macrotask (setTimeout, setInterval)


function predictExecutionOrder(tasks) {

    // --- STEP 1: VALIDATE INPUT ---
    // Check if tasks is an array.
    if (!Array.isArray(tasks)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH TASK ---
    // Each task must be an object with string name and valid type.
    const validTypes = ["sync", "microtask", "macrotask", "animationFrame"];

    for (const task of tasks) {
        if (
            typeof task !== 'object' ||
            task === null ||
            typeof task.name !== 'string' ||
            !validTypes.includes(task.type)
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: CATEGORIZE TASKS INTO PRIORITY QUEUES ---
    // Maintain separate arrays for each task type, preserving original order.
    const syncTasks = [];
    const microTasks = [];
    const animationFrameTasks = [];
    const macroTasks = [];

    for (const task of tasks) {
        switch (task.type) {
            case "sync":
                syncTasks.push(task.name);
                break;
            case "microtask":
                microTasks.push(task.name);
                break;
            case "animationFrame":
                animationFrameTasks.push(task.name);
                break;
            case "macrotask":
                macroTasks.push(task.name);
                break;
        }
    }

    // --- STEP 4: BUILD EXECUTION ORDER ---
    // Event loop execution order: sync → microtask → animationFrame → macrotask
    const executionOrder = [
        ...syncTasks,
        ...microTasks,
        ...animationFrameTasks,
        ...macroTasks
    ];

    // --- STEP 5: RETURN EXECUTION ORDER ---
    return executionOrder;
}


// --- EXAMPLE USAGE ---
console.log(predictExecutionOrder([
    { name: "script", type: "sync" },
    { name: "setTimeout_CB", type: "macrotask" },
    { name: "promise_CB", type: "microtask" },
    { name: "rAF_CB", type: "animationFrame" },
    { name: "scriptEnd", type: "sync" },
    { name: "queueMicrotask_CB", type: "microtask" }
]));


// --- Invalid Input ---
console.log(predictExecutionOrder("invalid"));