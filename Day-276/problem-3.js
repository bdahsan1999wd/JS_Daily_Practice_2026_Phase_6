// PROBLEM–03: createRecordUtilityEngine()

// Logic: Simulates Record and mapped-value operations including typed record creation, entry conversion, value transformation, filtering, grouping, inversion, and record merging.

function createRecordUtilityEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        config === null ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.strict !== "boolean" ||
        typeof config.allowPartialRecords !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: REPORT ---
    const report = {
        totalOperations: 0,
        byOperation: {}
    };

    const track = (operation) => {
        report.totalOperations++;

        report.byOperation[operation] =
            (report.byOperation[operation] || 0) + 1;
    };

    // --- STEP 3: HELPER FUNCTIONS ---
    const isPlainObject = (value) => {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    };

    const getType = (value) => {
        if (value === null) return "null";
        if (Array.isArray(value)) return "array";

        return typeof value;
    };

    const clone = (value) => {
        if (Array.isArray(value)) {
            return value.map((item) => clone(item));
        }

        if (isPlainObject(value)) {
            const result = {};

            for (const [key, item] of Object.entries(value)) {
                result[key] = clone(item);
            }

            return result;
        }

        return value;
    };

    // --- STEP 4: RETURN API ---
    return {
        // Record<K, V>
        createRecord(keys, valueType, values) {
            // --- VALIDATE INPUT ---
            if (
                !Array.isArray(keys) ||
                keys.length === 0 ||
                typeof valueType !== "string" ||
                !isPlainObject(values)
            ) {
                return "Invalid Input";
            }

            const errors = {};
            const record = {};

            // --- VALIDATE KEYS ---
            for (const key of keys) {
                if (typeof key !== "string") {
                    return "Invalid Input";
                }

                if (
                    !Object.prototype.hasOwnProperty.call(
                        values,
                        key
                    )
                ) {
                    if (!config.allowPartialRecords) {
                        errors[key] = "Required key missing";
                    }

                    continue;
                }

                const actualType = getType(values[key]);

                if (actualType !== valueType) {
                    errors[key] =
                        `Expected ${valueType}, got ${actualType}`;
                } else {
                    record[key] = clone(values[key]);
                }
            }

            // --- STRICT MODE: EXTRA KEYS NOT ALLOWED ---
            if (config.strict) {
                for (const key of Object.keys(values)) {
                    if (!keys.includes(key)) {
                        errors[key] = "Unexpected key";
                    }
                }
            }

            track("createRecord");

            if (Object.keys(errors).length > 0) {
                return {
                    record: null,
                    valid: false,
                    errors
                };
            }

            return {
                record,
                valid: true,
                errors: {}
            };
        },

        // Object.fromEntries() style
        fromEntries(entries) {
            if (!Array.isArray(entries)) {
                return "Invalid Input";
            }

            const record = {};

            let keyType = null;
            let valueType = null;

            for (const entry of entries) {
                if (
                    !Array.isArray(entry) ||
                    entry.length !== 2
                ) {
                    return "Invalid Input";
                }

                const [key, value] = entry;

                const currentKeyType = getType(key);
                const currentValueType = getType(value);

                if (keyType === null) {
                    keyType = currentKeyType;
                }

                if (valueType === null) {
                    valueType = currentValueType;
                }

                if (
                    config.strict &&
                    currentKeyType !== keyType
                ) {
                    return "Invalid Input";
                }

                if (
                    config.strict &&
                    currentValueType !== valueType
                ) {
                    return "Invalid Input";
                }

                record[String(key)] = clone(value);
            }

            track("fromEntries");

            return {
                record,
                keyType: keyType || "never",
                valueType: valueType || "never"
            };
        },

        // Record<K, V> -> Record<K, U>
        mapValues(record, fn) {
            if (
                !isPlainObject(record) ||
                typeof fn !== "function"
            ) {
                return "Invalid Input";
            }

            const result = {};
            let originalValueType = "never";
            let newValueType = "never";

            for (const [key, value] of Object.entries(record)) {
                if (originalValueType === "never") {
                    originalValueType = getType(value);
                }

                let newValue;

                try {
                    newValue = fn(value, key, record);
                } catch {
                    return "Invalid Input";
                }

                if (newValueType === "never") {
                    newValueType = getType(newValue);
                }

                result[key] = newValue;
            }

            track("mapValues");

            return {
                result,
                originalValueType,
                newValueType
            };
        },

        // Filter Record entries
        filterRecord(record, fn) {
            if (
                !isPlainObject(record) ||
                typeof fn !== "function"
            ) {
                return "Invalid Input";
            }

            const result = {};

            for (const [key, value] of Object.entries(record)) {
                let keep;

                try {
                    keep = fn(key, value);
                } catch {
                    return "Invalid Input";
                }

                if (typeof keep !== "boolean") {
                    return "Invalid Input";
                }

                if (keep) {
                    result[key] = clone(value);
                }
            }

            track("filterRecord");

            return result;
        },

        // Record<K, T[]>
        groupBy(items, keyFn) {
            if (
                !Array.isArray(items) ||
                typeof keyFn !== "function"
            ) {
                return "Invalid Input";
            }

            const record = {};
            let keyType = null;

            for (const item of items) {
                let key;

                try {
                    key = keyFn(item);
                } catch {
                    return "Invalid Input";
                }

                const currentType = getType(key);

                if (keyType === null) {
                    keyType = currentType;
                }

                if (
                    config.strict &&
                    currentType !== keyType
                ) {
                    return "Invalid Input";
                }

                const stringKey = String(key);

                if (!record[stringKey]) {
                    record[stringKey] = [];
                }

                record[stringKey].push(clone(item));
            }

            track("groupBy");

            return {
                record,
                groups: Object.keys(record).length,
                keyType: keyType || "never"
            };
        },

        // Invert Record<K, V>
        invertRecord(record) {
            if (!isPlainObject(record)) {
                return "Invalid Input";
            }

            const inverted = {};
            const conflicts = [];

            for (const [key, value] of Object.entries(record)) {
                const newKey = String(value);

                if (
                    Object.prototype.hasOwnProperty.call(
                        inverted,
                        newKey
                    )
                ) {
                    conflicts.push({
                        value,
                        existingKey: inverted[newKey],
                        duplicateKey: key
                    });

                    continue;
                }

                inverted[newKey] = key;
            }

            track("invertRecord");

            return {
                inverted,
                conflicts
            };
        },

        // Merge multiple records
        mergeRecords(records, strategy) {
            if (
                !Array.isArray(records) ||
                records.length === 0 ||
                !["overwrite", "keep", "array"].includes(strategy)
            ) {
                return "Invalid Input";
            }

            const result = {};

            for (const record of records) {
                if (!isPlainObject(record)) {
                    return "Invalid Input";
                }

                for (const [key, value] of Object.entries(record)) {
                    const exists =
                        Object.prototype.hasOwnProperty.call(
                            result,
                            key
                        );

                    if (!exists) {
                        result[key] = clone(value);
                        continue;
                    }

                    if (strategy === "overwrite") {
                        result[key] = clone(value);
                    }

                    if (strategy === "keep") {
                        // Existing value remains unchanged.
                    }

                    if (strategy === "array") {
                        if (!Array.isArray(result[key])) {
                            result[key] = [result[key]];
                        }

                        result[key].push(clone(value));
                    }
                }
            }

            track("mergeRecords");

            return result;
        },

        // Report
        getReport() {
            return {
                totalOperations: report.totalOperations,
                byOperation: { ...report.byOperation }
            };
        }
    };
}


// --- EXAMPLE USAGE ---
const recordEngine = createRecordUtilityEngine({
    strict: true,
    allowPartialRecords: false
});


console.log(
    recordEngine.createRecord(
        ["alice", "bob", "carol"],
        "number",
        {
            alice: 90,
            bob: 85,
            carol: 92
        }
    )
);

console.log(
    recordEngine.createRecord(
        ["alice", "bob"],
        "number",
        {
            alice: 90
        }
    )
);

console.log(
    recordEngine.groupBy(
        [
            {
                name: "Rahim",
                dept: "Eng"
            },
            {
                name: "Karim",
                dept: "HR"
            },
            {
                name: "Jamal",
                dept: "Eng"
            }
        ],
        (item) => item.dept
    )
);

console.log(
    recordEngine.mapValues(
        {
            a: 1,
            b: 2,
            c: 3
        },
        (value) => value * 10
    )
);

console.log(
    recordEngine.invertRecord({
        a: "1",
        b: "2",
        c: "3"
    })
);

console.log(
    recordEngine.mergeRecords(
        [
            {
                a: 1,
                b: 2
            },
            {
                b: 99,
                c: 3
            }
        ],
        "overwrite"
    )
);

console.log(recordEngine.getReport());