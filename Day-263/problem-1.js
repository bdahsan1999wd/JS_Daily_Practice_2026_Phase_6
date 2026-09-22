
// 🧩 PROBLEM–01: buildSingletonSystem()

// Logic: This function builds a Singleton-based system with shared AppConfig and Logger instances.
// Only one instance of each Singleton can ever exist.


function buildSingletonSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        config.systemName.trim() === '' ||
        typeof config.maxInstances !== 'number' ||
        !Number.isFinite(config.maxInstances) ||
        config.maxInstances < 1
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE APP CONFIG SINGLETON ---
    class AppConfig {

        static #instance = null;

        #settings;
        #instanceCount;

        constructor() {
            if (AppConfig.#instance) {
                return AppConfig.#instance;
            }

            this.#settings = {};
            this.#instanceCount = 1;

            AppConfig.#instance = this;
        }

        static getInstance() {
            if (!AppConfig.#instance) {
                AppConfig.#instance = new AppConfig();
            }

            return AppConfig.#instance;
        }

        set(key, value) {
            if (typeof key !== 'string' || key.trim() === '') {
                return "Invalid Input";
            }

            this.#settings[key] = value;
            return value;
        }

        get(key) {
            if (typeof key !== 'string' || key.trim() === '') {
                return "Invalid Input";
            }

            return this.#settings[key];
        }

        getAll() {
            return { ...this.#settings };
        }

        reset() {
            this.#settings = {};
            return this.getAll();
        }
    }

    // --- STEP 3: DEFINE LOGGER SINGLETON ---
    class Logger {

        static #instance = null;

        #logs;

        constructor() {
            if (Logger.#instance) {
                return Logger.#instance;
            }

            this.#logs = [];

            Logger.#instance = this;
        }

        static getInstance() {
            if (!Logger.#instance) {
                Logger.#instance = new Logger();
            }

            return Logger.#instance;
        }

        log(level, message) {
            const validLevels = ["info", "warn", "error"];

            if (
                typeof level !== 'string' ||
                !validLevels.includes(level) ||
                typeof message !== 'string' ||
                message.trim() === ''
            ) {
                return "Invalid Input";
            }

            const entry = {
                level,
                message,
                timestamp: Date.now()
            };

            this.#logs.push(entry);

            return entry;
        }

        getLogs(level) {
            const validLevels = ["info", "warn", "error"];

            if (
                typeof level !== 'string' ||
                !validLevels.includes(level)
            ) {
                return "Invalid Input";
            }

            return this.#logs.filter(log => log.level === level);
        }

        clearLogs() {
            this.#logs = [];
            return [];
        }

        getStats() {
            const byLevel = {
                info: 0,
                warn: 0,
                error: 0
            };

            for (const log of this.#logs) {
                byLevel[log.level]++;
            }

            return {
                total: this.#logs.length,
                byLevel
            };
        }
    }

    // --- STEP 4: INITIALIZE SYSTEM STATE ---
    const configInstance = AppConfig.getInstance();
    const loggerInstance = Logger.getInstance();

    // Store system information inside AppConfig
    configInstance.set("systemName", config.systemName);
    configInstance.set("maxInstances", config.maxInstances);

    // --- STEP 5: DEFINE GETCONFIG ---
    function getConfig() {
        return AppConfig.getInstance();
    }

    // --- STEP 6: DEFINE GETLOGGER ---
    function getLogger() {
        return Logger.getInstance();
    }

    // --- STEP 7: DEFINE VERIFYINSTANCE ---
    function verifyInstance(inst1, inst2) {
        return inst1 === inst2;
    }

    // --- STEP 8: DEFINE GETREPORT ---
    function getReport() {
        return {
            configSettings: configInstance.getAll(),
            logCount: loggerInstance.getStats().total
        };
    }

    // --- STEP 9: RETURN API ---
    return {
        getConfig,
        getLogger,
        verifyInstance,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const system = buildSingletonSystem({
    systemName: "AppCore",
    maxInstances: 1
});

const config1 = system.getConfig();
const config2 = system.getConfig();

console.log(system.verifyInstance(config1, config2));


config1.set("theme", "dark");

console.log(config2.get("theme"));


const logger = system.getLogger();

logger.log("info", "App started");
logger.log("error", "DB connection failed");

console.log(logger.getLogs("info"));

console.log(logger.getStats());

console.log(system.getReport());


// --- Invalid Input ---
console.log(buildSingletonSystem("invalid"));