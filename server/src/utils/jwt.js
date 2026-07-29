const crypto = require('crypto')
const jwtConfig = require('../config/jwt')

function base64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function decodeBase64Url(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64').toString('utf8')
}

function signToken(payload, expiresInSeconds = jwtConfig.accessTokenExpiresInSeconds) {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds
  const body = base64Url(JSON.stringify({ ...payload, exp: expiresAt }))
  const signature = base64Url(
    crypto.createHmac('sha256', jwtConfig.secret).update(`${header}.${body}`).digest()
  )

  return `${header}.${body}.${signature}`
}

function verifyToken(token) {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [header, body, signature] = parts
  const expectedSignature = base64Url(
    crypto.createHmac('sha256', jwtConfig.secret).update(`${header}.${body}`).digest()
  )

  const given = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return null
  }

  try {
    const payload = JSON.parse(decodeBase64Url(body))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch (err) {
    return null
  }
}

module.exports = {
  signToken,
  verifyToken
}
