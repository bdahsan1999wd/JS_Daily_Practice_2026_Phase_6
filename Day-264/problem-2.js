// 🧩 PROBLEM–02: buildFullBankingSystem()

// Logic: This function builds a full banking system with complete class hierarchy (Account -> SavingsAccount/CurrentAccount/FixedDepositAccount), using Factory Pattern, Observer Pattern, and Singleton Pattern.


function buildFullBankingSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.bankName !== 'string' ||
        typeof config.taxRate !== 'number' ||
        typeof config.interestRates !== 'object' ||
        typeof config.minBalances !== 'object'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE BASE ACCOUNT CLASS (abstract) ---
    class Account {
        constructor(owner, initialBalance, accountType, minBalance, interestRate) {
            if (this.constructor === Account) {
                throw new Error("Cannot instantiate abstract Account");
            }
            let _balance = initialBalance;
            const _transactionLog = [];

            Object.defineProperty(this, 'owner', { value: owner, enumerable: true });
            Object.defineProperty(this, 'accountType', { value: accountType, enumerable: true });
            this.minBalance = minBalance;
            this.interestRate = interestRate;

            Object.defineProperty(this, 'balance', {
                get: () => _balance,
                enumerable: true
            });

            // Observer pattern
            this._observers = [];
            this._notifyObservers = (event, data) => {
                for (const obs of this._observers) {
                    obs(event, data);
                }
            };
        }

        deposit(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            // Access private balance via getter/setter would need internal _balance
            // Using a workaround: deposit modifies the balance getter's backing store
            // Since balance is a getter, we need internal storage
            // We'll use a different approach: store _balance in a WeakMap
            return this._deposit(amount);
        }

        _deposit(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            // This is a simplified version - in real code, use private fields or WeakMap
            // For this exercise, we'll use a property
            if (!this._internalBalance) this._internalBalance = this.balance;
            this._internalBalance += amount;
            this._notifyObservers('deposit', { amount, balance: this._internalBalance });
            return this._internalBalance;
        }

        withdraw(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            return this._withdraw(amount);
        }

        _withdraw(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            if (!this._internalBalance) this._internalBalance = this.balance;
            if (this._internalBalance - amount < this.minBalance) return "Insufficient Funds";
            this._internalBalance -= amount;
            this._notifyObservers('withdraw', { amount, balance: this._internalBalance });
            return this._internalBalance;
        }

        getBalance() {
            if (!this._internalBalance) this._internalBalance = this.balance;
            return this._internalBalance;
        }

        getStatement() {
            return [];
        }

        applyInterest() {
            throw new Error("Must override applyInterest()");
        }

        subscribe(observer) {
            this._observers.push(observer);
        }
    }

    // --- STEP 3: DEFINE SAVINGS ACCOUNT ---
    class SavingsAccount extends Account {
        constructor(owner, initialBalance) {
            super(owner, initialBalance, "savings", config.minBalances.savings, config.interestRates.savings);
            this._internalBalance = initialBalance;
            this._goal = null;
        }

        _deposit(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            this._internalBalance += amount;
            this._notifyObservers('deposit', { amount, balance: this._internalBalance });
            return this._internalBalance;
        }

        _withdraw(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            if (this._internalBalance - amount < this.minBalance) return "Insufficient Funds";
            this._internalBalance -= amount;
            this._notifyObservers('withdraw', { amount, balance: this._internalBalance });
            return this._internalBalance;
        }

        getBalance() {
            return this._internalBalance;
        }

        applyInterest() {
            const interest = this.getBalance() * this.interestRate / 100;
            this._deposit(interest);
            return this.getBalance();
        }

        setGoal(targetAmount) {
            this._goal = targetAmount;
        }

        getGoalProgress() {
            if (!this._goal) return { target: 0, current: this.getBalance(), percent: 0, achieved: false };
            const percent = Math.round((this.getBalance() / this._goal) * 100);
            return {
                target: this._goal,
                current: this.getBalance(),
                percent,
                achieved: this.getBalance() >= this._goal
            };
        }
    }

    // --- STEP 4: DEFINE CURRENT ACCOUNT ---
    class CurrentAccount extends Account {
        constructor(owner, initialBalance) {
            super(owner, initialBalance, "current", config.minBalances.current, config.interestRates.current);
            this._internalBalance = initialBalance;
            this.overdraftLimit = 5000;
        }

        _deposit(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            this._internalBalance += amount;
            this._notifyObservers('deposit', { amount, balance: this._internalBalance });
            return this._internalBalance;
        }

        _withdraw(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            // Current account can go into overdraft up to overdraftLimit
            if (this._internalBalance - amount < this.minBalance - this.overdraftLimit) return "Insufficient Funds";
            this._internalBalance -= amount;
            this._notifyObservers('withdraw', { amount, balance: this._internalBalance });
            return this._internalBalance;
        }

        getBalance() {
            return this._internalBalance;
        }

        applyInterest() {
            const interest = this.getBalance() * this.interestRate / 100;
            this._deposit(interest);
            return this.getBalance();
        }

        getOverdraftStatus() {
            const inOverdraft = this.getBalance() < this.minBalance;
            return {
                inOverdraft,
                amount: inOverdraft ? this.minBalance - this.getBalance() : 0
            };
        }
    }

    // --- STEP 5: DEFINE FIXED DEPOSIT ACCOUNT ---
    class FixedDepositAccount extends Account {
        constructor(owner, initialBalance, durationMonths, lockedUntil) {
            super(owner, initialBalance, "fixed", config.minBalances.fixed, config.interestRates.fixed);
            this._internalBalance = initialBalance;
            this.durationMonths = durationMonths;
            // Parse lockedUntil as year-month-day with explicit future date
            const [year, month, day] = lockedUntil.split('-').map(Number);
            this.lockedUntil = new Date(year, month - 1, day).getTime();
        }

        _deposit(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            this._internalBalance += amount;
            this._notifyObservers('deposit', { amount, balance: this._internalBalance });
            return this._internalBalance;
        }

        _withdraw(amount) {
            if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
            if (Date.now() < this.lockedUntil) return "Account Locked";
            if (this._internalBalance - amount < this.minBalance) return "Insufficient Funds";
            this._internalBalance -= amount;
            this._notifyObservers('withdraw', { amount, balance: this._internalBalance });
            return this._internalBalance;
        }

        getBalance() {
            return this._internalBalance;
        }

        applyInterest() {
            const interest = this.getBalance() * this.interestRate / 100;
            this._deposit(interest);
            return this.getBalance();
        }

        getMaturityInfo() {
            const months = this.durationMonths;
            const rate = this.interestRate / 100;
            const maturityAmount = Math.round(this.getBalance() * Math.pow(1 + rate / 12, months));
            return {
                lockedUntil: new Date(this.lockedUntil).toISOString().split('T')[0],
                maturityAmount
            };
        }
    }

    // --- STEP 6: INITIALIZE BANK STATE (Singleton) ---
    let bankInstance = null;
    const accounts = new Map(); // owner -> account
    const alertSubscribers = new Map(); // observerName -> callback
    let taxCollected = 0;

    // --- STEP 7: DEFINE BANK API ---
    function openAccount(type, owner, initialBalance, ...extras) {
        if (typeof owner !== 'string' || typeof initialBalance !== 'number') {
            return "Invalid Input";
        }
        if (accounts.has(owner)) return "Account Exists";
        if (!config.minBalances[type] || initialBalance < config.minBalances[type]) {
            return "Initial Balance Too Low";
        }

        let account;
        switch (type) {
            case "savings":
                account = new SavingsAccount(owner, initialBalance);
                break;
            case "current":
                account = new CurrentAccount(owner, initialBalance);
                break;
            case "fixed":
                if (extras.length < 2) return "Invalid Arguments";
                account = new FixedDepositAccount(owner, initialBalance, extras[0], extras[1]);
                break;
            default:
                return "Invalid Account Type";
        }

        // Subscribe to account alerts
        account.subscribe((event, data) => {
            if (data.balance < account.minBalance) {
                for (const [name, fn] of alertSubscribers) {
                    fn({ event: 'accountAlert', owner: account.owner, type: account.accountType, balance: data.balance });
                }
            }
        });

        accounts.set(owner, account);
        return account;
    }

    function getAccount(owner) {
        return accounts.get(owner) || null;
    }

    function applyInterestAll() {
        for (const account of accounts.values()) {
            account.applyInterest();
        }
    }

    function subscribeAlert(observerName, fn) {
        if (typeof observerName !== 'string' || typeof fn !== 'function') {
            return "Invalid Input";
        }
        alertSubscribers.set(observerName, fn);
    }

    function getBankReport() {
        let totalBalance = 0;
        const byType = {};

        for (const account of accounts.values()) {
            totalBalance += account.getBalance();
            byType[account.accountType] = (byType[account.accountType] || 0) + 1;
        }

        return {
            totalAccounts: accounts.size,
            totalBalance,
            byType,
            taxCollected
        };
    }

    // --- STEP 8: RETURN API (Singleton) ---
    bankInstance = {
        openAccount,
        getAccount,
        applyInterestAll,
        subscribeAlert,
        getBankReport
    };

    return bankInstance;
}


// --- EXAMPLE USAGE ---
const bank = buildFullBankingSystem({ bankName: "MegaBank", taxRate: 10, interestRates: { savings: 8, current: 3, fixed: 12 }, minBalances: { savings: 500, current: 1000, fixed: 5000 } });

bank.openAccount("savings", "Rahim", 10000);
bank.openAccount("fixed", "Karim", 50000, 12, "2027-01-01");

console.log(bank.getAccount("Rahim").deposit(5000));
console.log(bank.getAccount("Karim").withdraw(1000));
console.log(bank.getAccount("Rahim").getBalance());
bank.applyInterestAll();
console.log(bank.getBankReport());

// --- Invlid Input ---
console.log(buildFullBankingSystem("invalid"));