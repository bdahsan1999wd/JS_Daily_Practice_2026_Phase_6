// PROBLEM-02 createTTLStorage()

function createTTLStorage(config) {

    // STEP 1: Validate Configuration

    const allowedStorageTypes = [
        "local",
        "session",
        "memory",
    ];

    if (
        !config ||
        typeof config !== "object" ||
        !allowedStorageTypes.includes(config.storageType) ||
        typeof config.gcInterval !== "number" ||
        !Number.isInteger(config.gcInterval) ||
        config.gcInterval <= 0 ||
        !(
            config.onExpire === null ||
            typeof config.onExpire === "function"
        )
    ) {
        return "Invalid Input";
    }


    // STEP 2: Internal Storage

    const storage = new Map();

    let operationCount = 0;


    // STEP 3: Validate Key

    function validKey(key) {
        return (
            typeof key === "string" &&
            key.trim().length > 0
        );
    }


    // STEP 4: Garbage Collection Counter

    function checkAutoGC() {
        operationCount++;

        if (operationCount % config.gcInterval === 0) {
            runGC();
        }
    }


    // STEP 5: Set

    function set(key, value, ttlSeconds) {
        if (
            !validKey(key) ||
            !(
                ttlSeconds === null ||
                (
                    typeof ttlSeconds === "number" &&
                    Number.isFinite(ttlSeconds) &&
                    ttlSeconds >= 0
                )
            )
        ) {
            return "Invalid Input";
        }

        const expiresAt =
            ttlSeconds === null
                ? null
                : Date.now() + ttlSeconds * 1000;

        storage.set(key, {
            value,
            createdAt: Date.now(),
            expiresAt,
        });

        checkAutoGC();

        return true;
    }


    // STEP 6: Get

    function get(key) {
        if (!validKey(key)) {
            return null;
        }

        const item = storage.get(key);

        if (!item) {
            return null;
        }

        if (
            item.expiresAt !== null &&
            item.expiresAt <= Date.now()
        ) {
            if (config.onExpire) {
                config.onExpire(key, item.value);
            }

            storage.delete(key);

            return null;
        }

        checkAutoGC();

        return item.value;
    }


    // STEP 7: Get With Meta

    function getWithMeta(key) {
        if (!validKey(key)) {
            return "Invalid Input";
        }

        const item = storage.get(key);

        if (!item) {
            return null;
        }

        const now = Date.now();

        const isExpired =
            item.expiresAt !== null &&
            item.expiresAt <= now;

        let remainingSeconds = null;

        if (item.expiresAt !== null) {
            remainingSeconds = Math.max(
                0,
                Math.ceil(
                    (item.expiresAt - now) / 1000
                )
            );
        }

        const ttl =
            item.expiresAt === null
                ? null
                : Math.max(
                    0,
                    Math.ceil(
                        (item.expiresAt -
                            item.createdAt) /
                        1000
                    )
                );

        return {
            value: item.value,
            ttl,
            expiresAt: item.expiresAt,
            remainingSeconds,
            isExpired,
        };
    }


    // STEP 8: Extend

    function extend(key, additionalSeconds) {
        if (
            !validKey(key) ||
            typeof additionalSeconds !== "number" ||
            !Number.isFinite(additionalSeconds) ||
            additionalSeconds < 0
        ) {
            return "Invalid Input";
        }

        const item = storage.get(key);

        if (!item) {
            return null;
        }

        const now = Date.now();

        if (
            item.expiresAt !== null &&
            item.expiresAt <= now
        ) {
            return null;
        }

        if (item.expiresAt === null) {
            return "Invalid Input";
        }

        item.expiresAt += additionalSeconds * 1000;

        const newTTL = Math.ceil(
            (item.expiresAt - item.createdAt) / 1000
        );

        checkAutoGC();

        return {
            key,
            newTTL,
            newExpiresAt: item.expiresAt,
        };
    }


    // STEP 9: Persist

    function persist(key) {
        if (!validKey(key)) {
            return "Invalid Input";
        }

        const item = storage.get(key);

        if (!item) {
            return null;
        }

        item.expiresAt = null;

        checkAutoGC();

        return {
            key,
            persistent: true,
        };
    }


    // STEP 10: Run GC

    function runGC() {
        const now = Date.now();

        let removed = 0;
        const keys = [];

        for (const [key, item] of storage.entries()) {
            if (
                item.expiresAt !== null &&
                item.expiresAt <= now
            ) {
                if (config.onExpire) {
                    config.onExpire(key, item.value);
                }

                storage.delete(key);

                removed++;
                keys.push(key);
            }
        }

        return {
            removed,
            keys,
        };
    }


    // STEP 11: Snapshot

    function getSnapshot() {
        const snapshot = {};
        const now = Date.now();

        for (const [key, item] of storage.entries()) {
            const isExpired =
                item.expiresAt !== null &&
                item.expiresAt <= now;

            const remainingSeconds =
                item.expiresAt === null
                    ? null
                    : Math.max(
                        0,
                        Math.ceil(
                            (item.expiresAt - now) /
                            1000
                        )
                    );

            snapshot[key] = {
                value: item.value,
                ttl:
                    item.expiresAt === null
                        ? null
                        : Math.max(
                            0,
                            Math.ceil(
                                (item.expiresAt -
                                    item.createdAt) /
                                1000
                            )
                        ),
                expiresAt: item.expiresAt,
                remainingSeconds,
                isExpired,
            };
        }

        return snapshot;
    }


    // STEP 12: Report

    function getReport() {
        const now = Date.now();

        let total = 0;
        let expired = 0;
        let active = 0;

        let ttlSum = 0;
        let ttlCount = 0;
        let nearExpiry = 0;

        for (const item of storage.values()) {
            total++;

            if (
                item.expiresAt !== null &&
                item.expiresAt <= now
            ) {
                expired++;
                continue;
            }

            active++;

            if (item.expiresAt !== null) {
                const remaining =
                    (item.expiresAt - now) / 1000;

                const ttl =
                    (item.expiresAt -
                        item.createdAt) /
                    1000;

                ttlSum += ttl;
                ttlCount++;

                if (remaining < 60) {
                    nearExpiry++;
                }
            }
        }

        return {
            total,
            expired,
            active,
            avgTTL:
                ttlCount === 0
                    ? 0
                    : Number(
                        (ttlSum / ttlCount).toFixed(2)
                    ),
            nearExpiry,
        };
    }

    return {
        set,
        get,
        getWithMeta,
        extend,
        persist,
        runGC,
        getSnapshot,
        getReport,
    };
}


// --- EXAMPLE USAGE ---

const ttlStorage = createTTLStorage({
    storageType: "memory",
    gcInterval: 5,
    onExpire: null,
});


console.log(
    "Set session:",
    ttlStorage.set(
        "session",
        "token_abc",
        3600
    )
);

console.log(
    "Set tempCode:",
    ttlStorage.set(
        "tempCode",
        "OTP123",
        30
    )
);

console.log(
    "Set permanent:",
    ttlStorage.set(
        "permanent",
        "alwaysHere",
        null
    )
);

console.log(
    "Session Meta:",
    ttlStorage.getWithMeta("session")
);

console.log(
    "Extend tempCode:",
    ttlStorage.extend("tempCode", 60)
);

console.log(
    "Persist tempCode:",
    ttlStorage.persist("tempCode")
);

console.log(
    "Snapshot:",
    ttlStorage.getSnapshot()
);

console.log(
    "Report:",
    ttlStorage.getReport()
);