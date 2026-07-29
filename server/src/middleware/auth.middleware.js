const authRepository = require('../modules/auth/auth.repository')
const { fail } = require('../shared/response/apiResponse')
const { AUTH_MESSAGES } = require('../modules/auth/auth.constants')
const { verifyToken } = require('../modules/auth/auth.tokens')

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return fail(res, AUTH_MESSAGES.TOKEN_REQUIRED, 401)
    }

    const payload = verifyToken(token)
    if (!payload) {
      return fail(res, AUTH_MESSAGES.TOKEN_INVALID, 401)
    }

    const user = await authRepository.findPublicById(payload.id)
    if (!user) {
      return fail(res, AUTH_MESSAGES.USER_NOT_FOUND, 401)
    }

    if (!user.is_active) {
      return fail(res, AUTH_MESSAGES.ACCOUNT_DISABLED, 403)
    }

    req.user = user
    return next()
  } catch (err) {
    return next(err)
  }
}

module.exports = authenticate
