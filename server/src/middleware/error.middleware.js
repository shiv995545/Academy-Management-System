const { fail } = require('../shared/response/apiResponse')

function notFound(req, res) {
  return fail(res, 'Route not found', 404)
}

function errorHandler(err, req, res, next) {
  console.error(err)

  if (err.code === '23505') {
    return fail(res, 'This record already exists', 409)
  }

  if (err.code === '23503') {
    return fail(res, 'Related record was not found', 400)
  }

  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : err.message || 'Something went wrong'

  return fail(res, message, statusCode)
}

module.exports = {
  errorHandler,
  notFound
}
