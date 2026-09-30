// PROBLEM-01 createLocalStorageManager()

function createLocalStorageManager(config) {

    // STEP 1: Validate Configuration

    if (
        !config ||
        typeof config !== "object" ||
        typeof config.namespace !== "string" ||
        !config.namespace.trim() ||
        typeof config.maxSize !== "number" ||
        !Number.isFinite(config.maxSize) ||
        config.maxSize <= 0 ||
        !(
            config.defaultTTL === null ||
            (
                typeof config.defaultTTL === "number" &&
                Number.isFinite(config.defaultTTL) &&
                config.defaultTTL >= 0
            )
        )
    ) {
        return "Invalid Input";
    }


    // STEP 2: Internal Storage

    const storage = new Map();

    // STEP 3: Calculate Size

    function calculateSizeKB(value) {
        const serialized = JSON.stringify(value);

        // Simulated browser storage size.
        // UTF-16 is approximately 2 bytes per character.
        const bytes = serialized.length * 2;

        return Number((bytes / 1024).toFixed(2));
    }

    // STEP 4: Get Full Key

    function getFullKey(key) {
        return `${config.namespace}:${key}`;
    }

    // STEP 5: Validate Key

    function isValidKey(key) {
        return typeof key === "string" && key.trim().length > 0;
    }


    // STEP 6: Remove Expired Entries

    function cleanupExpired() {
        const now = Date.now();

        for (const [key, item] of storage.entries()) {
            if (
                item.expiresAt !== null &&
                item.expiresAt <= now
            ) {
                // Keep expired entry for getExpired().
                continue;
            }
        }
    }


    // STEP 7: Set

    function set(key, value, ttl) {
        if (!isValidKey(key)) {
            return "Invalid Input";
        }

        if (
            ttl !== undefined &&
            ttl !== null &&
            (
                typeof ttl !== "number" ||
                !Number.isFinite(ttl) ||
                ttl < 0
            )
        ) {
            return "Invalid Input";
        }

        const actualTTL =
            ttl === undefined
                ? config.defaultTTL
                : ttl;

        const sizeKB = calculateSizeKB(value);

        // Calculate total active storage size.
        let currentSize = 0;

        for (const item of storage.values()) {
            if (
                item.expiresAt === null ||
                item.expiresAt > Date.now()
            ) {
                currentSize += item.sizeKB;
            }
        }

        const fullKey = getFullKey(key);

        // If replacing existing key, subtract old size.
        if (storage.has(fullKey)) {
            currentSize -= storage.get(fullKey).sizeKB;
        }

        if (currentSize + sizeKB > config.maxSize) {
            return {
                success: false,
                key: fullKey,
                sizeKB,
            };
        }

        const expiresAt =
            actualTTL === null
                ? null
                : Date.now() + actualTTL * 1000;

        storage.set(fullKey, {
            value,
            expiresAt,
            sizeKB,
        });

        return {
            success: true,
            key: fullKey,
            sizeKB,
        };
    }


    // STEP 8: Get

    function get(key) {
        if (!isValidKey(key)) {
            return null;
        }

        const fullKey = getFullKey(key);
        const item = storage.get(fullKey);

        if (!item) {
            return null;
        }

        if (
            item.expiresAt !== null &&
            item.expiresAt <= Date.now()
        ) {
            storage.delete(fullKey);
            return null;
        }

        return item.value;
    }


    // STEP 9: Remove

    function remove(key) {
        if (!isValidKey(key)) {
            return false;
        }

        return storage.delete(getFullKey(key));
    }

    // STEP 10: Clear Namespace

    function clear() {
        const count = storage.size;

        storage.clear();

        return count;
    }

    // STEP 11: Has

    function has(key) {
        if (!isValidKey(key)) {
            return false;
        }

        const fullKey = getFullKey(key);
        const item = storage.get(fullKey);

        if (!item) {
            return false;
        }

        if (
            item.expiresAt !== null &&
            item.expiresAt <= Date.now()
        ) {
            storage.delete(fullKey);
            return false;
        }

        return true;
    }




    function keys() {
        const result = [];

        for (const [fullKey, item] of storage.entries()) {
            if (
                item.expiresAt !== null &&
                item.expiresAt <= Date.now()
            ) {
                storage.delete(fullKey);
                continue;
            }

            result.push(
                fullKey.slice(config.namespace.length + 1)
            );
        }

        return result;
    }


    // STEP 13: Get Usage

    function getUsage() {
        let usedKB = 0;
        let itemCount = 0;

        for (const [fullKey, item] of storage.entries()) {
            if (
                item.expiresAt !== null &&
                item.expiresAt <= Date.now()
            ) {
                storage.delete(fullKey);
                continue;
            }

            usedKB += item.sizeKB;
            itemCount++;
        }

        usedKB = Number(usedKB.toFixed(2));

        const percentUsed = Number(
            ((usedKB / config.maxSize) * 100).toFixed(2)
        );

        return {
            usedKB,
            maxKB: config.maxSize,
            percentUsed,
            itemCount,
        };
    }

    // STEP 14: Get Expired

    function getExpired() {
        const result = [];
        const now = Date.now();

        for (const [fullKey, item] of storage.entries()) {
            if (
                item.expiresAt !== null &&
                item.expiresAt <= now
            ) {
                result.push(
                    fullKey.slice(config.namespace.length + 1)
                );
            }
        }

        return result;
    }


    // STEP 15: Report


    function getReport() {
        const now = Date.now();

        let expiredCount = 0;
        let activeCount = 0;

        for (const item of storage.values()) {
            if (
                item.expiresAt !== null &&
                item.expiresAt <= now
            ) {
                expiredCount++;
            } else {
                activeCount++;
            }
        }

        return {
            namespace: config.namespace,
            totalStored: storage.size,
            expiredCount,
            activeCount,
        };
    }

    return {
        set,
        get,
        remove,
        clear,
        has,
        keys,
        getUsage,
        getExpired,
        getReport,
    };
}



// --- EXAMPLE USAGE ---

const storage = createLocalStorageManager({
    namespace: "app",
    maxSize: 100,
    defaultTTL: 3600,
});


console.log(
    storage.set("user", {
        name: "Rahim",
        role: "admin",
    })
);

console.log(
    storage.set("theme", "dark", null)
);

console.log(
    "User:",
    storage.get("user")
);

console.log(
    "Nonexistent:",
    storage.get("nonexistent")
);

console.log(
    "Has theme:",
    storage.has("theme")
);

console.log(
    "Keys:",
    storage.keys()
);

console.log(
    "Usage:",
    storage.getUsage()
);

console.log(
    "Expired:",
    storage.getExpired()
);

console.log(
    "Remove theme:",
    storage.remove("theme")
);

console.log(
    "Report:",
    storage.getReport()
);