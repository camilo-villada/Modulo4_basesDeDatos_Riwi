# MegaStore Global

Migration and REST API system for MegaStore Global, built with Node.js, MySQL and MongoDB. The goal was to take a flat Excel file with all transactions mixed together and split it into a proper normalized database, while exposing the data through an API.

**Stack:** Node.js, Express.js, MySQL 8, MongoDB 7, Mongoose, HTML/CSS/JS (vanilla frontend)

---

## Requirements

Before running the project you need Node.js v18+, MySQL 8 and MongoDB 7 installed and running. Below are the install steps for Ubuntu.

### Node.js (if not installed)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### MySQL on Ubuntu

```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

After install, log in and create the user/password you'll use in `.env`:

```bash
sudo mysql -u root
```

### MongoDB on Ubuntu

```bash
sudo apt update
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

Verify both services are running:

```bash
sudo systemctl status mysql
sudo systemctl status mongod
```

---

## Installation

```bash
git clone 
cd examen
npm install
```

---

## Environment variables

Create `backend/.env` with your local credentials:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=db_megastore_exam
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=db_megastore_exam
```

---

## Database setup

### MySQL

Run both scripts from the project root:

```bash
mysql -u root -p < sql/database.sql
mysql -u root -p < sql/views.sql
```

This creates the database `db_megastore_exam` with:

- 6 tables: `customers`, `categories`, `suppliers`, `products`, `orders`, `order_items`
- 3 views: `v_supplier_inventory`, `v_product_sales`, `v_customer_spending`
- 1 stored procedure: `sp_customer_summary`
- 3 triggers to validate data integrity on insert/update

### MongoDB

Collections are created automatically when the migration runs for the first time. If you want to add schema validation beforehand, run:

```bash
mongosh < docs/mongo_validation.js
```

---

## Running the project

```bash
npm start
```

- API: `http://localhost:3000/api`
- Frontend: `http://localhost:3000`

---

## Data migration

The migration endpoint reads a CSV or Excel file and loads all the data into the normalized schema. It handles duplicates automatically — if the same customer appears in 50 rows, only one record is created and all orders point to it.

### How to run it (Postman)

1. POST to `http://localhost:3000/api/migration/upload`
2. Body → form-data → key: `file`, type: File → select the CSV
3. Send

A sample file is available at `docs/sample_data.csv`.

### Expected response

```json
{ "message": "Migration completed", "success": 15, "errors": [] }
```

### CSV columns expected

```
transaction_id, date, customer_name, customer_email, customer_address, customer_phone,
product_category, product_sku, product_name, unit_price, quantity, total_line_value,
supplier_name, supplier_email
```

You can run the migration multiple times with the same file — it won't create duplicates.

---

## Why this database design?

### MySQL for transactional data

The source file had everything in one flat table: customer info repeated on every row, product data mixed with order data. That's a maintenance nightmare. The solution was to normalize it to 3NF:

- **1NF:** every column holds one value, no repeating groups.
- **2NF:** customer info, product info, categories and suppliers were pulled into their own tables to remove partial dependencies on the transaction ID.
- **3NF:** `order_items` was separated from `orders` to eliminate transitive dependencies. The `unit_price` is stored in `order_items` (not in `products`) because the price at the time of purchase may differ from the current price.

MySQL is the right choice here because orders and inventory need ACID guarantees — you can't have an order pointing to a product that doesn't exist.

Full normalization notes: `docs/normalization.md`

### MongoDB for audit logs and customer history

Two collections were chosen for MongoDB:

- **`audit_logs`**: every time a product is deleted, a snapshot of that product is saved here. It's a write-once document, no updates ever needed, and the embedded data makes the audit trail self-contained.
- **`customer_histories`**: stores each customer's purchase history as an embedded array. This avoids expensive JOINs when you just want to see everything a customer has ever bought. Past purchases don't change, so embedding is safe.

---

## API endpoints

### Migration

| Method | Endpoint                | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| POST   | `/api/migration/upload` | Upload CSV/Excel and run migration |

### Products CRUD

| Method | Endpoint                   | Description                                 |
| ------ | -------------------------- | ------------------------------------------- |
| GET    | `/api/products`            | List all products                           |
| GET    | `/api/products/:id`        | Get product by ID                           |
| POST   | `/api/products`            | Create product                              |
| PUT    | `/api/products/:id`        | Update product                              |
| DELETE | `/api/products/:id`        | Delete product + saves audit log to MongoDB |
| GET    | `/api/products/categories` | List categories                             |
| GET    | `/api/products/suppliers`  | List suppliers                              |

### Business Intelligence

| Method | Endpoint                                    | Description                                        |
| ------ | ------------------------------------------- | -------------------------------------------------- |
| GET    | `/api/reports/supplier-analysis`            | Suppliers ranked by units sold and inventory value |
| GET    | `/api/reports/customer-history/:customerId` | Purchase history for a customer                    |
| GET    | `/api/reports/star-products?category=X`     | Top products by revenue in a category              |
| GET    | `/api/reports/supplier-inventory`           | View: supplier inventory                           |
| GET    | `/api/reports/product-sales`                | View: product sales                                |
| GET    | `/api/reports/customer-spending`            | View: customer spending                            |
| GET    | `/api/reports/customer-summary/:customerId` | Stored procedure: full customer summary            |

### MongoDB

| Method | Endpoint                                 | Description                                  |
| ------ | ---------------------------------------- | -------------------------------------------- |
| GET    | `/api/mongo/audit-logs`                  | All deletion audit logs                      |
| GET    | `/api/mongo/customer-history/:email`     | Customer history from MongoDB                |
| GET    | `/api/mongo/customer-aggregation/:email` | Customer history using Aggregation Framework |

---

## Project structure

```
/examen
  /backend
    /config       → MySQL pool + MongoDB connection
    /controllers  → request handlers
    /repositories → database queries
    /routes       → endpoint definitions
    /services     → migration logic (CSV/Excel parsing)
    /uploads      → temporary uploaded files
    index.js      → Express entry point
    .env          → local environment variables (not committed)
  /frontend
    index.html    → single page interface
    app.js        → frontend logic
    style.css     → styles
  /sql
    database.sql  → tables, stored procedure, triggers
    views.sql     → SQL views
    reset.sql     → clears all data for testing
  /docs
    normalization.md   → normalization process
    sample_data.csv    → test data
    mongo_validation.js → MongoDB schema validation script
    MegaStore_Global_API.postman_collection.json → Postman collection
  README.md
```
