const { pool } = require('../config/db');
const { findMatchesForUser } = require('../services/matchingService');

async function getSummary(req, res) {
  const userId = req.user.id;

  const [[{ activeExchanges }]] = await pool.query(
    `SELECT COUNT(*) AS activeExchanges FROM skill_exchanges
     WHERE (user_a_id = ? OR user_b_id = ?)
       AND status IN ('proposed', 'scheduled', 'in_progress')`,
    [userId, userId]
  );

  const [[{ credentialsEarned }]] = await pool.query(
    `SELECT COUNT(*) AS credentialsEarned FROM credentials
     WHERE recipient_id = ? AND status = 'minted'`,
    [userId]
  );

  const pendingMatches = await findMatchesForUser(userId, { limit: 100 });

  res.json({
    success: true,
    data: {
      activeExchanges,
      pendingMatches: pendingMatches.length,
      credentialsEarned,
    },
  });
}

module.exports = { getSummary };
