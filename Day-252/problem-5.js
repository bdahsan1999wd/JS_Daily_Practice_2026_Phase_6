// 🧩 PROBLEM–05: createConfigManager()

// Logic: This function creates a configuration manager with private state.
// The config object, its history of changes, and a timestamp counter are
// all encapsulated in the closure. All operations return copies or
// controlled views to prevent external mutation of internal state.


function createConfigManager(initialConfig) {

    // --- STEP 1: VALIDATE INPUT ---
    // Check if initialConfig is a plain object (not array, not null).
    if (
        !initialConfig ||
        typeof initialConfig !== 'object' ||
        Array.isArray(initialConfig)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    // Store a deep copy of the original config for reset functionality.
    const originalConfig = { ...initialConfig };
    // Current config state (shallow copy for independent mutation)
    let currentConfig = { ...initialConfig };
    // History of all change operations
    const history = [];
    // Timestamp counter (incrementing integer)
    let timestamp = 0;

    // --- STEP 3: DEFINE GET METHOD ---
    // Returns value for key or "Key Not Found" if key doesn't exist.
    const get = (key) => {
        if (typeof key !== 'string') {
            return "Key Not Found";
        }
        return currentConfig.hasOwnProperty(key) ? currentConfig[key] : "Key Not Found";
    };

    // --- STEP 4: DEFINE SET METHOD ---
    // Updates or adds a key-value pair. Records in history.
    // Returns the updated config (as a copy).
    const set = (key, value) => {
        if (typeof key !== 'string') {
            return "Invalid Input";
        }
        timestamp++;
        const oldValue = currentConfig[key];
        currentConfig[key] = value;
        history.push({
            action: "set",
            key,
            value,
            timestamp
        });
        return { ...currentConfig };
    };

    // --- STEP 5: DEFINE DELETE METHOD ---
    // Removes a key if it exists. Records in history.
    // Returns true if key existed, false otherwise.
    const deleteKey = (key) => {
        if (typeof key !== 'string') {
            return false;
        }
        const existed = currentConfig.hasOwnProperty(key);
        if (existed) {
            timestamp++;
            history.push({
                action: "delete",
                key,
                value: null,
                timestamp
            });
            delete currentConfig[key];
        }
        return existed;
    };

    // --- STEP 6: DEFINE GETALL METHOD ---
    // Returns a SHALLOW COPY of current config to prevent external mutation.
    const getAll = () => ({ ...currentConfig });

    // --- STEP 7: DEFINE RESET METHOD ---
    // Restores config to original initialConfig. Records in history.
    // Returns the reset config.
    const reset = () => {
        timestamp++;
        currentConfig = { ...originalConfig };
        history.push({
            action: "reset",
            key: null,
            value: null,
            timestamp
        });
        return getAll();
    };

    // --- STEP 8: DEFINE GETHISTORY METHOD ---
    // Returns the history of all change operations.
    const getHistory = () => [...history];

    // --- STEP 9: RETURN CONFIG API ---
    return {
        get,
        set,
        delete: deleteKey,
        getAll,
        reset,
        getHistory
    };
}


// --- EXAMPLE USAGE ---
const config = createConfigManager({ theme: "dark", lang: "en" });

console.log(config.get("theme"));
console.log(config.set("lang", "bn"));
console.log(config.delete("theme"));
console.log(config.getAll());
console.log(config.reset());
console.log(config.getHistory());

// --- Invalid Input ---
console.log(createConfigManager("invalid"));