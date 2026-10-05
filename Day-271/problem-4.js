// 🧩 PROBLEM–04: createBrowserPerformanceMonitor()

// Logic: This function records virtual browser performance metrics.

// It detects:
// 1. Threshold violations
// 2. Increasing trends
// 3. Potential memory/listener/storage leaks
// 4. Long-running tasks
// 5. Performance budget status

function createBrowserPerformanceMonitor(config) {
    // --- STEP 1: VALIDATE CONFIG ---

    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        sampleInterval,
        maxSamples,
        thresholds
    } = config;

    if (
        typeof sampleInterval !== "number" ||
        !Number.isFinite(sampleInterval) ||
        sampleInterval <= 0
    ) {
        return "Invalid Input";
    }

    if (
        typeof maxSamples !== "number" ||
        !Number.isInteger(maxSamples) ||
        maxSamples <= 0
    ) {
        return "Invalid Input";
    }

    if (
        typeof thresholds !== "object" ||
        thresholds === null ||
        Array.isArray(thresholds)
    ) {
        return "Invalid Input";
    }

    const thresholdKeys = [
        "domNodes",
        "eventListeners",
        "storageUsed",
        "timerCount",
        "longTaskMs"
    ];

    // Validate every threshold.
    for (const key of thresholdKeys) {
        if (
            typeof thresholds[key] !== "number" ||
            !Number.isFinite(thresholds[key]) ||
            thresholds[key] < 0
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 2: INTERNAL STATE ---

    const samples = [];

    // --- STEP 3: VALIDATE METRICS ---

    function validateMetrics(metrics) {
        if (
            typeof metrics !== "object" ||
            metrics === null ||
            Array.isArray(metrics)
        ) {
            return false;
        }

        const numericFields = [
            "domNodes",
            "eventListeners",
            "storageUsedKB",
            "activeTimers"
        ];

        for (const field of numericFields) {
            if (
                typeof metrics[field] !== "number" ||
                !Number.isFinite(metrics[field]) ||
                metrics[field] < 0
            ) {
                return false;
            }
        }

        if (!Array.isArray(metrics.taskDurations)) {
            return false;
        }

        if (
            !metrics.taskDurations.every(
                duration =>
                    typeof duration === "number" &&
                    Number.isFinite(duration) &&
                    duration >= 0
            )
        ) {
            return false;
        }

        return true;
    }

    // --- STEP 4: RECORD SAMPLE ---

    function recordSample(metrics) {
        if (!validateMetrics(metrics)) {
            return "Invalid Input";
        }

        const sample = {
            timestamp: samples.length * sampleInterval,
            domNodes: metrics.domNodes,
            eventListeners: metrics.eventListeners,
            storageUsedKB: metrics.storageUsedKB,
            activeTimers: metrics.activeTimers,
            taskDurations: [...metrics.taskDurations]
        };

        samples.push(sample);

        // Keep only the latest maxSamples.
        if (samples.length > maxSamples) {
            samples.shift();
        }

        return sample;
    }

    // --- STEP 5: TREND ANALYSIS ---

    function getTrend(field) {
        if (samples.length < 2) {
            return "insufficient-data";
        }

        let increasing = true;
        let decreasing = true;

        for (let i = 1; i < samples.length; i++) {
            const previous = samples[i - 1][field];
            const current = samples[i][field];

            if (current <= previous) {
                increasing = false;
            }

            if (current >= previous) {
                decreasing = false;
            }
        }

        if (increasing) {
            return "increasing";
        }

        if (decreasing) {
            return "decreasing";
        }

        return "stable";
    }

    // --- STEP 6: ANALYZE PERFORMANCE ---

    function analyze() {
        const warnings = [];
        const criticalIssues = [];

        for (const sample of samples) {
            if (sample.domNodes > thresholds.domNodes) {
                warnings.push(
                    `DOM nodes exceeded threshold (${sample.domNodes} > ${thresholds.domNodes})`
                );
            }

            if (
                sample.eventListeners >
                thresholds.eventListeners
            ) {
                warnings.push(
                    `Event listeners exceeded threshold (${sample.eventListeners} > ${thresholds.eventListeners})`
                );
            }

            if (
                sample.storageUsedKB >
                thresholds.storageUsed
            ) {
                warnings.push(
                    `Storage exceeded threshold (${sample.storageUsedKB}KB > ${thresholds.storageUsed}KB)`
                );
            }

            if (
                sample.activeTimers >
                thresholds.timerCount
            ) {
                warnings.push(
                    `Active timers exceeded threshold (${sample.activeTimers} > ${thresholds.timerCount})`
                );
            }

            const longTasks =
                sample.taskDurations.filter(
                    duration =>
                        duration > thresholds.longTaskMs
                );

            if (longTasks.length > 0) {
                warnings.push(
                    `Long tasks detected: ${longTasks.join(", ")}ms`
                );
            }
        }

        // Remove duplicate warning messages.
        const uniqueWarnings = [...new Set(warnings)];

        const trends = {
            domNodes: getTrend("domNodes"),
            eventListeners: getTrend("eventListeners"),
            storageUsedKB: getTrend("storageUsedKB")
        };

        const recommendations = [];

        if (trends.domNodes === "increasing") {
            recommendations.push(
                "Inspect DOM node cleanup"
            );
        }

        if (trends.eventListeners === "increasing") {
            recommendations.push(
                "Audit event listener cleanup"
            );
        }

        if (trends.storageUsedKB === "increasing") {
            recommendations.push(
                "Monitor storage growth"
            );
        }

        if (uniqueWarnings.some(
            warning => warning.includes("Long tasks")
        )) {
            recommendations.push(
                "Optimize long-running tasks"
            );
        }

        return {
            warnings: uniqueWarnings,
            criticalIssues,
            trends,
            recommendations
        };
    }

    // --- STEP 7: TIMELINE ---

    function getTimeline() {
        return samples.map(sample => {
            const violations = [];

            if (sample.domNodes > thresholds.domNodes) {
                violations.push("domNodes");
            }

            if (
                sample.eventListeners >
                thresholds.eventListeners
            ) {
                violations.push("eventListeners");
            }

            if (
                sample.storageUsedKB >
                thresholds.storageUsed
            ) {
                violations.push("storageUsed");
            }

            if (
                sample.activeTimers >
                thresholds.timerCount
            ) {
                violations.push("timerCount");
            }

            if (
                sample.taskDurations.some(
                    duration =>
                        duration > thresholds.longTaskMs
                )
            ) {
                violations.push("longTask");
            }

            return {
                ...sample,
                violations
            };
        });
    }

    // --- STEP 8: LEAK DETECTION ---

    function detectLeaks() {
        const leaks = [];

        if (samples.length < 3) {
            return leaks;
        }

        const domIncreasing =
            getTrend("domNodes") === "increasing";

        const listenersIncreasing =
            getTrend("eventListeners") === "increasing";

        const storageIncreasing =
            getTrend("storageUsedKB") === "increasing";

        if (domIncreasing) {
            leaks.push(
                `Potential DOM Leak: nodes grew ${samples
                    .map(sample => sample.domNodes)
                    .join("→")}`
            );
        }

        if (listenersIncreasing) {
            leaks.push(
                `Potential Listener Leak: listeners grew ${samples
                    .map(sample => sample.eventListeners)
                    .join("→")}`
            );
        }

        if (storageIncreasing) {
            leaks.push(
                `Storage Growth Detected: ${samples
                    .map(sample => sample.storageUsedKB)
                    .join("→")} KB`
            );
        }

        return leaks;
    }

    // --- STEP 9: PERFORMANCE BUDGET ---

    function getBudget() {
        const latest = samples[samples.length - 1];

        if (!latest) {
            return {
                status: "No Data",
                metrics: {}
            };
        }

        return {
            status:
                latest.domNodes <= thresholds.domNodes &&
                    latest.eventListeners <= thresholds.eventListeners &&
                    latest.storageUsedKB <= thresholds.storageUsed &&
                    latest.activeTimers <= thresholds.timerCount
                    ? "Within Budget"
                    : "Exceeded",
            metrics: {
                domNodes: {
                    value: latest.domNodes,
                    limit: thresholds.domNodes
                },
                eventListeners: {
                    value: latest.eventListeners,
                    limit: thresholds.eventListeners
                },
                storageUsedKB: {
                    value: latest.storageUsedKB,
                    limit: thresholds.storageUsed
                },
                activeTimers: {
                    value: latest.activeTimers,
                    limit: thresholds.timerCount
                }
            }
        };
    }

    // --- STEP 10: REPORT ---

    function getReport() {
        const analysis = analyze();
        const leaks = detectLeaks();

        let violationCount = 0;

        for (const sample of samples) {
            if (sample.domNodes > thresholds.domNodes) {
                violationCount++;
            }

            if (
                sample.eventListeners >
                thresholds.eventListeners
            ) {
                violationCount++;
            }

            if (
                sample.storageUsedKB >
                thresholds.storageUsed
            ) {
                violationCount++;
            }

            if (
                sample.activeTimers >
                thresholds.timerCount
            ) {
                violationCount++;
            }

            if (
                sample.taskDurations.some(
                    duration =>
                        duration > thresholds.longTaskMs
                )
            ) {
                violationCount++;
            }
        }

        let overallHealth = "Healthy";

        if (violationCount > 0) {
            overallHealth = "Degraded";
        }

        if (violationCount >= samples.length * 3) {
            overallHealth = "Critical";
        }

        return {
            totalSamples: samples.length,
            violationCount,
            leaksDetected: leaks.length,
            overallHealth
        };
    }

    // --- STEP 11: RETURN MONITOR API ---

    return {
        recordSample,
        analyze,
        getTimeline,
        detectLeaks,
        getBudget,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const monitor = createBrowserPerformanceMonitor({
    sampleInterval: 1000,
    maxSamples: 100,
    thresholds: {
        domNodes: 500,
        eventListeners: 100,
        storageUsed: 4000,
        timerCount: 20,
        longTaskMs: 50
    }
});


monitor.recordSample({
    domNodes: 120,
    eventListeners: 45,
    storageUsedKB: 1200,
    activeTimers: 5,
    taskDurations: [20, 30]
});

monitor.recordSample({
    domNodes: 250,
    eventListeners: 80,
    storageUsedKB: 2400,
    activeTimers: 8,
    taskDurations: [60, 25]
});

monitor.recordSample({
    domNodes: 480,
    eventListeners: 110,
    storageUsedKB: 3800,
    activeTimers: 12,
    taskDurations: [80, 90]
});

console.log(monitor.analyze());

console.log(monitor.detectLeaks());

console.log(monitor.getTimeline());

console.log(monitor.getReport());


// --- Invalid Input ---
console.log(createBrowserPerformanceMonitor(null));

console.log(
    createBrowserPerformanceMonitor({
        sampleInterval: 1000,
        maxSamples: 100,
        thresholds: {}
    })
);

console.log(
    monitor.recordSample({
        domNodes: -10,
        eventListeners: 20,
        storageUsedKB: 100,
        activeTimers: 2,
        taskDurations: []
    })
);