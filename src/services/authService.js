const jwt = require('jsonwebtoken');

class AuthService {
  /**
   * Login user dan generate JWT token
   */
  async login(username, password) {
    try {
      // Ambil credentials dari environment variables
      const validUsername = process.env.AUTH_USERNAME || 'Sysdev@2025';
      const validPassword = process.env.AUTH_PASSWORD || 'Cibinong';

      // Validasi credentials
      if (username !== validUsername || password !== validPassword) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          username: username,
          loginAt: new Date().toISOString()
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return {
        success: true,
        message: 'Login successful',
        token: token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    return new Promise((resolve) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          resolve({
            success: false,
            message: 'Token invalid or expired',
            error: err.message
          });
        } else {
          resolve({
            success: true,
            message: 'Token is valid',
            data: decoded
          });
        }
      });
    });
  }
}

module.exports = new AuthService();
