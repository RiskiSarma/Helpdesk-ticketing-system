const db = require('../db');

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s-]{8,20}$/;

const SELECT_TIKET = `
    SELECT t.*, c.name AS category_name
    FROM tickets t
    LEFT JOIN categories c ON c.id = t.category_id
`;

// ---------- helper ----------
const galat = (statusCode, message, errors = null) => {
    const err = new Error(message)
    err.statusCode = statusCode
    err.errors = errors
    return err
}

const teks = (v) => (typeof v === 'string' ? v.trim() : '')

const parseId = (value) => {
    const id = Number(value)
    if (!Number.isInteger(id) || id <= 0) throw galat(400, 'ID tidak valid')
    return id
}

const cariTiketAtau404 = async (id) => {
    const [rows] = await db.query(`${SELECT_TIKET} WHERE t.id = ?`, [id])
    if (!rows.length) throw galat(404, 'Tiket tidak ditemukan')
    return rows[0]
}

const validasiTiket = (body = {}) => {
    const errors = {}
    const reporter_name = teks(body.reporter_name)
    const reporter_email = teks(body.reporter_email)
    const subject = teks(body.subject)
    const description = teks(body.description)
    const priority = teks(body.priority)
    const category_id = Number(body.category_id)

    if (!reporter_name) errors.reporter_name = 'Nama wajib diisi'
    else if (reporter_name.length > 100) errors.reporter_name = 'Nama maksimal 100 karakter'

    if (!reporter_email) errors.reporter_email = 'Email atau kontak wajib diisi'
    else if (reporter_email.length > 150) errors.reporter_email = 'Maksimal 150 karakter'
    else if (!EMAIL_RE.test(reporter_email) && !PHONE_RE.test(reporter_email))
        errors.reporter_email = 'Isi dengan email valid atau nomor telepon'

    if (!Number.isInteger(category_id) || category_id <= 0) errors.category_id = 'Kategori wajib dipilih'

    if (!subject) errors.subject = 'Judul wajib diisi'
    else if (subject.length > 200) errors.subject = 'Judul maksimal 200 karakter'

    if (!description) errors.description = 'Deskripsi wajib diisi'
    else if (description.length < 10) errors.description = 'Deskripsi minimal 10 karakter'

    if (!PRIORITIES.includes(priority)) errors.priority = 'Prioritas tidak valid'

    return { errors, data: { reporter_name, reporter_email, category_id, subject, description, priority } }
}

// Format nomor tiket: TKT-YYYYMMDD-NNN (urut per hari)
const nomorTiketBerikutnya = async () => {
    const d = new Date()
    const pad = (n, len) => String(n).padStart(len, '0')
    const prefix = `TKT-${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}-`
    const [rows] = await db.query(
        'SELECT ticket_number FROM tickets WHERE ticket_number LIKE ? ORDER BY ticket_number DESC LIMIT 1',
        [`${prefix}%`]
    )
    const terakhir = rows.length ? Number(rows[0].ticket_number.slice(prefix.length)) : 0
    return `${prefix}${pad(terakhir + 1, 3)}`
}

