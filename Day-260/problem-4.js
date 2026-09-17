// 🧩 PROBLEM–04: buildInventorySystem()

// Logic: This function builds an inventory management system with computed
// properties (getters) for profit margin, price with tax, stock status,
// and total revenue. Setters validate selling price and stock changes.

function buildInventorySystem(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.storeName !== 'string' ||
        typeof config.taxRate !== 'number' ||
        typeof config.lowStockThreshold !== 'number'
    ) {
        return "Invalid Input";
    }
    if (config.taxRate < 0 || config.lowStockThreshold < 0) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE INVENTORYITEM CLASS ---
    class InventoryItem {
        constructor(id, name, costPrice, sellingPrice, stock, category) {
            // Private fields
            let _costPrice = costPrice;
            let _sellingPrice = sellingPrice;
            let _stock = stock;
            const _salesLog = [];

            // --- GETTERS ---
            Object.defineProperty(this, 'id', { value: id, enumerable: true });
            Object.defineProperty(this, 'name', { value: name, enumerable: true });
            Object.defineProperty(this, 'category', { value: category, enumerable: true });

            Object.defineProperty(this, 'profitMargin', {
                get: () => {
                    if (_costPrice === 0) return 0;
                    return Math.round(((_sellingPrice - _costPrice) / _costPrice) * 10000) / 100;
                },
                enumerable: true
            });

            Object.defineProperty(this, 'priceWithTax', {
                get: () => Math.round(_sellingPrice * (1 + config.taxRate / 100) * 100) / 100,
                enumerable: true
            });

            Object.defineProperty(this, 'stockStatus', {
                get: () => {
                    if (_stock <= 0) return "Out of Stock";
                    if (_stock <= config.lowStockThreshold) return "Low Stock";
                    return "In Stock";
                },
                enumerable: true
            });

            Object.defineProperty(this, 'totalRevenue', {
                get: () => _salesLog.reduce((sum, sale) => sum + sale.amount, 0),
                enumerable: true
            });

            // --- SETTERS ---
            Object.defineProperty(this, 'sellingPrice', {
                set: (price) => {
                    if (typeof price !== 'number' || price <= _costPrice) {
                        throw new Error("Selling price must be greater than cost price");
                    }
                    _sellingPrice = price;
                },
                enumerable: true
            });

            Object.defineProperty(this, 'stock', {
                get: () => _stock,
                set: (qty) => {
                    if (typeof qty !== 'number' || qty < 0) {
                        throw new Error("Stock must be non-negative");
                    }
                    _stock = qty;
                },
                enumerable: true
            });

            // --- METHODS ---
            this.sell = (qty) => {
                if (typeof qty !== 'number' || qty <= 0) return "Invalid Quantity";
                if (qty > _stock) return "Insufficient Stock";
                _stock -= qty;
                const amount = _sellingPrice * qty;
                _salesLog.push({ qty, amount, timestamp: Date.now() });
                return amount;
            };

            this.restock = (qty) => {
                if (typeof qty !== 'number' || qty <= 0) return "Invalid Quantity";
                _stock += qty;
                return _stock;
            };

            this.getSalesReport = () => {
                const totalSold = _salesLog.reduce((sum, sale) => sum + sale.qty, 0);
                const totalRevenue = _salesLog.reduce((sum, sale) => sum + sale.amount, 0);
                const averageOrderSize = totalSold > 0 ? totalSold / _salesLog.length : 0;
                return {
                    totalSold,
                    totalRevenue,
                    averageOrderSize: Math.round(averageOrderSize)
                };
            };
        }
    }

    // --- STEP 3: INITIALIZE INVENTORY STATE ---
    const items = new Map(); // id -> InventoryItem

    // --- STEP 4: DEFINE INVENTORY API ---
    function addItem(id, name, costPrice, sellingPrice, stock, category) {
        if (typeof id !== 'string' || typeof name !== 'string' ||
            typeof costPrice !== 'number' || typeof sellingPrice !== 'number' ||
            typeof stock !== 'number' || typeof category !== 'string') {
            return "Invalid Input";
        }
        if (items.has(id)) return "Item Exists";
        if (sellingPrice <= costPrice) return "Selling Price Must Exceed Cost";

        const item = new InventoryItem(id, name, costPrice, sellingPrice, stock, category);
        items.set(id, item);
        return item;
    }

    function getItem(id) {
        return items.get(id) || null;
    }

    function getLowStockItems() {
        const low = [];
        for (const item of items.values()) {
            if (item.stockStatus === "Low Stock" || item.stockStatus === "Out of Stock") {
                low.push({ id: item.id, name: item.name, stock: item.stock, status: item.stockStatus });
            }
        }
        return low;
    }

    function getInventoryReport() {
        let totalItems = 0;
        let totalValue = 0;
        const categoryBreakdown = {};

        for (const item of items.values()) {
            totalItems += item.stock;
            totalValue += item.stock * item.sellingPrice;
            categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.stock;
        }

        return {
            totalItems,
            totalValue,
            categoryBreakdown
        };
    }

    // --- STEP 5: RETURN API ---
    return {
        addItem,
        getItem,
        getLowStockItems,
        getInventoryReport
    };
}


// --- EXAMPLE USAGE ---
const inv = buildInventorySystem({ storeName: "TechStore", taxRate: 15, lowStockThreshold: 5 });
inv.addItem("P001", "Laptop", 40000, 55000, 10, "Electronics");

const laptop = inv.getItem("P001");

console.log(laptop.profitMargin);
console.log(laptop.priceWithTax);

laptop.sell(3);
laptop.sell(5);
console.log(laptop.stockStatus);
console.log(laptop.getSalesReport());
console.log(inv.getLowStockItems());

// --- Invalid Input ---
console.log(buildInventorySystem("invalid"));