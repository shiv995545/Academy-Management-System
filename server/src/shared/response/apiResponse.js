function success(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    ...data
  })
}

function fail(res, message, statusCode = 400, details = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {})
  })
}

module.exports = {
  fail,
  success
}
