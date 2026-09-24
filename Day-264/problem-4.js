// 🧩 PROBLEM–04: buildAdvancedPluginSystem()

// Logic: This function builds an advanced plugin system combining Singleton, Plugin Pattern, Decorator Pattern, and Observer Pattern.


function buildAdvancedPluginSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        typeof config.version !== 'string' ||
        typeof config.maxPlugins !== 'number' ||
        !["debug", "info", "error"].includes(config.logLevel)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE PLUGINS ---
    const plugins = {
        AuthPlugin: {
            install(app) {
                app.login = (username, password) => {
                    if (username && password) {
                        return { success: true, user: username, token: "TOKEN_" + username };
                    }
                    return { success: false };
                };
                app.logout = () => { app.isAuthenticated = false; return "Logged Out"; };
                app.isAuthenticated = () => true;
            },
            uninstall(app) {
                delete app.login;
                delete app.logout;
                delete app.isAuthenticated;
            }
        },
        CachePlugin: {
            _cache: new Map(),
            install(app) {
                const self = this;
                app.cacheGet = (key) => self._cache.get(key);
                app.cacheSet = (key, val) => { self._cache.set(key, val); return true; };
                app.cacheClear = () => { self._cache.clear(); };
            },
            uninstall(app) {
                delete app.cacheGet;
                delete app.cacheSet;
                delete app.cacheClear;
            }
        },
        MetricsPlugin: {
            _metrics: new Map(),
            install(app) {
                const self = this;
                app.recordMetric = (name, value) => {
                    if (!self._metrics.has(name)) self._metrics.set(name, []);
                    self._metrics.get(name).push({ value, timestamp: Date.now() });
                };
                app.getMetrics = () => {
                    const result = {};
                    for (const [k, v] of self._metrics) {
                        result[k] = v.slice(-10); // last 10
                    }
                    return result;
                };
            },
            uninstall(app) {
                delete app.recordMetric;
                delete app.getMetrics;
            }
        }
    };

    // --- STEP 3: DEFINE DECORATORS ---
    const decorators = {
        TimestampDecorator: (logger) => {
            const originalLog = logger.log;
            logger.log = (msg) => originalLog(`[${new Date().toISOString()}] ${msg}`);
            return logger;
        },
        LevelDecorator: (logger) => {
            const originalLog = logger.log;
            logger.log = (msg, level = "info") => {
                const levels = { debug: 0, info: 1, error: 2 };
                const configLevel = levels[config.logLevel] || 1;
                if (levels[level] >= configLevel) {
                    originalLog(`[${level.toUpperCase()}] ${msg}`);
                }
            };
            return logger;
        }
    };

    // --- STEP 4: INITIALIZE SYSTEM STATE (Singleton) ---
    let systemInstance = null;
    const installedPlugins = new Set();
    const loggerStack = [];
    const baseLogger = {
        log: (msg) => console.log(msg)
    };
    let currentLogger = baseLogger;

    // Observer pattern for plugin events
    const pluginEventListeners = new Map(); // eventName -> Set of callbacks

    function emitPluginEvent(eventName, data) {
        if (pluginEventListeners.has(eventName)) {
            for (const fn of pluginEventListeners.get(eventName)) {
                fn(data);
            }
        }
    }

    // --- STEP 5: DEFINE SYSTEM API ---
    function installPlugin(pluginName) {
        if (installedPlugins.has(pluginName)) return true;
        if (installedPlugins.size >= config.maxPlugins) return "Max Plugins Reached";

        const plugin = plugins[pluginName];
        if (!plugin) return "Plugin Not Found";

        // Check if logger capabilities exist
        if (pluginName === "AuthPlugin" || pluginName === "CachePlugin" || pluginName === "MetricsPlugin") {
            plugin.install(currentLogger);
        } else {
            // Create app context for plugin
            const appContext = {};
            plugin.install(appContext);
            // Merge capabilities into currentLogger
            for (const [key, value] of Object.entries(appContext)) {
                currentLogger[key] = value;
            }
        }

        installedPlugins.add(pluginName);
        emitPluginEvent("pluginInstalled", { pluginName });
        return true;
    }

    function uninstallPlugin(pluginName) {
        if (!installedPlugins.has(pluginName)) return "Not Installed";

        const plugin = plugins[pluginName];
        if (plugin) {
            plugin.uninstall(currentLogger);
        }
        installedPlugins.delete(pluginName);
        emitPluginEvent("pluginUninstalled", { pluginName });
        return true;
    }

    function decorateLogger(...decoratorNames) {
        for (const name of decoratorNames) {
            const decorator = decorators[name];
            if (!decorator) return `Decorator Not Found: ${name}`;
            currentLogger = decorator(currentLogger);
            loggerStack.push(name);
        }
    }

    function call(capability, ...args) {
        if (typeof currentLogger[capability] !== 'function') {
            return `Capability Not Found: ${capability}`;
        }
        return currentLogger[capability](...args);
    }

    function onEvent(event, fn) {
        if (!pluginEventListeners.has(event)) {
            pluginEventListeners.set(event, new Set());
        }
        pluginEventListeners.get(event).add(fn);
    }

    function getSystemReport() {
        const capabilities = [];
        for (const pluginName of installedPlugins) {
            const plugin = plugins[pluginName];
            if (pluginName === "AuthPlugin") capabilities.push("login", "logout", "isAuthenticated");
            if (pluginName === "CachePlugin") capabilities.push("cacheGet", "cacheSet", "cacheClear");
            if (pluginName === "MetricsPlugin") capabilities.push("recordMetric", "getMetrics");
        }
        return {
            systemName: config.systemName,
            version: config.version,
            installedPlugins: Array.from(installedPlugins),
            capabilities,
            loggerStack
        };
    }

    // --- STEP 6: RETURN API ---
    systemInstance = {
        installPlugin,
        uninstallPlugin,
        decorateLogger,
        call,
        onEvent,
        getSystemReport
    };

    return systemInstance;
}


// --- EXAMPLE USAGE ---
const sys = buildAdvancedPluginSystem({ systemName: "CoreOS", version: "2.0.0", maxPlugins: 10, logLevel: "info" });

sys.installPlugin("AuthPlugin");
sys.installPlugin("CachePlugin");
sys.decorateLogger("TimestampDecorator", "LevelDecorator");

console.log(sys.call("login", "rahim", "pass123"));

sys.call("cacheSet", "user:1", { name: "Rahim" });
console.log(sys.call("cacheGet", "user:1"));
console.log(sys.getSystemReport());


// --- Invalid Input ---
console.log(buildAdvancedPluginSystem("invalid"));