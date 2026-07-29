const crypto = require('crypto')
const { promisify } = require('util')

const pbkdf2 = promisify(crypto.pbkdf2)

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

async function verifyPassword(password, savedHash) {
  const [salt, originalHash] = savedHash.split(':')
  const hash = (await pbkdf2(password, salt, 100000, 64, 'sha512')).toString('hex')
  const given = Buffer.from(hash)
  const expected = Buffer.from(originalHash)

  return given.length === expected.length && crypto.timingSafeEqual(given, expected)
}

module.exports = {
  hashPassword,
  verifyPassword
}
