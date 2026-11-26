const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'helpdesk_lite',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4'
})

// versi promise supaya controller bisa pakai async/await
module.exports = pool.promise();
