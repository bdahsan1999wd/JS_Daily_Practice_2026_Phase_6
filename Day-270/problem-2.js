// 🧩 PROBLEM–02: createSearchParamsEngine()

// Logic: This function simulates URLSearchParams. It supports getting, setting, appending, deleting, filtering, merging, and converting query parameters between strings, arrays, and objects.


function createSearchParamsEngine(initialParams) {

    // --- STEP 1: VALIDATE INITIAL INPUT ---
    if (
        typeof initialParams !== 'string' &&
        (
            typeof initialParams !== 'object' ||
            initialParams === null ||
            Array.isArray(initialParams)
        )
    ) {
        return "Invalid Input";
    }


    // --- STEP 2: INITIALIZE PARAMETER STORAGE ---
    const params = new URLSearchParams();


    // --- STEP 3: LOAD INITIAL PARAMETERS ---
    if (typeof initialParams === 'string') {

        // Remove leading ? if supplied.
        const query =
            initialParams.startsWith('?')
                ? initialParams.slice(1)
                : initialParams;

        try {
            const initialSearchParams =
                new URLSearchParams(query);

            for (
                const [key, value]
                of initialSearchParams.entries()
            ) {
                params.append(key, value);
            }

        } catch (error) {
            return "Invalid Input";
        }

    } else {

        for (
            const [key, value]
            of Object.entries(initialParams)
        ) {

            if (typeof key !== 'string') {
                return "Invalid Input";
            }

            if (Array.isArray(value)) {

                for (const item of value) {
                    params.append(
                        key,
                        String(item)
                    );
                }

            } else {

                params.append(
                    key,
                    String(value)
                );
            }
        }
    }


    // --- STEP 4: GET FIRST VALUE ---
    function get(key) {

        if (typeof key !== 'string') {
            return null;
        }

        return params.get(key);
    }


    // --- STEP 5: GET ALL VALUES ---
    function getAll(key) {

        if (typeof key !== 'string') {
            return [];
        }

        return params.getAll(key);
    }


    // --- STEP 6: SET / OVERWRITE VALUE ---
    function set(key, value) {

        if (
            typeof key !== 'string' ||
            key.trim() === ''
        ) {
            return "Invalid Input";
        }

        params.set(
            key,
            String(value)
        );

        return undefined;
    }


    // --- STEP 7: APPEND VALUE ---
    function append(key, value) {

        if (
            typeof key !== 'string' ||
            key.trim() === ''
        ) {
            return "Invalid Input";
        }

        params.append(
            key,
            String(value)
        );

        return undefined;
    }


    // --- STEP 8: DELETE KEY ---
    function deleteParam(key) {

        if (typeof key !== 'string') {
            return false;
        }

        params.delete(key);

        return true;
    }


    // --- STEP 9: CHECK KEY EXISTENCE ---
    function has(key) {

        if (typeof key !== 'string') {
            return false;
        }

        return params.has(key);
    }


    // --- STEP 10: GET UNIQUE KEYS ---
    function keys() {

        return [...new Set(
            [...params.keys()]
        )];
    }


    // --- STEP 11: GET ALL VALUES ---
    function values() {

        return [...params.values()];
    }


    // --- STEP 12: GET ALL ENTRIES ---
    function entries() {

        return [...params.entries()];
    }


    // --- STEP 13: CONVERT TO QUERY STRING ---
    function toString() {

        return params.toString();
    }


    // --- STEP 14: CONVERT TO OBJECT ---
    function toObject() {

        const result = {};

        for (const [key, value] of params.entries()) {

            if (
                Object.prototype.hasOwnProperty.call(
                    result,
                    key
                )
            ) {

                if (Array.isArray(result[key])) {

                    result[key].push(value);

                } else {

                    result[key] = [
                        result[key],
                        value
                    ];
                }

            } else {

                result[key] = value;
            }
        }

        return result;
    }


    // --- STEP 15: MERGE OTHER PARAMETERS ---
    function merge(otherParams) {

        if (
            typeof otherParams !== 'object' ||
            otherParams === null ||
            Array.isArray(otherParams)
        ) {
            return "Invalid Input";
        }

        for (
            const [key, value]
            of Object.entries(otherParams)
        ) {

            if (Array.isArray(value)) {

                for (const item of value) {
                    params.append(
                        key,
                        String(item)
                    );
                }

            } else {

                params.append(
                    key,
                    String(value)
                );
            }
        }

        return undefined;
    }


    // --- STEP 16: FILTER PARAMETERS ---
    function filter(fn) {

        if (typeof fn !== 'function') {
            return "Invalid Input";
        }

        const entriesToKeep = [];

        for (const [key, value] of params.entries()) {

            if (fn(key, value) === true) {

                entriesToKeep.push([
                    key,
                    value
                ]);
            }
        }

        params.forEach(
            (_, key) => params.delete(key)
        );

        for (const [key, value] of entriesToKeep) {
            params.append(key, value);
        }

        return undefined;
    }


    // --- STEP 17: GET PARAMETER REPORT ---
    function getReport() {

        const uniqueKeys = keys();

        const multiValueKeys =
            uniqueKeys.filter(
                key => params.getAll(key).length > 1
            );

        return {
            totalKeys: uniqueKeys.length,
            multiValueKeys,
            totalValues: [...params.entries()].length
        };
    }


    // --- STEP 18: RETURN PARAMS API ---
    return {
        get,
        getAll,
        set,
        append,
        delete: deleteParam,
        has,
        keys,
        values,
        entries,
        toString,
        toObject,
        merge,
        filter,
        getReport
    };
}



// --- EXAMPLE USAGE ---
const searchParams = createSearchParamsEngine("name=rahim&age=25&tags=js&tags=node&tags=react");


console.log(searchParams.get("name"));
console.log(searchParams.getAll("tags"));

searchParams.set("name", "karim");
searchParams.append("tags", "ts");

console.log(searchParams.has("age"));
console.log(searchParams.keys());
console.log(searchParams.toString());
console.log(searchParams.toObject());

searchParams.filter(
    (key, value) => key !== "age"
);

console.log(searchParams.getReport());


// --- Invalid Input ---
console.log(createSearchParamsEngine(null));
console.log(searchParams.set("", "invalid"));