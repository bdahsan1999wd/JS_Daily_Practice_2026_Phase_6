// 🧩 PROBLEM–03: createCompose()

// Logic: This function creates a composition engine that supports both
// compose (right-to-left) and pipe (left-to-right) function composition.
// It returns an object with compose, pipe, getSteps, and reset methods.
// All functions are stored privately via closure.


function createCompose() {

    // --- STEP 1: INITIALIZE PRIVATE STATE ---
    let registeredFns = [];

    // --- STEP 2: DEFINE COMPOSE ---
    // compose(f, g, h)(x) = f(g(h(x))) - right to left
    function compose(...fns) {
        // Validate all arguments are functions
        for (const f of fns) {
            if (typeof f !== 'function') {
                return "Invalid Input";
            }
        }
        registeredFns = [...fns];
        return function composed(value) {
            return fns.reduceRight((acc, fn) => fn(acc), value);
        };
    }

    // --- STEP 3: DEFINE PIPE ---
    // pipe(f, g, h)(x) = h(g(f(x))) - left to right
    function pipe(...fns) {
        for (const f of fns) {
            if (typeof f !== 'function') {
                return "Invalid Input";
            }
        }
        registeredFns = [...fns];
        return function piped(value) {
            return fns.reduce((acc, fn) => fn(acc), value);
        };
    }

    // --- STEP 4: DEFINE GETSTEPS ---
    function getSteps() {
        return registeredFns.map(fn => fn.name || "anonymous");
    }

    // --- STEP 5: DEFINE RESET ---
    function reset() {
        registeredFns = [];
    }

    // --- STEP 6: RETURN ENGINE OBJECT ---
    return {
        compose,
        pipe,
        getSteps,
        reset
    };
}


// --- EXAMPLE USAGE ---
const engine = createCompose();

const double = x => x * 2;
const addTen = x => x + 10;
const square = x => x * x;

const composed = engine.compose(double, addTen, square);
console.log(composed(3));

const piped = engine.pipe(square, addTen, double);
console.log(piped(3));

// --- Invalid Input ---
console.log(createCompose().compose("not a function"));