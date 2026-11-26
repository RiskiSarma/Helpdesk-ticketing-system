const db = require('../db');

exports.getAllKategori = async (req, res) => {
    const [rows] = await db.query('SELECT id, name, description FROM categories ORDER BY name ASC')
    res.json({ success: true, data: rows })
}
