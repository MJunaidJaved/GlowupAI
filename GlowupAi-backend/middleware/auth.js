const jwt = require('jsonwebtoken')

const authenticateToken = (req, res, next) => {
  // The frontend sends the token in the Authorization header
  // Format is: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }

  try {
    // Verify the token using your secret key
    // If the token is fake, expired, or tampered with, this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Attach the user info to the request object
    // Now every route that uses this middleware can access req.user.id
    req.user = decoded
    
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' })
  }
}

module.exports = authenticateToken
