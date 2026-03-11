// Main Express application.
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectMySQL, connectMongoDB } = require('./config/db');
require('dotenv').config();

// Import route modules.
const migrationRoutes = require('./routes/migrationRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');
const mongoRoutes = require('./routes/mongoRoutes');

const app = express();

// Global middlewares.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend as static files.
app.use(express.static(path.join(__dirname, '../frontend')));

// Route registration.
app.use('/api/migration', migrationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/mongo', mongoRoutes);

// Start server and connect MongoDB.
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await connectMySQL();
  await connectMongoDB();
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
