// 🧩 PROBLEM–05: createURLStateManager()

// Logic: This function manages application state through URLs. It validates state against a schema, serializes state into query parameters or a compressed hash, parses state back, supports partial updates, subscriptions, reset, shareable links, and generates a state management report.


function createURLStateManager(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        typeof config !== 'object' ||
        config === null ||
        Array.isArray(config)
    ) {
        return "Invalid Input";
    }

    if (
        typeof config.baseURL !== 'string' ||
        config.baseURL.trim() === '' ||
        typeof config.stateSchema !== 'object' ||
        config.stateSchema === null ||
        Array.isArray(config.stateSchema) ||
        typeof config.compress !== 'boolean'
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: VALIDATE BASE URL ---
    try {
        new URL(config.baseURL);
    } catch (error) {
        return "Invalid Input";
    }


    // --- STEP 3: VALIDATE SCHEMA TYPES ---
    const validTypes = [
        "string",
        "number",
        "boolean",
        "array",
        "object"
    ];

    for (
        const type of Object.values(
            config.stateSchema
        )
    ) {

        if (!validTypes.includes(type)) {
            return "Invalid Input";
        }
    }


    // --- STEP 4: INITIALIZE STATE ---
    let currentState = {};

    let totalUpdates = 0;

    const subscribers = new Map();


    // --- STEP 5: CHECK VALUE TYPE ---
    function matchesType(value, expectedType) {

        switch (expectedType) {

            case "array":
                return Array.isArray(value);

            case "object":
                return (
                    typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value)
                );

            case "number":
                return (
                    typeof value === 'number' &&
                    Number.isFinite(value)
                );

            default:
                return typeof value === expectedType;
        }
    }


    // --- STEP 6: VALIDATE STATE ---
    function validateState(stateObj) {

        if (
            typeof stateObj !== 'object' ||
            stateObj === null ||
            Array.isArray(stateObj)
        ) {
            return {
                valid: false,
                errors: ["State must be an object"]
            };
        }

        const errors = [];

        for (
            const [key, expectedType]
            of Object.entries(config.stateSchema)
        ) {

            if (
                stateObj[key] === undefined
            ) {
                continue;
            }

            if (
                !matchesType(
                    stateObj[key],
                    expectedType
                )
            ) {

                errors.push(
                    `${key} must be of type ${expectedType}`
                );
            }
        }

        // Reject keys that do not exist in schema.
        for (const key of Object.keys(stateObj)) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    config.stateSchema,
                    key
                )
            ) {

                errors.push(
                    `${key} is not allowed`
                );
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }


    // --- STEP 7: SERIALIZE STATE ---
    function serializeState(stateObj) {

        const url =
            new URL(config.baseURL);

        const encodedState = {};

        for (const [key, value] of Object.entries(stateObj)) {

            encodedState[key] = value;
        }

        if (config.compress) {

            // Encode complete state as base64.
            const json =
                JSON.stringify(encodedState);

            const encoded =
                btoa(
                    unescape(
                        encodeURIComponent(json)
                    )
                );

            url.hash = `state=${encoded}`;

        } else {

            for (
                const [key, value]
                of Object.entries(encodedState)
            ) {

                if (Array.isArray(value)) {

                    url.searchParams.set(
                        key,
                        value.join(',')
                    );

                } else if (
                    typeof value === 'object' &&
                    value !== null
                ) {

                    url.searchParams.set(
                        key,
                        JSON.stringify(value)
                    );

                } else {

                    url.searchParams.set(
                        key,
                        String(value)
                    );
                }
            }
        }

        return {
            url: url.toString(),
            encodedState
        };
    }


    // --- STEP 8: PARSE VALUE ACCORDING TO SCHEMA ---
    function coerceValue(key, value) {

        const expectedType =
            config.stateSchema[key];

        switch (expectedType) {

            case "number": {

                const numberValue =
                    Number(value);

                return Number.isNaN(numberValue)
                    ? value
                    : numberValue;
            }

            case "boolean":

                return value === "true"
                    ? true
                    : value === "false"
                        ? false
                        : value;

            case "array":

                return value === ''
                    ? []
                    : value.split(',');

            case "object":

                try {
                    return JSON.parse(value);
                } catch (error) {
                    return value;
                }

            default:
                return value;
        }
    }


    // --- STEP 9: SET STATE ---
    function setState(stateObj) {

        const validation =
            validateState(stateObj);

        if (!validation.valid) {
            return "Invalid Input";
        }

        const previousState = {
            ...currentState
        };

        currentState = {
            ...stateObj
        };

        totalUpdates++;

        const result =
            serializeState(currentState);

        // Notify changed subscribers.
        for (const [key, callbackList]
            of subscribers.entries()) {

            if (
                previousState[key] !==
                currentState[key]
            ) {

                for (const callback of callbackList) {
                    callback(currentState[key]);
                }
            }
        }

        return result;
    }


    // --- STEP 10: GET STATE FROM URL ---
    function getState(urlString) {

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

        const state = {};

        if (config.compress) {

            const hash =
                url.hash.startsWith('#')
                    ? url.hash.slice(1)
                    : url.hash;

            if (
                !hash.startsWith("state=")
            ) {
                return {};
            }

            const encoded =
                hash.slice("state=".length);

            try {

                const json =
                    decodeURIComponent(
                        escape(
                            atob(encoded)
                        )
                    );

                const parsed =
                    JSON.parse(json);

                const validation =
                    validateState(parsed);

                return validation.valid
                    ? parsed
                    : "Invalid Input";

            } catch (error) {

                return "Invalid Input";
            }

        } else {

            for (
                const [key, value]
                of url.searchParams.entries()
            ) {

                if (
                    Object.prototype.hasOwnProperty.call(
                        config.stateSchema,
                        key
                    )
                ) {

                    state[key] =
                        coerceValue(
                            key,
                            value
                        );
                }
            }
        }

        const validation =
            validateState(state);

        if (!validation.valid) {
            return "Invalid Input";
        }

        return state;
    }


    // --- STEP 11: UPDATE PARTIAL STATE ---
    function updateState(partialState) {

        if (
            typeof partialState !== 'object' ||
            partialState === null ||
            Array.isArray(partialState)
        ) {
            return "Invalid Input";
        }

        const mergedState = {
            ...currentState,
            ...partialState
        };

        const result =
            setState(mergedState);

        if (result === "Invalid Input") {
            return result;
        }

        return result.url;
    }


    // --- STEP 12: RESET STATE ---
    function resetState() {

        currentState = {};

        totalUpdates++;

        return config.baseURL;
    }


    // --- STEP 13: SUBSCRIBE TO STATE KEY ---
    function subscribe(key, fn) {

        if (
            typeof key !== 'string' ||
            typeof fn !== 'function' ||
            !Object.prototype.hasOwnProperty.call(
                config.stateSchema,
                key
            )
        ) {
            return "Invalid Input";
        }

        if (!subscribers.has(key)) {
            subscribers.set(key, []);
        }

        subscribers
            .get(key)
            .push(fn);

        return true;
    }


    // --- STEP 14: GENERATE SHAREABLE LINK ---
    function generateShareableLink(
        state,
        expiresInSeconds
    ) {

        if (
            typeof expiresInSeconds !== 'number' ||
            !Number.isFinite(expiresInSeconds) ||
            expiresInSeconds <= 0
        ) {
            return "Invalid Input";
        }

        const validation =
            validateState(state);

        if (!validation.valid) {
            return "Invalid Input";
        }

        const expiresAt =
            Date.now() +
            expiresInSeconds * 1000;

        const shareState = {
            ...state,
            expiresAt
        };

        const result =
            serializeState(shareState);

        return result.url;
    }


    // --- STEP 15: GET STATE REPORT ---
    function getReport() {

        let subscriberCount = 0;

        for (const callbacks of subscribers.values()) {
            subscriberCount += callbacks.length;
        }

        return {
            currentState: {
                ...currentState
            },
            totalUpdates,
            subscribers: subscriberCount,
            compressed: config.compress
        };
    }


    // --- STEP 16: RETURN STATE MANAGER API ---
    return {
        setState,
        getState,
        updateState,
        resetState,
        subscribe,
        generateShareableLink,
        validateState,
        getReport
    };
}



// --- EXAMPLE USAGE ---
const manager = createURLStateManager({

    baseURL:
        "https://shop.example.com/products",

    stateSchema: {
        page: "number",
        search: "string",
        filters: "array",
        sort: "string"
    },

    compress: false
});

console.log(
    manager.setState({
        page: 2,
        search: "laptop",
        filters: [
            "electronics",
            "sale"
        ],
        sort: "price"
    })
);

console.log(
    manager.getState(
        "https://shop.example.com/products?page=3&search=phone&filters=mobile&sort=rating"
    )
);

console.log(
    manager.updateState({
        page: 3,
        sort: "rating"
    })
);

console.log(
    manager.validateState({
        page: "notANumber",
        sort: "price"
    })
);

console.log(manager.getReport());


// --- Invalid Input ---
console.log(
    createURLStateManager({
        baseURL: "invalid-url",
        stateSchema: {
            page: "number"
        },
        compress: false
    })
);

console.log(
    manager.setState({
        page: "invalid"
    })
);