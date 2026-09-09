// 🧩 PROBLEM–03: createMultiplierFactory()

// Logic: This function creates a factory that produces multiplier functions.
// Each multiplier function captures its factor via closure, ensuring
// private state per multiplier. The factory maintains a registry of
// multipliers and provides APIs to manage them dynamically.


function createMultiplierFactory(rules) {

    // --- STEP 1: VALIDATE INPUT ---
    // Check if rules is an array.
    if (!Array.isArray(rules)) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH RULE ---
    // Each rule must be an object with string name and numeric factor.
    for (const rule of rules) {
        if (
            typeof rule !== 'object' ||
            rule === null ||
            typeof rule.name !== 'string' ||
            typeof rule.factor !== 'number'
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: INITIALIZE PRIVATE REGISTRY ---
    // Use a Map to store multipliers with their factors.
    // This registry is private and only accessible via closure.
    const multipliers = new Map();

    // Populate initial multipliers from rules
    for (const rule of rules) {
        multipliers.set(rule.name, rule.factor);
    }

    // --- STEP 4: DEFINE GETMULTIPLIER METHOD ---
    // Returns a closure function that multiplies its input by the stored factor.
    // Returns "Not Found" if multiplier name doesn't exist.
    const getMultiplier = (name) => {
        if (!multipliers.has(name)) {
            return "Not Found";
        }
        const factor = multipliers.get(name);
        // Return a function that captures `factor` via closure
        return (input) => {
            if (typeof input !== 'number') {
                return "Invalid Input";
            }
            return input * factor;
        };
    };

    // --- STEP 5: DEFINE LISTMULTIPLIERS METHOD ---
    // Returns array of registered multiplier names.
    const listMultipliers = () => Array.from(multipliers.keys());

    // --- STEP 6: DEFINE ADDMULTIPLIER METHOD ---
    // Adds a new multiplier dynamically to the registry.
    // Returns true on success, or "Invalid Input" for invalid parameters.
    const addMultiplier = (name, factor) => {
        if (typeof name !== 'string' || typeof factor !== 'number') {
            return "Invalid Input";
        }
        multipliers.set(name, factor);
        return true;
    };

    // --- STEP 7: RETURN FACTORY API ---
    return {
        getMultiplier,
        listMultipliers,
        addMultiplier
    };
}

// --- EXAMPLE USAGE ---
const factory = createMultiplierFactory([
    { name: "double", factor: 2 },
    { name: "triple", factor: 3 }
]);

const double = factory.getMultiplier("double");

console.log(double(5));
console.log(factory.getMultiplier("triple")(4));
console.log(factory.listMultipliers());

factory.addMultiplier("quadruple", 4);
console.log(factory.getMultiplier("quadruple")(3));
console.log(factory.getMultiplier("unknown"));

// --- Invalid Input ---
console.log(createMultiplierFactory("invalid")); // "Invalid Input"