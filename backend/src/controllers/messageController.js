const { pool } = require('../config/db');

async function listConversations(req, res) {
  const [rows] = await pool.query(
    `SELECT c.id, c.user_a_id, c.user_b_id,
            other.id AS other_user_id, other.full_name AS other_user_name,
            other.avatar_url AS other_user_avatar,
            (SELECT body FROM messages m WHERE m.conversation_id = c.id
              ORDER BY m.created_at DESC LIMIT 1) AS last_message,
            (SELECT created_at FROM messages m WHERE m.conversation_id = c.id
              ORDER BY m.created_at DESC LIMIT 1) AS last_message_at
     FROM conversations c
     JOIN users other ON other.id = IF(c.user_a_id = ?, c.user_b_id, c.user_a_id)
     WHERE c.user_a_id = ? OR c.user_b_id = ?
     ORDER BY last_message_at DESC`,
    [req.user.id, req.user.id, req.user.id]
  );
  res.json({ success: true, data: rows });
}

async function getMessages(req, res) {
  const { conversationId } = req.params;
  const [rows] = await pool.query(
    `SELECT id, sender_id, body, attachment_url, read_at, created_at
     FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 200`,
    [conversationId]
  );
  res.json({ success: true, data: rows });
}

async function startConversation(req, res) {
  const { otherUserId } = req.body;
  const [userAId, userBId] = [req.user.id, otherUserId].sort((a, b) => a - b);

  const [existing] = await pool.query(
    'SELECT id FROM conversations WHERE user_a_id = ? AND user_b_id = ?',
    [userAId, userBId]
  );
  if (existing.length > 0) {
    return res.json({ success: true, data: { conversationId: existing[0].id } });
  }

  const [result] = await pool.query(
    'INSERT INTO conversations (user_a_id, user_b_id) VALUES (?, ?)',
    [userAId, userBId]
  );
  res.status(201).json({ success: true, data: { conversationId: result.insertId } });
}

module.exports = { listConversations, getMessages, startConversation };
