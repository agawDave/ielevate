const { findMatchesForUser } = require('../services/matchingService');

async function getMyMatches(req, res) {
  const matches = await findMatchesForUser(req.user.id, { limit: 30 });
  res.json({ success: true, data: matches });
}

module.exports = { getMyMatches };
