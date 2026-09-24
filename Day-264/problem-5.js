// 🧩 PROBLEM–05: buildOOPMasterSystem()

// Logic: This function builds a master OOP system combining ALL M2
// concepts: Constructor+Prototype, ES6 Classes, Encapsulation,
// Inheritance+Polymorphism, Composition, Design Patterns (Singleton, Factory, Observer, Strategy, Decorator).


function buildOOPMasterSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        typeof config.version !== 'string' ||
        typeof config.taxRate !== 'number' ||
        typeof config.maxEntities !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE BASE ENTITY (Constructor + Prototype) ---
    function Entity(id, data) {
        this.id = id;
        this.createdAt = Date.now();
    }
    Entity.prototype.getId = function () { return this.id; };

    // --- STEP 3: DEFINE ES6 CLASS HIERARCHY ---
    class Asset extends Entity {
        constructor(id, data) {
            super(id, data);
            this.name = data.name;
            this.value = data.value || 0;
        }
        getInfo() { return `Asset: ${this.name}, Value: ${this.value}`; }
    }

    class Product extends Asset {
        constructor(id, data) {
            super(id, data);
            this.price = data.price || 0;
            this.stock = data.stock || 0;
        }
        getInfo() { return `Product: ${this.name}, Price: ${this.price}, Stock: ${this.stock}`; }
    }

    class Service extends Asset {
        constructor(id, data) {
            super(id, data);
            this.duration = data.duration || 0;
            this.rate = data.rate || 0;
        }
        getInfo() { return `Service: ${this.name}, Duration: ${this.duration}, Rate: ${this.rate}`; }
    }

    class User extends Entity {
        constructor(id, data) {
            super(id, data);
            this.name = data.name;
            this.email = data.email;
            this.role = data.role;
        }
        getInfo() { return `User: ${this.name}, Email: ${this.email}, Role: ${this.role}`; }
    }

    // --- STEP 4: ENCAPSULATION WITH PRIVATE FIELDS ---
    // Use closure for private fields
    function withAudit(entity) {
        const _auditLog = [];
        entity.logAudit = (action, details) => {
            _auditLog.push({ action, details, timestamp: Date.now() });
        };
        entity.getAuditLog = () => [..._auditLog];
    }

    function withCache(entity) {
        const _cache = new Map();
        entity.cacheGet = (key) => _cache.get(key);
        entity.cacheSet = (key, val) => _cache.set(key, val);
        entity.cacheClear = () => _cache.clear();
    }

    function withValidation(entity) {
        entity.validate = () => {
            const errors = [];
            if (!entity.id) errors.push("Missing ID");
            if (entity.value !== undefined && entity.value < 0) errors.push("Negative value");
            return { valid: errors.length === 0, errors };
        };
    }

    // --- STEP 5: PRICING STRATEGIES (Strategy Pattern) ---
    const pricingStrategies = {
        standard: (price) => price,
        premium: (price) => price * 1.2,
        discount: (price) => price * 0.9
    };

    // --- STEP 6: DECORATORS (Decorator Pattern) ---
    const decorators = {
        TaxDecorator: (entity) => {
            const originalGetInfo = entity.getInfo;
            entity.getInfo = () => originalGetInfo() + ` [Tax: ${entity.price ? entity.price * 0.15 : 0}]`;
            return entity;
        },
        LoggingDecorator: (entity) => {
            const originalGetInfo = entity.getInfo;
            entity.getInfo = () => { console.log(`Accessing ${entity.id}`); return originalGetInfo(); };
            return entity;
        }
    };

    // --- STEP 7: INITIALIZE MASTER STATE (Singleton) ---
    let masterInstance = null;
    const entities = new Map(); // id -> entity
    const transactionLog = [];
    const eventListeners = new Map(); // eventName -> Set of callbacks
    let currentPricingStrategy = "standard";
    const decoratorMap = new Map(); // entityId -> [decoratorNames]

    function emitEvent(eventName, data) {
        if (eventListeners.has(eventName)) {
            for (const fn of eventListeners.get(eventName)) {
                fn(data);
            }
        }
    }

    // --- STEP 8: DEFINE MASTER API ---
    function createEntity(type, data) {
        if (entities.size >= config.maxEntities) return "Max Entities Reached";

        let entity;
        switch (type) {
            case "product":
                entity = new Product(data.id, data);
                break;
            case "service":
                entity = new Service(data.id, data);
                break;
            case "user":
                entity = new User(data.id, data);
                break;
            default:
                return "Invalid Entity Type";
        }

        // Apply composition behaviors
        withAudit(entity);
        withCache(entity);
        withValidation(entity);

        entities.set(entity.id, entity);
        return entity;
    }

    function getEntity(id) {
        return entities.get(id) || null;
    }

    function setPricingStrategy(strategy) {
        if (!pricingStrategies[strategy]) return "Invalid Strategy";
        currentPricingStrategy = strategy;
    }

    function applyDecorator(entityId, decoratorType) {
        const entity = entities.get(entityId);
        if (!entity) return "Entity Not Found";
        if (!decorators[decoratorType]) return "Decorator Not Found";

        decorators[decoratorType](entity);
        if (!decoratorMap.has(entityId)) decoratorMap.set(entityId, []);
        decoratorMap.get(entityId).push(decoratorType);
    }

    function onEvent(event, fn) {
        if (!eventListeners.has(event)) {
            eventListeners.set(event, new Set());
        }
        eventListeners.get(event).add(fn);
    }

    function processTransaction(fromId, toId, amount) {
        const from = entities.get(fromId);
        const to = entities.get(toId);
        if (!from || !to) return "Entity Not Found";

        const price = to.price ? to.price * (pricingStrategies[currentPricingStrategy](1)) : 0;
        const tax = Math.round(amount * config.taxRate / 100);
        const netAmount = amount - tax;
        transactionLog.push({ from: fromId, to: toId, amount, tax, netAmount, timestamp: Date.now() });
        emitEvent("transactionCompleted", { from: fromId, to: toId, amount, tax, netAmount, status: "completed" });
        return { from: fromId, to: toId, amount, tax, netAmount, status: "completed" };
    }

    function getFullReport() {
        const totalEntities = { product: 0, service: 0, user: 0 };
        for (const e of entities.values()) {
            if (e instanceof Product) totalEntities.product++;
            else if (e instanceof Service) totalEntities.service++;
            else if (e instanceof User) totalEntities.user++;
        }
        return {
            totalEntities,
            pricingStrategy: currentPricingStrategy,
            transactionLog: transactionLog.slice(-10),
            taxCollected: transactionLog.reduce((sum, t) => sum + t.tax, 0),
            activeObservers: Array.from(eventListeners.keys()),
            decoratorMap: Object.fromEntries(decoratorMap)
        };
    }

    // --- STEP 9: RETURN API ---
    masterInstance = {
        createEntity,
        getEntity,
        setPricingStrategy,
        applyDecorator,
        onEvent,
        processTransaction,
        getFullReport
    };

    return masterInstance;
}


// --- EXAMPLE USAGE ---
const master = buildOOPMasterSystem({ systemName: "OOPCore", version: "3.0.0", taxRate: 15, maxEntities: 100 });

master.createEntity("product", { id: "P001", name: "Laptop", price: 50000, stock: 10 });
master.createEntity("user", { id: "U001", name: "Rahim", email: "rahim@mail.com", role: "admin" });
master.setPricingStrategy("premium");
master.applyDecorator("P001", "TaxDecorator");
master.onEvent("transactionCompleted", (data) => data);
console.log(master.processTransaction("U001", "P001", 50000));
console.log(master.getFullReport());

// --- Invalid Input ---
console.log(buildOOPMasterSystem("invalid"));