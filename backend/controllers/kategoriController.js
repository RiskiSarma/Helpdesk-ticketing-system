const db = require('../db');

exports.getAllKategori = async (req, res) => {
    const [rows] = await db.query('SELECT id, name, description FROM catagories ORDER BY name ASC')
    res.json({ success: true, data: rows })
}
