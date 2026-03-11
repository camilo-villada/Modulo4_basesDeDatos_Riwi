const mysql = require('mysql2');
const mongoose = require('mongoose');
require('dotenv').config();

// MySQL connection pool — reuses connections for better performance.
const sqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}).promise();

// Validate SQL connectivity on startup.
const connectMySQL = async () => {
  try {
    await sqlPool.query('SELECT 1');
    console.log('Connected to MySQL');
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    throw error;
  }
};

// Connect to MongoDB.
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || process.env.DB_NAME,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

module.exports = { sqlPool, connectMySQL, connectMongoDB };
