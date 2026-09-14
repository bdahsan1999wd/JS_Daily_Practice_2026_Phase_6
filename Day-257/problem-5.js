// 🧩 PROBLEM–05: createJSInternalsMaster()

// Logic: This function creates a master simulator that combines all
// JS internals concepts: hoisting, call stack, event loop, performance
// profiling, and stack overflow detection. All state is private.


function createJSInternalsMaster(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.name !== 'string' ||
        typeof config.slowThreshold !== 'number' ||
        typeof config.memoryLimit !== 'number' ||
        typeof config.maxCallDepth !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.slowThreshold < 0 || config.memoryLimit < 0 || config.maxCallDepth <= 0) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    const hoistingMap = {}; // name -> hoisted state
    const callStack = []; // function names
    const scheduledTasks = []; // { name, type }
    const performanceData = []; // { fnName, executionTime, memoryUsed }
    let totalMemory = 0;
    let stackOverflow = false;
    let lastExecutionLog = []; // Store last runCycle execution log

    const { slowThreshold, memoryLimit, maxCallDepth } = config;

    // --- STEP 3: DEFINE DECLARE ---
    function declare(keyword, name, value) {
        if (typeof keyword !== 'string' || typeof name !== 'string') {
            return "Invalid Input";
        }
        if (keyword === "var") {
            hoistingMap[name] = "undefined";
        } else if (keyword === "let" || keyword === "const") {
            hoistingMap[name] = "TDZ";
        }
    }

    // --- STEP 4: DEFINE CALL ---
    function call(fnName, executionTime, memoryUsed) {
        if (typeof fnName !== 'string' || typeof executionTime !== 'number' || typeof memoryUsed !== 'number') {
            return "Invalid Input";
        }
        if (callStack.length >= maxCallDepth) {
            stackOverflow = true;
            return "Stack Overflow";
        }
        callStack.push(fnName);
        performanceData.push({ fnName, executionTime, memoryUsed });
        totalMemory += memoryUsed;
    }

    // --- STEP 5: DEFINE RETURN ---
    function returnFn(fnName) {
        if (typeof fnName !== 'string') {
            return "Invalid Input";
        }
        if (callStack.length > 0 && callStack[callStack.length - 1] === fnName) {
            callStack.pop();
        }
    }

    // --- STEP 6: DEFINE SCHEDULE ---
    function schedule(name, type) {
        if (typeof name !== 'string' || !["microtask", "macrotask"].includes(type)) {
            return "Invalid Input";
        }
        scheduledTasks.push({ name, type });
    }

    // --- STEP 7: DEFINE RUNCYCLE ---
    function runCycle() {
        const executionLog = [];
        // Microtasks first
        const microtasks = scheduledTasks.filter(t => t.type === "microtask");
        const macrotasks = scheduledTasks.filter(t => t.type === "macrotask");

        for (const task of microtasks) {
            executionLog.push(task.name);
        }
        for (const task of macrotasks) {
            executionLog.push(task.name);
        }
        // Store for getFullReport
        lastExecutionLog = executionLog;
        // Clear scheduled tasks after running
        scheduledTasks.length = 0;
        return executionLog;
    }

    // --- STEP 8: DEFINE GETFULLREPORT ---
    function getFullReport() {
        // Performance issues: slow calls
        const performanceIssues = performanceData
            .filter(d => d.executionTime > slowThreshold)
            .map(d => ({ fnName: d.fnName, executionTime: d.executionTime, issue: "Slow Call" }));

        const memoryWarning = totalMemory > memoryLimit;

        return {
            hoistingMap: { ...hoistingMap },
            callStackState: [...callStack],
            executionLog: [...lastExecutionLog],
            performanceIssues,
            memoryWarning,
            stackOverflow
        };
    }

    // --- STEP 9: RETURN MASTER API ---
    return {
        declare,
        call,
        return: returnFn,
        schedule,
        runCycle,
        getFullReport
    };
}


// --- EXAMPLE USAGE ---
const master = createJSInternalsMaster({ name: "jsEngine", slowThreshold: 100, memoryLimit: 300, maxCallDepth: 3 });

master.declare("var", "x", 10);
master.declare("let", "y", 20);
master.call("main", 50, 100);
master.call("fetchData", 150, 120);
master.call("parseJSON", 80, 90);
master.schedule("promise_CB", "microtask");
master.schedule("timeout_CB", "macrotask");
master.return("parseJSON");
master.return("fetchData");
master.runCycle();
console.log(master.getFullReport());


// --- Invalid Input ---
console.log(createJSInternalsMaster("invalid"));