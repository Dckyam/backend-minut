const authService = require('../services/authService');

class AuthController {
  /**
   * Login user dan generate JWT token
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Validasi input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Proses login melalui service
      const result = await authService.login(username, password);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during login',
        error: error.message
      });
    }
  }

  /**
   * Verify JWT token
   */
  async verify(req, res) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.split(' ')[1];
      const result = await authService.verifyToken(token);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({
        success: false,
        message: 'Error verifying token',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
