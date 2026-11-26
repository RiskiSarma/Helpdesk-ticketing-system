const mysql = require ('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'helpdesk'
});

db.connect((err) => {
    if (err) throw err;
    console.log('koneksi database berhasil')
});

module.exports = db;