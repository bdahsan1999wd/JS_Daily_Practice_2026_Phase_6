// 🧩 PROBLEM–03: buildOOPGameEngine()

// Logic: This function builds a full OOP game engine with Entity/Character/Enemy hierarchy, Strategy Pattern for attacks, Observer Pattern for events, and Composition for behaviors.


function buildOOPGameEngine(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.gameName !== 'string' ||
        typeof config.maxPlayers !== 'number' ||
        typeof config.difficultyMultiplier !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE BASE ENTITY CLASS (abstract) ---
    class Entity {
        constructor(hp, level) {
            if (this.constructor === Entity) {
                throw new Error("Cannot instantiate abstract Entity");
            }
            this.hp = hp;
            this.maxHp = hp;
            this.level = level;
        }

        takeDamage(n) {
            this.hp = Math.max(0, this.hp - n);
            return this.hp;
        }

        heal(n) {
            this.hp = Math.min(this.maxHp, this.hp + n);
            return this.hp;
        }

        isAlive() {
            return this.hp > 0;
        }

        getStatus() {
            return { hp: this.hp, level: this.level, alive: this.isAlive() };
        }

        act() {
            throw new Error("Must override act()");
        }
    }

    // --- STEP 3: DEFINE CHARACTER CLASS (extends Entity) ---
    class Character extends Entity {
        constructor(name, hp, level) {
            super(hp, level);
            this.name = name;
            this.inventory = [];
        }

        addItem(item) {
            this.inventory.push(item);
            return this.inventory;
        }

        removeItem(item) {
            const idx = this.inventory.indexOf(item);
            if (idx !== -1) this.inventory.splice(idx, 1);
            return this.inventory;
        }

        getInventory() {
            return [...this.inventory];
        }

        attack(target) {
            throw new Error("Must override attack()");
        }

        act(target) {
            return this.attack(target);
        }
    }

    // --- STEP 4: DEFINE CHARACTER SUBCLASSES ---
    class Warrior extends Character {
        constructor(name, hp, level) {
            super(name, hp, level);
            this.armor = 10;
        }

        attack(target) {
            const damage = this.level * 15 * config.difficultyMultiplier;
            target.takeDamage(damage);
            return damage;
        }
    }

    class Mage extends Character {
        constructor(name, hp, level) {
            super(name, hp, level);
            this.mana = 100;
        }

        attack(target) {
            if (this.mana < 10) return "Insufficient Mana";
            this.mana -= 10;
            const damage = this.level * 20 * config.difficultyMultiplier;
            target.takeDamage(damage);
            return damage;
        }
    }

    class Archer extends Character {
        constructor(name, hp, level) {
            super(name, hp, level);
            this.arrows = 30;
        }

        attack(target) {
            if (this.arrows <= 0) return "No Arrows";
            this.arrows--;
            const damage = this.level * 12 * config.difficultyMultiplier;
            target.takeDamage(damage);
            return damage;
        }
    }

    // --- STEP 5: DEFINE ENEMY CLASS (extends Entity) ---
    class Enemy extends Entity {
        constructor(type, level) {
            const enemyConfig = {
                goblin: { hp: 80, reward: { xp: 30, gold: 15 } },
                orc: { hp: 120, reward: { xp: 50, gold: 30 } },
                dragon: { hp: 300, reward: { xp: 200, gold: 100 } }
            };
            const cfg = enemyConfig[type] || { hp: 50, reward: { xp: 10, gold: 5 } };
            super(cfg.hp, level);
            this.type = type;
            this.reward = cfg.reward;
        }

        act(target) {
            const damage = this.level * 10 * config.difficultyMultiplier;
            target.takeDamage(damage);
            return damage;
        }

        getReward() {
            return this.reward;
        }
    }

    // --- STEP 6: INITIALIZE GAME STATE ---
    const characters = new Map(); // name -> Character
    const enemies = new Map(); // type -> Enemy
    const eventListeners = new Map(); // eventName -> Set of callbacks
    let eventsEmitted = 0;

    // --- STEP 7: DEFINE GAME API ---
    function createCharacter(type, name, level) {
        if (characters.size >= config.maxPlayers) return "Max Players Reached";

        let character;
        switch (type) {
            case "warrior": character = new Warrior(name, 200, level); break;
            case "mage": character = new Mage(name, 120, level); break;
            case "archer": character = new Archer(name, 150, level); break;
            default: return "Invalid Character Type";
        }
        characters.set(name, character);
        return character;
    }

    function createEnemy(type, level) {
        const enemy = new Enemy(type, level);
        enemies.set(type, enemy);
        return enemy;
    }

    function battle(characterName, enemyType) {
        const character = characters.get(characterName);
        const enemy = enemies.get(enemyType) || new Enemy(enemyType, 3);

        if (!character) return "Character Not Found";

        // Character attacks
        const damageDealt = character.attack(enemy);
        let result = "continue";

        if (!enemy.isAlive()) {
            result = "enemyDefeated";
            const reward = enemy.getReward();
            // Emit event
            if (eventListeners.has("enemyDefeated")) {
                for (const fn of eventListeners.get("enemyDefeated")) {
                    fn({ characterName, enemyType, reward });
                }
                eventsEmitted++;
            }
            return {
                attacker: characterName,
                defender: enemyType,
                damageDealt,
                result,
                reward
            };
        }

        // Enemy counter-attacks
        enemy.act(character);

        if (!character.isAlive()) {
            result = "playerDefeated";
            // Emit event
            if (eventListeners.has("playerDefeated")) {
                for (const fn of eventListeners.get("playerDefeated")) {
                    fn({ characterName, enemyType });
                }
                eventsEmitted++;
            }
            return {
                attacker: characterName,
                defender: enemyType,
                damageDealt,
                result,
                reward: null
            };
        }

        // Emit event for battle round
        if (eventListeners.has("battleRound")) {
            for (const fn of eventListeners.get("battleRound")) {
                fn({ characterName, enemyType, damageDealt });
            }
            eventsEmitted++;
        }

        return {
            attacker: characterName,
            defender: enemyType,
            damageDealt,
            result,
            reward: null
        };
    }

    function onEvent(eventName, fn) {
        if (!eventListeners.has(eventName)) {
            eventListeners.set(eventName, new Set());
        }
        eventListeners.get(eventName).add(fn);
    }

    function getLeaderboard() {
        return Array.from(characters.values())
            .sort((a, b) => (b.level * b.maxHp) - (a.level * a.maxHp))
            .map(c => ({ name: c.name, level: c.level, hp: c.hp, maxHp: c.maxHp }));
    }

    function getGameReport() {
        return {
            gameName: config.gameName,
            totalCharacters: characters.size,
            totalEnemies: enemies.size,
            eventsEmitted
        };
    }

    // --- STEP 8: RETURN API ---
    return {
        createCharacter,
        createEnemy,
        battle,
        onEvent,
        getLeaderboard,
        getGameReport
    };
}


// --- EXAMPLE USAGE ---
const game = buildOOPGameEngine({ gameName: "OOPQuest", maxPlayers: 4, difficultyMultiplier: 1.2 });

game.createCharacter("warrior", "Thor", 5);
game.createEnemy("goblin", 3);
game.onEvent("enemyDefeated", (data) => data);

console.log(game.battle("Thor", "goblin"));
console.log(game.getGameReport());


// --- Invalid Input ---
console.log(buildOOPGameEngine("invalid"));