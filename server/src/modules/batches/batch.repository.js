const db = require('../../database/connection')

async function create({ name, courseId, teacherId, schedule }) {
  const result = await db.query(
    `INSERT INTO batches (name, course_id, teacher_id, schedule)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, courseId || null, teacherId || null, schedule || null]
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
    `SELECT b.*, c.title AS course_title, u.name AS teacher_name
     FROM batches b
     LEFT JOIN courses c ON c.id = b.course_id
     LEFT JOIN users u ON u.id = b.teacher_id
     ${teacherFilter}
     ORDER BY b.id DESC`,
    params
  )
  return result.rows
}

async function findPublic() {
  const result = await db.query(
    `SELECT b.*, c.title AS course_title, c.category AS course_category, u.name AS teacher_name
     FROM batches b
     LEFT JOIN courses c ON c.id = b.course_id
     LEFT JOIN users u ON u.id = b.teacher_id
     ORDER BY b.id DESC`
  )
  return result.rows
}

async function update(id, { name, courseId, teacherId, schedule }) {
  const result = await db.query(
    `UPDATE batches
     SET name = COALESCE($1, name),
         course_id = COALESCE($2, course_id),
         teacher_id = COALESCE($3, teacher_id),
         schedule = COALESCE($4, schedule)
     WHERE id = $5
     RETURNING *`,
    [name || null, courseId || null, teacherId || null, schedule || null, id]
  )
  return result.rows[0] || null
}

async function remove(id) {
  const result = await db.query('DELETE FROM batches WHERE id = $1', [id])
  return result.rowCount > 0
}

async function isOwnedByTeacher(batchId, teacherId) {
  const result = await db.query('SELECT id FROM batches WHERE id = $1 AND teacher_id = $2', [
    batchId,
    teacherId
  ])
  return result.rows.length > 0
}

module.exports = {
  create,
  findPublic,
  findAllForUser,
  isOwnedByTeacher,
  remove,
  update
}
