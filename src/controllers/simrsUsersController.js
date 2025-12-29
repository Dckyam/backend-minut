const simrsUsersService = require('../services/simrsUsersService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Controller untuk menangani request terkait users dari SIMRS
 * Hanya untuk mendapatkan list users untuk menu access
 */
class SimrsUsersController {
  /**
   * @route   GET /api/simrs/users/for-menu-access
   * @desc    Get users list for menu access (hanya nama_asli)
   * @access  Protected (JWT required)
   *
   * Return format: [{ nama_asli: "..." }, ...]
   * Digunakan untuk load all users di Add User form extension
   */
  getUsersForMenuAccess = asyncHandler(async (req, res) => {
    const result = await simrsUsersService.getUsersForMenuAccess();

    // Return response dengan format yang benar
    const statusCode = result.success ? 200 : 500;
    return res.status(statusCode).json(result);
  });
}

module.exports = new SimrsUsersController();
