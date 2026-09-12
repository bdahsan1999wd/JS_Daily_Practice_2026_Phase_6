// 🧩 PROBLEM–05: createMiddlewarePipeline()

// Logic: This function creates a middleware pipeline where each
// middleware receives (context, next) and can modify context before
// calling next(). Middlewares execute in order. If stopOnError is true,
// pipeline halts on first error. All middleware registry is private.


function createMiddlewarePipeline(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.name !== 'string' ||
        typeof config.stopOnError !== 'boolean'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE STATE ---
    const middlewares = []; // Array of { name, fn }

    // --- STEP 3: DEFINE USE ---
    function use(name, fn) {
        if (typeof name !== 'string' || typeof fn !== 'function') {
            return "Invalid Input";
        }
        middlewares.push({ name, fn });
    }

    // --- STEP 4: DEFINE RUN ---
    function run(initialContext) {
        const executionLog = [];
        let context = { ...initialContext };
        let stopped = false;
        let error = null;

        for (let i = 0; i < middlewares.length; i++) {
            const { name, fn } = middlewares[i];
            let calledNext = false;

            const next = () => {
                calledNext = true;
            };

            try {
                fn(context, next);
                executionLog.push(name);

                if (!calledNext) {
                    // Middleware didn't call next() pipeline stops
                    stopped = true;
                    break;
                }
            } catch (err) {
                error = err.message;
                executionLog.push(name);
                if (config.stopOnError) {
                    stopped = true;
                    break;
                }
                // If not stopOnError, continue to next middleware
            }
        }

        return {
            finalContext: context,
            executionLog,
            stopped,
            error
        };
    }

    // --- STEP 5: DEFINE GETMIDDLEWARES ---
    function getMiddlewares() {
        return middlewares.map(m => m.name);
    }

    // --- STEP 6: DEFINE CLEAR ---
    function clear() {
        middlewares.length = 0;
    }

    // --- STEP 7: RETURN PIPELINE API ---
    return {
        use,
        run,
        getMiddlewares,
        clear
    };
}


// --- EXAMPLE USAGE ---
const pipeline = createMiddlewarePipeline({ name: "authPipeline", stopOnError: true });

pipeline.use("logger", (ctx, next) => { ctx.logged = true; next(); });
pipeline.use("auth", (ctx, next) => { ctx.authenticated = true; next(); });
pipeline.use("transform", (ctx, next) => { ctx.data = ctx.data.toUpperCase(); next(); });
console.log(pipeline.run({ data: "hello" }));

console.log(pipeline.getMiddlewares());

// --- Invalid Input ---
console.log(createMiddlewarePipeline("invalid"));