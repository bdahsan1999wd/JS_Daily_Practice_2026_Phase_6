// PROBLEM–01: createErrorPathSuite()

// Logic: This function creates an error-path testing engine that verifies thrown errors, invalid return values, graceful execution, and error messages. All registered test results are stored internally and can be summarized later.

function createErrorPathSuite(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    // Ensure config is a valid object and contains all required properties.
    if (
        !config ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.suiteName !== "string" ||
        config.suiteName.trim() === "" ||
        typeof config.targetFn !== "function" ||
        !["TypeError", "RangeError", "ValidationError", "CustomError", "any"].includes(
            config.expectedErrorType
        )
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: INITIALIZE PRIVATE TEST STORAGE ---
    // Keep registered tests private so external code cannot directly modify
    // the internal test collection.
    const tests = [];
    let lastRunResults = [];

    // --- STEP 3: CREATE ERROR TYPE CHECKER ---
    // Check whether a thrown error matches the expected error type.
    const matchesErrorType = (error) => {
        if (config.expectedErrorType === "any") {
            return true;
        }

        return error &&
            (error.name === config.expectedErrorType ||
                error.constructor?.name === config.expectedErrorType);
    };

    // --- STEP 4: CREATE SAFE FUNCTION EXECUTOR ---
    // Execute the target function while converting thrown errors into
    // a predictable internal representation.
    const executeTarget = (input) => {
        try {
            const args = Array.isArray(input) ? input : [input];

            return {
                threw: false,
                result: config.targetFn(...args)
            };
        } catch (error) {
            return {
                threw: true,
                error,
                result: undefined
            };
        }
    };

    // --- STEP 5: DEFINE testThrows METHOD ---
    // Verify that the target function throws an expected error with
    // the expected message.
    const testThrows = (testName, input, expectedMessage) => {
        if (
            typeof testName !== "string" ||
            typeof expectedMessage !== "string"
        ) {
            return "Invalid Input";
        }

        const execution = executeTarget(input);

        const matched =
            execution.threw &&
            matchesErrorType(execution.error) &&
            execution.error.message === expectedMessage;

        const result = {
            passed: matched,
            thrown: execution.threw,
            expectedMessage,
            actualMessage: execution.threw
                ? execution.error.message
                : undefined,
            matched
        };

        tests.push({
            type: "throws",
            name: testName,
            result
        });

        return result;
    };

    // --- STEP 6: DEFINE testReturnsInvalid METHOD ---
    // Verify that the target function returns the expected invalid value
    // instead of throwing an exception.
    const testReturnsInvalid = (testName, input, expectedReturn) => {
        if (typeof testName !== "string") {
            return "Invalid Input";
        }

        const execution = executeTarget(input);

        const passed =
            !execution.threw &&
            Object.is(execution.result, expectedReturn);

        const result = {
            passed,
            input,
            expected: expectedReturn,
            actual: execution.threw
                ? undefined
                : execution.result
        };

        tests.push({
            type: "returnsInvalid",
            name: testName,
            result
        });

        return result;
    };

    // --- STEP 7: DEFINE testDoesNotThrow METHOD ---
    // Verify that the target function handles the input without throwing.
    const testDoesNotThrow = (testName, input) => {
        if (typeof testName !== "string") {
            return "Invalid Input";
        }

        const execution = executeTarget(input);

        const result = {
            passed: !execution.threw,
            input,
            result: execution.result,
            threwError: execution.threw
        };

        tests.push({
            type: "doesNotThrow",
            name: testName,
            result
        });

        return result;
    };

    // --- STEP 8: DEFINE testErrorMessage METHOD ---
    // Execute the target function and verify that the thrown error message
    // matches either a string or a regular expression.
    const testErrorMessage = (testName, input, messagePattern) => {
        if (
            typeof testName !== "string" ||
            !(typeof messagePattern === "string" || messagePattern instanceof RegExp)
        ) {
            return "Invalid Input";
        }

        const execution = executeTarget(input);

        if (!execution.threw) {
            const result = {
                passed: false,
                message: undefined,
                matchedPattern: false
            };

            tests.push({
                type: "errorMessage",
                name: testName,
                result
            });

            return result;
        }

        const message = execution.error.message;

        const matchedPattern =
            typeof messagePattern === "string"
                ? message === messagePattern
                : messagePattern.test(message);

        const result = {
            passed: matchedPattern,
            message,
            matchedPattern
        };

        tests.push({
            type: "errorMessage",
            name: testName,
            result
        });

        return result;
    };

    // --- STEP 9: DEFINE runAll METHOD ---
    // Return the complete result of every registered error-path test.
    const runAll = () => {
        lastRunResults = tests.map((test) => ({
            name: test.name,
            type: test.type,
            ...test.result
        }));

        const passed = lastRunResults.filter((test) => test.passed).length;
        const failed = lastRunResults.length - passed;

        const errorPaths = lastRunResults.filter(
            (test) => test.thrown === true || test.type === "returnsInvalid"
        ).length;

        return {
            total: lastRunResults.length,
            passed,
            failed,
            errorPaths,
            results: lastRunResults
        };
    };

    // --- STEP 10: DEFINE getReport METHOD ---
    // Generate a compact summary based on the latest test results.
    const getReport = () => {
        const totalTests = lastRunResults.length;
        const passed = lastRunResults.filter((test) => test.passed).length;

        const errorsCaught = lastRunResults.filter(
            (test) => test.thrown === true
        ).length;

        const unexpectedPasses = lastRunResults.filter(
            (test) =>
                (test.type === "throws" && !test.thrown) ||
                (test.type === "errorMessage" && test.message === undefined)
        ).length;

        return {
            suiteName: config.suiteName,
            totalTests,
            errorsCaught,
            unexpectedPasses,
            passRate:
                totalTests === 0
                    ? "0.00%"
                    : `${((passed / totalTests) * 100).toFixed(2)}%`
        };
    };

    // --- STEP 11: RETURN ERROR PATH SUITE API ---
    return {
        testThrows,
        testReturnsInvalid,
        testDoesNotThrow,
        testErrorMessage,
        runAll,
        getReport
    };
}



// --- EXAMPLE USAGE ---

const suite = createErrorPathSuite({
    suiteName: "Divide Function Error Paths",

    targetFn: (a, b) => {
        if (typeof a !== "number" || typeof b !== "number") {
            return "Invalid Input";
        }

        if (b === 0) {
            throw new Error("Division by zero");
        }

        return a / b;
    },

    expectedErrorType: "any"
});



console.log(
    suite.testThrows(
        "throws on zero divisor",
        [10, 0],
        "Division by zero"
    )
);

console.log(
    suite.testReturnsInvalid(
        "returns invalid for string input",
        ["hello", 2],
        "Invalid Input"
    )
);

console.log(
    suite.testDoesNotThrow(
        "handles valid input gracefully",
        [10, 2]
    )
);

console.log(
    suite.testErrorMessage(
        "error message format",
        [5, 0],
        "Division by zero"
    )
);

console.log(suite.runAll());

console.log(suite.getReport());