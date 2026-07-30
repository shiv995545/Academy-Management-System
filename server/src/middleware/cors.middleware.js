const corsConfig = require('../config/cors')

function isOriginAllowed(origin) {
  if (!origin) return true
  if (corsConfig.origins.includes(origin)) return true
  // Allow all Vercel deployment origins (production & preview links)
  if (/^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)) return true
  return false
}

function corsMiddleware(req, res, next) {
  const requestOrigin = req.headers.origin

  if (requestOrigin && isOriginAllowed(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin)
  } else if (!requestOrigin) {
    res.header('Access-Control-Allow-Origin', '*')
  } else {
    res.header('Access-Control-Allow-Origin', corsConfig.origins[0])
  }

  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  next()
}

module.exports = corsMiddleware
