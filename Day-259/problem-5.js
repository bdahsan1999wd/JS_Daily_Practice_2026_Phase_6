// 🧩 PROBLEM–05: validateClassHierarchy()

// Logic: This function validates a class hierarchy for common issues:
// Missing super() calls in child constructors
// Method overrides (valid but flagged)
// Private method naming convention (_ prefix)
// Circular inheritance
// Parent not found
// Static/instance method name conflicts

function validateClassHierarchy(classes) {

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
            !Array.isArray(cls.constructor) ||
            !Array.isArray(cls.methods) ||
            !Array.isArray(cls.staticMethods) ||
            typeof cls.callsSuper !== 'boolean'
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
            // Parent not found - will be caught in errors
        }
    }

    // --- STEP 5: DETECT CIRCULAR INHERITANCE ---
    const circularErrors = [];
    for (const cls of classes) {
        const visited = new Set();
        let current = cls.extends;
        while (current !== null) {
            if (visited.has(current)) {
                circularErrors.push({
                    class: cls.name,
                    error: "Circular Inheritance Error"
                });
                break;
            }
            visited.add(current);
            const parentClass = classMap.get(current);
            current = parentClass ? parentClass.extends : null;
        }
    }

    // --- STEP 6: VALIDATE EACH CLASS ---
    const validClasses = [];
    const warnings = [];
    const errors = [...circularErrors];
    const overrideMap = [];

    for (const cls of classes) {
        let isValid = true;

        // Check parent exists
        if (cls.extends !== null && !classMap.has(cls.extends)) {
            errors.push({
                class: cls.name,
                error: "Parent Not Found",
                parent: cls.extends
            });
            isValid = false;
        }

        // Check super() call
        if (cls.extends !== null && !cls.callsSuper) {
            errors.push({
                class: cls.name,
                error: "Missing super() call"
            });
            isValid = false;
        }

        // Check private method convention
        for (const method of cls.methods) {
            if (method.startsWith("_")) {
                warnings.push({
                    class: cls.name,
                    warning: "Convention: private method",
                    method
                });
            }
        }

        // Check static/instance name conflict
        const staticSet = new Set(cls.staticMethods);
        for (const method of cls.methods) {
            if (staticSet.has(method)) {
                warnings.push({
                    class: cls.name,
                    warning: "Name Conflict",
                    method
                });
            }
        }

        // Check overrides
        if (cls.extends !== null) {
            const parent = classMap.get(cls.extends);
            if (parent) {
                const parentMethods = new Set(parent.methods);
                for (const method of cls.methods) {
                    if (parentMethods.has(method)) {
                        overrideMap.push({
                            method,
                            childClass: cls.name,
                            parentClass: parent.name
                        });
                    }
                }
            }
        }

        if (isValid) {
            validClasses.push(cls.name);
        }
    }

    // --- STEP 7: RETURN RESULTS ---
    return {
        validClasses,
        warnings,
        errors,
        overrideMap
    };
}


// --- EXAMPLE USAGE ---
console.log(validateClassHierarchy([
    { name: "Animal", extends: null, constructor: ["name"], methods: ["speak", "move"], staticMethods: ["create"], callsSuper: false },
    { name: "Dog", extends: "Animal", constructor: ["name", "breed"], methods: ["speak", "_fetch"], staticMethods: [], callsSuper: true },
    { name: "Cat", extends: "Ghost", constructor: ["name"], methods: ["purr"], staticMethods: [], callsSuper: true }
]));


// --- Invalid Input ---
console.log(validateClassHierarchy("invalid"));