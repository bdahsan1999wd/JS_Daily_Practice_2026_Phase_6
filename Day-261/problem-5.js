// 🧩 PROBLEM–05: analyzeInheritanceChain()

// Logic: This function analyzes a class hierarchy to build inheritance
// chains, detect missing abstract method overrides, invalid overrides,
// polymorphic methods, and calculate maximum inheritance depth.


function analyzeInheritanceChain(classes) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(classes)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH CLASS ---
    for (const cls of classes) {
        if (
            typeof cls !== 'object' ||
            cls === null ||
            typeof cls.name !== 'string' ||
            (cls.extends !== null && typeof cls.extends !== 'string') ||
            !Array.isArray(cls.methods) ||
            !Array.isArray(cls.overrides) ||
            typeof cls.isAbstract !== 'boolean' ||
            !Array.isArray(cls.abstractMethods)
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: BUILD CLASS MAP ---
    const classMap = new Map();
    for (const cls of classes) {
        classMap.set(cls.name, cls);
    }

    // --- STEP 4: VALIDATE EXTENDS ---
    for (const cls of classes) {
        if (cls.extends !== null && !classMap.has(cls.extends)) {
            return "Invalid Input";
        }
    }

    // --- STEP 5: BUILD INHERITANCE CHAINS ---
    const chainMap = {};
    const depthMap = {};

    function buildChain(className) {
        if (chainMap[className]) return chainMap[className];

        const cls = classMap.get(className);
        if (!cls) return [className];

        if (cls.extends === null) {
            chainMap[className] = [className];
            depthMap[className] = 1;
        } else {
            const parentChain = buildChain(cls.extends);
            chainMap[className] = [className, ...parentChain];
            depthMap[className] = parentChain.length + 1;
        }
        return chainMap[className];
    }

    for (const cls of classes) {
        buildChain(cls.name);
    }

    // --- STEP 6: DETECT MISSING OVERRIDES ---
    // Abstract class children must implement all abstractMethods
    const missingOverrides = [];

    for (const cls of classes) {
        if (cls.extends !== null) {
            const parent = classMap.get(cls.extends);
            if (parent && parent.isAbstract) {
                for (const abstractMethod of parent.abstractMethods) {
                    if (!cls.methods.includes(abstractMethod)) {
                        missingOverrides.push({
                            class: cls.name,
                            missing: [abstractMethod]
                        });
                    }
                }
            }
        }
    }

    // --- STEP 7: DETECT INVALID OVERRIDES ---
    // Override method must exist in parent chain
    const invalidOverrides = [];

    for (const cls of classes) {
        for (const overrideMethod of cls.overrides) {
            let foundInParent = false;
            if (cls.extends !== null) {
                let current = cls.extends;
                while (current !== null) {
                    const parent = classMap.get(current);
                    if (parent && parent.methods.includes(overrideMethod)) {
                        foundInParent = true;
                        break;
                    }
                    current = parent?.extends ?? null;
                }
            }
            if (!foundInParent) {
                invalidOverrides.push({
                    class: cls.name,
                    method: overrideMethod
                });
            }
        }
    }

    // --- STEP 8: FIND POLYMORPHIC METHODS ---
    // Methods overridden across 2+ levels
    const methodOverrideCount = new Map();

    for (const cls of classes) {
        for (const method of cls.methods) {
            if (!methodOverrideCount.has(method)) {
                methodOverrideCount.set(method, 0);
            }
            methodOverrideCount.set(method, methodOverrideCount.get(method) + 1);
        }
    }

    const polymorphicMethods = [];
    for (const [method, count] of methodOverrideCount) {
        if (count >= 2) {
            polymorphicMethods.push(method);
        }
    }

    // --- STEP 9: DETECT DIAMOND PROBLEM ---
    // (Multiple inheritance not directly supported in JS single inheritance,
    // but we check for shared ancestors via multiple paths)
    // For single inheritance, diamond problem doesn't apply in JS.
    // We'll return empty array as per JS single inheritance model.

    // --- STEP 10: FIND MAX DEPTH ---
    const maxDepth = Math.max(...Object.values(depthMap));

    // --- STEP 11: RETURN RESULTS ---
    return {
        chainMap,
        missingOverrides,
        invalidOverrides,
        polymorphicMethods,
        maxDepth
    };
}


// --- EXAMPLE USAGE ---
console.log(analyzeInheritanceChain([
    { name: "Shape", extends: null, methods: ["draw", "area"], overrides: [], isAbstract: true, abstractMethods: ["draw", "area"] },
    { name: "Polygon", extends: "Shape", methods: ["draw", "area", "perimeter"], overrides: ["draw", "area"], isAbstract: false, abstractMethods: [] },
    { name: "Rectangle", extends: "Polygon", methods: ["draw", "area"], overrides: ["draw", "area"], isAbstract: false, abstractMethods: [] },
    { name: "Circle", extends: "Shape", methods: ["draw"], overrides: ["draw"], isAbstract: false, abstractMethods: [] }
]));


// --- Invalid Input ---
console.log(analyzeInheritanceChain("invalid"));