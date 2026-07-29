const db = require('../../database/connection')

async function create({ courseId, courseTitle, name, email, phone, message }) {
  let resolvedTitle = courseTitle || null

  if (courseId && !resolvedTitle) {
    const course = await db.query('SELECT title FROM courses WHERE id = $1', [courseId])
    resolvedTitle = course.rows[0]?.title || null
  }

  const result = await db.query(
    `INSERT INTO course_applications (course_id, course_title, name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [courseId || null, resolvedTitle, name, email, phone, message || null]
  )
  return result.rows[0]
}

async function findAll() {
  const result = await db.query(
    `SELECT ca.*, c.title AS current_course_title
     FROM course_applications ca
     LEFT JOIN courses c ON c.id = ca.course_id
     ORDER BY ca.id DESC`
  )
  return result.rows
}

async function updateStatus(id, status) {
  const result = await db.query(
    `UPDATE course_applications
     SET status = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [status, id]
  )
  return result.rows[0] || null
}

async function remove(id) {
  const result = await db.query('DELETE FROM course_applications WHERE id = $1', [id])
  return result.rowCount > 0
}

module.exports = {
  create,
  findAll,
  remove,
  updateStatus
}
