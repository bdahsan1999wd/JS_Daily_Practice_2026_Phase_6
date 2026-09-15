// 🧩 PROBLEM–01: buildConstructorSystem()

// Logic: This function builds a constructor system with prototype based
// inheritance. It creates a constructor function with specified properties
// and allows adding methods to the prototype. Instances have their own
// property values while sharing prototype methods.


function buildConstructorSystem(blueprint) {

    // --- STEP 1: VALIDATE BLUEPRINT ---
    if (
        !blueprint ||
        typeof blueprint !== 'object' ||
        Array.isArray(blueprint) ||
        typeof blueprint.name !== 'string' ||
        !Array.isArray(blueprint.properties) ||
        typeof blueprint.methods !== 'object' ||
        blueprint.methods === null
    ) {
        return "Invalid Input";
    }

    for (const prop of blueprint.properties) {
        if (typeof prop !== 'string') {
            return "Invalid Input";
        }
    }

    // --- STEP 2: CREATE CONSTRUCTOR ---
    const Constructor = function (...values) {
        if (values.length !== blueprint.properties.length) {
            throw new Error("Invalid Input");
        }
        for (let i = 0; i < blueprint.properties.length; i++) {
            this[blueprint.properties[i]] = values[i];
        }
    };

    // --- STEP 3: INITIALIZE INSTANCE TRACKING ---
    const instances = [];

    // --- STEP 4: DEFINE CREATE ---
    function create(...values) {
        if (values.length !== blueprint.properties.length) {
            return "Invalid Input";
        }
        const instance = new Constructor(...values);
        instances.push(instance);
        return instance;
    }

    // --- STEP 5: DEFINE ADDMETHOD ---
    function addMethod(methodName, fn) {
        if (typeof methodName !== 'string' || typeof fn !== 'function') {
            return "Invalid Input";
        }
        Constructor.prototype[methodName] = fn;
    }

    // --- STEP 6: DEFINE GETINSTANCE ---
    function getInstance(index) {
        if (typeof index !== 'number' || index < 0 || index >= instances.length) {
            return "Invalid Input";
        }
        return instances[index];
    }

    // --- STEP 7: DEFINE GETPROTOTYPEMETHODS ---
    function getPrototypeMethods() {
        return Object.keys(Constructor.prototype).filter(
            key => typeof Constructor.prototype[key] === 'function'
        );
    }

    // --- STEP 8: DEFINE GETINSTANCECOUNT ---
    function getInstanceCount() {
        return instances.length;
    }

    // --- STEP 9: RETURN API ---
    return {
        create,
        addMethod,
        getInstance,
        getPrototypeMethods,
        getInstanceCount
    };
}


// --- EXAMPLE USAGE ---
const system = buildConstructorSystem({
    name: "Person",
    properties: ["name", "age"],
    methods: { greet: "returns greeting", getAge: "returns age" }
});

system.addMethod("greet", function () { return "Hi, I am " + this.name; });
system.addMethod("getAge", function () { return this.age; });
const p1 = system.create("Rahim", 25);
const p2 = system.create("Karim", 30);

console.log(p1.greet());
console.log(p2.getAge());
console.log(system.getPrototypeMethods());
console.log(system.getInstanceCount());


// --- Invalid Input ---
console.log(buildConstructorSystem("invalid"));