const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization header required.'
      });
    }

    // Format: "Bearer <token>"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Token format invalid. Use: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: 'Token invalid or expired',
          error: err.message
        });
      }

      // Simpan decoded token ke request
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error authenticating token',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
