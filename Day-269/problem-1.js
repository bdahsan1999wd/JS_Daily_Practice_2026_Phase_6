// 🧩 PROBLEM–01: createTimerManager()

// Logic: This function simulates a browser-like timer manager. It supports setTimeout, setInterval, clearTimer, simulated time progression, active timer tracking, and execution reports.

function createTimerManager(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    // Config must be a valid object.
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    // maxTimers must be a positive integer.
    // tickUnit must be either "ms" or "s".
    if (
        !Number.isInteger(config.maxTimers) ||
        config.maxTimers <= 0 ||
        !["ms", "s"].includes(config.tickUnit)
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE TIMER STATE ---
    const timers = new Map();

    let currentTime = 0;
    let nextTimerId = 1;

    let totalCreated = 0;
    let totalFired = 0;
    let totalCleared = 0;


    // --- STEP 3: CREATE TIMEOUT TIMER ---
    // Registers a one-shot timer.
    function setTimeoutTimer(name, fn, delay) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof fn !== 'function' ||
            typeof delay !== 'number' ||
            !Number.isFinite(delay) ||
            delay < 0
        ) {
            return "Invalid Input";
        }

        if (timers.size >= config.maxTimers) {
            return "Invalid Input";
        }

        const timerId = nextTimerId++;

        timers.set(timerId, {
            timerId,
            name,
            fn,
            delay,
            nextFireAt: currentTime + delay,
            type: "timeout"
        });

        totalCreated++;

        return {
            timerId,
            name,
            delay,
            type: "timeout"
        };
    }


    // --- STEP 4: CREATE INTERVAL TIMER ---
    // Registers a repeating timer.
    function setIntervalTimer(name, fn, interval) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof fn !== 'function' ||
            typeof interval !== 'number' ||
            !Number.isFinite(interval) ||
            interval <= 0
        ) {
            return "Invalid Input";
        }

        if (timers.size >= config.maxTimers) {
            return "Invalid Input";
        }

        const timerId = nextTimerId++;

        timers.set(timerId, {
            timerId,
            name,
            fn,
            interval,
            nextFireAt: currentTime + interval,
            type: "interval"
        });

        totalCreated++;

        return {
            timerId,
            name,
            interval,
            type: "interval"
        };
    }


    // --- STEP 5: CLEAR TIMER ---
    // Removes an active timer.
    function clearTimer(timerId) {

        if (!Number.isInteger(timerId)) {
            return false;
        }

        if (!timers.has(timerId)) {
            return false;
        }

        timers.delete(timerId);
        totalCleared++;

        return true;
    }


    // --- STEP 6: ADVANCE SIMULATION TIME ---
    // Moves simulated time forward and fires every timer
    // whose scheduled execution time has been reached.
    function tick(units) {

        if (
            typeof units !== 'number' ||
            !Number.isFinite(units) ||
            units < 0
        ) {
            return "Invalid Input";
        }

        currentTime += units;

        const firedTimers = [];
        const executionLog = [];

        // Snapshot prevents mutation issues while executing callbacks.
        const activeTimers = [...timers.values()];

        for (const timer of activeTimers) {

            // A timer may have already been cleared during
            // another callback.
            if (!timers.has(timer.timerId)) {
                continue;
            }

            while (
                timers.has(timer.timerId) &&
                timer.nextFireAt <= currentTime
            ) {

                let result;

                try {
                    result = timer.fn();
                } catch (error) {
                    result = "Callback Error";
                }

                firedTimers.push(timer.name);

                executionLog.push({
                    name: timer.name,
                    result,
                    firedAt: timer.nextFireAt
                });

                totalFired++;

                // Timeout fires only once.
                if (timer.type === "timeout") {
                    timers.delete(timer.timerId);
                    break;
                }

                // Interval schedules its next execution.
                timer.nextFireAt += timer.interval;
            }
        }

        return {
            firedTimers,
            executionLog
        };
    }


    // --- STEP 7: GET ACTIVE TIMERS ---
    // Returns information about currently active timers.
    function getActiveTimers() {

        return [...timers.values()].map(timer => {

            const result = {
                timerId: timer.timerId,
                name: timer.name,
                type: timer.type
            };

            if (timer.type === "timeout") {
                result.delay = timer.delay;
            } else {
                result.interval = timer.interval;
            }

            return result;
        });
    }


    // --- STEP 8: GET PENDING COUNT ---
    function getPendingCount() {
        return timers.size;
    }


    // --- STEP 9: GET TIMER REPORT ---
    function getReport() {

        return {
            totalCreated,
            totalFired,
            totalCleared,
            activeCount: timers.size
        };
    }


    // --- STEP 10: RETURN TIMER API ---
    return {
        setTimeout: setTimeoutTimer,
        setInterval: setIntervalTimer,
        clearTimer,
        tick,
        getActiveTimers,
        getPendingCount,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const manager = createTimerManager({
    maxTimers: 10,
    tickUnit: "ms"
});


console.log(manager.setTimeout("greet", () => "Hello!", 100));
console.log(manager.setInterval("tick", () => "tick!", 50));

console.log(manager.tick(50));
console.log(manager.tick(50));

console.log(manager.getPendingCount());
console.log(manager.getReport());


// --- Invalid Input ---
console.log(
    createTimerManager({
        maxTimers: -5,
        tickUnit: "ms"
    })
);

console.log(createTimerManager("invalid"));