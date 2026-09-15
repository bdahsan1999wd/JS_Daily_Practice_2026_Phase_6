// 🧩 PROBLEM–02: simulatePrototypeChain()

// Logic: This function simulates JavaScript's prototype chain lookup.
// It walks up the chain from instance level through constructor prototypes
// to Object.prototype, finding the first level that has the property/method.


function simulatePrototypeChain(chain, lookups) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(chain) || !Array.isArray(lookups)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE CHAIN ---
    for (const level of chain) {
        if (
            typeof level !== 'object' ||
            level === null ||
            typeof level.level !== 'string' ||
            typeof level.properties !== 'object' ||
            level.properties === null ||
            !Array.isArray(level.methods)
        ) {
            return "Invalid Input";
        }
    }

    for (const name of lookups) {
        if (typeof name !== 'string') {
            return "Invalid Input";
        }
    }

    // --- STEP 3: PERFORM LOOKUPS ---
    const lookupResults = [];

    for (const name of lookups) {
        let foundAt = null;
        let traversedLevels = 0;
        let value = "undefined";

        for (let i = 0; i < chain.length; i++) {
            const level = chain[i];
            traversedLevels++;

            // Check properties
            if (level.properties && level.properties.hasOwnProperty(name)) {
                foundAt = level.level;
                value = level.properties[name];
                break;
            }

            // Check methods
            if (level.methods && level.methods.includes(name)) {
                foundAt = level.level;
                value = "method";
                break;
            }
        }

        if (foundAt === null) {
            traversedLevels = chain.length;
        }

        lookupResults.push({
            name,
            foundAt,
            traversedLevels,
            value
        });
    }

    // --- STEP 4: RETURN RESULTS ---
    return { lookupResults };
}


// --- EXAMPLE USAGE ---
console.log(simulatePrototypeChain(
    [
        { level: "instance", properties: { name: "Rahim" }, methods: [] },
        { level: "Person", properties: { species: "human" }, methods: ["greet", "walk"] },
        { level: "Object", properties: {}, methods: ["toString", "hasOwnProperty"] }
    ],
    ["name", "species", "greet", "toString", "fly"]
));


// --- Invalid Input ---
console.log(simulatePrototypeChain("invalid", []));