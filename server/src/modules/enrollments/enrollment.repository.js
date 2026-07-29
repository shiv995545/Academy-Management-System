const db = require('../../database/connection')

async function create({ studentId, batchId, status }) {
  const result = await db.query(
    `INSERT INTO enrollments (student_id, batch_id, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [studentId, batchId, status || 'active']
  )
  return result.rows[0]
}

async function findAllForUser(user) {
  const params = []
  let teacherFilter = ''

  if (user.role === 'teacher') {
    params.push(user.id)
    teacherFilter = 'WHERE b.teacher_id = $1'
  }

  const result = await db.query(
    `SELECT e.*, s.name AS student_name, b.name AS batch_name, c.title AS course_title
     FROM enrollments e
     JOIN students s ON s.id = e.student_id
     JOIN batches b ON b.id = e.batch_id
     LEFT JOIN courses c ON c.id = b.course_id
     ${teacherFilter}
     ORDER BY e.id DESC`,
    params
  )
  return result.rows
}

async function remove(id) {
  const result = await db.query('DELETE FROM enrollments WHERE id = $1', [id])
  return result.rowCount > 0
}

module.exports = {
  create,
  findAllForUser,
  remove
}
