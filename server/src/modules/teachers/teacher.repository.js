const db = require('../../database/connection')
const { ROLES } = require('../auth/auth.constants')

async function findAll() {
  const result = await db.query(
    'SELECT id, name, email, role, created_at FROM users WHERE role = $1 ORDER BY id DESC',
    [ROLES.TEACHER]
  )
  return result.rows
}

async function update(id, { name, email, passwordHash }) {
  const result = await db.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         password_hash = COALESCE($3, password_hash)
     WHERE id = $4 AND role = 'teacher'
     RETURNING id, name, email, role, created_at`,
    [name || null, email || null, passwordHash || null, id]
  )
  return result.rows[0] || null
}

async function remove(id) {
  const result = await db.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, ROLES.TEACHER])
  return result.rowCount > 0
}

module.exports = {
  findAll,
  remove,
  update
}
