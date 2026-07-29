const { fail } = require('../shared/response/apiResponse')

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return fail(res, 'You do not have permission for this action', 403)
    }

    next()
  }
}

module.exports = authorize
