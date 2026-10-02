// 🧩 PROBLEM–04: createClientRouter()

// Logic: This function simulates a client-side router. It supports static routes, dynamic parameters, wildcard routes, optional parameters, middleware, navigation, query parameters, route matching, navigation history, and router statistics.


function createClientRouter(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    if (
        !["hash", "history"].includes(config.mode) ||
        typeof config.baseURL !== 'string' ||
        typeof config.notFoundHandler !== 'function'
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE ROUTER STATE ---
    const routes = [];

    let currentRoute = null;

    const navigationHistory = [];

    let totalNavigations = 0;
    let notFoundCount = 0;


    // --- STEP 3: NORMALIZE PATH ---
    function normalizePath(path) {

        if (path === "/") {
            return "/";
        }

        let result =
            path.replace(/\/+/g, '/');

        if (
            result.length > 1 &&
            result.endsWith('/')
        ) {
            result = result.slice(0, -1);
        }

        if (!result.startsWith('/')) {
            result = '/' + result;
        }

        return result;
    }


    // --- STEP 4: CREATE ROUTE MATCHER ---
    function matchRoute(pattern, pathname, exact) {

        const patternParts =
            normalizePath(pattern)
                .split('/')
                .filter(Boolean);

        const pathParts =
            normalizePath(pathname)
                .split('/')
                .filter(Boolean);

        const params = {};

        let pathIndex = 0;

        for (
            let i = 0;
            i < patternParts.length;
            i++
        ) {

            const patternPart =
                patternParts[i];

            // Wildcard route.
            if (patternPart === '*') {

                params.wildcard =
                    pathParts
                        .slice(pathIndex)
                        .join('/');

                return {
                    matched: true,
                    params
                };
            }

            // Dynamic parameter.
            if (
                patternPart.startsWith(':')
            ) {

                const isOptional =
                    patternPart.endsWith('?');

                const paramName =
                    patternPart
                        .slice(1)
                        .replace('?', '');

                if (
                    pathIndex >= pathParts.length
                ) {

                    if (isOptional) {
                        params[paramName] = undefined;
                        continue;
                    }

                    return {
                        matched: false
                    };
                }

                params[paramName] =
                    decodeURIComponent(
                        pathParts[pathIndex]
                    );

                pathIndex++;

                continue;
            }

            // Static route segment.
            if (
                pathParts[pathIndex] !==
                patternPart
            ) {
                return {
                    matched: false
                };
            }

            pathIndex++;
        }

        // Exact route requires all path segments to match.
        if (
            exact &&
            pathIndex !== pathParts.length
        ) {
            return {
                matched: false
            };
        }

        return {
            matched: true,
            params
        };
    }


    // --- STEP 5: REGISTER ROUTE ---
    function register(
        path,
        handler = () => undefined,
        options = {}
    ) {

        if (
            typeof path !== 'string' ||
            path.trim() === '' ||
            typeof handler !== 'function' ||
            typeof options !== 'object' ||
            options === null ||
            Array.isArray(options)
        ) {
            return "Invalid Input";
        }

        const exact =
            options.exact === undefined
                ? true
                : options.exact;

        const middleware =
            options.middleware === undefined
                ? []
                : options.middleware;

        if (
            typeof exact !== 'boolean' ||
            !Array.isArray(middleware) ||
            middleware.some(
                fn => typeof fn !== 'function'
            )
        ) {
            return "Invalid Input";
        }

        routes.push({
            path,
            handler,
            exact,
            middleware
        });

        return true;
    }


    // --- STEP 6: MATCH URL ---
    function match(url) {

        if (
            typeof url !== 'string' ||
            url.trim() === ''
        ) {
            return {
                matched: false
            };
        }

        let parsedURL;

        try {

            // Support both absolute and relative URLs.
            parsedURL =
                new URL(
                    url,
                    "http://router.local"
                );

        } catch (error) {

            return {
                matched: false
            };
        }

        let pathname =
            parsedURL.pathname;

        // Apply base URL path.
        if (
            config.baseURL !== "/" &&
            config.baseURL !== ""
        ) {

            if (
                pathname.startsWith(
                    config.baseURL
                )
            ) {
                pathname =
                    pathname.slice(
                        config.baseURL.length
                    ) || "/";
            }
        }

        pathname =
            normalizePath(pathname);

        for (const route of routes) {

            const result =
                matchRoute(
                    route.path,
                    pathname,
                    route.exact
                );

            if (result.matched) {

                return {
                    matched: true,
                    route: route.path,
                    params: result.params
                };
            }
        }

        return {
            matched: false
        };
    }


    // --- STEP 7: NAVIGATE TO URL ---
    function navigate(url, state = {}) {

        if (
            typeof url !== 'string' ||
            url.trim() === ''
        ) {
            return "Invalid Input";
        }

        let parsedURL;

        try {

            parsedURL =
                new URL(
                    url,
                    "http://router.local"
                );

        } catch (error) {

            return "Invalid Input";
        }

        const matchResult =
            match(url);

        const queryParams = {};

        for (
            const [key, value]
            of parsedURL.searchParams.entries()
        ) {

            queryParams[key] = value;
        }

        if (!matchResult.matched) {

            notFoundCount++;
            totalNavigations++;

            currentRoute = {
                matched: false,
                route: null,
                params: {},
                queryParams,
                state
            };

            navigationHistory.push({
                url,
                matched: false,
                route: null
            });

            config.notFoundHandler(url, state);

            return {
                matched: false,
                route: null,
                params: {},
                queryParams,
                middlewarePassed: false
            };
        }


        // Find actual registered route.
        const route =
            routes.find(
                item =>
                    item.path === matchResult.route
            );

        let middlewarePassed = true;

        // Run middleware in order.
        for (const middleware of route.middleware) {

            const result =
                middleware(
                    matchResult.params,
                    state
                );

            if (result === false) {
                middlewarePassed = false;
                break;
            }
        }

        if (middlewarePassed) {

            route.handler(
                matchResult.params,
                state
            );
        }

        totalNavigations++;

        currentRoute = {
            matched: true,
            route: route.path,
            params: matchResult.params,
            queryParams,
            state
        };

        navigationHistory.push({
            url,
            matched: true,
            route: route.path,
            params: matchResult.params
        });

        return {
            matched: true,
            route: route.path,
            params: matchResult.params,
            queryParams,
            middlewarePassed
        };
    }


    // --- STEP 8: GET CURRENT ROUTE ---
    function getCurrentRoute() {

        return currentRoute;
    }


    // --- STEP 9: GET REGISTERED ROUTES ---
    function getRoutes() {

        return routes.map(route => ({
            path: route.path,
            exact: route.exact,
            middlewareCount: route.middleware.length
        }));
    }


    // --- STEP 10: GET NAVIGATION HISTORY ---
    function getHistory() {

        return [...navigationHistory];
    }


    // --- STEP 11: GET ROUTER REPORT ---
    function getReport() {

        const dynamicRoutes =
            routes.filter(
                route =>
                    route.path.includes(':') ||
                    route.path.includes('*')
            ).length;

        return {
            totalRoutes: routes.length,
            totalNavigations,
            notFoundCount,
            dynamicRoutes
        };
    }


    // --- STEP 12: RETURN ROUTER API ---
    return {
        register,
        navigate,
        match,
        getCurrentRoute,
        getRoutes,
        getHistory,
        getReport
    };
}



// --- EXAMPLE USAGE ---
const router = createClientRouter({
    mode: "history",
    baseURL: "/app",
    notFoundHandler: () => "404 Not Found"
});


router.register(
    "/",
    () => "Home Page",
    {
        exact: true,
        middleware: []
    }
);

router.register(
    "/users",
    () => "Users List",
    {
        exact: true,
        middleware: []
    }
);

router.register(
    "/users/:id",
    params => "User: " + params.id,
    {
        exact: true,
        middleware: []
    }
);

router.register(
    "/files/*",
    params => "File: " + params.wildcard,
    {
        exact: false,
        middleware: []
    }
);


console.log(router.match("/users/42"));
console.log(router.navigate("/users/42", {}));

console.log(
    router.navigate(
        "/files/images/logo.png",
        {}
    )
);


console.log(router.navigate("/unknown", {}));
console.log(router.getReport());



// --- Invalid Input ---

console.log(
    createClientRouter({
        mode: "invalid",
        baseURL: "/",
        notFoundHandler: () => { }
    })
);

console.log(
    router.register(
        "",
        () => { },
        {}
    )
);