const env = require('./env')

module.exports = {
  secret: env.jwtSecret,
  accessTokenExpiresInSeconds: 60 * 15,
  refreshTokenExpiresInSeconds: 60 * 60 * 24 * 7
}
