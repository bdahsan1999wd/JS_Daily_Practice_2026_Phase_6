// 🧩 PROBLEM–05: createBrowserMasterSystem()

// Logic: This is the final Browser Master System.

// It combines:
// 1. DOM Engine
// 2. Event System
// 3. Form Validation
// 4. Storage
// 5. Timer Engine
// 6. Animation Engine
// 7. URL Router

// Everything runs inside one virtual browser environment.


function createBrowserMasterSystem(config) {
    // --- STEP 1: VALIDATE CONFIG ---

    if (
        typeof config !== "object" ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    const {
        appName,
        baseURL,
        theme,
        storageQuota,
        targetFPS
    } = config;

    if (
        typeof appName !== "string" ||
        appName.trim() === ""
    ) {
        return "Invalid Input";
    }

    if (
        typeof baseURL !== "string" ||
        baseURL.trim() === ""
    ) {
        return "Invalid Input";
    }

    if (
        theme !== "light" &&
        theme !== "dark"
    ) {
        return "Invalid Input";
    }

    if (
        typeof storageQuota !== "number" ||
        !Number.isFinite(storageQuota) ||
        storageQuota <= 0
    ) {
        return "Invalid Input";
    }

    if (
        typeof targetFPS !== "number" ||
        !Number.isFinite(targetFPS) ||
        targetFPS <= 0
    ) {
        return "Invalid Input";
    }

    // Validate URL.
    let parsedBaseURL;

    try {
        parsedBaseURL = new URL(baseURL);
    } catch (error) {
        return "Invalid Input";
    }

    // --- STEP 2: GLOBAL STATE ---

    const elements = new Map();
    const eventListeners = new Map();

    const storage = new Map();

    const timers = new Map();

    const keyframes = new Map();

    const routes = new Map();

    let currentURL = parsedBaseURL.href;

    let currentTime = 0;

    let totalFiredTimers = 0;

    let elementCounter = 1;
    let timerCounter = 1;

    // --- STEP 3: DOM ENGINE ---

    const dom = {
        create(tag, options = {}) {
            if (
                typeof tag !== "string" ||
                tag.trim() === ""
            ) {
                return "Invalid Input";
            }

            if (
                typeof options !== "object" ||
                options === null ||
                Array.isArray(options)
            ) {
                return "Invalid Input";
            }

            const element = {
                id: `element-${elementCounter++}`,
                tag: tag.toLowerCase(),
                classes: Array.isArray(options.classes)
                    ? options.classes
                    : [],
                text:
                    typeof options.text === "string"
                        ? options.text
                        : ""
            };

            elements.set(element.id, element);

            return element;
        },

        query(selector) {
            if (
                typeof selector !== "string" ||
                selector.trim() === ""
            ) {
                return "Invalid Input";
            }

            selector = selector.trim();

            for (const element of elements.values()) {
                if (
                    selector.startsWith("#") &&
                    element.id === selector.slice(1)
                ) {
                    return element;
                }

                if (
                    selector.startsWith(".") &&
                    element.classes.includes(
                        selector.slice(1)
                    )
                ) {
                    return element;
                }

                if (
                    !selector.startsWith("#") &&
                    !selector.startsWith(".") &&
                    element.tag === selector.toLowerCase()
                ) {
                    return element;
                }
            }

            return null;
        }
    };

    // --- STEP 4: EVENT ENGINE ---

    const events = {
        on(elementId, event, fn) {
            if (
                typeof elementId !== "string" ||
                typeof event !== "string" ||
                event.trim() === "" ||
                typeof fn !== "function"
            ) {
                return "Invalid Input";
            }

            if (!elements.has(elementId)) {
                return "Invalid Input";
            }

            if (!eventListeners.has(elementId)) {
                eventListeners.set(
                    elementId,
                    new Map()
                );
            }

            const elementEvents =
                eventListeners.get(elementId);

            if (!elementEvents.has(event)) {
                elementEvents.set(event, []);
            }

            elementEvents
                .get(event)
                .push(fn);

            return {
                registered: true,
                elementId,
                event
            };
        },

        emit(elementId, event, data = null) {
            if (
                typeof elementId !== "string" ||
                typeof event !== "string"
            ) {
                return "Invalid Input";
            }

            const elementEvents =
                eventListeners.get(elementId);

            if (!elementEvents) {
                return [];
            }

            const listeners =
                elementEvents.get(event) || [];

            return listeners.map(fn => {
                try {
                    return fn(data);
                } catch (error) {
                    return null;
                }
            });
        }
    };

    // --- STEP 5: FORM ENGINE ---

    const forms = {
        validate(schema, data) {
            if (!Array.isArray(schema)) {
                return "Invalid Input";
            }

            if (
                typeof data !== "object" ||
                data === null ||
                Array.isArray(data)
            ) {
                return "Invalid Input";
            }

            const errors = {};

            for (const field of schema) {
                if (
                    typeof field !== "object" ||
                    field === null ||
                    typeof field.name !== "string" ||
                    field.name.trim() === ""
                ) {
                    return "Invalid Input";
                }

                const value = data[field.name];

                // Required validation.
                if (
                    field.required === true &&
                    (
                        value === undefined ||
                        value === null ||
                        value === ""
                    )
                ) {
                    errors[field.name] =
                        `${field.name} is required`;

                    continue;
                }

                // Skip optional empty values.
                if (
                    value === undefined ||
                    value === null ||
                    value === ""
                ) {
                    continue;
                }

                // Email validation.
                if (field.type === "email") {
                    const emailPattern =
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                    if (
                        typeof value !== "string" ||
                        !emailPattern.test(value)
                    ) {
                        errors[field.name] =
                            "Invalid email";
                    }
                }

                // Number validation.
                if (field.type === "number") {
                    if (
                        typeof value !== "number" ||
                        !Number.isFinite(value)
                    ) {
                        errors[field.name] =
                            "Invalid number";
                    }
                }

                // String validation.
                if (field.type === "string") {
                    if (typeof value !== "string") {
                        errors[field.name] =
                            "Invalid string";
                    }
                }

                // Custom rules.
                if (Array.isArray(field.rules)) {
                    for (const rule of field.rules) {
                        if (typeof rule !== "function") {
                            return "Invalid Input";
                        }

                        let valid = false;

                        try {
                            valid = rule(value) === true;
                        } catch (error) {
                            valid = false;
                        }

                        if (!valid) {
                            errors[field.name] =
                                "Custom validation failed";
                            break;
                        }
                    }
                }
            }

            return {
                valid: Object.keys(errors).length === 0,
                errors
            };
        }
    };

    // --- STEP 6: STORAGE ENGINE ---

    function getStorageUsage() {
        let bytes = 0;

        for (const [key, value] of storage) {
            bytes += key.length;
            bytes += JSON.stringify(value).length;
        }

        return bytes / 1024;
    }

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

            const oldValue = storage.get(key);

            storage.set(key, {
                value,
                expiresAt:
                    ttl === null
                        ? null
                        : currentTime + ttl
            });

            if (getStorageUsage() > storageQuota) {
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

            const item = storage.get(key);

            if (!item) {
                return null;
            }

            if (
                item.expiresAt !== null &&
                currentTime >= item.expiresAt
            ) {
                storage.delete(key);
                return null;
            }

            return item.value;
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

            const id = timerCounter++;

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
                    totalFiredTimers++;
                }
            }

            return {
                firedTimers,
                executionLog
            };
        }
    };

    // --- STEP 8: ANIMATION ENGINE ---

    const animation = {
        addKeyframe(
            name,
            prop,
            from,
            to,
            start,
            end
        ) {
            if (
                typeof name !== "string" ||
                name.trim() === "" ||
                typeof prop !== "string" ||
                prop.trim() === "" ||
                typeof from !== "number" ||
                typeof to !== "number" ||
                typeof start !== "number" ||
                typeof end !== "number" ||
                !Number.isFinite(from) ||
                !Number.isFinite(to) ||
                !Number.isFinite(start) ||
                !Number.isFinite(end) ||
                start < 0 ||
                end <= start
            ) {
                return "Invalid Input";
            }

            keyframes.set(name, {
                name,
                prop,
                from,
                to,
                start,
                end
            });

            return {
                name,
                prop,
                from,
                to,
                start,
                end
            };
        },

        play(ms) {
            if (
                typeof ms !== "number" ||
                !Number.isFinite(ms) ||
                ms < 0
            ) {
                return "Invalid Input";
            }

            const values = {};

            for (const keyframe of keyframes.values()) {
                let progress;

                if (ms <= keyframe.start) {
                    progress = 0;
                } else if (ms >= keyframe.end) {
                    progress = 1;
                } else {
                    progress =
                        (ms - keyframe.start) /
                        (keyframe.end - keyframe.start);
                }

                // Linear interpolation.
                const value =
                    keyframe.from +
                    (
                        keyframe.to -
                        keyframe.from
                    ) *
                    progress;

                values[keyframe.prop] = value;
            }

            const isComplete =
                [...keyframes.values()].every(
                    keyframe =>
                        ms >= keyframe.end
                );

            return {
                currentTime: ms,
                values,
                isComplete
            };
        }
    };

    // --- STEP 9: ROUTER ENGINE ---

    const router = {
        register(path, handler) {
            if (
                typeof path !== "string" ||
                path.trim() === "" ||
                !path.startsWith("/") ||
                typeof handler !== "function"
            ) {
                return "Invalid Input";
            }

            routes.set(path, handler);

            return {
                registered: true,
                route: path
            };
        },

        navigate(url) {
            if (
                typeof url !== "string" ||
                url.trim() === ""
            ) {
                return "Invalid Input";
            }

            let targetURL;

            try {
                targetURL =
                    new URL(
                        url,
                        parsedBaseURL
                    );
            } catch (error) {
                return "Invalid Input";
            }

            const pathname = targetURL.pathname;

            // First check exact static route.
            if (routes.has(pathname)) {
                const handler = routes.get(pathname);

                let result;

                try {
                    result = handler();
                } catch (error) {
                    result = null;
                }

                currentURL = targetURL.href;

                return {
                    matched: true,
                    route: pathname,
                    result
                };
            }

            // Dynamic route support.
            for (const [path, handler] of routes) {
                const routeParts =
                    path.split("/").filter(Boolean);

                const urlParts =
                    pathname.split("/").filter(Boolean);

                if (
                    routeParts.length !==
                    urlParts.length
                ) {
                    continue;
                }

                const params = {};
                let matched = true;

                for (let i = 0; i < routeParts.length; i++) {
                    if (
                        routeParts[i].startsWith(":")
                    ) {
                        params[
                            routeParts[i].slice(1)
                        ] = decodeURIComponent(
                            urlParts[i]
                        );
                    } else if (
                        routeParts[i] !== urlParts[i]
                    ) {
                        matched = false;
                        break;
                    }
                }

                if (matched) {
                    let result;

                    try {
                        result = handler(params);
                    } catch (error) {
                        result = null;
                    }

                    currentURL = targetURL.href;

                    return {
                        matched: true,
                        route: path,
                        params,
                        result
                    };
                }
            }

            return {
                matched: false,
                route: null,
                result: null
            };
        }
    };

    // --- STEP 10: SYSTEM REPORT ---

    function getSystemReport() {
        let listenerCount = 0;

        for (const eventMap of eventListeners.values()) {
            for (const listeners of eventMap.values()) {
                listenerCount += listeners.length;
            }
        }

        return {
            appName,

            dom: {
                elementCount: elements.size
            },

            events: {
                listenerCount
            },

            storage: {
                keys: [...storage.keys()],
                usedKB: Number(
                    getStorageUsage().toFixed(2)
                )
            },

            router: {
                currentRoute:
                    currentURL === parsedBaseURL.href
                        ? "/"
                        : new URL(currentURL).pathname,
                totalRoutes: routes.size
            },

            timers: {
                activeCount: timers.size,
                totalFired: totalFiredTimers
            },

            animation: {
                keyframes: keyframes.size,
                currentTime: currentTime
            },

            theme,
            targetFPS
        };
    }

    // --- STEP 11: RETURN MASTER API ---

    return {
        dom,
        events,
        forms,
        storage: storageAPI,
        timers: timersAPI,
        animation,
        router,
        getSystemReport
    };
}



