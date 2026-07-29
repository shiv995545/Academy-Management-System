const env = require('./env')

module.exports = {
  origins: env.clientOrigins,
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  headers: 'Content-Type, Authorization'
}
