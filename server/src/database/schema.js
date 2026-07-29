const db = require('./connection')
const env = require('../config/env')
const { hashPassword } = require('../utils/password')

async function createTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'teacher', 'student'));

    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160),
      phone VARCHAR(30),
      guardian_name VARCHAR(120),
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(160) NOT NULL,
      description TEXT,
      category VARCHAR(80),
      subject VARCHAR(120),
      class_level INTEGER,
      fee NUMERIC(10, 2) DEFAULT 0,
      duration VARCHAR(80),
      details TEXT,
      image_url TEXT,
      class_count INTEGER,
      start_date DATE,
      teacher_name VARCHAR(120),
      batch_timing VARCHAR(160),
      available_seats INTEGER,
      tags TEXT,
      syllabus TEXT,
      is_upcoming BOOLEAN DEFAULT false,
      is_featured BOOLEAN DEFAULT true,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(80);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS subject VARCHAR(120);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS class_level INTEGER;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration VARCHAR(80);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS details TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS class_count INTEGER;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS start_date DATE;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS teacher_name VARCHAR(120);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS batch_timing VARCHAR(160);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS available_seats INTEGER;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS syllabus TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_upcoming BOOLEAN DEFAULT false;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT true;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

    CREATE TABLE IF NOT EXISTS class_levels (
      id SERIAL PRIMARY KEY,
      value INTEGER UNIQUE NOT NULL,
      label VARCHAR(80) UNIQUE NOT NULL,
      stage VARCHAR(120),
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO class_levels (value, label, stage, sort_order)
    SELECT value, label, stage, value
    FROM (
      VALUES
        (1, 'Class 1', 'Foundation focus'),
        (2, 'Class 2', 'Foundation focus'),
        (3, 'Class 3', 'Foundation focus'),
        (4, 'Class 4', 'Foundation focus'),
        (5, 'Class 5', 'Foundation focus'),
        (6, 'Class 6', 'Concept building'),
        (7, 'Class 7', 'Concept building'),
        (8, 'Class 8', 'Concept building'),
        (9, 'Class 9', 'Board prep'),
        (10, 'Class 10', 'Board prep')
    ) AS seed(value, label, stage)
    ON CONFLICT (value) DO NOTHING;

    CREATE TABLE IF NOT EXISTS batches (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
      teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      schedule VARCHAR(160),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      batch_id INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      status VARCHAR(30) DEFAULT 'active',
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (student_id, batch_id)
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS auth_audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      email VARCHAR(160),
      action VARCHAR(80) NOT NULL,
      success BOOLEAN NOT NULL,
      ip_address VARCHAR(80),
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      subject VARCHAR(120) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_applications (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
      course_title VARCHAR(160),
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      message TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resource_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) UNIQUE NOT NULL,
      slug VARCHAR(140) UNIQUE NOT NULL,
      description TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resource_tags (
      id SERIAL PRIMARY KEY,
      name VARCHAR(80) UNIQUE NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      description TEXT,
      subject VARCHAR(120),
      class_level INTEGER,
      thumbnail_url TEXT,
      file_url TEXT,
      original_file_name VARCHAR(240),
      storage_key TEXT,
      mime_type VARCHAR(120),
      file_size INTEGER,
      category_id INTEGER REFERENCES resource_categories(id) ON DELETE SET NULL,
      uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      uploader_role VARCHAR(20) NOT NULL CHECK (uploader_role IN ('admin', 'teacher')),
      resource_type VARCHAR(30) NOT NULL DEFAULT 'pdf',
      visibility VARCHAR(30) NOT NULL DEFAULT 'public',
      status VARCHAR(30) NOT NULL DEFAULT 'active',
      views INTEGER NOT NULL DEFAULT 0,
      downloads INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE resources ADD COLUMN IF NOT EXISTS class_level INTEGER;

    CREATE TABLE IF NOT EXISTS resource_tag_map (
      resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES resource_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (resource_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS resource_activity_logs (
      id SERIAL PRIMARY KEY,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      actor_role VARCHAR(20),
      resource_id INTEGER REFERENCES resources(id) ON DELETE SET NULL,
      action VARCHAR(80) NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS resources_uploaded_by_idx ON resources(uploaded_by);
    CREATE INDEX IF NOT EXISTS resources_status_idx ON resources(status);
    CREATE INDEX IF NOT EXISTS resources_category_idx ON resources(category_id);
  `)
}

async function seedAdmin() {
  const existingAdmin = await db.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin'])
  if (existingAdmin.rows.length > 0) return

  await db.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
    ['Admin', env.adminEmail, hashPassword(env.adminPassword), 'admin']
  )

  console.log(`Default admin created: ${env.adminEmail} / ${env.adminPassword}`)
}

module.exports = {
  createTables,
  seedAdmin
}
