// 🧩 PROBLEM–05: buildDecoratorSystem()

// Logic: This function builds a Decorator Pattern system where logger objects can be dynamically wrapped with additional behaviors without modifying the original logger.


// --- STEP 1: VALIDATE CONFIG ---

function buildDecoratorSystem(config) {

    if (
        !config ||
        typeof config !== "object" ||
        Array.isArray(config) ||
        typeof config.systemName !== "string" ||
        config.systemName.trim() === "" ||
        typeof config.maxDecorators !== "number" ||
        !Number.isFinite(config.maxDecorators) ||
        !Number.isInteger(config.maxDecorators) ||
        config.maxDecorators < 1
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE BASE LOGGER ---

    class BaseLogger {

        constructor(name) {
            this._name = name;
        }

        log(message) {

            if (
                typeof message !== "string" ||
                message.trim() === ""
            ) {
                return "Invalid Input";
            }

            return `[BASE] ${message}`;
        }

        getType() {
            return "BaseLogger";
        }

        getName() {
            return this._name;
        }
    }

    // --- STEP 3: DEFINE LOGGER DECORATOR BASE CLASS ---

    class LoggerDecorator {

        constructor(logger) {
            this._logger = logger;
        }

        log(message) {
            return this._logger.log(message);
        }

        getType() {
            return this._logger.getType();
        }

        getName() {
            return this._logger.getName();
        }
    }

    // --- STEP 4: DEFINE TIMESTAMP DECORATOR ---

    class TimestampDecorator extends LoggerDecorator {

        constructor(logger) {
            super(logger);

            this._timestampCount = 0;
        }

        log(message) {

            const result = this._logger.log(message);

            if (result === "Invalid Input") {
                return result;
            }

            if (result === "Filtered") {
                return result;
            }

            this._timestampCount++;

            return `[T:${this._timestampCount}] ${result}`;
        }

        getType() {
            return "TimestampDecorator";
        }
    }

    // --- STEP 5: DEFINE LEVEL DECORATOR ---

    class LevelDecorator extends LoggerDecorator {

        constructor(logger, level) {
            super(logger);

            this._level = level;
        }

        log(message) {

            const result = this._logger.log(message);

            if (
                result === "Invalid Input" ||
                result === "Filtered"
            ) {
                return result;
            }

            return `[${this._level}] ${result}`;
        }

        getType() {
            return "LevelDecorator";
        }
    }

    // --- STEP 6: DEFINE PREFIX DECORATOR ---

    class PrefixDecorator extends LoggerDecorator {

        constructor(logger, prefix) {
            super(logger);

            this._prefix = prefix;
        }

        log(message) {

            const result = this._logger.log(message);

            if (
                result === "Invalid Input" ||
                result === "Filtered"
            ) {
                return result;
            }

            return `[${this._prefix}] ${result}`;
        }

        getType() {
            return "PrefixDecorator";
        }
    }

    // --- STEP 7: DEFINE FILTER DECORATOR ---

    class FilterDecorator extends LoggerDecorator {

        constructor(logger, keyword) {
            super(logger);

            this._keyword = keyword;
        }

        log(message) {

            if (
                typeof message !== "string" ||
                message.trim() === ""
            ) {
                return "Invalid Input";
            }

            if (!message.includes(this._keyword)) {
                return "Filtered";
            }

            return this._logger.log(message);
        }

        getType() {
            return "FilterDecorator";
        }
    }

    // --- STEP 8: DEFINE COUNT DECORATOR ---

    class CountDecorator extends LoggerDecorator {

        constructor(logger) {
            super(logger);

            this._count = 0;
        }

        log(message) {

            const result = this._logger.log(message);

            if (
                result === "Invalid Input" ||
                result === "Filtered"
            ) {
                return result;
            }

            this._count++;

            return `[#${this._count}] ${result}`;
        }

        getType() {
            return "CountDecorator";
        }

        getCount() {
            return this._count;
        }
    }

    // --- STEP 9: INITIALIZE SYSTEM STATE ---

    const loggers = new Map();

    const decoratorUsage = {};

    let totalLogsEmitted = 0;

    // --- STEP 10: DEFINE DECORATOR FACTORY ---

    function createDecorator(
        decoratorType,
        logger,
        args
    ) {

        switch (decoratorType) {

            case "TimestampDecorator":
                return new TimestampDecorator(logger);

            case "LevelDecorator":
                return new LevelDecorator(
                    logger,
                    args[0]
                );

            case "PrefixDecorator":
                return new PrefixDecorator(
                    logger,
                    args[0]
                );

            case "FilterDecorator":
                return new FilterDecorator(
                    logger,
                    args[0]
                );

            case "CountDecorator":
                return new CountDecorator(logger);

            default:
                return "Decorator Not Found";
        }
    }

    // --- STEP 11: DEFINE CREATELOGGER ---

    function createLogger(name) {

        if (
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            return "Invalid Input";
        }

        if (loggers.has(name)) {
            return "Logger Exists";
        }

        const baseLogger = new BaseLogger(name);

        loggers.set(name, {

            // Original BaseLogger
            base: baseLogger,

            // Currently active logger
            current: baseLogger,

            // Stores decorator name + instance
            stack: [],

            // Stable public logger wrapper
            reportLogger: null
        });

        return baseLogger;
    }

    // --- STEP 12: DEFINE DECORATE ---

    function decorate(
        loggerName,
        decoratorType,
        ...args
    ) {

        if (
            typeof loggerName !== "string" ||
            loggerName.trim() === "" ||
            typeof decoratorType !== "string" ||
            decoratorType.trim() === ""
        ) {
            return "Invalid Input";
        }

        const loggerData = loggers.get(loggerName);

        if (!loggerData) {
            return "Logger Not Found";
        }

        // Check maximum decorator limit
        if (
            loggerData.stack.length >=
            config.maxDecorators
        ) {
            return "Max Decorators Reached";
        }

        // Validate decorator-specific arguments
        if (
            (
                decoratorType === "LevelDecorator" ||
                decoratorType === "PrefixDecorator" ||
                decoratorType === "FilterDecorator"
            ) &&
            (
                typeof args[0] !== "string" ||
                args[0].trim() === ""
            )
        ) {
            return "Invalid Input";
        }

        // Create the new decorator
        const decoratedLogger = createDecorator(
            decoratorType,
            loggerData.current,
            args
        );

        if (typeof decoratedLogger === "string") {
            return decoratedLogger;
        }

        // Update current logger
        loggerData.current = decoratedLogger;

        // Store both decorator type and instance
        loggerData.stack.push({
            type: decoratorType,
            instance: decoratedLogger
        });

        // Track decorator usage
        decoratorUsage[decoratorType] =
            (decoratorUsage[decoratorType] || 0) + 1;

        return decoratedLogger;
    }

    // --- STEP 13: DEFINE GETLOGGER ---

    function getLogger(name) {

        if (
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            return "Invalid Input";
        }

        const loggerData = loggers.get(name);

        if (!loggerData) {
            return undefined;
        }

        // Create the public wrapper only once
        if (!loggerData.reportLogger) {

            loggerData.reportLogger = {

                log(message) {

                    // Always use the CURRENT logger.
                    const result =
                        loggerData.current.log(message);

                    if (
                        result !== "Invalid Input" &&
                        result !== "Filtered"
                    ) {
                        totalLogsEmitted++;
                    }

                    return result;
                },

                getType() {
                    return loggerData.current.getType();
                },

                getName() {
                    return loggerData.current.getName();
                }
            };
        }

        return loggerData.reportLogger;
    }

    // --- STEP 14: DEFINE GETDECORATORSTACK ---

    function getDecoratorStack(name) {

        if (
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            return "Invalid Input";
        }

        const loggerData = loggers.get(name);

        if (!loggerData) {
            return [];
        }

        // Return only decorator names
        return loggerData.stack.map(
            decorator => decorator.type
        );
    }

    // --- STEP 15: DEFINE UNDECORATE ---

    function undecorate(name) {

        if (
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            return "Invalid Input";
        }

        const loggerData = loggers.get(name);

        if (!loggerData) {
            return "Logger Not Found";
        }

        if (loggerData.stack.length === 0) {
            return "No Decorators";
        }

        // Remove the outermost decorator
        loggerData.stack.pop();

        // If no decorators remain,
        // restore the original BaseLogger.
        if (loggerData.stack.length === 0) {

            loggerData.current =
                loggerData.base;

        } else {

            // Otherwise restore the previous
            // decorator instance.
            loggerData.current =
                loggerData.stack[
                    loggerData.stack.length - 1
                ].instance;
        }

        return loggerData.current;
    }

    // --- STEP 16: RETURN API ---

    return {

        createLogger,

        decorate,

        getLogger,

        getDecoratorStack,

        undecorate,

        getReport() {

            return {

                totalLoggers: loggers.size,

                decoratorUsage: {
                    ...decoratorUsage
                },

                totalLogsEmitted

            };
        }
    };
}


// --- EXAMPLE USAGE ---

const system = buildDecoratorSystem({

    systemName: "LogSystem",

    maxDecorators: 5
});

system.createLogger("appLogger");

system.decorate(
    "appLogger",
    "TimestampDecorator"
);

system.decorate(
    "appLogger",
    "LevelDecorator",
    "ERROR"
);

system.decorate(
    "appLogger",
    "PrefixDecorator",
    "APP"
);


console.log(
    system.getLogger("appLogger").log(
        "DB connection failed"
    )
);

console.log(system.getDecoratorStack("appLogger"));


system.undecorate("appLogger");

console.log(
    system.getDecoratorStack("appLogger")
);

console.log(
    system.getLogger("appLogger").log(
        "Server started"
    )
);

console.log(system.getReport());


// --- Invalid Input ---
console.log(buildDecoratorSystem("invalid"));