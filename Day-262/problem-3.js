// 🧩 PROBLEM–03: buildPluginArchitecture()

// Logic: This function builds a plugin architecture using composition
// over inheritance. Plugins register with dependencies, install in
// dependency order, and add capabilities to the app context.


function buildPluginArchitecture(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.appName !== 'string' ||
        typeof config.version !== 'string' ||
        typeof config.pluginTimeout !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PLUGIN STATE ---
    const plugins = new Map(); // name -> plugin object
    const installed = new Set(); // installed plugin names
    const appContext = {}; // capabilities added by plugins
    const dependencyMap = {}; // pluginName -> [dependencies]

    // --- STEP 3: DEFINE REGISTER ---
    function register(plugin) {
        if (
            !plugin ||
            typeof plugin.name !== 'string' ||
            typeof plugin.version !== 'string' ||
            !Array.isArray(plugin.dependencies) ||
            typeof plugin.install !== 'function' ||
            typeof plugin.uninstall !== 'function'
        ) {
            return "Invalid Plugin";
        }

        // Validate dependencies exist (or will exist)
        for (const dep of plugin.dependencies) {
            if (!plugins.has(dep)) {
                // Allow forward references - just warn
            }
        }

        plugins.set(plugin.name, plugin);
        dependencyMap[plugin.name] = [...plugin.dependencies];
    }

    // --- STEP 4: DEFINE INSTALL ---
    function install(pluginName) {
        if (installed.has(pluginName)) return true;

        const plugin = plugins.get(pluginName);
        if (!plugin) return "Plugin Not Found";

        // Install dependencies first
        for (const dep of plugin.dependencies) {
            if (!install(dep)) {
                return `Failed to install dependency: ${dep}`;
            }
        }

        // Install this plugin
        try {
            plugin.install(appContext);
            installed.add(pluginName);
        } catch (e) {
            return `Install failed: ${e.message}`;
        }

        return true;
    }

    // --- STEP 5: DEFINE UNINSTALL ---
    function uninstall(pluginName) {
        if (!installed.has(pluginName)) return "Not Installed";

        // Check if any installed plugin depends on this
        for (const [name, deps] of Object.entries(dependencyMap)) {
            if (installed.has(name) && deps.includes(pluginName)) {
                return `Cannot uninstall: ${name} depends on ${pluginName}`;
            }
        }

        const plugin = plugins.get(pluginName);
        if (plugin) {
            try {
                plugin.uninstall(appContext);
            } catch (e) {
                return `Uninstall failed: ${e.message}`;
            }
        }
        installed.delete(pluginName);
        return true;
    }

    // --- STEP 6: DEFINE ISINSTALLED ---
    function isInstalled(pluginName) {
        return installed.has(pluginName);
    }

    // --- STEP 7: DEFINE GETINSTALLEDCAPABILITIES ---
    function getInstalledCapabilities() {
        return Object.keys(appContext).filter(key => typeof appContext[key] === 'function');
    }

    // --- STEP 8: DEFINE GETPLUGINREPORT ---
    function getPluginReport() {
        return {
            totalRegistered: plugins.size,
            totalInstalled: installed.size,
            dependencyMap: { ...dependencyMap }
        };
    }

    // --- STEP 9: RETURN API ---
    return {
        register,
        install,
        uninstall,
        isInstalled,
        getInstalledCapabilities,
        getPluginReport
    };
}


// --- EXAMPLE USAGE ---
const arch = buildPluginArchitecture({ appName: "CMS", version: "1.0.0", pluginTimeout: 100 });

arch.register({
    name: "auth",
    version: "1.0",
    dependencies: [],
    install: (app) => { app.login = () => "logged in" },
    uninstall: (app) => { delete app.login }
});

arch.register({
    name: "profile",
    version: "1.0",
    dependencies: ["auth"],
    install: (app) => { app.getProfile = () => "profile data" },
    uninstall: (app) => { delete app.getProfile }
});

arch.install("profile");

console.log(arch.isInstalled("auth"));
console.log(arch.isInstalled("profile"));
console.log(arch.getInstalledCapabilities());
console.log(arch.uninstall("auth"));
console.log(arch.getPluginReport());


// --- Invalid Input ---
console.log(buildPluginArchitecture("invalid"));