// ---------- tiket ----------
exports.createTiket = async (req, res) => {
    const { errors, data } = validasiTiket(req.body)
    if (!errors.category_id) {
        const [kategori] = await db.query('SELECT id FROM categories WHERE id = ?', [data.category_id])
        if (!kategori.length) errors.category_id = 'Kategori tidak tersedia'
    }
    if (Object.keys(errors).length) throw galat(422, 'Data tidak valid', errors)

    // Ulangi bila dua laporan masuk bersamaan dan nomor bentrok (UNIQUE di database)
    for (let percobaan = 0; percobaan < 5; percobaan++) {
        const ticket_number = await nomorTiketBerikutnya()
        try {
            await db.query(
                `INSERT INTO tickets
                    (ticket_number, reporter_name, reporter_email, category_id, subject, description, priority, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
                [ticket_number, data.reporter_name, data.reporter_email, data.category_id, data.subject, data.description, data.priority]
            )
            return res.status(201).json({
                success: true,
                message: 'Tiket berhasil dibuat',
                data: { ticket_number, status: 'open' },
            })
        } catch (err) {
            if (err.code !== 'ER_DUP_ENTRY') throw err
        }
    }
    throw galat(500, 'Gagal membuat nomor tiket unik')
}

exports.getAllTiket = async (req, res) => {
    const search = teks(req.query.search)
    const status = teks(req.query.status)
    const priority = teks(req.query.priority)
    if (status && !STATUSES.includes(status)) throw galat(400, 'Filter status tidak valid')
    if (priority && !PRIORITIES.includes(priority)) throw galat(400, 'Filter prioritas tidak valid')

    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10))

    const where = []
    const params = []
    if (search) {
        where.push('(t.ticket_number LIKE ? OR t.subject LIKE ?)')
        params.push(`%${search}%`, `%${search}%`)
    }
    if (status) {
        where.push('t.status = ?')
        params.push(status)
    }
    if (priority) {
        where.push('t.priority = ?')
        params.push(priority)
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM tickets t ${whereSql}`, params)
    const [rows] = await db.query(
        `${SELECT_TIKET} ${whereSql} ORDER BY t.created_at DESC, t.id DESC LIMIT ? OFFSET ?`,
        [...params, limit, (page - 1) * limit]
    )

    res.json({
        success: true,
        data: rows,
        pagination: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) },
    })
}

exports.getTiketById = async (req, res) => {
    const tiket = await cariTiketAtau404(parseId(req.params.id))
    res.json({ success: true, data: tiket })
}

// Publik: tanpa email pelapor agar kontak tidak terbuka untuk siapa pun yang tahu nomor tiket
exports.trackTiket = async (req, res) => {
    const nomor = teks(req.params.number).toUpperCase()
    const [rows] = await db.query(`${SELECT_TIKET} WHERE t.ticket_number = ?`, [nomor])
    if (!rows.length) throw galat(404, 'Nomor tiket tidak ditemukan')

    const [replies] = await db.query(
        'SELECT id, ticket_id, sender_name, message, created_at FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC, id ASC',
        [rows[0].id]
    )
    const { reporter_email, ...aman } = rows[0]
    res.json({ success: true, data: { ...aman, replies } })
}

exports.updateStatusTiket = async (req, res) => {
    const id = parseId(req.params.id)
    const status = teks((req.body || {}).status)
    if (!STATUSES.includes(status)) throw galat(422, 'Status tidak valid', { status: 'Status tidak valid' })

    await cariTiketAtau404(id)
    await db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id])
    const data = await cariTiketAtau404(id)
    res.json({ success: true, message: 'Status tiket diperbarui', data })
}

exports.deleteTiket = async (req, res) => {
    const id = parseId(req.params.id)
    await cariTiketAtau404(id)
    await db.query('DELETE FROM tickets WHERE id = ?', [id]) // tanggapan ikut terhapus (ON DELETE CASCADE)
    res.json({ success: true, message: 'Tiket dihapus' })
}

// ---------- tanggapan ----------
exports.getReplies = async (req, res) => {
    const id = parseId(req.params.id)
    await cariTiketAtau404(id)
    const [rows] = await db.query(
        'SELECT id, ticket_id, sender_name, message, created_at FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC, id ASC',
        [id]
    )
    res.json({ success: true, data: rows })
}

exports.createReply = async (req, res) => {
    const id = parseId(req.params.id)
    await cariTiketAtau404(id)

    const body = req.body || {}
    const message = teks(body.message)
    const sender_name = teks(body.sender_name) || 'Admin IT'
    const errors = {}
    if (!message) errors.message = 'Tanggapan wajib diisi'
    if (sender_name.length > 100) errors.sender_name = 'Nama pengirim maksimal 100 karakter'
    if (Object.keys(errors).length) throw galat(422, 'Data tidak valid', errors)

    const [result] = await db.query(
        'INSERT INTO ticket_replies (ticket_id, sender_name, message) VALUES (?, ?, ?)',
        [id, sender_name, message]
    )
    const [rows] = await db.query('SELECT * FROM ticket_replies WHERE id = ?', [result.insertId])
    res.status(201).json({ success: true, message: 'Tanggapan ditambahkan', data: rows[0] })
}
