const db = require('../../database/connection')

async function create({ name, email, phone, guardianName, address }) {
  const result = await db.query(
    `INSERT INTO students (name, email, phone, guardian_name, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email || null, phone || null, guardianName || null, address || null]
  )
  return result.rows[0]
}

async function findAll() {
  const result = await db.query('SELECT * FROM students ORDER BY id DESC')
  return result.rows
}

async function findById(id) {
  const result = await db.query('SELECT * FROM students WHERE id = $1', [id])
  return result.rows[0] || null
}

async function update(id, { name, email, phone, guardianName, address }) {
  const result = await db.query(
    `UPDATE students
     SET name = COALESCE($1, name),
         email = COALESCE($2, email),
         phone = COALESCE($3, phone),
         guardian_name = COALESCE($4, guardian_name),
         address = COALESCE($5, address)
     WHERE id = $6
     RETURNING *`,
    [name || null, email || null, phone || null, guardianName || null, address || null, id]
  )
  return result.rows[0] || null
}

async function remove(id) {
  const result = await db.query('DELETE FROM students WHERE id = $1', [id])
  return result.rowCount > 0
}

module.exports = {
  create,
  findAll,
  findById,
  remove,
  update
}
