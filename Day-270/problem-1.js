// 🧩 PROBLEM–01: createURLEngine()

// Logic: This function creates a URL parsing and building engine. It can parse URLs, build URLs from path and parameters, resolve relative URLs, normalize URLs, compare URLs, validate URLs, and generate usage statistics.


function createURLEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    // Config must be a valid object.
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    // baseURL must be a valid non-empty string.
    if (
        typeof config.baseURL !== 'string' ||
        config.baseURL.trim() === ''
    ) {
        return "Invalid Input";
    }

    // defaultParams must be an object.
    if (
        typeof config.defaultParams !== 'object' ||
        config.defaultParams === null ||
        Array.isArray(config.defaultParams)
    ) {
        return "Invalid Input";
    }

    // trailingSlash must be boolean.
    if (typeof config.trailingSlash !== 'boolean') {
        return "Invalid Input";
    }


    // --- STEP 2: VALIDATE BASE URL ---
    try {
        new URL(config.baseURL);
    } catch (error) {
        return "Invalid Input";
    }


    // --- STEP 3: INITIALIZE STATISTICS ---
    let totalParsed = 0;
    let totalBuilt = 0;
    let totalResolved = 0;


    // --- STEP 4: PARSE URL ---
    function parse(urlString) {

        if (
            typeof urlString !== 'string' ||
            urlString.trim() === ''
        ) {
            return "Invalid Input";
        }

        let url;

        try {
            url = new URL(urlString);
        } catch (error) {
            return "Invalid Input";
        }

        totalParsed++;

        const params = {};

        for (const [key, value] of url.searchParams.entries()) {

            if (Object.prototype.hasOwnProperty.call(params, key)) {

                if (Array.isArray(params[key])) {
                    params[key].push(value);
                } else {
                    params[key] = [
                        params[key],
                        value
                    ];
                }

            } else {
                params[key] = value;
            }
        }

        return {
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            search: url.search,
            hash: url.hash,
            origin: url.origin,
            params
        };
    }


    // --- STEP 5: BUILD URL ---
    function build(path, params = {}, hash = '') {

        if (
            typeof path !== 'string' ||
            path.trim() === '' ||
            typeof params !== 'object' ||
            params === null ||
            Array.isArray(params) ||
            typeof hash !== 'string'
        ) {
            return "Invalid Input";
        }

        const base = new URL(config.baseURL);

        let cleanPath = path;

        // Remove duplicate slashes from path.
        cleanPath = cleanPath.replace(/\/+/g, '/');

        if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
        }

        // Apply trailing slash rule.
        if (config.trailingSlash) {

            if (!cleanPath.endsWith('/')) {
                cleanPath += '/';
            }

        } else {

            if (
                cleanPath.length > 1 &&
                cleanPath.endsWith('/')
            ) {
                cleanPath = cleanPath.slice(0, -1);
            }
        }

        base.pathname = cleanPath;

        // Merge default parameters first.
        const searchParams = new URLSearchParams();

        for (const [key, value] of Object.entries(
            config.defaultParams
        )) {
            searchParams.set(key, String(value));
        }

        // Provided parameters override default parameters.
        for (const [key, value] of Object.entries(params)) {

            if (Array.isArray(value)) {

                searchParams.delete(key);

                for (const item of value) {
                    searchParams.append(
                        key,
                        String(item)
                    );
                }

            } else {
                searchParams.set(
                    key,
                    String(value)
                );
            }
        }

        base.search = searchParams.toString();

        // Add hash without duplicate #.
        if (hash !== '') {
            base.hash = hash.startsWith('#')
                ? hash
                : `#${hash}`;
        }

        totalBuilt++;

        return base.toString();
    }


    // --- STEP 6: RESOLVE RELATIVE URL ---
    function resolve(base, relative) {

        if (
            typeof base !== 'string' ||
            typeof relative !== 'string' ||
            base.trim() === '' ||
            relative.trim() === ''
        ) {
            return "Invalid Input";
        }

        try {

            const resolved =
                new URL(relative, base).toString();

            totalResolved++;

            return resolved;

        } catch (error) {
            return "Invalid Input";
        }
    }


    // --- STEP 7: NORMALIZE URL ---
    function normalize(urlString) {

        if (
            typeof urlString !== 'string' ||
            urlString.trim() === ''
        ) {
            return "Invalid Input";
        }

        let url;

        try {
            url = new URL(urlString);
        } catch (error) {
            return "Invalid Input";
        }

        // Lowercase hostname.
        url.hostname =
            url.hostname.toLowerCase();

        // Remove duplicate slashes.
        url.pathname =
            url.pathname.replace(/\/+/g, '/');

        // Remove default ports.
        if (
            (url.protocol === 'http:' &&
                url.port === '80') ||
            (url.protocol === 'https:' &&
                url.port === '443')
        ) {
            url.port = '';
        }

        // Sort query parameters alphabetically.
        const sortedParams =
            [...url.searchParams.entries()]
                .sort(([keyA], [keyB]) =>
                    keyA.localeCompare(keyB)
                );

        url.search = '';

        for (const [key, value] of sortedParams) {
            url.searchParams.append(key, value);
        }

        return url.toString();
    }


    // --- STEP 8: COMPARE TWO URLS ---
    function compare(url1, url2) {

        if (
            typeof url1 !== 'string' ||
            typeof url2 !== 'string'
        ) {
            return "Invalid Input";
        }

        let first;
        let second;

        try {
            first = new URL(normalize(url1));
            second = new URL(normalize(url2));
        } catch (error) {
            return "Invalid Input";
        }

        const differences = [];

        if (first.protocol !== second.protocol) {
            differences.push("protocol");
        }

        if (first.hostname !== second.hostname) {
            differences.push("hostname");
        }

        if (first.port !== second.port) {
            differences.push("port");
        }

        if (first.pathname !== second.pathname) {
            differences.push("pathname");
        }

        if (first.search !== second.search) {
            differences.push("search");
        }

        if (first.hash !== second.hash) {
            differences.push("hash");
        }

        return {
            equal: differences.length === 0,
            differences
        };
    }


    // --- STEP 9: VALIDATE URL ---
    function isValid(urlString) {

        if (
            typeof urlString !== 'string' ||
            urlString.trim() === ''
        ) {
            return {
                valid: false,
                reason: "Invalid Input"
            };
        }

        try {

            const url = new URL(urlString);

            if (!url.protocol) {
                return {
                    valid: false,
                    reason: "Missing protocol"
                };
            }

            if (!url.hostname) {
                return {
                    valid: false,
                    reason: "Missing hostname"
                };
            }

            return {
                valid: true,
                reason: null
            };

        } catch (error) {

            // Check whether the protocol is missing.
            if (!/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(urlString)) {
                return {
                    valid: false,
                    reason: "Missing protocol"
                };
            }

            return {
                valid: false,
                reason: "Invalid URL"
            };
        }
    }


    // --- STEP 10: GET REPORT ---
    function getReport() {

        return {
            totalParsed,
            totalBuilt,
            totalResolved
        };
    }


    // --- STEP 11: RETURN URL API ---
    return {
        parse,
        build,
        resolve,
        normalize,
        compare,
        isValid,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const engine = createURLEngine({
    baseURL: "https://api.example.com",
    defaultParams: {
        version: "v1"
    },
    trailingSlash: false
});


console.log(
    engine.parse(
        "https://api.example.com:8080/users?name=rahim&age=25#profile"
    )
);

console.log(
    engine.build(
        "/products",
        {
            category: "electronics",
            sort: "price"
        },
        "top"
    )
);

console.log(
    engine.normalize(
        "HTTPS://API.EXAMPLE.COM:443//users//list?z=1&a=2"
    )
);

console.log(engine.isValid("not-a-url"));

console.log(engine.getReport());



// --- Invalid Input ---

console.log(
    createURLEngine({
        baseURL: "invalid-url",
        defaultParams: {},
        trailingSlash: false
    })
);

console.log(createURLEngine("invalid"));