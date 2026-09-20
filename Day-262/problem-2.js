// 🧩 PROBLEM–02: buildComponentSystem()

// Logic: This function builds a component-based system where entities
// are composed from behavior units (withHealth, withInventory,
// withPosition, withStats) instead of using inheritance.

function buildComponentSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.appName !== 'string' ||
        typeof config.maxComponents !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.maxComponents <= 0) return "Invalid Input";

    // --- STEP 2: DEFINE BEHAVIOR UNITS (pure functions) ---
    function withHealth(hp) {
        return {
            hp,
            maxHp: hp,
            takeDamage(n) {
                this.hp = Math.max(0, this.hp - n);
                return this.hp;
            },
            heal(n) {
                this.hp = Math.min(this.maxHp, this.hp + n);
                return this.hp;
            },
            isAlive() {
                return this.hp > 0;
            }
        };
    }

    function withInventory(capacity) {
        return {
            items: [],
            capacity,
            addItem(item) {
                if (this.items.length >= this.capacity) return "Inventory Full";
                this.items.push(item);
                return this.items;
            },
            removeItem(item) {
                const idx = this.items.indexOf(item);
                if (idx !== -1) this.items.splice(idx, 1);
                return this.items;
            },
            getItems() {
                return [...this.items];
            },
            isFull() {
                return this.items.length >= this.capacity;
            }
        };
    }

    function withPosition(x, y) {
        return {
            x,
            y,
            moveTo(x, y) {
                this.x = x;
                this.y = y;
                return { x: this.x, y: this.y };
            },
            distanceTo(other) {
                const dx = this.x - other.x;
                const dy = this.y - other.y;
                return Math.round(Math.sqrt(dx * dx + dy * dy) * 100) / 100;
            }
        };
    }

    function withStats(strength, speed) {
        return {
            strength,
            speed,
            getStats() {
                return { strength: this.strength, speed: this.speed };
            },
            buffStats(multiplier) {
                this.strength *= multiplier;
                this.speed *= multiplier;
                return this.getStats();
            }
        };
    }

    // --- STEP 3: INITIALIZE SYSTEM STATE ---
    const entities = new Map(); // name -> entity object
    const behaviorUsage = {}; // behaviorName -> count

    // --- STEP 4: DEFINE CREATEENTITY ---
    function createEntity(name, ...behaviorResults) {
        if (typeof name !== 'string') return "Invalid Input";
        if (entities.has(name)) return "Entity Exists";

        const entity = { _behaviors: [] };

        const behaviorNames = ["withHealth", "withInventory", "withPosition", "withStats"];

        for (let i = 0; i < behaviorResults.length; i++) {
            const behaviorObj = behaviorResults[i];
            const behaviorName = behaviorNames[i];

            if (!behaviorName) return "Invalid Behavior";

            entity._behaviors.push(behaviorName);
            behaviorUsage[behaviorName] = (behaviorUsage[behaviorName] || 0) + 1;

            // Merge behavior properties/methods into entity
            for (const [key, value] of Object.entries(behaviorObj)) {
                if (typeof value === 'function') {
                    entity[key] = value.bind(entity);
                } else {
                    entity[key] = value;
                }
            }
        }

        entities.set(name, entity);
        return entity;
    }

    // --- STEP 5: DEFINE GETENTITY ---
    function getEntity(name) {
        return entities.get(name) || null;
    }

    // --- STEP 6: DEFINE ADDBEHAVIOR ---
    function addBehavior(entityName, behaviorFn) {
        const entity = entities.get(entityName);
        if (!entity) return "Entity Not Found";

        // Identify behavior by function identity
        let behaviorName = null;
        if (behaviorFn === withHealth) behaviorName = "withHealth";
        else if (behaviorFn === withInventory) behaviorName = "withInventory";
        else if (behaviorFn === withPosition) behaviorName = "withPosition";
        else if (behaviorFn === withStats) behaviorName = "withStats";
        else return "Invalid Behavior";

        const behaviorObj = behaviorFn();
        entity._behaviors.push(behaviorName);
        behaviorUsage[behaviorName] = (behaviorUsage[behaviorName] || 0) + 1;

        for (const [key, value] of Object.entries(behaviorObj)) {
            if (typeof value === 'function') {
                entity[key] = value.bind(entity);
            } else {
                entity[key] = value;
            }
        }
        return true;
    }

    // --- STEP 7: DEFINE HASBEHAVIOR ---
    function hasBehavior(entityName, behaviorName) {
        const entity = entities.get(entityName);
        if (!entity) return false;
        return entity._behaviors.includes(behaviorName);
    }

    // --- STEP 8: DEFINE GETENTITYREPORT ---
    function getEntityReport(name) {
        const entity = entities.get(name);
        if (!entity) return "Entity Not Found";

        let propertyCount = 0;
        for (const key of Object.keys(entity)) {
            if (key !== '_behaviors') propertyCount++;
        }
        return {
            name,
            behaviors: [...entity._behaviors],
            propertyCount
        };
    }

    // --- STEP 9: DEFINE GETAPPREPORT ---
    function getAppReport() {
        return {
            appName: config.appName,
            totalEntities: entities.size,
            behaviorUsage
        };
    }

    // --- STEP 10: RETURN API WITH BEHAVIOR FUNCTIONS ---
    return {
        createEntity,
        getEntity,
        addBehavior,
        hasBehavior,
        getEntityReport,
        getAppReport,
        // Expose behavior functions for direct use
        withHealth,
        withInventory,
        withPosition,
        withStats
    };
}


// --- EXAMPLE USAGE ---
const app = buildComponentSystem({ appName: "GameEngine", maxComponents: 50 });
app.createEntity("Hero",
    app.withHealth(100),
    app.withInventory(10),
    app.withPosition(0, 0),
    app.withStats(80, 70)
);

app.createEntity("Chest", app.withPosition(5, 5), app.withInventory(20));
const hero = app.getEntity("Hero");
console.log(hero.takeDamage(30));
console.log(hero.addItem("Sword"));

hero.moveTo(3, 4);
console.log(hero.distanceTo(app.getEntity("Chest")));
console.log(app.hasBehavior("Hero", "withHealth"));
console.log(app.hasBehavior("Chest", "withHealth"));
console.log(app.getEntityReport("Hero"));


// --- Invalid Input ---
console.log(buildComponentSystem("invalid"));