const db = require('../../database/connection')

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function mapResource(row) {
  if (!row) return null
  return {
    ...row,
    tags: row.tags || []
  }
}

async function ensureCategory(name, actorId = null, description = null) {
  const slug = slugify(name)
  const existing = await db.query('SELECT * FROM resource_categories WHERE slug = $1', [slug])
  if (existing.rows[0]) return existing.rows[0]

  const result = await db.query(
    `INSERT INTO resource_categories (name, slug, description, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, slug, description || null, actorId]
  )
  return result.rows[0]
}

async function ensureTag(name) {
  const slug = slugify(name)
  const existing = await db.query('SELECT * FROM resource_tags WHERE slug = $1', [slug])
  if (existing.rows[0]) return existing.rows[0]

  const result = await db.query(
    'INSERT INTO resource_tags (name, slug) VALUES ($1, $2) RETURNING *',
    [name, slug]
  )
  return result.rows[0]
}

async function syncTags(resourceId, tags = []) {
  await db.query('DELETE FROM resource_tag_map WHERE resource_id = $1', [resourceId])

  for (const tagName of tags.filter(Boolean)) {
    const tag = await ensureTag(tagName)
    await db.query(
      `INSERT INTO resource_tag_map (resource_id, tag_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [resourceId, tag.id]
    )
  }
}

function baseResourceSelect() {
  return `
    SELECT
      r.*,
      c.name AS category,
      c.slug AS category_slug,
      u.name AS uploader_name,
      COALESCE(array_remove(array_agg(t.name), NULL), '{}') AS tags
    FROM resources r
    LEFT JOIN resource_categories c ON c.id = r.category_id
    LEFT JOIN users u ON u.id = r.uploaded_by
    LEFT JOIN resource_tag_map rtm ON rtm.resource_id = r.id
    LEFT JOIN resource_tags t ON t.id = rtm.tag_id
  `
}

async function findById(id) {
  const result = await db.query(
    `${baseResourceSelect()}
     WHERE r.id = $1
     GROUP BY r.id, c.name, c.slug, u.name`,
    [id]
  )
  return mapResource(result.rows[0])
}

async function findAll(filters = {}) {
  const where = []
  const values = []

  function add(condition, value) {
    values.push(value)
    where.push(condition.replace('?', `$${values.length}`))
  }

  if (filters.publicOnly) {
    where.push("r.visibility = 'public'")
    where.push("r.status = 'active'")
  }

  if (filters.status) add('r.status = ?', filters.status)
  if (filters.visibility) add('r.visibility = ?', filters.visibility)
  if (filters.uploadedBy) add('r.uploaded_by = ?', filters.uploadedBy)
  if (filters.category) {
    values.push(filters.category, filters.category)
    where.push(`(c.slug = $${values.length - 1} OR c.name = $${values.length})`)
  }
  if (filters.subject) add('LOWER(r.subject) = LOWER(?)', filters.subject)
  if (filters.teacherId) add('r.uploaded_by = ?', filters.teacherId)

  if (filters.search) {
    values.push(`%${filters.search}%`)
    where.push(
      `(r.title ILIKE $${values.length} OR r.description ILIKE $${values.length} OR r.subject ILIKE $${values.length})`
    )
  }

  if (filters.tag) {
    values.push(filters.tag)
    where.push(`EXISTS (
      SELECT 1 FROM resource_tag_map rtm2
      JOIN resource_tags t2 ON t2.id = rtm2.tag_id
      WHERE rtm2.resource_id = r.id AND (t2.slug = $${values.length} OR t2.name = $${values.length})
    )`)
  }

  const limit = Math.min(Number(filters.limit || 30), 100)
  const offset = Math.max(Number(filters.offset || 0), 0)
  values.push(limit, offset)

  const result = await db.query(
    `${baseResourceSelect()}
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     GROUP BY r.id, c.name, c.slug, u.name
     ORDER BY r.created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  )

  return result.rows.map(mapResource)
}

async function create(payload, actor) {
  const category = await ensureCategory(payload.category, actor.id)
  const result = await db.query(
    `INSERT INTO resources (
      title, description, subject, class_level, thumbnail_url, file_url, original_file_name, storage_key,
      mime_type, file_size, category_id, uploaded_by, uploader_role, resource_type, visibility, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      payload.title,
      payload.description || null,
      payload.subject || null,
      payload.classLevel || null,
      payload.thumbnailUrl || null,
      payload.fileUrl || null,
      payload.originalFileName || null,
      payload.storageKey || null,
      payload.mimeType || null,
      payload.fileSize || null,
      category.id,
      actor.id,
      actor.role,
      payload.resourceType || 'pdf',
      payload.visibility || 'public',
      payload.status || 'active'
    ]
  )

  await syncTags(result.rows[0].id, payload.tags || [])
  return findById(result.rows[0].id)
}

