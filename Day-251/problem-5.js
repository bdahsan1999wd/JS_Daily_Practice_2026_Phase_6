// 🧩 PROBLEM–05: scheduleTaskQueue()

// Logic: This function simulates JavaScript's event loop task queue
// execution order. It categorizes tasks into sync, microtask, and
// macrotask queues, then returns the execution order following
// the event loop specification: sync → microtasks → macrotasks.


function scheduleTaskQueue(tasks) {

    // --- STEP 1: VALIDATE INPUT ---
    // Check if tasks is an array.
    if (!Array.isArray(tasks)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH TASK ---
    // Each task must be an object with string name and valid type.
    const validTypes = ["sync", "microtask", "macrotask"];

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

    // --- STEP 3: CATEGORIZE TASKS INTO QUEUES ---
    // Maintain three separate arrays for each task type,
    // preserving the original order within each category.
    const syncTasks = [];
    const microTasks = [];
    const macroTasks = [];

    for (const task of tasks) {
        switch (task.type) {
            case "sync":
                syncTasks.push(task.name);
                break;
            case "microtask":
                microTasks.push(task.name);
                break;
            case "macrotask":
                macroTasks.push(task.name);
                break;
        }
    }

    // --- STEP 4: BUILD EXECUTION ORDER ---
    // Event loop execution order:
    // 1. All sync tasks (in order of appearance)
    // 2. All microtask tasks (in order of appearance)
    // 3. All macrotask tasks (in order of appearance)
    const executionOrder = [
        ...syncTasks,
        ...microTasks,
        ...macroTasks
    ];

    // --- STEP 5: RETURN EXECUTION ORDER ---
    return executionOrder;
}


// --- EXAMPLE USAGE ---
console.log(scheduleTaskQueue([
    { name: "scriptStart", type: "sync" },
    { name: "setTimeout_CB", type: "macrotask" },
    { name: "promise_CB", type: "microtask" },
    { name: "scriptEnd", type: "sync" },
    { name: "queueMicrotask_CB", type: "microtask" }
]));


// --- Invalid Input ---
console.log(scheduleTaskQueue("invalid"));
console.log(scheduleTaskQueue([{ name: 123, type: "sync" }]));