const db = require('../database/db');

class MenuAccessModel {
  /**
   * Get menu access by nama user
   * @param {string} nama - Nama user dari inspect website
   * @returns {Promise<Object>} Menu access data
   */
  async getMenuAccessByNama(nama) {
    const query = `
      SELECT
        id,
        nama,
        is_active,
        menu,
        submenu,
        created_by,
        created_date,
        updated_by,
        updated_date
      FROM menu_access
      WHERE nama = $1
    `;

    const result = await db.query(query, [nama]);
    return result.rows[0];
  }

  /**
   * Get all menu access (untuk admin)
   * @returns {Promise<Array>} List of all menu access
   */
  async getAllMenuAccess() {
    const query = `
      SELECT
        id,
        nama,
        is_active,
        menu,
        submenu,
        created_by,
        created_date,
        updated_by,
        updated_date
      FROM menu_access
      ORDER BY nama ASC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Create new menu access
   * @param {Object} data - Menu access data
   * @returns {Promise<Object>} Created menu access
   */
  async createMenuAccess(data) {
    const { nama, is_active = 1, menu = [], submenu = [], created_by } = data;

    const query = `
      INSERT INTO menu_access (nama, is_active, menu, submenu, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [nama, is_active, menu, submenu, created_by]);
    return result.rows[0];
  }

  /**
   * Update menu access
   * @param {number} id - Menu access ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated menu access
   */
  async updateMenuAccess(id, data) {
    const { nama, is_active, menu, submenu, updated_by } = data;

    const query = `
      UPDATE menu_access
      SET
        nama = COALESCE($2, nama),
        is_active = COALESCE($3, is_active),
        menu = COALESCE($4, menu),
        submenu = COALESCE($5, submenu),
        updated_by = $6,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [id, nama, is_active, menu, submenu, updated_by]);
    return result.rows[0];
  }

  /**
   * Delete menu access
   * @param {number} id - Menu access ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteMenuAccess(id) {
    const query = 'DELETE FROM menu_access WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Check if user has access to specific menu
   * @param {string} nama - Nama user
   * @param {string} menuId - Menu ID to check
   * @returns {Promise<boolean>} Access status
   */
  async hasMenuAccess(nama, menuId) {
    const query = `
      SELECT
        CASE
          WHEN $2 = ANY(menu) THEN true
          ELSE false
        END as has_access
      FROM menu_access
      WHERE nama = $1 AND is_active = 1
    `;

    const result = await db.query(query, [nama, menuId]);
    return result.rows[0]?.has_access || false;
  }
}

module.exports = new MenuAccessModel();