async function update(id, payload) {
  let categoryId = null
  if (payload.category) {
    const category = await ensureCategory(payload.category)
    categoryId = category.id
  }

  const result = await db.query(
    `UPDATE resources
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         subject = COALESCE($3, subject),
         class_level = COALESCE($4, class_level),
         thumbnail_url = COALESCE($5, thumbnail_url),
         file_url = COALESCE($6, file_url),
         original_file_name = COALESCE($7, original_file_name),
         storage_key = COALESCE($8, storage_key),
         mime_type = COALESCE($9, mime_type),
         file_size = COALESCE($10, file_size),
         category_id = COALESCE($11, category_id),
         resource_type = COALESCE($12, resource_type),
         visibility = COALESCE($13, visibility),
         status = COALESCE($14, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $15
     RETURNING *`,
    [
      payload.title || null,
      payload.description || null,
      payload.subject || null,
      payload.classLevel || null,
      payload.thumbnailUrl || null,
      payload.fileUrl || null,
      payload.originalFileName || null,
      payload.storageKey || null,
      payload.mimeType || null,
      payload.fileSize ?? null,
      categoryId,
      payload.resourceType || null,
      payload.visibility || null,
      payload.status || null,
      id
    ]
  )

  if (!result.rows[0]) return null
  if (payload.tags) await syncTags(id, payload.tags)
  return findById(id)
}

async function remove(id) {
  const result = await db.query('DELETE FROM resources WHERE id = $1', [id])
  return result.rowCount > 0
}

async function updateStatus(id, status) {
  const result = await db.query(
    'UPDATE resources SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [status, id]
  )
  return result.rows[0] ? findById(id) : null
}

async function incrementCounter(id, column) {
  if (!['views', 'downloads'].includes(column)) return null
  const result = await db.query(
    `UPDATE resources SET ${column} = ${column} + 1 WHERE id = $1 RETURNING ${column}`,
    [id]
  )
  return result.rows[0] || null
}

async function listCategories() {
  const result = await db.query('SELECT * FROM resource_categories ORDER BY name ASC')
  return result.rows
}

async function createCategory({ name, description }, actorId) {
  return ensureCategory(name, actorId, description)
}

async function updateCategory(id, { name, description }) {
  const slug = name ? slugify(name) : null
  const result = await db.query(
    `UPDATE resource_categories
     SET name = COALESCE($1, name),
         slug = COALESCE($2, slug),
         description = COALESCE($3, description),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $4
     RETURNING *`,
    [name || null, slug, description || null, id]
  )
  return result.rows[0] || null
}

async function deleteCategory(id) {
  const result = await db.query('DELETE FROM resource_categories WHERE id = $1', [id])
  return result.rowCount > 0
}

async function listTags() {
  const result = await db.query('SELECT * FROM resource_tags ORDER BY name ASC')
  return result.rows
}

async function logActivity({ actor, resourceId = null, action, metadata = {} }) {
  const result = await db.query(
    `INSERT INTO resource_activity_logs (actor_id, actor_role, resource_id, action, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [actor?.id || null, actor?.role || null, resourceId, action, metadata]
  )
  return result.rows[0]
}

async function listActivity(filters = {}) {
  const values = []
  const where = []
  if (filters.actorId) {
    values.push(filters.actorId)
    where.push(`ral.actor_id = $${values.length}`)
  }

  const result = await db.query(
    `SELECT ral.*, u.name AS actor_name, r.title AS resource_title
     FROM resource_activity_logs ral
     LEFT JOIN users u ON u.id = ral.actor_id
     LEFT JOIN resources r ON r.id = ral.resource_id
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY ral.created_at DESC
     LIMIT 60`,
    values
  )
  return result.rows
}

async function stats(filters = {}) {
  const values = []
  const where = []
  if (filters.uploadedBy) {
    values.push(filters.uploadedBy)
    where.push(`uploaded_by = $${values.length}`)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const result = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'active')::int AS active,
       COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
       COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected,
       COALESCE(SUM(views), 0)::int AS views,
       COALESCE(SUM(downloads), 0)::int AS downloads
     FROM resources
     ${whereSql}`,
    values
  )
  return result.rows[0]
}

module.exports = {
  create,
  createCategory,
  deleteCategory,
  findAll,
  findById,
  incrementCounter,
  listActivity,
  listCategories,
  listTags,
  logActivity,
  remove,
  stats,
  update,
  updateCategory,
  updateStatus
}
