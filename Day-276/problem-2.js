// PROBLEM–02: createFunctionUtilityEngine()

// Logic: Simulates TypeScript function utility types such as ReturnType, Parameters, Awaited, ConstructorParameters, InstanceType, ThisParameterType, and OmitThisParameter.

function createFunctionUtilityEngine(functions) {

    // --- STEP 1: VALIDATE INPUT ---
    if (!Array.isArray(functions)) {
        return "Invalid Input";
    }

    // --- STEP 2: HELPER FUNCTIONS ---
    const isPlainObject = (value) => {
        return (
            value !== null &&
            typeof value === "object" &&
            !Array.isArray(value)
        );
    };

    const unwrapPromise = (type) => {
        let result = type;

        while (
            typeof result === "string" &&
            /^Promise<.*>$/.test(result)
        ) {
            result = result.slice(8, -1).trim();
        }

        return result;
    };

    // --- STEP 3: VALIDATE FUNCTION DEFINITIONS ---
    const functionMap = {};

    for (const fn of functions) {
        if (
            !isPlainObject(fn) ||
            typeof fn.name !== "string" ||
            !fn.name.trim() ||
            !Array.isArray(fn.params) ||
            typeof fn.returnType !== "string" ||
            typeof fn.isAsync !== "boolean"
        ) {
            return "Invalid Input";
        }

        if (functionMap[fn.name]) {
            return "Invalid Input";
        }

        for (const param of fn.params) {
            if (
                !isPlainObject(param) ||
                typeof param.name !== "string" ||
                typeof param.type !== "string" ||
                typeof param.optional !== "boolean"
            ) {
                return "Invalid Input";
            }
        }

        functionMap[fn.name] = {
            ...fn,
            params: fn.params.map((param) => ({ ...param }))
        };
    }

    // --- STEP 4: REPORT ---
    const report = {
        totalFunctions: functions.length,
        asyncFunctions: functions.filter(
            (fn) => fn.isAsync
        ).length,
        withThis: functions.filter(
            (fn) =>
                fn.params.length > 0 &&
                fn.params[0].name === "this"
        ).length
    };

    // --- STEP 5: LOOKUP FUNCTION ---
    const getFunction = (fnName) => {
        if (
            typeof fnName !== "string" ||
            !functionMap[fnName]
        ) {
            return null;
        }

        return functionMap[fnName];
    };

    // --- STEP 6: RETURN API ---
    return {
        // ReturnType<T>
        ReturnType(fnName) {
            const fn = getFunction(fnName);

            if (!fn) {
                return "Invalid Input";
            }

            return {
                fnName,
                returnType: fn.returnType,
                isAsync: fn.isAsync,
                awaitedType: unwrapPromise(fn.returnType)
            };
        },

        // Parameters<T>
        Parameters(fnName) {
            const fn = getFunction(fnName);

            if (!fn) {
                return "Invalid Input";
            }

            const paramsTuple = fn.params.map((param) => {
                return param.optional
                    ? `${param.type}?`
                    : param.type;
            });

            return {
                fnName,
                paramsTuple,
                typeString:
                    `Parameters<${fnName}> = [` +
                    `${paramsTuple.join(", ")}]`
            };
        },

        // Awaited<T>
        Awaited(fnName) {
            const fn = getFunction(fnName);

            if (!fn) {
                return "Invalid Input";
            }

            return {
                fnName,
                original: fn.returnType,
                awaited: unwrapPromise(fn.returnType)
            };
        },

        // ConstructorParameters<T>
        ConstructorParameters(className, params) {
            if (
                typeof className !== "string" ||
                !className.trim() ||
                !Array.isArray(params)
            ) {
                return "Invalid Input";
            }

            for (const param of params) {
                if (typeof param !== "string") {
                    return "Invalid Input";
                }
            }

            return {
                className,
                params,
                typeString:
                    `ConstructorParameters<${className}> = [` +
                    `${params.join(", ")}]`
            };
        },

        // InstanceType<T>
        InstanceType(className, properties) {
            if (
                typeof className !== "string" ||
                !className.trim() ||
                !isPlainObject(properties)
            ) {
                return "Invalid Input";
            }

            return {
                className,
                properties: { ...properties },
                typeString: `InstanceType<${className}>`
            };
        },

        // ThisParameterType<T>
        ThisParameterType(fnName) {
            const fn = getFunction(fnName);

            if (!fn) {
                return "Invalid Input";
            }

            const thisParam = fn.params.find(
                (param) => param.name === "this"
            );

            return {
                fnName,
                thisType: thisParam
                    ? thisParam.type
                    : "unknown"
            };
        },

        // OmitThisParameter<T>
        OmitThisParameter(fnName) {
            const fn = getFunction(fnName);

            if (!fn) {
                return "Invalid Input";
            }

            const params = fn.params
                .filter((param) => param.name !== "this")
                .map((param) => ({
                    ...param
                }));

            return {
                fnName,
                params,
                typeString:
                    `OmitThisParameter<${fnName}>`
            };
        },

        // Report
        getReport() {
            return { ...report };
        }
    };
}


// --- EXAMPLE USAGE ---
const engine = createFunctionUtilityEngine([
    {
        name: "fetchUser",
        params: [
            {
                name: "id",
                type: "number",
                optional: false
            }
        ],
        returnType: "Promise<User>",
        isAsync: true
    },
    {
        name: "formatName",
        params: [
            {
                name: "first",
                type: "string",
                optional: false
            },
            {
                name: "last",
                type: "string",
                optional: true
            }
        ],
        returnType: "string",
        isAsync: false
    },
    {
        name: "calculate",
        params: [
            {
                name: "a",
                type: "number",
                optional: false
            },
            {
                name: "b",
                type: "number",
                optional: false
            }
        ],
        returnType: "number",
        isAsync: false
    }
]);


console.log(engine.ReturnType("fetchUser"));

console.log(engine.ReturnType("formatName"));

console.log(engine.Parameters("formatName"));

console.log(engine.Awaited("fetchUser"));

console.log(
    engine.ConstructorParameters(
        "UserService",
        ["string", "number"]
    )
);

console.log(
    engine.InstanceType(
        "User",
        {
            id: "number",
            name: "string"
        }
    )
);

console.log(engine.getReport());