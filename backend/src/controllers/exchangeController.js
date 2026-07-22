const { pool } = require('../config/db');
const { persistMatch } = require('../services/matchingService');

// Creates (or reuses) the skill_exchanges row backing a match, so a session can be scheduled against it.
async function createExchange(req, res) {
  const { otherUserId, mySkillId, theirSkillId, score } = req.body;
  const myId = req.user.id;

  const [userAId, userBId] = [myId, otherUserId].sort((a, b) => a - b);
  const [skillATeaches, skillBTeaches] = myId === userAId ? [mySkillId, theirSkillId] : [theirSkillId, mySkillId];

  const matchId = await persistMatch(userAId, userBId, skillATeaches, skillBTeaches, score || 1);

  const [existing] = await pool.query(
    `SELECT id FROM skill_exchanges WHERE user_a_id = ? AND user_b_id = ?
       AND skill_a_id = ? AND skill_b_id = ?`,
    [userAId, userBId, skillATeaches, skillBTeaches]
  );
  if (existing.length > 0) {
    return res.json({ success: true, data: { exchangeId: existing[0].id } });
  }

  const [result] = await pool.query(
    `INSERT INTO skill_exchanges (match_id, user_a_id, user_b_id, skill_a_id, skill_b_id)
     VALUES (?, ?, ?, ?, ?)`,
    [matchId, userAId, userBId, skillATeaches, skillBTeaches]
  );
  res.status(201).json({ success: true, data: { exchangeId: result.insertId } });
}

module.exports = { createExchange };
