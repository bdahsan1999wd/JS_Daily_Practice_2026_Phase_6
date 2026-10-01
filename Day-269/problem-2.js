// 🧩 PROBLEM–02: createRateControlEngine()

// Logic: This function simulates debounce and throttle behavior. It tracks registered functions, simulated calls, execution timing, skipped calls, and function statistics.


function createRateControlEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config) ||
        typeof config.tickSize !== 'number' ||
        !Number.isFinite(config.tickSize) ||
        config.tickSize <= 0
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE ENGINE STATE ---
    const functions = new Map();


    // --- STEP 3: VALIDATE OPTIONS ---
    function normalizeBoolean(value, defaultValue) {
        return typeof value === "boolean"
            ? value
            : defaultValue;
    }


    // --- STEP 4: CREATE DEBOUNCE FUNCTION ---
    function debounce(name, fn, wait, options = {}) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof fn !== 'function' ||
            typeof wait !== 'number' ||
            !Number.isFinite(wait) ||
            wait <= 0 ||
            typeof options !== 'object' ||
            options === null ||
            Array.isArray(options)
        ) {
            return "Invalid Input";
        }

        const leading = normalizeBoolean(options.leading, false);
        const trailing = normalizeBoolean(options.trailing, true);

        const maxWait =
            options.maxWait === undefined
                ? Infinity
                : options.maxWait;

        if (
            typeof maxWait !== 'number' ||
            (!Number.isFinite(maxWait) && maxWait !== Infinity) ||
            maxWait <= 0
        ) {
            return "Invalid Input";
        }

        const state = {
            name,
            type: "debounced",
            fn,
            wait,
            leading,
            trailing,
            maxWait,
            calls: 0,
            executions: 0,
            skippedCalls: 0,
            lastExecuted: null,
            callHistory: [],
            executionHistory: [],
            lastCallTime: null,
            lastExecutionTime: null
        };

        functions.set(name, state);

        // Simulated current time is supplied by simulate().
        const debounced = function (...args) {

            state.calls++;

            const currentTime =
                state._currentSimulationTime ?? 0;

            state.callHistory.push({
                at: currentTime,
                args
            });

            return undefined;
        };

        debounced.cancel = function () {
            state.lastCallTime = null;
        };

        debounced.flush = function () {
            return undefined;
        };

        return debounced;
    }


    // --- STEP 5: CREATE THROTTLE FUNCTION ---
    function throttle(name, fn, limit, options = {}) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof fn !== 'function' ||
            typeof limit !== 'number' ||
            !Number.isFinite(limit) ||
            limit <= 0 ||
            typeof options !== 'object' ||
            options === null ||
            Array.isArray(options)
        ) {
            return "Invalid Input";
        }

        const leading = normalizeBoolean(options.leading, true);
        const trailing = normalizeBoolean(options.trailing, false);

        const state = {
            name,
            type: "throttled",
            fn,
            limit,
            leading,
            trailing,
            calls: 0,
            executions: 0,
            skippedCalls: 0,
            lastExecuted: null,
            callHistory: [],
            executionHistory: []
        };

        functions.set(name, state);

        const throttled = function (...args) {

            state.calls++;

            const currentTime =
                state._currentSimulationTime ?? 0;

            state.callHistory.push({
                at: currentTime,
                args
            });

            return undefined;
        };

        throttled.cancel = function () {
            state.lastExecuted = null;
        };

        return throttled;
    }


    // --- STEP 6: SIMULATE CALLS ---
    function simulate(fnName, callTimes) {

        if (
            typeof fnName !== 'string' ||
            !Array.isArray(callTimes) ||
            callTimes.some(
                time =>
                    typeof time !== 'number' ||
                    !Number.isFinite(time) ||
                    time < 0
            )
        ) {
            return "Invalid Input";
        }

        const state = functions.get(fnName);

        if (!state) {
            return "Invalid Input";
        }

        if (callTimes.some(
            (time, index) =>
                index > 0 && time < callTimes[index - 1]
        )) {
            return "Invalid Input";
        }

        state.calls = 0;
        state.executions = 0;
        state.skippedCalls = 0;
        state.lastExecuted = null;
        state.executionHistory = [];
        state.callHistory = [];

        // --- DEBOUNCE SIMULATION ---
        if (state.type === "debounced") {

            let lastCallTime = null;
            let lastExecutionTime = null;
            let pendingCall = null;

            for (let i = 0; i < callTimes.length; i++) {

                const time = callTimes[i];

                state.calls++;

                if (state.leading && lastExecutionTime === null) {

                    const result = state.fn(`call${i}`);

                    state.executions++;
                    state.lastExecuted = time;
                    lastExecutionTime = time;

                    state.executionHistory.push({
                        at: time,
                        result
                    });

                    pendingCall = null;
                    continue;
                }

                if (pendingCall !== null) {
                    const gap = time - lastCallTime;

                    if (gap >= state.wait) {

                        const executionAt =
                            lastCallTime + state.wait;

                        const result =
                            state.fn(`call${i - 1}`);

                        state.executions++;
                        state.lastExecuted = executionAt;
                        lastExecutionTime = executionAt;

                        state.executionHistory.push({
                            at: executionAt,
                            result
                        });

                        pendingCall = null;
                    }
                }

                if (pendingCall !== null) {
                    state.skippedCalls++;
                }

                pendingCall = i;
                lastCallTime = time;

                if (
                    lastExecutionTime !== null &&
                    time - lastExecutionTime >= state.maxWait
                ) {

                    const result =
                        state.fn(`call${i}`);

                    state.executions++;
                    state.lastExecuted = time;
                    lastExecutionTime = time;

                    state.executionHistory.push({
                        at: time,
                        result
                    });

                    pendingCall = null;
                }
            }

            // Execute trailing call after wait.
            if (
                pendingCall !== null &&
                state.trailing
            ) {

                const executionAt =
                    lastCallTime + state.wait;

                const result =
                    state.fn(`call${pendingCall}`);

                state.executions++;
                state.lastExecuted = executionAt;

                state.executionHistory.push({
                    at: executionAt,
                    result
                });
            }

            state.skippedCalls =
                Math.max(
                    0,
                    state.calls - state.executions
                );
        }


        // --- THROTTLE SIMULATION ---
        else {

            let lastExecutionTime = null;

            for (let i = 0; i < callTimes.length; i++) {

                const time = callTimes[i];

                state.calls++;

                const canExecute =
                    lastExecutionTime === null
                        ? state.leading
                        : time - lastExecutionTime >= state.limit;

                if (canExecute) {

                    const result =
                        state.fn(`call${i}`);

                    state.executions++;
                    state.lastExecuted = time;
                    lastExecutionTime = time;

                    state.executionHistory.push({
                        at: time,
                        result
                    });

                } else {

                    state.skippedCalls++;
                }
            }
        }

        return {
            calls: state.calls,
            executions: state.executionHistory,
            skipped: state.skippedCalls
        };
    }


    // --- STEP 7: GET FUNCTION STATISTICS ---
    function getStats(fnName) {

        const state = functions.get(fnName);

        if (!state) {
            return "Invalid Input";
        }

        return {
            totalCalls: state.calls,
            totalExecutions: state.executions,
            skippedCalls: state.skippedCalls,
            lastExecuted: state.lastExecuted
        };
    }


    // --- STEP 8: GET ENGINE REPORT ---
    function getReport() {

        let debounced = 0;
        let throttled = 0;

        for (const state of functions.values()) {

            if (state.type === "debounced") {
                debounced++;
            } else {
                throttled++;
            }
        }

        return {
            totalFunctions: functions.size,
            debounced,
            throttled
        };
    }


    // --- STEP 9: RETURN RATE CONTROL API ---
    return {
        debounce,
        throttle,
        simulate,
        getStats,
        getReport
    };
}



// --- EXAMPLE USAGE ---

const engine = createRateControlEngine({
    tickSize: 10
});


engine.debounce(
    "searchInput",
    q => "Searching: " + q,
    300,
    {
        leading: false,
        trailing: true
    }
);

console.log(
    engine.simulate(
        "searchInput",
        [0, 100, 200, 250, 600]
    )
);

engine.throttle(
    "scrollHandler",
    () => "Scroll!",
    200,
    {
        leading: true,
        trailing: false
    }
);

console.log(
    engine.simulate(
        "scrollHandler",
        [0, 50, 100, 200, 250, 400]
    )
);

console.log(engine.getStats("searchInput"));
console.log(engine.getReport());



// --- Invalid Input ---

console.log(
    createRateControlEngine({
        tickSize: -10
    })
);

console.log(createRateControlEngine("invalid"));