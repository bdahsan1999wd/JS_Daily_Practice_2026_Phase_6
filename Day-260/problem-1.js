// 🧩 PROBLEM–01: buildSecureBankSystem()

// Logic: This function builds a secure banking system using ES6 classes
// with simulated private fields (via closure) and getters/setters.
// It implements encapsulation for sensitive data like balance, PIN,
// and transaction logs.

function buildSecureBankSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.bankName !== 'string' ||
        typeof config.minBalance !== 'number' ||
        typeof config.maxDailyWithdraw !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.minBalance < 0 || config.maxDailyWithdraw <= 0) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE SECUREACCOUNT CLASS ---
    // Use closure-based private fields since JS private fields (#) are not widely supported
    class SecureAccount {
        constructor(owner, initialBalance, pin) {
            // Private state via closure
            let _balance = initialBalance;
            let _pin = pin;
            let _dailyWithdrawn = 0;
            const _transactionLog = [];

            // --- GETTERS ---
            Object.defineProperty(this, 'owner', { get: () => owner, enumerable: true });
            Object.defineProperty(this, 'balance', { get: () => _balance, enumerable: true });
            Object.defineProperty(this, 'transactionCount', { get: () => _transactionLog.length, enumerable: true });

            // --- SETTER FOR PIN ---
            Object.defineProperty(this, 'pin', {
                set: (newPin) => {
                    if (typeof newPin === 'number' && newPin >= 1000 && newPin <= 9999) {
                        _pin = newPin;
                    } else {
                        throw new Error("Invalid PIN");
                    }
                },
                enumerable: true,
                configurable: false
            });

            // --- METHODS ---
            this.deposit = (amount) => {
                if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
                _balance += amount;
                _transactionLog.push({ type: 'deposit', amount, balance: _balance, timestamp: Date.now() });
                return _balance;
            };

            this.withdraw = (pin, amount) => {
                if (pin !== _pin) return "Access Denied";
                if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
                if (_balance - amount < config.minBalance) return "Insufficient Funds";
                if (_dailyWithdrawn + amount > config.maxDailyWithdraw) return "Daily Limit Exceeded";
                _balance -= amount;
                _dailyWithdrawn += amount;
                _transactionLog.push({ type: 'withdraw', amount, balance: _balance, timestamp: Date.now() });
                return _balance;
            };

            this.getStatement = () => {
                return _transactionLog.slice(-5).map(t => ({
                    type: t.type,
                    amount: t.amount,
                    balance: t.balance
                }));
            };

            this.resetDailyLimit = () => {
                _dailyWithdrawn = 0;
            };

            // Internal access for bank
            this._getBalance = () => _balance;
        }
    }

    // --- STEP 3: INITIALIZE BANK STATE ---
    const accounts = new Map(); // owner -> SecureAccount
    const { bankName, minBalance, maxDailyWithdraw } = config;

    // --- STEP 4: DEFINE BANK API ---
    function openAccount(owner, initialBalance, pin) {
        if (typeof owner !== 'string' || typeof initialBalance !== 'number' || typeof pin !== 'number') {
            return "Invalid Input";
        }
        if (initialBalance < minBalance) return "Initial Balance Too Low";
        if (pin < 1000 || pin > 9999) return "Invalid PIN";
        if (accounts.has(owner)) return "Account Exists";

        const account = new SecureAccount(owner, initialBalance, pin);
        accounts.set(owner, account);
        return account;
    }

    function getAccount(owner) {
        return accounts.get(owner) || null;
    }

    function resetAllDailyLimits() {
        for (const account of accounts.values()) {
            account.resetDailyLimit();
        }
    }

    function getBankSummary() {
        let totalBalance = 0;
        for (const account of accounts.values()) {
            totalBalance += account._getBalance();
        }
        return {
            bankName,
            totalAccounts: accounts.size,
            totalBalance
        };
    }

    // --- STEP 5: RETURN BANK API ---
    return {
        openAccount,
        getAccount,
        resetAllDailyLimits,
        getBankSummary
    };
}


// --- EXAMPLE USAGE ---
const bank = buildSecureBankSystem({ bankName: "SecureBank", minBalance: 500, maxDailyWithdraw: 10000 });

bank.openAccount("Rahim", 5000, 1234);
const acc = bank.getAccount("Rahim");

console.log(acc.deposit(2000));
console.log(acc.withdraw(1234, 3000));
console.log(acc.withdraw(9999, 1000));
console.log(acc.balance);
console.log(acc.transactionCount);
acc.pin = 5678;
console.log(acc.withdraw(5678, 500));
console.log(bank.getBankSummary());


// --- Invalid Input ---
console.log(buildSecureBankSystem("invalid"));