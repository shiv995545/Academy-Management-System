const { Client } = require('pg')
const env = require('../config/env')

const db = new Client(
  env.databaseUrl
    ? {
        connectionString: env.databaseUrl,
        ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined
      }
    : env.database
)

module.exports = db
