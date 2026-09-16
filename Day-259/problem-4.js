// 🧩 PROBLEM–04: buildProductRegistry()

// Logic: This function builds a product registry using ES6 classes with
// static methods. Product class has instance methods for pricing and
// static methods for comparison and category reporting.


function buildProductRegistry(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.storeName !== 'string' ||
        typeof config.taxRate !== 'number' ||
        !Array.isArray(config.discountRules)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE PRODUCT CLASS ---
    class Product {
        constructor(id, name, price, category, stock) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.category = category;
            this.stock = stock;
        }

        // Instance method: apply discount based on quantity
        applyDiscount(qty) {
            let discountPercent = 0;
            for (const rule of config.discountRules) {
                if (qty >= rule.minQty) {
                    discountPercent = rule.discountPercent;
                }
            }
            return this.price * (1 - discountPercent / 100);
        }

        // Instance method: get total with discount and tax
        getTotal(qty) {
            const subtotal = this.price * qty;
            const discountedPrice = this.applyDiscount(qty);
            const discount = subtotal - (discountedPrice * qty);
            const taxableAmount = discountedPrice * qty;
            const tax = taxableAmount * config.taxRate / 100;
            const total = taxableAmount + tax;
            return {
                subtotal,
                discount: Math.round(discount),
                tax: Math.round(tax),
                total: Math.round(total)
            };
        }

        // Instance method: check availability
        isAvailable(qty) {
            return this.stock >= qty;
        }

        // Static method: compare two products, return cheaper
        static compare(p1, p2) {
            return p1.price < p2.price ? p1 : p2;
        }

        // Static method: find cheapest product in array
        static findCheapest(products) {
            if (!products.length) return null;
            return products.reduce((min, p) => p.price < min.price ? p : min);
        }

        // Static method: get category count
        static getCategoryCount(products) {
            const counts = {};
            for (const p of products) {
                counts[p.category] = (counts[p.category] || 0) + 1;
            }
            return counts;
        }
    }

    // --- STEP 3: INITIALIZE REGISTRY STATE ---
    const products = new Map(); // id -> Product

    // --- STEP 4: DEFINE ADDPRODUCT ---
    function addProduct(id, name, price, category, stock) {
        if (typeof id !== 'string' || typeof name !== 'string' ||
            typeof price !== 'number' || typeof category !== 'string' ||
            typeof stock !== 'number') {
            return "Invalid Input";
        }
        if (products.has(id)) {
            return "Product ID Exists";
        }
        const product = new Product(id, name, price, category, stock);
        products.set(id, product);
        return product;
    }

    // --- STEP 5: DEFINE GETPRODUCT ---
    function getProduct(id) {
        return products.get(id) || null;
    }

    // --- STEP 6: DEFINE COMPAREPRODUCTS ---
    function compareProducts(id1, id2) {
        const p1 = products.get(id1);
        const p2 = products.get(id2);
        if (!p1 || !p2) return "Product Not Found";
        const cheaper = Product.compare(p1, p2);
        return { id: cheaper.id, name: cheaper.name, price: cheaper.price };
    }

    // --- STEP 7: DEFINE GETCHEAPEST ---
    function getCheapest() {
        const allProducts = Array.from(products.values());
        if (!allProducts.length) return "No Products";
        const cheapest = Product.findCheapest(allProducts);
        return { id: cheapest.id, name: cheapest.name, price: cheapest.price };
    }

    // --- STEP 8: DEFINE GETCATEGORYREPORT ---
    function getCategoryReport() {
        const allProducts = Array.from(products.values());
        return Product.getCategoryCount(allProducts);
    }

    // --- STEP 9: RETURN API ---
    return {
        addProduct,
        getProduct,
        compareProducts,
        getCheapest,
        getCategoryReport
    };
}


// --- EXAMPLE USAGE ---
const registry = buildProductRegistry({ storeName: "TechMart", taxRate: 15, discountRules: [{ minQty: 5, discountPercent: 10 }, { minQty: 10, discountPercent: 20 }] });

registry.addProduct("P001", "Laptop", 50000, "Electronics", 20);
registry.addProduct("P002", "Mouse", 500, "Accessories", 100);
registry.addProduct("P003", "Keyboard", 1500, "Accessories", 50);

console.log(registry.getProduct("P001").getTotal(10));
console.log(registry.compareProducts("P001", "P002"));
console.log(registry.getCheapest());
console.log(registry.getCategoryReport());

// --- Invalid Input ---
console.log(buildProductRegistry("invalid"));