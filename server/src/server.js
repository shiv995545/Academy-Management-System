const app = require('./app')
const env = require('./config/env')
const db = require('./database/connection')
const { createTables, seedAdmin } = require('./database/schema')

async function startServer() {
  await db.connect()
  console.log('Connected to PostgreSQL')

  await createTables()
  await seedAdmin()

  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`)
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
