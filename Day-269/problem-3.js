// 🧩 PROBLEM–03: createAnimationScheduler()

// Logic: This function simulates requestAnimationFrame. It manages animation callbacks, frame cancellation, fixed-duration animations, timestamps, delta time, FPS statistics, and dropped-frame detection.


function createAnimationScheduler(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    if (
        typeof config.targetFPS !== 'number' ||
        !Number.isFinite(config.targetFPS) ||
        config.targetFPS <= 0 ||
        typeof config.maxFrames !== 'number' ||
        !Number.isInteger(config.maxFrames) ||
        config.maxFrames <= 0 ||
        typeof config.autoStop !== 'boolean'
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE SCHEDULER STATE ---
    const callbacks = new Map();

    let nextFrameId = 1;
    let currentTimestamp = 0;
    let totalFrames = 0;

    const frameDuration = 1000 / config.targetFPS;

    const deltaTimes = [];
    const fpsValues = [];

    let droppedFrames = 0;


    // --- STEP 3: REGISTER FRAME CALLBACK ---
    function requestFrame(name, fn) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof fn !== 'function'
        ) {
            return "Invalid Input";
        }

        const frameId = nextFrameId++;

        callbacks.set(frameId, {
            frameId,
            name,
            fn,
            remainingFrames: null
        });

        return frameId;
    }


    // --- STEP 4: CANCEL FRAME ---
    function cancelFrame(frameId) {

        if (!Number.isInteger(frameId)) {
            return false;
        }

        return callbacks.delete(frameId);
    }


    // --- STEP 5: SCHEDULE FIXED-DURATION ANIMATION ---
    function schedule(name, fn, durationFrames) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof fn !== 'function' ||
            !Number.isInteger(durationFrames) ||
            durationFrames <= 0
        ) {
            return "Invalid Input";
        }

        const frameId = requestFrame(name, fn);

        if (typeof frameId !== 'number') {
            return frameId;
        }

        callbacks.get(frameId).remainingFrames = durationFrames;

        return frameId;
    }


    // --- STEP 6: RUN ANIMATION FRAMES ---
    function runFrames(count) {

        if (
            !Number.isInteger(count) ||
            count < 0
        ) {
            return "Invalid Input";
        }

        const availableFrames =
            config.maxFrames - totalFrames;

        const framesToRun =
            Math.min(count, availableFrames);

        const executionLog = [];

        for (let i = 0; i < framesToRun; i++) {

            totalFrames++;

            currentTimestamp =
                Number(
                    (
                        totalFrames * frameDuration
                    ).toFixed(2)
                );

            const deltaTime =
                Number(
                    (
                        currentTimestamp -
                        (
                            totalFrames === 1
                                ? 0
                                : currentTimestamp - frameDuration
                        )
                    ).toFixed(2)
                );

            deltaTimes.push(deltaTime);

            const currentFPS =
                deltaTime > 0
                    ? 1000 / deltaTime
                    : config.targetFPS;

            fpsValues.push(currentFPS);

            if (
                deltaTime >
                frameDuration * 1.5
            ) {
                droppedFrames++;
            }

            const frameCallbacks = [
                ...callbacks.values()
            ];

            const executedNames = [];

            for (const callback of frameCallbacks) {

                if (!callbacks.has(callback.frameId)) {
                    continue;
                }

                try {
                    callback.fn(
                        currentTimestamp,
                        deltaTime
                    );
                } catch (error) {
                    // Ignore callback errors in simulation.
                }

                executedNames.push(callback.name);

                if (
                    callback.remainingFrames !== null
                ) {
                    callback.remainingFrames--;

                    if (
                        callback.remainingFrames <= 0
                    ) {
                        callbacks.delete(
                            callback.frameId
                        );
                    }
                }
            }

            executionLog.push({
                frame: totalFrames,
                timestamp: currentTimestamp,
                callbacks: executedNames
            });

            if (
                config.autoStop &&
                callbacks.size === 0
            ) {
                break;
            }
        }

        return {
            framesRun: framesToRun,
            executionLog,
            fps: config.targetFPS
        };
    }


    // --- STEP 7: GET ACTIVE FRAME CALLBACKS ---
    function getActiveFrames() {

        return [...callbacks.values()]
            .map(callback => callback.name);
    }


    // --- STEP 8: GET FRAME STATISTICS ---
    function getFrameStats() {

        const averageDelta =
            deltaTimes.length === 0
                ? 0
                : deltaTimes.reduce(
                    (sum, value) => sum + value,
                    0
                ) / deltaTimes.length;

        const roundedAverage =
            Number(averageDelta.toFixed(2));

        const minFPS =
            fpsValues.length === 0
                ? 0
                : Number(
                    Math.min(...fpsValues)
                        .toFixed(2)
                );

        const maxFPS =
            fpsValues.length === 0
                ? 0
                : Number(
                    Math.max(...fpsValues)
                        .toFixed(2)
                );

        return {
            totalFrames,
            avgDeltaTime: roundedAverage,
            minFPS,
            maxFPS,
            droppedFrames
        };
    }


    // --- STEP 9: RETURN SCHEDULER API ---
    return {
        requestFrame,
        cancelFrame,
        runFrames,
        schedule,
        getActiveFrames,
        getFrameStats
    };
}


// --- EXAMPLE USAGE ---

const scheduler = createAnimationScheduler({
    targetFPS: 60,
    maxFrames: 1000,
    autoStop: true
});

scheduler.requestFrame(
    "moveBox",
    (ts, dt) => ({
        x: dt * 0.1,
        timestamp: ts
    })
);

scheduler.schedule(
    "fadeIn",
    (ts, dt) => ({
        opacity: dt * 0.01
    }),
    3
);


console.log(scheduler.runFrames(5));
console.log(scheduler.getActiveFrames());
console.log(scheduler.getFrameStats());


// --- Invalid Input ---
console.log(
    createAnimationScheduler({
        targetFPS: 0,
        maxFrames: 100,
        autoStop: true
    })
);

console.log(createAnimationScheduler("invalid"));