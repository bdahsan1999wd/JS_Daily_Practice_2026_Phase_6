// 🧩 PROBLEM–01: createBankAccount()

// Logic: This function creates a closure based bank account with private state.
// The account balance and PIN are encapsulated within the closure, preventing
// external access. All operations validate the PIN and amounts before proceeding.


function createBankAccount(config) {

    // --- STEP 1: VALIDATE CONFIG OBJECT ---
    // Check if config exists, is a plain object, and has all required properties
    // with valid types and values.
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.owner !== 'string' ||
        typeof config.initialBalance !== 'number' ||
        typeof config.pin !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: VALIDATE LOGICAL CONSTRAINTS ---
    // initialBalance must be >= 0
    // PIN must be a 4-digit number (1000-9999)
    if (config.initialBalance < 0 || config.pin < 1000 || config.pin > 9999) {
        return "Invalid Input";
    }

    // --- STEP 3: INITIALIZE PRIVATE STATE ---
    // Use local variables to hold private state.
    // These are only accessible within this function's scope
    // and the returned methods (closure).
    let balance = config.initialBalance;
    const owner = config.owner;
    const correctPin = config.pin;

    // --- STEP 4: DEFINE DEPOSIT METHOD ---
    // Adds amount to balance if amount is positive.
    // Returns new balance or "Invalid Amount" for invalid input.
    const deposit = (amount) => {
        if (typeof amount !== 'number' || amount <= 0) {
            return "Invalid Amount";
        }
        balance += amount;
        return balance;
    };

    // --- STEP 5: DEFINE WITHDRAW METHOD ---
    // Deducts amount if PIN is correct and balance is sufficient.
    // Returns new balance or appropriate error message.
    const withdraw = (pin, amount) => {
        if (pin !== correctPin) {
            return "Access Denied";
        }
        if (typeof amount !== 'number' || amount <= 0) {
            return "Invalid Amount";
        }
        if (amount > balance) {
            return "Insufficient Funds";
        }
        balance -= amount;
        return balance;
    };

    // --- STEP 6: DEFINE GETBALANCE METHOD ---
    // Returns current balance if PIN is correct.
    // Returns "Access Denied" for wrong PIN.
    const getBalance = (pin) => {
        if (pin !== correctPin) {
            return "Access Denied";
        }
        return balance;
    };

    // --- STEP 7: DEFINE GETOWNER METHOD ---
    // Returns owner name. No PIN required for this operation.
    const getOwner = () => owner;

    // --- STEP 8: RETURN ACCOUNT API ---
    // Return an object containing all methods. The internal state
    // (balance, correctPin) remains private and inaccessible from outside.
    return {
        deposit,
        withdraw,
        getBalance,
        getOwner
    };
}


// --- EXAMPLE USAGE ---
const acc = createBankAccount({ owner: "Rahim", initialBalance: 1000, pin: 1234 });

console.log(acc.deposit(500));
console.log(acc.withdraw(1234, 200));
console.log(acc.withdraw(9999, 200));
console.log(acc.getBalance(1234));
console.log(acc.getOwner());

// --- Invalid Input ---
console.log(createBankAccount("invalid"));