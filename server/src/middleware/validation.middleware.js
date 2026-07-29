const { fail } = require('../shared/response/apiResponse')

function validate(requiredFields = []) {
  return (req, res, next) => {
    if (requiredFields && typeof requiredFields.safeParse === 'function') {
      const result = requiredFields.safeParse(req.body || {})

      if (!result.success) {
        return fail(res, 'Validation failed', 400, result.error.flatten().fieldErrors)
      }

      req.body = result.data
      return next()
    }

    const body = req.body || {}
    const missing = requiredFields.filter((field) => body[field] === undefined || body[field] === '')

    if (missing.length > 0) {
      return fail(res, `Missing required field(s): ${missing.join(', ')}`, 400)
    }

    next()
  }
}

module.exports = validate