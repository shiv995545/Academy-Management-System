const db = require('../../database/connection')

async function findByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email])
  return result.rows[0] || null
}

async function findPublicById(id) {
  const result = await db.query(
    'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

async function createUser({ name, email, passwordHash, role }) {
  const result = await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, is_active, created_at',
    [name, email, passwordHash, role]
  )
  return result.rows[0]
}

async function updatePassword(userId, passwordHash) {
  const result = await db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email, role, is_active, created_at',
    [passwordHash, userId]
  )
  return result.rows[0] || null
}

async function createRefreshToken({ userId, tokenHash, expiresAt }) {
  await db.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  )
}

async function findRefreshToken(tokenHash) {
  const result = await db.query(
    `SELECT rt.*, u.id AS user_id, u.name, u.email, u.role, u.is_active, u.created_at AS user_created_at
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
    [tokenHash]
  )
  return result.rows[0] || null
}

async function revokeRefreshToken(tokenHash) {
  const result = await db.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
    [tokenHash]
  )
  return result.rowCount > 0
}

async function revokeAllRefreshTokensForUser(userId) {
  await db.query(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
    [userId]
  )
}

async function createPasswordResetToken({ userId, tokenHash, expiresAt }) {
  await db.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  )
}

async function findPasswordResetToken(tokenHash) {
  const result = await db.query(
    `SELECT * FROM password_reset_tokens
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
    [tokenHash]
  )
  return result.rows[0] || null
}

async function markPasswordResetTokenUsed(id) {
  await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [id])
}

async function createAuditLog({ userId, email, action, success, ipAddress, userAgent }) {
  await db.query(
    `INSERT INTO auth_audit_logs (user_id, email, action, success, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId || null, email || null, action, success, ipAddress || null, userAgent || null]
  )
}

async function listAuditLogs(limit = 100) {
  const result = await db.query(
    `SELECT id, user_id, email, action, success, ip_address, user_agent, created_at
     FROM auth_audit_logs
     ORDER BY id DESC
     LIMIT $1`,
    [limit]
  )
  return result.rows
}

module.exports = {
  createAuditLog,
  createPasswordResetToken,
  createRefreshToken,
  createUser,
  findByEmail,
  findPasswordResetToken,
  findPublicById,
  findRefreshToken,
  listAuditLogs,
  markPasswordResetTokenUsed,
  revokeAllRefreshTokensForUser,
  revokeRefreshToken,
  updatePassword
}
