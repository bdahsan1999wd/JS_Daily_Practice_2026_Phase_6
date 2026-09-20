// 🧩 PROBLEM–01: buildMixinSystem()

// Logic: This function builds a mixin system that injects behaviors
// (Serializable, Validatable, Loggable, Comparable) into classes
// via composition. It tracks mixin usage and handles conflicts.


function buildMixinSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        typeof config.allowConflicts !== 'boolean'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE MIXIN BEHAVIORS ---
    const mixins = {
        Serializable: {
            serialize() {
                const ownProps = {};
                for (const key of Object.keys(this)) {
                    if (!key.startsWith('_') && typeof this[key] !== 'function') {
                        ownProps[key] = this[key];
                    }
                }
                return JSON.stringify(ownProps);
            },
            deserialize(json) {
                const data = JSON.parse(json);
                for (const [key, value] of Object.entries(data)) {
                    this[key] = value;
                }
            }
        },
        Validatable: {
            _validationRules: new Map(),
            validate() {
                const errors = [];
                for (const [field, rule] of this._validationRules) {
                    if (!rule(this[field])) {
                        errors.push(`Validation failed for ${field}`);
                    }
                }
                return { valid: errors.length === 0, errors };
            },
            addRule(field, ruleFn) {
                if (!this._validationRules) this._validationRules = new Map();
                this._validationRules.set(field, ruleFn);
            }
        },
        Loggable: {
            _logs: [],
            log(message) {
                const entry = { message, timestamp: Date.now() };
                this._logs.push(entry);
                return this._logs;
            },
            getLogs() {
                return this._logs || [];
            }
        },
        Comparable: {
            compareTo(other, field) {
                const a = this[field];
                const b = other[field];
                if (a < b) return -1;
                if (a > b) return 1;
                return 0;
            },
            isEqualTo(other) {
                const keys = new Set([...Object.keys(this), ...Object.keys(other)]);
                for (const key of keys) {
                    if (typeof this[key] === 'function' || typeof other[key] === 'function') continue;
                    if (this[key] !== other[key]) return false;
                }
                return true;
            }
        }
    };

    // --- STEP 3: INITIALIZE SYSTEM STATE ---
    const classDefinitions = new Map(); // className -> { properties, mixins: [] }
    const instances = new Map(); // className -> instance

    // --- STEP 4: DEFINE CREATECLASS ---
    function createClass(className, baseProperties) {
        if (typeof className !== 'string' || !Array.isArray(baseProperties)) {
            return "Invalid Input";
        }
        if (classDefinitions.has(className)) return "Class Exists";

        classDefinitions.set(className, {
            properties: baseProperties,
            mixins: []
        });
    }

    // --- STEP 5: DEFINE APPLYMIXIN ---
    function applyMixin(className, ...mixinNames) {
        const def = classDefinitions.get(className);
        if (!def) return "Class Not Found";

        for (const mixinName of mixinNames) {
            if (!mixins[mixinName]) return `Mixin Not Found: ${mixinName}`;

            // Check for conflicts
            if (!config.allowConflicts) {
                for (const existingMixin of def.mixins) {
                    const existingMethods = Object.getOwnPropertyNames(mixins[existingMixin]).filter(m => typeof mixins[existingMixin][m] === 'function');
                    const newMethods = Object.getOwnPropertyNames(mixins[mixinName]).filter(m => typeof mixins[mixinName][m] === 'function');
                    for (const method of newMethods) {
                        if (existingMethods.includes(method)) {
                            return `Conflict: ${method} already exists from ${existingMixin}`;
                        }
                    }
                }
            }

            def.mixins.push(mixinName);
        }
    }

    // --- STEP 6: DEFINE GETINSTANCE ---
    function getInstance(className, values) {
        const def = classDefinitions.get(className);
        if (!def) return "Class Not Found";

        // Create base instance
        const instance = {};
        for (const prop of def.properties) {
            instance[prop] = values[prop];
        }

        // Apply mixin behaviors
        for (const mixinName of def.mixins) {
            const mixin = mixins[mixinName];
            for (const [key, value] of Object.entries(mixin)) {
                if (typeof value === 'function') {
                    instance[key] = value.bind(instance);
                } else {
                    instance[key] = value;
                }
            }
        }

        instances.set(className, instance);
        return instance;
    }

    // --- STEP 7: DEFINE LISTMIXINS ---
    function listMixins(className) {
        const def = classDefinitions.get(className);
        return def ? [...def.mixins] : [];
    }

    // --- STEP 8: DEFINE GETREPORT ---
    function getReport() {
        const mixinUsage = {};
        for (const def of classDefinitions.values()) {
            for (const mixin of def.mixins) {
                mixinUsage[mixin] = (mixinUsage[mixin] || 0) + 1;
            }
        }
        return {
            totalClasses: classDefinitions.size,
            mixinUsage
        };
    }

    // --- STEP 9: RETURN API ---
    return {
        createClass,
        applyMixin,
        getInstance,
        listMixins,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const system = buildMixinSystem({ systemName: "MixinLab", allowConflicts: false });

system.createClass("User", ["name", "email", "age"]);
system.applyMixin("User", "Serializable", "Loggable", "Validatable");
const user = system.getInstance("User", { name: "Rahim", email: "rahim@mail.com", age: 25 });

console.log(user.serialize());
console.log(user.log("User created"));

user.addRule("age", val => val >= 18);
console.log(user.validate());
console.log(system.listMixins("User"));
console.log(system.getReport());


// --- Invalid Input ---
console.log(buildMixinSystem("invalid"));