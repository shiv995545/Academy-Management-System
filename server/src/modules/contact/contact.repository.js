const db = require('../../database/connection')

async function create({ name, email, phone, subject, message }) {
  const result = await db.query(
    `INSERT INTO contact_messages (name, email, phone, subject, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, email, phone, subject, message]
  )
  return result.rows[0]
}

module.exports = {
  create
}
