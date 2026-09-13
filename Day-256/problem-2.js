// 🧩 PROBLEM–02: createWeakMapSimulator()

// Logic: This function creates a WeakMap like simulator where keys must
// be objects (represented as { id, type }). Values can be anything.
// When a key is marked for GC, its entry is automatically removed.
// No iteration methods are provided (per WeakMap spec).


function createWeakMapSimulator() {

    // --- STEP 1: INITIALIZE PRIVATE STORAGE ---
    // Use a Map with key IDs as keys, storing { keyObj, value }
    const store = new Map();

    // --- STEP 2: DEFINE SET ---
    function set(keyObj, value) {
        // Validate key is an object with id and type
        if (
            !keyObj ||
            typeof keyObj !== 'object' ||
            Array.isArray(keyObj) ||
            typeof keyObj.id !== 'string' ||
            typeof keyObj.type !== 'string'
        ) {
            return "Invalid Key: Objects Only";
        }
        store.set(keyObj.id, { keyObj, value });
    }

    // --- STEP 3: DEFINE GET ---
    function get(keyObj) {
        if (
            !keyObj ||
            typeof keyObj !== 'object' ||
            Array.isArray(keyObj) ||
            typeof keyObj.id !== 'string'
        ) {
            return "Invalid Key: Objects Only";
        }
        const entry = store.get(keyObj.id);
        return entry ? entry.value : undefined;
    }

    // --- STEP 4: DEFINE HAS ---
    function has(keyObj) {
        if (
            !keyObj ||
            typeof keyObj !== 'object' ||
            Array.isArray(keyObj) ||
            typeof keyObj.id !== 'string'
        ) {
            return "Invalid Key: Objects Only";
        }
        return store.has(keyObj.id);
    }

    // --- STEP 5: DEFINE DELETE ---
    function deleteKey(keyObj) {
        if (
            !keyObj ||
            typeof keyObj !== 'object' ||
            Array.isArray(keyObj) ||
            typeof keyObj.id !== 'string'
        ) {
            return "Invalid Key: Objects Only";
        }
        return store.delete(keyObj.id);
    }

    // --- STEP 6: DEFINE MARKFORGC ---
    function markForGC(keyId) {
        if (typeof keyId !== 'string') {
            return false;
        }
        return store.delete(keyId);
    }

    // --- STEP 7: DEFINE GETSIZE ---
    function getSize() {
        return store.size;
    }

    // --- STEP 8: RETURN API ---
    return {
        set,
        get,
        has,
        delete: deleteKey,
        markForGC,
        getSize
    };
}


// --- EXAMPLE USAGE ---
const wm = createWeakMapSimulator();

const key1 = { id: "u1", type: "user" };
const key2 = { id: "u2", type: "user" };

wm.set(key1, { name: "Rahim" });
wm.set(key2, { name: "Karim" });
console.log(wm.get(key1));
console.log(wm.has(key2));
console.log(wm.getSize());
wm.markForGC("u1");
console.log(wm.has(key1));
console.log(wm.getSize());


// --- Invalid Input ---
console.log(wm.set("primitiveKey", 123));