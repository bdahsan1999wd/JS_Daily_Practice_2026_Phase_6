// 🧩 PROBLEM–01: buildAnimalKingdom()

// Logic: This function builds an animal kingdom simulation using multi-level
// inheritance (Animal -> Mammal -> Dog, Animal -> Bird, Animal -> Fish).
// It demonstrates polymorphism through method overriding (speak, move, getInfo).


function buildAnimalKingdom(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.kingdomName !== 'string' ||
        typeof config.soundMap !== 'object' ||
        config.soundMap === null
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE ANIMAL CLASS (base) ---
    class Animal {
        constructor(name, age, weight) {
            this.name = name;
            this.age = age;
            this.weight = weight;
        }

        speak() {
            return "...";
        }

        move() {
            return "Animal moves";
        }

        getInfo() {
            return `Name: ${this.name}, Age: ${this.age}, Weight: ${this.weight}`;
        }

        toString() {
            return `[Animal: ${this.name}]`;
        }
    }

    // --- STEP 3: DEFINE MAMMAL CLASS (extends Animal) ---
    class Mammal extends Animal {
        constructor(name, age, weight, furColor) {
            super(name, age, weight);
            this.furColor = furColor;
        }

        speak() {
            return "Mammal sound";
        }

        nurse() {
            return `${this.name} is nursing young`;
        }

        getInfo() {
            return `${super.getInfo()}, Fur: ${this.furColor}`;
        }
    }

    // --- STEP 4: DEFINE DOG CLASS (extends Mammal) ---
    class Dog extends Mammal {
        constructor(name, age, weight, furColor, breed) {
            super(name, age, weight, furColor);
            this.breed = breed;
        }

        speak() {
            return `Woof! I am ${this.name}`;
        }

        fetch() {
            return `${this.name} fetches the ball`;
        }

        getInfo() {
            return `${super.getInfo()}, Breed: ${this.breed}`;
        }
    }

    // --- STEP 5: DEFINE BIRD CLASS (extends Animal) ---
    class Bird extends Animal {
        constructor(name, age, weight, wingSpan) {
            super(name, age, weight);
            this.wingSpan = wingSpan;
        }

        speak() {
            return `Tweet! I am ${this.name}`;
        }

        move() {
            return `${this.name} flies through the air`;
        }

        getInfo() {
            return `${super.getInfo()}, Wing Span: ${this.wingSpan}`;
        }
    }

    // --- STEP 6: DEFINE FISH CLASS (extends Animal) ---
    class Fish extends Animal {
        constructor(name, age, weight, waterType) {
            super(name, age, weight);
            this.waterType = waterType;
        }

        speak() {
            return "...";
        }

        move() {
            return `${this.name} swims through the water`;
        }

        getInfo() {
            return `${super.getInfo()}, Water: ${this.waterType}`;
        }
    }

    // --- STEP 7: INITIALIZE KINGDOM STATE ---
    const animals = new Map(); // name -> Animal instance
    const typeCount = { dog: 0, bird: 0, fish: 0, mammal: 0 };

    // --- STEP 8: DEFINE KINGDOM API ---
    function addAnimal(type, ...args) {
        if (typeof type !== 'string') return "Invalid Input";

        let animal;
        switch (type) {
            case "dog":
                if (args.length !== 5) return "Invalid Arguments";
                animal = new Dog(...args);
                typeCount.dog++;
                break;
            case "bird":
                if (args.length !== 4) return "Invalid Arguments";
                animal = new Bird(...args);
                typeCount.bird++;
                break;
            case "fish":
                if (args.length !== 4) return "Invalid Arguments";
                animal = new Fish(...args);
                typeCount.fish++;
                break;
            case "mammal":
                if (args.length !== 4) return "Invalid Arguments";
                animal = new Mammal(...args);
                typeCount.mammal++;
                break;
            default:
                return "Invalid Animal Type";
        }

        animals.set(animal.name, animal);
        return animal;
    }

    function getAnimal(name) {
        return animals.get(name) || null;
    }

    function makeAllSpeak() {
        const results = [];
        for (const animal of animals.values()) {
            results.push(animal.speak());
        }
        return results;
    }

    function makeAllMove() {
        const results = [];
        for (const animal of animals.values()) {
            results.push(animal.move());
        }
        return results;
    }

    function getReport() {
        const totalAnimals = animals.size;
        const byType = { ...typeCount };
        const totalWeight = Array.from(animals.values()).reduce((sum, a) => sum + a.weight, 0);
        const averageWeight = totalAnimals > 0 ? Math.round((totalWeight / totalAnimals) * 10) / 10 : 0;
        return { totalAnimals, byType, averageWeight };
    }

    // --- STEP 9: RETURN API ---
    return {
        addAnimal,
        getAnimal,
        makeAllSpeak,
        makeAllMove,
        getReport
    };
}

// --- EXAMPLE USAGE ---
const kingdom = buildAnimalKingdom({ kingdomName: "Wildlife", soundMap: {} });

kingdom.addAnimal("dog", "Rex", 3, 25, "brown", "Labrador");
kingdom.addAnimal("bird", "Tweety", 1, 0.5, 30);
kingdom.addAnimal("fish", "Nemo", 2, 0.3, "saltwater");

console.log(kingdom.getAnimal("Rex").speak());
console.log(kingdom.getAnimal("Tweety").move());
console.log(kingdom.makeAllSpeak());
console.log(kingdom.getReport());


// --- Invalid Input ---
console.log(buildAnimalKingdom("invalid"));