const mysql = require('mysql2/promise'); // Gunakan promise-based
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50, // Bisa disesuaikan
  queueLimit: 0
});

module.exports = pool;
