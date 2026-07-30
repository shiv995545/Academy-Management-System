const corsConfig = require('../config/cors')

function isOriginAllowed(origin) {
  if (!origin) return false
  if (corsConfig.origins.includes(origin)) return true
  // Allow all Vercel deployment origins (production & preview links)
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) return true
  return false
}

function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin
  const allowedOrigin = isOriginAllowed(requestOrigin)
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
