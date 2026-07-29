const db = require('../../database/connection')

async function create({ value, label, stage, sortOrder, isActive = true }) {
  const result = await db.query(
    `INSERT INTO class_levels (value, label, stage, sort_order, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [value, label, stage || null, sortOrder ?? value, isActive]
  )
  return result.rows[0]
}

async function findAll({ publicOnly = false } = {}) {
  const where = publicOnly ? 'WHERE is_active = true' : ''
  const result = await db.query(
    `SELECT * FROM class_levels
     ${where}
     ORDER BY sort_order ASC, value ASC`
  )
  return result.rows
}

async function update(id, { value, label, stage, sortOrder, isActive }) {
  const result = await db.query(
    `UPDATE class_levels
     SET value = COALESCE($1, value),
         label = COALESCE($2, label),
         stage = COALESCE($3, stage),
         sort_order = COALESCE($4, sort_order),
         is_active = COALESCE($5, is_active),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [value ?? null, label || null, stage || null, sortOrder ?? null, isActive ?? null, id]
  )
  return result.rows[0] || null
}

async function remove(id) {
  const result = await db.query('DELETE FROM class_levels WHERE id = $1', [id])
  return result.rowCount > 0
}

module.exports = {
  create,
  findAll,
  remove,
  update
}
