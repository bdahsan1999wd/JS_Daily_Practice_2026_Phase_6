// 🧩 PROBLEM–04: createTimePieceEngine()

// Logic: This function simulates both a stopwatch and a countdown timer. It supports start, pause, reset, laps, countdown control, completion callbacks, and a combined report.

function createTimePieceEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    if (
        !["ms", "s", "m"].includes(config.precision) ||
        !Number.isInteger(config.maxLaps) ||
        config.maxLaps <= 0 ||
        (
            config.onComplete !== null &&
            typeof config.onComplete !== 'function'
        )
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE STOPWATCH STATE ---
    let elapsed = 0;
    let stopwatchRunning = false;

    let laps = [];


    // --- STEP 3: INITIALIZE COUNTDOWN STATE ---
    let countdownDuration = 0;
    let countdownRemaining = 0;
    let countdownRunning = false;
    let countdownCompleted = false;


    // --- STEP 4: START STOPWATCH ---
    function start() {

        stopwatchRunning = true;

        return elapsed;
    }


    // --- STEP 5: PAUSE STOPWATCH ---
    function pause() {

        stopwatchRunning = false;

        return elapsed;
    }


    // --- STEP 6: RESET STOPWATCH ---
    function reset() {

        elapsed = 0;
        stopwatchRunning = false;
        laps = [];

        return elapsed;
    }


    // --- STEP 7: RECORD LAP ---
    function lap() {

        if (
            laps.length >= config.maxLaps
        ) {
            return "Invalid Input";
        }

        const previousTotal =
            laps.length === 0
                ? 0
                : laps[laps.length - 1].totalTime;

        const lapTime =
            elapsed - previousTotal;

        const record = {
            lapNumber: laps.length + 1,
            lapTime,
            totalTime: elapsed
        };

        laps.push(record);

        return record;
    }


    // --- STEP 8: GET LAPS ---
    function getLaps() {

        return laps.map(lapRecord => ({
            lapNumber: lapRecord.lapNumber,
            lapTime: lapRecord.lapTime
        }));
    }


    // --- STEP 9: GET ELAPSED TIME ---
    function getElapsed() {

        return elapsed;
    }


    // --- STEP 10: SET COUNTDOWN ---
    function setCountdown(seconds) {

        if (
            typeof seconds !== 'number' ||
            !Number.isFinite(seconds) ||
            seconds < 0
        ) {
            return "Invalid Input";
        }

        countdownDuration = seconds;
        countdownRemaining = seconds;
        countdownCompleted = seconds === 0;
        countdownRunning = false;

        return countdownRemaining;
    }


    // --- STEP 11: START COUNTDOWN ---
    function startCountdown() {

        if (countdownRemaining <= 0) {
            countdownCompleted = true;
            countdownRunning = false;

            return false;
        }

        countdownRunning = true;

        return true;
    }


    // --- STEP 12: PAUSE COUNTDOWN ---
    function pauseCountdown() {

        countdownRunning = false;

        return countdownRemaining;
    }


    // --- STEP 13: ADVANCE COUNTDOWN ---
    function tickCountdown(seconds) {

        if (
            typeof seconds !== 'number' ||
            !Number.isFinite(seconds) ||
            seconds < 0
        ) {
            return "Invalid Input";
        }

        // Stopwatch simulation also advances when running.
        if (stopwatchRunning) {
            elapsed += seconds;
        }

        if (countdownRunning) {

            countdownRemaining =
                Math.max(
                    0,
                    countdownRemaining - seconds
                );

            if (countdownRemaining === 0) {

                countdownCompleted = true;
                countdownRunning = false;

                if (typeof config.onComplete === 'function') {
                    config.onComplete();
                }
            }
        }

        return countdownRemaining;
    }


    // --- STEP 14: GET REMAINING COUNTDOWN ---
    function getRemaining() {

        return countdownRemaining;
    }


    // --- STEP 15: CHECK COUNTDOWN COMPLETION ---
    function isComplete() {

        return countdownCompleted;
    }


    // --- STEP 16: CREATE REPORT ---
    function getReport() {

        return {
            stopwatch: {
                elapsed,
                laps: getLaps()
            },

            countdown: {
                duration: countdownDuration,
                remaining: countdownRemaining,
                complete: countdownCompleted
            }
        };
    }


    // --- STEP 17: RETURN TIMEPIECE API ---
    return {
        start,
        pause,
        reset,
        lap,
        getLaps,
        getElapsed,
        setCountdown,
        startCountdown,
        pauseCountdown,
        tickCountdown,
        getRemaining,
        isComplete,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const timepiece = createTimePieceEngine({
    precision: "s",
    maxLaps: 5,
    onComplete: null
});

timepiece.start();

timepiece.tickCountdown(10);

console.log(timepiece.lap());

timepiece.tickCountdown(5);

console.log(timepiece.lap());

console.log(timepiece.pause());

timepiece.setCountdown(60);

timepiece.startCountdown();

timepiece.tickCountdown(25);

console.log(timepiece.getRemaining());

timepiece.tickCountdown(35);

console.log(timepiece.isComplete());

console.log(timepiece.getReport());


// --- Invalid Input ---
console.log(
    createTimePieceEngine({
        precision: "hours",
        maxLaps: 5,
        onComplete: null
    })
);

console.log(createTimePieceEngine("invalid"));