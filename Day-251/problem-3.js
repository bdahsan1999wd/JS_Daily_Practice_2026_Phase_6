// 🧩 PROBLEM–03: simulateHoisting()

// Logic: This function simulates JavaScript's hoisting behavior during
// the creation phase of an execution context. It processes an array of
// declaration objects and returns the hoisted state of each identifier
// before code execution begins, following JS hoisting rules.


function simulateHoisting(declarations) {

    // --- STEP 1: VALIDATE INPUT ---
    // Check if declarations is an array and not empty.
    if (!Array.isArray(declarations) || declarations.length === 0) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE EACH DECLARATION ---
    // Each declaration must have a valid type and string name.
    const validTypes = ["var", "let", "const", "function"];

    for (const decl of declarations) {
        if (
            typeof decl !== 'object' ||
            decl === null ||
            !validTypes.includes(decl.type) ||
            typeof decl.name !== 'string'
        ) {
            return "Invalid Input";
        }
    }

    // --- STEP 3: SIMULATE HOISTING ---
    // Create result object to store hoisted state.
    // Process declarations in order, but hoisting rules
    // depend only on the declaration type, not position.
    const hoistedState = {};

    for (const decl of declarations) {
        const { type, name, value } = decl;

        switch (type) {
            case "var":
                // var declarations are hoisted and initialized with undefined
                hoistedState[name] = "undefined";
                break;

            case "let":
            case "const":
                // let and const are hoisted but in Temporal Dead Zone (TDZ)
                // They exist but cannot be accessed until initialization
                hoistedState[name] = "TDZ";
                break;

            case "function":
                // Function declarations are hoisted with their full definition
                // The value property contains the function representation
                hoistedState[name] = value;
                break;
        }
    }

    // --- STEP 4: RETURN HOISTED STATE ---
    return hoistedState;
}


// --- EXAMPLE USAGE ---
console.log(simulateHoisting([
    { type: "var", name: "age", value: 25 },
    { type: "let", name: "city", value: "Dhaka" },
    { type: "const", name: "PI", value: 3.14 },
    { type: "function", name: "greet", value: "function greet(){}" }
]));


// --- Invalid Input ---
console.log(simulateHoisting("invalid"));
console.log(simulateHoisting([{ type: "var", name: 123 }]));