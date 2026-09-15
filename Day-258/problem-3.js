// 🧩 PROBLEM–03: simulateObjectCreate()

// Logic: This function simulates Object.create() inheritance by building
// prototype chains for a hierarchy of objects. It tracks own properties,
// inherited properties, and the full prototype chain for each object.


function simulateObjectCreate(hierarchy) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(hierarchy)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH OBJECT ---
    for (const obj of hierarchy) {
        if (
            typeof obj !== 'object' ||
            obj === null ||
            typeof obj.name !== 'string' ||
            (obj.inheritsFrom !== null && typeof obj.inheritsFrom !== 'string') ||
            typeof obj.ownProperties !== 'object' ||
            obj.ownProperties === null ||
            !Array.isArray(obj.ownMethods)
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: BUILD OBJECT MAP ---
    const objMap = new Map();
    for (const obj of hierarchy) {
        objMap.set(obj.name, obj);
    }

    // --- STEP 4: VALIDATE INHERITS FROM ---
    for (const obj of hierarchy) {
        if (obj.inheritsFrom !== null && !objMap.has(obj.inheritsFrom)) {
            return "Invalid Input";
        }
    }

    // --- STEP 5: BUILD PROTOTYPE CHAIN FOR EACH OBJECT ---
    const objectMap = {};

    for (const obj of hierarchy) {
        const ownKeys = [];
        const inheritedKeys = [];
        const fullChain = [];

        // Own keys: ownProperties + ownMethods
        for (const key of Object.keys(obj.ownProperties)) {
            ownKeys.push(key);
        }
        for (const method of obj.ownMethods) {
            ownKeys.push(method);
        }

        // Build chain and collect inherited keys
        let currentName = obj.inheritsFrom;
        while (currentName !== null) {
            fullChain.push(currentName);
            const parent = objMap.get(currentName);
            if (parent) {
                for (const key of Object.keys(parent.ownProperties)) {
                    inheritedKeys.push(key);
                }
                for (const method of parent.ownMethods) {
                    inheritedKeys.push(method);
                }
                currentName = parent.inheritsFrom;
            } else {
                currentName = null;
            }
        }

        // Add own object to chain
        fullChain.unshift(obj.name);

        objectMap[obj.name] = {
            ownKeys: ownKeys.sort(),
            inheritedKeys: inheritedKeys.sort(),
            fullChain
        };
    }

    // --- STEP 6: RETURN RESULTS ---
    return { objectMap };
}


// --- EXAMPLE USAGE ---
console.log(simulateObjectCreate([
    { name: "Animal", inheritsFrom: null, ownProperties: { alive: true }, ownMethods: ["breathe"] },
    { name: "Dog", inheritsFrom: "Animal", ownProperties: { breed: "Labrador" }, ownMethods: ["bark"] },
    { name: "GuideDog", inheritsFrom: "Dog", ownProperties: { trained: true }, ownMethods: ["guide"] }
]));


// --- Invalid Input ---
console.log(simulateObjectCreate("invalid"));