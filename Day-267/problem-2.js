// 🧩 PROBLEM–02: FormData Builder & Parser Engine

// Logic: This function creates a FormData-like engine that stores key-value pairs (supporting multi-values), applies config rules like trimValues and excludeEmpty, and serializes/parses data based on the specified encType (JSON, URL-encoded, multipart).


function createFormDataEngine(config) {

    // --- STEP 1: VALIDATE INPUT ---
    const validEncTypes = [
        "application/x-www-form-urlencoded",
        "multipart/form-data",
        "application/json"
    ];

    if (
        typeof config !== 'object' || config === null ||
        !validEncTypes.includes(config.encType) ||
        typeof config.trimValues !== 'boolean' ||
        typeof config.excludeEmpty !== 'boolean'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INTERNAL STORAGE ---
    // Map: fieldName → array of values (supports multi-value)
    const store = new Map();
    const emptyFields = new Set(); // Track fields excluded due to being empty
    const fileNames = new Map();   // Track fileNames for multipart

    // --- STEP 3: HELPER — PROCESS VALUE ---
    function processValue(value) {
        if (typeof value === 'string' && config.trimValues) {
            return value.trim();
        }
        return value;
    }

    function isEmpty(value) {
        return value === null || value === undefined || value === "";
    }

    // --- STEP 4: APPEND ---
    function append(name, value, fileName = null) {
        const processed = processValue(value);

        if (config.excludeEmpty && isEmpty(processed)) {
            emptyFields.add(name);
            return;
        }

        if (!store.has(name)) {
            store.set(name, []);
        }
        store.get(name).push(processed);

        if (fileName) fileNames.set(name, fileName);
    }

    // --- STEP 5: SET (overwrite) ---
    function set(name, value) {
        const processed = processValue(value);

        if (config.excludeEmpty && isEmpty(processed)) {
            store.delete(name);
            emptyFields.add(name);
            return;
        }

        store.set(name, [processed]);
    }

    // --- STEP 6: GET FIRST VALUE ---
    function get(name) {
        const values = store.get(name);
        return values ? values[0] : null;
    }

    // --- STEP 7: GET ALL VALUES ---
    function getAll(name) {
        return store.get(name) || [];
    }

    // --- STEP 8: DELETE ---
    function deleteField(name) {
        store.delete(name);
    }

    // --- STEP 9: HAS ---
    function has(name) {
        return store.has(name);
    }

    // --- STEP 10: ENTRIES ---
    function entries() {
        const result = [];
        for (const [name, values] of store.entries()) {
            for (const value of values) {
                result.push([name, value]);
            }
        }
        return result;
    }

    // --- STEP 11: SERIALIZE ---
    function serialize() {
        const enc = config.encType;

        if (enc === "application/json") {
            const obj = {};
            for (const [name, values] of store.entries()) {
                obj[name] = values.length === 1 ? values[0] : values;
            }
            return JSON.stringify(obj);
        }

        if (enc === "application/x-www-form-urlencoded") {
            return entries()
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join("&");
        }

        if (enc === "multipart/form-data") {
            const boundary = "----FormBoundary";
            let result = "";
            for (const [name, values] of store.entries()) {
                for (const value of values) {
                    const fn = fileNames.get(name);
                    const disposition = fn
                        ? `Content-Disposition: form-data; name="${name}"; filename="${fn}"`
                        : `Content-Disposition: form-data; name="${name}"`;
                    result += `--${boundary}\r\n${disposition}\r\n\r\n${value}\r\n`;
                }
            }
            result += `--${boundary}--`;
            return result;
        }
    }

    // --- STEP 12: PARSE ---
    function parse(serializedData) {
        const enc = config.encType;
        store.clear();

        if (enc === "application/json") {
            const obj = JSON.parse(serializedData);
            for (const [key, val] of Object.entries(obj)) {
                if (Array.isArray(val)) {
                    val.forEach(v => append(key, v));
                } else {
                    append(key, val);
                }
            }
        }

        if (enc === "application/x-www-form-urlencoded") {
            serializedData.split("&").forEach(pair => {
                const [k, v] = pair.split("=").map(decodeURIComponent);
                append(k, v);
            });
        }
    }

    // --- STEP 13: GET REPORT ---
    function getReport() {
        const multiValueFields = [];
        for (const [name, values] of store.entries()) {
            if (values.length > 1) multiValueFields.push(name);
        }

        return {
            totalFields: store.size,
            multiValueFields,
            emptyFields: [...emptyFields]
        };
    }

    // --- STEP 14: RETURN FORMDATA API ---
    return {
        append,
        set,
        get,
        getAll,
        delete: deleteField,
        has,
        entries,
        serialize,
        parse,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const fd = createFormDataEngine({ encType: "application/json", trimValues: true, excludeEmpty: true });

fd.append("username", "  rahim  ");
fd.append("tags", "js");
fd.append("tags", "node");
fd.append("bio", "");

console.log(fd.get("username"));
console.log(fd.getAll("tags"));
console.log(fd.has("bio"));
console.log(fd.entries());
console.log(fd.serialize());
console.log(fd.getReport());


// --- Invalid Input ---
console.log(createFormDataEngine("invalid"));