// ---------- EXAMPLE USAGE ----------
const master = createBrowserMasterSystem({
    appName: "MasterApp",
    baseURL: "https://app.com",
    theme: "dark",
    storageQuota: 100,
    targetFPS: 60
});


// --- DOM ---
const hero = master.dom.create(
    "div",
    {
        classes: ["hero"],
        text: "Welcome"
    }
);

console.log(hero);


// --- EVENTS ---
console.log(
    master.events.on(
        hero.id,
        "click",
        () => "clicked"
    )
);

console.log(
    master.events.emit(
        hero.id,
        "click"
    )
);


// --- STORAGE ---
console.log(
    master.storage.set(
        "session",
        {
            userId: "U001"
        },
        3600
    )
);

console.log(master.storage.get("session"));


// --- FORM VALIDATION ---
console.log(
    master.forms.validate(
        [
            {
                name: "email",
                type: "email",
                required: true,
                rules: []
            }
        ],
        {
            email: "test@mail.com"
        }
    )
);


// --- ROUTER ---
master.router.register(
    "/home",
    () => "Home Page"
);

console.log(master.router.navigate("/home"));


// --- TIMER ---
master.timers.setTimeout(
    "init",
    () => "initialized",
    100
);

console.log(master.timers.tick(100));


// --- ANIMATION ---
master.animation.addKeyframe(
    "fade",
    "opacity",
    0,
    1,
    0,
    500
);

console.log(master.animation.play(250));


// --- SYSTEM REPORT ---
console.log(master.getSystemReport());



// --- Invalid Input ---
console.log(createBrowserMasterSystem(null));

console.log(
    createBrowserMasterSystem({
        appName: "MasterApp",
        baseURL: "invalid-url",
        theme: "dark",
        storageQuota: 100,
        targetFPS: 60
    })
);

console.log(master.timers.tick(-100));