// 🧩 PROBLEM–04: createInputEventSimulator()

// Logic: This function creates an input event simulator for mouse and keyboard events with click/double-click detection, shortcut detection, and event history.


function createInputEventSimulator(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.targetId !== 'string' ||
        typeof config.recordHistory !== 'boolean' ||
        typeof config.doubleClickThreshold !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.doubleClickThreshold <= 0) return "Invalid Input";

    // --- STEP 2: INITIALIZE SIMULATOR STATE ---
    const targetId = config.targetId;
    let eventCounter = 0;
    const history = [];
    const lastClick = { time: 0, x: 0, y: 0, button: null };
    const shortcutMap = new Map();

    // --- STEP 3: HELPER - CREATE EVENT ---
    function createEvent(type, data) {
        eventCounter++;
        const event = {
            type,
            ...data,
            timestamp: eventCounter
        };
        if (config.recordHistory) {
            history.push(event);
        }
        return event;
    }

    // --- STEP 4: HELPER - DETECT SHORTCUT ---
    function getShortcut(key, modifiers) {
        const parts = [];
        if (modifiers.ctrl) parts.push("Ctrl");
        if (modifiers.shift) parts.push("Shift");
        if (modifiers.alt) parts.push("Alt");
        if (modifiers.meta) parts.push("Meta");
        parts.push(key.toUpperCase());
        return parts.join("+");
    }

    // --- STEP 5: DEFINE SIMULATECLICK ---
    function simulateClick(x, y, button) {
        if (typeof x !== 'number' || typeof y !== 'number' || !["left", "right", "middle"].includes(button)) {
            return "Invalid Input";
        }

        const now = Date.now(); // Use real time for double-click detection
        // For simulation, use eventCounter as time
        const simTime = eventCounter + 1;

        let eventType = "click";

        // Check for double-click
        if (
            button === "left" &&
            lastClick.button === "left" &&
            lastClick.x === x &&
            lastClick.y === y &&
            (simTime - lastClick.time) <= config.doubleClickThreshold
        ) {
            eventType = "dblclick";
        }

        lastClick.time = simTime;
        lastClick.x = x;
        lastClick.y = y;
        lastClick.button = button;

        return createEvent(eventType, { x, y, button });
    }

    // --- STEP 6: DEFINE SIMULATEKEYDOWN ---
    function simulateKeydown(key, modifiers) {
        if (typeof key !== 'string' || !modifiers || typeof modifiers !== 'object') {
            return "Invalid Input";
        }

        const shortcut = getShortcut(key, modifiers);
        const count = (shortcutMap.get(shortcut) || 0) + 1;
        shortcutMap.set(shortcut, count);

        return createEvent("keydown", { key, modifiers, shortcut });
    }

    // --- STEP 7: DEFINE SIMULATESCROLL ---
    function simulateScroll(deltaX, deltaY) {
        if (typeof deltaX !== 'number' || typeof deltaY !== 'number') {
            return "Invalid Input";
        }

        let direction;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            direction = deltaY > 0 ? "down" : "up";
        } else {
            direction = deltaX > 0 ? "right" : "left";
        }

        return createEvent("scroll", { deltaX, deltaY, direction });
    }

    // --- STEP 8: DEFINE GETHISTORY ---
    function getEventHistory() {
        return history.map(e => ({ ...e }));
    }

    // --- STEP 9: DEFINE GETSHORTCUTMAP ---
    function getShortcutMap() {
        const result = {};
        for (const [shortcut, count] of shortcutMap) {
            result[shortcut] = count;
        }
        return result;
    }

    // --- STEP 10: DEFINE GETREPORT ---
    function getReport() {
        const byType = {};
        for (const event of history) {
            byType[event.type] = (byType[event.type] || 0) + 1;
        }
        let mostFrequent = null;
        let maxCount = 0;
        for (const [type, count] of Object.entries(byType)) {
            if (count > maxCount) {
                maxCount = count;
                mostFrequent = type;
            }
        }
        return {
            totalEvents: history.length,
            byType,
            mostFrequent
        };
    }

    // --- STEP 11: RETURN API ---
    return {
        simulateClick,
        simulateKeydown,
        simulateScroll,
        getEventHistory,
        getShortcutMap,
        getReport
    };
}

// --- EXAMPLE USAGE ---
const sim = createInputEventSimulator({ targetId: "canvas", recordHistory: true, doubleClickThreshold: 2 });

console.log(sim.simulateClick(100, 200, "left"));

console.log(sim.simulateClick(100, 200, "left"));

console.log(sim.simulateKeydown("c", { ctrl: true, shift: false, alt: false, meta: false }));

console.log(sim.simulateScroll(0, -100));

console.log(sim.getShortcutMap());

console.log(sim.getReport());


// --- Invalid Input ---
console.log(createInputEventSimulator("invalid"));