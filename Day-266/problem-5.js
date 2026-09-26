// 🧩 PROBLEM–05: createEventDelegationManager()

// Logic: This function creates an event delegation manager that registers handlers on a root element and matches them against target descriptors using tag, class, and id selectors.


function createEventDelegationManager(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.rootId !== 'string' ||
        typeof config.stopOnMatch !== 'boolean'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE DELEGATION STATE ---
    const delegatedHandlers = new Map(); // eventType -> Array of { selector, handlerName, fn }
    const matchHistory = []; // Array of { eventType, targetDescriptor, matched, results, stoppedEarly }
    const rootId = config.rootId;

    // --- STEP 3: HELPER - MATCH SELECTOR ---
    function matchesSelector(targetDescriptor, selector) {
        // selector formats: "tag", ".class", "#id", "tag.class"
        if (selector.startsWith("#")) {
            // ID selector
            return targetDescriptor.id === selector.slice(1);
        } else if (selector.startsWith(".")) {
            // Class selector
            return targetDescriptor.classes && targetDescriptor.classes.includes(selector.slice(1));
        } else if (selector.includes(".")) {
            // Tag + class: "tag.class"
            const [tag, className] = selector.split(".");
            return targetDescriptor.tag === tag && targetDescriptor.classes && targetDescriptor.classes.includes(className);
        } else {
            // Tag selector
            return targetDescriptor.tag === selector;
        }
    }

    // --- STEP 4: DEFINE DELEGATE ---
    function delegate(eventType, selector, handlerName, fn) {
        if (
            typeof eventType !== 'string' ||
            typeof selector !== 'string' ||
            typeof handlerName !== 'string' ||
            typeof fn !== 'function'
        ) {
            return "Invalid Input";
        }

        if (!delegatedHandlers.has(eventType)) {
            delegatedHandlers.set(eventType, []);
        }
        delegatedHandlers.get(eventType).push({ selector, handlerName, fn });
    }

    // --- STEP 5: DEFINE UNDELEGATE ---
    function undelegate(eventType, handlerName) {
        if (!delegatedHandlers.has(eventType)) return false;

        const handlers = delegatedHandlers.get(eventType);
        const idx = handlers.findIndex(h => h.handlerName === handlerName);
        if (idx === -1) return false;

        handlers.splice(idx, 1);
        return true;
    }

    // --- STEP 6: DEFINE TRIGGER ---
    function trigger(eventType, targetDescriptor) {
        if (
            typeof eventType !== 'string' ||
            !targetDescriptor ||
            typeof targetDescriptor !== 'object' ||
            typeof targetDescriptor.id !== 'string' ||
            typeof targetDescriptor.tag !== 'string' ||
            !Array.isArray(targetDescriptor.classes)
        ) {
            return "Invalid Input";
        }

        const handlers = delegatedHandlers.get(eventType) || [];
        const matched = [];
        const results = [];
        let stoppedEarly = false;

        for (const handler of handlers) {
            if (matchesSelector(targetDescriptor, handler.selector)) {
                matched.push(handler.handlerName);
                try {
                    const result = handler.fn(targetDescriptor);
                    results.push(result);
                    if (config.stopOnMatch) {
                        stoppedEarly = true;
                        break;
                    }
                } catch (e) {
                    results.push(`Error: ${e.message}`);
                }
            }
        }

        const matchResult = { matched, results, stoppedEarly };
        matchHistory.push({ eventType, targetDescriptor, ...matchResult });
        return matchResult;
    }

    // --- STEP 7: DEFINE GETDELEGATEDHANDLERS ---
    function getDelegatedHandlers(eventType) {
        const handlers = delegatedHandlers.get(eventType) || [];
        return handlers.map(h => h.handlerName);
    }

    // --- STEP 8: DEFINE GETMATCHHISTORY ---
    function getMatchHistory() {
        return matchHistory.map(h => ({ ...h }));
    }

    // --- STEP 9: DEFINE GETREPORT ---
    function getReport() {
        let totalDelegated = 0;
        const byEventType = {};

        for (const [eventType, handlers] of delegatedHandlers) {
            totalDelegated += handlers.length;
            byEventType[eventType] = handlers.length;
        }

        let totalTriggered = matchHistory.length;
        let totalMatched = 0;
        for (const h of matchHistory) {
            totalMatched += h.matched.length;
        }

        return {
            totalDelegated,
            byEventType,
            totalTriggered,
            totalMatched
        };
    }

    // --- STEP 10: RETURN API ---
    return {
        delegate,
        undelegate,
        trigger,
        getDelegatedHandlers,
        getMatchHistory,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const manager = createEventDelegationManager({ rootId: "app", stopOnMatch: false });

manager.delegate("click", ".btn", "handleBtn", (e) => "Button clicked: " + e.id);
manager.delegate("click", "button", "handleAnyBtn", (e) => "Any button: " + e.id);
manager.delegate("click", "#submitBtn", "handleSubmit", (e) => "Submit: " + e.id);

console.log(manager.trigger("click", { id: "submitBtn", tag: "button", classes: ["btn", "primary"] }));
console.log(manager.getDelegatedHandlers("click"));
console.log(manager.getReport());

// --- Invalid Input ---
console.log(createEventDelegationManager("invalid"));