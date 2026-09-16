// 🧩 PROBLEM–03: createQueryBuilder()

// Logic: This function creates a fluent query builder class that supports
// method chaining for building SQL-like queries. All methods return `this`
// for chaining. The build() method returns the final query object.

function createQueryBuilder(config) {

    // --- STEP 1: VALIDATE CONFIG ---
    if (
        !config ||
        typeof config !== 'object' ||
        Array.isArray(config) ||
        typeof config.tableName !== 'string' ||
        !Array.isArray(config.availableColumns)
    ) {
        return "Invalid Input";
    }

    // --- STEP 2: DEFINE QUERY BUILDER CLASS ---
    class QueryBuilder {
        constructor(tableName, availableColumns) {
            this.tableName = tableName;
            this.availableColumns = new Set(availableColumns);
            this.reset();
        }

        reset() {
            this.columns = null; // null means all columns
            this.conditions = [];
            this.orderByClause = null; // Renamed to avoid conflict with method
            this.limitValue = null;
            this.offsetValue = null;
            return this;
        }

        select(...columns) {
            const validColumns = columns.filter(col => this.availableColumns.has(col));
            this.columns = validColumns.length > 0 ? validColumns : null;
            return this;
        }

        where(column, operator, value) {
            const validOperators = ["=", ">", "<", ">=", "<=", "!="];
            if (this.availableColumns.has(column) && validOperators.includes(operator)) {
                this.conditions.push({ column, operator, value });
            }
            return this;
        }

        orderBy(column, direction) {
            if (this.availableColumns.has(column) && ["ASC", "DESC"].includes(direction)) {
                this.orderByClause = { column, direction };
            }
            return this;
        }

        limit(n) {
            if (typeof n === 'number' && n > 0) {
                this.limitValue = n;
            }
            return this;
        }

        offset(n) {
            if (typeof n === 'number' && n >= 0) {
                this.offsetValue = n;
            }
            return this;
        }

        build() {
            const query = {
                table: this.tableName,
                columns: this.columns || Array.from(this.availableColumns),
                conditions: [...this.conditions],
                orderBy: this.orderByClause,
                limit: this.limitValue,
                offset: this.offsetValue
            };
            this.reset();
            return query;
        }
    }

    // --- STEP 3: RETURN QUERY BUILDER INSTANCE ---
    return new QueryBuilder(config.tableName, config.availableColumns);
}


// --- EXAMPLE USAGE ---
const qb = createQueryBuilder({ tableName: "users", availableColumns: ["id", "name", "age", "email"] });
const query = qb.select("id", "name", "age")
    .where("age", ">", 18)
    .where("name", "!=", "Admin")
    .orderBy("age", "DESC")
    .limit(10)
    .offset(20)
    .build();
console.log(query);


//- --- Invalid Input ---
console.log(createQueryBuilder("invalid"));