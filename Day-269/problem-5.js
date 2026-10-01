// 🧩 PROBLEM–05: createAnimationTimeline()

// Logic: This function simulates an animation timeline engine. It supports keyframes, easing functions, value interpolation, snapshots, play, seek, looping, and timeline reporting.

function createAnimationTimeline(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const validEasing = [
        "linear",
        "easeIn",
        "easeOut",
        "easeInOut"
    ];

    if (
        typeof config.duration !== 'number' ||
        !Number.isFinite(config.duration) ||
        config.duration <= 0 ||
        !validEasing.includes(config.easing) ||
        typeof config.loop !== 'boolean'
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE TIMELINE STATE ---
    const keyframes = new Map();

    let currentTime = 0;


    // --- STEP 3: CREATE EASING FUNCTION ---
    function applyEasing(t) {

        switch (config.easing) {

            case "linear":
                return t;

            case "easeIn":
                return t * t;

            case "easeOut":
                return t * (2 - t);

            case "easeInOut":
                return t < 0.5
                    ? 2 * t * t
                    : -1 + (4 - 2 * t) * t;
        }
    }


    // --- STEP 4: ADD KEYFRAME ---
    function addKeyframe(
        name,
        property,
        startValue,
        endValue,
        startTime,
        endTime
    ) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof property !== 'string' ||
            property.trim() === '' ||
            typeof startValue !== 'number' ||
            !Number.isFinite(startValue) ||
            typeof endValue !== 'number' ||
            !Number.isFinite(endValue) ||
            typeof startTime !== 'number' ||
            !Number.isFinite(startTime) ||
            typeof endTime !== 'number' ||
            !Number.isFinite(endTime) ||
            startTime < 0 ||
            endTime <= startTime ||
            endTime > config.duration
        ) {
            return "Invalid Input";
        }

        keyframes.set(name, {
            name,
            property,
            startValue,
            endValue,
            startTime,
            endTime
        });

        return true;
    }


    // --- STEP 5: REMOVE KEYFRAME ---
    function removeKeyframe(name) {

        if (typeof name !== 'string') {
            return false;
        }

        return keyframes.delete(name);
    }


    // --- STEP 6: GET KEYFRAME VALUE ---
    function getValue(name, time) {

        if (
            typeof name !== 'string' ||
            typeof time !== 'number' ||
            !Number.isFinite(time) ||
            time < 0
        ) {
            return "Invalid Input";
        }

        const keyframe = keyframes.get(name);

        if (!keyframe) {
            return "Invalid Input";
        }

        // Before keyframe starts.
        if (time <= keyframe.startTime) {
            return keyframe.startValue;
        }

        // After keyframe ends.
        if (time >= keyframe.endTime) {
            return keyframe.endValue;
        }

        // Calculate local progress between 0 and 1.
        const rawProgress =
            (
                time - keyframe.startTime
            ) /
            (
                keyframe.endTime -
                keyframe.startTime
            );

        const progress =
            applyEasing(rawProgress);

        const value =
            keyframe.startValue +
            (
                keyframe.endValue -
                keyframe.startValue
            ) * progress;

        return Number(value.toFixed(2));
    }


    // --- STEP 7: GET TIMELINE SNAPSHOT ---
    function getSnapshot(time) {

        if (
            typeof time !== 'number' ||
            !Number.isFinite(time) ||
            time < 0
        ) {
            return "Invalid Input";
        }

        const snapshot = {};

        for (const keyframe of keyframes.values()) {

            snapshot[keyframe.property] =
                getValue(keyframe.name, time);
        }

        return snapshot;
    }


    // --- STEP 8: PLAY TIMELINE ---
    function play(tickMs) {

        if (
            typeof tickMs !== 'number' ||
            !Number.isFinite(tickMs) ||
            tickMs < 0
        ) {
            return "Invalid Input";
        }

        currentTime += tickMs;

        // Handle looping timeline.
        if (config.loop) {

            currentTime =
                currentTime % config.duration;

        } else {

            currentTime =
                Math.min(
                    currentTime,
                    config.duration
                );
        }

        const progress =
            currentTime / config.duration;

        return {
            currentTime,
            progress: Number(progress.toFixed(2)),
            values: getSnapshot(currentTime),
            isComplete:
                !config.loop &&
                currentTime >= config.duration
        };
    }


    // --- STEP 9: SEEK TIMELINE ---
    function seek(timeMs) {

        if (
            typeof timeMs !== 'number' ||
            !Number.isFinite(timeMs) ||
            timeMs < 0
        ) {
            return "Invalid Input";
        }

        if (config.loop) {

            currentTime =
                timeMs % config.duration;

        } else {

            currentTime =
                Math.min(
                    timeMs,
                    config.duration
                );
        }

        return {
            currentTime,
            values: getSnapshot(currentTime)
        };
    }


    // --- STEP 10: GET ALL KEYFRAMES ---
    function getKeyframes() {

        return [...keyframes.values()].map(keyframe => ({
            name: keyframe.name,
            property: keyframe.property,
            startValue: keyframe.startValue,
            endValue: keyframe.endValue,
            startTime: keyframe.startTime,
            endTime: keyframe.endTime
        }));
    }


    // --- STEP 11: GET TIMELINE REPORT ---
    function getReport() {

        return {
            totalKeyframes: keyframes.size,
            duration: config.duration,
            easing: config.easing,
            loop: config.loop,
            currentTime
        };
    }


    // --- STEP 12: RETURN TIMELINE API ---
    return {
        addKeyframe,
        removeKeyframe,
        getValue,
        getSnapshot,
        play,
        seek,
        getKeyframes,
        getReport
    };
}



// --- EXAMPLE USAGE ---
const timeline = createAnimationTimeline({
    duration: 1000,
    easing: "easeOut",
    loop: false
});


timeline.addKeyframe(
    "opacity",
    "opacity",
    0,
    1,
    0,
    1000
);

timeline.addKeyframe(
    "translateX",
    "x",
    0,
    300,
    0,
    1000
);


console.log(timeline.getValue("opacity", 500));

console.log(timeline.getValue("translateX", 500));

console.log(timeline.getSnapshot(250));

console.log(timeline.play(500));

console.log(timeline.play(500));

console.log(timeline.getReport());


// --- Invalid Input ---
console.log(
    createAnimationTimeline({
        duration: 1000,
        easing: "bounce",
        loop: false
    })
);

console.log(createAnimationTimeline("invalid"));