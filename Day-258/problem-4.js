// 🧩 PROBLEM–04: createPrototypeBankSystem()

// Logic: This function creates a prototype based bank system with
// Account as base, SavingsAccount and CurrentAccount as subclasses.
// All methods are on prototypes for memory efficiency. The bank API
// manages account creation and reporting.


function createPrototypeBankSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.bankName !== 'string' ||
        typeof config.defaultInterestRate !== 'number' ||
        typeof config.minBalance !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE BASE ACCOUNT CONSTRUCTOR ---
    function Account(ownerName, initialBalance, interestRate, accountType) {
        this.ownerName = ownerName;
        this.balance = initialBalance;
        this.interestRate = interestRate;
        this.accountType = accountType;
        this.initialDeposit = initialBalance; // Track initial deposit for reporting
    }

    // Account prototype methods
    Account.prototype.deposit = function (amount) {
        if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
        this.balance += amount;
        return this.balance;
    };

    Account.prototype.withdraw = function (amount) {
        if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
        if (this.balance - amount < this.minBalance) return "Insufficient Funds";
        this.balance -= amount;
        return this.balance;
    };

    Account.prototype.getBalance = function () {
        return this.balance;
    };

    Account.prototype.applyInterest = function () {
        const interest = this.balance * this.interestRate / 100;
        this.balance += interest;
        return this.balance;
    };

    // --- STEP 3: DEFINE SAVINGS ACCOUNT ---
    function SavingsAccount(ownerName, initialBalance) {
        Account.call(this, ownerName, initialBalance, config.defaultInterestRate * 2, "savings");
    }
    SavingsAccount.prototype = Object.create(Account.prototype);
    SavingsAccount.prototype.constructor = SavingsAccount;

    // --- STEP 4: DEFINE CURRENT ACCOUNT ---
    function CurrentAccount(ownerName, initialBalance) {
        const overdraftLimit = config.minBalance * 0.2; // 20% of minBalance
        Account.call(this, ownerName, initialBalance, config.defaultInterestRate, "current");
        this.overdraftLimit = overdraftLimit;
        this.minBalance = config.minBalance - overdraftLimit; // Override minBalance for current
    }
    CurrentAccount.prototype = Object.create(Account.prototype);
    CurrentAccount.prototype.constructor = CurrentAccount;

    // Override withdraw to allow going below minBalance by 20%
    CurrentAccount.prototype.withdraw = function (amount) {
        if (typeof amount !== 'number' || amount <= 0) return "Invalid Amount";
        if (this.balance - amount < this.minBalance) return "Insufficient Funds";
        this.balance -= amount;
        return this.balance;
    };

    // --- STEP 5: INITIALIZE BANK STATE ---
    const accounts = new Map(); // ownerName -> account instance
    const minBalance = config.minBalance;

    // Attach minBalance to Account prototype for savings accounts
    Account.prototype.minBalance = minBalance;

    // --- STEP 6: DEFINE OPENACCOUNT ---
    function openAccount(type, ownerName, initialBalance) {
        if (typeof ownerName !== 'string' || typeof initialBalance !== 'number') {
            return "Invalid Input";
        }
        if (initialBalance < minBalance) {
            return "Initial Balance Too Low";
        }
        if (accounts.has(ownerName)) {
            return "Account Already Exists";
        }

        let account;
        if (type === "savings") {
            account = new SavingsAccount(ownerName, initialBalance);
        } else if (type === "current") {
            account = new CurrentAccount(ownerName, initialBalance);
        } else {
            return "Invalid Account Type";
        }

        accounts.set(ownerName, account);
        return account;
    }

    // --- STEP 7: DEFINE GETACCOUNT ---
    function getAccount(ownerName) {
        return accounts.get(ownerName) || null;
    }

    // --- STEP 8: DEFINE APPLYINTERESTALL ---
    function applyInterestAll() {
        for (const account of accounts.values()) {
            account.applyInterest();
        }
    }

    // --- STEP 9: DEFINE GETBANKREPORT ---
    function getBankReport() {
        const accountList = [];
        let totalDeposits = 0;

        for (const [owner, account] of accounts) {
            accountList.push({
                owner,
                type: account.accountType,
                balance: account.balance
            });
            totalDeposits += account.initialDeposit; // Track initial deposits
        }

        return {
            totalAccounts: accounts.size,
            totalDeposits,
            accountList
        };
    }

    // --- STEP 10: RETURN API ---
    return {
        openAccount,
        getAccount,
        applyInterestAll,
        getBankReport
    };
}


// --- EXAMPLE USAGE ---
const bank = createPrototypeBankSystem({ bankName: "ProtoBank", defaultInterestRate: 10, minBalance: 500 });

bank.openAccount("savings", "Rahim", 1000);
bank.openAccount("current", "Karim", 2000);

console.log(bank.getAccount("Rahim").deposit(500));
console.log(bank.getAccount("Rahim").applyInterest());
console.log(bank.getAccount("Karim").withdraw(1700));
console.log(bank.getBankReport());


// --- Invalid Input ---
console.log(createPrototypeBankSystem("invalid"));