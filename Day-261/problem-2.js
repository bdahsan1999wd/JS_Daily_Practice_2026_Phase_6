// 🧩 PROBLEM–02: buildPaymentSystem()

// Logic: This function builds a payment processing system using
// abstract base class (PaymentProvider) and concrete implementations
// (CreditCard, MobileBanking, Crypto). It demonstrates polymorphism
// through the process() method and provider-specific features.


function buildPaymentSystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.systemName !== 'string' ||
        typeof config.currency !== 'string' ||
        typeof config.defaultTimeout !== 'number'
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE PAYMENTPROVIDER ABSTRACT BASE CLASS ---
    class PaymentProvider {
        constructor(providerName, feePercent) {
            if (this.constructor === PaymentProvider) {
                throw new Error("Cannot instantiate abstract class PaymentProvider");
            }
            this.providerName = providerName;
            this.feePercent = feePercent;
        }

        process(amount) {
            throw new Error("Must implement process()");
        }

        calculateFee(amount) {
            return amount * this.feePercent / 100;
        }

        getProviderInfo() {
            return `Provider: ${this.providerName}, Fee: ${this.feePercent}%`;
        }
    }

    // --- STEP 3: DEFINE CREDITCARD CLASS ---
    class CreditCard extends PaymentProvider {
        constructor(providerName, feePercent, cardNetwork) {
            super(providerName, feePercent);
            this.cardNetwork = cardNetwork;
        }

        process(amount) {
            const fee = this.calculateFee(amount);
            return {
                method: "CreditCard",
                network: this.cardNetwork,
                amount,
                fee,
                total: amount + fee,
                status: "Success"
            };
        }

        getProviderInfo() {
            return `${super.getProviderInfo()}, Network: ${this.cardNetwork}`;
        }
    }

    // --- STEP 4: DEFINE MOBILEBANKING CLASS ---
    class MobileBanking extends PaymentProvider {
        constructor(providerName, feePercent, phoneNumber) {
            super(providerName, feePercent);
            this.phoneNumber = phoneNumber;
        }

        process(amount) {
            const fee = this.calculateFee(amount);
            return {
                method: "MobileBanking",
                phone: this.phoneNumber,
                amount,
                fee,
                total: amount + fee,
                status: "Success"
            };
        }

        verify(otp) {
            return typeof otp === 'number' && otp >= 100000 && otp <= 999999;
        }

        getProviderInfo() {
            return `${super.getProviderInfo()}, Phone: ${this.phoneNumber}`;
        }
    }

    // --- STEP 5: DEFINE CRYPTO CLASS ---
    class Crypto extends PaymentProvider {
        constructor(providerName, feePercent, coinType, walletAddress) {
            super(providerName, feePercent);
            this.coinType = coinType;
            this.walletAddress = walletAddress;
        }

        process(amount) {
            const fee = this.calculateFee(amount);
            return {
                method: "Crypto",
                coin: this.coinType,
                amount,
                fee,
                total: amount + fee,
                txHash: "TX" + Date.now(),
                status: "Pending"
            };
        }

        getExchangeRate(targetCurrency) {
            return {
                from: this.coinType,
                to: targetCurrency,
                rate: 1000 // simulated
            };
        }

        getProviderInfo() {
            return `${super.getProviderInfo()}, Coin: ${this.coinType}, Wallet: ${this.walletAddress}`;
        }
    }

    // --- STEP 6: INITIALIZE PAYMENT STATE ---
    const providers = new Map(); // name -> provider instance

    // --- STEP 7: DEFINE PAYMENT API ---
    function addProvider(type, ...args) {
        if (typeof type !== 'string') return "Invalid Input";

        let provider;
        switch (type) {
            case "creditcard":
                if (args.length !== 3) return "Invalid Arguments";
                provider = new CreditCard(...args);
                break;
            case "mobilebanking":
                if (args.length !== 3) return "Invalid Arguments";
                provider = new MobileBanking(...args);
                break;
            case "crypto":
                if (args.length !== 4) return "Invalid Arguments";
                provider = new Crypto(...args);
                break;
            default:
                return "Invalid Provider Type";
        }

        providers.set(provider.providerName, provider);
        return provider;
    }

    function getProvider(name) {
        return providers.get(name) || null;
    }

    function processAll(amount) {
        if (typeof amount !== 'number') return "Invalid Input";
        const results = [];
        for (const provider of providers.values()) {
            results.push(provider.process(amount));
        }
        return results;
    }

    function getTotalFees(amount) {
        if (typeof amount !== 'number') return "Invalid Input";
        let total = 0;
        for (const provider of providers.values()) {
            total += provider.calculateFee(amount);
        }
        return total;
    }

    function getSystemReport() {
        return {
            systemName: config.systemName,
            totalProviders: providers.size,
            providerList: Array.from(providers.keys())
        };
    }

    // --- STEP 8: RETURN API ---
    return {
        addProvider,
        getProvider,
        processAll,
        getTotalFees,
        getSystemReport
    };
}


// --- EXAMPLE USAGE ---
const pay = buildPaymentSystem({ systemName: "PayEngine", currency: "BDT", defaultTimeout: 30 });

pay.addProvider("creditcard", "Visa", 2.5, "VISA");
pay.addProvider("mobilebanking", "bKash", 1.5, "01712345678");

console.log(pay.getProvider("Visa").process(1000));
console.log(pay.getProvider("bKash").verify(123456));
console.log(pay.getTotalFees(1000));
console.log(pay.getSystemReport());


// --- Invalid Input ---
console.log(buildPaymentSystem("invalid"));