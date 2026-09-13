// 🧩 PROBLEM–05: createProfiler()

// Logic: This function creates a performance profiler that records
// function call metrics (execution time, memory usage) and generates
// reports with statistics, slow calls, memory-heavy calls, and a
// health summary. All data is private via closure.


function createProfiler(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.name !== 'string' ||
        typeof config.slowThreshold !== 'number' ||
        typeof config.memoryThreshold !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.slowThreshold < 0 || config.memoryThreshold < 0) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    const calls = []; // Array of { fnName, executionTime, memoryUsed }
    const { slowThreshold, memoryThreshold } = config;

    // --- STEP 3: DEFINE PROFILE ---
    function profile(fnName, executionTime, memoryUsed) {
        if (typeof fnName !== 'string' ||
            typeof executionTime !== 'number' ||
            typeof memoryUsed !== 'number' ||
            executionTime < 0 ||
            memoryUsed < 0) {
            return "Invalid Input";
        }
        calls.push({ fnName, executionTime, memoryUsed });
    }

    // --- STEP 4: DEFINE GETREPORT ---
    function getReport() {
        if (calls.length === 0) {
            return {
                totalCalls: 0,
                averageTime: 0,
                slowCalls: [],
                memoryHeavyCalls: [],
                fastestCall: null,
                slowestCall: null
            };
        }

        const totalCalls = calls.length;
        const totalTime = calls.reduce((sum, c) => sum + c.executionTime, 0);
        const averageTime = Math.round((totalTime / totalCalls) * 100) / 100;

        const slowCalls = calls
            .filter(c => c.executionTime > slowThreshold)
            .map(c => ({ fnName: c.fnName, executionTime: c.executionTime }));

        const memoryHeavyCalls = calls
            .filter(c => c.memoryUsed > memoryThreshold)
            .map(c => ({ fnName: c.fnName, memoryUsed: c.memoryUsed }));

        const sortedByTime = [...calls].sort((a, b) => a.executionTime - b.executionTime);
        const fastestCall = { fnName: sortedByTime[0].fnName, executionTime: sortedByTime[0].executionTime };
        const slowestCall = { fnName: sortedByTime[sortedByTime.length - 1].fnName, executionTime: sortedByTime[sortedByTime.length - 1].executionTime };

        return {
            totalCalls,
            averageTime,
            slowCalls,
            memoryHeavyCalls,
            fastestCall,
            slowestCall
        };
    }

    // --- STEP 5: DEFINE RESET ---
    function reset() {
        calls.length = 0;
    }

    // --- STEP 6: DEFINE GETSUMMARY ---
    function getSummary() {
        if (calls.length === 0) {
            return { status: "Healthy", issues: [] };
        }

        const slowCalls = calls.filter(c => c.executionTime > slowThreshold);
        const slowPercentage = (slowCalls.length / calls.length) * 100;

        const memoryHeavyCalls = calls.filter(c => c.memoryUsed > memoryThreshold);

        let status = "Healthy";
        const issues = [];

        if (slowPercentage > 60) {
            status = "Critical";
        } else if (slowPercentage > 30) {
            status = "Degraded";
        }

        if (slowPercentage > 0) {
            issues.push(`${slowPercentage.toFixed(2)}% calls exceeded slow threshold`);
        }
        if (memoryHeavyCalls.length > 0) {
            issues.push(`${memoryHeavyCalls.length} calls exceeded memory threshold`);
        }

        return { status, issues };
    }

    // --- STEP 7: RETURN API ---
    return {
        profile,
        getReport,
        reset,
        getSummary
    };
}


// --- EXAMPLE USAGE ---
const profiler = createProfiler({ name: "apiProfiler", slowThreshold: 100, memoryThreshold: 50 });

profiler.profile("fetchUser", 80, 30);
profiler.profile("parseData", 150, 70);
profiler.profile("saveDB", 200, 90);

console.log(profiler.getReport());
console.log(profiler.getSummary());

// --- Invalid Input ---
console.log(createProfiler("invalid"));