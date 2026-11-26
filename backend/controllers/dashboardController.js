const db = require('../db');

exports.getStatistik = async (req, res) => {
    const [[totals]] = await db.query(`
        SELECT
            COUNT(*) AS total,
            COALESCE(SUM(status = 'open'), 0) AS open,
            COALESCE(SUM(status = 'in_progress'), 0) AS in_progress,
            COALESCE(SUM(status = 'resolved'), 0) AS resolved,
            COALESCE(SUM(status = 'closed'), 0) AS closed,
            COALESCE(SUM(priority = 'urgent' AND status IN ('open','in_progress')), 0) AS urgent_active
        FROM tickets
    `)
    const [byPriority] = await db.query('SELECT priority, COUNT(*) AS count FROM tickets GROUP BY priority')

    const priority = { low: 0, medium: 0, high: 0, urgent: 0 }
    byPriority.forEach((row) => {
        priority[row.priority] = Number(row.count)
    })

    res.json({
        success: true,
        data: {
            total: Number(totals.total),
            status: {
                open: Number(totals.open),
                in_progress: Number(totals.in_progress),
                resolved: Number(totals.resolved),
                closed: Number(totals.closed),
            },
            priority,
            urgent_active: Number(totals.urgent_active),
        },
    })
}
