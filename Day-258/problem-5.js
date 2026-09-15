// 🧩 PROBLEM–05: inspectPrototypeIntegrity()

// Logic: This function inspects a prototype hierarchy for integrity issues:
// => Instance properties leaking onto prototypes
// => Method overrides (child overriding parent)
// => Prototype pollution risks (overriding built-ins)
// => instanceof chain verification


function inspectPrototypeIntegrity(constructors) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(constructors)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH CONSTRUCTOR ---
    for (const ctor of constructors) {
        if (
            typeof ctor !== 'object' ||
            ctor === null ||
            typeof ctor.name !== 'string' ||
            !Array.isArray(ctor.prototypeProperties) ||
            !Array.isArray(ctor.prototypeMethods) ||
            (ctor.inheritsFrom !== null && typeof ctor.inheritsFrom !== 'string') ||
            !Array.isArray(ctor.instances)
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: BUILD CONSTRUCTOR MAP ---
    const ctorMap = new Map();
    for (const ctor of constructors) {
        ctorMap.set(ctor.name, ctor);
    }

    // --- STEP 4: VALIDATE INHERITS FROM ---
    for (const ctor of constructors) {
        if (ctor.inheritsFrom !== null && !ctorMap.has(ctor.inheritsFrom)) {
            return "Invalid Input";
        }
    }

    // --- STEP 5: BUILD INSTANCE REPORT ---
    const instanceReport = [];
    const instanceofMap = {};

    for (const ctor of constructors) {
        for (const instance of ctor.instances) {
            if (typeof instance !== 'object' || instance === null || typeof instance.instanceName !== 'string') {
                continue;
            }

            // Check for leaks: instance ownProperties should not be in prototype
            let leaksToPrototype = false;
            const prototypeProps = new Set(ctor.prototypeProperties);
            for (const prop of instance.ownProperties) {
                if (prototypeProps.has(prop)) {
                    leaksToPrototype = true;
                    break;
                }
            }

            // Build instanceof chain
            const chain = [];
            let currentCtorName = ctor.name;
            while (currentCtorName) {
                chain.push(currentCtorName);
                const currentCtor = ctorMap.get(currentCtorName);
                currentCtorName = currentCtor ? currentCtor.inheritsFrom : null;
            }

            instanceReport.push({
                instanceName: instance.instanceName,
                constructor: ctor.name,
                ownProperties: [...instance.ownProperties],
                leaksToPrototype
            });

            instanceofMap[instance.instanceName] = chain;
        }
    }

    // --- STEP 6: DETECT OVERRIDES ---
    const overrides = [];
    for (const ctor of constructors) {
        if (ctor.inheritsFrom !== null) {
            const parent = ctorMap.get(ctor.inheritsFrom);
            if (parent) {
                const childMethods = new Set(ctor.prototypeMethods);
                for (const method of parent.prototypeMethods) {
                    if (childMethods.has(method)) {
                        overrides.push({
                            method,
                            childConstructor: ctor.name,
                            parentConstructor: parent.name
                        });
                    }
                }
            }
        }
    }

    // --- STEP 7: DETECT POLLUTION RISKS ---
    const builtInMethods = new Set(["constructor", "toString", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "valueOf", "__proto__"]);
    const pollutionRisks = [];

    for (const ctor of constructors) {
        for (const method of ctor.prototypeMethods) {
            if (builtInMethods.has(method)) {
                pollutionRisks.push({
                    method,
                    constructor: ctor.name,
                    risk: "Overrides built-in"
                });
            }
        }
    }

    // --- STEP 8: RETURN RESULTS ---
    return {
        instanceReport,
        overrides,
        pollutionRisks,
        instanceofMap
    };
}


// --- EXAMPLE USAGE ---
console.log(inspectPrototypeIntegrity([
    { name: "Animal", prototypeProperties: [], prototypeMethods: ["breathe", "toString"], inheritsFrom: null, instances: [] },
    { name: "Dog", prototypeProperties: [], prototypeMethods: ["breathe", "bark"], inheritsFrom: "Animal", instances: [{ instanceName: "rex", ownProperties: ["name", "age"] }] }
]));


// --- Invalid Input ---
console.log(inspectPrototypeIntegrity("invalid"));