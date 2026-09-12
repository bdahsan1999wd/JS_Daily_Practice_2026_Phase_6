// 🧩 PROBLEM–01: createCurry()

// Logic: This function converts any multi-argument function into a
// curried version. Each call accepts one or more arguments, and when
// the total collected arguments reach the original function's arity
// (fn.length), it executes and returns the result. Supports partial
// application at each step via closure-based argument accumulation.


function createCurry(fn) {

    // --- STEP 1: VALIDATE INPUT ---
    if (typeof fn !== 'function') {
        return "Invalid Input";
    }

    // --- STEP 2: GET FUNCTION ARITY ---
    const arity = fn.length;

    // --- STEP 3: CREATE CURRIED FUNCTION ---
    // The curried function accumulates arguments across calls via closure
    function curried(...args) {
        // If we have enough arguments, execute the original function
        if (args.length >= arity) {
            return fn(...args.slice(0, arity));
        }

        // Otherwise, return a new function that accepts more arguments
        return function(...moreArgs) {
            return curried(...args, ...moreArgs);
        };
    }

    // --- STEP 4: RETURN CURRIED FUNCTION ---
    return curried;
}


// --- EXAMPLE USAGE ---
const curriedAdd = createCurry((a, b, c) => a + b + c);
console.log(curriedAdd(1)(2)(3));
console.log(curriedAdd(1, 2)(3));
console.log(curriedAdd(1)(2, 3));
console.log(curriedAdd(1, 2, 3));
const add5 = curriedAdd(5);
console.log(add5(3)(2));


// --- Invalid Input ---
console.log(createCurry("not a function"));