// 🧩 PROBLEM–02: buildFactorySystem()

// Logic: This function builds a Factory-based notification system that creates different notification objects without exposing their direct construction logic to the caller.


// --- STEP 1: DEFINE FACTORY SYSTEM ---

function buildFactorySystem(config) {

    // --- STEP 2: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.factoryName !== 'string' ||
        config.factoryName.trim() === '' ||
        !["strict", "flexible"].includes(config.registrationMode)
    ) {
        return "Invalid Input";
    }

    // --- STEP 3: DEFINE ABSTRACT NOTIFICATION ---
    class AbstractNotification {

        constructor(type) {
            this._type = type;
            this._log = [];
        }

        send(recipient, message) {
            throw new Error("Must implement send()");
        }

        getType() {
            return this._type;
        }

        getLog() {
            return [...this._log];
        }

        _recordSend(result) {
            this._log.push(result);
        }
    }

    // --- STEP 4: DEFINE EMAIL NOTIFICATION ---
    class EmailNotification extends AbstractNotification {

        constructor() {
            super("email");
        }

        send(recipient, message) {

            if (
                typeof recipient !== 'string' ||
                recipient.trim() === '' ||
                typeof message !== 'string' ||
                message.trim() === ''
            ) {
                return "Invalid Input";
            }

            const result = {
                type: "email",
                to: recipient,
                subject: message,
                status: "sent"
            };

            this._recordSend(result);

            return result;
        }
    }

    // --- STEP 5: DEFINE SMS NOTIFICATION ---
    class SMSNotification extends AbstractNotification {

        constructor() {
            super("sms");
        }

        send(recipient, message) {

            if (
                typeof recipient !== 'string' ||
                recipient.trim() === '' ||
                typeof message !== 'string' ||
                message.trim() === ''
            ) {
                return "Invalid Input";
            }

            const result = {
                type: "sms",
                phone: recipient,
                text: message,
                status: "sent"
            };

            this._recordSend(result);

            return result;
        }
    }

    // --- STEP 6: DEFINE PUSH NOTIFICATION ---
    class PushNotification extends AbstractNotification {

        constructor() {
            super("push");
        }

        send(recipient, message) {

            if (
                typeof recipient !== 'string' ||
                recipient.trim() === '' ||
                typeof message !== 'string' ||
                message.trim() === ''
            ) {
                return "Invalid Input";
            }

            const result = {
                type: "push",
                deviceId: recipient,
                payload: message,
                status: "delivered"
            };

            this._recordSend(result);

            return result;
        }
    }

    // --- STEP 7: DEFINE GENERIC NOTIFICATION ---
    class GenericNotification extends AbstractNotification {

        constructor(type) {
            super(type);
        }

        send(recipient, message) {

            if (
                typeof recipient !== 'string' ||
                recipient.trim() === '' ||
                typeof message !== 'string' ||
                message.trim() === ''
            ) {
                return "Invalid Input";
            }

            const result = {
                type: this.getType(),
                recipient,
                message,
                status: "sent"
            };

            this._recordSend(result);

            return result;
        }
    }

    // --- STEP 8: INITIALIZE FACTORY STATE ---

    const registeredTypes = new Map();

    const report = {
        totalCreated: 0,
        totalSent: 0,
        byType: {}
    };

    // Register built-in notification types
    registeredTypes.set("email", EmailNotification);
    registeredTypes.set("sms", SMSNotification);
    registeredTypes.set("push", PushNotification);

    // --- STEP 9: DEFINE REGISTER ---

    function register(type, NotificationClass) {

        if (
            typeof type !== 'string' ||
            type.trim() === '' ||
            typeof NotificationClass !== 'function'
        ) {
            return "Invalid Input";
        }

        if (registeredTypes.has(type)) {
            return "Type Exists";
        }

        registeredTypes.set(type, NotificationClass);

        return true;
    }

    // --- STEP 10: DEFINE CREATE ---

    function create(type) {

        if (
            typeof type !== 'string' ||
            type.trim() === ''
        ) {
            return "Invalid Input";
        }

        const NotificationClass = registeredTypes.get(type);

        // Strict mode only allows registered types
        if (!NotificationClass) {

            if (config.registrationMode === "strict") {
                return "Type Not Registered";
            }

            // Flexible mode creates generic notification
            const genericNotification = new GenericNotification(type);

            report.totalCreated++;
            report.byType[type] = (report.byType[type] || 0) + 1;

            return genericNotification;
        }

        const notification = new NotificationClass();

        report.totalCreated++;
        report.byType[type] = (report.byType[type] || 0) + 1;

        return notification;
    }

    // --- STEP 11: DEFINE CREATEANDSEND ---

    function createAndSend(type, recipient, message) {

        if (
            typeof type !== 'string' ||
            type.trim() === '' ||
            typeof recipient !== 'string' ||
            recipient.trim() === '' ||
            typeof message !== 'string' ||
            message.trim() === ''
        ) {
            return "Invalid Input";
        }

        const notification = create(type);

        if (
            typeof notification === 'string'
        ) {
            return notification;
        }

        const result = notification.send(recipient, message);

        if (typeof result === 'string') {
            return result;
        }

        report.totalSent++;

        return result;
    }

    // --- STEP 12: DEFINE BULKSEND ---

    function bulkSend(type, recipients, message) {

        if (
            typeof type !== 'string' ||
            type.trim() === '' ||
            !Array.isArray(recipients) ||
            recipients.length === 0 ||
            typeof message !== 'string' ||
            message.trim() === ''
        ) {
            return "Invalid Input";
        }

        for (const recipient of recipients) {
            if (
                typeof recipient !== 'string' ||
                recipient.trim() === ''
            ) {
                return "Invalid Input";
            }
        }

        const results = [];

        for (const recipient of recipients) {

            const notification = create(type);

            if (typeof notification === 'string') {
                return notification;
            }

            const result = notification.send(recipient, message);

            if (typeof result === 'string') {
                return result;
            }

            results.push(result);
            report.totalSent++;
        }

        return results;
    }

    // --- STEP 13: DEFINE GETREPORT ---

    function getReport() {
        return {
            totalCreated: report.totalCreated,
            totalSent: report.totalSent,
            byType: { ...report.byType }
        };
    }

    // --- STEP 14: RETURN API ---

    return {
        register,
        create,
        createAndSend,
        bulkSend,
        getReport
    };
}


// --- EXAMPLE USAGE ---

const factory = buildFactorySystem({
    factoryName: "NotifFactory",
    registrationMode: "strict"
});

const email = factory.create("email");

console.log(
    email.send(
        "rahim@mail.com",
        "Welcome!"
    )
);


console.log(
    factory.createAndSend(
        "sms",
        "01711111111",
        "OTP: 123456"
    )
);


console.log(
    factory.bulkSend(
        "push",
        ["d001", "d002", "d003"],
        "New update!"
    )
);

console.log(factory.getReport());

console.log(factory.create("whatsapp"));


// --- Invalid Input ---
console.log(
    buildFactorySystem("invalid")
);