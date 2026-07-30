const { Client } = require('pg')
const env = require('../config/env')

function getDbConfig() {
  if (env.databaseUrl) {
    const isSslNeeded = env.nodeEnv === 'production' || env.databaseUrl.includes('sslmode=') || env.databaseUrl.includes('neon.tech')
    return {
      connectionString: env.databaseUrl,
      ssl: isSslNeeded ? { rejectUnauthorized: false } : undefined
    }
  }
  return env.database
}

const db = new Client(getDbConfig())

module.exports = db
