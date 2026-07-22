const { pool } = require('../config/db');

async function assertExchangeMember(exchangeId, userId) {
  const [rows] = await pool.query(
    'SELECT id, user_a_id, user_b_id FROM skill_exchanges WHERE id = ?',
    [exchangeId]
  );
  const exchange = rows[0];
  if (!exchange || (exchange.user_a_id !== userId && exchange.user_b_id !== userId)) {
    return null;
  }
  return exchange;
}

async function createSession(req, res) {
  const { exchangeId, title, startsAt, endsAt, meetingLink } = req.body;

  const exchange = await assertExchangeMember(exchangeId, req.user.id);
  if (!exchange) {
    return res.status(403).json({ success: false, message: 'You are not part of this exchange' });
  }

  const [result] = await pool.query(
    `INSERT INTO sessions (exchange_id, scheduled_by, title, starts_at, ends_at, meeting_link)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [exchangeId, req.user.id, title || null, startsAt, endsAt, meetingLink || null]
  );

  await pool.query(
    `UPDATE skill_exchanges SET status = 'scheduled' WHERE id = ? AND status = 'proposed'`,
    [exchangeId]
  );

  res.status(201).json({ success: true, data: { sessionId: result.insertId } });
}

async function listMySessions(req, res) {
  const [rows] = await pool.query(
    `SELECT s.id, s.exchange_id, s.title, s.starts_at, s.ends_at, s.meeting_link, s.status,
            s.scheduled_by,
            e.user_a_id, e.user_b_id, e.skill_a_id, e.skill_b_id,
            other.id AS other_user_id, other.full_name AS other_user_name,
            skill_a.name AS skill_a_name, skill_b.name AS skill_b_name
     FROM sessions s
     JOIN skill_exchanges e ON e.id = s.exchange_id
     JOIN users other ON other.id = IF(e.user_a_id = ?, e.user_b_id, e.user_a_id)
     JOIN skills skill_a ON skill_a.id = e.skill_a_id
     JOIN skills skill_b ON skill_b.id = e.skill_b_id
     WHERE e.user_a_id = ? OR e.user_b_id = ?
     ORDER BY s.starts_at ASC`,
    [req.user.id, req.user.id, req.user.id]
  );

  const data = rows.map((r) => ({
    id: r.id,
    exchangeId: r.exchange_id,
    title: r.title,
    startsAt: r.starts_at,
    endsAt: r.ends_at,
    meetingLink: r.meeting_link,
    status: r.status,
    scheduledByMe: r.scheduled_by === req.user.id,
    otherUserId: r.other_user_id,
    otherUserName: r.other_user_name,
    // Skill I teach them vs. skill they teach me, from my perspective
    iTeach: r.user_a_id === req.user.id ? r.skill_a_name : r.skill_b_name,
    theyTeach: r.user_a_id === req.user.id ? r.skill_b_name : r.skill_a_name,
  }));

  res.json({ success: true, data });
}

async function updateSessionStatus(req, res) {
  const { sessionId } = req.params;
  const { status } = req.body;
  const allowed = ['confirmed', 'cancelled', 'completed', 'no_show'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const [rows] = await pool.query(
    `SELECT s.id, e.user_a_id, e.user_b_id FROM sessions s
     JOIN skill_exchanges e ON e.id = s.exchange_id WHERE s.id = ?`,
    [sessionId]
  );
  const session = rows[0];
  if (!session || (session.user_a_id !== req.user.id && session.user_b_id !== req.user.id)) {
    return res.status(403).json({ success: false, message: 'You are not part of this session' });
  }

  await pool.query('UPDATE sessions SET status = ? WHERE id = ?', [status, sessionId]);
  res.json({ success: true, message: `Session ${status}` });
}

module.exports = { createSession, listMySessions, updateSessionStatus };
