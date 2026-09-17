// 🧩 PROBLEM–04: buildGameSystem()

// Logic: This function builds a game character system with polymorphic
// attack/defend behaviors (Character -> Warrior/Mage/Archer).
// It uses difficulty multiplier for damage scaling and includes
// special abilities (rage, castSpell, multiShot).

function buildGameSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.gameName !== 'string' ||
        typeof config.difficultyMultiplier !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.difficultyMultiplier <= 0) return "Invalid Input";

    // --- STEP 2: DEFINE CHARACTER BASE CLASS ---
    class Character {
        constructor(name, hp, level) {
            this.name = name;
            this.hp = hp;
            this.maxHp = hp;
            this.level = level;
        }

        attack(target) {
            return "Character attacks";
        }

        defend() {
            return { blocked: 0, remaining: this.hp };
        }

        isAlive() {
            return this.hp > 0;
        }

        takeDamage(amount) {
            this.hp = Math.max(0, this.hp - amount);
            return this.hp;
        }

        getStatus() {
            return { name: this.name, hp: this.hp, level: this.level, alive: this.isAlive() };
        }
    }

    // --- STEP 3: DEFINE WARRIOR CLASS ---
    class Warrior extends Character {
        constructor(name, hp, level, armor) {
            super(name, hp, level);
            this.armor = armor;
            this.rageActive = false;
        }

        attack(target) {
            let damage = this.level * 15 * config.difficultyMultiplier;
            if (this.rageActive) {
                damage *= 2;
                this.rageActive = false;
            }
            target.takeDamage(damage);
            return damage;
        }

        defend() {
            const blocked = this.armor * 5;
            return { blocked, remaining: this.hp };
        }

        rage() {
            this.rageActive = true;
            return "Rage activated!";
        }
    }

    // --- STEP 4: DEFINE MAGE CLASS ---
    class Mage extends Character {
        constructor(name, hp, level, mana) {
            super(name, hp, level);
            this.mana = mana;
            this.maxMana = mana;
        }

        attack(target) {
            if (this.mana < 10) return "Insufficient Mana";
            this.mana -= 10;
            const damage = this.level * 20 * config.difficultyMultiplier;
            target.takeDamage(damage);
            return damage;
        }

        castSpell(spellName, target) {
            if (this.mana < 30) return "Insufficient Mana";
            this.mana -= 30;
            const damage = this.level * 30 * config.difficultyMultiplier;
            target.takeDamage(damage);
            return damage;
        }

        getMana() {
            return this.mana;
        }
    }

    // --- STEP 5: DEFINE ARCHER CLASS ---
    class Archer extends Character {
        constructor(name, hp, level, arrows) {
            super(name, hp, level);
            this.arrows = arrows;
        }

        attack(target) {
            if (this.arrows <= 0) return "No Arrows";
            this.arrows--;
            const damage = this.level * 12 * config.difficultyMultiplier;
            target.takeDamage(damage);
            return damage;
        }

        multiShot(target) {
            if (this.arrows < 3) return "Not Enough Arrows";
            this.arrows -= 3;
            const damage = this.level * 12 * config.difficultyMultiplier * 3;
            target.takeDamage(damage);
            return damage;
        }

        getArrows() {
            return this.arrows;
        }
    }

    // --- STEP 6: INITIALIZE GAME STATE ---
    const characters = new Map(); // name -> Character

    // --- STEP 7: DEFINE GAME API ---
    function createCharacter(type, ...args) {
        if (typeof type !== 'string') return "Invalid Input";

        let character;
        switch (type) {
            case "warrior":
                if (args.length !== 4) return "Invalid Arguments";
                character = new Warrior(...args);
                break;
            case "mage":
                if (args.length !== 4) return "Invalid Arguments";
                character = new Mage(...args);
                break;
            case "archer":
                if (args.length !== 4) return "Invalid Arguments";
                character = new Archer(...args);
                break;
            default:
                return "Invalid Character Type";
        }

        characters.set(character.name, character);
        return character;
    }

    function getCharacter(name) {
        return characters.get(name) || null;
    }

    function simulateBattle(attackerName, defenderName) {
        const attacker = characters.get(attackerName);
        const defender = characters.get(defenderName);
        if (!attacker || !defender) return "Character Not Found";

        const damageDealt = attacker.attack(defender);
        const defenderStatus = defender.getStatus();

        return {
            attacker: attackerName,
            defender: defenderName,
            damageDealt,
            defenderStatus
        };
    }

    function getLeaderboard() {
        return Array.from(characters.values())
            .sort((a, b) => (b.level * b.hp) - (a.level * a.hp))
            .map(c => ({ name: c.name, level: c.level, hp: c.hp, score: c.level * c.hp }));
    }

    function getGameReport() {
        const byType = { warrior: 0, mage: 0, archer: 0 };
        let aliveCount = 0;

        for (const char of characters.values()) {
            byType[char.constructor.name.toLowerCase()]++;
            if (char.isAlive()) aliveCount++;
        }

        return {
            gameName: config.gameName,
            totalCharacters: characters.size,
            aliveCount,
            byType
        };
    }

    // --- STEP 8: RETURN API ---
    return {
        createCharacter,
        getCharacter,
        simulateBattle,
        getLeaderboard,
        getGameReport
    };
}

// --- EXAMPLE USAGE ---
const game = buildGameSystem({ gameName: "EpicQuest", difficultyMultiplier: 1 });

game.createCharacter("warrior", "Thor", 200, 5, 10);
game.createCharacter("mage", "Merlin", 120, 8, 100);
game.createCharacter("archer", "Legolas", 150, 6, 30);

console.log(game.getCharacter("Thor").attack(game.getCharacter("Merlin")));
console.log(game.getCharacter("Merlin").castSpell("Fireball", game.getCharacter("Thor")));
console.log(game.getCharacter("Thor").isAlive());
console.log(game.getGameReport());


// --- Invalid Input ---
console.log(buildGameSystem("invalid"));