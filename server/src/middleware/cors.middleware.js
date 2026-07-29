const corsConfig = require('../config/cors')

function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin
  const allowedOrigin = corsConfig.origins.includes(requestOrigin)
    ? requestOrigin
    : corsConfig.origins[0]

  res.header('Access-Control-Allow-Origin', allowedOrigin)
  res.header('Access-Control-Allow-Methods', corsConfig.methods)
  res.header('Access-Control-Allow-Headers', corsConfig.headers)
  res.header('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
}

module.exports = corsMiddleware
