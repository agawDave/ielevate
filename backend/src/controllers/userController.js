const { pool } = require('../config/db');

async function getMyProfile(req, res) {
  const [rows] = await pool.query(
    `SELECT id, full_name, email, avatar_url, bio, school_or_org, wallet_address, user_type, created_at
     FROM users WHERE id = ?`,
    [req.user.id]
  );
  res.json({ success: true, data: rows[0] });
}

async function updateMyProfile(req, res) {
  const { fullName, bio, schoolOrOrg, avatarUrl, walletAddress } = req.body;
  await pool.query(
    `UPDATE users SET full_name = COALESCE(?, full_name), bio = COALESCE(?, bio),
       school_or_org = COALESCE(?, school_or_org), avatar_url = COALESCE(?, avatar_url),
       wallet_address = COALESCE(?, wallet_address)
     WHERE id = ?`,
    [fullName, bio, schoolOrOrg, avatarUrl, walletAddress, req.user.id]
  );
  res.json({ success: true, message: 'Profile updated' });
}

async function getPublicProfile(req, res) {
  const [rows] = await pool.query(
    `SELECT id, full_name, avatar_url, bio, school_or_org, user_type, created_at FROM users WHERE id = ?`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: rows[0] });
}

module.exports = { getMyProfile, updateMyProfile, getPublicProfile };
