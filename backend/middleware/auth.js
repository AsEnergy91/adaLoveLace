const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization

  if (!header) {
    return res.status(401).json({ error: 'Token manquant' })
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, 'clesecrete2026')
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré' })
  }
}

module.exports = authMiddleware