const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../config/jwt');

async function register(req, res) {
  const { fullName, email, password, schoolOrOrg, userType } = req.body;
  const resolvedUserType = ['specialist', 'beneficiary'].includes(userType) ? userType : 'beneficiary';

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const uuid = uuidv4();

  const [result] = await pool.query(
    `INSERT INTO users (uuid, full_name, email, password_hash, school_or_org, user_type, oauth_provider)
     VALUES (?, ?, ?, ?, ?, ?, 'local')`,
    [uuid, fullName, email, passwordHash, schoolOrOrg || null, resolvedUserType]
  );

  const tokenPayload = { id: result.insertId, uuid, role: 'user' };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);
  const user = { id: result.insertId, uuid, fullName, email, role: 'user', userType: resolvedUserType };

  res.status(201).json({ success: true, data: { accessToken, refreshToken, user } });
}

async function login(req, res) {
  const { email, password } = req.body;

  const [rows] = await pool.query(
    'SELECT id, uuid, full_name, email, password_hash, role, user_type, status FROM users WHERE email = ?',
    [email]
  );
  const dbUser = rows[0];

  if (!dbUser || !dbUser.password_hash) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (dbUser.status !== 'active') {
    return res.status(403).json({ success: false, message: `Account is ${dbUser.status}` });
  }

  const match = await bcrypt.compare(password, dbUser.password_hash);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [dbUser.id]);

  const payload = { id: dbUser.id, uuid: dbUser.uuid, role: dbUser.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: dbUser.id,
        fullName: dbUser.full_name,
        email: dbUser.email,
        role: dbUser.role,
        userType: dbUser.user_type,
      },
    },
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, message: 'refreshToken is required' });
  }
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const payload = { id: decoded.id, uuid: decoded.uuid, role: decoded.role };
    const accessToken = signAccessToken(payload);
    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
}

module.exports = { register, login, refresh };
