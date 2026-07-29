const crypto = require('crypto')
const jwtConfig = require('../../config/jwt')
const { signToken, verifyToken } = require('../../utils/jwt')

function createAccessToken(user) {
  return signToken({
    id: user.id,
    role: user.role
  })
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString('hex')
}

function createPasswordResetToken() {
  return crypto.randomBytes(32).toString('hex')
}

function hashOpaqueToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function getRefreshTokenExpiry() {
  return new Date(Date.now() + jwtConfig.refreshTokenExpiresInSeconds * 1000)
}

function getPasswordResetExpiry() {
  return new Date(Date.now() + 1000 * 60 * 30)
}

module.exports = {
  createAccessToken,
  createPasswordResetToken,
  createRefreshToken,
  getPasswordResetExpiry,
  getRefreshTokenExpiry,
  hashOpaqueToken,
  verifyToken
}
