// 🧩 PROBLEM–01: createBrowserSimulator()

// Logic: This function creates a virtual browser environment. It combines a simple DOM, localStorage, history and timer simulator.

// Supported systems:
// 1. Virtual DOM
// 2. Virtual localStorage with quota + TTL
// 3. Browser history
// 4. Virtual setTimeout + tick
// 5. Browser snapshot/report


function createBrowserSimulator(config) {
    // --- STEP 1: VALIDATE INPUT ---

    // Config must be a non-null object.
    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        initialURL,
        storageQuota,
        viewportWidth,
        viewportHeight
    } = config;

    // Validate initialURL.
    if (
        typeof initialURL !== "string" ||
        initialURL.trim() === ""
    ) {
        return "Invalid Input";
    }

    // Validate numeric configuration values.
    if (
        typeof storageQuota !== "number" ||
        !Number.isFinite(storageQuota) ||
        storageQuota <= 0
    ) {
        return "Invalid Input";
    }

    if (
        typeof viewportWidth !== "number" ||
        !Number.isFinite(viewportWidth) ||
        viewportWidth <= 0
    ) {
        return "Invalid Input";
    }

    if (
        typeof viewportHeight !== "number" ||
        !Number.isFinite(viewportHeight) ||
        viewportHeight <= 0
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: CREATE INTERNAL STATE ---

    const domElements = [];
    const storage = new Map();

    let currentTime = 0;

    const historyStack = [initialURL];
    let historyIndex = 0;

    const timers = new Map();

    let elementIdCounter = 1;
    let timerIdCounter = 1;

    // --- STEP 3: HELPER FUNCTIONS ---

    // Estimate storage size in KB.
    function calculateStorageUsage() {
        let totalBytes = 0;

        for (const [key, item] of storage) {
            totalBytes += key.length;
            totalBytes += JSON.stringify(item.value).length;
        }

        return totalBytes / 1024;
    }

    // Remove expired storage items.
    function cleanupExpiredStorage() {
        for (const [key, item] of storage) {
            if (
                item.expiresAt !== null &&
                currentTime >= item.expiresAt
            ) {
                storage.delete(key);
            }
        }
    }

    // Check whether a selector matches an element.
    function matchesSelector(element, selector) {
        if (typeof selector !== "string" || selector.trim() === "") {
            return false;
        }

        selector = selector.trim();

        // #id selector
        if (selector.startsWith("#")) {
            return element.id === selector.slice(1);
        }

        // .class selector
        if (selector.startsWith(".")) {
            return element.classes.includes(selector.slice(1));
        }

        // tag selector
        return element.tag === selector.toLowerCase();
    }

    // --- STEP 4: DOM ENGINE ---

    const dom = {
        createElement(tag, options = {}) {
            // Validate tag.
            if (
                typeof tag !== "string" ||
                tag.trim() === ""
            ) {
                return "Invalid Input";
            }

            // Options must be an object.
            if (
                typeof options !== "object" ||
                options === null ||
                Array.isArray(options)
            ) {
                return "Invalid Input";
            }

            const classes = Array.isArray(options.classes)
                ? options.classes.filter(
                    item => typeof item === "string" && item.trim() !== ""
                )
                : [];

            const element = {
                id: `element-${elementIdCounter++}`,
                tag: tag.toLowerCase(),
                classes: [...classes],
                text:
                    typeof options.text === "string"
                        ? options.text
                        : "",
                attributes:
                    typeof options.attributes === "object" &&
                        options.attributes !== null &&
                        !Array.isArray(options.attributes)
                        ? { ...options.attributes }
                        : {}
            };

            return element;
        },

        querySelector(selector) {
            const element = domElements.find(
                item => matchesSelector(item, selector)
            );

            return element || null;
        },

        registerElement(element) {
            if (
                typeof element !== "object" ||
                element === null ||
                Array.isArray(element)
            ) {
                return "Invalid Input";
            }

            if (
                typeof element.id !== "string" ||
                typeof element.tag !== "string"
            ) {
                return "Invalid Input";
            }

            domElements.push(element);

            return element;
        }
    };

    // --- STEP 5: STORAGE ENGINE ---

    const storageAPI = {
        set(key, value, ttl = null) {
            if (
                typeof key !== "string" ||
                key.trim() === ""
            ) {
                return "Invalid Input";
            }

            if (
                ttl !== null &&
                (
                    typeof ttl !== "number" ||
                    !Number.isFinite(ttl) ||
                    ttl < 0
                )
            ) {
                return "Invalid Input";
            }

            cleanupExpiredStorage();

            const expiresAt =
                ttl === null
                    ? null
                    : currentTime + ttl;

            // Temporarily store the item.
            const oldValue = storage.get(key);

            storage.set(key, {
                value,
                expiresAt
            });

            // Enforce quota.
            if (calculateStorageUsage() > storageQuota) {
                if (oldValue) {
                    storage.set(key, oldValue);
                } else {
                    storage.delete(key);
                }

                return false;
            }

            return true;
        },

        get(key) {
            if (
                typeof key !== "string" ||
                key.trim() === ""
            ) {
                return "Invalid Input";
            }

            cleanupExpiredStorage();

            const item = storage.get(key);

            return item ? item.value : null;
        }
    };

    // --- STEP 6: HISTORY ENGINE ---

    const historyAPI = {
        pushState(state, url) {
            if (typeof url !== "string" || url.trim() === "") {
                return "Invalid Input";
            }

            // Remove forward history.
            historyStack.splice(historyIndex + 1);

            // Resolve relative URL against current URL.
            const nextURL = new URL(url, historyStack[historyIndex]).href;

            historyStack.push(nextURL);
            historyIndex++;

            return {
                url: nextURL,
                state
            };
        },

        back() {
            if (historyIndex === 0) {
                return null;
            }

            historyIndex--;

            return historyStack[historyIndex];
        },

        forward() {
            if (historyIndex >= historyStack.length - 1) {
                return null;
            }

            historyIndex++;

            return historyStack[historyIndex];
        }
    };

    // --- STEP 7: TIMER ENGINE ---

    const timersAPI = {
        setTimeout(name, fn, delay) {
            if (
                typeof name !== "string" ||
                name.trim() === "" ||
                typeof fn !== "function" ||
                typeof delay !== "number" ||
                !Number.isFinite(delay) ||
                delay < 0
            ) {
                return "Invalid Input";
            }

            const id = timerIdCounter++;

            timers.set(id, {
                id,
                name,
                fn,
                executeAt: currentTime + delay
            });

            return id;
        },

        tick(ms) {
            if (
                typeof ms !== "number" ||
                !Number.isFinite(ms) ||
                ms < 0
            ) {
                return "Invalid Input";
            }

            currentTime += ms;

            const firedTimers = [];
            const executionLog = [];

            for (const [id, timer] of [...timers]) {
                if (timer.executeAt <= currentTime) {
                    let result;

                    try {
                        result = timer.fn();
                    } catch (error) {
                        result = "Timer Error";
                    }

                    firedTimers.push(timer.name);

                    executionLog.push({
                        name: timer.name,
                        result
                    });

                    timers.delete(id);
                }
            }

            cleanupExpiredStorage();

            return {
                firedTimers,
                executionLog
            };
        }
    };

    // --- STEP 8: SNAPSHOT ---

    function getSnapshot() {
        cleanupExpiredStorage();

        return {
            currentURL: historyStack[historyIndex],
            domElements: domElements.map(element => ({
                id: element.id,
                tag: element.tag,
                classes: [...element.classes],
                text: element.text
            })),
            storageKeys: [...storage.keys()],
            activeTimers: [...timers.values()].map(timer => timer.name),
            historyStack: [...historyStack]
        };
    }

    // --- STEP 9: REPORT ---

    function getReport() {
        cleanupExpiredStorage();

        return {
            url: historyStack[historyIndex],
            storageUsed: `${calculateStorageUsage().toFixed(2)}KB`,
            domCount: domElements.length,
            timerCount: timers.size,
            historySize: historyStack.length
        };
    }

    // --- STEP 10: RETURN BROWSER API ---

    return {
        viewport: {
            width: viewportWidth,
            height: viewportHeight
        },
        dom,
        storage: storageAPI,
        history: historyAPI,
        timers: timersAPI,
        getSnapshot,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const browser = createBrowserSimulator({
    initialURL: "https://app.com/",
    storageQuota: 50,
    viewportWidth: 1920,
    viewportHeight: 1080
});

const box = browser.dom.createElement("div", {
    classes: ["container"],
    text: "Hello"
});


browser.dom.registerElement(box);

browser.storage.set(
    "user",
    { name: "Rahim" },
    3600
);

browser.history.pushState(
    { page: "about" },
    "/about"
);

browser.timers.setTimeout(
    "greet",
    () => "Hello!",
    100
);

browser.timers.tick(100);


console.log(browser.getSnapshot());
console.log(browser.getReport());


// --- Invalid Input ---

console.log(createBrowserSimulator(null));

console.log(
    createBrowserSimulator({
        initialURL: "",
        storageQuota: 50,
        viewportWidth: 1920,
        viewportHeight: 1080
    })
);