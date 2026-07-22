const { pool } = require('../config/db');

async function searchSkills(req, res) {
  const q = (req.query.q || '').trim();
  const params = [];
  let sql = `SELECT s.id, s.name, s.slug, c.name AS category
             FROM skills s JOIN skill_categories c ON c.id = s.category_id
             WHERE s.is_approved = 1`;
  if (q) {
    sql += ' AND MATCH(s.name) AGAINST (? IN NATURAL LANGUAGE MODE)';
    params.push(q);
  }
  sql += ' LIMIT 50';
  const [rows] = await pool.query(sql, params);
  res.json({ success: true, data: rows });
}

async function listMySkills(req, res) {
  const [rows] = await pool.query(
    `SELECT us.id, us.relation_type, us.proficiency, us.years_experience, us.description,
            s.id AS skill_id, s.name AS skill_name
     FROM user_skills us JOIN skills s ON s.id = us.skill_id
     WHERE us.user_id = ?`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
}

async function addSkillToProfile(req, res) {
  const { skillId, relationType, proficiency, yearsExperience, description } = req.body;

  if (!['teaches', 'wants_to_learn'].includes(relationType)) {
    return res.status(400).json({ success: false, message: 'Invalid relationType' });
  }

  await pool.query(
    `INSERT INTO user_skills (user_id, skill_id, relation_type, proficiency, years_experience, description)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE proficiency = VALUES(proficiency),
       years_experience = VALUES(years_experience), description = VALUES(description)`,
    [req.user.id, skillId, relationType, proficiency || null, yearsExperience || null, description || null]
  );

  res.status(201).json({ success: true, message: 'Skill added to profile' });
}

async function removeSkillFromProfile(req, res) {
  await pool.query('DELETE FROM user_skills WHERE id = ? AND user_id = ?', [
    req.params.id,
    req.user.id,
  ]);
  res.json({ success: true, message: 'Skill removed' });
}

module.exports = { searchSkills, listMySkills, addSkillToProfile, removeSkillFromProfile };
