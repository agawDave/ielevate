const { pool } = require('../config/db');

/**
 * Bidirectional matching:
 * Find users where (they teach something I want to learn) AND
 * (I teach something they want to learn).
 *
 * Returns candidate matches with a simple overlap-based score.
 * Score can later be extended with proficiency weighting, ratings, recency, etc.
 */
async function findMatchesForUser(userId, { limit = 20 } = {}) {
  const [rows] = await pool.query(
    `
    SELECT
      other.id                 AS candidate_id,
      other.full_name          AS candidate_name,
      other.avatar_url         AS candidate_avatar,
      other_teaches.skill_id   AS skill_they_teach_i_want,
      they_teach_skill.name    AS skill_they_teach_i_want_name,
      my_teaches.skill_id      AS skill_i_teach_they_want,
      i_teach_skill.name       AS skill_i_teach_they_want_name
    FROM user_skills my_wants
    JOIN user_skills other_teaches
      ON other_teaches.skill_id = my_wants.skill_id
     AND other_teaches.relation_type = 'teaches'
     AND other_teaches.user_id != my_wants.user_id
    JOIN user_skills my_teaches
      ON my_teaches.user_id = my_wants.user_id
     AND my_teaches.relation_type = 'teaches'
    JOIN user_skills other_wants
      ON other_wants.user_id = other_teaches.user_id
     AND other_wants.relation_type = 'wants_to_learn'
     AND other_wants.skill_id = my_teaches.skill_id
    JOIN users other
      ON other.id = other_teaches.user_id
    JOIN skills they_teach_skill ON they_teach_skill.id = other_teaches.skill_id
    JOIN skills i_teach_skill ON i_teach_skill.id = my_teaches.skill_id
    WHERE my_wants.user_id = ?
      AND my_wants.relation_type = 'wants_to_learn'
    GROUP BY candidate_id, candidate_name, candidate_avatar, skill_they_teach_i_want,
             skill_they_teach_i_want_name, skill_i_teach_they_want, skill_i_teach_they_want_name
    LIMIT ?
    `,
    [userId, limit]
  );

  // Score = number of overlapping skill pairs per candidate (simple v1 heuristic)
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.candidate_id]) {
      grouped[row.candidate_id] = {
        candidateId: row.candidate_id,
        candidateName: row.candidate_name,
        candidateAvatar: row.candidate_avatar,
        pairs: [],
      };
    }
    grouped[row.candidate_id].pairs.push({
      theyTeach: row.skill_they_teach_i_want,
      theyTeachName: row.skill_they_teach_i_want_name,
      iTeach: row.skill_i_teach_they_want,
      iTeachName: row.skill_i_teach_they_want_name,
    });
  }

  return Object.values(grouped)
    .map((m) => ({ ...m, score: m.pairs.length }))
    .sort((a, b) => b.score - a.score);
}

async function persistMatch(userAId, userBId, skillATeaches, skillBTeaches, score) {
  await pool.query(
    `INSERT INTO matches (user_a_id, user_b_id, skill_a_teaches, skill_b_teaches, match_score, status)
     VALUES (?, ?, ?, ?, ?, 'accepted')
     ON DUPLICATE KEY UPDATE match_score = VALUES(match_score), updated_at = NOW()`,
    [userAId, userBId, skillATeaches, skillBTeaches, score]
  );
  const [rows] = await pool.query(
    `SELECT id FROM matches WHERE user_a_id = ? AND user_b_id = ?
       AND skill_a_teaches = ? AND skill_b_teaches = ?`,
    [userAId, userBId, skillATeaches, skillBTeaches]
  );
  return rows[0].id;
}

module.exports = { findMatchesForUser, persistMatch };
