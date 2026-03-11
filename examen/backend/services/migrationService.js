// Library to read Excel/CSV files.
const XLSX = require('xlsx');
// MongoDB repository for customer history.
const { upsertCustomerHistory } = require('../repositories/mongoRepository');
// SQL repository for idempotent inserts.
const {
  insertCustomer, insertCategory, insertSupplier,
  insertProduct, insertOrder, insertOrderItem
} = require('../repositories/migrationRepository');

// Convert Excel serial date to YYYY-MM-DD string.
const excelDateToString = (serial) => {
  if (typeof serial === 'number') {
    const date = new Date((serial - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  return serial;
};

// Process every row of the uploaded file.
const processMigration = async (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  const results = { success: 0, errors: [] };

  for (const row of rows) {
    try {
      // 1) Customer
      const id_customer = await insertCustomer({
        name: row.customer_name,
        email: row.customer_email,
        phone: String(row.customer_phone || ''),
        address: row.customer_address
      });

      // 2) Category
      const id_category = await insertCategory(row.product_category);

      // 3) Supplier
      const id_supplier = await insertSupplier({
        name: row.supplier_name,
        email: row.supplier_email
      });

      // 4) Product
      const id_product = await insertProduct({
        sku: row.product_sku,
        name: row.product_name,
        price: row.unit_price,
        id_category,
        id_supplier
      });

      // 5) Order
      const id_order = await insertOrder({
        transaction_id: String(row.transaction_id),
        id_customer,
        date: excelDateToString(row.date)
      });

      // 6) Order item
      await insertOrderItem({
        id_order,
        id_product,
        quantity: row.quantity,
        unit_price: row.unit_price
      });

      // 7) Upsert customer history in MongoDB.
      await upsertCustomerHistory({
        id_customer,
        customer_name: row.customer_name,
        customer_email: row.customer_email,
        purchase: {
          transaction_id: String(row.transaction_id),
          date: excelDateToString(row.date),
          product_name: row.product_name,
          sku: row.product_sku,
          category: row.product_category,
          quantity: row.quantity,
          unit_price: row.unit_price,
          total: row.quantity * row.unit_price
        }
      });

      results.success++;
    } catch (error) {
      results.errors.push({ row, error: error.message });
    }
  }
  return results;
};

module.exports = { processMigration };
