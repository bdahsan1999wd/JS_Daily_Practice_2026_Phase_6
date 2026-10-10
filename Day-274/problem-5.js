// PROBLEM–05: Type Guard & Narrowing Engine


function createTypeGuardEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== "object" ||
        typeof config.strict !== "boolean" ||
        typeof config.trackNarrowing !== "boolean"
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INTERNAL TRACKING ---
    const narrowingLog = [];

    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;

    const byGuardType = {};

    // --- STEP 3: LOG OPERATION ---
    const logOperation = (
        guard,
        input,
        result,
        passed
    ) => {
        if (!config.trackNarrowing) {
            return;
        }

        narrowingLog.push({
            guard,
            input,
            result,
            passed
        });
    };

    // --- STEP 4: UPDATE REPORT ---
    const updateReport = (
        guard,
        passed
    ) => {
        totalChecks++;

        if (passed) {
            passedChecks++;
        } else {
            failedChecks++;
        }

        byGuardType[guard] =
            (byGuardType[guard] || 0) + 1;
    };

    // --- STEP 5: GET TYPEOF TYPE ---
    const getType = (value) => {
        if (value === null) {
            return "null";
        }

        if (Array.isArray(value)) {
            return "array";
        }

        return typeof value;
    };

    // --- STEP 6: OBJECT TYPE DESCRIPTION ---
    const getObjectTypeDescription = (value) => {
        if (
            value === null ||
            typeof value !== "object"
        ) {
            return getType(value);
        }

        const properties = Object.entries(value).map(
            ([key, propertyValue]) => {
                return `${key}: ${getType(propertyValue)}`;
            }
        );

        return `{ ${properties.join("; ")} }`;
    };

    // --- STEP 7: RETURN TYPE GUARD ENGINE API ---
    return {

        // typeof(value, expectedType)

        typeof(value, expectedType) {
            const allowedTypes = [
                "string",
                "number",
                "boolean",
                "undefined",
                "object",
                "function",
                "bigint",
                "symbol"
            ];

            if (
                !allowedTypes.includes(expectedType)
            ) {
                return "Invalid Input";
            }

            const actualType =
                value === null
                    ? "object"
                    : typeof value;

            const passed =
                actualType === expectedType;

            const narrowed =
                passed ? expectedType : null;

            updateReport("typeof", passed);

            logOperation(
                "typeof",
                value,
                narrowed,
                passed
            );

            return {
                narrowed,
                type: actualType,
                passed
            };
        },


        // instanceof(value, className, classProperties[])
        instanceof(
            value,
            className,
            classProperties
        ) {
            if (
                typeof className !== "string" ||
                className.trim() === "" ||
                !Array.isArray(classProperties) ||
                classProperties.some(
                    (property) =>
                        typeof property !== "string"
                )
            ) {
                return "Invalid Input";
            }

            const passed =
                value !== null &&
                typeof value === "object" &&
                classProperties.every(
                    (property) =>
                        property in value
                );

            updateReport("instanceof", passed);

            logOperation(
                "instanceof",
                value,
                passed ? className : null,
                passed
            );

            return {
                narrowed: passed
                    ? className
                    : null,

                instanceOf: passed
                    ? className
                    : null,

                passed
            };
        },


        // in(value, key)
        in(value, key) {
            if (
                typeof key !== "string" ||
                key.trim() === ""
            ) {
                return "Invalid Input";
            }

            const passed =
                value !== null &&
                (typeof value === "object" ||
                    typeof value === "function") &&
                key in value;

            const narrowed =
                passed
                    ? getObjectTypeDescription(value)
                    : null;

            updateReport("in", passed);

            logOperation(
                "in",
                value,
                passed ? "narrowed" : null,
                passed
            );

            return {
                narrowed,
                hasKey: passed,
                passed
            };
        },


        // truthiness(value)
        truthiness(value) {
            const isTruthy = Boolean(value);

            let narrowed = null;
            let eliminates = null;

            if (isTruthy) {
                narrowed = getType(value);
            } else {
                narrowed = "never";
                eliminates = getType(value);
            }

            updateReport(
                "truthiness",
                isTruthy
            );

            logOperation(
                "truthiness",
                value,
                narrowed,
                isTruthy
            );

            return {
                narrowed,
                isTruthy,
                eliminates
            };
        },


        // equality(value, literal)
        equality(value, literal) {
            if (typeof literal !== "string") {
                return "Invalid Input";
            }

            let expectedValue;

            // Convert TypeScript-style literal text
            // into the corresponding JavaScript value.
            if (
                literal.startsWith("'") &&
                literal.endsWith("'")
            ) {
                expectedValue = literal.slice(1, -1);
            } else if (
                literal.startsWith('"') &&
                literal.endsWith('"')
            ) {
                expectedValue = literal.slice(1, -1);
            } else if (literal === "true") {
                expectedValue = true;
            } else if (literal === "false") {
                expectedValue = false;
            } else if (
                literal === "null"
            ) {
                expectedValue = null;
            } else if (
                !Number.isNaN(Number(literal))
            ) {
                expectedValue = Number(literal);
            } else {
                return "Invalid Input";
            }

            const matched =
                Object.is(
                    value,
                    expectedValue
                );

            const type =
                matched
                    ? `${getType(value)} literal`
                    : getType(value);

            updateReport(
                "equality",
                matched
            );

            logOperation(
                "equality",
                value,
                matched ? literal : null,
                matched
            );

            return {
                narrowed:
                    matched ? literal : null,

                matched,
                type
            };
        },


        // userDefined(value, guardFn, resultType)
        userDefined(
            value,
            guardFn,
            resultType
        ) {
            if (
                typeof guardFn !== "function" ||
                typeof resultType !== "string" ||
                resultType.trim() === ""
            ) {
                return "Invalid Input";
            }

            let passed = false;

            try {
                passed = Boolean(
                    guardFn(value)
                );
            } catch {
                passed = false;
            }

            updateReport(
                "userDefined",
                passed
            );

            logOperation(
                "userDefined",
                value,
                passed ? resultType : null,
                passed
            );

            return {
                narrowed:
                    passed ? resultType : null,

                passed,

                assertedType:
                    passed ? resultType : null
            };
        },

        // getNarrowingLog()
        getNarrowingLog() {
            return [...narrowingLog];
        },

        // getReport()
        getReport() {
            return {
                totalChecks,
                passed: passedChecks,
                failed: failedChecks,
                byGuardType: {
                    ...byGuardType
                }
            };
        }
    };
}



// --- EXAMPLE USAGE ---
const typeGuardEngine =
    createTypeGuardEngine({
        strict: true,
        trackNarrowing: true
    });

console.log(
    typeGuardEngine.typeof(
        "hello",
        "string"
    )
);

console.log(
    typeGuardEngine.typeof(
        42,
        "string"
    )
);

console.log(
    typeGuardEngine.in(
        {
            name: "Rahim",
            role: "admin"
        },
        "role"
    )
);

console.log(typeGuardEngine.truthiness(0));

console.log(typeGuardEngine.truthiness("hello"));

console.log(
    typeGuardEngine.equality(
        "active",
        "'active'"
    )
);

console.log(
    typeGuardEngine.userDefined(
        {
            id: 1,
            name: "Rahim"
        },
        (value) =>
            typeof value.id === "number" &&
            typeof value.name === "string",
        "User"
    )
);

console.log(typeGuardEngine.getNarrowingLog());
console.log(typeGuardEngine.getReport());


// --- Invalid Input ---
console.log(
    createTypeGuardEngine({
        strict: true
    })
);

console.log(createTypeGuardEngine("invalid"));