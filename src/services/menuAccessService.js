const menuAccessModel = require('../models/menuAccessModel');
const AppError = require('../utils/AppError');

class MenuAccessService {
  /**
   * Get menu access for specific user
   * @param {string} nama - Nama user
   * @returns {Promise<Object>} Menu access data
   */
  async getMenuAccessByNama(nama) {
    if (!nama) {
      throw new AppError('Nama user is required', 400);
    }

    const menuAccess = await menuAccessModel.getMenuAccessByNama(nama);

    if (!menuAccess) {
      // Return default response jika user tidak ditemukan
      return {
        nama: nama,
        is_active: 0,
        menu: [],
        submenu: [],
        message: 'User tidak terdaftar dalam sistem'
      };
    }

    // IMPORTANT: Jika user is_active = 0, return empty menu array
    if (menuAccess.is_active === 0) {
      return {
        nama: menuAccess.nama,
        is_active: 0,
        menu: [],
        submenu: [],
        message: 'User tidak aktif - akses menu dinonaktifkan'
      };
    }

    return {
      nama: menuAccess.nama,
      is_active: menuAccess.is_active,
      menu: menuAccess.menu || [],
      submenu: menuAccess.submenu || []
    };
  }

  /**
   * Get all menu access (admin only)
   * @returns {Promise<Array>} List of all menu access
   */
  async getAllMenuAccess() {
    return await menuAccessModel.getAllMenuAccess();
  }

  /**
   * Create new menu access
   * @param {Object} data - Menu access data
   * @returns {Promise<Object>} Created menu access
   */
  async createMenuAccess(data) {
    const { nama } = data;

    if (!nama) {
      throw new AppError('Nama user is required', 400);
    }

    // Check if user already exists
    const existing = await menuAccessModel.getMenuAccessByNama(nama);
    if (existing) {
      throw new AppError('User sudah terdaftar dalam sistem menu access', 400);
    }

    return await menuAccessModel.createMenuAccess(data);
  }

  /**
   * Update menu access
   * @param {number} id - Menu access ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated menu access
   */
  async updateMenuAccess(id, data) {
    if (!id) {
      throw new AppError('Menu access ID is required', 400);
    }

    return await menuAccessModel.updateMenuAccess(id, data);
  }

  /**
   * Delete menu access
   * @param {number} id - Menu access ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteMenuAccess(id) {
    if (!id) {
      throw new AppError('Menu access ID is required', 400);
    }

    const success = await menuAccessModel.deleteMenuAccess(id);
    if (!success) {
      throw new AppError('Menu access not found', 404);
    }

    return true;
  }

  /**
   * Check if user has access to specific menu
   * @param {string} nama - Nama user
   * @param {string} menuId - Menu ID
   * @returns {Promise<boolean>} Access status
   */
  async checkMenuAccess(nama, menuId) {
    if (!nama || !menuId) {
      throw new AppError('Nama user and menu ID are required', 400);
    }

    return await menuAccessModel.hasMenuAccess(nama, menuId);
  }
}

module.exports = new MenuAccessService();
