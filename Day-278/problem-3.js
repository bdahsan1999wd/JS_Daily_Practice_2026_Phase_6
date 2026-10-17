// PROBLEM–03: buildTypeSafeEventSystem()

// Logic: Creates a runtime simulation of a TypeScript type-safe event system.

function buildTypeSafeEventSystem(config) {

    // --- STEP 1: VALIDATE CONFIGURATION ---

    if (
        typeof config !== "object" ||
        config === null ||
        typeof config.systemName !== "string" ||
        config.systemName.trim() === "" ||
        typeof config.strict !== "boolean" ||
        !Array.isArray(config.events)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: CREATE EVENT REGISTRY ---

    const events = new Map();
    const handlers = new Map();

    let totalEmitted = 0;
    let typeErrors = 0;

    // --- STEP 3: VALIDATE EVENT DEFINITIONS ---

    for (const event of config.events) {
        if (
            typeof event !== "object" ||
            event === null ||
            typeof event.name !== "string" ||
            event.name.trim() === "" ||
            typeof event.payloadType !== "object" ||
            event.payloadType === null ||
            Array.isArray(event.payloadType)
        ) {
            return "Invalid Input";
        }

        for (const type of Object.values(
            event.payloadType
        )) {
            if (typeof type !== "string") {
                return "Invalid Input";
            }
        }

        events.set(event.name, {
            name: event.name,
            payloadType: {
                ...event.payloadType
            }
        });

        handlers.set(event.name, []);
    }

    // --- STEP 4: DETECT RUNTIME TYPE ---

    function getRuntimeType(value) {
        if (value === null) {
            return "null";
        }

        if (Array.isArray(value)) {
            return "array";
        }

        return typeof value;
    }

    // --- STEP 5: VALIDATE PAYLOAD ---

    function validatePayload(
        eventName,
        payload
    ) {
        const event = events.get(eventName);

        if (!event) {
            return {
                valid: false,
                errors: {
                    event:
                        "Unknown event"
                }
            };
        }

        if (
            typeof payload !== "object" ||
            payload === null ||
            Array.isArray(payload)
        ) {
            return {
                valid: false,
                errors: {
                    payload:
                        "Payload must be an object"
                }
            };
        }

        const errors = {};

        for (
            const [field, expectedType]
            of Object.entries(event.payloadType)
        ) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    payload,
                    field
                )
            ) {
                errors[field] =
                    "Required field missing";

                continue;
            }

            const actualType =
                getRuntimeType(payload[field]);

            if (actualType !== expectedType) {
                errors[field] =
                    `Expected ${expectedType}, got ${actualType}`;
            }
        }

        return {
            valid:
                Object.keys(errors).length === 0,
            errors
        };
    }

    // --- STEP 6: DEFINE NEW EVENT ---

    function defineEvent(
        name,
        payloadShape
    ) {
        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            typeof payloadShape !== "object" ||
            payloadShape === null ||
            Array.isArray(payloadShape)
        ) {
            return "Invalid Input";
        }

        events.set(name, {
            name,
            payloadType: {
                ...payloadShape
            }
        });

        handlers.set(name, []);

        return {
            name,
            payloadType: {
                ...payloadShape
            }
        };
    }

    // --- STEP 7: REGISTER TYPED HANDLER ---

    function on(eventName, handler) {
        if (
            typeof eventName !== "string" ||
            typeof handler !== "function" ||
            !events.has(eventName)
        ) {
            return "Invalid Input";
        }

        handlers
            .get(eventName)
            .push(handler);

        return {
            eventName,
            handlerName:
                `on${eventName}`,
            registered: true
        };
    }

    // --- STEP 8: EMIT EVENT ---

    function emit(eventName, payload) {
        if (
            typeof eventName !== "string" ||
            !events.has(eventName)
        ) {
            return "Invalid Input";
        }

        const validation =
            validatePayload(
                eventName,
                payload
            );

        if (!validation.valid) {
            typeErrors++;

            return {
                emitted: false,
                subscriberCount: 0,
                payloadValid: false,
                errors: validation.errors
            };
        }

        totalEmitted++;

        const eventHandlers =
            handlers.get(eventName);

        for (const handler of eventHandlers) {
            handler(payload);
        }

        return {
            emitted: true,
            subscriberCount:
                eventHandlers.length,
            payloadValid: true,
            errors: {}
        };
    }

    // --- STEP 9: GET EVENT TYPE ---

    function getEventType(eventName) {
        const event = events.get(eventName);

        if (!event) {
            return "Invalid Input";
        }

        const properties =
            Object.entries(event.payloadType)
                .map(
                    ([key, type]) =>
                        `${key}: ${type}`
                )
                .join("; ");

        return `{ ${properties} }`;
    }

    // --- STEP 10: GENERATE EVENT MAP ---

    function generateEventMap() {
        const lines = [
            "type EventMap = {"
        ];

        for (const event of events.values()) {
            const payload =
                Object.entries(
                    event.payloadType
                )
                    .map(
                        ([key, type]) =>
                            `${key}: ${type}`
                    )
                    .join("; ");

            lines.push(
                `  ${event.name}: { ${payload} };`
            );
        }

        lines.push("};");

        return lines.join("\n");
    }

    // --- STEP 11: GENERATE HANDLER NAMES ---

    function getHandlerNames() {
        return [...events.keys()]
            .map(
                eventName =>
                    `on${eventName}`
            );
    }

    // --- STEP 12: GENERATE REPORT ---

    function getReport() {
        let totalHandlers = 0;

        for (const list of handlers.values()) {
            totalHandlers += list.length;
        }

        return {
            totalEvents: events.size,
            totalHandlers,
            totalEmitted,
            typeErrors
        };
    }

    // --- STEP 13: RETURN EVENT SYSTEM API ---

    return {
        defineEvent,
        on,
        emit,
        getEventType,
        generateEventMap,
        getHandlerNames,
        getReport
    };
}


// --- EXAMPLE USAGE ---
const system = buildTypeSafeEventSystem({
    systemName: "AppEvents",
    strict: true,

    events: [
        {
            name: "UserCreated",
            payloadType: {
                userId: "number",
                name: "string",
                email: "string"
            }
        },
        {
            name: "OrderPlaced",
            payloadType: {
                orderId: "number",
                userId: "number",
                total: "number"
            }
        },
        {
            name: "PaymentFailed",
            payloadType: {
                orderId: "number",
                reason: "string"
            }
        }
    ]
});


system.on(
    "UserCreated",
    payload =>
        "User: " + payload.name
);

console.log(
    system.emit(
        "UserCreated",
        {
            userId: 1,
            name: "Rahim",
            email: "r@mail.com"
        }
    )
);

console.log(
    system.emit(
        "UserCreated",
        {
            userId: "one",
            name: "Rahim"
        }
    )
);

console.log(system.getEventType("UserCreated"));

console.log(system.generateEventMap());

console.log(system.getHandlerNames());

console.log(system.getReport());