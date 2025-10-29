// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'mysql-380b6e6e-ahtrujillo86-f42a.f.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_DA8ghfyjFCrr2NRJsb6',
  database: 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
