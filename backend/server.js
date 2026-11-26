const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');
const kategoriRoute = require('./routes/kategoriRoute');
const tiketRoute = require('./routes/tiketRoute');
const dashboardRoute = require('./routes/dashboardRoute');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/catagories', kategoriRoute);
app.use('/api/tickets', tiketRoute);
app.use('/api/dashboard', dashboardRoute);

// endpoint tidak ditemukan
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan` })
})

// penanganan error terpusat
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Format JSON tidak valid' })
    }
    const status = err.statusCode || 500
    if (status === 500) console.error(err)
    res.status(status).json({
        success: false,
        message: status === 500 ? 'Terjadi kesalahan pada server' : err.message,
        ...(err.errors ? { errors: err.errors } : {}),
    })
})

const PORT = 4000;

db.query('SELECT 1')
    .then(() => {
        console.log('koneksi ke database berhasil!');
        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        })
    })
    .catch((err) => {
        console.error('Gagal terhubung ke MySQL:', err.message);
        console.error('Cek pengaturan di db.js dan pastikan database.sql sudah diimpor.');
        process.exit(1);
    })
