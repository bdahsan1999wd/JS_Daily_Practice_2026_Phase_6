// 🧩 PROBLEM–03: buildObserverSystem()

// Logic: This function builds an Observer Pattern system where EventEmitters act as Subjects and Observer instances receive notifications when subscribed events are emitted.


function buildObserverSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        config.systemName.trim() === '' ||
        typeof config.maxObservers !== 'number' ||
        !Number.isFinite(config.maxObservers) ||
        config.maxObservers < 1 ||
        !Number.isInteger(config.maxObservers) ||
        typeof config.asyncMode !== 'boolean'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE OBSERVER CLASS ---
    class Observer {

        #name;
        #handlerFn;
        #history;

        constructor(name, handlerFn) {
            this.#name = name;
            this.#handlerFn = handlerFn;
            this.#history = [];
        }

        update(eventName, data) {

            if (
                typeof eventName !== 'string' ||
                eventName.trim() === ''
            ) {
                return "Invalid Input";
            }

            const historyEntry = {
                eventName,
                data
            };

            this.#history.push(historyEntry);

            return this.#handlerFn(data);
        }

        getHistory() {
            return [...this.#history];
        }

        getName() {
            return this.#name;
        }
    }

    // --- STEP 3: DEFINE EVENT EMITTER CLASS ---
    class EventEmitter {

        #name;
        #observers;

        constructor(name) {
            this.#name = name;
            this.#observers = new Map();
        }

        subscribe(eventName, observerName, callbackFn) {

            if (
                typeof eventName !== 'string' ||
                eventName.trim() === '' ||
                typeof observerName !== 'string' ||
                observerName.trim() === '' ||
                typeof callbackFn !== 'function'
            ) {
                return "Invalid Input";
            }

            if (!this.#observers.has(eventName)) {
                this.#observers.set(eventName, []);
            }

            const eventObservers = this.#observers.get(eventName);

            // Prevent duplicate subscription
            if (
                eventObservers.some(
                    observer => observer.name === observerName
                )
            ) {
                return "Observer Already Subscribed";
            }

            // Check system-wide observer limit
            if (
                totalSubscriptions >= config.maxObservers
            ) {
                return "Max Observers Reached";
            }

            eventObservers.push({
                name: observerName,
                callback: callbackFn,
                once: false
            });

            totalSubscriptions++;

            return true;
        }

        unsubscribe(eventName, observerName) {

            if (
                typeof eventName !== 'string' ||
                eventName.trim() === '' ||
                typeof observerName !== 'string' ||
                observerName.trim() === ''
            ) {
                return "Invalid Input";
            }

            const eventObservers = this.#observers.get(eventName);

            if (!eventObservers) {
                return false;
            }

            const index = eventObservers.findIndex(
                observer => observer.name === observerName
            );

            if (index === -1) {
                return false;
            }

            eventObservers.splice(index, 1);
            totalSubscriptions--;

            if (eventObservers.length === 0) {
                this.#observers.delete(eventName);
            }

            return true;
        }

        emit(eventName, data) {

            if (
                typeof eventName !== 'string' ||
                eventName.trim() === ''
            ) {
                return "Invalid Input";
            }

            const eventObservers = this.#observers.get(eventName);

            totalEventsEmitted++;

            if (!eventObservers) {
                return [];
            }

            const results = [];

            // Create a copy because once() observers
            // may unsubscribe while the event is being emitted.
            const observersSnapshot = [...eventObservers];

            for (const observer of observersSnapshot) {

                const result = observer.callback(
                    eventName,
                    data
                );

                results.push(result);

                if (observer.once) {
                    this.unsubscribe(
                        eventName,
                        observer.name
                    );
                }
            }

            // In async mode, return a Promise containing results.
            if (config.asyncMode) {
                return Promise.resolve(results);
            }

            return results;
        }

        once(eventName, observerName, callbackFn) {

            if (
                typeof eventName !== 'string' ||
                eventName.trim() === '' ||
                typeof observerName !== 'string' ||
                observerName.trim() === '' ||
                typeof callbackFn !== 'function'
            ) {
                return "Invalid Input";
            }

            if (!this.#observers.has(eventName)) {
                this.#observers.set(eventName, []);
            }

            const eventObservers = this.#observers.get(eventName);

            if (
                eventObservers.some(
                    observer => observer.name === observerName
                )
            ) {
                return "Observer Already Subscribed";
            }

            if (
                totalSubscriptions >= config.maxObservers
            ) {
                return "Max Observers Reached";
            }

            eventObservers.push({
                name: observerName,
                callback: callbackFn,
                once: true
            });

            totalSubscriptions++;

            return true;
        }

        getObservers(eventName) {

            if (
                typeof eventName !== 'string' ||
                eventName.trim() === ''
            ) {
                return "Invalid Input";
            }

            const eventObservers = this.#observers.get(eventName);

            if (!eventObservers) {
                return [];
            }

            return eventObservers.map(
                observer => observer.name
            );
        }

        getName() {
            return this.#name;
        }
    }

    // --- STEP 4: INITIALIZE SYSTEM STATE ---
    const emitters = new Map();
    const observers = new Map();

    let totalEventsEmitted = 0;
    let totalSubscriptions = 0;

    // --- STEP 5: DEFINE CREATEEMITTER ---
    function createEmitter(name) {

        if (
            typeof name !== 'string' ||
            name.trim() === ''
        ) {
            return "Invalid Input";
        }

        if (emitters.has(name)) {
            return "Emitter Exists";
        }

        const emitter = new EventEmitter(name);

        emitters.set(name, emitter);

        return emitter;
    }

    // --- STEP 6: DEFINE CREATEOBSERVER ---
    function createObserver(name, handlerFn) {

        if (
            typeof name !== 'string' ||
            name.trim() === '' ||
            typeof handlerFn !== 'function'
        ) {
            return "Invalid Input";
        }

        if (observers.has(name)) {
            return "Observer Exists";
        }

        const observer = new Observer(
            name,
            handlerFn
        );

        observers.set(name, observer);

        return observer;
    }

    // --- STEP 7: DEFINE GETEMITTER ---
    function getEmitter(name) {

        if (
            typeof name !== 'string' ||
            name.trim() === ''
        ) {
            return "Invalid Input";
        }

        return emitters.get(name);
    }

    // --- STEP 8: DEFINE GETOBSERVER ---
    function getObserver(name) {

        if (
            typeof name !== 'string' ||
            name.trim() === ''
        ) {
            return "Invalid Input";
        }

        return observers.get(name);
    }

    // --- STEP 9: DEFINE GETSYSTEMREPORT ---
    function getSystemReport() {
        return {
            totalEmitters: emitters.size,
            totalObservers: observers.size,
            totalEventsEmitted
        };
    }

    // --- STEP 10: RETURN API ---
    return {
        createEmitter,
        createObserver,
        getEmitter,
        getObserver,
        getSystemReport
    };
}


// --- EXAMPLE USAGE ---

const system = buildObserverSystem({
    systemName: "EventBus",
    maxObservers: 10,
    asyncMode: false
});

system.createEmitter("userEmitter");

system.createObserver(
    "emailService",
    data => "Email sent to " + data.email
);

system.createObserver(
    "logService",
    data => "Logged: " + data.name
);

const emitter = system.getEmitter("userEmitter");

emitter.subscribe(
    "userCreated",
    "emailService",
    system.getObserver("emailService").update.bind(
        system.getObserver("emailService")
    )
);

emitter.subscribe(
    "userCreated",
    "logService",
    system.getObserver("logService").update.bind(
        system.getObserver("logService")
    )
);


console.log(
    emitter.emit(
        "userCreated",
        {
            name: "Rahim",
            email: "rahim@mail.com"
        }
    )
);

console.log(emitter.getObservers("userCreated"));

emitter.unsubscribe(
    "userCreated",
    "logService"
);

console.log(emitter.getObservers("userCreated"));

console.log(system.getObserver("emailService").getHistory());

console.log(system.getSystemReport());


// --- Invalid Input ---
console.log(buildObserverSystem("invalid"));