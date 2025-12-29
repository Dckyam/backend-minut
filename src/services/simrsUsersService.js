const SimrsUsersModel = require('../models/simrsUsersModel');
const AppError = require('../utils/AppError');

/**
 * Service untuk mengelola data users dari SIMRS
 * Hanya untuk mendapatkan list users untuk menu access
 */
class SimrsUsersService {
  /**
   * Get users list for menu access dropdown
   * Return only nama_asli
   * @returns {Promise<Object>} Response dengan array of nama_asli
   */
  async getUsersForMenuAccess() {
    try {
      const users = await SimrsUsersModel.getUsersForMenuAccess();

      if (!users || users.length === 0) {
        return {
          success: true,
          message: 'Tidak ada user aktif ditemukan',
          data: []
        };
      }

      return {
        success: true,
        message: 'Data users untuk menu access berhasil diambil',
        data: users,
        total: users.length
      };
    } catch (error) {
      console.error('Service error - getUsersForMenuAccess:', error);
      throw new AppError('Gagal mengambil data users untuk menu access: ' + error.message, 500);
    }
  }
}

module.exports = new SimrsUsersService();
