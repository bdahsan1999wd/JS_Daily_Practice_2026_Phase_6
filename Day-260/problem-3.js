// 🧩 PROBLEM–03: buildAccessControlSystem()

// Logic: This function builds an access control system with role-based
// permissions, login attempt limiting, account locking, and level-based
// access checking using getters/setters and encapsulation.


function buildAccessControlSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        !Array.isArray(config.accessLevels) ||
        config.accessLevels.length === 0
    ) {
        return "Invalid Input";
    }
    for (const level of config.accessLevels) {
        if (typeof level !== 'string') return "Invalid Input";
    }

    // --- STEP 2: DEFINE USER CLASS ---
    class User {
        constructor(username, password, accessLevel) {
            // Private state
            let _password = password;
            let _accessLevel = accessLevel;
            let _loginAttempts = 0;
            let _locked = false;

            // --- GETTERS ---
            Object.defineProperty(this, 'username', { value: username, enumerable: true });
            Object.defineProperty(this, 'accessLevel', {
                get: () => _accessLevel,
                set: (level) => {
                    if (config.accessLevels.includes(level)) {
                        _accessLevel = level;
                    } else {
                        throw new Error("Invalid Access Level");
                    }
                },
                enumerable: true
            });
            Object.defineProperty(this, 'isLocked', { get: () => _locked, enumerable: true });

            // --- METHODS ---
            this.login = (password) => {
                if (_locked) return "Account Locked";
                if (password === _password) {
                    _loginAttempts = 0;
                    return { success: true };
                } else {
                    _loginAttempts++;
                    if (_loginAttempts >= 3) {
                        _locked = true;
                        return "Account Locked";
                    }
                    return { success: false, attemptsLeft: 3 - _loginAttempts };
                }
            };

            this.logout = () => "Logged Out";

            this.canAccess = (requiredLevel) => {
                const userLevelIdx = config.accessLevels.indexOf(_accessLevel);
                const requiredLevelIdx = config.accessLevels.indexOf(requiredLevel);
                return userLevelIdx >= requiredLevelIdx && requiredLevelIdx !== -1;
            };

            this.unlock = () => {
                _locked = false;
                _loginAttempts = 0;
            };
        }
    }

    // --- STEP 3: INITIALIZE SYSTEM STATE ---
    const users = new Map(); // username -> User

    // --- STEP 4: DEFINE ACCESS API ---
    function createUser(username, password, accessLevel) {
        if (typeof username !== 'string' || typeof password !== 'string' || typeof accessLevel !== 'string') {
            return "Invalid Input";
        }
        if (!config.accessLevels.includes(accessLevel)) return "Invalid Access Level";
        if (users.has(username)) return "User Exists";

        const user = new User(username, password, accessLevel);
        users.set(username, user);
        return user;
    }

    function getUser(username) {
        return users.get(username) || null;
    }

    function checkPermission(username, requiredLevel) {
        const user = users.get(username);
        if (!user) return { allowed: false, userLevel: null, requiredLevel };
        return {
            allowed: user.canAccess(requiredLevel),
            userLevel: user.accessLevel,
            requiredLevel
        };
    }

    function getLockedAccounts() {
        const locked = [];
        for (const user of users.values()) {
            if (user.isLocked) locked.push(user.username);
        }
        return locked;
    }

    function getSystemReport() {
        const levelDistribution = {};
        let lockedCount = 0;
        for (const user of users.values()) {
            levelDistribution[user.accessLevel] = (levelDistribution[user.accessLevel] || 0) + 1;
            if (user.isLocked) lockedCount++;
        }
        return {
            totalUsers: users.size,
            lockedCount,
            levelDistribution
        };
    }

    // --- STEP 5: RETURN API ---
    return {
        createUser,
        getUser,
        checkPermission,
        getLockedAccounts,
        getSystemReport
    };
}


// --- EXAMPLE USAGE ---
const acs = buildAccessControlSystem({ systemName: "OfficeACS", accessLevels: ["guest", "user", "admin", "superadmin"] });

acs.createUser("rahim", "pass123", "user");
acs.createUser("karim", "secret", "admin");
const u = acs.getUser("rahim");

console.log(u.login("wrongpass"));
console.log(u.login("wrongpass"));
console.log(u.login("wrongpass"));
console.log(u.isLocked);
console.log(acs.checkPermission("karim", "user"));
console.log(acs.checkPermission("karim", "superadmin"));
console.log(acs.getLockedAccounts());
console.log(acs.getSystemReport());

// --- Invalid Input ---
console.log(buildAccessControlSystem("invalid")); // "Invalid Input"