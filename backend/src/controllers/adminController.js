const { pool } = require('../config/db');

async function listUsers(req, res) {
  const { status, q, page = 1, pageSize = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(pageSize);
  const params = [];
  let where = 'WHERE 1=1';

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (q) {
    where += ' AND (full_name LIKE ? OR email LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  const [rows] = await pool.query(
    `SELECT id, full_name, email, role, status, created_at, last_login_at
     FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(pageSize), offset]
  );
  res.json({ success: true, data: rows });
}

async function updateUserStatus(req, res) {
  const { userId } = req.params;
  const { status } = req.body;
  const allowed = ['active', 'suspended', 'banned', 'deleted'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
  res.json({ success: true, message: `User status updated to ${status}` });
}

async function listDisputes(req, res) {
  const [rows] = await pool.query(
    `SELECT d.id, d.reason, d.status, d.created_at, d.exchange_id,
            u.full_name AS raised_by_name
     FROM disputes d JOIN users u ON u.id = d.raised_by
     ORDER BY d.created_at DESC`
  );
  res.json({ success: true, data: rows });
}

async function resolveDispute(req, res) {
  const { disputeId } = req.params;
  const { status, resolutionNotes } = req.body;
  const allowed = ['under_review', 'resolved', 'dismissed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  await pool.query(
    `UPDATE disputes SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = NOW()
     WHERE id = ?`,
    [status, resolutionNotes || null, req.user.id, disputeId]
  );
  res.json({ success: true, message: 'Dispute updated' });
}

async function systemStats(req, res) {
  const [[userCount]] = await pool.query('SELECT COUNT(*) AS count FROM users');
  const [[exchangeCount]] = await pool.query('SELECT COUNT(*) AS count FROM skill_exchanges');
  const [[activeExchanges]] = await pool.query(
    `SELECT COUNT(*) AS count FROM skill_exchanges WHERE status IN ('scheduled','in_progress')`
  );
  const [[credentialCount]] = await pool.query(
    `SELECT COUNT(*) AS count FROM credentials WHERE status = 'minted'`
  );
  const [[openDisputes]] = await pool.query(
    `SELECT COUNT(*) AS count FROM disputes WHERE status IN ('open','under_review')`
  );

  res.json({
    success: true,
    data: {
      totalUsers: userCount.count,
      totalExchanges: exchangeCount.count,
      activeExchanges: activeExchanges.count,
      credentialsIssued: credentialCount.count,
      openDisputes: openDisputes.count,
    },
  });
}

module.exports = { listUsers, updateUserStatus, listDisputes, resolveDispute, systemStats };
