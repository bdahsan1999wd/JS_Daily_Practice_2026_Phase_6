// 🧩 PROBLEM–03: createCustomEventSystem()

// Logic: This function creates a custom event system with schema validation, wildcard subscriptions, history tracking, and event replay.

function createCustomEventSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        typeof config.allowWildcard !== 'boolean' ||
        typeof config.maxHistory !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.maxHistory < 0) return "Invalid Input";

    // --- STEP 2: INITIALIZE SYSTEM STATE ---
    const eventSchemas = new Map(); // eventName -> { required: [], optional: [] }
    const subscribers = new Map(); // eventName -> Set of { name, fn }
    const wildcardSubscribers = new Set(); // { name, fn }
    const history = new Map(); // eventName -> Array of dispatched data
    const systemName = config.systemName;

    // --- STEP 3: VALIDATE SCHEMA ---
    function validateSchema(data, schema) {
        if (!schema) return true;
        for (const field of schema.required) {
            if (!(field in data)) return false;
        }
        return true;
    }

    // --- STEP 4: DEFINE DEFINEEVENT ---
    function defineEvent(eventName, schema) {
        if (
            typeof eventName !== 'string' ||
            !schema ||
            typeof schema !== 'object' ||
            !Array.isArray(schema.required) ||
            !Array.isArray(schema.optional)
        ) {
            return "Invalid Input";
        }
        eventSchemas.set(eventName, schema);
        if (!history.has(eventName)) history.set(eventName, []);
    }

    // --- STEP 5: DEFINE DISPATCH ---
    function dispatch(eventName, data) {
        if (typeof eventName !== 'string' || !data || typeof data !== 'object') {
            return "Invalid Input";
        }

        const schema = eventSchemas.get(eventName);
        const validationPassed = validateSchema(data, schema);

        if (!validationPassed) {
            return { dispatched: false, subscriberCount: 0, validationPassed: false };
        }

        // Store in history
        if (!history.has(eventName)) history.set(eventName, []);
        const eventHistory = history.get(eventName);
        eventHistory.push({ ...data });
        if (eventHistory.length > config.maxHistory) {
            eventHistory.shift();
        }

        // Notify subscribers
        let subscriberCount = 0;
        const specificSubs = subscribers.get(eventName) || new Set();
        for (const sub of specificSubs) {
            try { sub.fn(data); subscriberCount++; } catch (e) { }
        }
        if (config.allowWildcard) {
            for (const sub of wildcardSubscribers) {
                try { sub.fn(data); subscriberCount++; } catch (e) { }
            }
        }

        return { dispatched: true, subscriberCount, validationPassed: true };
    }

    // --- STEP 6: DEFINE SUBSCRIBE ---
    function subscribe(eventName, subscriberName, fn) {
        if (
            typeof eventName !== 'string' ||
            typeof subscriberName !== 'string' ||
            typeof fn !== 'function'
        ) {
            return "Invalid Input";
        }
        if (eventName === "*") {
            wildcardSubscribers.add({ name: subscriberName, fn });
            return true;
        }
        if (!subscribers.has(eventName)) {
            subscribers.set(eventName, new Set());
        }
        subscribers.get(eventName).add({ name: subscriberName, fn });
        return true;
    }

    // --- STEP 7: DEFINE UNSUBSCRIBE ---
    function unsubscribe(eventName, subscriberName) {
        if (eventName === "*") {
            for (const sub of wildcardSubscribers) {
                if (sub.name === subscriberName) {
                    wildcardSubscribers.delete(sub);
                    return true;
                }
            }
            return false;
        }
        const subs = subscribers.get(eventName);
        if (!subs) return false;
        for (const sub of subs) {
            if (sub.name === subscriberName) {
                subs.delete(sub);
                return true;
            }
        }
        return false;
    }

    // --- STEP 8: DEFINE GETHISTORY ---
    function getHistory(eventName) {
        if (!history.has(eventName)) return [];
        return history.get(eventName).map(h => ({ ...h }));
    }

    // --- STEP 9: DEFINE REPLAY ---
    function replay(eventName, index) {
        const eventHistory = history.get(eventName);
        if (!eventHistory || index < 0 || index >= eventHistory.length) {
            return "Invalid Index";
        }
        return dispatch(eventName, eventHistory[index]);
    }

    // --- STEP 10: DEFINE GETSYSTEMREPORT ---
    function getSystemReport() {
        let totalSubscribers = 0;
        for (const subs of subscribers.values()) totalSubscribers += subs.size;
        totalSubscribers += wildcardSubscribers.size;

        let totalDispatched = 0;
        for (const hist of history.values()) totalDispatched += hist.length;

        return {
            totalEvents: eventSchemas.size,
            totalSubscribers,
            totalDispatched,
            historySize: totalDispatched
        };
    }

    // --- STEP 11: RETURN API ---
    return {
        defineEvent,
        dispatch,
        subscribe,
        unsubscribe,
        getHistory,
        replay,
        getSystemReport
    };
}


// --- EXAMPLE USAGE ---
const system = createCustomEventSystem({ systemName: "AppEvents", allowWildcard: true, maxHistory: 10 });

system.defineEvent("userLogin", { required: ["userId", "timestamp"], optional: ["device"] });
system.subscribe("userLogin", "analyticsService", (data) => "Analytics: " + data.userId);
system.subscribe("userLogin", "auditLogger", (data) => "Audit: " + data.userId);
system.subscribe("*", "globalLogger", (data) => "Global log");

console.log(system.dispatch("userLogin", { userId: "U001", timestamp: 1620000000 }));
console.log(system.dispatch("userLogin", { userId: "U002" }));
console.log(system.getHistory("userLogin"));
console.log(system.getSystemReport());


// --- Invlid Input ---
console.log(createCustomEventSystem("invalid"));