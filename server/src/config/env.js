require('dotenv').config()

function parseClientOrigins() {
  const defaultOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5174',
    'https://dist-gray-kappa-26.vercel.app',
    'https://dist-q3jf91a7a-shiv-eff1.vercel.app',
    'https://dist-3v8c3d22e-shiv-eff1.vercel.app'
  ]
  const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return [...new Set([...defaultOrigins, ...configuredOrigins])]
}

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: parseClientOrigins(),
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@coaching.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  databaseUrl: process.env.DATABASE_URL,
  database: {
    user: process.env.DB_USER || 'shivamgupta',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'demopost',
    password: process.env.DB_PASSWORD || '1234',
    port: Number(process.env.DB_PORT || 5432)
  }
}
