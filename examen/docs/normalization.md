# Data Normalization Process — db_megastore_exam

## Original Flat Table (Unnormalized)

The raw CSV/Excel file contains all data in a single flat structure:

| transaction_id | date | customer_name | customer_email | customer_address | customer_phone | product_category | product_sku | product_name | unit_price | quantity | total_line | supplier_name | supplier_email |

**Problems**: Redundant customer data, repeated supplier info, product details duplicated in every row.

---

## First Normal Form (1NF)

- Each cell contains a single atomic value.
- Primary keys defined for each record.
- No repeating groups.
- Every row is uniquely identifiable.

**Result**: Same flat table but with atomic values and unique identifiers.

---

## Second Normal Form (2NF)

Partial dependencies removed — attributes that depend only on part of a composite key are separated:

- **customers** (id_customer PK, name, email UNIQUE, phone, address)
- **categories** (id_category PK, name UNIQUE)
- **suppliers** (id_supplier PK, name UNIQUE, email)
- **products** (id_product PK, sku UNIQUE, name, price, id_category FK, id_supplier FK)
- **orders** (id_order PK, transaction_id UNIQUE, id_customer FK, date)

**Result**: 5 tables — master entities extracted from the flat data.

---

## Third Normal Form (3NF)

Transitive dependencies removed — no non-key column depends on another non-key column:

- **order_items** separated from orders: (id_order_item PK, id_order FK, id_product FK, quantity, unit_price)
- `unit_price` stored in order_items because the price at purchase time may differ from current product price.
- Product category and supplier are stored in products (via FK), not in order_items.

**Result**: 6 final tables: customers, categories, suppliers, products, orders, order_items.

---

## Final Design Decisions

| Table       | Purpose                | Key Constraints                               |
| ----------- | ---------------------- | --------------------------------------------- |
| customers   | Unique client records  | email UNIQUE                                  |
| categories  | Product classification | name UNIQUE                                   |
| suppliers   | Vendor/provider data   | name UNIQUE                                   |
| products    | Product catalog        | sku UNIQUE, FK to category + supplier         |
| orders      | Purchase transactions  | transaction_id UNIQUE, FK to customer         |
| order_items | Line items per order   | FK to order + product, UNIQUE(order, product) |

---

## MongoDB Design Decisions

### audit_logs (Embedded Document Pattern)

- **Why embedded**: Each audit log is a self-contained snapshot of the deleted entity. The data is immutable (write-once, read-rarely). Embedding the full product data ensures the audit trail is complete even if the original entity no longer exists.

### customer_histories (Hybrid: Embedded Array)

- **Why embedded purchases array**: Read-optimized — one query returns the full purchase history without JOINs. Past purchases are immutable (they never change). This avoids the N+1 query problem when fetching a customer's complete history.
- **Why not referenced**: References would require multiple queries or `$lookup` aggregations, adding latency for a read-heavy use case.
- **Tradeoff**: If a customer has thousands of purchases, the document could grow large. For MegaStore's scale, embedded arrays are efficient.
