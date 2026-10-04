// 🧩 PROBLEM–02: createSPAEngine()

// Logic: This function simulates a small Single Page Application.

// It combines:
// 1. Client-side routing
// 2. Dynamic route parameters
// 3. Navigation guards
// 4. Application state
// 5. Lifecycle events
// 6. History
// 7. Optional state persistence


function createSPAEngine(config) {
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
        persistState,
        maxHistorySize
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

    if (typeof persistState !== "boolean") {
        return "Invalid Input";
    }

    if (
        typeof maxHistorySize !== "number" ||
        !Number.isInteger(maxHistorySize) ||
        maxHistorySize <= 0
    ) {
        return "Invalid Input";
    }

    // Validate baseURL.
    let parsedBaseURL;

    try {
        parsedBaseURL = new URL(baseURL);
    } catch (error) {
        return "Invalid Input";
    }

    // --- STEP 2: INTERNAL STATE ---

    const routes = [];
    const state = new Map();

    const events = new Map([
        ["beforeNavigate", []],
        ["afterNavigate", []],
        ["stateChange", []]
    ]);

    const history = [];
    let historyIndex = -1;

    let currentRoute = null;
    let currentURL = parsedBaseURL.href;

    let totalNavigations = 0;

    // --- STEP 3: ROUTE MATCHING ---

    function matchRoute(url) {
        const pathname = new URL(url, parsedBaseURL).pathname;

        for (const route of routes) {
            const routeParts = route.path
                .split("/")
                .filter(Boolean);

            const pathParts = pathname
                .split("/")
                .filter(Boolean);

            if (routeParts.length !== pathParts.length) {
                continue;
            }

            const params = {};
            let matched = true;

            for (let i = 0; i < routeParts.length; i++) {
                const routePart = routeParts[i];
                const pathPart = pathParts[i];

                if (routePart.startsWith(":")) {
                    const paramName = routePart.slice(1);

                    params[paramName] = decodeURIComponent(pathPart);
                } else if (routePart !== pathPart) {
                    matched = false;
                    break;
                }
            }

            if (matched) {
                return {
                    route,
                    params
                };
            }
        }

        return null;
    }

    // --- STEP 4: EVENT SYSTEM ---

    function emit(eventName, data) {
        const listeners = events.get(eventName) || [];

        const results = [];

        for (const fn of listeners) {
            try {
                results.push(fn(data));
            } catch (error) {
                results.push(null);
            }
        }

        return results;
    }

    // --- STEP 5: ROUTE REGISTRATION ---

    function registerRoute(path, component, guards = []) {
        if (
            typeof path !== "string" ||
            path.trim() === "" ||
            !path.startsWith("/") ||
            typeof component !== "function"
        ) {
            return "Invalid Input";
        }

        if (!Array.isArray(guards)) {
            return "Invalid Input";
        }

        if (!guards.every(fn => typeof fn === "function")) {
            return "Invalid Input";
        }

        const route = {
            path,
            component,
            guards
        };

        routes.push(route);

        return route;
    }

    // --- STEP 6: NAVIGATION ---

    function navigate(url, navigationState = {}) {
        if (
            typeof url !== "string" ||
            url.trim() === ""
        ) {
            return "Invalid Input";
        }

        if (
            typeof navigationState !== "object" ||
            navigationState === null ||
            Array.isArray(navigationState)
        ) {
            return "Invalid Input";
        }

        let fullURL;

        try {
            fullURL = new URL(url, parsedBaseURL).href;
        } catch (error) {
            return "Invalid Input";
        }

        const matched = matchRoute(fullURL);

        if (!matched) {
            return {
                success: false,
                route: null,
                params: {},
                blocked: false,
                reason: "Route not found"
            };
        }

        const { route, params } = matched;

        // Fire beforeNavigate event.
        emit("beforeNavigate", fullURL);

        // Build guard context.
        const context = {
            ...navigationState,
            url: fullURL,
            route: route.path,
            params,
            isAdmin: navigationState.isAdmin === true
        };

        // Run every guard.
        for (const guard of route.guards) {
            let allowed = false;

            try {
                allowed = guard(context) === true;
            } catch (error) {
                allowed = false;
            }

            if (!allowed) {
                return {
                    success: false,
                    route: route.path,
                    params,
                    blocked: true,
                    reason: "Guard failed"
                };
            }
        }

        // Remove forward history.
        history.splice(historyIndex + 1);

        history.push({
            url: fullURL,
            route: route.path,
            params,
            state: navigationState
        });

        // Enforce history size.
        while (history.length > maxHistorySize) {
            history.shift();
        }

        historyIndex = history.length - 1;

        currentRoute = route.path;
        currentURL = fullURL;

        totalNavigations++;

        emit("afterNavigate", {
            url: fullURL,
            route: route.path,
            params
        });

        return {
            success: true,
            route: route.path,
            params,
            blocked: false,
            reason: null
        };
    }

    // --- STEP 7: STATE MANAGEMENT ---

    function setState(key, value) {
        if (
            typeof key !== "string" ||
            key.trim() === ""
        ) {
            return "Invalid Input";
        }

        const oldValue = state.get(key);

        state.set(key, value);

        // State persistence simulation.
        if (persistState) {
            // We simulate localStorage using the state map itself.
            // The actual browser localStorage is intentionally not required.
        }

        emit("stateChange", {
            key,
            oldValue,
            newValue: value
        });

        return value;
    }

    function getState(key) {
        if (
            typeof key !== "string" ||
            key.trim() === ""
        ) {
            return "Invalid Input";
        }

        return state.has(key)
            ? state.get(key)
            : null;
    }

    // --- STEP 8: EVENT SUBSCRIPTION ---

    function on(event, fn) {
        if (
            typeof event !== "string" ||
            !events.has(event) ||
            typeof fn !== "function"
        ) {
            return "Invalid Input";
        }

        events.get(event).push(fn);

        return {
            registered: true,
            event
        };
    }

    // --- STEP 9: BACK NAVIGATION ---

    function back() {
        if (historyIndex <= 0) {
            return null;
        }

        historyIndex--;

        const entry = history[historyIndex];

        currentRoute = entry.route;
        currentURL = entry.url;

        emit("afterNavigate", {
            url: entry.url,
            route: entry.route,
            params: entry.params
        });

        return {
            success: true,
            route: entry.route,
            params: entry.params
        };
    }

    // --- STEP 10: REPORT ---

    function getAppReport() {
        return {
            appName,
            currentRoute,
            stateKeys: [...state.keys()],
            historySize: history.length,
            totalNavigations
        };
    }

    // --- STEP 11: RETURN SPA API ---

    return {
        registerRoute,
        navigate,
        setState,
        getState,
        on,
        back,
        getAppReport
    };
}



// --- EXAMPLE USAGE ---

const spa = createSPAEngine({
    appName: "ShopApp",
    baseURL: "https://shop.com",
    persistState: true,
    maxHistorySize: 20
});

spa.registerRoute(
    "/",
    () => "Home",
    []
);

spa.registerRoute(
    "/products/:id",
    params => "Product: " + params.id,
    []
);

spa.registerRoute(
    "/admin",
    () => "Admin Panel",
    [
        context => context.isAdmin === true
    ]
);

spa.on(
    "beforeNavigate",
    url => "Navigating to: " + url
);

console.log(
    spa.navigate("/products/42", {})
);

console.log(
    spa.navigate("/admin", {
        isAdmin: false
    })
);

spa.setState(
    "cart",
    [
        {
            id: "P001",
            qty: 2
        }
    ]
);

console.log(spa.getState("cart"));
console.log(spa.getAppReport());


// --- Invalid Input ---

console.log(createSPAEngine(null));

console.log(
    createSPAEngine({
        appName: "ShopApp",
        baseURL: "invalid-url",
        persistState: true,
        maxHistorySize: 20
    })
);