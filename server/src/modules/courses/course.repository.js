const db = require('../../database/connection')

function mapCourseRow(row) {
  if (!row) return null

  return {
    ...row,
    imageUrl: row.image_url,
    classLevel: row.class_level,
    classCount: row.class_count,
    startDate: row.start_date,
    teacherName: row.teacher_name,
    batchTiming: row.batch_timing,
    availableSeats: row.available_seats,
    isUpcoming: row.is_upcoming,
    isFeatured: row.is_featured
  }
}

async function create({
  title,
  description,
  category,
  subject,
  classLevel,
  fee,
  duration,
  details,
  imageUrl,
  classCount,
  startDate,
  teacherName,
  batchTiming,
  availableSeats,
  tags,
  syllabus,
  isUpcoming = false,
  isFeatured = true
}) {
  const result = await db.query(
    `INSERT INTO courses (
       title, description, category, subject, class_level, fee, duration, details, image_url,
       class_count, start_date, teacher_name, batch_timing, available_seats, tags, syllabus,
       is_upcoming, is_featured
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING *`,
    [
      title,
      description || null,
      category || null,
      subject || null,
      classLevel || null,
      fee || 0,
      duration || null,
      details || null,
      imageUrl || null,
      classCount || null,
      startDate || null,
      teacherName || null,
      batchTiming || null,
      availableSeats ?? null,
      tags || null,
      syllabus || null,
      isUpcoming,
      isFeatured
    ]
  )
  return mapCourseRow(result.rows[0])
}

async function findAll() {
  const result = await db.query('SELECT * FROM courses ORDER BY id DESC')
  return result.rows.map(mapCourseRow)
}

async function findFeatured() {
  const result = await db.query(
    `SELECT *
     FROM courses
     WHERE is_featured = true
     ORDER BY id DESC`
  )
  return result.rows.map(mapCourseRow)
}

async function findPublic() {
  const result = await db.query('SELECT * FROM courses ORDER BY id DESC')
  return result.rows.map(mapCourseRow)
}

async function update(id, {
  title,
  description,
  category,
  subject,
  classLevel,
  fee,
  duration,
  details,
  imageUrl,
  classCount,
  startDate,
  teacherName,
  batchTiming,
  availableSeats,
  tags,
  syllabus,
  isUpcoming,
  isFeatured
}) {
  const result = await db.query(
    `UPDATE courses
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         category = COALESCE($3, category),
         subject = COALESCE($4, subject),
         class_level = COALESCE($5, class_level),
         fee = COALESCE($6, fee),
         duration = COALESCE($7, duration),
         details = COALESCE($8, details),
         image_url = COALESCE($9, image_url),
         class_count = COALESCE($10, class_count),
         start_date = COALESCE($11, start_date),
         teacher_name = COALESCE($12, teacher_name),
         batch_timing = COALESCE($13, batch_timing),
         available_seats = COALESCE($14, available_seats),
         tags = COALESCE($15, tags),
         syllabus = COALESCE($16, syllabus),
         is_upcoming = COALESCE($17, is_upcoming),
         is_featured = COALESCE($18, is_featured),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $19
     RETURNING *`,
    [
      title || null,
      description || null,
      category || null,
      subject || null,
      classLevel ?? null,
      fee ?? null,
      duration || null,
      details || null,
      imageUrl || null,
      classCount ?? null,
      startDate || null,
      teacherName || null,
      batchTiming || null,
      availableSeats ?? null,
      tags || null,
      syllabus || null,
      isUpcoming ?? null,
      isFeatured ?? null,
      id
    ]
  )
  return mapCourseRow(result.rows[0])
}

async function remove(id) {
  const result = await db.query('DELETE FROM courses WHERE id = $1', [id])
  return result.rowCount > 0
}

module.exports = {
  create,
  findFeatured,
  findPublic,
  findAll,
  remove,
  update
}
