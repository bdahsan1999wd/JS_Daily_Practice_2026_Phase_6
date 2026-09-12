// 🧩 PROBLEM–02: createPartial()

// Logic: This function creates a partially applied version of a function
// by pre-filling left side arguments. It supports placeholders ("_")
// to skip positions and fill them later. The returned function waits
// for remaining arguments and fills placeholders left-to-right first.


function createPartial(fn, ...presetArgs) {

    // --- STEP 1: VALIDATE INPUT ---
    if (typeof fn !== 'function') {
        return "Invalid Input";
    }

    // --- STEP 2: CREATE PARTIALLY APPLIED FUNCTION ---
    const partialFn = function (...laterArgs) {
        // Combine presetArgs with laterArgs, handling placeholders
        const combinedArgs = [];
        let laterIndex = 0;

        for (const presetArg of presetArgs) {
            if (presetArg === "_") {
                // Fill placeholder with next laterArg
                if (laterIndex < laterArgs.length) {
                    combinedArgs.push(laterArgs[laterIndex]);
                    laterIndex++;
                } else {
                    // Not enough later args for placeholders
                    combinedArgs.push("_"); // Keep as placeholder (will error on call)
                }
            } else {
                combinedArgs.push(presetArg);
            }
        }

        // Append remaining laterArgs
        while (laterIndex < laterArgs.length) {
            combinedArgs.push(laterArgs[laterIndex]);
            laterIndex++;
        }

        // Check if any placeholders remain
        if (combinedArgs.includes("_")) {
            // Return a function waiting for more args
            return function (...moreArgs) {
                return partialFn(...combinedArgs, ...moreArgs);
            };
        }

        // Execute original function with combined args
        return fn(...combinedArgs);
    };

    return partialFn;
}


// --- EXAMPLE USAGE ---
const multiply = (a, b, c) => a * b * c;

const double = createPartial(multiply, 2, "_", "_");
console.log(double(3, 4));

const multiplyBy5And = createPartial(multiply, "_", 5, "_");
console.log(multiplyBy5And(2, 3));

const fixed = createPartial(multiply, 2, 3, 4);
console.log(fixed());


// --- Invalid Input ---
console.log(createPartial("not a function", 1));