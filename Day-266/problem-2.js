// 🧩 PROBLEM–02: createEventRegistry()

// Logic: This function creates an event listener registry with support for once, capture, passive options, duplicate prevention, and listener management.


function createEventRegistry(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.maxListenersPerEvent !== 'number' ||
        typeof config.allowDuplicates !== 'boolean'
    ) {
        return "Invalid Input";
    }
    if (config.maxListenersPerEvent <= 0) return "Invalid Input";

    // --- STEP 2: INITIALIZE REGISTRY STATE ---
    const registry = new Map(); // elementId -> eventType -> [{ name, handler, options }]
    let listenerId = 0;

    // --- STEP 3: DEFINE ON ---
    function on(elementId, eventType, handlerName, handlerFn, options) {
        if (
            typeof elementId !== 'string' ||
            typeof eventType !== 'string' ||
            typeof handlerName !== 'string' ||
            typeof handlerFn !== 'function' ||
            !options ||
            typeof options !== 'object'
        ) {
            return "Invalid Input";
        }

        if (!registry.has(elementId)) {
            registry.set(elementId, new Map());
        }
        const elementEvents = registry.get(elementId);

        if (!elementEvents.has(eventType)) {
            elementEvents.set(eventType, []);
        }
        const listeners = elementEvents.get(eventType);

        // Check max listeners
        if (listeners.length >= config.maxListenersPerEvent) {
            return "Max Listeners Reached";
        }

        // Check duplicates
        if (!config.allowDuplicates) {
            const exists = listeners.some(l => l.name === handlerName);
            if (exists) return "Duplicate Handler";
        }

        listenerId++;
        const listener = {
            id: listenerId,
            name: handlerName,
            handler: handlerFn,
            options: {
                once: !!options.once,
                capture: !!options.capture,
                passive: !!options.passive
            }
        };
        listeners.push(listener);
        return true;
    }

    // --- STEP 4: DEFINE OFF ---
    function off(elementId, eventType, handlerName) {
        if (
            typeof elementId !== 'string' ||
            typeof eventType !== 'string' ||
            typeof handlerName !== 'string'
        ) {
            return "Invalid Input";
        }

        const elementEvents = registry.get(elementId);
        if (!elementEvents) return false;

        const listeners = elementEvents.get(eventType);
        if (!listeners) return false;

        const idx = listeners.findIndex(l => l.name === handlerName);
        if (idx === -1) return false;

        listeners.splice(idx, 1);
        return true;
    }

    // --- STEP 5: DEFINE ONCE ---
    function once(elementId, eventType, handlerName, handlerFn) {
        return on(elementId, eventType, handlerName, handlerFn, { once: true, capture: false, passive: false });
    }

    // --- STEP 6: DEFINE EMIT ---
    function emit(elementId, eventType, eventData) {
        if (
            typeof elementId !== 'string' ||
            typeof eventType !== 'string' ||
            !eventData ||
            typeof eventData !== 'object'
        ) {
            return "Invalid Input";
        }

        const elementEvents = registry.get(elementId);
        if (!elementEvents) return [];

        const listeners = elementEvents.get(eventType);
        if (!listeners) return [];

        const results = [];
        const toRemove = [];

        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            try {
                const result = listener.handler(eventData);
                results.push(result);
                if (listener.options.once) {
                    toRemove.push(i);
                }
            } catch (e) {
                results.push(`Error: ${e.message}`);
            }
        }

        // Remove once listeners (in reverse order to maintain indices)
        for (let i = toRemove.length - 1; i >= 0; i--) {
            listeners.splice(toRemove[i], 1);
        }

        return results;
    }

    // --- STEP 7: DEFINE GETLISTENERS ---
    function getListeners(elementId, eventType) {
        const elementEvents = registry.get(elementId);
        if (!elementEvents) return [];

        const listeners = elementEvents.get(eventType);
        if (!listeners) return [];

        return listeners.map(l => l.name);
    }

    // --- STEP 8: DEFINE REMOVEALLLISTENERS ---
    function removeAllListeners(elementId) {
        if (typeof elementId !== 'string') return false;
        const elementEvents = registry.get(elementId);
        if (!elementEvents) return false;
        registry.delete(elementId);
        return true;
    }

    // --- STEP 9: DEFINE GETSTATS ---
    function getStats() {
        let totalElements = 0;
        let totalListeners = 0;
        const eventTypeDistribution = {};

        for (const [, elementEvents] of registry) {
            totalElements++;
            for (const [eventType, listeners] of elementEvents) {
                totalListeners += listeners.length;
                eventTypeDistribution[eventType] = (eventTypeDistribution[eventType] || 0) + listeners.length;
            }
        }

        return {
            totalElements,
            totalListeners,
            eventTypeDistribution
        };
    }

    // --- STEP 10: RETURN API ---
    return {
        on,
        off,
        once,
        emit,
        getListeners,
        removeAllListeners,
        getStats
    };
}

// --- EXAMPLE USAGE ---
const registry = createEventRegistry({ maxListenersPerEvent: 5, allowDuplicates: false });

registry.on("btn1", "click", "handleClick", (e) => "clicked: " + e.target, { once: false, capture: false, passive: false });

registry.on("btn1", "click", "logClick", (e) => "logged: " + e.target, { once: false, capture: false, passive: false });

registry.once("btn1", "mouseenter", "hoverOnce", (e) => "hovered");

console.log(registry.emit("btn1", "click", { target: "btn1" }));
console.log(registry.emit("btn1", "mouseenter", { target: "btn1" }));
console.log(registry.emit("btn1", "mouseenter", { target: "btn1" }));
console.log(registry.getListeners("btn1", "click"));
console.log(registry.getStats());


// --- Invalid Input ---
console.log(createEventRegistry("invalid"));