// PROBLEM-05 createStorageAnalytics()

function createStorageAnalytics(config) {

    // STEP 1: Validate Configuration

    if (
        !config ||
        typeof config !== "object" ||
        !config.quotas ||
        typeof config.quotas !== "object" ||
        typeof config.quotas.local !== "number" ||
        typeof config.quotas.session !== "number" ||
        typeof config.quotas.cookie !== "number" ||
        config.quotas.local <= 0 ||
        config.quotas.session <= 0 ||
        config.quotas.cookie <= 0 ||
        typeof config.warningThreshold !== "number" ||
        config.warningThreshold < 0 ||
        config.warningThreshold > 100 ||
        typeof config.trackHistory !== "boolean"
    ) {
        return "Invalid Input";
    }


    // STEP 2: State

    const storageTypes = [
        "local",
        "session",
        "cookie",
    ];

    const allowedOperations = [
        "set",
        "get",
        "delete",
        "clear",
    ];

    const items = {
        local: new Map(),
        session: new Map(),
        cookie: new Map(),
    };

    const history = {
        local: [],
        session: [],
        cookie: [],
    };


    // STEP 3: Track Operation

    function trackOperation(
        storageType,
        operation,
        key,
        sizeKB
    ) {
        if (
            !storageTypes.includes(storageType) ||
            !allowedOperations.includes(operation) ||
            typeof key !== "string" ||
            !key.trim() ||
            typeof sizeKB !== "number" ||
            !Number.isFinite(sizeKB) ||
            sizeKB < 0
        ) {
            return "Invalid Input";
        }

        const storage = items[storageType];


        // SET

        if (operation === "set") {
            storage.set(key, sizeKB);
        }


        // DELETE

        if (operation === "delete") {
            storage.delete(key);
        }


        // CLEAR

        if (operation === "clear") {
            storage.clear();
        }


        // HISTORY

        if (config.trackHistory) {
            history[storageType].push({
                storageType,
                operation,
                key,
                sizeKB,
                timestamp: Date.now(),
            });
        }

        return true;
    }


    // STEP 4: Get Used Size

    function getUsedSize(storageType) {
        let total = 0;

        for (const size of items[storageType].values()) {
            total += size;
        }

        return Number(total.toFixed(2));
    }


    // STEP 5: Quota Status

    function getQuotaStatus(storageType) {
        if (!storageTypes.includes(storageType)) {
            return "Invalid Input";
        }

        const used = getUsedSize(storageType);
        const max = config.quotas[storageType];

        const percent =
            Number(
                ((used / max) * 100).toFixed(2)
            );

        let status = "OK";

        if (used >= max) {
            status = "Full";
        } else if (percent >= 90) {
            status = "Critical";
        } else if (
            percent >= config.warningThreshold
        ) {
            status = "Warning";
        }

        return {
            used,
            max,
            percent,
            status,
        };
    }


    // STEP 6: Largest Items

    function getLargestItems(
        storageType,
        topN
    ) {
        if (
            !storageTypes.includes(storageType) ||
            !Number.isInteger(topN) ||
            topN <= 0
        ) {
            return "Invalid Input";
        }

        return [...items[storageType].entries()]
            .map(([key, sizeKB]) => ({
                key,
                sizeKB,
            }))
            .sort(
                (a, b) =>
                    b.sizeKB - a.sizeKB
            )
            .slice(0, topN);
    }


    // STEP 7: Operation History

    function getOperationHistory(
        storageType
    ) {
        if (!storageTypes.includes(storageType)) {
            return "Invalid Input";
        }

        return history[storageType].map(
            (operation) => ({
                ...operation,
            })
        );
    }


    // STEP 8: Detect Redundancy

    function detectRedundancy() {
        const keyLocations = new Map();

        for (const storageType of storageTypes) {
            for (const key of items[
                storageType
            ].keys()) {
                if (!keyLocations.has(key)) {
                    keyLocations.set(
                        key,
                        []
                    );
                }

                keyLocations
                    .get(key)
                    .push(storageType);
            }
        }

        const result = [];

        for (const [key, foundIn] of keyLocations) {
            if (foundIn.length > 1) {
                result.push({
                    key,
                    foundIn,
                });
            }
        }

        return result;
    }


    // STEP 9: Recommend

    function recommend() {
        const recommendations = [];

        // LocalStorage quota recommendation
        const localStatus =
            getQuotaStatus("local");

        if (
            localStatus.percent >
            config.warningThreshold
        ) {
            recommendations.push(
                "Consider clearing expired items"
            );
        }

        // Redundancy recommendation
        const redundant =
            detectRedundancy();

        for (const item of redundant) {
            recommendations.push(
                `Redundant storage detected for: ${item.key}. Consider using one storage type.`
            );
        }

        // Many small items
        for (const storageType of storageTypes) {
            const storage =
                items[storageType];

            if (storage.size >= 5) {
                const smallItems =
                    [...storage.values()].filter(
                        (size) => size < 1
                    );

                if (
                    smallItems.length >= 5
                ) {
                    recommendations.push(
                        "Consider consolidating into one object"
                    );

                    break;
                }
            }
        }

        return recommendations;
    }


    // STEP 10: Full Report

    function getFullReport() {
        const report = {};

        for (const storageType of storageTypes) {
            report[storageType] = {
                used:
                    getUsedSize(storageType),

                max:
                    config.quotas[
                    storageType
                    ],

                itemCount:
                    items[
                        storageType
                    ].size,
            };
        }

        const totalOperations =
            storageTypes.reduce(
                (total, storageType) =>
                    total +
                    history[
                        storageType
                    ].length,
                0
            );

        const redundantKeys =
            detectRedundancy().map(
                (item) => item.key
            );

        return {
            ...report,
            totalOperations,
            redundantKeys,
        };
    }

    return {
        trackOperation,
        getQuotaStatus,
        getLargestItems,
        getOperationHistory,
        detectRedundancy,
        recommend,
        getFullReport,
    };
}


// PROBLEM-05 EXAMPLE USAGE

const analytics = createStorageAnalytics({
    quotas: {
        local: 5120,
        session: 5120,
        cookie: 4,
    },
    warningThreshold: 80,
    trackHistory: true,
});


console.log(
    "Track userData:",
    analytics.trackOperation(
        "local",
        "set",
        "userData",
        1.5
    )
);

console.log(
    "Track settings:",
    analytics.trackOperation(
        "local",
        "set",
        "settings",
        0.8
    )
);

console.log(
    "Track session userData:",
    analytics.trackOperation(
        "session",
        "set",
        "userData",
        1.2
    )
);

console.log(
    "Track cookie:",
    analytics.trackOperation(
        "cookie",
        "set",
        "sessionId",
        0.1
    )
);

console.log(
    "Local Quota:",
    analytics.getQuotaStatus("local")
);

console.log(
    "Largest Items:",
    analytics.getLargestItems(
        "local",
        2
    )
);

console.log(
    "Local History:",
    analytics.getOperationHistory(
        "local"
    )
);

console.log(
    "Redundancy:",
    analytics.detectRedundancy()
);

console.log(
    "Recommendations:",
    analytics.recommend()
);

console.log(
    "Full Report:",
    analytics.getFullReport()
);